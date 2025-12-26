# Server Actions

This folder contains documentation for Next.js Server Actions patterns and best practices used in the Pucked project.

## Overview

Pucked uses **React 19's Server Actions** with the `useActionState` hook for form handling, data mutations, and server-side logic.

## Documentation

### [nextjs-server-actions.md](./nextjs-server-actions.md)
Comprehensive guide covering:

- Type definitions for form state and action results
- Standard action patterns
- Error handling and validation
- Form validation with error display
- Redirects and navigation
- Complete examples for common scenarios

**Read this when:**
- Creating a new form
- Implementing server-side logic
- Handling form validation
- Working with file uploads
- Understanding error handling patterns

## Key Concepts

### Always Use `useActionState` (NOT `useFormState`)

```tsx
"use client"

import { useActionState } from "react"  // ✅ Correct
// import { useFormState } from "react-dom"  // ❌ Wrong

const [state, formAction] = useActionState(myAction, initialState)
```

### Standard Form State Type

```tsx
type FormState = {
  errors?: {
    fieldName?: string[]
    _form?: string[]
  }
  success?: boolean
}
```

### Server Action Pattern

```tsx
"use server";

import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/route-guard";

export async function myAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const { user } = await requireAuth();
  
  // Validate input
  const title = formData.get("title");
  if (!title || typeof title !== "string") {
    return {
      errors: { title: ["Title is required"] }
    };
  }
  
  // Process data
  try {
    // Database operations
    return { success: true };
  } catch (error) {
    return {
      errors: {
        _form: ["Something went wrong. Please try again."]
      }
    };
  }
}
```

## Quick Examples

### Simple Form

```tsx
"use client"

import { useActionState } from "react"
import { myAction } from "@/app/actions"
import { Button } from "@measured/puck"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function MyForm() {
  const [state, formAction] = useActionState(myAction, {})

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          className={state.errors?.title ? "border-destructive" : ""}
        />
        {state.errors?.title && (
          <p className="text-xs text-destructive">{state.errors.title[0]}</p>
        )}
      </div>

      {state.errors?._form && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive">{state.errors._form[0]}</p>
        </div>
      )}

      <Button type="submit">Submit</Button>
    </form>
  )
}
```

### Protected Action

```tsx
"use server";

import { requireAuth } from "@/lib/route-guard";

export async function protectedAction() {
  const { user } = await requireAuth();
  // User is authenticated
  // Perform action
}
```

### Action with Redirect

```tsx
"use server";

import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/route-guard";

export async function createAction(formData: FormData) {
  const { user } = await requireAuth();
  
  // Create resource
  const id = await createResource(formData);
  
  // Redirect to new resource
  redirect(`/admin/resources/${id}`);
}
```

## Common Patterns

### Field Validation

```tsx
// Validate required field
const title = formData.get("title");
if (!title || typeof title !== "string") {
  return {
    errors: { title: ["Title is required"] }
  };
}

// Validate length
if (title.length < 3) {
  return {
    errors: { title: ["Title must be at least 3 characters"] }
  };
}

// Validate format
const email = formData.get("email");
if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  return {
    errors: { email: ["Invalid email format"] }
  };
}
```

### Database Operations

```tsx
"use server";

import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { requireAuth } from "@/lib/route-guard";

export async function updateUser(formData: FormData) {
  const { user } = await requireAuth();
  
  const email = formData.get("email") as string;
  
  try {
    await db.update(users)
      .set({ email })
      .where(eq(users.id, user.id));
    
    return { success: true };
  } catch (error) {
    return {
      errors: {
        _form: ["Failed to update user. Please try again."]
      }
    };
  }
}
```

### File Uploads

```tsx
"use server";

import { requireAuth } from "@/lib/route-guard";
import { writeFile } from "fs/promises";

export async function uploadFile(formData: FormData) {
  const { user } = await requireAuth();
  
  const file = formData.get("file") as File;
  
  if (!file) {
    return {
      errors: { file: ["File is required"] }
    };
  }
  
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  const path = `/uploads/${file.name}`;
  await writeFile(path, buffer);
  
  return { success: true, data: { path } };
}
```

## Error Handling

### Field-Level Errors

```tsx
return {
  errors: {
    fieldName: ["Error message 1", "Error message 2"]
  }
};
```

Display:
```tsx
{state.errors?.fieldName && (
  <p className="text-xs text-destructive">
    {state.errors.fieldName[0]}
  </p>
)}
```

### Form-Level Errors

```tsx
return {
  errors: {
    _form: ["Something went wrong. Please try again."]
  }
};
```

Display:
```tsx
{state.errors?._form && (
  <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
    <p className="text-sm text-destructive">{state.errors._form[0]}</p>
  </div>
)}
```

## Best Practices

### ✅ Do

- Always type the `FormState` interface
- Use `requireAuth()` for protected actions
- Validate all input before processing
- Return specific error messages
- Use try-catch for database operations
- Redirect after successful mutations
- Use type-safe error checking

### ❌ Don't

- Call `formAction()` directly in onClick
- Use `useFormState` from `react-dom`
- Forget to validate input types
- Return generic error messages
- Mix client and server logic
- Use inline styles (except with Puck)

## Related Documentation

- **[UI Guidelines](../UI_GUIDELINES.md)** - Form UI patterns and styling
- **[Authentication Guide](../authentication/invitation-system.md)** - Protecting actions with auth
- **[Puck Components Guide](../puck-compatible-ui/components-guide.md)** - Using Puck components in forms

## Troubleshooting

### "useFormState is not a function"

**Cause:** Importing from wrong package

**Solution:** Use `useActionState` from `"react"`:
```tsx
import { useActionState } from "react"
```

### Form submits but nothing happens

**Cause:** Not passing `formAction` to form's `action` prop

**Solution:**
```tsx
<form action={formAction}>  {/* ✅ Correct */}
  <Button type="submit">Submit</Button>
</form>

// ❌ Wrong - calling directly
<Button onClick={() => formAction()}>Submit</Button>
```

### Errors not displaying

**Cause:** Not checking array length before accessing

**Solution:**
```tsx
{state.errors?.field && Array.isArray(state.errors.field) && state.errors.field.length > 0 && (
  <p>{state.errors.field[0]}</p>
)}
```

---

**Need more details?** See [nextjs-server-actions.md](./nextjs-server-actions.md) for complete documentation.
