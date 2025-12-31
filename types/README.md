# Types Organization

This directory contains all shared type definitions for the Pucked application. Types are organized by domain and purpose to make them easy to find and maintain.

## Structure

```
types/
├── index.ts           # Central export point - import from here!
├── database.ts        # Database & domain types
├── navigation.ts      # Navigation & routing types
├── components.ts      # React component prop types
├── puck.ts           # Puck page builder types
├── site-settings.ts  # Site settings configuration types
└── env.d.ts          # Environment variable types
```

## Usage

### Recommended: Import from Central Index

```typescript
// Import multiple types from one place
import type {
  SiteSettings,
  MenuItem,
  PageTreeNode,
  PuckData,
  ImageBlockProps
} from "@/types"
```

### Direct Imports (When Needed)

```typescript
// Import from specific module for better tree-shaking
import type { SiteSettings } from "@/types/site-settings"
import type { PageTreeNode } from "@/types/database"
```

## Type Categories

### Database Types (`database.ts`)

Types related to database entities and operations.

- **PageTranslationStatus**: Status of a page translation (published, has content)
- **PageTreeNode**: Hierarchical page structure with translations
- Re-exports Drizzle schema types: `User`, `Session`, `Invitation`, `Page`, etc.

**Used by**: Database operations, page management, admin features

### Navigation Types (`navigation.ts`)

Types for navigation menus and routing structures.

- **MenuItem**: Navigation menu item with children
- **TreeItem**: Generic tree structure for drag-and-drop
- **FlattenedItem**: Flattened tree for list rendering

**Used by**: Navigation components, page tree, menu builders

### Component Types (`components.ts`)

Shared React component prop types.

- **AdminSidebarRightProps**: Admin right sidebar panel
- **ImageBlockProps**: Image block component
- **TreeItemProps**: Tree item component props
- **SortableTreeProps**: Sortable tree component

**Used by**: React components across the application

### Puck Types (`puck.ts`)

Types for the Puck page builder system.

- **ComponentProps**: Props for each Puck component type
- **RootProps**: Root page configuration
- **PuckData**: Complete Puck page data structure
- **TypedComponentData**: Helper for component-specific data

**Used by**: Page builder, content management, Puck config

### Site Settings Types (`site-settings.ts`)

Types for site-wide configuration settings.

- **SiteSettingValue**: Union type of all possible setting values
- **SiteSettings**: Complete settings object structure
- **SiteSettingKey**: Known setting keys

**Used by**: Settings management, admin UI, guest templates

### Environment Types (`env.d.ts`)

Type definitions for environment variables.

- **ProcessEnv**: Node.js environment variables

**Used by**: Configuration, database connections, OAuth

## Migration Guide

### Before (Scattered Types)

```typescript
// Types were scattered across different files
import type { SiteSettings } from "@/lib/site-settings"
import type { MenuItem } from "@/lib/page-tree"
import type { PageTreeNode } from "@/lib/page"
import type { ImageBlockProps } from "@/components/blocks/image-block"
```

### After (Centralized Types)

```typescript
// Import everything from one place
import type {
  SiteSettings,
  MenuItem,
  PageTreeNode,
  ImageBlockProps
} from "@/types"
```

## Adding New Types

### 1. Choose the Right File

- **Database-related** → `database.ts`
- **Navigation/routing** → `navigation.ts`
- **Component props** → `components.ts`
- **Puck builder** → `puck.ts`
- **Settings/config** → `site-settings.ts`
- **Don't know?** → Create a new file or add to `index.ts`

### 2. Export from Index

Add your type to `types/index.ts`:

```typescript
// types/index.ts
export * from "./your-new-file"
```

### 3. Update Documentation

Add a comment explaining what the type is for and where it's used.

## Best Practices

### ✅ Do

- Keep types close to where they're used (in the `types/` folder)
- Export types from the central index
- Use JSDoc comments to explain complex types
. Prefer `interface` for objects with properties
- Use `type` for unions, intersections, and utility types
- Import types with `import type { }` for better tree-shaking

### ❌ Don't

- Define types in component files (move to `types/components.ts`)
- Define types in lib files (move to appropriate `types/*.ts`)
- Create circular dependencies (lib → types ✅, types → lib ❌)
- Use `any` without a good reason
- Duplicate type definitions across files

## Type Safety Goals

1. **No Circular Dependencies**: Types folder should never import from `lib/` or `components/`
2. **Single Source of Truth**: Each type should be defined in only one place
3. **Easy to Find**: Types should be organized by domain/purpose
4. **Well Documented**: Complex types should have JSDoc comments
5. **Import Friendly**: Common types available from central index

## Dependencies

```
types/
  ├─ Can import from: db/schema.ts (for Drizzle types)
  ├─ Can import from: External packages (react, drizzle-orm, etc.)
  └─ Should NOT import from: lib/, components/, app/
```

This ensures types remain stable and don't create circular dependencies.
