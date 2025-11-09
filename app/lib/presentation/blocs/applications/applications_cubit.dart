import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:image_picker/image_picker.dart';
import '../../../data/repositories/job_repository.dart';
import '../../../data/repositories/submission_repository.dart';
import '../../../core/utils/logger.dart';
import 'applications_state.dart';

class ApplicationsCubit extends Cubit<ApplicationsState> {
  final JobRepository _jobRepository;
  final SubmissionRepository _submissionRepository;

  ApplicationsCubit(this._jobRepository, this._submissionRepository)
      : super(ApplicationsInitial());

  Future<void> loadMyApplications({String? filter}) async {
    try {
      emit(ApplicationsLoading());

      final applications = await _jobRepository.getMyApplications(
        filter: filter,
      );

      emit(ApplicationsLoaded(applications));
    } catch (e) {
      AppLogger.error('Error loading applications', e);
      emit(ApplicationsError(e.toString()));
    }
  }

  Future<void> submitProof({
    required String jobId,
    required XFile beforePhoto,
    required XFile afterPhoto,
    String? notes,
    double? lat,
    double? lng,
  }) async {
    try {
      emit(SubmissionSubmitting());

      final submissionId = await _submissionRepository.createSubmission(
        jobId: jobId,
        beforePhoto: beforePhoto,
        afterPhoto: afterPhoto,
        notes: notes,
        lat: lat,
        lng: lng,
      );

      emit(SubmissionSubmitted(submissionId));
      
      // Reload applications
      await loadMyApplications();
    } catch (e) {
      AppLogger.error('Error submitting proof', e);
      emit(ApplicationsError(e.toString()));
    }
  }
}
