import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/constants/app_constants.dart';
import '../../blocs/applications/applications_cubit.dart';
import '../../blocs/applications/applications_state.dart';
import '../../widgets/application_card.dart';
import '../submit_proof/submit_proof_screen.dart';

class MyJobsScreen extends StatefulWidget {
  const MyJobsScreen({super.key});

  @override
  State<MyJobsScreen> createState() => _MyJobsScreenState();
}

class _MyJobsScreenState extends State<MyJobsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  String _currentFilter = 'applied';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _tabController.addListener(_onTabChanged);
    _loadApplications();
  }

  @override
  void dispose() {
    _tabController.removeListener(_onTabChanged);
    _tabController.dispose();
    super.dispose();
  }

  void _onTabChanged() {
    if (!_tabController.indexIsChanging) return;

    final filters = ['applied', 'ongoing', 'completed'];
    _currentFilter = filters[_tabController.index];
    _loadApplications();
  }

  void _loadApplications() {
    context
        .read<ApplicationsCubit>()
        .loadMyApplications(filter: _currentFilter);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Jobs'),
        bottom: TabBar(
          controller: _tabController,
          physics: const NeverScrollableScrollPhysics(),
          labelColor: AppTheme.primaryGreen,
          unselectedLabelColor: AppTheme.textLight,
          indicatorColor: AppTheme.primaryGreen,
          tabs: const [
            Tab(text: 'Applied'),
            Tab(text: 'Ongoing'),
            Tab(text: 'Completed'),
          ],
        ),
      ),
      body: BlocConsumer<ApplicationsCubit, ApplicationsState>(
        listener: (context, state) {
          if (state is SubmissionSubmitted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Proof submitted successfully!'),
                backgroundColor: AppTheme.primaryGreen,
              ),
            );
          } else if (state is ApplicationsError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: AppTheme.warningRed,
              ),
            );
          }
        },
        builder: (context, state) {
          if (state is ApplicationsLoading) {
            return const Center(child: CircularProgressIndicator());
          } else if (state is ApplicationsLoaded) {
            // Backend now handles filtering, so just display all applications
            return TabBarView(
              controller: _tabController,
              children: [
                _buildApplicationsList(state.applications, 'applied'),
                _buildApplicationsList(state.applications, 'ongoing'),
                _buildApplicationsList(state.applications, 'completed'),
              ],
            );
          } else if (state is ApplicationsError) {
            return Center(
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
                    'Error loading applications',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    state.message,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: AppTheme.textLight,
                        ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: _loadApplications,
                    child: const Text('Retry'),
                  ),
                ],
              ),
            );
          }

          return const Center(child: Text('No applications yet'));
        },
      ),
    );
  }

  Widget _buildApplicationsList(List applications, String type) {
    if (applications.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            FaIcon(
              type == 'applied'
                  ? FontAwesomeIcons.fileLines
                  : type == 'ongoing'
                      ? FontAwesomeIcons.briefcase
                      : FontAwesomeIcons.circleCheck,
              size: 64,
              color: AppTheme.textLight,
            ),
            const SizedBox(height: 16),
            Text(
              'No $type jobs',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 8),
            Text(
              type == 'applied'
                  ? 'Apply for jobs to see them here'
                  : type == 'ongoing'
                      ? 'Accepted jobs will appear here'
                      : 'Completed jobs will appear here',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: AppTheme.textLight,
                  ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () async {
        _loadApplications();
      },
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: applications.length,
        itemBuilder: (context, index) {
          final application = applications[index];
          return Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: ApplicationCard(
              application: application,
              showSubmitButton: type == 'ongoing',
              onSubmitProof: () {
                if (application.jobDetails != null) {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => SubmitProofScreen(
                        job: application.jobDetails!,
                      ),
                    ),
                  );
                }
              },
            ),
          );
        },
      ),
    );
  }
}
