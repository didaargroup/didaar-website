# Puck CSS Variables Scope Issue

## Problem
Some Puck CSS variables like `var(--puck-space-px)` show as `undefined` when used in the admin area.

## Root Cause
Puck's CSS variables are defined in different scopes:

### 1. **Global Variables (Available Everywhere)**
These are defined in `:root` and available globally:
- ✅ All color variables: `--puck-color-*` (azure, grey, red, green, yellow, rose, white, black)
- ✅ All font size variables: `--puck-font-size-*` (xxxs through xxxxl)
- ✅ Font family: `--puck-font-family`
- ✅ Monospaced font: `--puck-font-family-monospaced`

### 2. **Scoped Variables (Only Available Within Puck Wrapper)**
These are defined inside the `._Puck_1yxlw_19` class and only available within Puck's editor wrapper:
- ❌ `--puck-space-px: 16px` - Puck's base spacing unit
- ❌ `--puck-frame-width` - Puck's frame width
- ❌ `--puck-side-bar-width` - Puck's sidebar width
- ❌ `--puck-left-side-bar-width` - Left sidebar width
- ❌ `--puck-right-side-bar-width` - Right sidebar width

## Why This Happens
Puck's CSS uses CSS Modules with scoped styles. The `--puck-space-px` variable is defined like this:

```css
/* In Puck's source */
._Puck_1yxlw_19 {
  --puck-space-px: 16px;
  font-family: var(--puck-font-family);
  overflow-x: hidden;
}
```

This means the variable is only accessible within elements that have the `._Puck_1yxlw_19` class (Puck's main wrapper component).

## Solution
We've added the scoped variables we need to our `admin-theme.css` `:root`:

```css
:root {
  /* ... other variables ... */

  /* Puck spacing variables - these are scoped to .puck class in source, defining here for admin use */
  --puck-space-px: 16px;
}
```

This makes `--puck-space-px` available globally in our admin area, matching Puck's value of `16px`.

## Variables Added to admin-theme.css
Currently, we've added:
- `--puck-space-px: 16px` - Puck's base spacing unit (used for padding, gaps, etc.)

## Other Scoped Variables (Not Added)
The following variables are also scoped but we haven't added them because they're not used in our admin area:
- `--puck-frame-width` - Only relevant for Puck's editor layout
- `--puck-side-bar-width` - Only relevant for Puck's editor layout
- `--puck-left-side-bar-width` - Only relevant for Puck's editor layout
- `--puck-right-side-bar-width` - Only relevant for Puck's editor layout

If you need these variables in the future, you can add them to `admin-theme.css` `:root` the same way.

## How to Check if a Variable is Available
1. Search for the variable in `node_modules/@measured/puck/dist/index.css`
2. Check if it's defined in `:root` (global) or inside a class (scoped)
3. If scoped and you need it, add it to `admin-theme.css` `:root` with the same value

## Example
```bash
# Search for a variable
grep "puck-space-px" node_modules/@measured/puck/dist/index.css

# Output shows:
# ._Puck_1yxlw_19 {
#   --puck-space-px: 16px;
# }

# This means it's scoped to ._Puck_1yxlw_19 class
# To use it globally, add to admin-theme.css:
:root {
  --puck-space-px: 16px;
}
```

## Impact
This fix ensures that all Puck variables used in our admin components are properly defined and won't show as `undefined` in browser dev tools or cause styling issues.
