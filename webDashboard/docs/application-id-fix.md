# Application ID Fix - Job Details Page

## Issue

The accept/reject application endpoints were receiving `undefined` as the application ID, resulting in malformed URLs like:

```text
http://localhost:54321/functions/v1/applications/undefined/accept
```

## Root Cause

The application data structure from the API uses different property names than what the frontend was expecting:

- API uses `application_id` instead of `id`
- API uses `worker` instead of `applicant`
- API uses `applied_at` instead of `created_at`

## API Response Structure

```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "application_id": "a89a4ca3-2d2b-48b0-8112-c9474a6f47bf",
        "worker_id": "afda9073-396e-4b1c-b624-be567a7bc8a5",
        "worker": {
          "id": "afda9073-396e-4b1c-b624-be567a7bc8a5",
          "name": "Devansh Karia",
          "email": "devansh8801@gmail.com",
          "phone_number": "+919409105881",
          "region_name": "United Kingdom",
          "location": "London",
          "lat": 51.5236368752911,
          "lng": -0.0901309590234609
        },
        "status": "pending",
        "message": null,
        "applied_at": "2025-11-09T15:52:13.582418+00:00",
        "responded_at": null
      }
    ]
  }
}
```

## Changes Made

### File: `/app/dashboard/jobs/[id]/page.tsx`

1. **Updated Application ID References**
   - Changed `application.id` to `application.application_id` throughout
   - Updated in: map key, accept button, reject button, and loading states

2. **Updated Worker/Applicant References**
   - Changed `application.applicant` to `application.worker`
   - Updated in: name, email, phone_number displays

3. **Updated Date Field**
   - Changed `application.created_at` to `application.applied_at`

4. **Added Worker Location Display**
   - Added location information showing worker's city and region
   - Uses `application.worker.location` and `application.worker.region_name`

5. **Added Debug Logging**
   - Added console logs to track application data structure
   - Added log in `handleAcceptApplication` to verify correct ID is being passed

## Expected Behavior

Now when accepting/rejecting an application, the correct URL will be called:

```text
PATCH http://localhost:54321/functions/v1/applications/{application_id}/accept
```

With the proper `application_id` from the API response.

## Testing

To verify the fix:

1. Navigate to a job details page with pending applications
2. Click "Accept" or "Reject" on an application
3. Check the network tab - the URL should contain the correct application_id
4. Check the console logs for the application data structure and ID being passed

## Date

November 9, 2025
