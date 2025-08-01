# 🧠 Frontend Development Instructions for Copilot & Team

This guide outlines how to build and organize components, logic, and styles across the **Next.js + TypeScript** job portal frontend that uses **TailwindCSS**, **ShadCN UI**, and **Lucide Icons**.

---

## 🔄 Global Refactoring Principles

### 1. Break Down Large Components

- Review all pages in `/app/**/*`
- Extract visually or functionally distinct UI blocks
- Name components clearly (e.g., `JobInfoCard`, `CandidateDialog`, `FiltersPanel`)

### 2. Folder Structure Guidelines

| Purpose                      | Folder Path              |
| ---------------------------- | ------------------------ |
| Feature-specific components  | `/components/[feature]/` |
| Reusable shared components   | `/components/reusables/` |
| Common layout or UI elements | `/components/common/`    |
| Custom React hooks           | `/hooks/`                |
| Shared types/interfaces      | `/lib/types/`            |

### 3. State, Data, and Hooks

- Move API calls and logic to custom hooks
- Use `useEffect`, `useMemo`, and `useCallback` appropriately
- Avoid side-effects inside render

### 4. Accessibility Best Practices

- Add `aria-*` attributes to dialogs, buttons, and inputs
- Use semantic HTML and keyboard navigation support

### 5. Pagination Enhancements
-server side reusable pagination
- Use controls:
  - Next/Previous buttons
  - Page number input
  - Items per page dropdown

---

## ✅ Component Standards & Patterns

### Component Checklist

-

### Example

```tsx
// File: /components/applications/JobInfoCard.tsx
import { Badge } from "@/components/ui/badge";
import { Job } from "@/lib/types";

interface JobInfoCardProps {
  job: Job;
}

export function JobInfoCard({ job }: JobInfoCardProps) {
  return (
    <div className="border p-4 rounded-lg shadow-sm space-y-2">
      <div className="text-xl font-semibold">{job.title}</div>
      <div className="text-sm text-gray-600">{job.location}</div>
      {job.skills && (
        <div className="flex flex-wrap gap-2 mt-2">
          {job.skills.map((skill) => (
            <Badge key={skill} variant="secondary">
              {skill}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 🧪 Bonus: Advanced Practices

- Use `zod` for validating API responses (optional)
- Add unit/integration tests with `jest` or `vitest`
- Use constants/enums for repeated strings or logic
- Comment complex logic blocks for clarity
- Ensure readability is prioritized over clever code

---

> ✅ Use this file as a guideline for building new components, dialogs, pages, and hooks across the system.

