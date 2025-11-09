import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:geolocator/geolocator.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/di/injection.dart';
import '../../../core/services/location_service.dart';
import '../../widgets/dialogs/location_permission_dialog.dart';
import '../../blocs/jobs/jobs_cubit.dart';
import '../../blocs/jobs/jobs_state.dart';
import '../../blocs/auth/auth_cubit.dart';
import '../../blocs/auth/auth_state.dart';
import '../../widgets/job_card.dart';
import '../job_details/job_details_screen.dart';
import '../my_jobs/my_jobs_screen.dart';
import '../wallet/wallet_screen.dart';
import '../profile/profile_screen.dart';
import '../notifications/notifications_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;
  Position? _currentPosition;
  String? _selectedCategory;
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _getCurrentLocation();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _getCurrentLocation() async {
    try {
      final locationService = getIt<LocationService>();
      
      // First try to get location silently if permission already granted
      final result = await locationService.getCurrentLocation();

      if (result.isSuccess && result.position != null) {
        // Permission already granted, use location
        setState(() {
          _currentPosition = result.position;
        });
        _loadJobs();
      } else if (result.status == LocationPermissionStatus.denied) {
        // Permission not granted yet, show dialogs only on first time
        if (!mounted) return;
        final dialogResult = await LocationPermissionDialog.requestLocationWithDialogs(
          context,
          locationService,
          customMessage: 'GreenTask needs your location to show you nearby climate-action jobs in your area.',
        );

        if (dialogResult.isSuccess && dialogResult.position != null) {
          setState(() {
            _currentPosition = dialogResult.position;
          });
          _loadJobs();
        } else {
          _useDefaultLocation();
          if (mounted && dialogResult.errorMessage != null) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Using default location. ${dialogResult.errorMessage}'),
                backgroundColor: AppTheme.infoBlue,
                duration: const Duration(seconds: 4),
              ),
            );
          }
        }
      } else {
        // Other errors (service disabled, denied forever, etc.)
        _useDefaultLocation();
        if (mounted && result.errorMessage != null) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Using default location. ${result.errorMessage}'),
              backgroundColor: AppTheme.infoBlue,
              duration: const Duration(seconds: 3),
            ),
          );
        }
      }
    } catch (e) {
      _useDefaultLocation();
    }
  }

  void _useDefaultLocation() {
    setState(() {
      _currentPosition = Position(
        latitude: 18.5204,
        longitude: 73.8567,
        timestamp: DateTime.now(),
        accuracy: 0,
        altitude: 0,
        heading: 0,
        speed: 0,
        speedAccuracy: 0,
        altitudeAccuracy: 0,
        headingAccuracy: 0,
      );
    });
    _loadJobs();
  }

  void _loadJobs() {
    if (_currentPosition != null) {
      context.read<JobsCubit>().discoverJobs(
            lat: _currentPosition!.latitude,
            lng: _currentPosition!.longitude,
            category: _selectedCategory,
            refresh: true,
          );
    }
  }

  void _onCategorySelected(String? category) {
    setState(() {
      _selectedCategory = category;
    });
    _loadJobs();
  }

  @override
  Widget build(BuildContext context) {
    final screens = [
      _buildHomeContent(),
      const MyJobsScreen(),
      const WalletScreen(),
      const ProfileScreen(),
    ];

    return Scaffold(
      body: screens[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
          
          // Refresh location and jobs when returning to home tab
          if (index == 0 && _currentPosition != null) {
            _getCurrentLocation();
          }
        },
        items: const [
          BottomNavigationBarItem(
            icon: FaIcon(FontAwesomeIcons.house, size: 20),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: FaIcon(FontAwesomeIcons.briefcase, size: 20),
            label: 'My Jobs',
          ),
          BottomNavigationBarItem(
            icon: FaIcon(FontAwesomeIcons.wallet, size: 20),
            label: 'Wallet',
          ),
          BottomNavigationBarItem(
            icon: FaIcon(FontAwesomeIcons.user, size:20),
            label: 'Profile',
          ),
        ],
      ),
    );
  }

  Widget _buildHomeContent() {
    return SafeArea(
      child: RefreshIndicator(
        onRefresh: () async {
          _loadJobs();
        },
        child: CustomScrollView(
          slivers: [
            // App Bar
            SliverAppBar(
              floating: true,
              backgroundColor: AppTheme.cardBackground,
              title: Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: AppTheme.primaryGreen,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(
                      Icons.eco,
                      color: Colors.white,
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          AppConstants.appName,
                          style:
                              Theme.of(context).textTheme.titleLarge?.copyWith(
                                    fontWeight: FontWeight.bold,
                                  ),
                        ),
                        BlocBuilder<AuthCubit, AuthState>(
                          builder: (context, state) {
                            if (state is AuthAuthenticated) {
                              return Text(
                                state.user.location ?? 'Location',
                                style: Theme.of(context)
                                    .textTheme
                                    .bodySmall
                                    ?.copyWith(
                                      color: AppTheme.textLight,
                                    ),
                              );
                            }
                            return const SizedBox();
                          },
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              actions: [
                IconButton(
                  icon: const Icon(Icons.notifications_outlined),
                  onPressed: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => const NotificationsScreen(),
                      ),
                    );
                  },
                ),
              ],
            ),
            // Search Bar
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Search jobs...',
                    prefixIcon: const Icon(Icons.search),
                    suffixIcon: _searchController.text.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear),
                            onPressed: () {
                              _searchController.clear();
                              setState(() {});
                            },
                          )
                        : null,
                  ),
                ),
              ),
            ),
            // Category Filters
            SliverToBoxAdapter(
              child: SizedBox(
                height: 50,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  children: [
                    _buildCategoryChip('All', null),
                    ...AppConstants.jobCategories.map(
                      (category) => _buildCategoryChip(
                        AppConstants.categoryLabels[category] ?? category,
                        category,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SliverToBoxAdapter(child: SizedBox(height: 16)),
            // Jobs List
            BlocBuilder<JobsCubit, JobsState>(
              builder: (context, state) {
                if (state is JobsLoading) {
                  return const SliverFillRemaining(
                    child: Center(
                      child: CircularProgressIndicator(),
                    ),
                  );
                } else if (state is JobsLoaded) {
                  if (state.jobs.isEmpty) {
                    return SliverFillRemaining(
                      child: Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const FaIcon(
                              FontAwesomeIcons.seedling,
                              size: 64,
                              color: AppTheme.textLight,
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'No jobs found',
                              style: Theme.of(context).textTheme.titleLarge,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Check back later for new opportunities',
                              style: Theme.of(context)
                                  .textTheme
                                  .bodyMedium
                                  ?.copyWith(
                                    color: AppTheme.textLight,
                                  ),
                            ),
                          ],
                        ),
                      ),
                    );
                  }

                  return SliverPadding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    sliver: SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (context, index) {
                          if (index == state.jobs.length) {
                            if (state.hasMore) {
                              return Padding(
                                padding: const EdgeInsets.all(16.0),
                                child: Center(
                                  child: ElevatedButton(
                                    onPressed: () {
                                      context.read<JobsCubit>().loadMore();
                                    },
                                    child: const Text('Load More'),
                                  ),
                                ),
                              );
                            }
                            return const SizedBox(height: 16);
                          }

                          final job = state.jobs[index];
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 16),
                            child: JobCard(
                              job: job,
                              onTap: () {
                                Navigator.of(context).push(
                                  MaterialPageRoute(
                                    builder: (_) => JobDetailsScreen(job: job),
                                  ),
                                );
                              },
                            ),
                          );
                        },
                        childCount: state.jobs.length + 1,
                      ),
                    ),
                  );
                } else if (state is JobsError) {
                  return SliverFillRemaining(
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(
                            Icons.error_outline,
                            size: 64,
                            color: AppTheme.warningRed,
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'Error loading jobs',
                            style: Theme.of(context).textTheme.titleLarge,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            state.message,
                            style: Theme.of(context)
                                .textTheme
                                .bodyMedium
                                ?.copyWith(
                                  color: AppTheme.textLight,
                                ),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 16),
                          ElevatedButton(
                            onPressed: _loadJobs,
                            child: const Text('Retry'),
                          ),
                        ],
                      ),
                    ),
                  );
                }

                return const SliverFillRemaining(
                  child: Center(
                    child: Text('Start discovering jobs'),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCategoryChip(String label, String? category) {
    final isSelected = _selectedCategory == category;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: FilterChip(
        label: Text(label),
        selected: isSelected,
        onSelected: (_) => _onCategorySelected(category),
        backgroundColor: AppTheme.cardBackground,
        selectedColor: AppTheme.primaryGreen,
        labelStyle: TextStyle(
          color: isSelected ? Colors.white : AppTheme.textDark,
          fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
        ),
      ),
    );
  }
}
