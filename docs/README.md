# Pucked Documentation

Welcome to the Pucked project documentation. This folder contains comprehensive guides for understanding, developing, and maintaining the Pucked application.

## 📚 Documentation Structure

### [puck-compatible-ui/](./puck-compatible-ui/)
Guidelines for using `@measured/puck` components in the admin dashboard to maintain visual consistency with the page editor.

- **[components-guide.md](./puck-compatible-ui/components-guide.md)** - Complete API reference for all Puck components (Button, ActionBar, IconButton, Drawer, etc.)
- **[quick-reference.md](./puck-compatible-ui/quick-reference.md)** - Quick cheat sheet for common Puck component patterns
- **[implementation-guide.md](./puck-compatible-ui/implementation-guide.md)** - Step-by-step guide for integrating Puck components
- **[examples.md](./puck-compatible-ui/examples.md)** - Practical code examples for real-world scenarios

### [authentication/](./authentication/)
Authentication and authorization system documentation.

- **[invitation-system.md](./authentication/invitation-system.md)** - Complete guide to the invitation-based GitHub OAuth authentication flow

### [server-actions/](./server-actions/)
Next.js Server Actions patterns and best practices.

- **[nextjs-server-actions.md](./server-actions/nextjs-server-actions.md)** - Standard patterns for form handling, validation, and error handling with React 19's `useActionState`

### [ui-guidelines.md](./ui-guidelines.md)
Design system standards, styling conventions, and UI patterns for the entire application.

## 🎯 Quick Start

**New to the project?** Start here:
1. Read [UI Guidelines](./ui-guidelines.md) to understand the design system
2. Check [Puck Components Guide](./puck-compatible-ui/components-guide.md) for admin UI components
3. Review [Server Actions Guide](./server-actions/nextjs-server-actions.md) before creating forms

**Building a feature?**
- Admin pages → Use [Puck components](./puck-compatible-ui/components-guide.md)
- Public pages → Use [Shadcn UI](./ui-guidelines.md#shadcn-ui-components)
- Forms → Follow [Server Actions patterns](./server-actions/nextjs-server-actions.md)

**Working on authentication?**
- Read the [Invitation System guide](./authentication/invitation-system.md) first

## 📝 Key Concepts

### Dual Design System
The application uses two component libraries:
- **Admin Area** (`/admin/*`): `@measured/puck` components
- **Public Area** (`/app/[locale]/*`): Shadcn UI components

See [UI Guidelines](./ui-guidelines.md) for details.

### Invitation-Based Authentication
Users must have a valid invitation code to sign up. This is enforced via GitHub OAuth.
See [Invitation System](./authentication/invitation-system.md) for the complete flow.

### Server Actions with React 19
All forms use `useActionState` hook (NOT `useFormState`) for state management.
See [Server Actions Guide](./server-actions/nextjs-server-actions.md) for patterns.

## 🛠️ Tech Stack

- **Framework**: Next.js 16.1.1 with App Router
- **UI**: React 19.2.3
- **Admin Components**: `@measured/puck` v0.20.2
- **Public Components**: Shadcn UI
- **Styling**: Tailwind CSS v4
- **Database**: Turso (libSQL/SQLite) with Drizzle ORM
- **Authentication**: Arctic (GitHub OAuth)
- **i18n**: next-intl (public routes only)

## 📄 Additional Resources

- **[DATABASE_SETUP.md](../DATABASE_SETUP.md)** - Database schema and migration guide
- **[CLAUDE.md](../CLAUDE.md)** - Project overview and AI assistant instructions
- **[README.md](../README.md)** - Project overview and setup instructions

---

**Last Updated**: December 26, 2025
