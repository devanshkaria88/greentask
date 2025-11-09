import 'package:dio/dio.dart';
import 'package:pretty_dio_logger/pretty_dio_logger.dart';
import '../config/env_config.dart';
import '../utils/logger.dart';
import '../storage/secure_storage.dart';
import '../navigation/navigation_service.dart';
import '../../presentation/screens/auth/login_screen.dart';

class ApiClient {
  late final Dio _dio;
  final SecureStorage _secureStorage;
  final NavigationService _navigationService;

  ApiClient(this._secureStorage, this._navigationService) {
    _dio = Dio(
      BaseOptions(
        baseUrl: EnvConfig.apiBaseUrl,
        connectTimeout: const Duration(seconds: 30),
        receiveTimeout: const Duration(seconds: 30),
        headers: {
          'apikey': EnvConfig.supabaseAnonKey,
        },
      ),
    );

    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // Add auth token if available
          final token = await _secureStorage.getAuthToken();
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (error, handler) async {
          AppLogger.error('API Error', error);

          // Handle 401 Unauthorized - clear auth and redirect to login
          if (error.response?.statusCode == 401) {
            await _handle401Error();
          }

          return handler.next(error);
        },
      ),
    );

    // Add pretty logger in debug mode
    _dio.interceptors.add(
      PrettyDioLogger(
        requestHeader: true,
        requestBody: true,
        responseBody: true,
        responseHeader: false,
        error: true,
        compact: true,
      ),
    );
  }

  // GET request
  Future<Response> get(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      return await _dio.get(
        path,
        queryParameters: queryParameters,
        options: options,
      );
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // POST request
  Future<Response> post(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      return await _dio.post(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // PATCH request
  Future<Response> patch(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      return await _dio.patch(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // DELETE request
  Future<Response> delete(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      return await _dio.delete(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Upload file
  Future<Response> uploadFile(
    String path,
    String filePath, {
    Map<String, dynamic>? data,
    ProgressCallback? onSendProgress,
  }) async {
    try {
      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(filePath),
        ...?data,
      });

      return await _dio.post(
        path,
        data: formData,
        onSendProgress: onSendProgress,
      );
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Upload multiple files with multipart/form-data
  Future<Response> postMultipart(
    String path, {
    required Map<String, String> filePaths,
    Map<String, dynamic>? data,
    ProgressCallback? onSendProgress,
  }) async {
    try {
      final formDataMap = <String, dynamic>{};

      // Add files
      for (final entry in filePaths.entries) {
        formDataMap[entry.key] = await MultipartFile.fromFile(
          entry.value,
          filename: entry.value.split('/').last,
        );
      }

      // Add other data fields
      if (data != null) {
        formDataMap.addAll(data);
      }

      final formData = FormData.fromMap(formDataMap);

      // Explicitly set content type to null to force Dio to auto-detect
      final options = Options(
        contentType: null,
        headers: {
          'Content-Type': null,
        },
      );

      AppLogger.info('Sending multipart request to: $path');
      AppLogger.info('FormData fields: ${formDataMap.keys.toList()}');

      final response = await _dio.post(
        path,
        data: formData,
        onSendProgress: onSendProgress,
        options: options,
      );

      AppLogger.info('Response headers: ${response.headers}');
      return response;
    } on DioException catch (e) {
      AppLogger.error('Multipart request error', e);
      AppLogger.error('Request headers: ${e.requestOptions.headers}');
      throw _handleError(e);
    }
  }

  Future<void> _handle401Error() async {
    try {
      // Clear all authentication data
      await _secureStorage.clearAll();

      // Navigate to login screen and clear navigation stack
      _navigationService.navigateToWidgetAndRemoveUntil(
        const LoginScreen(),
      );

      AppLogger.info('User logged out due to 401 Unauthorized response');
    } catch (e) {
      AppLogger.error('Error handling 401 response', e);
    }
  }

  ApiException _handleError(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return ApiException(
          message: 'Connection timeout. Please check your internet connection.',
          statusCode: 408,
        );
      case DioExceptionType.badResponse:
        return _handleResponseError(error);
      case DioExceptionType.cancel:
        return ApiException(message: 'Request cancelled');
      default:
        return ApiException(
          message: 'Network error. Please check your internet connection.',
        );
    }
  }

  ApiException _handleResponseError(DioException error) {
    final statusCode = error.response?.statusCode;
    final data = error.response?.data;

    String message = 'An error occurred';

    if (data is Map<String, dynamic>) {
      message = data['error'] ?? data['message'] ?? message;
    }

    switch (statusCode) {
      case 400:
        return ApiException(message: message, statusCode: 400);
      case 401:
        return ApiException(
          message: 'Unauthorized. Please login again.',
          statusCode: 401,
        );
      case 403:
        return ApiException(
          message: 'Access forbidden',
          statusCode: 403,
        );
      case 404:
        return ApiException(
          message: 'Resource not found',
          statusCode: 404,
        );
      case 500:
        return ApiException(
          message: 'Server error. Please try again later.',
          statusCode: 500,
        );
      default:
        return ApiException(
          message: message,
          statusCode: statusCode,
        );
    }
  }
}

class ApiException implements Exception {
  final String message;
  final int? statusCode;

  ApiException({
    required this.message,
    this.statusCode,
  });

  @override
  String toString() => message;
}
