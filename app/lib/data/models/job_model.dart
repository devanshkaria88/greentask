import 'package:equatable/equatable.dart';

class JobModel extends Equatable {
  final String id;
  final String title;
  final String description;
  final String category;
  final String location;
  final double lat;
  final double lng;
  final double rewardAmount;
  final DateTime deadline;
  final String status;
  final String? proofRequirements;
  final String? assignedTo;
  final String createdBy;
  final DateTime createdAt;
  final DateTime? updatedAt;
  final double? distanceKm;

  const JobModel({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.location,
    required this.lat,
    required this.lng,
    required this.rewardAmount,
    required this.deadline,
    required this.status,
    this.proofRequirements,
    this.assignedTo,
    required this.createdBy,
    required this.createdAt,
    this.updatedAt,
    this.distanceKm,
  });

  factory JobModel.fromJson(Map<String, dynamic> json) {
    return JobModel(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String? ?? '',
      category: json['category'] as String,
      location: json['location'] as String? ?? '',
      lat: json['lat'] != null ? (json['lat'] as num).toDouble() : 0.0,
      lng: json['lng'] != null ? (json['lng'] as num).toDouble() : 0.0,
      rewardAmount: json['reward_amount'] != null 
          ? (json['reward_amount'] as num).toDouble() 
          : 0.0,
      deadline: DateTime.parse(json['deadline'] as String),
      status: json['status'] as String? ?? 'open',
      proofRequirements: json['proof_requirements'] as String?,
      assignedTo: json['assigned_to'] as String?,
      createdBy: json['created_by'] as String? ?? '',
      createdAt: json['created_at'] != null 
          ? DateTime.parse(json['created_at'] as String)
          : DateTime.now(),
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'] as String)
          : null,
      distanceKm: json['distance_km'] != null
          ? (json['distance_km'] as num).toDouble()
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'category': category,
      'location': location,
      'lat': lat,
      'lng': lng,
      'reward_amount': rewardAmount,
      'deadline': deadline.toIso8601String(),
      'status': status,
      'proof_requirements': proofRequirements,
      'assigned_to': assignedTo,
      'created_by': createdBy,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
      'distance_km': distanceKm,
    };
  }

  @override
  List<Object?> get props => [
        id,
        title,
        description,
        category,
        location,
        lat,
        lng,
        rewardAmount,
        deadline,
        status,
        proofRequirements,
        assignedTo,
        createdBy,
        createdAt,
        updatedAt,
        distanceKm,
      ];
}
