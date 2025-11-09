import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/utils/date_utils.dart';
import '../../../data/models/job_model.dart';
import '../../blocs/jobs/jobs_cubit.dart';
import '../../blocs/jobs/jobs_state.dart';

class JobDetailsScreen extends StatefulWidget {
  final JobModel job;

  const JobDetailsScreen({super.key, required this.job});

  @override
  State<JobDetailsScreen> createState() => _JobDetailsScreenState();
}

class _JobDetailsScreenState extends State<JobDetailsScreen> {
  final _messageController = TextEditingController();

  @override
  void dispose() {
    _messageController.dispose();
    super.dispose();
  }

  void _openInMaps() async {
    final url = Uri.parse(
      'https://www.google.com/maps/search/?api=1&query=${widget.job.lat},${widget.job.lng}',
    );
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    }
  }

  void _applyForJob() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Apply for Job'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Are you sure you want to apply for this job?',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _messageController,
              maxLines: 3,
              decoration: const InputDecoration(
                labelText: 'Message (Optional)',
                hintText: 'Tell us why you\'re interested...',
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              context.read<JobsCubit>().applyForJob(
                    jobId: widget.job.id,
                    message: _messageController.text.trim().isEmpty
                        ? null
                        : _messageController.text.trim(),
                  );
            },
            child: const Text('Apply'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Job Details'),
      ),
      body: BlocListener<JobsCubit, JobsState>(
        listener: (context, state) {
          if (state is JobApplied) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Application submitted successfully!'),
                backgroundColor: AppTheme.primaryGreen,
              ),
            );
            Navigator.pop(context);
          } else if (state is JobsError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: AppTheme.warningRed,
              ),
            );
          }
        },
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Header Card
              Container(
                color: AppTheme.primaryGreen,
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.job.title,
                      style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            AppConstants.categoryLabels[widget.job.category] ??
                                widget.job.category,
                            style: Theme.of(context)
                                .textTheme
                                .bodySmall
                                ?.copyWith(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w600,
                                ),
                          ),
                        ),
                        const Spacer(),
                        const FaIcon(
                          FontAwesomeIcons.indianRupeeSign,
                          size: 20,
                          color: Colors.white,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          widget.job.rewardAmount.toStringAsFixed(0),
                          style:
                              Theme.of(context).textTheme.headlineMedium?.copyWith(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                  ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              // Details
              Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Description
                    Text(
                      'Description',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      widget.job.description,
                      style: Theme.of(context).textTheme.bodyLarge,
                    ),
                    const SizedBox(height: 24),
                    // Location
                    _buildInfoRow(
                      context,
                      icon: Icons.location_on_outlined,
                      label: 'Location',
                      value: widget.job.location,
                      trailing: IconButton(
                        icon: const Icon(Icons.map_outlined),
                        onPressed: _openInMaps,
                        color: AppTheme.primaryGreen,
                      ),
                    ),
                    const SizedBox(height: 16),
                    // Deadline
                    _buildInfoRow(
                      context,
                      icon: Icons.access_time,
                      label: 'Deadline',
                      value: AppDateUtils.formatDate(widget.job.deadline),
                    ),
                    const SizedBox(height: 16),
                    // Distance
                    if (widget.job.distanceKm != null)
                      _buildInfoRow(
                        context,
                        icon: Icons.directions_outlined,
                        label: 'Distance',
                        value: '${widget.job.distanceKm!.toStringAsFixed(1)} km away',
                      ),
                    if (widget.job.distanceKm != null) const SizedBox(height: 24),
                    // Proof Requirements
                    if (widget.job.proofRequirements != null) ...[
                      Text(
                        'Proof Requirements',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppTheme.paleGreen.withOpacity(0.3),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: AppTheme.paleGreen,
                          ),
                        ),
                        child: Row(
                          children: [
                            const Icon(
                              Icons.info_outline,
                              color: AppTheme.darkGreen,
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                widget.job.proofRequirements!,
                                style: Theme.of(context)
                                    .textTheme
                                    .bodyMedium
                                    ?.copyWith(
                                      color: AppTheme.darkGreen,
                                    ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: BlocBuilder<JobsCubit, JobsState>(
            builder: (context, state) {
              final isApplying = state is JobApplying;
              
              return ElevatedButton(
                onPressed: isApplying ? null : _applyForJob,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: isApplying
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor:
                              AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
                      )
                    : const Text('Apply for This Job'),
              );
            },
          ),
        ),
      ),
    );
  }

  Widget _buildInfoRow(
    BuildContext context, {
    required IconData icon,
    required String label,
    required String value,
    Widget? trailing,
  }) {
    return Row(
      children: [
        Icon(icon, color: AppTheme.primaryGreen),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: AppTheme.textLight,
                    ),
              ),
              Text(
                value,
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
              ),
            ],
          ),
        ),
        if (trailing != null) trailing,
      ],
    );
  }
}
