# Next.js Server Actions - Best Practices Guide

This guide explains the standardized patterns used in the Pucked project for Server Actions.

## Table of Contents
1. [Type Definitions](#type-definitions)
2. [Action Patterns](#action-patterns)
3. [Error Handling](#error-handling)
4. [Form Validation](#form-validation)
5. [Redirects](#redirects)
6. [Examples](#examples)

---

## Type Definitions

### Standard ActionResult

Use this when you need to return success/error state to the client:

```typescript
type ActionResult = {
	success: boolean;
	error?: string;
	data?: unknown;
};
```

**Usage:**
```typescript
async function myAction(): Promise<ActionResult> {
  try {
    const result = await doSomething();
    return { success: true, data: result };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}
```

### FormActionResult

Use this for form submissions that need to display errors:

```typescript
type FormActionResult = {
	error?: string;
	success?: boolean;
};
```

**Usage:**
```typescript
async function submitForm(formData: FormData): Promise<FormActionResult> {
  const data = validateFormData(formData);
  if (!data.valid) {
    return { error: "Invalid input" };
  }
  return { success: true };
}
```

### Void Actions

Use this when the action always redirects:

```typescript
async function myAction(): Promise<void> {
  // Do work
  redirect("/somewhere"); // Never returns
}
```

---

## Action Patterns

### Pattern 1: Action with Data Return

**When to use:** API-like actions that return data to the client

```typescript
type ActionResult = {
  success: boolean;
  error?: string;
  data?: { id: number; name: string };
};

export async function createUser(data: UserData): Promise<ActionResult> {
  try {
    const user = await db.insert(users).values(data).returning();
    return { success: true, data: user[0] };
  } catch (error) {
    return { 
      success: false, 
      error: "Failed to create user" 
    };
  }
}
```

**Client-side usage:**
```tsx
<form action={createUser}>
  {/* Form fields */}
</form>

// Or with useActionState
const [state, formAction] = useActionState(createUser, null);
```

### Pattern 2: Action with Redirect

**When to use:** Actions that should redirect after completion

```typescript
export async function updateProfile(formData: FormData): Promise<void> {
  const data = validateFormData(formData);
  
  await db.update(users).set(data);
  
  // Always redirect, never returns
  redirect("/profile");
}
```

**Client-side usage:**
```tsx
<form action={updateProfile}>
  {/* Form fields */}
</form>
```

### Pattern 3: Action with Error Display

**When to use:** Form submissions that need to show errors

```typescript
export async function submitForm(formData: FormData): Promise<FormActionResult> {
  const name = formData.get("name") as string;
  
  if (!name || name.length < 2) {
    return { error: "Name must be at least 2 characters" };
  }
  
  await db.create({ name });
  return { success: true };
}
```

**Client-side usage:**
```tsx
export default function Form() {
  const [state, formAction] = useActionState(submitForm, null);
  
  return (
    <form action={formAction}>
      {state?.error && <p className="error">{state.error}</p>}
      <input name="name" />
      <button type="submit">Submit</button>
    </form>
  );
}
```

---

## Error Handling

### Try-Catch Pattern

```typescript
export async function myAction(): Promise<ActionResult> {
  try {
    // Do work
    const result = await someOperation();
    return { success: true, data: result };
  } catch (error) {
    console.error("Action failed:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}
```

### Early Return Pattern

```typescript
export async function myAction(): Promise<ActionResult> {
  const { user } = await getCurrentSession();
  
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }
  
  // Continue with authenticated user
  const result = await doSomething(user.id);
  return { success: true, data: result };
}
```

### Redirect on Error Pattern

```typescript
export async function myAction(): Promise<void> {
  try {
    const result = await doSomething();
    redirect("/success");
  } catch (error) {
    console.error("Action failed:", error);
    redirect("/error?message=failed");
  }
}
```

---

## Form Validation

### Basic Validation

```typescript
export async function submitForm(formData: FormData): Promise<FormActionResult> {
  // Extract and validate
  const rawEmail = formData.get("email");
  const email = typeof rawEmail === "string" ? rawEmail.trim() : "";
  
  if (!email) {
    return { error: "Email is required" };
  }
  
  if (!email.includes("@")) {
    return { error: "Invalid email format" };
  }
  
  // Process valid data
  await db.create({ email });
  return { success: true };
}
```

### Zod Schema Validation

```typescript
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Invalid email format"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  age: z.number().min(18, "Must be 18 or older"),
});

export async function submitForm(formData: FormData): Promise<FormActionResult> {
  // Convert FormData to object
  const data = Object.fromEntries(formData);
  
  // Validate with Zod
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const firstError = result.error.errors[0];
    return { error: firstError.message };
  }
  
  // Process valid data
  await db.create(result.data);
  return { success: true };
}
```

### Custom Validation Hook

```typescript
function validateInvitationCode(code: string): { valid: boolean; error?: string } {
  if (!code) {
    return { valid: false, error: "Code is required" };
  }
  
  if (code.length !== 14) {
    return { valid: false, error: "Code must be 14 characters" };
  }
  
  if (!code.match(/^[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/i)) {
    return { valid: false, error: "Invalid format (expected XXXX-XXXX-XXXX)" };
  }
  
  return { valid: true };
}

export async function submitInvitation(formData: FormData): Promise<void> {
  const code = formData.get("code") as string;
  
  const validation = validateInvitationCode(code);
  if (!validation.valid) {
    redirect(`/signup?error=${validation.error}`);
  }
  
  // Process valid code
  await acceptInvitation(code);
  redirect("/admin");
}
```

---

## Redirects

### Always Redirect Pattern

```typescript
// ✅ GOOD: Always redirects, return type is void
export async function myAction(): Promise<void> {
  if (error) {
    redirect("/error"); // Never returns
  }
  
  await doWork();
  redirect("/success"); // Never returns
}
```

### Conditional Redirect Pattern

```typescript
// ✅ GOOD: Clear redirect logic
export async function myAction(): Promise<void> {
  const { user } = await getCurrentSession();
  
  if (!user) {
    redirect("/login");
  }
  
  if (!user.invitationAcceptedAt) {
    redirect("/signup");
  }
  
  // User is fully authenticated
  redirect("/dashboard");
}
```

### Redirect with Query Params

```typescript
export async function myAction(formData: FormData): Promise<void> {
  const code = formData.get("code") as string;
  
  if (!code) {
    redirect("/signup?error=code_required&field=code");
  }
  
  const invitation = await getInvitation(code);
  if (!invitation) {
    redirect("/signup?error=invalid_code");
  }
  
  redirect("/admin");
}
```

---

## Examples

### Example 1: Login Action

```typescript
export async function login(formData: FormData): Promise<void> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  
  const user = await authenticate(email, password);
  
  if (!user) {
    redirect("/login?error=invalid_credentials");
  }
  
  await createSession(user.id);
  redirect("/dashboard");
}
```

### Example 2: Create Resource

```typescript
type CreatePostResult = {
  success: boolean;
  error?: string;
  data?: { id: number; title: string };
};

export async function createPost(formData: FormData): Promise<CreatePostResult> {
  const { user } = await getCurrentSession();
  
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }
  
  const title = formData.get("title") as string;
  if (!title) {
    return { success: false, error: "Title is required" };
  }
  
  const post = await db.insert(posts).values({
    title,
    authorId: user.id,
  }).returning();
  
  revalidatePath("/posts");
  return { success: true, data: post[0] };
}
```

### Example 3: Delete with Confirmation

```typescript
export async function deleteAccount(formData: FormData): Promise<void> {
  const { user } = await getCurrentSession();
  
  if (!user) {
    redirect("/login");
  }
  
  const confirmation = formData.get("confirm") as string;
  
  if (confirmation !== "DELETE") {
    redirect("/settings?error=confirmation_mismatch");
  }
  
  await db.delete(users).where(eq(users.id, user.id));
  await invalidateSession(user.id);
  
  redirect("/goodbye");
}
```

### Example 4: Update with Revalidation

```typescript
export async function updateProfile(formData: FormData): Promise<void> {
  const { user } = await getCurrentSession();
  
  if (!user) {
    redirect("/login");
  }
  
  const name = formData.get("name") as string;
  const bio = formData.get("bio") as string;
  
  await db.update(users)
    .set({ name, bio })
    .where(eq(users.id, user.id));
  
  // Revalidate the profile page to show updated data
  revalidatePath("/profile");
  revalidatePath("/settings");
  
  redirect("/profile");
}
```

---

## Best Practices Summary

### ✅ DO:
- Use consistent return types (`ActionResult`, `FormActionResult`, `void`)
- Validate FormData before processing
- Use TypeScript for type safety
- Handle errors explicitly
- Use redirects for navigation (never return both data and redirect)
- Add JSDoc comments for complex actions
- Use `revalidatePath` after data mutations
- Log errors for debugging

### ❌ DON'T:
- Mix return types (e.g., `Promise<ActionResult | void>`)
- Return both data and redirect
- Forget to validate FormData
- Use `any` type for FormData values
- Silently swallow errors
- Use client-side redirects (`router.push`) in server actions
- Forget to handle null/undefined FormData values

---

## Testing Server Actions

### Unit Test Example

```typescript
import { submitInvitation } from "./actions";
import { getCurrentSession } from "@/lib/session";

vi.mock("@/lib/session");

test("submitInvitation redirects to login when not authenticated", async () => {
  vi.mocked(getCurrentSession).mockResolvedValue({ user: null, session: null });
  
  await expect(submitInvitation(new FormData())).rejects.toThrow();
});
```

---

## Additional Resources

- [Next.js Server Actions Documentation](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Next.js Form Validation Guide](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations#validation)
- [Zod Validation Library](https://zod.dev/)
