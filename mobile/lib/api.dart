import 'dart:convert';

import 'package:flutter/services.dart' show rootBundle;
import 'package:http/http.dart' as http;

import 'models.dart';

/// Talks to the Orbita API: Cloudflare Pages Functions in production, or
/// the Go server locally. Override with
/// `flutter run --dart-define=API_BASE=http://10.0.2.2:8080`.
class OrbitaApi {
  OrbitaApi({http.Client? client}) : _client = client ?? http.Client();

  static const base = String.fromEnvironment(
    'API_BASE',
    defaultValue: 'https://orbita.pages.dev',
  );

  final http.Client _client;

  /// Loads the catalog from the API, falling back to the bundled copy so the
  /// app still works offline.
  Future<Catalog> loadCatalog() async {
    try {
      final responses = await Future.wait([
        _client.get(Uri.parse('$base/api/apps')),
        _client.get(Uri.parse('$base/api/plans')),
      ]).timeout(const Duration(seconds: 6));
      if (responses.any((r) => r.statusCode != 200)) {
        throw Exception('API error');
      }
      final apps = jsonDecode(responses[0].body) as Map<String, dynamic>;
      return Catalog.fromJson({...apps, 'plans': jsonDecode(responses[1].body)});
    } catch (_) {
      final raw = await rootBundle.loadString('assets/catalog.json');
      return Catalog.fromJson(jsonDecode(raw) as Map<String, dynamic>);
    }
  }

  /// Sends a contact request. The API stores it in Firebase Firestore.
  Future<void> createLead({
    required String name,
    required String email,
    String company = '',
    String message = '',
  }) async {
    final res = await _client
        .post(
          Uri.parse('$base/api/contact'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({
            'name': name,
            'email': email,
            'company': company,
            'message': message,
          }),
        )
        .timeout(const Duration(seconds: 10));
    if (res.statusCode != 201) {
      String msg = 'HTTP ${res.statusCode}';
      try {
        msg = (jsonDecode(res.body) as Map<String, dynamic>)['error'] as String? ?? msg;
      } catch (_) {}
      throw Exception(msg);
    }
  }
}
