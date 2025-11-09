import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'core/theme/app_theme.dart';
import 'core/di/injection.dart';
import 'core/navigation/navigation_service.dart';
import 'presentation/blocs/auth/auth_cubit.dart';
import 'presentation/blocs/jobs/jobs_cubit.dart';
import 'presentation/blocs/applications/applications_cubit.dart';
import 'presentation/blocs/wallet/wallet_cubit.dart';
import 'presentation/blocs/notifications/notifications_cubit.dart';
import 'presentation/screens/splash/splash_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Load environment variables
  await dotenv.load(fileName: '.env');

  // Setup dependency injection
  await setupDependencies();

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(
          create: (_) => getIt<AuthCubit>(),
        ),
        BlocProvider(
          create: (_) => getIt<JobsCubit>(),
        ),
        BlocProvider(
          create: (_) => getIt<ApplicationsCubit>(),
        ),
        BlocProvider(
          create: (_) => getIt<WalletCubit>(),
        ),
        BlocProvider(
          create: (_) => getIt<NotificationsCubit>(),
        ),
      ],
      child: MaterialApp(
        navigatorKey: getIt<NavigationService>().navigatorKey,
        title: 'GreenTask',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        home: const SplashScreen(),
      ),
    );
  }
}
