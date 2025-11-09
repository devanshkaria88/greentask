import '../../core/network/api_client.dart';
import '../../core/constants/app_constants.dart';
import '../models/notification_model.dart';

class NotificationRepository {
  final ApiClient _apiClient;

  NotificationRepository(this._apiClient);

  Future<List<NotificationModel>> getMyNotifications() async {
    final response = await _apiClient.get(
      AppConstants.notificationsEndpoint,
    );

    final notifications = (response.data['data']['notifications'] as List)
        .map((json) => NotificationModel.fromJson(json))
        .toList();

    return notifications;
  }

  Future<void> markAsRead(String notificationId) async {
    final endpoint = AppConstants.notificationsReadEndpoint
        .replaceAll('{id}', notificationId);
    
    await _apiClient.patch(endpoint);
  }
}
