import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../data/repositories/notification_repository.dart';
import '../../../core/utils/logger.dart';
import 'notifications_state.dart';

class NotificationsCubit extends Cubit<NotificationsState> {
  final NotificationRepository _notificationRepository;

  NotificationsCubit(this._notificationRepository)
      : super(NotificationsInitial());

  Future<void> loadNotifications() async {
    try {
      emit(NotificationsLoading());

      final notifications =
          await _notificationRepository.getMyNotifications();

      emit(NotificationsLoaded(notifications));
    } catch (e) {
      AppLogger.error('Error loading notifications', e);
      emit(NotificationsError(e.toString()));
    }
  }

  Future<void> markAsRead(String notificationId) async {
    try {
      await _notificationRepository.markAsRead(notificationId);
      
      // Reload notifications
      await loadNotifications();
    } catch (e) {
      AppLogger.error('Error marking notification as read', e);
    }
  }
}
