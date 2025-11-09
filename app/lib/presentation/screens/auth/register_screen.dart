import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/validators.dart';
import '../../../core/di/injection.dart';
import '../../../core/services/location_service.dart';
import '../../blocs/auth/auth_cubit.dart';
import '../../blocs/auth/auth_state.dart';
import '../../widgets/dialogs/location_permission_dialog.dart';
import '../home/home_screen.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  int _currentStep = 0;

  // Step 1: Email & Password
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  // Step 2: Personal Info
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();

  // Step 3: Location
  final _regionController = TextEditingController();
  final _locationController = TextEditingController();
  double? _lat;
  double? _lng;
  bool _isLoadingLocation = false;

  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _nameController.dispose();
    _phoneController.dispose();
    _regionController.dispose();
    _locationController.dispose();
    super.dispose();
  }

  /// Check and request location permission when user reaches step 3
  Future<void> _checkLocationPermissionOnStep3() async {
    final locationService = getIt<LocationService>();
    final permissionStatus = await locationService.getPermissionStatus();
    
    // If permission not granted, automatically request it
    if (permissionStatus != LocationPermissionStatus.granted) {
      await _getCurrentLocation();
    }
  }

  Future<void> _getCurrentLocation() async {
    setState(() {
      _isLoadingLocation = true;
    });

    try {
      final locationService = getIt<LocationService>();
      
      // Request location with dialogs
      final result = await LocationPermissionDialog.requestLocationWithDialogs(
        context,
        locationService,
        customMessage: 'To register for GreenTask, we need your location to connect you with nearby climate-action jobs.',
      );

      if (result.isSuccess && result.position != null) {
        final lat = result.position!.latitude;
        final lng = result.position!.longitude;
        
        // Update UI immediately with coordinates
        setState(() {
          _lat = lat;
          _lng = lng;
        });
        
        // Get city name from coordinates
        final city = await locationService.getCityFromCoordinates(
          lat: lat,
          lng: lng,
        );
        
        // Get full address
        final address = await locationService.getAddressFromCoordinates(
          lat: lat,
          lng: lng,
        );
        
        // Update UI with geocoded information
        if (mounted) {
          setState(() {
            // Set region to city name if available
            if (city != null && city.isNotEmpty) {
              _regionController.text = city;
            }
            
            // Set location to full address (not coordinates)
            if (address != null && address.isNotEmpty) {
              _locationController.text = address;
            } else {
              // Fallback to coordinates only if geocoding fails
              _locationController.text = 
                  'Lat: ${lat.toStringAsFixed(4)}, Lng: ${lng.toStringAsFixed(4)}';
            }
          });
        }
      } else if (result.errorMessage != null) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(result.errorMessage!),
              backgroundColor: AppTheme.warningRed,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error getting location: $e'),
            backgroundColor: AppTheme.warningRed,
          ),
        );
      }
    } finally {
      setState(() {
        _isLoadingLocation = false;
      });
    }
  }

  void _nextStep() {
    if (_validateCurrentStep()) {
      if (_currentStep < 2) {
        setState(() {
          _currentStep++;
        });
        
        // Check location permission when reaching step 3 (location step)
        if (_currentStep == 2) {
          _checkLocationPermissionOnStep3();
        }
      } else {
        _register();
      }
    }
  }

  void _previousStep() {
    if (_currentStep > 0) {
      setState(() {
        _currentStep--;
      });
    }
  }

  bool _validateCurrentStep() {
    switch (_currentStep) {
      case 0:
        return _validateStep1();
      case 1:
        return _validateStep2();
      case 2:
        return _validateStep3();
      default:
        return false;
    }
  }

  bool _validateStep1() {
    if (Validators.validateEmail(_emailController.text) != null) {
      _showError('Please enter a valid email');
      return false;
    }
    if (Validators.validatePassword(_passwordController.text) != null) {
      _showError('Password must be at least 6 characters');
      return false;
    }
    if (_passwordController.text != _confirmPasswordController.text) {
      _showError('Passwords do not match');
      return false;
    }
    return true;
  }

  bool _validateStep2() {
    if (Validators.validateName(_nameController.text) != null) {
      _showError('Please enter your name');
      return false;
    }
    if (Validators.validatePhoneNumber(_phoneController.text) != null) {
      _showError('Please enter a valid phone number');
      return false;
    }
    return true;
  }

  bool _validateStep3() {
    // Location is optional
    return true;
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: AppTheme.warningRed,
      ),
    );
  }

  void _register() {
    context.read<AuthCubit>().register(
          name: _nameController.text.trim(),
          email: _emailController.text.trim(),
          password: _passwordController.text,
          phoneNumber: _phoneController.text.trim(),
          regionName: _regionController.text.trim().isEmpty
              ? null
              : _regionController.text.trim(),
          location: _locationController.text.trim().isEmpty
              ? null
              : _locationController.text.trim(),
          lat: _lat,
          lng: _lng,
        );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundLight,
      appBar: AppBar(
        title: const Text('Create Account'),
      ),
      body: BlocConsumer<AuthCubit, AuthState>(
        listener: (context, state) {
          if (state is AuthAuthenticated) {
            Navigator.of(context).pushAndRemoveUntil(
              MaterialPageRoute(builder: (_) => const HomeScreen()),
              (route) => false,
            );
          } else if (state is AuthError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: AppTheme.warningRed,
              ),
            );
          }
        },
        builder: (context, state) {
          final isLoading = state is AuthLoading;

          return SafeArea(
            child: Column(
              children: [
                // Progress indicator
                LinearProgressIndicator(
                  value: (_currentStep + 1) / 3,
                  backgroundColor: AppTheme.dividerColor,
                  valueColor: const AlwaysStoppedAnimation<Color>(
                    AppTheme.primaryGreen,
                  ),
                ),
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(24.0),
                    child: Form(
                      key: _formKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Text(
                            'Step ${_currentStep + 1} of 3',
                            style: Theme.of(context)
                                .textTheme
                                .bodyMedium
                                ?.copyWith(
                                  color: AppTheme.textLight,
                                ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            _getStepTitle(),
                            style: Theme.of(context).textTheme.headlineMedium,
                          ),
                          const SizedBox(height: 32),
                          _buildStepContent(),
                        ],
                      ),
                    ),
                  ),
                ),
                // Navigation buttons
                Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Row(
                    children: [
                      if (_currentStep > 0)
                        Expanded(
                          child: OutlinedButton(
                            onPressed: isLoading ? null : _previousStep,
                            child: const Text('Back'),
                          ),
                        ),
                      if (_currentStep > 0) const SizedBox(width: 16),
                      Expanded(
                        flex: 2,
                        child: ElevatedButton(
                          onPressed: isLoading ? null : _nextStep,
                          child: isLoading
                              ? const SizedBox(
                                  height: 20,
                                  width: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    valueColor: AlwaysStoppedAnimation<Color>(
                                      Colors.white,
                                    ),
                                  ),
                                )
                              : Text(_currentStep == 2 ? 'Register' : 'Next'),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  String _getStepTitle() {
    switch (_currentStep) {
      case 0:
        return 'Account Credentials';
      case 1:
        return 'Personal Information';
      case 2:
        return 'Location (Optional)';
      default:
        return '';
    }
  }

  Widget _buildStepContent() {
    switch (_currentStep) {
      case 0:
        return _buildStep1();
      case 1:
        return _buildStep2();
      case 2:
        return _buildStep3();
      default:
        return const SizedBox();
    }
  }

  Widget _buildStep1() {
    return Column(
      children: [
        TextFormField(
          controller: _emailController,
          keyboardType: TextInputType.emailAddress,
          decoration: const InputDecoration(
            labelText: 'Email',
            prefixIcon: Icon(Icons.email_outlined),
          ),
        ),
        const SizedBox(height: 16),
        TextFormField(
          controller: _passwordController,
          obscureText: _obscurePassword,
          decoration: InputDecoration(
            labelText: 'Password',
            prefixIcon: const Icon(Icons.lock_outline),
            suffixIcon: IconButton(
              icon: Icon(
                _obscurePassword
                    ? Icons.visibility_outlined
                    : Icons.visibility_off_outlined,
              ),
              onPressed: () {
                setState(() {
                  _obscurePassword = !_obscurePassword;
                });
              },
            ),
          ),
        ),
        const SizedBox(height: 16),
        TextFormField(
          controller: _confirmPasswordController,
          obscureText: _obscureConfirmPassword,
          decoration: InputDecoration(
            labelText: 'Confirm Password',
            prefixIcon: const Icon(Icons.lock_outline),
            suffixIcon: IconButton(
              icon: Icon(
                _obscureConfirmPassword
                    ? Icons.visibility_outlined
                    : Icons.visibility_off_outlined,
              ),
              onPressed: () {
                setState(() {
                  _obscureConfirmPassword = !_obscureConfirmPassword;
                });
              },
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildStep2() {
    return Column(
      children: [
        TextFormField(
          controller: _nameController,
          decoration: const InputDecoration(
            labelText: 'Full Name',
            prefixIcon: Icon(Icons.person_outline),
          ),
        ),
        const SizedBox(height: 16),
        TextFormField(
          controller: _phoneController,
          keyboardType: TextInputType.phone,
          decoration: const InputDecoration(
            labelText: 'Phone Number',
            prefixIcon: Icon(Icons.phone_outlined),
            hintText: '+91XXXXXXXXXX',
          ),
        ),
      ],
    );
  }

  Widget _buildStep3() {
    return Column(
      children: [
        TextFormField(
          controller: _regionController,
          decoration: const InputDecoration(
            labelText: 'Region/State',
            prefixIcon: Icon(Icons.map_outlined),
            hintText: 'e.g., Maharashtra',
          ),
        ),
        const SizedBox(height: 16),
        TextFormField(
          controller: _locationController,
          decoration: InputDecoration(
            labelText: 'Location',
            prefixIcon: const Icon(Icons.location_on_outlined),
            hintText: 'e.g., Pune District',
            suffixIcon: IconButton(
              icon: _isLoadingLocation
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.my_location),
              onPressed: _isLoadingLocation ? null : _getCurrentLocation,
            ),
          ),
        ),
        const SizedBox(height: 16),
        Text(
          'We use your location to show nearby climate jobs',
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: AppTheme.textLight,
              ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }
}
