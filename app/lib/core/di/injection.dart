import 'package:get_it/get_it.dart';
import '../network/api_client.dart';
import '../storage/secure_storage.dart';
import '../storage/local_storage.dart';
import '../navigation/navigation_service.dart';
import '../services/location_service.dart';
import '../../data/repositories/auth_repository.dart';
import '../../data/repositories/job_repository.dart';
import '../../data/repositories/submission_repository.dart';
import '../../data/repositories/payment_repository.dart';
import '../../data/repositories/notification_repository.dart';
import '../../presentation/blocs/auth/auth_cubit.dart';
import '../../presentation/blocs/jobs/jobs_cubit.dart';
import '../../presentation/blocs/applications/applications_cubit.dart';
import '../../presentation/blocs/wallet/wallet_cubit.dart';
import '../../presentation/blocs/notifications/notifications_cubit.dart';

final getIt = GetIt.instance;

Future<void> setupDependencies() async {
  // Navigation
  getIt.registerLazySingleton<NavigationService>(() => NavigationService());

  // Services
  getIt.registerLazySingleton<LocationService>(() => LocationService());

  // Storage
  getIt.registerLazySingleton<SecureStorage>(() => SecureStorage());
  
  final localStorage = LocalStorage();
  await localStorage.init();
  getIt.registerLazySingleton<LocalStorage>(() => localStorage);

  // Network
  getIt.registerLazySingleton<ApiClient>(
    () => ApiClient(getIt<SecureStorage>(), getIt<NavigationService>()),
  );

  // Repositories
  getIt.registerLazySingleton<AuthRepository>(
    () => AuthRepository(getIt<ApiClient>(), getIt<SecureStorage>()),
  );

  getIt.registerLazySingleton<JobRepository>(
    () => JobRepository(getIt<ApiClient>()),
  );

  getIt.registerLazySingleton<SubmissionRepository>(
    () => SubmissionRepository(getIt<ApiClient>()),
  );

  getIt.registerLazySingleton<PaymentRepository>(
    () => PaymentRepository(getIt<ApiClient>()),
  );

  getIt.registerLazySingleton<NotificationRepository>(
    () => NotificationRepository(getIt<ApiClient>()),
  );

  // BLoCs/Cubits
  getIt.registerFactory<AuthCubit>(
    () => AuthCubit(getIt<AuthRepository>(), getIt<LocalStorage>()),
  );

  getIt.registerFactory<JobsCubit>(
    () => JobsCubit(getIt<JobRepository>()),
  );

  getIt.registerFactory<ApplicationsCubit>(
    () => ApplicationsCubit(getIt<JobRepository>(), getIt<SubmissionRepository>()),
  );

  getIt.registerFactory<WalletCubit>(
    () => WalletCubit(getIt<PaymentRepository>()),
  );

  getIt.registerFactory<NotificationsCubit>(
    () => NotificationsCubit(getIt<NotificationRepository>()),
  );
}
