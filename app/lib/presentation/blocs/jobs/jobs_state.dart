import 'package:equatable/equatable.dart';
import '../../../data/models/job_model.dart';

abstract class JobsState extends Equatable {
  const JobsState();

  @override
  List<Object?> get props => [];
}

class JobsInitial extends JobsState {}

class JobsLoading extends JobsState {}

class JobsLoaded extends JobsState {
  final List<JobModel> jobs;
  final bool hasMore;

  const JobsLoaded(this.jobs, {this.hasMore = true});

  @override
  List<Object?> get props => [jobs, hasMore];
}

class JobsError extends JobsState {
  final String message;

  const JobsError(this.message);

  @override
  List<Object?> get props => [message];
}

class JobApplying extends JobsState {}

class JobApplied extends JobsState {
  final String applicationId;

  const JobApplied(this.applicationId);

  @override
  List<Object?> get props => [applicationId];
}
