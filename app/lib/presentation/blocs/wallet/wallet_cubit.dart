import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../data/repositories/payment_repository.dart';
import '../../../core/utils/logger.dart';
import 'wallet_state.dart';

class WalletCubit extends Cubit<WalletState> {
  final PaymentRepository _paymentRepository;

  WalletCubit(this._paymentRepository) : super(WalletInitial());

  Future<void> loadWallet() async {
    try {
      emit(WalletLoading());

      final wallet = await _paymentRepository.getWallet();

      emit(WalletLoaded(wallet));
    } catch (e) {
      AppLogger.error('Error loading wallet', e);
      emit(WalletError(e.toString()));
    }
  }
}
