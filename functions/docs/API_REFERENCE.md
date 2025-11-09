# Greenmatch API Reference

Complete API documentation for all Greenmatch Edge Functions.

## Base URL

**Local Development:**
```
http://localhost:54321/functions/v1
```

**Production:**
```
https://your-project.supabase.co/functions/v1
```

## Authentication

**IMPORTANT**: All Supabase Edge Function requests require the `apikey` header:

```http
apikey: <your-anon-key>
```

For local development, use the anon key from `supabase start` output.

Additionally, protected endpoints require a valid JWT token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

**Summary**:
- **Public endpoints** (register, login): Only need `apikey` header
- **Protected endpoints** (all others): Need both `apikey` AND `Authorization` headers

---

## Authentication APIs

### Register New User

Create a new user account.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "phone_number": "+919876543210",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "user_type": "CommunityMember",
  "region_name": "Maharashtra",
  "location": "Pune District",
  "lat": 18.5204,
  "lng": 73.8567
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "phone_number": "+919876543210",
      "role": "CommunityMember",
      "region_name": "Maharashtra",
      "location": "Pune District",
      "lat": 18.5204,
      "lng": 73.8567,
      "created_at": "2024-11-09T10:00:00Z",
      "updated_at": "2024-11-09T10:00:00Z"
    },
    "session_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User registered successfully"
}
```

---

### Login

Authenticate an existing user.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "CommunityMember",
      ...
    },
    "session_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

---

## Job Management APIs (Government Officials)

### Create Job

Create a new climate-action job.

**Endpoint:** `POST /jobs/create`

**Authorization:** GramPanchayat or Admin

**Request Body:**
```json
{
  "title": "Plant 50 Saplings in Village Commons",
  "description": "Help plant native tree saplings...",
  "category": "tree_planting",
  "location": "Village Commons, Ward 3",
  "lat": 18.5204,
  "lng": 73.8567,
  "reward_amount": 500.00,
  "deadline": "2024-12-31T23:59:59Z",
  "proof_requirements": "Before and after photos required"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "job-uuid",
    "title": "Plant 50 Saplings...",
    "status": "open",
    ...
  },
  "message": "Job created successfully"
}
```

---

### Get My Jobs

Get jobs created by the current user.

**Endpoint:** `GET /jobs/my-jobs`

**Query Parameters:**
- `status` (optional): Filter by status (open, assigned, completed, etc.)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

**Example:** `GET /jobs/my-jobs?status=open&page=1&limit=10`

**Response:**
```json
{
  "success": true,
  "jobs": [
    {
      "id": "job-uuid",
      "title": "Plant 50 Saplings...",
      "description": "...",
      "category": "tree_planting",
      "status": "open",
      "reward_amount": 500.00,
      "location": "Village Commons",
      "deadline": "2024-12-31T23:59:59Z",
      "created_at": "2024-11-09T10:00:00Z"
    }
  ],
  "total_count": 25,
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "total_pages": 3
  }
}
```

---

### Update Job

Update an existing job.

**Endpoint:** `PATCH /jobs/:id`

**Authorization:** Job creator or Admin

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "reward_amount": 600.00,
  "deadline": "2024-12-31T23:59:59Z",
  "status": "open"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "updated_job": { ... }
  },
  "message": "Job updated successfully"
}
```

---

### Delete Job

Delete a job.

**Endpoint:** `DELETE /jobs/:id`

**Authorization:** Job creator or Admin

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true
  },
  "message": "Job deleted successfully"
}
```

---

### Get Job Applications

Get all applications for a specific job.

**Endpoint:** `GET /jobs/:id/applications`

**Authorization:** Job creator or Admin

**Response:**
```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "application_id": "uuid",
        "worker_name": "John Doe",
        "worker_phone": "+919876543210",
        "worker_email": "john@example.com",
        "applied_at": "2024-11-09T10:00:00Z",
        "status": "pending",
        "message": "I'm interested in this job"
      }
    ]
  }
}
```

---

## Job Discovery APIs (Workers)

### Discover Jobs

Find nearby jobs based on location.

**Endpoint:** `GET /jobs/discover`

**Query Parameters:**
- `lat` (required): Latitude
- `lng` (required): Longitude
- `radius` (optional): Search radius in km (default: 50)
- `category` (optional): Filter by category
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Example:** `GET /jobs/discover?lat=18.5204&lng=73.8567&radius=50&category=tree_planting&page=1`

**Response:**
```json
{
  "success": true,
  "jobs": [
    {
      "id": "job-uuid",
      "title": "Plant 50 Saplings...",
      "description": "...",
      "category": "tree_planting",
      "location": "Village Commons",
      "reward_amount": 500.00,
      "deadline": "2024-12-31T23:59:59Z",
      "distance_km": 12.5
    }
  ],
  "total": 15
}
```

---

### Apply for Job

Submit an application for a job.

**Endpoint:** `POST /jobs/:id/apply`

**Request Body:**
```json
{
  "message": "I'm interested in this job and have experience planting trees"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "application_id": "uuid"
  },
  "message": "Application submitted successfully"
}
```

---

### Get My Applications

Get all applications submitted by the current user.

**Endpoint:** `GET /jobs/my-applications`

**Query Parameters:**
- `status` (optional): Filter by status (pending, accepted, rejected)
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:**
```json
{
  "success": true,
  "applications": [
    {
      "application_id": "uuid",
      "job_details": {
        "id": "job-uuid",
        "title": "Plant 50 Saplings...",
        "reward_amount": 500.00,
        ...
      },
      "status": "pending",
      "applied_at": "2024-11-09T10:00:00Z",
      "message": "I'm interested..."
    }
  ],
  "pagination": { ... }
}
```

---

## Application Management APIs

### Accept Application

Accept a job application (automatically assigns job to worker).

**Endpoint:** `PATCH /applications/:id/accept`

**Authorization:** Job creator or Admin

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true
  },
  "message": "Application accepted successfully"
}
```

**Side Effect:** Updates job status to 'assigned' and sets assigned_to field.

---

### Reject Application

Reject a job application.

**Endpoint:** `PATCH /applications/:id/reject`

**Authorization:** Job creator or Admin

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true
  },
  "message": "Application rejected successfully"
}
```

---

## Proof Submission & Verification APIs

### Create Submission

Submit proof of completed work.

**Endpoint:** `POST /submissions/create`

**Authorization:** Assigned worker

**Request Body:**
```json
{
  "job_id": "job-uuid",
  "before_photo": "https://storage.supabase.co/path/to/before.jpg",
  "after_photo": "https://storage.supabase.co/path/to/after.jpg",
  "notes": "Planted 50 saplings as requested",
  "lat": 18.5204,
  "lng": 73.8567
}
```

**Note:** Upload images to Supabase Storage first, then use the URLs in this request.

**Response:**
```json
{
  "success": true,
  "data": {
    "submission_id": "uuid",
    "success": true
  },
  "message": "Submission created successfully"
}
```

---

### Get Pending Submissions

Get all pending submissions for verification.

**Endpoint:** `GET /submissions/pending`

**Authorization:** GramPanchayat or Admin

**Response:**
```json
{
  "success": true,
  "data": {
    "submissions": [
      {
        "submission_id": "uuid",
        "job_title": "Plant 50 Saplings...",
        "worker_name": "John Doe",
        "worker_phone": "+919876543210",
        "submitted_at": "2024-11-09T10:00:00Z",
        "photos": {
          "before": "https://...",
          "after": "https://..."
        },
        "notes": "Planted 50 saplings..."
      }
    ]
  }
}
```

---

### Verify Submission

Approve or reject a submission.

**Endpoint:** `PATCH /submissions/:id/verify`

**Authorization:** Job creator or Admin

**Request Body:**
```json
{
  "verification_status": "approved",
  "rejection_reason": null
}
```

Or for rejection:
```json
{
  "verification_status": "rejected",
  "rejection_reason": "Photos are not clear enough"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true
  },
  "message": "Submission approved successfully"
}
```

**Side Effect:** If approved, creates payment record and updates job status to 'completed'.

---

### Get Submission Details

Get detailed information about a submission.

**Endpoint:** `GET /submissions/:id`

**Authorization:** Worker, Job creator, or Admin

**Response:**
```json
{
  "success": true,
  "data": {
    "submission_details": {
      "id": "uuid",
      "before_photo": "https://...",
      "after_photo": "https://...",
      "notes": "...",
      "verification_status": "approved",
      "created_at": "2024-11-09T10:00:00Z",
      "verified_at": "2024-11-09T11:00:00Z"
    },
    "job_details": { ... },
    "worker_details": { ... },
    "verifier_details": { ... }
  }
}
```

---

## Payment & Wallet APIs

### Get Wallet

Get worker's wallet information.

**Endpoint:** `GET /payments/wallet`

**Authorization:** Any authenticated user

**Response:**
```json
{
  "success": true,
  "data": {
    "total_earned": 1500.00,
    "pending_amount": 500.00,
    "paid_amount": 1500.00,
    "transactions": [
      {
        "payment_id": "uuid",
        "job_title": "Plant 50 Saplings...",
        "amount": 500.00,
        "status": "paid",
        "created_at": "2024-11-09T10:00:00Z",
        "paid_at": "2024-11-10T10:00:00Z"
      }
    ]
  }
}
```

---

### Get Pending Payment Approvals

Get payments pending approval.

**Endpoint:** `GET /payments/pending-approvals`

**Authorization:** GramPanchayat or Admin

**Response:**
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "payment_id": "uuid",
        "worker_name": "John Doe",
        "worker_phone": "+919876543210",
        "job_title": "Plant 50 Saplings...",
        "amount": 500.00,
        "submitted_at": "2024-11-09T10:00:00Z",
        "submission_id": "uuid"
      }
    ]
  }
}
```

---

### Approve Payment

Approve a payment.

**Endpoint:** `PATCH /payments/:id/approve`

**Authorization:** Job creator or Admin

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true
  },
  "message": "Payment approved successfully"
}
```

---

## Dashboard & Analytics APIs

### Get Dashboard Stats

Get user-specific dashboard statistics.

**Endpoint:** `GET /dashboard/stats`

**Query Parameters:**
- `user_type` (optional): 'government' or 'worker' (auto-detected from user role)

**Response for Government Officials:**
```json
{
  "success": true,
  "data": {
    "total_jobs_posted": 25,
    "active_jobs": 10,
    "completed_jobs": 15,
    "total_spent": 7500.00,
    "pending_verifications": 3
  }
}
```

**Response for Workers:**
```json
{
  "success": true,
  "data": {
    "jobs_completed": 12,
    "total_earned": 6000.00,
    "pending_earnings": 1000.00,
    "current_applications": 5
  }
}
```

---

### Get Climate Impact

Get global climate impact statistics.

**Endpoint:** `GET /dashboard/climate-impact`

**Response:**
```json
{
  "success": true,
  "data": {
    "total_trees_planted": 5000,
    "total_co2_offset_kg": 100000,
    "total_jobs_completed": 250,
    "total_income_generated": 125000.00,
    "active_workers": 150
  }
}
```

---

## Notification APIs

### Send Notification

Send a notification to a user.

**Endpoint:** `POST /notifications/send`

**Request Body:**
```json
{
  "user_id": "user-uuid",
  "title": "Application Accepted",
  "message": "Your application for 'Plant 50 Saplings' has been accepted!",
  "type": "application_update"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "notification_id": "uuid"
  },
  "message": "Notification sent successfully"
}
```

---

### Get My Notifications

Get all notifications for the current user.

**Endpoint:** `GET /notifications/my-notifications`

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "title": "Application Accepted",
        "message": "Your application...",
        "type": "application_update",
        "read": false,
        "created_at": "2024-11-09T10:00:00Z"
      }
    ]
  }
}
```

---

### Mark Notification as Read

Mark a notification as read.

**Endpoint:** `PATCH /notifications/:id/read`

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true
  },
  "message": "Notification marked as read"
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |

---

## Rate Limiting

Currently, no rate limiting is implemented. This will be added in future versions.

---

## CORS

All endpoints support CORS with the following headers:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Headers: authorization, x-client-info, apikey, content-type`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS`

---

## Testing with cURL

### Register a user
```bash
curl -X POST "http://localhost:54321/functions/v1/auth/register" \
  -H "Content-Type: application/json" \
  -H "apikey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone_number": "+919876543210",
    "user_type": "CommunityMember"
  }'
```

### Login
```bash
curl -X POST "http://localhost:54321/functions/v1/auth/login" \
  -H "Content-Type: application/json" \
  -H "apikey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create a job (with token)
```bash
curl -X POST "http://localhost:54321/functions/v1/jobs/create" \
  -H "apikey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Plant 50 Saplings",
    "description": "Help plant native trees",
    "category": "tree_planting",
    "location": "Village Commons",
    "lat": 18.5204,
    "lng": 73.8567,
    "reward_amount": 500.00
  }'
```

---

## Supabase Storage for Images

To upload images before submitting proof:

1. Upload to Supabase Storage bucket
2. Get the public URL
3. Use the URL in submission API

Example using Supabase client:
```typescript
const { data, error } = await supabase.storage
  .from('proof-images')
  .upload(`${jobId}/before.jpg`, file);

const publicUrl = supabase.storage
  .from('proof-images')
  .getPublicUrl(data.path).data.publicUrl;
```

---

## Real-time Subscriptions

Use Supabase Realtime to subscribe to notifications:

```typescript
const channel = supabase
  .channel('notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    console.log('New notification:', payload.new);
  })
  .subscribe();
```
