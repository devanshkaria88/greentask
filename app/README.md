# GreenTask Mobile

A hyperlocal climate-action micro-jobs marketplace connecting government officials with community members in rural/climate-vulnerable regions to complete climate-resilience tasks for verified compensation.

## 🌱 About

GreenTask Mobile is a Flutter app designed for workers to:
- Discover nearby climate-action jobs
- Apply for jobs and track applications
- Submit proof of completed work
- Track earnings and payments
- Monitor their climate impact

## 🏗️ Tech Stack

- **Framework**: Flutter (latest stable)
- **State Management**: BLoC with Cubit architecture
- **Dependency Injection**: GetIt
- **HTTP Client**: Dio
- **Storage**: SharedPreferences & FlutterSecureStorage
- **Location**: Geolocator
- **Images**: ImagePicker & CachedNetworkImage

## 📁 Project Structure

```
lib/
├── core/
│   ├── config/          # Environment configuration
│   ├── constants/       # App constants
│   ├── di/             # Dependency injection
│   ├── network/        # API client
│   ├── storage/        # Local & secure storage
│   ├── theme/          # App theme
│   └── utils/          # Utilities (validators, logger, etc.)
├── data/
│   ├── models/         # Data models
│   └── repositories/   # Data repositories
├── presentation/
│   ├── blocs/          # BLoC/Cubit state management
│   ├── screens/        # UI screens
│   └── widgets/        # Reusable widgets
└── main.dart           # App entry point
```

## 🚀 Getting Started

### Prerequisites

- Flutter SDK (>=3.0.0)
- Dart SDK
- Android Studio / Xcode (for mobile development)

### Installation

1. **Clone the repository**
   ```bash
   cd /Users/devansh/greenMatch/app
   ```

2. **Install dependencies**
   ```bash
   flutter pub get
   ```

3. **Configure environment variables**
   
   Copy `.env.example` to `.env` and fill in your configuration:
   ```bash
   cp .env.example .env
   ```
   
   Update the following values in `.env`:
   ```
   SUPABASE_URL=your-supabase-url
   SUPABASE_ANON_KEY=your-anon-key
   API_BASE_URL=your-api-base-url
   ```

4. **Run the app**
   ```bash
   flutter run
   ```

## 📱 Features

### Authentication
- Email/Password login and registration
- Progressive registration form
- Secure token storage
- Auto-login on app restart

### Job Discovery
- Location-based job search
- Category filtering
- Distance calculation
- Job details with maps integration

### My Jobs
- Track applied jobs
- Monitor ongoing jobs
- View completed jobs
- Submit proof of work

### Proof Submission
- Before/After photo capture
- Location auto-capture
- Optional notes
- Real-time upload status

### Wallet
- View total earnings
- Track pending payments
- Transaction history
- Payment status tracking

### Profile
- User information display
- Impact statistics
- Settings management
- Logout functionality

### Notifications
- Real-time notifications
- Read/Unread status
- Type-based icons and colors

## 🎨 UI Design

The app features a modern, nature-inspired design with:
- Soothing green color palette
- Clean and intuitive interface
- Smooth animations using flutter_animate
- FontAwesome icons for consistency
- Google Fonts (Montserrat & Roboto)

## 🔧 Configuration

### API Endpoints

All API endpoints are configured in `lib/core/constants/app_constants.dart`. The app communicates with the backend API documented in `/Users/devansh/greenMatch/functions/docs/API_REFERENCE.md`.

### Theme Customization

Theme colors and styles can be customized in `lib/core/theme/app_theme.dart`.

## 🧪 Testing

```bash
# Run tests
flutter test

# Run with coverage
flutter test --coverage
```

## 📦 Building

### Android
```bash
flutter build apk --release
```

### iOS
```bash
flutter build ios --release
```

## 🔐 Security

- Authentication tokens stored securely using FlutterSecureStorage
- API keys managed through environment variables
- Never commit `.env` file to version control

## 📝 API Integration

The app integrates with the GreenTask backend API. Key endpoints:

- **Authentication**: `/auth/register`, `/auth/login`
- **Jobs**: `/jobs/discover`, `/jobs/{id}/apply`
- **Applications**: `/jobs/my-applications`
- **Submissions**: `/submissions/create`
- **Payments**: `/payments/wallet`
- **Notifications**: `/notifications/my-notifications`

For complete API documentation, see `/Users/devansh/greenMatch/functions/docs/API_REFERENCE.md`.

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

This project is part of the GreenTask platform.

## 🆘 Support

For issues or questions, please contact the development team.

---

Built with 💚 for a greener tomorrow
