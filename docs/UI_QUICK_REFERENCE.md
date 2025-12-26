# UI Quick Reference

## Common Patterns (Copy & Paste)

### Card Container
```tsx
<div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
  {/* Content */}
</div>
```

### Elevated Card
```tsx
<div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-800">
  {/* Content */}
</div>
```

### Button
```tsx
import { Button } from "@/components/ui/button";

<Button variant="default">Submit</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="destructive">Delete</Button>
<Button variant="ghost">Close</Button>
<Button variant="outline">Border</Button>
```

### Input Field
```tsx
<div className="space-y-2">
  <label htmlFor="email" className="text-sm font-medium">
    Email
  </label>
  <input
    type="email"
    id="email"
    className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50"
  />
</div>
```

### Error Message
```tsx
<div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
  {error}
</div>
```

### Success Message
```tsx
<div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 text-sm">
  {success}
</div>
```

### Page Header
```tsx
<header className="flex items-center justify-between mb-6">
  <div>
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
      Page Title
    </h1>
    <p className="text-gray-600 dark:text-gray-400 mt-1">
      Subtitle or description
    </p>
  </div>
  <Button>Action</Button>
</header>
```

### Centered Layout (Auth Pages)
```tsx
<div className="min-h-screen flex items-center justify-center p-4">
  <div className="w-full max-w-md">
    {/* Card */}
  </div>
</div>
```

### Grid Layout
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Cards */}
</div>
```

### Flex Row (Items Side by Side)
```tsx
<div className="flex items-center gap-4">
  {/* Items */}
</div>
```

### Flex Column (Items Stacked)
```tsx
<div className="flex flex-col gap-4">
  {/* Items */}
</div>
```

### Icon with Text
```tsx
<div className="flex items-center gap-2">
  <svg className="w-5 h-5" />
  <span>Label</span>
</div>
```

### Loading Spinner
```tsx
<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
```

### Section Container
```tsx
<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
  {/* Content */}
</section>
```

## Color Tokens

### Backgrounds
- `bg-white dark:bg-gray-900` - Primary background
- `bg-gray-50 dark:bg-gray-800` - Secondary background
- `bg-card` - Card background

### Text
- `text-gray-900 dark:text-white` - Primary text
- `text-gray-600 dark:text-gray-400` - Secondary text
- `text-muted-foreground` - Muted text

### Borders
- `border-gray-200 dark:border-gray-800` - Standard border
- `border-gray-300 dark:border-gray-700` - Input border

### Semantic Colors
- `bg-primary` / `text-primary` - Primary actions
- `bg-destructive` / `text-destructive` - Destructive actions
- `bg-accent` / `text-accent-foreground` - Hover states

## Typography

### Headings
```tsx
<h1 className="text-3xl font-bold">Page Title</h1>
<h2 className="text-2xl font-semibold">Section</h2>
<h3 className="text-xl font-medium">Subsection</h3>
```

### Body Text
```tsx
<p className="text-base">Regular text</p>
<p className="text-sm text-muted-foreground">Secondary</p>
<p className="text-xs text-muted-foreground">Caption</p>
```

## Spacing

### Gaps
- `gap-2` - 8px (small)
- `gap-4` - 16px (standard)
- `gap-6` - 24px (large)
- `gap-8` - 32px (extra large)

### Padding
- `p-4` - 16px (small card)
- `p-6` - 24px (standard card)
- `p-8` - 32px (large card)

### Vertical Spacing
- `space-y-2` - 8px between items
- `space-y-4` - 16px between items
- `space-y-6` - 24px between items

## Border Radius

- `rounded` - 4px (small)
- `rounded-md` - 6px (medium)
- `rounded-lg` - 8px (large)
- `rounded-xl` - 12px (extra large)
- `rounded-2xl` - 16px (cards)

## Responsive Modifiers

```tsx
// Hide/show
<div className="hidden md:block">Desktop only</div>
<div className="block md:hidden">Mobile only</div>

// Responsive grid
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">

// Responsive spacing
<div className="px-4 sm:px-6 lg:px-8">

// Responsive text
<h1 className="text-2xl sm:text-3xl lg:text-4xl">
```

## Dark Mode

Always add dark mode variants:
```tsx
className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
```

## Utility Functions

### cn() Helper
```tsx
import { cn } from "@/lib/utils";

const className = cn(
  "base classes",
  condition && "conditional classes",
  "more classes"
);
```

## Common Anti-Patterns

❌ **DON'T** use inline styles:
```tsx
<div style={{ padding: "2rem", backgroundColor: "#fff" }} />
```

✅ **DO** use Tailwind classes:
```tsx
<div className="p-8 bg-white" />
```

❌ **DON'T** use hardcoded colors:
```tsx
className="bg-[#FF0000]"
```

✅ **DO** use semantic tokens:
```tsx
className="bg-destructive"
```

## Checklist for New Components

- [ ] Use Tailwind utility classes (no inline styles)
- [ ] Add dark mode support (`dark:` variants)
- [ ] Use semantic color tokens
- [ ] Include proper focus states
- [ ] Test responsive behavior
- [ ] Use semantic HTML
- [ ] Add ARIA labels if needed
- [ ] Test with keyboard navigation
- [ ] Check color contrast
- [ ] Use `cn()` helper for conditional classes

## Shadcn UI Components

Available in `components/ui/`:
- `button` - Button with variants
- Add more: `npx shadcn@latest add [component]`

## Need More?

See `docs/UI_GUIDELINES.md` for comprehensive patterns and examples.
