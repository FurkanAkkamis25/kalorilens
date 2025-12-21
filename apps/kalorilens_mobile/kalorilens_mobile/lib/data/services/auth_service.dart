import 'package:dio/dio.dart';
import '../../core/constants/api_constants.dart';

class AuthService {
  final Dio _dio = Dio();

  Future<String?> login(String email, String password) async {
    try {
      final response = await _dio.post(
        '${ApiConstants.baseUrl}/auth/login',
        data: {'email': email, 'password': password},
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        // Token dönüyor: { "access_token": "..." }
        return response.data['access_token'];
      }
      return null;
    } catch (e) {
      print('Login Error: $e');
      return null;
    }
  }

  Future<bool> register(String email, String password, String name) async {
    try {
      final response = await _dio.post(
        '${ApiConstants.baseUrl}/auth/register',
        data: {
          // Backend DTO'suna göre firebaseUid gerekiyor ama şimdilik manuel oluşturuyoruz
          // Normalde Firebase Auth kullanılır ama biz direkt backend auth yapıyoruz
          'firebaseUid': 'uid_${DateTime.now().millisecondsSinceEpoch}',
          'email': email,
          'password': password,
          'ad_soyad': name,
        },
      );
      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      print('Register Error: $e');
      return false;
    }
  }
}
