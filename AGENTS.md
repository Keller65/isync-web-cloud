# AGENTS.md - Developer Guide for iSync Web App

## Project Overview

This is a Next.js 16 (App Router) application with TypeScript, Tailwind CSS v4, and Zustand for state management. The app is an ERP ordering system with product catalogs, shopping cart, customer management, and order processing.

## Commands

### Development
```bash
npm run dev     # Start Next.js development server
npm run build   # Build for production
npm run start   # Start production server
```

### Linting
```bash
npm run lint    # Run ESLint
```

### Testing
No test framework is configured. Do not add tests unless explicitly requested.

## Code Style Guidelines

### Imports
- Use `@/` path alias for absolute imports (e.g., `@/components/ui/button`)
- Order imports: React imports → external libraries → internal components/hooks → types
- Group related imports together with blank lines between groups
```typescript
import { useEffect, useState } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/app/lib/store'
import { Product } from '@/types/products'
```

### Naming Conventions
- **Components**: PascalCase (e.g., `ProductCard`, `KPICard`)
- **Files**: kebab-case for pages (`page.tsx`), PascalCase for components (`Button.tsx`)
- **Variables/functions**: camelCase
- **Interfaces/Types**: PascalCase with descriptive names (e.g., `Product`, `Category`)
- **Zustand stores**: `useXxxStore` pattern (e.g., `useAuthStore`, `useCartStore`)

### TypeScript
- Always define explicit types for props, function parameters, and return values
- Use interfaces for object shapes, types for unions/primitives
- Enable strict null checks - use `??` or `?.` for optional chaining
```typescript
interface Product {
  itemCode: string
  itemName: string
  price: number
  inStock?: number
}

function ProductCard({ product }: { product: Product }) { ... }
```

### Components
- Use `'use client'` directive at the top for client-side components
- Prefer functional components with hooks
- Extract complex logic into custom hooks in `/hooks` directory
- Use composition over inheritance

### State Management (Zustand)
- Create stores in `/app/lib/` with pattern `store.xxx.ts`
- Export hook with `useXxxStore` naming
```typescript
interface AuthState {
  token: string | null
  setAuth: (data: { token: string }) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  setAuth: (data) => set({ token: data.token }),
  logout: () => set({ token: null }),
}))
```

### UI Components
- Use Radix UI primitives for accessibility (in `@radix-ui/` packages)
- Use shadcn/ui-style components in `/components/ui/`
- Use `class-variance-authority` (cva) for component variants
- Use `cn()` utility from `@/lib/utils` for conditional classes
```typescript
const buttonVariants = cva("...", {
  variants: {
    variant: { default: "...", destructive: "..." },
    size: { default: "...", sm: "..." },
  },
})
```

### Tailwind CSS
- Use Tailwind v4 with CSS-first configuration
- Use semantic color tokens (e.g., `bg-primary`, `text-muted-foreground`)
- Use `clsx` and `tailwind-merge` via `cn()` utility for conditional classes

### Error Handling
- Use try/catch blocks for async operations
- Log errors with `console.error(err)` - do not use console.log for errors
- Set appropriate fallback states (e.g., `setHasMore(false)` on error)
- Show user-friendly error messages via toast/alert components

### API Calls
- Use axios for HTTP requests
- Include Authorization header with Bearer token
- Handle response data defensively: `res.data?.items ?? res.data ?? []`
- Use `/api-proxy` prefix for backend API calls

### Formatting
- Prettier is likely configured via eslint-config-next
- Use 2-space indentation
- Use semicolons
- One blank line between import groups and code

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── dashboard/         # Main app pages
│   ├── lib/               # Stores and actions
│   └── ui/                # Auth-related UI components
├── components/
│   ├── ui/                # Reusable UI components (shadcn-style)
│   ├── pdf/               # PDF generation components
│   └── dashboard/         # Dashboard-specific components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities (utils.ts)
├── types/                 # TypeScript type definitions
└── auth/                  # Authentication configuration
```

## Common Patterns

### Client Component with Data Fetching
```typescript
'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuthStore } from '@/app/lib/store'

export default function Page() {
  const { token } = useAuthStore()
  const [data, setData] = useState<Data[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) return

    setLoading(true)
    axios.get('/api-proxy/endpoint', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [token])

  if (!token) return <p>Please log in</p>

  return <div>{/* content */}</div>
}
```

### Form Input with Validation
```typescript
const [value, setValue] = useState('')
const [error, setError] = useState(false)

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const text = e.target.value.replace(/[^0-9]/g, '')
  setValue(text)
  setError(false)
}

const handleBlur = () => {
  const parsed = parseFloat(value)
  if (isNaN(parsed) || parsed < 0) {
    setError(true)
    setValue(defaultValue.toFixed(2))
  }
}
```

## Dependencies

Key libraries used:
- **Framework**: Next.js 16, React 19
- **Styling**: Tailwind CSS 4, class-variance-authority
- **State**: Zustand 5
- **UI**: Radix UI primitives, Base UI, Lucide icons, Phosphor icons
- **Data**: axios, react-chartjs-2, @react-pdf/renderer
- **Auth**: next-auth 5 (beta)
- **Maps**: mapbox-gl
