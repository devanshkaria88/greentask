import 'package:image_picker/image_picker.dart';
import '../../core/network/api_client.dart';
import '../../core/constants/app_constants.dart';
import '../models/submission_model.dart';

class SubmissionRepository {
  final ApiClient _apiClient;

  SubmissionRepository(this._apiClient);

  Future<String> createSubmission({
    required String jobId,
    required XFile beforePhoto,
    required XFile afterPhoto,
    String? notes,
    double? lat,
    double? lng,
  }) async {
    final response = await _apiClient.postMultipart(
      AppConstants.submissionsCreateEndpoint,
      filePaths: {
        'before_photo': beforePhoto.path,
        'after_photo': afterPhoto.path,
      },
      data: {
        'job_id': jobId,
        if (notes != null) 'notes': notes,
        if (lat != null) 'lat': lat.toString(),
        if (lng != null) 'lng': lng.toString(),
      },
    );

    return response.data['data']['submission_id'] as String;
  }

  Future<SubmissionModel> getSubmissionDetails(String submissionId) async {
    final response = await _apiClient.get('/submissions/$submissionId');
    return SubmissionModel.fromJson(
      response.data['data']['submission_details'],
    );
  }
}
