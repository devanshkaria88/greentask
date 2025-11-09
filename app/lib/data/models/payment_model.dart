import 'package:equatable/equatable.dart';

class PaymentModel extends Equatable {
  final String paymentId;
  final String? jobId;
  final String? workerId;
  final double amount;
  final String status;
  final DateTime createdAt;
  final DateTime? approvedAt;
  final DateTime? paidAt;
  final String? jobTitle;

  const PaymentModel({
    required this.paymentId,
    this.jobId,
    this.workerId,
    required this.amount,
    required this.status,
    required this.createdAt,
    this.approvedAt,
    this.paidAt,
    this.jobTitle,
  });

  factory PaymentModel.fromJson(Map<String, dynamic> json) {
    return PaymentModel(
      paymentId: json['payment_id'] as String,
      jobId: json['job_id'] as String?,
      workerId: json['worker_id'] as String?,
      amount: (json['amount'] as num).toDouble(),
      status: json['status'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
      approvedAt: json['approved_at'] != null
          ? DateTime.parse(json['approved_at'] as String)
          : null,
      paidAt: json['paid_at'] != null
          ? DateTime.parse(json['paid_at'] as String)
          : null,
      jobTitle: json['job_title'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'payment_id': paymentId,
      if (jobId != null) 'job_id': jobId,
      if (workerId != null) 'worker_id': workerId,
      'amount': amount,
      'status': status,
      'created_at': createdAt.toIso8601String(),
      'approved_at': approvedAt?.toIso8601String(),
      'paid_at': paidAt?.toIso8601String(),
      'job_title': jobTitle,
    };
  }

  @override
  List<Object?> get props => [
        paymentId,
        jobId,
        workerId,
        amount,
        status,
        createdAt,
        approvedAt,
        paidAt,
        jobTitle,
      ];
}

class WalletModel extends Equatable {
  final double totalEarned;
  final double pendingAmount;
  final double paidAmount;
  final List<PaymentModel> transactions;

  const WalletModel({
    required this.totalEarned,
    required this.pendingAmount,
    required this.paidAmount,
    required this.transactions,
  });

  factory WalletModel.fromJson(Map<String, dynamic> json) {
    return WalletModel(
      totalEarned: (json['total_earned'] as num).toDouble(),
      pendingAmount: (json['pending_amount'] as num).toDouble(),
      paidAmount: (json['paid_amount'] as num).toDouble(),
      transactions: (json['transactions'] as List<dynamic>)
          .map((e) => PaymentModel.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }

  @override
  List<Object?> get props => [
        totalEarned,
        pendingAmount,
        paidAmount,
        transactions,
      ];
}
