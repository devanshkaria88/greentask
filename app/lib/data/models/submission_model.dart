import 'package:equatable/equatable.dart';

class SubmissionModel extends Equatable {
  final String submissionId;
  final String jobId;
  final String workerId;
  final String beforePhoto;
  final String afterPhoto;
  final String? notes;
  final double? lat;
  final double? lng;
  final String verificationStatus;
  final String? rejectionReason;
  final DateTime createdAt;
  final DateTime? verifiedAt;

  const SubmissionModel({
    required this.submissionId,
    required this.jobId,
    required this.workerId,
    required this.beforePhoto,
    required this.afterPhoto,
    this.notes,
    this.lat,
    this.lng,
    required this.verificationStatus,
    this.rejectionReason,
    required this.createdAt,
    this.verifiedAt,
  });

  factory SubmissionModel.fromJson(Map<String, dynamic> json) {
    return SubmissionModel(
      submissionId: json['submission_id'] as String,
      jobId: json['job_id'] as String,
      workerId: json['worker_id'] as String,
      beforePhoto: json['before_photo'] as String,
      afterPhoto: json['after_photo'] as String,
      notes: json['notes'] as String?,
      lat: json['lat'] != null ? (json['lat'] as num).toDouble() : null,
      lng: json['lng'] != null ? (json['lng'] as num).toDouble() : null,
      verificationStatus: json['verification_status'] as String,
      rejectionReason: json['rejection_reason'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
      verifiedAt: json['verified_at'] != null
          ? DateTime.parse(json['verified_at'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'submission_id': submissionId,
      'job_id': jobId,
      'worker_id': workerId,
      'before_photo': beforePhoto,
      'after_photo': afterPhoto,
      'notes': notes,
      'lat': lat,
      'lng': lng,
      'verification_status': verificationStatus,
      'rejection_reason': rejectionReason,
      'created_at': createdAt.toIso8601String(),
      'verified_at': verifiedAt?.toIso8601String(),
    };
  }

  @override
  List<Object?> get props => [
        submissionId,
        jobId,
        workerId,
        beforePhoto,
        afterPhoto,
        notes,
        lat,
        lng,
        verificationStatus,
        rejectionReason,
        createdAt,
        verifiedAt,
      ];
}
