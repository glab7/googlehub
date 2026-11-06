import 'package:flutter/material.dart';

class OrbitaApp {
  const OrbitaApp({
    required this.id,
    required this.name,
    required this.category,
    required this.color,
    required this.tagline,
  });

  final String id;
  final String name;
  final String category;
  final Color color;
  final String tagline;

  factory OrbitaApp.fromJson(Map<String, dynamic> j) => OrbitaApp(
        id: j['id'] as String,
        name: j['name'] as String,
        category: j['category'] as String,
        color: _hex(j['color'] as String),
        tagline: j['tagline'] as String,
      );

  static Color _hex(String hex) =>
      Color(int.parse(hex.replaceFirst('#', ''), radix: 16) | 0xFF000000);
}

class Plan {
  const Plan({
    required this.id,
    required this.name,
    required this.monthly,
    required this.yearly,
    required this.description,
    required this.features,
    required this.highlight,
  });

  final String id;
  final String name;
  final double monthly;
  final double yearly;
  final String description;
  final List<String> features;
  final bool highlight;

  factory Plan.fromJson(Map<String, dynamic> j) => Plan(
        id: j['id'] as String,
        name: j['name'] as String,
        monthly: (j['monthly'] as num).toDouble(),
        yearly: (j['yearly'] as num).toDouble(),
        description: j['description'] as String,
        features: (j['features'] as List).cast<String>(),
        highlight: j['highlight'] as bool? ?? false,
      );
}

class Catalog {
  const Catalog({required this.categories, required this.apps, required this.plans});

  final List<String> categories;
  final List<OrbitaApp> apps;
  final List<Plan> plans;

  factory Catalog.fromJson(Map<String, dynamic> j) => Catalog(
        categories: (j['categories'] as List).cast<String>(),
        apps: (j['apps'] as List)
            .map((e) => OrbitaApp.fromJson(e as Map<String, dynamic>))
            .toList(),
        plans: (j['plans'] as List)
            .map((e) => Plan.fromJson(e as Map<String, dynamic>))
            .toList(),
      );
}
