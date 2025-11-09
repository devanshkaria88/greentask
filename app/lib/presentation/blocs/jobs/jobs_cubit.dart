import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../data/models/job_model.dart';
import '../../../data/repositories/job_repository.dart';
import '../../../core/utils/logger.dart';
import '../../../core/constants/app_constants.dart';
import 'jobs_state.dart';

class JobsCubit extends Cubit<JobsState> {
  final JobRepository _jobRepository;

  List<JobModel> _currentJobs = [];
  int _currentPage = 1;
  String? _currentCategory;
  double? _currentLat;
  double? _currentLng;

  JobsCubit(this._jobRepository) : super(JobsInitial());

  Future<void> discoverJobs({
    required double lat,
    required double lng,
    double? radius,
    String? category,
    bool refresh = false,
  }) async {
    try {
      if (refresh) {
        _currentPage = 1;
        _currentJobs = [];
        emit(JobsLoading());
      }

      _currentLat = lat;
      _currentLng = lng;
      _currentCategory = category;

      final jobs = await _jobRepository.discoverJobs(
        lat: lat,
        lng: lng,
        radius: radius ?? AppConstants.defaultSearchRadiusKm,
        category: category,
        page: _currentPage,
      );

      if (refresh) {
        _currentJobs = jobs;
      } else {
        _currentJobs.addAll(jobs);
      }

      emit(JobsLoaded(
        _currentJobs,
        hasMore: jobs.length >= AppConstants.defaultPageSize,
      ));
    } catch (e) {
      AppLogger.error('Error discovering jobs', e);
      emit(JobsError(e.toString()));
    }
  }

  Future<void> loadMore() async {
    if (_currentLat == null || _currentLng == null) return;

    _currentPage++;
    await discoverJobs(
      lat: _currentLat!,
      lng: _currentLng!,
      category: _currentCategory,
      refresh: false,
    );
  }

  Future<void> applyForJob({
    required String jobId,
    String? message,
  }) async {
    try {
      emit(JobApplying());

      final applicationId = await _jobRepository.applyForJob(
        jobId: jobId,
        message: message,
      );

      emit(JobApplied(applicationId));

      // Reload jobs after applying
      if (_currentLat != null && _currentLng != null) {
        await discoverJobs(
          lat: _currentLat!,
          lng: _currentLng!,
          category: _currentCategory,
          refresh: true,
        );
      }
    } catch (e) {
      AppLogger.error('Error applying for job', e);
      emit(JobsError(e.toString()));
    }
  }
}
