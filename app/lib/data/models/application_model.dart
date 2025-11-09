import 'package:equatable/equatable.dart';
import 'job_model.dart';

class ApplicationModel extends Equatable {
  final String applicationId;
  final String jobId;
  final String workerId;
  final String status;
  final String? message;
  final DateTime appliedAt;
  final DateTime? respondedAt;
  final JobModel? jobDetails;

  const ApplicationModel({
    required this.applicationId,
    required this.jobId,
    required this.workerId,
    required this.status,
    this.message,
    required this.appliedAt,
    this.respondedAt,
    this.jobDetails,
  });

  factory ApplicationModel.fromJson(Map<String, dynamic> json) {
    return ApplicationModel(
      applicationId: json['application_id'] as String? ?? '',
      jobId: json['job_id'] as String? ?? '',
      workerId: json['worker_id'] as String? ?? '',
      status: json['status'] as String? ?? 'pending',
      message: json['message'] as String?,
      appliedAt: json['applied_at'] != null 
          ? DateTime.parse(json['applied_at'] as String)
          : DateTime.now(),
      respondedAt: json['responded_at'] != null
          ? DateTime.parse(json['responded_at'] as String)
          : null,
      jobDetails: json['job_details'] != null
          ? JobModel.fromJson(json['job_details'] as Map<String, dynamic>)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'application_id': applicationId,
      'job_id': jobId,
      'worker_id': workerId,
      'status': status,
      'message': message,
      'applied_at': appliedAt.toIso8601String(),
      'responded_at': respondedAt?.toIso8601String(),
      'job_details': jobDetails?.toJson(),
    };
  }

  @override
  List<Object?> get props => [
        applicationId,
        jobId,
        workerId,
        status,
        message,
        appliedAt,
        respondedAt,
        jobDetails,
      ];
}
