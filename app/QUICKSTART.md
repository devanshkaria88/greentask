# GreenTask Mobile - Quick Start

Get the app running in 5 minutes!

## 1. Install Dependencies

```bash
cd /Users/devansh/greenMatch/app
flutter pub get
```

## 2. Setup Environment

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
SUPABASE_URL=your-url-here
SUPABASE_ANON_KEY=your-key-here
API_BASE_URL=http://localhost:54321/functions/v1
```

## 3. Run the App

```bash
flutter run
```

That's it! The app should now be running on your device/emulator.

## What's Next?

- Read [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed setup instructions
- Check [README.md](./README.md) for full documentation
- Review API docs at `/Users/devansh/greenMatch/functions/docs/API_REFERENCE.md`

## Need Help?

Common commands:

```bash
# Clean build
flutter clean && flutter pub get

# Check Flutter setup
flutter doctor

# Run on specific device
flutter devices
flutter run -d <device-id>

# Build release APK
flutter build apk --release
```

## Test Credentials

For testing, you can create a new account in the app or use test credentials if provided by your team.

---

Happy coding! 🚀
