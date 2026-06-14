# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Medical Device Incident Investigator (MedInvestigate)** is a React-based web application for investigating and managing medical device incidents. It provides a dashboard for viewing incidents, tools for creating and managing investigations, and a workspace for detailed incident analysis.

## Development Commands

All commands are run from the `client/` directory:

```bash
# Start development server (Vite dev mode on http://localhost:5173)
pnpm dev

# Build for production
pnpm build

# Run a specific script from package.json
pnpm <script-name>
```

The project uses **pnpm** for package management with workspace support.

## Tech Stack

- **Frontend Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 6.3.5
- **UI Component Library**: Radix UI (primitives + styling via Tailwind)
- **Styling**: Tailwind CSS 4.1.12 with CSS-in-JS support (Emotion)
- **Routing**: react-router v7
- **Forms**: react-hook-form
- **Icons**: lucide-react (primary), @mui/icons-material (secondary)
- **Charts**: recharts
- **Date Handling**: date-fns
- **Other Notable**: react-dnd (drag-and-drop), react-resizable-panels, sonner (toast notifications)

## Project Structure

```
client/
├── src/
│   ├── app/
│   │   ├── App.tsx                    # Root App component with RouterProvider
│   │   ├── Shell.tsx                  # Main layout shell with sidebar & navigation
│   │   ├── routes.tsx                 # React Router configuration
│   │   ├── pages/                     # Page-level components
│   │   │   ├── Dashboard.tsx          # Main dashboard view
│   │   │   ├── NewIncident.tsx        # Form for creating new incidents
│   │   │   ├── Investigations.tsx     # List view of investigations
│   │   │   ├── InvestigationWorkspace.tsx  # Detailed investigation editor
│   │   │   └── Settings.tsx           # Application settings
│   │   └── components/
│   │       ├── ui/                    # Shadcn-style reusable components
│   │       │   ├── button.tsx, card.tsx, input.tsx, etc.
│   │       │   └── utils.ts, use-mobile.ts
│   │       └── figma/
│   │           └── ImageWithFallback.tsx
│   ├── styles/                        # Global CSS and design tokens
│   └── main.tsx                       # React entry point
├── index.html                         # HTML template
├── vite.config.ts                     # Vite configuration with Figma asset resolver
├── postcss.config.mjs                 # PostCSS/Tailwind config
├── package.json
└── pnpm-lock.yaml
```

## Key Architectural Patterns

### Routing Structure
Routes are centralized in `routes.tsx` with a Shell layout wrapper:
- `/dashboard` - Main dashboard
- `/incidents/new` - Create incident form
- `/investigations` - List of all investigations
- `/investigations/:id` - Detailed investigation workspace
- `/settings` - App settings

### UI Component Architecture
- **shadcn-style Components** in `src/app/components/ui/`: Unstyled, composable Radix UI primitives with Tailwind styling. These are foundational building blocks—treat as stable.
- **Feature Components** in `src/app/pages/`: Page-level components that compose UI components and implement domain logic.

### Styling Approach
- **Tailwind CSS** for utility-based styling (primary)
- **CSS Variables** for theme customization (e.g., `var(--sidebar)`, `var(--sidebar-border)`, `var(--sidebar-primary)`)
- **Emotion** for component-level styling where needed
- Global styles in `src/styles/index.css`

## Vite Configuration Notes

- **Custom Figma Asset Resolver**: The config includes a plugin that resolves `figma:asset/filename` imports to `src/assets/filename`. Used for embedding Figma design assets.
- **Path Alias**: `@` resolves to `./src` for cleaner imports
- **Asset Includes**: SVG and CSV files are configured as raw assets

## Development Tips

1. **Component Reuse**: Leverage the UI component library in `src/app/components/ui/` rather than creating custom versions of common components.
2. **Type Safety**: Use TypeScript types (e.g., `Severity`, `Status`) to represent domain-specific constants and enums.
3. **Icon Usage**: Prefer lucide-react icons for consistency; Material UI icons are available as a fallback.
4. **Styling**: Use Tailwind utility classes directly in JSX. Define custom CSS variables in the stylesheet for dynamic theming.
5. **Form Handling**: Use react-hook-form for complex forms to avoid re-render overhead.
6. **Navigation**: Use `useNavigate()` and `NavLink` from react-router for programmatic and declarative routing.

## Notes on Figma Integration

The custom Figma asset resolver in Vite suggests this project may be used as a Figma plugin or heavily integrated with Figma designs. When handling assets, check if they need to be resolved via the `figma:asset/` prefix convention.
