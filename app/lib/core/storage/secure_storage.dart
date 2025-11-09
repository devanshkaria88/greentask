import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../constants/app_constants.dart';

class SecureStorage {
  final FlutterSecureStorage _storage = const FlutterSecureStorage(
    aOptions: AndroidOptions(
      encryptedSharedPreferences: true,
    ),
  );

  // Auth Token
  Future<void> saveAuthToken(String token) async {
    await _storage.write(key: AppConstants.authTokenKey, value: token);
  }

  Future<String?> getAuthToken() async {
    return await _storage.read(key: AppConstants.authTokenKey);
  }

  Future<void> deleteAuthToken() async {
    await _storage.delete(key: AppConstants.authTokenKey);
  }

  // User Data
  Future<void> saveUserData(String userData) async {
    await _storage.write(key: AppConstants.userDataKey, value: userData);
  }

  Future<String?> getUserData() async {
    return await _storage.read(key: AppConstants.userDataKey);
  }

  Future<void> deleteUserData() async {
    await _storage.delete(key: AppConstants.userDataKey);
  }

  // Clear all
  Future<void> clearAll() async {
    await _storage.deleteAll();
  }
}
