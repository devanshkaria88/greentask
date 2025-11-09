import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:image_picker/image_picker.dart';
import 'package:geolocator/geolocator.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/di/injection.dart';
import '../../../core/services/location_service.dart';
import '../../../data/models/job_model.dart';
import '../../widgets/dialogs/location_permission_dialog.dart';
import '../../blocs/applications/applications_cubit.dart';
import '../../blocs/applications/applications_state.dart';

class SubmitProofScreen extends StatefulWidget {
  final JobModel job;

  const SubmitProofScreen({super.key, required this.job});

  @override
  State<SubmitProofScreen> createState() => _SubmitProofScreenState();
}

class _SubmitProofScreenState extends State<SubmitProofScreen> {
  final _notesController = TextEditingController();
  final _imagePicker = ImagePicker();
  
  XFile? _beforePhoto;
  XFile? _afterPhoto;
  Position? _currentPosition;
  bool _isLoadingLocation = false;

  @override
  void initState() {
    super.initState();
    _getCurrentLocation();
  }

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _getCurrentLocation() async {
    setState(() {
      _isLoadingLocation = true;
    });

    try {
      final locationService = getIt<LocationService>();
      
      // Request location with dialogs
      final result = await LocationPermissionDialog.requestLocationWithDialogs(
        context,
        locationService,
        customMessage: 'GreenTask needs your location to verify that you completed the task at the correct location.',
      );

      if (result.isSuccess && result.position != null) {
        setState(() {
          _currentPosition = result.position;
        });
      } else if (result.errorMessage != null) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Location required: ${result.errorMessage}'),
              backgroundColor: AppTheme.warningRed,
              duration: const Duration(seconds: 4),
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error getting location: $e'),
            backgroundColor: AppTheme.warningRed,
          ),
        );
      }
    } finally {
      setState(() {
        _isLoadingLocation = false;
      });
    }
  }

  Future<void> _pickImage(bool isBefore) async {
    try {
      final XFile? image = await _imagePicker.pickImage(
        source: ImageSource.camera,
        maxWidth: 1920,
        maxHeight: 1080,
        imageQuality: 85,
      );

      if (image != null) {
        setState(() {
          if (isBefore) {
            _beforePhoto = image;
          } else {
            _afterPhoto = image;
          }
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error picking image: $e'),
            backgroundColor: AppTheme.warningRed,
          ),
        );
      }
    }
  }

  Future<void> _submitProof() async {
    if (_beforePhoto == null || _afterPhoto == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please upload both before and after photos'),
          backgroundColor: AppTheme.warningRed,
        ),
      );
      return;
    }

    context.read<ApplicationsCubit>().submitProof(
          jobId: widget.job.id,
          beforePhoto: _beforePhoto!,
          afterPhoto: _afterPhoto!,
          notes: _notesController.text.trim().isEmpty
              ? null
              : _notesController.text.trim(),
          lat: _currentPosition?.latitude,
          lng: _currentPosition?.longitude,
        );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Submit Proof'),
      ),
      body: BlocListener<ApplicationsCubit, ApplicationsState>(
        listener: (context, state) {
          if (state is SubmissionSubmitted) {
            Navigator.pop(context);
          }
        },
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Job Title
              Text(
                widget.job.title,
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              const SizedBox(height: 8),
              Text(
                'Upload before and after photos to complete this job',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: AppTheme.textLight,
                    ),
              ),
              const SizedBox(height: 32),
              // Before Photo
              Text(
                'Before Photo',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 8),
              _buildPhotoUpload(true),
              const SizedBox(height: 24),
              // After Photo
              Text(
                'After Photo',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 8),
              _buildPhotoUpload(false),
              const SizedBox(height: 24),
              // Notes
              TextField(
                controller: _notesController,
                maxLines: 4,
                decoration: const InputDecoration(
                  labelText: 'Notes (Optional)',
                  hintText: 'Add any additional information...',
                ),
              ),
              const SizedBox(height: 16),
              // Location indicator
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.paleGreen.withOpacity(0.3),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    Icon(
                      _isLoadingLocation
                          ? Icons.location_searching
                          : Icons.location_on,
                      color: AppTheme.primaryGreen,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        _isLoadingLocation
                            ? 'Getting location...'
                            : _currentPosition != null
                                ? 'Location captured'
                                : 'Location not available',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: AppTheme.darkGreen,
                            ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),
              // Submit Button
              BlocBuilder<ApplicationsCubit, ApplicationsState>(
                builder: (context, state) {
                  final isSubmitting = state is SubmissionSubmitting;

                  return ElevatedButton(
                    onPressed: isSubmitting ? null : _submitProof,
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                    child: isSubmitting
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor:
                                  AlwaysStoppedAnimation<Color>(Colors.white),
                            ),
                          )
                        : const Text('Submit for Verification'),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPhotoUpload(bool isBefore) {
    final photo = isBefore ? _beforePhoto : _afterPhoto;

    return GestureDetector(
      onTap: () => _pickImage(isBefore),
      child: Container(
        height: 200,
        decoration: BoxDecoration(
          color: AppTheme.backgroundLight,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: AppTheme.dividerColor,
            width: 2,
          ),
        ),
        child: photo != null
            ? ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Image.file(
                  File(photo.path),
                  fit: BoxFit.cover,
                ),
              )
            : Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(
                    Icons.camera_alt_outlined,
                    size: 48,
                    color: AppTheme.textLight,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Tap to ${isBefore ? "take before" : "take after"} photo',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: AppTheme.textLight,
                        ),
                  ),
                ],
              ),
      ),
    );
  }
}
