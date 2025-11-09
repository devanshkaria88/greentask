import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';
import 'package:permission_handler/permission_handler.dart';
import '../utils/logger.dart';

enum LocationPermissionStatus {
  granted,
  denied,
  deniedForever,
  serviceDisabled,
}

class LocationResult {
  final Position? position;
  final LocationPermissionStatus status;
  final String? errorMessage;

  LocationResult({
    this.position,
    required this.status,
    this.errorMessage,
  });

  bool get isSuccess => position != null && status == LocationPermissionStatus.granted;
}

class LocationService {
  /// Check if location services are enabled on the device
  Future<bool> isLocationServiceEnabled() async {
    return await Geolocator.isLocationServiceEnabled();
  }

  /// Get current location permission status
  Future<LocationPermissionStatus> getPermissionStatus() async {
    final permission = await Permission.location.status;
    
    if (permission.isGranted) {
      return LocationPermissionStatus.granted;
    } else if (permission.isPermanentlyDenied) {
      return LocationPermissionStatus.deniedForever;
    } else {
      return LocationPermissionStatus.denied;
    }
  }

  /// Request location permission from user
  Future<LocationPermissionStatus> requestPermission() async {
    try {
      // First check if location service is enabled
      final serviceEnabled = await isLocationServiceEnabled();
      if (!serviceEnabled) {
        return LocationPermissionStatus.serviceDisabled;
      }

      // Request permission
      final status = await Permission.location.request();
      
      if (status.isGranted) {
        AppLogger.info('Location permission granted');
        return LocationPermissionStatus.granted;
      } else if (status.isPermanentlyDenied) {
        AppLogger.warning('Location permission permanently denied');
        return LocationPermissionStatus.deniedForever;
      } else {
        AppLogger.warning('Location permission denied');
        return LocationPermissionStatus.denied;
      }
    } catch (e) {
      AppLogger.error('Error requesting location permission', e);
      return LocationPermissionStatus.denied;
    }
  }

  /// Get current position with automatic permission handling
  /// Returns LocationResult with position and status
  Future<LocationResult> getCurrentLocation({
    LocationAccuracy accuracy = LocationAccuracy.high,
  }) async {
    try {
      // Check if location service is enabled
      final serviceEnabled = await isLocationServiceEnabled();
      if (!serviceEnabled) {
        return LocationResult(
          status: LocationPermissionStatus.serviceDisabled,
          errorMessage: 'Location services are disabled. Please enable them in settings.',
        );
      }

      // Check permission status
      final permissionStatus = await getPermissionStatus();
      
      if (permissionStatus == LocationPermissionStatus.deniedForever) {
        return LocationResult(
          status: LocationPermissionStatus.deniedForever,
          errorMessage: 'Location permission is permanently denied. Please enable it in app settings.',
        );
      }

      if (permissionStatus == LocationPermissionStatus.denied) {
        return LocationResult(
          status: LocationPermissionStatus.denied,
          errorMessage: 'Location permission is required to use this feature.',
        );
      }

      // Get position
      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: accuracy,
      );

      AppLogger.info('Location obtained: ${position.latitude}, ${position.longitude}');
      
      return LocationResult(
        position: position,
        status: LocationPermissionStatus.granted,
      );
    } catch (e) {
      AppLogger.error('Error getting current location', e);
      return LocationResult(
        status: LocationPermissionStatus.denied,
        errorMessage: 'Failed to get location: ${e.toString()}',
      );
    }
  }

  /// Get current position with automatic permission request
  /// This will request permission if not granted
  Future<LocationResult> getCurrentLocationWithPermission({
    LocationAccuracy accuracy = LocationAccuracy.high,
  }) async {
    try {
      // Check if location service is enabled
      final serviceEnabled = await isLocationServiceEnabled();
      if (!serviceEnabled) {
        return LocationResult(
          status: LocationPermissionStatus.serviceDisabled,
          errorMessage: 'Location services are disabled. Please enable them in settings.',
        );
      }

      // Check permission status
      var permissionStatus = await getPermissionStatus();
      
      // If denied (not permanently), request permission
      if (permissionStatus == LocationPermissionStatus.denied) {
        permissionStatus = await requestPermission();
      }

      // Handle different permission states
      if (permissionStatus == LocationPermissionStatus.deniedForever) {
        return LocationResult(
          status: LocationPermissionStatus.deniedForever,
          errorMessage: 'Location permission is permanently denied. Please enable it in app settings.',
        );
      }

      if (permissionStatus == LocationPermissionStatus.serviceDisabled) {
        return LocationResult(
          status: LocationPermissionStatus.serviceDisabled,
          errorMessage: 'Location services are disabled. Please enable them in settings.',
        );
      }

      if (permissionStatus == LocationPermissionStatus.denied) {
        return LocationResult(
          status: LocationPermissionStatus.denied,
          errorMessage: 'Location permission is required to use this feature.',
        );
      }

      // Get position
      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: accuracy,
      );

      AppLogger.info('Location obtained: ${position.latitude}, ${position.longitude}');
      
      return LocationResult(
        position: position,
        status: LocationPermissionStatus.granted,
      );
    } catch (e) {
      AppLogger.error('Error getting current location with permission', e);
      return LocationResult(
        status: LocationPermissionStatus.denied,
        errorMessage: 'Failed to get location: ${e.toString()}',
      );
    }
  }

  /// Open app settings for user to manually enable permissions
  Future<bool> openAppSettings() async {
    try {
      return await Permission.location.request().isGranted || await openAppSettings();
    } catch (e) {
      AppLogger.error('Error opening app settings', e);
      return false;
    }
  }

  /// Open location settings
  Future<bool> openLocationSettings() async {
    try {
      return await Geolocator.openLocationSettings();
    } catch (e) {
      AppLogger.error('Error opening location settings', e);
      return false;
    }
  }

  /// Get address from coordinates (reverse geocoding)
  /// Returns a formatted address string with city, state, country
  Future<String?> getAddressFromCoordinates({
    required double lat,
    required double lng,
  }) async {
    try {
      final placemarks = await placemarkFromCoordinates(lat, lng);
      
      if (placemarks.isEmpty) {
        return null;
      }

      final place = placemarks.first;
      
      // Build address string with available components
      final parts = <String>[];
      
      if (place.locality != null && place.locality!.isNotEmpty) {
        parts.add(place.locality!); // City
      }
      if (place.administrativeArea != null && place.administrativeArea!.isNotEmpty) {
        parts.add(place.administrativeArea!); // State
      }
      if (place.country != null && place.country!.isNotEmpty) {
        parts.add(place.country!); // Country
      }

      final address = parts.join(', ');
      AppLogger.info('Address from coordinates: $address');
      
      return address.isNotEmpty ? address : null;
    } catch (e) {
      AppLogger.error('Error getting address from coordinates', e);
      return null;
    }
  }

  /// Get city name from coordinates
  Future<String?> getCityFromCoordinates({
    required double lat,
    required double lng,
  }) async {
    try {
      final placemarks = await placemarkFromCoordinates(lat, lng);
      
      if (placemarks.isEmpty) {
        return null;
      }

      final place = placemarks.first;
      
      // Try to get city name from different fields
      final city = place.locality ?? 
                   place.subAdministrativeArea ?? 
                   place.administrativeArea;
      
      if (city != null && city.isNotEmpty) {
        AppLogger.info('City from coordinates: $city');
        return city;
      }
      
      return null;
    } catch (e) {
      AppLogger.error('Error getting city from coordinates', e);
      return null;
    }
  }
}
