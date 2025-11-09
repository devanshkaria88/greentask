import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/utils/date_utils.dart';
import '../../blocs/wallet/wallet_cubit.dart';
import '../../blocs/wallet/wallet_state.dart';

class WalletScreen extends StatefulWidget {
  const WalletScreen({super.key});

  @override
  State<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends State<WalletScreen> {
  @override
  void initState() {
    super.initState();
    _loadWallet();
  }

  void _loadWallet() {
    context.read<WalletCubit>().loadWallet();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Wallet'),
      ),
      body: BlocBuilder<WalletCubit, WalletState>(
        builder: (context, state) {
          if (state is WalletLoading) {
            return const Center(child: CircularProgressIndicator());
          } else if (state is WalletLoaded) {
            return RefreshIndicator(
              onRefresh: () async {
                _loadWallet();
              },
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Balance Card
                    Container(
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [
                            AppTheme.primaryGreen,
                            AppTheme.lightGreen,
                          ],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: AppTheme.primaryGreen.withOpacity(0.3),
                            blurRadius: 12,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Total Earned',
                            style: Theme.of(context)
                                .textTheme
                                .titleMedium
                                ?.copyWith(
                                  color: Colors.white.withOpacity(0.9),
                                ),
                          ),
                          const SizedBox(height: 8),
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const FaIcon(
                                FontAwesomeIcons.indianRupeeSign,
                                color: Colors.white,
                                size: 32,
                              ),
                              const SizedBox(width: 8),
                              Text(
                                state.wallet.totalEarned.toStringAsFixed(0),
                                style: Theme.of(context)
                                    .textTheme
                                    .displayLarge
                                    ?.copyWith(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
                                    ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 24),
                          Row(
                            children: [
                              Expanded(
                                child: _buildBalanceItem(
                                  context,
                                  'Pending',
                                  state.wallet.pendingAmount,
                                  AppTheme.accentOrange,
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: _buildBalanceItem(
                                  context,
                                  'Paid',
                                  state.wallet.paidAmount,
                                  Colors.white,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 32),
                    // Transaction History
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Transaction History',
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                        Text(
                          '${state.wallet.transactions.length} transactions',
                          style:
                              Theme.of(context).textTheme.bodySmall?.copyWith(
                                    color: AppTheme.textLight,
                                  ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    if (state.wallet.transactions.isEmpty)
                      Center(
                        child: Padding(
                          padding: const EdgeInsets.all(48.0),
                          child: Column(
                            children: [
                              const FaIcon(
                                FontAwesomeIcons.receipt,
                                size: 64,
                                color: AppTheme.textLight,
                              ),
                              const SizedBox(height: 16),
                              Text(
                                'No transactions yet',
                                style: Theme.of(context).textTheme.titleMedium,
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'Complete jobs to earn money',
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
                      )
                    else
                      ...state.wallet.transactions.map(
                        (transaction) => Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: _buildTransactionCard(context, transaction),
                        ),
                      ),
                  ],
                ),
              ),
            );
          } else if (state is WalletError) {
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
                    'Error loading wallet',
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
                    onPressed: _loadWallet,
                    child: const Text('Retry'),
                  ),
                ],
              ),
            );
          }

          return const Center(child: Text('Wallet'));
        },
      ),
    );
  }

  Widget _buildBalanceItem(
    BuildContext context,
    String label,
    double amount,
    Color color,
  ) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.2),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Colors.white.withOpacity(0.9),
                ),
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              FaIcon(
                FontAwesomeIcons.indianRupeeSign,
                color: color,
                size: 14,
              ),
              const SizedBox(width: 4),
              Text(
                amount.toStringAsFixed(0),
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      color: color,
                      fontWeight: FontWeight.bold,
                    ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTransactionCard(BuildContext context, transaction) {
    Color statusColor;
    String statusText;

    switch (transaction.status) {
      case AppConstants.paymentStatusPending:
        statusColor = AppTheme.accentOrange;
        statusText = 'Pending';
        break;
      case AppConstants.paymentStatusApproved:
        statusColor = AppTheme.infoBlue;
        statusText = 'Approved';
        break;
      case AppConstants.paymentStatusPaid:
        statusColor = AppTheme.primaryGreen;
        statusText = 'Paid';
        break;
      default:
        statusColor = AppTheme.textLight;
        statusText = transaction.status;
    }

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: statusColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                Icons.work_outline,
                color: statusColor,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    transaction.jobTitle ?? 'Job Payment',
                    style: Theme.of(context).textTheme.titleMedium,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    AppDateUtils.formatDate(transaction.createdAt),
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppTheme.textLight,
                        ),
                  ),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Row(
                  children: [
                    const FaIcon(
                      FontAwesomeIcons.indianRupeeSign,
                      size: 14,
                      color: AppTheme.primaryGreen,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      transaction.amount.toStringAsFixed(0),
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            color: AppTheme.primaryGreen,
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    statusText,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: statusColor,
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
