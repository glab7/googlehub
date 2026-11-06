import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'api.dart';
import 'models.dart';

const plum = Color(0xFF714B67);
const plumDark = Color(0xFF5A3A52);
const plumSoft = Color(0xFFF3EDF2);
const teal = Color(0xFF017E84);
const ink = Color(0xFF1F1D26);
const muted = Color(0xFF5F5B6B);
const line = Color(0xFFE7E4EC);
const bgAlt = Color(0xFFF8F6FA);
const marker = Color(0xFFFFD86B);

const categoryIcons = <String, IconData>{
  'Finance': Icons.bar_chart_rounded,
  'Sales': Icons.track_changes_rounded,
  'Websites': Icons.web_rounded,
  'Supply Chain': Icons.inventory_2_rounded,
  'Human Resources': Icons.groups_rounded,
  'Marketing': Icons.campaign_rounded,
  'Services': Icons.dashboard_rounded,
  'Productivity': Icons.forum_rounded,
};

void main() => runApp(const OrbitaRoot());

class OrbitaRoot extends StatelessWidget {
  const OrbitaRoot({super.key});

  @override
  Widget build(BuildContext context) {
    final base = ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(seedColor: plum, primary: plum, secondary: teal),
      scaffoldBackgroundColor: Colors.white,
    );
    return MaterialApp(
      title: 'Orbita',
      debugShowCheckedModeBanner: false,
      theme: base.copyWith(
        textTheme: GoogleFonts.interTextTheme(base.textTheme).apply(bodyColor: ink, displayColor: ink),
        filledButtonTheme: FilledButtonThemeData(
          style: FilledButton.styleFrom(
            backgroundColor: plum,
            padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 16),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            textStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
          ),
        ),
      ),
      home: const HomePage(),
    );
  }
}

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final _api = OrbitaApi();
  late final Future<Catalog> _catalog = _api.loadCatalog();
  final _scroll = ScrollController();
  final _appsKey = GlobalKey();
  final _pricingKey = GlobalKey();

  void _scrollTo(GlobalKey key) {
    final ctx = key.currentContext;
    if (ctx != null) {
      Scrollable.ensureVisible(ctx, duration: const Duration(milliseconds: 500), curve: Curves.easeOutCubic);
    }
  }

  void _openContact() {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      backgroundColor: Colors.white,
      builder: (_) => ContactSheet(api: _api),
    );
  }

  @override
  void dispose() {
    _scroll.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.white.withValues(alpha: .92),
        surfaceTintColor: Colors.transparent,
        titleSpacing: 16,
        title: const Logo(),
        actions: [
          TextButton(onPressed: () => _scrollTo(_appsKey), child: const Text('Apps')),
          TextButton(onPressed: () => _scrollTo(_pricingKey), child: const Text('Pricing')),
          Padding(
            padding: const EdgeInsets.only(right: 12, left: 4),
            child: FilledButton(
              style: FilledButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10)),
              onPressed: _openContact,
              child: const Text('Contact us', style: TextStyle(fontSize: 14)),
            ),
          ),
        ],
      ),
      body: FutureBuilder<Catalog>(
        future: _catalog,
        builder: (context, snap) {
          return CustomScrollView(
            controller: _scroll,
            slivers: [
              SliverToBoxAdapter(child: HeroSection(onStart: _openContact, onAdvisor: () => _scrollTo(_pricingKey))),
              SliverToBoxAdapter(
                key: _appsKey,
                child: snap.hasData
                    ? AppsSection(catalog: snap.data!)
                    : const Padding(padding: EdgeInsets.all(48), child: Center(child: CircularProgressIndicator())),
              ),
              const SliverToBoxAdapter(child: StatsSection()),
              const SliverToBoxAdapter(child: FeaturesSection()),
              if (snap.hasData)
                SliverToBoxAdapter(
                  key: _pricingKey,
                  child: PricingSection(plans: snap.data!.plans, onSelect: _openContact),
                ),
              SliverToBoxAdapter(child: CtaSection(onStart: _openContact)),
              const SliverToBoxAdapter(child: Footer()),
            ],
          );
        },
      ),
    );
  }
}

// ------------------------------------------------------------------ pieces

class Logo extends StatelessWidget {
  const Logo({super.key, this.light = false});
  final bool light;

  @override
  Widget build(BuildContext context) {
    return Row(mainAxisSize: MainAxisSize.min, children: [
      Container(
        width: 22,
        height: 22,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: Border.all(color: light ? Colors.white : plum, width: 2),
          gradient: const SweepGradient(colors: [plum, teal, Color(0xFFE0A43B), plum]),
        ),
        child: Center(
          child: Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(shape: BoxShape.circle, color: light ? const Color(0xFF2A2530) : Colors.white),
          ),
        ),
      ),
      const SizedBox(width: 8),
      Text('orbita',
          style: TextStyle(
            fontWeight: FontWeight.w800,
            fontSize: 24,
            letterSpacing: -1,
            color: light ? Colors.white : plum,
          )),
    ]);
  }
}

/// Text with a hand-drawn highlighter stroke behind it.
class Marker extends StatelessWidget {
  const Marker(this.text, {super.key, required this.style, this.color = marker});
  final String text;
  final TextStyle style;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: 1),
      duration: const Duration(milliseconds: 900),
      curve: Curves.easeOutCubic,
      builder: (_, t, child) => CustomPaint(painter: _MarkerPainter(t, color), child: child),
      child: Text(text, style: style),
    );
  }
}

class _MarkerPainter extends CustomPainter {
  _MarkerPainter(this.progress, this.color);
  final double progress;
  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final h = size.height * .36;
    final rect = Rect.fromLTWH(-4, size.height - h - size.height * .08, (size.width + 8) * progress, h);
    canvas.save();
    canvas.translate(0, size.height);
    canvas.rotate(-0.012);
    canvas.translate(0, -size.height);
    canvas.drawRRect(RRect.fromRectAndRadius(rect, const Radius.circular(8)), Paint()..color = color);
    canvas.restore();
  }

  @override
  bool shouldRepaint(_MarkerPainter old) => old.progress != progress || old.color != color;
}

TextStyle handStyle(double size, [Color color = teal]) =>
    GoogleFonts.caveat(fontSize: size, fontWeight: FontWeight.w700, color: color, height: 1);

class SectionTitle extends StatelessWidget {
  const SectionTitle(this.text, {super.key, this.accent, this.subtitle});
  final String text;
  final String? accent;
  final String? subtitle;

  @override
  Widget build(BuildContext context) {
    final w = MediaQuery.sizeOf(context).width;
    final size = w < 600 ? 28.0 : 40.0;
    return Column(children: [
      Text(text,
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: size, fontWeight: FontWeight.w800, letterSpacing: -.8, height: 1.15)),
      if (accent != null) ...[
        const SizedBox(height: 4),
        Text(accent!, textAlign: TextAlign.center, style: handStyle(size * 1.2)),
      ],
      if (subtitle != null) ...[
        const SizedBox(height: 14),
        ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 560),
          child: Text(subtitle!, textAlign: TextAlign.center, style: const TextStyle(fontSize: 16, color: muted, height: 1.5)),
        ),
      ],
    ]);
  }
}

class Section extends StatelessWidget {
  const Section({super.key, required this.child, this.color, this.vertical = 64});
  final Widget child;
  final Color? color;
  final double vertical;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: color,
      padding: EdgeInsets.symmetric(horizontal: 16, vertical: vertical),
      alignment: Alignment.topCenter,
      child: ConstrainedBox(constraints: const BoxConstraints(maxWidth: 1180), child: child),
    );
  }
}

// ------------------------------------------------------------------ hero

class HeroSection extends StatelessWidget {
  const HeroSection({super.key, required this.onStart, required this.onAdvisor});
  final VoidCallback onStart;
  final VoidCallback onAdvisor;

  @override
  Widget build(BuildContext context) {
    final w = MediaQuery.sizeOf(context).width;
    final size = w < 600 ? 40.0 : 68.0;
    final title = TextStyle(fontSize: size, fontWeight: FontWeight.w800, letterSpacing: -1.5, height: 1.08);
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFFF7EFF5), Colors.white, Color(0xFFEAF7F6)],
        ),
      ),
      child: Section(
        vertical: w < 600 ? 56 : 88,
        child: Column(children: [
          Text('Every business app.', textAlign: TextAlign.center, style: title),
          Marker('One platform.', style: title),
          const SizedBox(height: 20),
          Text.rich(
            const TextSpan(children: [
              TextSpan(text: 'Simple to start, powerful as you grow, '),
              TextSpan(text: 'priced like it should be.', style: TextStyle(color: ink, fontWeight: FontWeight.w600)),
            ]),
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: w < 600 ? 17 : 21, color: muted, height: 1.5),
          ),
          const SizedBox(height: 30),
          Wrap(spacing: 12, runSpacing: 12, alignment: WrapAlignment.center, children: [
            FilledButton(onPressed: onStart, child: const Text('Get started')),
            OutlinedButton(
              onPressed: onAdvisor,
              style: OutlinedButton.styleFrom(
                foregroundColor: ink,
                backgroundColor: bgAlt,
                side: const BorderSide(color: line),
                padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                textStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
              ),
              child: const Text('Meet an advisor'),
            ),
          ]),
          const SizedBox(height: 20),
          Row(mainAxisSize: MainAxisSize.min, children: [
            const Icon(Icons.arrow_forward_rounded, color: teal, size: 20),
            const SizedBox(width: 6),
            Text('Free, forever, with unlimited users.', style: handStyle(22)),
          ]),
        ]),
      ),
    );
  }
}

// ------------------------------------------------------------------ apps

class AppsSection extends StatefulWidget {
  const AppsSection({super.key, required this.catalog});
  final Catalog catalog;

  @override
  State<AppsSection> createState() => _AppsSectionState();
}

class _AppsSectionState extends State<AppsSection> {
  String _category = 'All';
  String _query = '';

  @override
  Widget build(BuildContext context) {
    final q = _query.trim().toLowerCase();
    final apps = widget.catalog.apps
        .where((a) =>
            (_category == 'All' || a.category == _category) &&
            (q.isEmpty || '${a.name} ${a.tagline}'.toLowerCase().contains(q)))
        .toList();

    return Section(
      vertical: 32,
      child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        Wrap(spacing: 6, runSpacing: 6, children: [
          for (final c in ['All', ...widget.catalog.categories])
            ChoiceChip(
              label: Text(c),
              selected: c == _category,
              showCheckmark: false,
              selectedColor: plum,
              backgroundColor: Colors.white,
              side: BorderSide(color: c == _category ? plum : line),
              shape: const StadiumBorder(),
              labelStyle: TextStyle(
                color: c == _category ? Colors.white : muted,
                fontWeight: FontWeight.w500,
              ),
              onSelected: (_) => setState(() => _category = c),
            ),
        ]),
        const SizedBox(height: 14),
        TextField(
          onChanged: (v) => setState(() => _query = v),
          decoration: InputDecoration(
            hintText: 'Search apps…',
            prefixIcon: const Icon(Icons.search_rounded),
            isDense: true,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: line)),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: line)),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: plum, width: 1.5)),
          ),
        ),
        const SizedBox(height: 24),
        if (apps.isEmpty)
          const Padding(
            padding: EdgeInsets.all(32),
            child: Text('No app matches your search.', textAlign: TextAlign.center, style: TextStyle(color: muted)),
          )
        else
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
              maxCrossAxisExtent: 124,
              mainAxisExtent: 124,
              crossAxisSpacing: 8,
              mainAxisSpacing: 8,
            ),
            itemCount: apps.length,
            itemBuilder: (_, i) => AppTile(app: apps[i], index: i),
          ),
      ]),
    );
  }
}

class AppTile extends StatefulWidget {
  const AppTile({super.key, required this.app, required this.index});
  final OrbitaApp app;
  final int index;

  @override
  State<AppTile> createState() => _AppTileState();
}

class _AppTileState extends State<AppTile> {
  bool _hover = false;

  @override
  Widget build(BuildContext context) {
    final app = widget.app;
    return TweenAnimationBuilder<double>(
      key: ValueKey(app.id),
      tween: Tween(begin: 0, end: 1),
      duration: Duration(milliseconds: 300 + (widget.index * 18).clamp(0, 400)),
      curve: Curves.easeOutCubic,
      builder: (_, t, child) => Opacity(
        opacity: t,
        child: Transform.translate(offset: Offset(0, 8 * (1 - t)), child: child),
      ),
      child: MouseRegion(
        onEnter: (_) => setState(() => _hover = true),
        onExit: (_) => setState(() => _hover = false),
        child: Tooltip(
          message: app.tagline,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 150),
            transform: Matrix4.translationValues(0, _hover ? -3 : 0, 0),
            decoration: BoxDecoration(
              color: _hover ? bgAlt : Colors.transparent,
              borderRadius: BorderRadius.circular(14),
            ),
            child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
              Container(
                width: 62,
                height: 62,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(18),
                  boxShadow: [
                    BoxShadow(
                      color: ink.withValues(alpha: _hover ? .12 : .06),
                      blurRadius: _hover ? 22 : 8,
                      offset: Offset(0, _hover ? 8 : 2),
                    ),
                  ],
                ),
                child: Icon(categoryIcons[app.category] ?? Icons.apps_rounded, color: app.color, size: 34),
              ),
              const SizedBox(height: 10),
              Text(
                app.name,
                textAlign: TextAlign.center,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, height: 1.2),
              ),
            ]),
          ),
        ),
      ),
    );
  }
}

// ------------------------------------------------------------------ stats & features

class StatsSection extends StatelessWidget {
  const StatsSection({super.key});

  @override
  Widget build(BuildContext context) {
    const stats = [(40, 'integrated apps'), (2500, 'community modules'), (120, 'countries served'), (99, '% uptime SLA')];
    return Section(
      color: bgAlt,
      child: Column(children: [
        const SectionTitle(
          'Imagine a vast collection of business apps',
          accent: 'at your disposal.',
          subtitle: 'Got something to improve? There is an app for that. No complexity, no cost, just a one-click install.',
        ),
        const SizedBox(height: 36),
        LayoutBuilder(builder: (context, c) {
          final cols = c.maxWidth < 600 ? 2 : 4;
          final itemW = (c.maxWidth - 12 * (cols - 1)) / cols;
          return Wrap(spacing: 12, runSpacing: 12, children: [
            for (final (n, label) in stats)
              Container(
                width: itemW,
                padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 8),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14)),
                child: Column(children: [
                  TweenAnimationBuilder<double>(
                    tween: Tween(begin: 0, end: n.toDouble()),
                    duration: const Duration(milliseconds: 1400),
                    curve: Curves.easeOutCubic,
                    builder: (_, v, __) => Text(
                      v.round().toString(),
                      style: const TextStyle(fontSize: 36, fontWeight: FontWeight.w800, color: plum, letterSpacing: -1),
                    ),
                  ),
                  Text(label, style: const TextStyle(color: muted)),
                ]),
              ),
          ]);
        }),
      ]),
    );
  }
}

class FeaturesSection extends StatelessWidget {
  const FeaturesSection({super.key});

  @override
  Widget build(BuildContext context) {
    const features = [
      (
        'Fully integrated',
        'One database. Zero copy-paste.',
        'A sale updates inventory, inventory triggers purchase, purchase lands in accounting.',
        Icons.hub_rounded,
      ),
      (
        'Delightful UX',
        'Software your team actually enjoys.',
        'Clean screens, smart defaults and shortcuts everywhere. Onboarding takes hours, not months.',
        Icons.auto_awesome_rounded,
      ),
      (
        'Open & extensible',
        'Grows with you, not against you.',
        'Start with one app, add more as you need them, and build your own on an open API.',
        Icons.extension_rounded,
      ),
    ];
    return Section(
      child: Column(children: [
        Marker('Level up your quality of work',
            color: const Color(0xFF9EE6E0),
            style: TextStyle(
              fontSize: MediaQuery.sizeOf(context).width < 600 ? 28 : 40,
              fontWeight: FontWeight.w800,
              letterSpacing: -.8,
            )),
        const SizedBox(height: 32),
        LayoutBuilder(builder: (context, c) {
          final cols = c.maxWidth < 760 ? 1 : 3;
          final itemW = (c.maxWidth - 20 * (cols - 1)) / cols;
          return Wrap(spacing: 20, runSpacing: 20, children: [
            for (final (kicker, title, body, icon) in features)
              Container(
                width: itemW,
                padding: const EdgeInsets.all(26),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: line),
                ),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(color: plumSoft, borderRadius: BorderRadius.circular(12)),
                    child: Icon(icon, color: plum),
                  ),
                  const SizedBox(height: 16),
                  Text(kicker.toUpperCase(),
                      style: const TextStyle(color: teal, fontWeight: FontWeight.w700, fontSize: 12, letterSpacing: 1)),
                  const SizedBox(height: 6),
                  Text(title, style: const TextStyle(fontSize: 21, fontWeight: FontWeight.w700, height: 1.2)),
                  const SizedBox(height: 8),
                  Text(body, style: const TextStyle(color: muted, height: 1.5)),
                ]),
              ),
          ]);
        }),
      ]),
    );
  }
}

// ------------------------------------------------------------------ pricing

class PricingSection extends StatefulWidget {
  const PricingSection({super.key, required this.plans, required this.onSelect});
  final List<Plan> plans;
  final VoidCallback onSelect;

  @override
  State<PricingSection> createState() => _PricingSectionState();
}

class _PricingSectionState extends State<PricingSection> {
  bool _yearly = true;

  @override
  Widget build(BuildContext context) {
    return Section(
      color: plumSoft,
      child: Column(children: [
        const SectionTitle('Simple pricing, no surprises'),
        const SizedBox(height: 20),
        SegmentedButton<bool>(
          segments: const [
            ButtonSegment(value: true, label: Text('Yearly · save 20%')),
            ButtonSegment(value: false, label: Text('Monthly')),
          ],
          selected: {_yearly},
          showSelectedIcon: false,
          onSelectionChanged: (s) => setState(() => _yearly = s.first),
        ),
        const SizedBox(height: 32),
        LayoutBuilder(builder: (context, c) {
          final cols = c.maxWidth < 760 ? 1 : 3;
          final itemW = cols == 1 ? c.maxWidth.clamp(0.0, 440.0) : (c.maxWidth - 40) / 3;
          return Wrap(spacing: 20, runSpacing: 24, alignment: WrapAlignment.center, children: [
            for (final p in widget.plans) SizedBox(width: itemW, child: _PlanCard(plan: p, yearly: _yearly, onSelect: widget.onSelect)),
          ]);
        }),
        const SizedBox(height: 20),
        const Text('Prices per user, per month, excl. tax.', style: TextStyle(color: muted, fontSize: 13)),
      ]),
    );
  }
}

class _PlanCard extends StatelessWidget {
  const _PlanCard({required this.plan, required this.yearly, required this.onSelect});
  final Plan plan;
  final bool yearly;
  final VoidCallback onSelect;

  @override
  Widget build(BuildContext context) {
    final price = yearly ? plan.yearly : plan.monthly;
    return Stack(clipBehavior: Clip.none, children: [
      Container(
        padding: const EdgeInsets.all(28),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: plan.highlight ? plum : line, width: plan.highlight ? 2 : 1),
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(plan.name, style: const TextStyle(fontSize: 21, fontWeight: FontWeight.w700)),
          const SizedBox(height: 4),
          Text(plan.description, style: const TextStyle(color: muted)),
          const SizedBox(height: 18),
          AnimatedSwitcher(
            duration: const Duration(milliseconds: 250),
            child: Row(
              key: ValueKey(price),
              crossAxisAlignment: CrossAxisAlignment.baseline,
              textBaseline: TextBaseline.alphabetic,
              children: [
                Text(price == 0 ? 'Free' : '\$${price.toStringAsFixed(2)}',
                    style: const TextStyle(fontSize: 40, fontWeight: FontWeight.w800, letterSpacing: -1)),
                if (plan.monthly > 0) const Text('  / user / month', style: TextStyle(color: muted)),
              ],
            ),
          ),
          const SizedBox(height: 18),
          for (final f in plan.features)
            Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: Row(children: [
                const Icon(Icons.check_circle_rounded, color: teal, size: 20),
                const SizedBox(width: 10),
                Expanded(child: Text(f, style: const TextStyle(fontWeight: FontWeight.w500))),
              ]),
            ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: plan.highlight
                ? FilledButton(onPressed: onSelect, child: const Text('Get started'))
                : OutlinedButton(
                    onPressed: onSelect,
                    style: OutlinedButton.styleFrom(
                      foregroundColor: ink,
                      side: const BorderSide(color: line),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    child: const Text('Contact sales'),
                  ),
          ),
        ]),
      ),
      if (plan.highlight)
        Positioned(
          top: -12,
          left: 0,
          right: 0,
          child: Center(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              decoration: BoxDecoration(color: plum, borderRadius: BorderRadius.circular(99)),
              child: const Text('MOST POPULAR',
                  style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: .6)),
            ),
          ),
        ),
    ]);
  }
}

// ------------------------------------------------------------------ CTA & footer

class CtaSection extends StatelessWidget {
  const CtaSection({super.key, required this.onStart});
  final VoidCallback onStart;

  @override
  Widget build(BuildContext context) {
    return Section(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 56),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(28),
          gradient: const LinearGradient(colors: [plum, Color(0xFF8A5A7D), teal], stops: [0, .6, 1.4]),
        ),
        child: Column(children: [
          const Text('Unleash your growth potential',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.white, fontSize: 30, fontWeight: FontWeight.w800, letterSpacing: -.6)),
          const SizedBox(height: 10),
          Text('Join thousands of companies running their business on Orbita.',
              textAlign: TextAlign.center, style: TextStyle(color: Colors.white.withValues(alpha: .85), fontSize: 16)),
          const SizedBox(height: 24),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: Colors.white, foregroundColor: plum),
            onPressed: onStart,
            child: const Text('Talk to our team'),
          ),
        ]),
      ),
    );
  }
}

class Footer extends StatelessWidget {
  const Footer({super.key});

  @override
  Widget build(BuildContext context) {
    const cols = {
      'Community': ['Tutorials', 'Documentation', 'Forum', 'Events'],
      'Services': ['Hosting', 'Support', 'Upgrade', 'Partners'],
      'About us': ['Our company', 'Jobs', 'Contact us'],
    };
    const linkStyle = TextStyle(color: Color(0xFFC9C3D1), fontSize: 14, height: 2);
    return Section(
      color: const Color(0xFF2A2530),
      vertical: 48,
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Logo(light: true),
        const SizedBox(height: 8),
        const Text('All your business, beautifully connected.', style: linkStyle),
        const SizedBox(height: 24),
        Wrap(spacing: 48, runSpacing: 24, children: [
          for (final e in cols.entries)
            Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(e.key, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
              for (final l in e.value) Text(l, style: linkStyle),
            ]),
        ]),
        const Divider(color: Color(0xFF3D3644), height: 48),
        Text('© ${DateTime.now().year} Orbita. Demo project.', style: linkStyle.copyWith(fontSize: 12)),
      ]),
    );
  }
}

// ------------------------------------------------------------------ contact

class ContactSheet extends StatefulWidget {
  const ContactSheet({super.key, required this.api});
  final OrbitaApi api;

  @override
  State<ContactSheet> createState() => _ContactSheetState();
}

class _ContactSheetState extends State<ContactSheet> {
  final _form = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _company = TextEditingController();
  final _message = TextEditingController();
  bool _sending = false;
  String? _error;

  static final _emailRe = RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$');

  @override
  void dispose() {
    for (final c in [_name, _email, _company, _message]) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_form.currentState!.validate()) return;
    setState(() {
      _sending = true;
      _error = null;
    });
    try {
      await widget.api.createLead(
        name: _name.text.trim(),
        email: _email.text.trim(),
        company: _company.text.trim(),
        message: _message.text.trim(),
      );
      if (!mounted) return;
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('Thanks! Our team will get back to you shortly.'),
        backgroundColor: teal,
      ));
    } catch (e) {
      setState(() => _error = 'Could not send: ${e.toString().replaceFirst('Exception: ', '')}');
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  InputDecoration _dec(String label) => InputDecoration(
        labelText: label,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
      );

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.fromLTRB(24, 0, 24, 24 + MediaQuery.viewInsetsOf(context).bottom),
      child: Form(
        key: _form,
        child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          const Text("Let's talk", style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700)),
          const SizedBox(height: 4),
          const Text("Tell us what you need and we'll get back to you.", style: TextStyle(color: muted)),
          const SizedBox(height: 20),
          TextFormField(
            controller: _name,
            decoration: _dec('Full name'),
            textInputAction: TextInputAction.next,
            maxLength: 120,
            validator: (v) => (v ?? '').trim().isEmpty ? 'Please enter your name' : null,
          ),
          TextFormField(
            controller: _email,
            decoration: _dec('Work email'),
            keyboardType: TextInputType.emailAddress,
            textInputAction: TextInputAction.next,
            maxLength: 200,
            validator: (v) => _emailRe.hasMatch((v ?? '').trim()) ? null : 'Please enter a valid email',
          ),
          TextFormField(controller: _company, decoration: _dec('Company'), maxLength: 120),
          TextFormField(controller: _message, decoration: _dec('What do you need?'), maxLines: 3, maxLength: 2000),
          if (_error != null)
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
            ),
          FilledButton(
            onPressed: _sending ? null : _submit,
            child: _sending
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                : const Text('Send message'),
          ),
        ]),
      ),
    );
  }
}
