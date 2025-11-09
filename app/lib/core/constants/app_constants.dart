class AppConstants {
  // App Info
  static const String appName = 'GreenTask';
  static const String appTagline = 'Earn by Building a Greener Tomorrow';

  // API Endpoints
  static const String authRegisterEndpoint = '/auth/register';
  static const String authLoginEndpoint = '/auth/login';
  static const String jobsDiscoverEndpoint = '/jobs/discover';
  static const String jobsMyApplicationsEndpoint = '/jobs/my-applications';
  static const String jobsApplyEndpoint = '/jobs/{id}/apply';
  static const String submissionsCreateEndpoint = '/submissions/create';
  static const String paymentsWalletEndpoint = '/payments/wallet';
  static const String dashboardStatsEndpoint = '/dashboard/stats';
  static const String notificationsEndpoint = '/notifications/my-notifications';
  static const String notificationsReadEndpoint = '/notifications/{id}/read';

  // Storage Keys
  static const String authTokenKey = 'auth_token';
  static const String userDataKey = 'user_data';
  static const String onboardingCompletedKey = 'onboarding_completed';

  // Pagination
  static const int defaultPageSize = 10;
  static const int maxPageSize = 100;

  // Location
  static const double defaultSearchRadiusKm = 100.0;
  static const double maxSearchRadiusKm = 200.0;

  // Job Categories
  static const List<String> jobCategories = [
    'tree_planting',
    'waste_management',
    'water_conservation',
    'renewable_energy',
    'soil_conservation',
    'biodiversity',
    'climate_awareness',
    'other',
  ];

  static const Map<String, String> categoryLabels = {
    'tree_planting': 'Tree Planting',
    'waste_management': 'Waste Management',
    'water_conservation': 'Water Conservation',
    'renewable_energy': 'Renewable Energy',
    'soil_conservation': 'Soil Conservation',
    'biodiversity': 'Biodiversity',
    'climate_awareness': 'Climate Awareness',
    'other': 'Other',
  };

  // Application Status
  static const String statusPending = 'pending';
  static const String statusAccepted = 'accepted';
  static const String statusRejected = 'rejected';

  // Job Status
  static const String jobStatusOpen = 'open';
  static const String jobStatusAssigned = 'assigned';
  static const String jobStatusCompleted = 'completed';
  static const String jobStatusCancelled = 'cancelled';

  // Payment Status
  static const String paymentStatusPending = 'pending';
  static const String paymentStatusApproved = 'approved';
  static const String paymentStatusPaid = 'paid';

  // Verification Status
  static const String verificationPending = 'pending';
  static const String verificationApproved = 'approved';
  static const String verificationRejected = 'rejected';

  // User Roles
  static const String roleCommunityMember = 'CommunityMember';
  static const String roleGramPanchayat = 'GramPanchayat';
  static const String roleAdmin = 'Admin';

  // Image Upload
  static const int maxImageSizeMB = 5;
  static const List<String> allowedImageFormats = ['jpg', 'jpeg', 'png'];
}
