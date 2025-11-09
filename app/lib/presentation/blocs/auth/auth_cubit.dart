import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../data/repositories/auth_repository.dart';
import '../../../core/storage/local_storage.dart';
import '../../../core/utils/logger.dart';
import 'auth_state.dart';

class AuthCubit extends Cubit<AuthState> {
  final AuthRepository _authRepository;
  final LocalStorage _localStorage;

  AuthCubit(this._authRepository, this._localStorage) : super(AuthInitial());

  Future<void> checkAuthStatus() async {
    try {
      emit(AuthLoading());
      
      final isAuthenticated = await _authRepository.isAuthenticated();
      
      if (isAuthenticated) {
        final user = await _authRepository.getCurrentUser();
        if (user != null) {
          emit(AuthAuthenticated(user));
        } else {
          emit(AuthUnauthenticated());
        }
      } else {
        emit(AuthUnauthenticated());
      }
    } catch (e) {
      AppLogger.error('Error checking auth status', e);
      emit(AuthUnauthenticated());
    }
  }

  Future<void> register({
    required String name,
    required String email,
    required String password,
    required String phoneNumber,
    String? regionName,
    String? location,
    double? lat,
    double? lng,
  }) async {
    try {
      emit(AuthLoading());

      final response = await _authRepository.register(
        name: name,
        email: email,
        password: password,
        phoneNumber: phoneNumber,
        regionName: regionName,
        location: location,
        lat: lat,
        lng: lng,
      );

      emit(AuthAuthenticated(response.user));
    } catch (e) {
      AppLogger.error('Registration error', e);
      emit(AuthError(e.toString()));
      emit(AuthUnauthenticated());
    }
  }

  Future<void> login({
    required String email,
    required String password,
  }) async {
    try {
      emit(AuthLoading());

      final response = await _authRepository.login(
        email: email,
        password: password,
      );

      emit(AuthAuthenticated(response.user));
    } catch (e) {
      AppLogger.error('Login error', e);
      emit(AuthError(e.toString()));
      emit(AuthUnauthenticated());
    }
  }

  Future<void> logout() async {
    try {
      await _authRepository.logout();
      emit(AuthUnauthenticated());
    } catch (e) {
      AppLogger.error('Logout error', e);
      emit(AuthError(e.toString()));
    }
  }

  /// Force logout without error handling - used for 401 responses
  Future<void> forceLogout() async {
    try {
      await _authRepository.logout();
      emit(AuthUnauthenticated());
    } catch (e) {
      AppLogger.error('Force logout error', e);
      // Still emit unauthenticated even if there's an error
      emit(AuthUnauthenticated());
    }
  }

  bool isOnboardingCompleted() {
    return _localStorage.isOnboardingCompleted();
  }

  Future<void> completeOnboarding() async {
    await _localStorage.setOnboardingCompleted(true);
  }
}
