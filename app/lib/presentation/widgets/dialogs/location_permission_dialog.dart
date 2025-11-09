import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/services/location_service.dart';

class LocationPermissionDialog {
  /// Show dialog explaining why location permission is needed
  static Future<bool> showPermissionRationale(
    BuildContext context, {
    String? customMessage,
  }) async {
    final result = await showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        title: Row(
          children: [
            Icon(
              Icons.location_on,
              color: AppTheme.primaryGreen,
              size: 28,
            ),
            const SizedBox(width: 12),
            const Expanded(
              child: Text(
                'Location Access',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              customMessage ??
                  'GreenTask needs access to your location to:',
              style: const TextStyle(
                fontSize: 16,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 16),
            _buildReasonItem(
              Icons.work_outline,
              'Show nearby climate-action jobs in your area',
            ),
            const SizedBox(height: 12),
            _buildReasonItem(
              Icons.verified_outlined,
              'Verify that you completed tasks at the correct location',
            ),
            const SizedBox(height: 12),
            _buildReasonItem(
              Icons.eco_outlined,
              'Connect you with local environmental initiatives',
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppTheme.primaryGreen.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.privacy_tip_outlined,
                    color: AppTheme.primaryGreen,
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                  const Expanded(
                    child: Text(
                      'Your privacy matters. We only use your location when you\'re using the app.',
                      style: TextStyle(
                        fontSize: 13,
                        color: AppTheme.textLight,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text(
              'Not Now',
              style: TextStyle(color: AppTheme.textLight),
            ),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(context).pop(true),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primaryGreen,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: const Text('Allow Access'),
          ),
        ],
      ),
    );

    return result ?? false;
  }

  /// Show dialog when location services are disabled
  static Future<bool> showLocationServiceDisabledDialog(
    BuildContext context,
  ) async {
    final result = await showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        title: Row(
          children: [
            Icon(
              Icons.location_off,
              color: AppTheme.warningRed,
              size: 28,
            ),
            const SizedBox(width: 12),
            const Expanded(
              child: Text(
                'Location Services Off',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Location services are currently disabled on your device.',
              style: TextStyle(
                fontSize: 16,
                height: 1.5,
              ),
            ),
            SizedBox(height: 16),
            Text(
              'GreenTask requires location access to show you nearby climate-action jobs and verify task completion.',
              style: TextStyle(
                fontSize: 14,
                color: AppTheme.textLight,
                height: 1.5,
              ),
            ),
            SizedBox(height: 16),
            Text(
              'Please enable location services in your device settings to continue.',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text(
              'Cancel',
              style: TextStyle(color: AppTheme.textLight),
            ),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(context).pop(true),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primaryGreen,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: const Text('Open Settings'),
          ),
        ],
      ),
    );

    return result ?? false;
  }

  /// Show dialog when permission is permanently denied
  static Future<bool> showPermissionDeniedDialog(
    BuildContext context,
  ) async {
    final result = await showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        title: Row(
          children: [
            Icon(
              Icons.block,
              color: AppTheme.warningRed,
              size: 28,
            ),
            const SizedBox(width: 12),
            const Expanded(
              child: Text(
                'Permission Required',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Location permission has been denied.',
              style: TextStyle(
                fontSize: 16,
                height: 1.5,
              ),
            ),
            SizedBox(height: 16),
            Text(
              'To use GreenTask, you need to enable location access in your app settings.',
              style: TextStyle(
                fontSize: 14,
                color: AppTheme.textLight,
                height: 1.5,
              ),
            ),
            SizedBox(height: 16),
            Text(
              'Steps:',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
              ),
            ),
            SizedBox(height: 8),
            Text(
              '1. Tap "Open Settings" below\n'
              '2. Find "Location" or "Permissions"\n'
              '3. Enable location access for GreenTask',
              style: TextStyle(
                fontSize: 14,
                color: AppTheme.textLight,
                height: 1.5,
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text(
              'Cancel',
              style: TextStyle(color: AppTheme.textLight),
            ),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(context).pop(true),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primaryGreen,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: const Text('Open Settings'),
          ),
        ],
      ),
    );

    return result ?? false;
  }

  static Widget _buildReasonItem(IconData icon, String text) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(
          icon,
          color: AppTheme.primaryGreen,
          size: 20,
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            text,
            style: const TextStyle(
              fontSize: 14,
              color: AppTheme.textLight,
              height: 1.4,
            ),
          ),
        ),
      ],
    );
  }

  /// Complete flow to request location with all dialogs
  static Future<LocationResult> requestLocationWithDialogs(
    BuildContext context,
    LocationService locationService, {
    String? customMessage,
  }) async {
    // First show rationale
    final shouldRequest = await showPermissionRationale(
      context,
      customMessage: customMessage,
    );

    if (!shouldRequest) {
      return LocationResult(
        status: LocationPermissionStatus.denied,
        errorMessage: 'User declined location permission',
      );
    }

    // Request permission and get location
    final result = await locationService.getCurrentLocationWithPermission();

    // Handle different statuses
    if (result.status == LocationPermissionStatus.serviceDisabled) {
      if (context.mounted) {
        final openSettings = await showLocationServiceDisabledDialog(context);
        if (openSettings) {
          await locationService.openLocationSettings();
        }
      }
    } else if (result.status == LocationPermissionStatus.deniedForever) {
      if (context.mounted) {
        final openSettings = await showPermissionDeniedDialog(context);
        if (openSettings) {
          await openAppSettings();
        }
      }
    }

    return result;
  }
}
