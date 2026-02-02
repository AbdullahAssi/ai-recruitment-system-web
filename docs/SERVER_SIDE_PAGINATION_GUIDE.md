# Server-Side Pagination Implementation Guide

## Overview

This document describes the server-side pagination implementation for the job applications page, which can be reused across other pages in the application.

## Components Created

### 1. ServerPagination Component (`/components/reusables/ServerPagination.tsx`)

A fully reusable server-side pagination component with the following features:

**Features:**

- Previous/Next navigation buttons
- Direct page number input
- Items per page dropdown selector
- First/Last page buttons (optional)
- Loading state indicators
- Accessibility support (ARIA labels)
- Responsive design

**Props:**

```typescript
interface ServerPaginationProps {
  pagination: PaginationData; // Server pagination metadata
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  loading?: boolean;
  className?: string;
  showItemsPerPage?: boolean;
  showPageInput?: boolean;
  showFirstLast?: boolean;
  itemsPerPageOptions?: number[];
}
```

**Usage Example:**

```tsx
<ServerPagination
  pagination={data.pagination}
  onPageChange={(page) =>
    setPaginationState((prev) => ({ ...prev, currentPage: page }))
  }
  onLimitChange={(limit) =>
    setPaginationState((prev) => ({
      ...prev,
      itemsPerPage: limit,
      currentPage: 1,
    }))
  }
  loading={loading}
  showFirstLast={true}
/>
```

## API Changes

### Updated Route: `/app/api/jobs/[id]/applications/route.ts`

**Query Parameters:**

- `page` (number): Current page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `search` (string): Search term for candidate name/email
- `status` (string): Filter by application status
- `sortBy` (string): Sort order (newest, oldest, score-high, score-low, name)

**Response Structure:**

```typescript
{
  success: true,
  data: {
    job: JobData,
    applications: Application[],
    totalApplications: number,      // Total count for this job
    filteredCount: number,            // Count after filters applied
    stats: Stats,
    pagination: {
      page: number,
      limit: number,
      total: number,
      totalPages: number
    }
  }
}
```

**Features:**

- Server-side filtering (search, status)
- Server-side sorting
- Efficient database queries with `skip` and `take`
- Separate stats query (not filtered) for overview

## Hook Updates

### Updated Hook: `useJobApplications` (`/hooks/hooks.ts`)

**Signature:**

```typescript
function useJobApplications(
  jobId: string,
  paginationState: PaginationState,
  filters?: {
    searchTerm?: string;
    statusFilter?: string;
    sortBy?: string;
  },
);
```

**Features:**

- Automatically refetches data when:
  - Page changes
  - Items per page changes
  - Any filter changes
- Builds query parameters from state
- Returns updated data structure with pagination metadata

## Page Implementation

### Updated Page: `/app/hr/jobs/[id]/applications/page.tsx`

**Key Changes:**

1. **Removed Client-Side Filtering**: Data is now filtered on the server
2. **Filter State Management**: Filters reset to page 1 when changed
3. **Direct Data Usage**: Use `data.applications` directly instead of client-side filtered arrays
4. **Pagination Integration**: Added ServerPagination component at the bottom of the results

**State Management:**

```typescript
const [filters, setFilters] = useState<FilterState>({
  searchTerm: "",
  statusFilter: "all",
  sortBy: "newest",
});

const [paginationState, setPaginationState] = useState<PaginationState>({
  currentPage: 1,
  itemsPerPage: 10,
});

// Pass filters to hook for server-side processing
const { data, loading, updateApplicationStatus } = useJobApplications(
  params.id,
  paginationState,
  filters,
);
```

## Type Updates

### Updated Type: `JobApplicationsData` (`/types/application.types.ts`)

Added `filteredCount` to track the number of applications matching current filters:

```typescript
export interface JobApplicationsData {
  job: JobData;
  applications: Application[];
  totalApplications: number;
  filteredCount: number; // NEW
  pagination: PaginationData;
  stats: {
    pending: number;
    reviewed: number;
    shortlisted: number;
    rejected: number;
    averageScore?: number; // Made optional
    highPerformers?: number; // Made optional
  };
}
```

## How to Use in Other Pages

To implement server-side pagination in other pages:

### 1. Update Your API Route

```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Get pagination params
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  // Validate
  const validatedPage = Math.max(1, page);
  const validatedLimit = Math.min(Math.max(1, limit), 100);

  // Get total count
  const totalCount = await prisma.yourModel.count({
    where: yourWhereClause,
  });

  const totalPages = Math.ceil(totalCount / validatedLimit);
  const skip = (validatedPage - 1) * validatedLimit;

  // Fetch paginated data
  const data = await prisma.yourModel.findMany({
    where: yourWhereClause,
    skip,
    take: validatedLimit,
    orderBy: yourOrderBy,
  });

  return NextResponse.json({
    success: true,
    data: {
      items: data,
      pagination: {
        page: validatedPage,
        limit: validatedLimit,
        total: totalCount,
        totalPages,
      },
    },
  });
}
```

### 2. Update Your Custom Hook

```typescript
export function useYourData(
  paginationState: PaginationState,
  filters?: YourFilters,
) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const searchParams = new URLSearchParams({
        page: paginationState.currentPage.toString(),
        limit: paginationState.itemsPerPage.toString(),
      });

      // Add filters to params
      if (filters?.search) {
        searchParams.append("search", filters.search);
      }

      const response = await fetch(`/api/your-endpoint?${searchParams}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      }
    } finally {
      setLoading(false);
    }
  }, [paginationState.currentPage, paginationState.itemsPerPage, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, refetch: fetchData };
}
```

### 3. Use in Your Page Component

```tsx
export default function YourPage() {
  const [paginationState, setPaginationState] = useState({
    currentPage: 1,
    itemsPerPage: 10,
  });

  const [filters, setFilters] = useState({
    search: "",
  });

  const { data, loading } = useYourData(paginationState, filters);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    // Reset to page 1 when filters change
    setPaginationState((prev) => ({ ...prev, currentPage: 1 }));
  };

  return (
    <div>
      {/* Your content */}
      {data?.items.map((item) => (
        <YourItemCard key={item.id} item={item} />
      ))}

      {/* Pagination */}
      {data?.pagination && (
        <ServerPagination
          pagination={data.pagination}
          onPageChange={(page) =>
            setPaginationState((prev) => ({ ...prev, currentPage: page }))
          }
          onLimitChange={(limit) =>
            setPaginationState((prev) => ({
              ...prev,
              itemsPerPage: limit,
              currentPage: 1,
            }))
          }
          loading={loading}
        />
      )}
    </div>
  );
}
```

## Benefits

1. **Performance**: Only fetches needed data, reducing payload size
2. **Scalability**: Handles large datasets efficiently
3. **Consistency**: Server-side filtering ensures accurate results
4. **Reusability**: Component and pattern can be used across the application
5. **User Experience**: Fast page transitions with loading states

## Best Practices

1. **Always validate pagination parameters** on the server
2. **Set a maximum limit** (e.g., 100) to prevent excessive data fetching
3. **Reset to page 1** when filters change
4. **Show loading states** during data fetching
5. **Handle empty states** gracefully
6. **Use proper TypeScript types** for type safety

## Testing Checklist

- [ ] Page navigation works (Previous/Next)
- [ ] Direct page input works correctly
- [ ] Items per page selection updates correctly
- [ ] Filters reset to page 1
- [ ] Invalid page numbers are handled
- [ ] Loading states display properly
- [ ] Empty states display when no results
- [ ] Data refetches on filter changes
- [ ] URL query params work (if implemented)

## Implemented Pages

Server-side pagination has been successfully implemented on the following pages:

### 1. Job Applications (`/hr/jobs/[jobId]/applications`)

- **API Route**: `/api/jobs/[id]/applications`
- **Features**: Search, status filter, sort by (score, submission date, name)
- **Hook**: `useJobApplications` with filters support
- **Items per page**: 10 (default)

### 2. HR Jobs List (`/hr/jobs`)

- **API Route**: `/api/jobs`
- **Features**: Search (title, description, location), status filter (active/inactive), location filter, sort by (date, title, applications)
- **Hook**: `useJobs` with pagination and filters
- **Items per page**: 12 (default)

### 3. HR Candidates List (`/hr/candidates`)

- **API Route**: `/api/candidates`
- **Features**: Search (name, email), experience range filter (min-max)
- **Hook**: `useCandidates` with pagination and filters
- **Items per page**: 12 (default)

### 4. Candidate Jobs List (`/candidate/jobs`)

- **API Route**: `/api/jobs` (filtered for active jobs only)
- **Features**: Search (title, company, location), displays application status
- **Items per page**: 9 (default)
