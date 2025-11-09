# GreenTask Dashboard - Test Cases

## Test Environment Setup

### Prerequisites
```bash
# Backend running
cd /Users/devansh/GreenTask/functions
supabase start

# Frontend running
cd /Users/devansh/GreenTask/webDashboard
npm run dev
```

Access: http://localhost:3000

---

## Phase 1: Authentication Tests

### Test 1.1: User Registration (Positive)
**Steps:**
1. Navigate to http://localhost:3000/register
2. Fill in all required fields:
   - Name: "Test Official"
   - Email: "test@GreenTask.in"
   - Phone: "+919876543210"
   - Password: "SecurePass123"
   - User Type: "Gram Panchayat Official"
   - Region: "Maharashtra"
   - Location: "Pune District"
3. Click "Register"

**Expected Result:**
- ✅ Success toast appears
- ✅ Redirected to /dashboard
- ✅ User logged in automatically

### Test 1.2: User Registration (Negative - Missing Fields)
**Steps:**
1. Navigate to /register
2. Leave required fields empty
3. Try to submit

**Expected Result:**
- ✅ HTML5 validation prevents submission
- ✅ Error messages shown for required fields

### Test 1.3: User Login (Positive)
**Steps:**
1. Navigate to http://localhost:3000/login
2. Enter registered credentials
3. Click "Login"

**Expected Result:**
- ✅ Success toast appears
- ✅ Redirected to /dashboard
- ✅ Session persists on refresh

### Test 1.4: User Login (Negative - Wrong Password)
**Steps:**
1. Navigate to /login
2. Enter email with wrong password
3. Click "Login"

**Expected Result:**
- ✅ Error toast appears
- ✅ Remains on login page

### Test 1.5: Protected Routes
**Steps:**
1. Logout if logged in
2. Try to access /dashboard directly

**Expected Result:**
- ✅ Redirected to /login
- ✅ Cannot access dashboard without auth

### Test 1.6: Session Persistence
**Steps:**
1. Login successfully
2. Refresh the page
3. Navigate to different pages

**Expected Result:**
- ✅ User remains logged in
- ✅ No redirect to login

### Test 1.7: Logout
**Steps:**
1. Click on user menu (top right)
2. Click "Logout"

**Expected Result:**
- ✅ Redirected to /login
- ✅ Session cleared
- ✅ Cannot access /dashboard

---

## Phase 2: Dashboard Tests

### Test 2.1: Dashboard Stats Display
**Steps:**
1. Login and view dashboard

**Expected Result:**
- ✅ 4 stat cards displayed
- ✅ Climate impact section visible
- ✅ Quick actions buttons present
- ✅ Loading state shown initially
- ✅ Data loads from API or shows error gracefully

### Test 2.2: Theme Toggle
**Steps:**
1. Click theme toggle in sidebar
2. Switch between Light/Dark/System

**Expected Result:**
- ✅ Theme changes immediately
- ✅ Preference persists on refresh
- ✅ All pages respect theme

### Test 2.3: Sidebar Navigation
**Steps:**
1. Click each sidebar link
2. Test collapse/expand button

**Expected Result:**
- ✅ Navigates to correct pages
- ✅ Active link highlighted
- ✅ Sidebar collapses/expands smoothly

---

## Phase 3: Jobs Management Tests

### Test 3.1: View Jobs List
**Steps:**
1. Navigate to /dashboard/jobs

**Expected Result:**
- ✅ Jobs list loads or shows empty state
- ✅ Tabs for filtering by status work
- ✅ Loading state shown while fetching

### Test 3.2: Create New Job (Positive)
**Steps:**
1. Click "Create Job" button
2. Fill all required fields:
   - Title: "Plant 100 Saplings"
   - Description: "Plant native trees in village commons"
   - Category: "Tree Planting"
   - Location: "Village Commons, Ward 3"
   - Lat: 18.5204
   - Lng: 73.8567
   - Reward: 1000
   - Deadline: Future date
   - Proof Requirements: "Before and after photos"
3. Click "Create Job"

**Expected Result:**
- ✅ Success toast appears
- ✅ Dialog closes
- ✅ New job appears in list
- ✅ Dashboard stats updated

### Test 3.3: Create Job (Negative - Missing Fields)
**Steps:**
1. Open create job dialog
2. Leave required fields empty
3. Try to submit

**Expected Result:**
- ✅ Validation prevents submission
- ✅ Error messages shown

### Test 3.4: Filter Jobs by Status
**Steps:**
1. Click different status tabs
2. Observe job list changes

**Expected Result:**
- ✅ Jobs filtered correctly
- ✅ Empty state shown when no jobs

### Test 3.5: Job Card Click
**Steps:**
1. Click on a job card

**Expected Result:**
- ✅ Navigates to job details page (when implemented)

---

## Phase 4: Verifications Tests

### Test 4.1: View Pending Verifications
**Steps:**
1. Navigate to /dashboard/verifications

**Expected Result:**
- ✅ Pending submissions list loads
- ✅ Empty state shown if none
- ✅ Loading state shown while fetching

### Test 4.2: Review Submission
**Steps:**
1. Click "Review Submission" on a submission
2. View all details

**Expected Result:**
- ✅ Navigates to review page
- ✅ Job details displayed
- ✅ Worker details displayed
- ✅ Before/after photos shown
- ✅ Location displayed

### Test 4.3: Approve Submission (Positive)
**Steps:**
1. On review page, click "Approve"
2. Confirm action

**Expected Result:**
- ✅ Success toast appears
- ✅ Redirected to verifications list
- ✅ Submission removed from pending
- ✅ Payment created

### Test 4.4: Reject Submission (Positive)
**Steps:**
1. On review page, click "Reject"
2. Enter rejection reason
3. Submit

**Expected Result:**
- ✅ Rejection modal opens
- ✅ Success toast appears
- ✅ Redirected to verifications list
- ✅ Submission removed from pending

### Test 4.5: Reject Submission (Negative - No Reason)
**Steps:**
1. Click "Reject"
2. Leave reason empty
3. Try to submit

**Expected Result:**
- ✅ Error toast appears
- ✅ Rejection not submitted

---

## Phase 5: Payments Tests

### Test 5.1: View Pending Payments
**Steps:**
1. Navigate to /dashboard/payments

**Expected Result:**
- ✅ Pending payments list loads
- ✅ Empty state shown if none
- ✅ Payment details displayed correctly

### Test 5.2: Approve Payment (Positive)
**Steps:**
1. Click "Approve Payment" on a payment
2. Confirm action

**Expected Result:**
- ✅ Success toast appears
- ✅ Payment removed from pending list
- ✅ Dashboard stats updated

---

## Phase 6: Responsive Design Tests

### Test 6.1: Mobile View (< 768px)
**Steps:**
1. Resize browser to mobile width
2. Navigate through all pages

**Expected Result:**
- ✅ Sidebar collapses automatically
- ✅ All content readable
- ✅ Forms usable
- ✅ Cards stack vertically

### Test 6.2: Tablet View (768px - 1024px)
**Steps:**
1. Resize to tablet width
2. Test all pages

**Expected Result:**
- ✅ 2-column grid for cards
- ✅ Sidebar visible
- ✅ All features accessible

### Test 6.3: Desktop View (> 1024px)
**Steps:**
1. View on desktop
2. Test all pages

**Expected Result:**
- ✅ 3-column grid for cards
- ✅ Full sidebar visible
- ✅ Optimal spacing

---

## Phase 7: Error Handling Tests

### Test 7.1: API Error Handling
**Steps:**
1. Stop backend server
2. Try to load data

**Expected Result:**
- ✅ Error message displayed
- ✅ No app crash
- ✅ Retry option available

### Test 7.2: Network Timeout
**Steps:**
1. Simulate slow network
2. Observe loading states

**Expected Result:**
- ✅ Loading indicators shown
- ✅ Graceful timeout handling

### Test 7.3: Invalid Data
**Steps:**
1. Enter invalid data in forms
2. Try to submit

**Expected Result:**
- ✅ Validation catches errors
- ✅ Clear error messages

---

## Phase 8: Performance Tests

### Test 8.1: Page Load Time
**Steps:**
1. Measure initial load time
2. Measure navigation time

**Expected Result:**
- ✅ Initial load < 3 seconds
- ✅ Navigation < 1 second

### Test 8.2: Large Data Sets
**Steps:**
1. Load pages with many items
2. Test scrolling and filtering

**Expected Result:**
- ✅ Smooth scrolling
- ✅ No lag in filtering

---

## Test Summary Template

### Test Execution Log

| Test ID | Test Name | Status | Notes |
|---------|-----------|--------|-------|
| 1.1 | User Registration (Positive) | ⏳ | |
| 1.2 | Registration (Negative) | ⏳ | |
| 1.3 | User Login (Positive) | ⏳ | |
| 1.4 | Login (Negative) | ⏳ | |
| 1.5 | Protected Routes | ⏳ | |
| 1.6 | Session Persistence | ⏳ | |
| 1.7 | Logout | ⏳ | |
| 2.1 | Dashboard Stats | ⏳ | |
| 2.2 | Theme Toggle | ⏳ | |
| 2.3 | Sidebar Navigation | ⏳ | |
| 3.1 | View Jobs List | ⏳ | |
| 3.2 | Create Job (Positive) | ⏳ | |
| 3.3 | Create Job (Negative) | ⏳ | |
| 3.4 | Filter Jobs | ⏳ | |
| 4.1 | View Verifications | ⏳ | |
| 4.2 | Review Submission | ⏳ | |
| 4.3 | Approve Submission | ⏳ | |
| 4.4 | Reject Submission | ⏳ | |
| 5.1 | View Payments | ⏳ | |
| 5.2 | Approve Payment | ⏳ | |
| 6.1 | Mobile Responsive | ⏳ | |
| 6.2 | Tablet Responsive | ⏳ | |
| 6.3 | Desktop Responsive | ⏳ | |
| 7.1 | API Error Handling | ⏳ | |
| 7.2 | Network Timeout | ⏳ | |
| 8.1 | Page Load Time | ⏳ | |

**Legend:**
- ⏳ Pending
- ✅ Passed
- ❌ Failed
- ⚠️ Partial

---

## Bug Report Template

```
**Bug ID:** 
**Severity:** Critical / High / Medium / Low
**Test Case:** 
**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Result:**

**Actual Result:**

**Screenshots:**

**Environment:**
- Browser:
- OS:
- Screen Size:

**Additional Notes:**
```

---

## Testing Checklist

### Before Testing
- [ ] Backend is running
- [ ] Frontend is running
- [ ] Test user created
- [ ] Browser console open for errors

### During Testing
- [ ] Test all positive scenarios
- [ ] Test all negative scenarios
- [ ] Test edge cases
- [ ] Check console for errors
- [ ] Test on different browsers
- [ ] Test responsive design

### After Testing
- [ ] Document all bugs
- [ ] Update test status
- [ ] Create bug reports
- [ ] Verify fixes

---

**Last Updated:** November 9, 2024
**Tester:** [Your Name]
**Version:** 1.0.0
