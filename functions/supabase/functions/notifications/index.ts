/**
 * Notifications API
 * 
 * Endpoints:
 * - POST /notifications/send - Send notification
 * - GET /notifications/my-notifications - Get user's notifications
 * - PATCH /notifications/:id/read - Mark notification as read
 */

import { 
  requireAuth,
  handleCors, 
  errorResponse, 
  successResponse,
} from '../_shared/middleware.ts';
import { isValidUUID } from '../_shared/validation.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const method = req.method;
    const lastPart = pathParts[pathParts.length - 1];

    // POST /notifications/send
    if (method === 'POST' && lastPart === 'send') {
      return await sendNotification(req);
    }

    // GET /notifications/my-notifications
    if (method === 'GET' && lastPart === 'my-notifications') {
      return await getMyNotifications(req);
    }

    // PATCH /notifications/:id/read
    if (method === 'PATCH' && pathParts.length >= 3 && lastPart === 'read') {
      const notificationId = pathParts[pathParts.length - 2];
      return await markAsRead(req, notificationId);
    }

    return errorResponse('Endpoint not found', 404);
  } catch (error) {
    console.error('Error:', error);
    return errorResponse('Internal server error', 500);
  }
});

/**
 * Send notification to a user
 */
async function sendNotification(req: Request): Promise<Response> {
  const authResult = await requireAuth(req);
  if (!authResult.authorized) {
    return authResult.response!;
  }

  const { supabase } = authResult;

  try {
    const body = await req.json();
    const { user_id, title, message, type } = body;

    // Validate required fields
    if (!user_id || !isValidUUID(user_id)) {
      return errorResponse('Valid user_id is required');
    }

    if (!title || title.trim().length === 0) {
      return errorResponse('Title is required');
    }

    if (!message || message.trim().length === 0) {
      return errorResponse('Message is required');
    }

    if (!type || type.trim().length === 0) {
      return errorResponse('Type is required');
    }

    // Create notification
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id,
        title: title.trim(),
        message: message.trim(),
        type: type.trim(),
        read: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Send notification error:', error);
      return errorResponse(error.message);
    }

    return successResponse({ success: true, notification_id: data.id }, 'Notification sent successfully');
  } catch (error) {
    console.error('Send notification error:', error);
    return errorResponse('Failed to send notification', 500);
  }
}

/**
 * Get user's notifications
 */
async function getMyNotifications(req: Request): Promise<Response> {
  const authResult = await requireAuth(req);
  if (!authResult.authorized) {
    return authResult.response!;
  }

  const { user, supabase } = authResult;

  try {
    // Get all notifications for this user
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get notifications error:', error);
      return errorResponse(error.message);
    }

    // Format response
    const notifications = (data || []).map((n: any) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      read: n.read,
      created_at: n.created_at,
    }));

    return successResponse({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    return errorResponse('Failed to fetch notifications', 500);
  }
}

/**
 * Mark notification as read
 */
async function markAsRead(req: Request, notificationId: string): Promise<Response> {
  if (!isValidUUID(notificationId)) {
    return errorResponse('Invalid notification ID format');
  }

  const authResult = await requireAuth(req);
  if (!authResult.authorized) {
    return authResult.response!;
  }

  const { user, supabase } = authResult;

  try {
    // Check if notification belongs to user
    const { data: notification, error: notifError } = await supabase
      .from('notifications')
      .select('user_id')
      .eq('id', notificationId)
      .single();

    if (notifError || !notification) {
      return errorResponse('Notification not found', 404);
    }

    if (notification.user_id !== user.id) {
      return errorResponse('You can only mark your own notifications as read', 403);
    }

    // Update notification
    const { error: updateError } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (updateError) {
      console.error('Mark as read error:', updateError);
      return errorResponse(updateError.message);
    }

    return successResponse({ success: true }, 'Notification marked as read');
  } catch (error) {
    console.error('Mark as read error:', error);
    return errorResponse('Failed to mark notification as read', 500);
  }
}
