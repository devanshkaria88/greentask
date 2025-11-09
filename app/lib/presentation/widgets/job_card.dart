import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../../core/theme/app_theme.dart';
import '../../core/constants/app_constants.dart';
import '../../core/utils/date_utils.dart';
import '../../data/models/job_model.dart';

class JobCard extends StatelessWidget {
  final JobModel job;
  final VoidCallback onTap;

  const JobCard({
    super.key,
    required this.job,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Title and Category
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
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: AppTheme.paleGreen,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            AppConstants.categoryLabels[job.category] ??
                                job.category,
                            style: Theme.of(context)
                                .textTheme
                                .bodySmall
                                ?.copyWith(
                                  color: AppTheme.darkGreen,
                                  fontWeight: FontWeight.w600,
                                ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  // Reward Amount
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: AppTheme.accentOrange.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: AppTheme.accentOrange,
                        width: 1.5,
                      ),
                    ),
                    child: Column(
                      children: [
                        const FaIcon(
                          FontAwesomeIcons.indianRupeeSign,
                          size: 16,
                          color: AppTheme.accentOrange,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          job.rewardAmount.toStringAsFixed(0),
                          style:
                              Theme.of(context).textTheme.titleMedium?.copyWith(
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
              // Location
              Row(
                children: [
                  const Icon(
                    Icons.location_on_outlined,
                    size: 16,
                    color: AppTheme.textLight,
                  ),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      job.location,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: AppTheme.textLight,
                          ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  if (job.distanceKm != null) ...[
                    const SizedBox(width: 8),
                    Text(
                      '${job.distanceKm!.toStringAsFixed(1)} km',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: AppTheme.textLight,
                            fontWeight: FontWeight.w600,
                          ),
                    ),
                  ],
                ],
              ),
              const SizedBox(height: 8),
              // Deadline
              Row(
                children: [
                  const Icon(
                    Icons.access_time,
                    size: 16,
                    color: AppTheme.textLight,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    AppDateUtils.formatDeadline(job.deadline),
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: _getDeadlineColor(job.deadline),
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              // Apply Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: onTap,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                  child: const Text('View Details'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Color _getDeadlineColor(DateTime deadline) {
    final daysLeft = deadline.difference(DateTime.now()).inDays;
    if (daysLeft < 2) {
      return AppTheme.warningRed;
    } else if (daysLeft < 7) {
      return AppTheme.accentOrange;
    }
    return AppTheme.textLight;
  }
}
