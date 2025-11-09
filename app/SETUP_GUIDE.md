# GreenTask Mobile - Setup Guide

This guide will help you set up and run the GreenTask Mobile application.

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Flutter SDK** (version 3.0.0 or higher)
   - Download from: https://flutter.dev/docs/get-started/install
   - Verify installation: `flutter --version`

2. **Dart SDK** (comes with Flutter)

3. **IDE** (choose one):
   - Android Studio with Flutter plugin
   - VS Code with Flutter extension
   - IntelliJ IDEA with Flutter plugin

4. **Mobile Development Tools**:
   - For Android: Android Studio and Android SDK
   - For iOS: Xcode (macOS only)

## Step-by-Step Setup

### 1. Navigate to Project Directory

```bash
cd /Users/devansh/greenMatch/app
```

### 2. Install Dependencies

Run the following command to install all required packages:

```bash
flutter pub get
```

This will download all dependencies listed in `pubspec.yaml`.

### 3. Configure Environment Variables

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Open `.env` file and fill in your configuration:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here

# API Configuration
API_BASE_URL=http://localhost:54321/functions/v1

# Storage Configuration
SUPABASE_STORAGE_URL=https://your-project.supabase.co/storage/v1
PROOF_IMAGES_BUCKET=proof-images

# App Configuration
APP_NAME=GreenTask
DEFAULT_SEARCH_RADIUS_KM=50
```

**Important**: Get your Supabase credentials from:
- Supabase Dashboard → Settings → API
- Copy the Project URL and anon/public key

### 4. Verify Flutter Installation

Check if Flutter is properly installed and configured:

```bash
flutter doctor
```

Fix any issues reported by this command before proceeding.

### 5. Run the Application

#### On Android Emulator/Device:

1. Start an Android emulator or connect a physical device
2. Run:

```bash
flutter run
```

#### On iOS Simulator/Device (macOS only):

1. Open iOS Simulator or connect an iOS device
2. Run:

```bash
flutter run
```

#### For Web (Development):

```bash
flutter run -d chrome
```

## Common Issues and Solutions

### Issue 1: Dependencies Not Installing

**Solution**:

```bash
flutter clean
flutter pub get
```

### Issue 2: Environment Variables Not Loading

**Solution**:
- Ensure `.env` file is in the root directory (`/Users/devansh/greenMatch/app/`)
- Check that `.env` is listed in `pubspec.yaml` under assets
- Restart the app after making changes

### Issue 3: Location Permission Errors

**Solution**:

For Android, add to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

For iOS, add to `ios/Runner/Info.plist`:

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>We need your location to show nearby climate jobs</string>
```

### Issue 4: Camera Permission Errors

**Solution**:

For Android, add to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.CAMERA" />
```

For iOS, add to `ios/Runner/Info.plist`:

```xml
<key>NSCameraUsageDescription</key>
<string>We need camera access to capture proof photos</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>We need photo library access to select images</string>
```

## Project Structure Overview

```
lib/
├── core/               # Core functionality
│   ├── config/        # Environment config
│   ├── constants/     # App constants
│   ├── di/           # Dependency injection
│   ├── network/      # API client
│   ├── storage/      # Local storage
│   ├── theme/        # App theme
│   └── utils/        # Utilities
├── data/              # Data layer
│   ├── models/       # Data models
│   └── repositories/ # Data repositories
├── presentation/      # UI layer
│   ├── blocs/        # State management
│   ├── screens/      # App screens
│   └── widgets/      # Reusable widgets
└── main.dart         # App entry point
```

## Testing the App

### 1. Create Test Account

1. Launch the app
2. Go through onboarding
3. Click "Register" on login screen
4. Fill in registration form:
   - Email: test@example.com
   - Password: test123
   - Name: Test User
   - Phone: +919876543210
   - Location: (optional, can use GPS)

### 2. Test Features

- **Job Discovery**: Browse available jobs on home screen
- **Apply for Jobs**: Click on a job and apply
- **My Jobs**: View your applications in "My Jobs" tab
- **Wallet**: Check earnings in "Wallet" tab
- **Profile**: View and edit profile in "Profile" tab

## Backend Setup

The app requires the GreenTask backend to be running. Refer to:
- `/Users/devansh/greenMatch/functions/docs/API_REFERENCE.md` for API documentation
- Backend setup instructions in the functions directory

For local development, ensure the backend is running on:
- `http://localhost:54321/functions/v1`

## Building for Production

### Android APK

```bash
flutter build apk --release
```

Output: `build/app/outputs/flutter-apk/app-release.apk`

### Android App Bundle (for Play Store)

```bash
flutter build appbundle --release
```

Output: `build/app/outputs/bundle/release/app-release.aab`

### iOS (macOS only)

```bash
flutter build ios --release
```

Then open in Xcode to archive and submit to App Store.

## Additional Configuration

### App Icon

Replace app icons in:
- Android: `android/app/src/main/res/mipmap-*/ic_launcher.png`
- iOS: `ios/Runner/Assets.xcassets/AppIcon.appiconset/`

Or use flutter_launcher_icons package.

### App Name

Update app name in:
- Android: `android/app/src/main/AndroidManifest.xml`
- iOS: `ios/Runner/Info.plist`

### Package Name

To change package name, use:

```bash
flutter pub run change_app_package_name:main com.yourcompany.greentask
```

## Support

For issues or questions:
1. Check this guide first
2. Review API documentation
3. Contact the development team

## Next Steps

1. ✅ Complete environment setup
2. ✅ Run the app successfully
3. Configure backend connection
4. Test all features
5. Add custom branding (logo, colors)
6. Deploy to production

---

Happy coding! 🌱
