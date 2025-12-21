import 'dart:io';

class ApiConstants {
  static String get baseUrl {
    if (Platform.isAndroid) {
      // Windows Emülatör backend'e bu IP ile ulaşır
      return 'http://10.0.2.2:3000';
    } else {
      // iOS Simülatör veya gerçek cihaz (localhost gerekirse IP ile değiştirilmeli)
      return 'http://localhost:3000';
    }
  }
}
