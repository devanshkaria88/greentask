# GreenTask Dashboard - Quick Reference Guide

## 🚀 Getting Started (5 Minutes)

### 1. Start Backend
```bash
cd /Users/devansh/GreenTask/functions
supabase start
```

### 2. Start Frontend
```bash
cd /Users/devansh/GreenTask/webDashboard
npm run dev
```

### 3. Access Application
- Frontend: http://localhost:3000
- Register: http://localhost:3000/register
- Login: http://localhost:3000/login

---

## 📁 Key Files & Locations

### Configuration
- **API Config**: `/lib/api-config.ts` - All endpoints and constants
- **Types**: `/lib/types.ts` - TypeScript interfaces
- **Environment**: `.env.local` - API base URL

### APIs (RTK Query)
- **Auth**: `/store/api/authApi.ts` ✅ Complete
- **Dashboard**: `/store/api/dashboardApi.ts` 🔧 Needs update
- **Jobs**: `/store/api/jobsApi.ts` 🔧 Needs update
- **Submissions**: `/store/api/submissionsApi.ts` 📋 To create
- **Payments**: `/store/api/paymentsApi.ts` 📋 To create

### Pages
- **Login**: `/app/login/page.tsx` ✅
- **Register**: `/app/register/page.tsx` ✅
- **Dashboard**: `/app/dashboard/page.tsx` ✅
- **Jobs**: `/app/dashboard/jobs/page.tsx` 📋
- **Verifications**: `/app/dashboard/verifications/page.tsx` 📋
- **Payments**: `/app/dashboard/payments/page.tsx` 📋

### Components
- **Layout**: `/components/layout/` ✅
- **UI**: `/components/ui/` ✅ 11 components
- **Jobs**: `/components/jobs/` 📋
- **Verifications**: `/components/verifications/` 📋
- **Payments**: `/components/payments/` 📋

---

## 🔧 Common Tasks

### Add New API Endpoint

1. **Define in config**:
```typescript
// /lib/api-config.ts
export const API_ENDPOINTS = {
  NEW_ENDPOINT: '/path/to/endpoint',
}
```

2. **Create API slice**:
```typescript
// /store/api/newApi.ts
import { apiSlice } from './apiSlice'
import { API_ENDPOINTS } from '@/lib/api-config'

export const newApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getData: builder.query<ResponseType, RequestType>({
      query: (params) => `${API_ENDPOINTS.NEW_ENDPOINT}?param=${params}`,
      transformResponse: (response: any) => response.data,
      providesTags: ['TagName'],
    }),
  }),
})

export const { useGetDataQuery } = newApi
```

3. **Use in component**:
```typescript
import { useGetDataQuery } from '@/store/api/newApi'

const { data, isLoading, error } = useGetDataQuery(params)
```

### Create New Page

1. **Create file**: `/app/dashboard/newpage/page.tsx`
2. **Add to sidebar**: `/components/layout/Sidebar.tsx`
3. **Add route protection**: Already handled by layout

### Add New UI Component

1. **Install if needed**: `npm install @radix-ui/react-component-name`
2. **Create**: `/components/ui/component-name.tsx`
3. **Follow shadcn/ui patterns**
4. **Import and use**

---

## 🎯 Implementation Priorities

### Next (Phase 4 - Jobs)
1. Update `/store/api/dashboardApi.ts` with real endpoints
2. Update `/store/api/jobsApi.ts` with real endpoints  
3. Create `/components/jobs/CreateJobSheet.tsx`
4. Create `/app/dashboard/jobs/page.tsx`
5. Test job creation flow

### Then (Phase 5 - Verifications)
1. Create `/store/api/submissionsApi.ts`
2. Create `/app/dashboard/verifications/page.tsx`
3. Create photo viewer component
4. Test verification flow

### Finally (Phase 6 - Payments)
1. Create `/store/api/paymentsApi.ts`
2. Create `/app/dashboard/payments/page.tsx`
3. Test payment approval flow

---

## 🐛 Troubleshooting

### Backend Not Responding
```bash
# Check if Supabase is running
supabase status

# Restart if needed
supabase stop
supabase start
```

### API Errors
1. Check console for error messages
2. Verify API base URL in `.env.local`
3. Check backend logs
4. Verify token in localStorage

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### Type Errors
1. Check `/lib/types.ts` for correct interfaces
2. Ensure API responses match expected types
3. Use `any` temporarily, then refine

---

## 📚 Documentation

### Available Guides
1. **README.md** - Project overview
2. **IMPLEMENTATION_PROGRESS.md** - Detailed progress
3. **COMPLETE_IMPLEMENTATION_GUIDE.md** - Step-by-step instructions
4. **FINAL_STATUS.md** - Current status and next steps
5. **QUICK_REFERENCE.md** - This file

### External Resources
- [Next.js Docs](https://nextjs.org/docs)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

## 🔑 Key Concepts

### RTK Query Flow
1. Define endpoint in API slice
2. Export generated hook
3. Use hook in component
4. Handle loading/error states
5. Data automatically cached

### Protected Routes
- All `/dashboard/*` routes protected
- Check in `/app/dashboard/layout.tsx`
- Redirects to `/login` if not authenticated

### State Management
- **Redux**: Global state (auth, etc.)
- **RTK Query**: API data and caching
- **Local State**: Component-specific (useState)

### Styling
- **Tailwind**: Utility classes
- **CSS Variables**: Theme colors
- **Dark Mode**: Automatic with next-themes

---

## 💡 Best Practices

### API Calls
```typescript
// ✅ Good
const { data, isLoading, error } = useGetDataQuery()

if (isLoading) return <Loading />
if (error) return <Error message={error.message} />
return <Data data={data} />

// ❌ Bad
const data = useGetDataQuery().data // No loading/error handling
```

### Error Handling
```typescript
// ✅ Good
try {
  await mutation(data).unwrap()
  toast.success('Success!')
} catch (error: any) {
  toast.error(error?.data?.error || 'Failed')
}

// ❌ Bad
mutation(data) // No error handling
```

### Type Safety
```typescript
// ✅ Good
interface User {
  id: string
  name: string
}
const user: User = data

// ❌ Bad
const user: any = data
```

---

## 🎨 UI Patterns

### Loading State
```typescript
{isLoading ? (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
  </div>
) : (
  <Content />
)}
```

### Error State
```typescript
{error && (
  <div className="text-center text-destructive">
    <p>{error.message}</p>
    <Button onClick={refetch}>Retry</Button>
  </div>
)}
```

### Empty State
```typescript
{data?.length === 0 && (
  <div className="text-center text-muted-foreground py-12">
    <p>No items found</p>
    <Button onClick={onCreate}>Create New</Button>
  </div>
)}
```

---

## 🚢 Pre-Deployment Checklist

- [ ] All phases completed
- [ ] All tests passing
- [ ]### Environment Variables
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:54321/functions/v1
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

For production:
```env
NEXT_PUBLIC_API_BASE_URL=https://your-project.supabase.co/functions/v1
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important**: The `apikey` header is required for ALL Supabase Edge Function requests, including public endpoints like register and login.
- [ ] Loading states added
- [ ] Responsive design verified
- [ ] Dark mode tested
- [ ] Documentation updated

---

## 📞 Quick Commands

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start

# Install new package
npm install package-name

# Add UI component (if using CLI)
npx shadcn-ui@latest add component-name

# Type check
npx tsc --noEmit

# Format code (if prettier installed)
npm run format
```

---

**Last Updated**: November 9, 2024  
**Status**: Foundation Complete (60%)  
**Next**: Phase 4 - Jobs Management
