import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../../core/theme/app_theme.dart';
import '../../core/constants/app_constants.dart';
import '../../core/utils/date_utils.dart';
import '../../data/models/application_model.dart';

class ApplicationCard extends StatelessWidget {
  final ApplicationModel application;
  final bool showSubmitButton;
  final VoidCallback? onSubmitProof;

  const ApplicationCard({
    super.key,
    required this.application,
    this.showSubmitButton = false,
    this.onSubmitProof,
  });

  @override
  Widget build(BuildContext context) {
    final job = application.jobDetails;
    if (job == null) return const SizedBox();

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        job.title,
                        style: Theme.of(context).textTheme.titleLarge,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 8),
                      _buildStatusBadge(context),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 8,
                  ),
                  decoration: BoxDecoration(
                    color: AppTheme.accentOrange.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      const FaIcon(
                        FontAwesomeIcons.indianRupeeSign,
                        size: 14,
                        color: AppTheme.accentOrange,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        job.rewardAmount.toStringAsFixed(0),
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              color: AppTheme.accentOrange,
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                const Icon(
                  Icons.access_time,
                  size: 16,
                  color: AppTheme.textLight,
                ),
                const SizedBox(width: 4),
                Text(
                  'Applied ${AppDateUtils.timeAgo(application.appliedAt)}',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppTheme.textLight,
                      ),
                ),
              ],
            ),
            if (showSubmitButton && onSubmitProof != null) ...[
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: onSubmitProof,
                  icon: const Icon(Icons.upload_file, size: 20),
                  label: const Text('Submit Proof'),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildStatusBadge(BuildContext context) {
    Color color;
    String text;

    switch (application.status) {
      case AppConstants.statusPending:
        color = AppTheme.accentOrange;
        text = 'Pending';
        break;
      case AppConstants.statusAccepted:
        color = AppTheme.primaryGreen;
        text = 'Accepted';
        break;
      case AppConstants.statusRejected:
        color = AppTheme.warningRed;
        text = 'Rejected';
        break;
      default:
        color = AppTheme.textLight;
        text = application.status;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color),
      ),
      child: Text(
        text,
        style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: color,
              fontWeight: FontWeight.w600,
            ),
      ),
    );
  }
}
