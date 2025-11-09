import 'dart:convert';
import '../../core/network/api_client.dart';
import '../../core/storage/secure_storage.dart';
import '../../core/constants/app_constants.dart';
import '../models/user_model.dart';

class AuthRepository {
  final ApiClient _apiClient;
  final SecureStorage _secureStorage;

  AuthRepository(this._apiClient, this._secureStorage);

  Future<AuthResponse> register({
    required String name,
    required String email,
    required String password,
    required String phoneNumber,
    String? regionName,
    String? location,
    double? lat,
    double? lng,
  }) async {
    final response = await _apiClient.post(
      AppConstants.authRegisterEndpoint,
      data: {
        'name': name,
        'email': email,
        'password': password,
        'phone_number': phoneNumber,
        'user_type': AppConstants.roleCommunityMember,
        if (regionName != null) 'region_name': regionName,
        if (location != null) 'location': location,
        if (lat != null) 'lat': lat,
        if (lng != null) 'lng': lng,
      },
    );

    final data = response.data['data'];
    final user = UserModel.fromJson(data['user']);
    final token = data['session_token'] as String;

    await _saveAuthData(user, token);

    return AuthResponse(user: user, token: token);
  }

  Future<AuthResponse> login({
    required String email,
    required String password,
  }) async {
    final response = await _apiClient.post(
      AppConstants.authLoginEndpoint,
      data: {
        'email': email,
        'password': password,
      },
    );

    final data = response.data['data'];
    final user = UserModel.fromJson(data['user']);
    final token = data['session_token'] as String;

    await _saveAuthData(user, token);

    return AuthResponse(user: user, token: token);
  }

  Future<void> logout() async {
    await _secureStorage.clearAll();
  }

  Future<UserModel?> getCurrentUser() async {
    final userData = await _secureStorage.getUserData();
    if (userData == null) return null;

    try {
      final json = jsonDecode(userData);
      return UserModel.fromJson(json);
    } catch (e) {
      return null;
    }
  }

  Future<String?> getAuthToken() async {
    return await _secureStorage.getAuthToken();
  }

  Future<bool> isAuthenticated() async {
    final token = await getAuthToken();
    return token != null && token.isNotEmpty;
  }

  Future<void> _saveAuthData(UserModel user, String token) async {
    await _secureStorage.saveAuthToken(token);
    await _secureStorage.saveUserData(jsonEncode(user.toJson()));
  }
}

class AuthResponse {
  final UserModel user;
  final String token;

  AuthResponse({
    required this.user,
    required this.token,
  });
}
