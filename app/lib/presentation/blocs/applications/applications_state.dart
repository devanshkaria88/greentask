import 'package:equatable/equatable.dart';
import '../../../data/models/application_model.dart';

abstract class ApplicationsState extends Equatable {
  const ApplicationsState();

  @override
  List<Object?> get props => [];
}

class ApplicationsInitial extends ApplicationsState {}

class ApplicationsLoading extends ApplicationsState {}

class ApplicationsLoaded extends ApplicationsState {
  final List<ApplicationModel> applications;

  const ApplicationsLoaded(this.applications);

  @override
  List<Object?> get props => [applications];
}

class ApplicationsError extends ApplicationsState {
  final String message;

  const ApplicationsError(this.message);

  @override
  List<Object?> get props => [message];
}

class SubmissionSubmitting extends ApplicationsState {}

class SubmissionSubmitted extends ApplicationsState {
  final String submissionId;

  const SubmissionSubmitted(this.submissionId);

  @override
  List<Object?> get props => [submissionId];
}
