import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/date_utils.dart';
import '../../blocs/notifications/notifications_cubit.dart';
import '../../blocs/notifications/notifications_state.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  @override
  void initState() {
    super.initState();
    _loadNotifications();
  }

  void _loadNotifications() {
    context.read<NotificationsCubit>().loadNotifications();
  }

  IconData _getNotificationIcon(String type) {
    switch (type) {
      case 'application_update':
        return FontAwesomeIcons.briefcase;
      case 'payment':
        return FontAwesomeIcons.indianRupeeSign;
      case 'job_update':
        return FontAwesomeIcons.circleInfo;
      default:
        return FontAwesomeIcons.bell;
    }
  }

  Color _getNotificationColor(String type) {
    switch (type) {
      case 'application_update':
        return AppTheme.primaryGreen;
      case 'payment':
        return AppTheme.accentOrange;
      case 'job_update':
        return AppTheme.infoBlue;
      default:
        return AppTheme.textLight;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
      ),
      body: BlocBuilder<NotificationsCubit, NotificationsState>(
        builder: (context, state) {
          if (state is NotificationsLoading) {
            return const Center(child: CircularProgressIndicator());
          } else if (state is NotificationsLoaded) {
            if (state.notifications.isEmpty) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const FaIcon(
                      FontAwesomeIcons.bell,
                      size: 64,
                      color: AppTheme.textLight,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'No notifications',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'You\'re all caught up!',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: AppTheme.textLight,
                          ),
                    ),
                  ],
                ),
              );
            }

            return RefreshIndicator(
              onRefresh: () async {
                _loadNotifications();
              },
              child: ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: state.notifications.length,
                itemBuilder: (context, index) {
                  final notification = state.notifications[index];
                  final color = _getNotificationColor(notification.type);

                  return Card(
                    margin: const EdgeInsets.only(bottom: 12),
                    color: notification.read
                        ? AppTheme.cardBackground
                        : AppTheme.paleGreen.withOpacity(0.1),
                    child: InkWell(
                      onTap: () {
                        if (!notification.read) {
                          context
                              .read<NotificationsCubit>()
                              .markAsRead(notification.id);
                        }
                      },
                      borderRadius: BorderRadius.circular(12),
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              width: 48,
                              height: 48,
                              decoration: BoxDecoration(
                                color: color.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Center(
                                child: FaIcon(
                                  _getNotificationIcon(notification.type),
                                  color: color,
                                  size: 20,
                                ),
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Expanded(
                                        child: Text(
                                          notification.title,
                                          style: Theme.of(context)
                                              .textTheme
                                              .titleMedium
                                              ?.copyWith(
                                                fontWeight: notification.read
                                                    ? FontWeight.normal
                                                    : FontWeight.bold,
                                              ),
                                        ),
                                      ),
                                      if (!notification.read)
                                        Container(
                                          width: 8,
                                          height: 8,
                                          decoration: const BoxDecoration(
                                            color: AppTheme.primaryGreen,
                                            shape: BoxShape.circle,
                                          ),
                                        ),
                                    ],
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    notification.message,
                                    style: Theme.of(context)
                                        .textTheme
                                        .bodyMedium
                                        ?.copyWith(
                                          color: AppTheme.textMedium,
                                        ),
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    AppDateUtils.timeAgo(
                                        notification.createdAt),
                                    style: Theme.of(context)
                                        .textTheme
                                        .bodySmall
                                        ?.copyWith(
                                          color: AppTheme.textLight,
                                        ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                },
              ),
            );
          } else if (state is NotificationsError) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(
                    Icons.error_outline,
                    size: 64,
                    color: AppTheme.warningRed,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Error loading notifications',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    state.message,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: AppTheme.textLight,
                        ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: _loadNotifications,
                    child: const Text('Retry'),
                  ),
                ],
              ),
            );
          }

          return const Center(child: Text('Notifications'));
        },
      ),
    );
  }
}
