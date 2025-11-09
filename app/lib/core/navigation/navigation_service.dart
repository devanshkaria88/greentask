import 'package:flutter/material.dart';

class NavigationService {
  final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

  NavigatorState? get navigator => navigatorKey.currentState;

  BuildContext? get context => navigatorKey.currentContext;

  Future<dynamic>? navigateTo(String routeName, {Object? arguments}) {
    return navigator?.pushNamed(routeName, arguments: arguments);
  }

  Future<dynamic>? navigateToReplacement(String routeName, {Object? arguments}) {
    return navigator?.pushReplacementNamed(routeName, arguments: arguments);
  }

  Future<dynamic>? navigateToAndRemoveUntil(
    String routeName, {
    Object? arguments,
    bool Function(Route<dynamic>)? predicate,
  }) {
    return navigator?.pushNamedAndRemoveUntil(
      routeName,
      predicate ?? (route) => false,
      arguments: arguments,
    );
  }

  void goBack({dynamic result}) {
    if (navigator?.canPop() ?? false) {
      navigator?.pop(result);
    }
  }

  Future<dynamic>? navigateToWidget(Widget widget) {
    return navigator?.push(
      MaterialPageRoute(builder: (_) => widget),
    );
  }

  Future<dynamic>? navigateToWidgetReplacement(Widget widget) {
    return navigator?.pushReplacement(
      MaterialPageRoute(builder: (_) => widget),
    );
  }

  Future<dynamic>? navigateToWidgetAndRemoveUntil(Widget widget) {
    return navigator?.pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => widget),
      (route) => false,
    );
  }
}
