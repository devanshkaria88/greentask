import 'package:flutter_dotenv/flutter_dotenv.dart';

class EnvConfig {
  static String get supabaseUrl => dotenv.env['SUPABASE_URL'] ?? '';
  static String get supabaseAnonKey => dotenv.env['SUPABASE_ANON_KEY'] ?? '';
  static String get apiBaseUrl => dotenv.env['API_BASE_URL'] ?? '';
  static String get supabaseStorageUrl => dotenv.env['SUPABASE_STORAGE_URL'] ?? '';
  static String get proofImagesBucket => dotenv.env['PROOF_IMAGES_BUCKET'] ?? 'proof-images';
  static String get appName => dotenv.env['APP_NAME'] ?? 'GreenTask';
  static double get defaultSearchRadiusKm => 
      double.tryParse(dotenv.env['DEFAULT_SEARCH_RADIUS_KM'] ?? '50') ?? 50.0;
}
