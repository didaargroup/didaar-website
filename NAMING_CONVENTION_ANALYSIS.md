# Naming Convention Analysis: PascalCase vs kebab-case

## Overview

This document compares **PascalCase** (e.g., `PagesTree`) vs **kebab-case** (e.g., `pages-tree`) for React component file names in the Pucked codebase.

**Current State**: Mixed usage
- PascalCase: `PagePropertiesForm`, `AdminHeader`, `DashboardContent`, `PagesTree`
- kebab-case: `page-properties-form`, `admin-header`, `dashboard-content`, `pages-tree`

**Shadcn UI Standard**: Uses **kebab-case** for file names

---

## Comparison Table

| Aspect | PascalCase (`PagesTree.tsx`) | kebab-case (`pages-tree.tsx`) |
|--------|------------------------------|-------------------------------|
| **Shadcn Compatibility** | ❌ Inconsistent | ✅ Consistent |
| **File System Case Sensitivity** | ⚠️ Issues on Linux | ✅ No issues |
| **Import Clarity** | ✅ Matches component name | ⚠️ Different from component name |
| **VS Code Navigation** | ✅ Cmd+Click works well | ✅ Cmd+Click works well |
| **Type Safety** | ✅ Same name as type | ⚠️ Different from type |
| **Web URL Compatibility** | ❌ Not URL-friendly | ✅ URL-friendly |
| **Convention in React** | ✅ Traditional standard | ⚠️ Less traditional |
| **Convention in Next.js** | ✅ Common | ⚠️ Less common |
| **Searchability** | ✅ Easy to find component | ⚠️ May find other files |
| **Rename Refactoring** | ✅ IDE-friendly | ⚠️ May require manual updates |
| **Differentiation from Utilities** | ✅ Clear distinction | ⚠️ May look like utilities |

---

## Detailed Analysis

### 1. Shadcn UI Compatibility

**kebab-case** ✅
```bash
# Shadcn uses kebab-case
components/ui/button.tsx
components/ui/input.tsx
components/ui/label.tsx
components/ui/dialog.tsx
```

**PascalCase** ❌
```bash
# Would be inconsistent with Shadcn
components/ui/Button.tsx
components/ui/Input.tsx
components/ui/Label.tsx
```

**Impact**: 
- Using kebab-case for custom components maintains consistency with Shadcn
- Mixed conventions (PascalCase for custom, kebab-case for Shadcn) creates inconsistency

**Recommendation**: **kebab-case** for consistency with Shadcn UI

---

### 2. File System Case Sensitivity

**Linux (Case-Sensitive)** ⚠️
```bash
# These are DIFFERENT files on Linux
PagesTree.tsx  !=  pagestree.tsx  !=  pages-tree.tsx
```

**macOS/Windows (Case-Insensitive)** ⚠️
```bash
# These are the SAME file on macOS/Windows
PagesTree.tsx  ==  pagestree.tsx
```

**Real-World Problem**:
```bash
# Developer on macOS creates:
PagesTree.tsx

# Developer on Linux creates:
pages-tree.tsx

# Git gets confused, both exist on Linux
# macOS developers can't see the issue
```

**Impact**:
- kebab-case eliminates case-sensitivity issues
- No risk of `PagesTree.tsx` vs `pagestree.tsx` confusion

**Recommendation**: **kebab-case** for cross-platform safety

---

### 3. Import Clarity

**PascalCase** ✅
```typescript
// File: PagesTree.tsx
export function PagesTree() { }

// Import: Clear connection
import { PagesTree } from "./PagesTree";
//                    ^^^^^^^^^^ Matches file name
```

**kebab-case** ⚠️
```typescript
// File: pages-tree.tsx
export function PagesTree() { }

// Import: Different names
import { PagesTree } from "./pages-tree";
//                    ^^^^^^^^^^^^ Doesn't match file name
```

**Impact**:
- PascalCase: File name matches component name exactly
- kebab-case: File name differs from component name

**Mitigation**:
```typescript
// Use path aliases for clarity
import { PagesTree } from "@/components/admin/pages-tree";
//                                               ^^^^^^^^^^^^ Still clear
```

**Recommendation**: **PascalCase** for clarity, but kebab-case is acceptable with path aliases

---

### 4. Web URL Compatibility

**kebab-case** ✅
```bash
# URL-friendly
https://example.com/docs/pages-tree
https://example.com/docs/admin-header
```

**PascalCase** ❌
```bash
# Not URL-friendly (servers may normalize)
https://example.com/docs/PagesTree  →  pages-tree
https://example.com/docs/AdminHeader  →  adminheader
```

**Impact**:
- If you ever serve documentation or file listings, kebab-case works better
- Some web servers normalize URLs to lowercase

**Recommendation**: **kebab-case** for URL compatibility

---

### 5. Convention in React Ecosystem

**PascalCase** ✅ (Traditional)
```bash
# Most React tutorials use PascalCase
components/Button.tsx
components/Header.tsx
components/Layout.tsx
```

**kebab-case** ⚠️ (Less Traditional)
```bash
# Less common in traditional React
components/button.tsx
components/header.tsx
components/layout.tsx
```

**However**:
- Next.js App Router uses kebab-case for routes
- Modern React projects increasingly use kebab-case
- Shadcn UI uses kebab-case

**Impact**:
- PascalCase is more familiar to traditional React developers
- kebab-case is becoming more common

**Recommendation**: **Tie** - Both are acceptable in modern React

---

### 6. Differentiation from Utilities

**PascalCase** ✅
```bash
# Clear distinction
components/PagesTree.tsx       # Component
lib/page-tree.ts              # Utility
hooks/use-page-tree.ts        # Hook
```

**kebab-case** ⚠️
```bash
# Less clear distinction
components/pages-tree.tsx     # Component
lib/page-tree.ts              # Utility
hooks/use-page-tree.ts        # Hook
```

**Impact**:
- PascalCase makes it obvious which files are components
- kebab-case requires checking directory to know if it's a component

**Mitigation**:
```bash
# Directory structure makes it clear
components/admin/pages-tree.tsx  # Component (in components/)
lib/page-tree.ts                 # Utility (in lib/)
```

**Recommendation**: **PascalCase** for clarity, but directory structure mitigates this

---

### 7. Searchability in IDE

**PascalCase** ✅
```typescript
// Search for "PagesTree" finds:
// - PagesTree.tsx (file)
// - export function PagesTree() (definition)
// - import { PagesTree } (usage)
// - <PagesTree /> (JSX)
```

**kebab-case** ⚠️
```typescript
// Search for "pages-tree" finds:
// - pages-tree.tsx (file)
// - But NOT the component (which is PagesTree)
```

**Impact**:
- PascalCase: One search term finds everything
- kebab-case: Need to search for both file name and component name

**Mitigation**:
- Modern IDEs (VS Code) handle this well with symbol search
- Cmd+T (Quick Open) works well for both

**Recommendation**: **PascalCase** for searchability, but IDE tools mitigate this

---

### 8. Rename Refactoring

**PascalCase** ✅
```typescript
// IDE can easily rename both file and component
PagesTree.tsx  →  PageTree.tsx
export function PagesTree()  →  export function PageTree()
```

**kebab-case** ⚠️
```typescript
// IDE may not rename both consistently
pages-tree.tsx  →  page-tree.tsx
export function PagesTree()  →  export function PageTree()
# File name and component name are different
```

**Impact**:
- PascalCase: Rename refactoring works seamlessly
- kebab-case: May require manual updates

**Mitigation**:
- Modern IDEs (VS Code with TypeScript) handle this well
- Use "Find All References" before renaming

**Recommendation**: **PascalCase** for refactoring, but tools mitigate this

---

## Real-World Examples

### Shadcn UI (kebab-case)

```bash
components/ui/
├── accordion.tsx
├── alert-dialog.tsx
├── button.tsx
├── card.tsx
├── checkbox.tsx
├── dialog.tsx
├── dropdown-menu.tsx
├── input.tsx
├── label.tsx
└── ...
```

**Why**: Consistency, URL-friendly, cross-platform safety

### Next.js Examples (Mixed)

**App Router (kebab-case for routes)**:
```bash
app/
├── (dashboard)/
│   ├── layout.tsx
│   └── page.tsx
├── admin/
│   └── pages/
│       └── create/
│           ├── page.tsx
│           └── form.tsx
```

**Components (often PascalCase)**:
```bash
components/
├── Header.tsx
├── Footer.tsx
├── Sidebar.tsx
└── ...
```

### Vercel (kebab-case)

```bash
components/
├── banner.tsx
├── card.tsx
├── command-menu.tsx
├── dialog.tsx
└── ...
```

**Why**: Consistency with Shadcn, URL-friendly

---

## Current Pucked Codebase Analysis

### PascalCase Usage

```bash
# Components
PagePropertiesForm.tsx
AdminHeader.tsx
AdminSidebar.tsx
DashboardContent.tsx
PagesTree.tsx
SortableTree.tsx
TranslationManager.tsx
TipTapEditor.tsx

# Contexts
NotificationProvider.tsx
PageTreeProvider.tsx
PageSelectionProvider.tsx
```

### kebab-case Usage

```bash
# Components (Shadcn)
button.tsx
input.tsx
label.tsx
card.tsx
dialog.tsx

# Some custom components
admin-header.tsx
admin-sidebar-left.tsx
admin-sidebar-right.tsx
sidebar-translations.tsx
sortable-tree.tsx
page-properties-form.tsx
```

### Inconsistencies

```bash
# Mixed in same directory
components/admin/
├── AdminHeader.tsx              # PascalCase
├── admin-header.tsx             # kebab-case (hypothetical)
├── PagePropertiesForm.tsx       # PascalCase
├── page-properties-form.tsx     # kebab-case
└── ...
```

---

## Recommendation

### Primary Recommendation: **kebab-case**

**Rationale**:

1. ✅ **Consistency with Shadcn UI** - Most important factor
2. ✅ **Cross-platform safety** - No case-sensitivity issues
3. ✅ **URL-friendly** - Better for web
4. ✅ **Modern trend** - Increasingly common in React/Next.js

**Trade-offs**:
- ⚠️ File name differs from component name (acceptable with path aliases)
- ⚠️ Less traditional (but becoming more common)

### Implementation Strategy

#### Option 1: Full kebab-case (Recommended)

```bash
components/
├── admin/
│   ├── admin-header.tsx          # export function AdminHeader()
│   ├── admin-sidebar-left.tsx    # export function AdminSidebarLeft()
│   ├── admin-sidebar-right.tsx   # export function AdminSidebarRight()
│   ├── page-properties-form.tsx  # export function PagePropertiesForm()
│   ├── pages-tree.tsx            # export function PagesTree()
│   ├── sortable-tree.tsx         # export function SortableTree()
│   └── translation-manager.tsx   # export function TranslationManager()
├── ui/
│   ├── button.tsx                # Shadcn (already kebab-case)
│   ├── input.tsx                 # Shadcn (already kebab-case)
│   └── ...
└── guest-navbar.tsx              # export function GuestNavbar()
```

**Pros**:
- ✅ Consistent with Shadcn
- ✅ All files use same convention
- ✅ Cross-platform safe

**Cons**:
- ❌ Requires renaming many files
- ❌ File name differs from component name

#### Option 2: Hybrid (Compromise)

```bash
components/
├── admin/
│   ├── admin-header.tsx          # Shadcn-style (kebab-case)
│   ├── page-properties-form.tsx  # Shadcn-style (kebab-case)
│   └── ...
├── ui/
│   ├── button.tsx                # Shadcn (kebab-case)
│   └── ...
└── shared/
    ├── Header.tsx                # Reusable shared (PascalCase)
    └── Footer.tsx                # Reusable shared (PascalCase)
```

**Pros**:
- ✅ Consistent with Shadcn for admin/UI components
- ✅ PascalCase for truly shared components
- ✅ Less renaming

**Cons**:
- ❌ Still mixed conventions
- ❌ Confusing boundary between admin and shared

#### Option 3: Keep PascalCase (Status Quo)

```bash
components/
├── admin/
│   ├── AdminHeader.tsx           # PascalCase
│   ├── PagePropertiesForm.tsx    # PascalCase
│   └── ...
├── ui/
│   ├── button.tsx                # Shadcn (kebab-case)
│   └── ...
```

**Pros**:
- ✅ No renaming
- ✅ File name matches component name

**Cons**:
- ❌ Inconsistent with Shadcn
- ❌ Mixed conventions
- ❌ Case-sensitivity issues on Linux

---

## Migration Plan (Option 1: Full kebab-case)

### Phase 1: New Components (Immediate)

**Rule**: All new components use kebab-case

```bash
# New component
components/admin/new-feature.tsx  # export function NewFeature()
```

### Phase 2: Shadcn-Adjacent Components (Week 1)

**Priority**: High (consistency with Shadcn)

```bash
# Rename
components/admin/AdminHeader.tsx  →  components/admin/admin-header.tsx
components/admin/AdminSidebar.tsx →  components/admin/admin-sidebar.tsx
```

### Phase 3: Form Components (Week 2)

**Priority**: Medium

```bash
# Rename
components/admin/PagePropertiesForm.tsx  
  →  components/admin/page-properties-form.tsx

components/admin/TranslationManager.tsx  
  →  components/admin/translation-manager.tsx
```

### Phase 4: Other Components (Week 3-4)

**Priority**: Low

```bash
# Rename
components/admin/SortableTree.tsx  
  →  components/admin/sortable-tree.tsx

components/admin/TipTapEditor.tsx  
  →  components/admin/tiptap-editor.tsx
```

### Phase 5: Context Providers (Week 4)

**Priority**: Low

```bash
# Rename
contexts/PageSelectionProvider.tsx  
  →  contexts/page-selection-provider.tsx

contexts/NotificationProvider.tsx  
  →  contexts/notification-provider.tsx
```

---

## Best Practices (Regardless of Convention)

### 1. Be Consistent

```bash
# ❌ BAD: Mixed conventions
components/
├── AdminHeader.tsx
├── admin-sidebar.tsx
└── PagePropertiesForm.tsx

# ✅ GOOD: Consistent convention
components/
├── admin-header.tsx
├── admin-sidebar.tsx
└── page-properties-form.tsx
```

### 2. Use Path Aliases

```typescript
// ✅ GOOD: Clear imports
import { AdminHeader } from "@/components/admin/admin-header";
import { PagePropertiesForm } from "@/components/admin/page-properties-form";

// ❌ BAD: Relative paths
import { AdminHeader } from "../../../components/admin/admin-header";
```

### 3. Match Directory Structure to Purpose

```bash
# Clear separation
components/admin/     # Admin-specific components
components/ui/        # Shadcn UI components
components/guest-*.tsx # Guest/public components
contexts/             # Context providers
```

### 4. Document Your Convention

```markdown
# Naming Convention

We use **kebab-case** for all component file names:
- File: `admin-header.tsx`
- Component: `AdminHeader`

This maintains consistency with Shadcn UI and ensures cross-platform compatibility.
```

---

## Conclusion

### Summary

| Aspect | PascalCase | kebab-case | Winner |
|--------|-----------|------------|--------|
| Shadcn Compatibility | ❌ | ✅ | **kebab-case** |
| Cross-Platform Safety | ⚠️ | ✅ | **kebab-case** |
| Import Clarity | ✅ | ⚠️ | **PascalCase** |
| URL Compatibility | ❌ | ✅ | **kebab-case** |
| React Tradition | ✅ | ⚠️ | **PascalCase** |
| Searchability | ✅ | ⚠️ | **PascalCase** |
| Refactoring | ✅ | ⚠️ | **PascalCase** |

**Overall Winner**: **kebab-case** ✅

### Final Recommendation

**Adopt kebab-case for all component file names** to maintain consistency with Shadcn UI and ensure cross-platform safety.

**Rationale**:
1. Shadn UI compatibility is most important (you're already using it)
2. Cross-platform safety prevents hard-to-debug issues
3. URL-friendly for future documentation
4. Modern trend in React/Next.js

**Trade-offs Accepted**:
- File name differs from component name (acceptable with path aliases)
- Less traditional (but becoming more common)

---

*Last Updated: 2025-12-30*
*Status: Proposed - Awaiting Team Review*
