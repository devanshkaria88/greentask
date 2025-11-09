# Popover Z-Index Fix

## Issue

The date picker popover in the Create Job Dialog was rendering behind the dialog modal, making it difficult to interact with the calendar.

## Root Cause

Both the Dialog component and Popover component were using the same z-index value (`z-50`), causing them to compete for layering priority. When a popover is opened inside a dialog, it needs a higher z-index to appear above the dialog content.

## Solution

Updated the z-index values for components that need to appear above dialogs:

### Changes Made

**File**: `/components/ui/popover.tsx`

- Changed PopoverContent z-index from `z-50` to `z-[100]`
- This ensures popovers always appear above dialog modals

**File**: `/components/ui/select.tsx`

- Changed SelectContent z-index from `z-50` to `z-[100]`
- This ensures select dropdowns also appear above dialog modals

## Z-Index Hierarchy

The updated z-index hierarchy is:

- **z-50**: Dialog overlay and content
- **z-[100]**: Popovers and Select dropdowns (appear above dialogs)

## Technical Notes

- Using `z-[100]` is the correct Tailwind CSS syntax for arbitrary z-index values
- Tailwind doesn't have a default `z-100` utility class
- The arbitrary value syntax `z-[100]` is required for custom z-index values

## Testing

To verify the fix:

1. Open the Create Job Dialog
2. Click on the "Pick a date" button for the deadline field
3. The calendar popover should now appear above the dialog
4. The calendar should be fully interactive and visible

## Date

November 9, 2025
