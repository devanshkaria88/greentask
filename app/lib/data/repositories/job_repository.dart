import '../../core/network/api_client.dart';
import '../../core/constants/app_constants.dart';
import '../models/job_model.dart';
import '../models/application_model.dart';

class JobRepository {
  final ApiClient _apiClient;

  JobRepository(this._apiClient);

  Future<List<JobModel>> discoverJobs({
    required double lat,
    required double lng,
    double? radius,
    String? category,
    int page = 1,
    int limit = AppConstants.defaultPageSize,
  }) async {
    final response = await _apiClient.get(
      AppConstants.jobsDiscoverEndpoint,
      queryParameters: {
        'lat': lat,
        'lng': lng,
        if (radius != null) 'radius': radius,
        if (category != null) 'category': category,
        'page': page,
        'limit': limit,
      },
    );

    final jobs = (response.data['jobs'] as List)
        .map((json) => JobModel.fromJson(json))
        .toList();

    return jobs;
  }

  Future<List<ApplicationModel>> getMyApplications({
    String? filter,
    int page = 1,
    int limit = AppConstants.defaultPageSize,
  }) async {
    final response = await _apiClient.get(
      AppConstants.jobsMyApplicationsEndpoint,
      queryParameters: {
        if (filter != null) 'filter': filter,
        'page': page,
        'limit': limit,
      },
    );

    final applications = (response.data['applications'] as List)
        .map((json) => ApplicationModel.fromJson(json))
        .toList();

    return applications;
  }

  Future<String> applyForJob({
    required String jobId,
    String? message,
  }) async {
    final endpoint = AppConstants.jobsApplyEndpoint.replaceAll('{id}', jobId);
    
    final response = await _apiClient.post(
      endpoint,
      data: {
        if (message != null) 'message': message,
      },
    );

    return response.data['data']['application_id'] as String;
  }

  Future<JobModel> getJobDetails(String jobId) async {
    // Note: This endpoint might need to be added to the API
    final response = await _apiClient.get('/jobs/$jobId');
    return JobModel.fromJson(response.data['data']);
  }
}
