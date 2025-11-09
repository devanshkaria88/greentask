import '../../core/network/api_client.dart';
import '../../core/constants/app_constants.dart';
import '../models/payment_model.dart';

class PaymentRepository {
  final ApiClient _apiClient;

  PaymentRepository(this._apiClient);

  Future<WalletModel> getWallet() async {
    final response = await _apiClient.get(
      AppConstants.paymentsWalletEndpoint,
    );

    return WalletModel.fromJson(response.data['data']);
  }
}
