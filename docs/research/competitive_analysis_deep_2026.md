# Deep Competitive Analysis - Peptide Apps (March 2026)

## COMPETITIVE LANDSCAPE SUMMARY

The peptide app market has EXPLODED since late 2024. There are now 15+ dedicated apps across iOS, Android, and web. Most launched in 2024-2025. The market is fragmenting into three tiers:
1. **Pure calculators** - simple reconstitution math (PepCalc, PeptideCalc.io, OmniCalculator)
2. **Calculator + tracker combos** - calc plus dose logging and reminders (Peptide Calculator PRO, PepTracker, SHOTLOG, PeptIQ)
3. **Full management platforms** - calc + tracker + inventory + blood levels + wellness (PepStackr, PeptideStack, PeptidePro)

---

## 1. PEPTIDEPRO (peptidepro.app)

**What it is:** PWA "all-in-one peptide tool" built with Next.js
**Platform:** PWA (web) + Native Android (Google Play) + iOS (separate "Peptide Calculator PRO" app)
**Pricing:** Free download, subscriptions $0.99-$3.99/week, $2.99-$9.99/month, $8.99-$44.99/year (iOS)

**Core Features:**
- Dosage calculator (mg/mcg/IU to syringe units)
- Calendar-based shot tracking with reminders
- iCloud sync (iOS)
- Home screen & lock screen widgets
- Export to Apple Calendar/Reminders
- Support for injectable pens and oral peptides
- Progress tracking, daily reminders, educational content

**Ratings:** 4.7/5 (91 ratings on iOS)

**User Praise:**
- Clean, modern design with no ads
- Well-organized, everything in one app
- Calendar scheduling/logging works great
- Developer responds quickly, adds features based on feedback

**User Complaints:**
- No Apple Calendar integration (planned)
- Subscription pricing tiers are confusing

**Strengths:** Polished native iOS experience, responsive developer, good ratings
**Weaknesses:** Fragmented across platforms (web PWA vs separate native apps), subscription model with many tiers, no inventory management

---

## 2. PEPSTACKR (pepstackr.com)

**What it is:** Full-featured peptide management PWA
**Platform:** PWA (web, installable on iOS/Android)
**Pricing:** FREE - all features, no paid tier, no credit card

**Core Features:**
- Reconstitution calculator with syringe unit conversion
- Blood concentration modeling (pharmacokinetic curves based on half-life)
- Smart scheduling (daily, custom, cycling, titration) with push notifications
- Vial inventory tracking (sealed + reconstituted, dose counts, low-stock alerts)
- Stack builder with pre-built templates
- Health check-ins (weight, energy, mood, sleep, side effects, exercise, progress photos)
- 100+ peptide library with half-life data
- Calendar export (Google Calendar/ICS)
- Data encryption at rest and in transit
- Full data export/delete

**UI:** Dark theme (deep slate #0f172a) with cyan/blue accents, cards-based layout

**Strengths:** Most feature-complete FREE option. Blood level curves are unique differentiator. PWA = cross-platform. Strong privacy stance.
**Weaknesses:** PWA limitations vs native (notifications can be flaky). No native app store presence = less discoverability. Unknown sustainability with no revenue model.

**KEY COMPETITOR - closest to PeptidePin's vision and it's free**

---

## 3. PEPTIDESTACK (peptidestack.app)

**What it is:** Logistics/planning tool for peptide protocols
**Platform:** Web app
**Pricing:** Free for exploration/short cycles, paid for long-term data & complex protocols

**Core Features:**
- Vial inventory with automatic dose subtraction ("Vial Health" status)
- Usage forecasting (predicts when you'll run out)
- Concentration, vial size, batch tracking
- Low-stock notifications
- Protocol timeline generator (free tool)
- Local-first with end-to-end encryption

**Strengths:** Strong inventory/supply chain focus. Privacy-first architecture. Cost tracking.
**Weaknesses:** Explicitly does NOT recommend compounds or dosages. No calculator. No health tracking. Niche focus.

---

## 4. PEPTRACKER (peptracker.app)

**What it is:** Dose log and protocol tracker
**Platform:** Native iOS + Android
**Pricing:** Free tier (2 protocols), Premium (unlimited) - pricing not publicly listed

**Core Features:**
- Protocol creation with templates
- Real-time dose calculator with syringe unit visuals
- Smart reminders
- Calendar integration showing injection history
- Weight tracking with goals
- Data export (PDF/CSV in premium)

**Stats:** 5.2k+ reminders sent, 1.3k+ protocols created, 8.7k+ doses calculated

**Strengths:** Clean native experience. Good onboarding. Template-based protocol setup.
**Weaknesses:** Free tier limited to 2 protocols (aggressive paywall). Bugs reported (dose marking not saving). Limited inventory features.

---

## 5. PEPTIDECALC.IO

**What it is:** Professional-grade reconstitution calculator
**Platform:** Free web calculator + $4.99 native iOS app (one-time purchase)
**Pricing:** Web = free, no signup. iOS = $4.99 one-time.

**Core Features:**
- Precision reconstitution calculator
- Multi-peptide blend support
- Protocol scheduling with countdown views
- Injection site rotation with logging
- Dose-specific push notifications with exact syringe measurements
- Adherence tracking with streaks
- Pre-loaded GLP-1 protocols (Ozempic, Wegovy, Mounjaro, etc.)
- TRT/steroid support (testosterone, nandrolone, etc.)
- 6 color themes + dark mode
- iCloud sync, fully offline capable

**Strengths:** One-time purchase (no subscription). Broadest compound support (peptides + GLP-1 + steroids). Professional design. Offline-first.
**Weaknesses:** No inventory tracking. No wellness/health logging. iOS only for advanced features.

---

## 6. PEPCALC (pepcalc.app)

**What it is:** Simple, focused reconstitution calculator
**Platform:** Native iOS + Android
**Pricing:** FREE

**Core Features:**
- Syringe type selection (U100, U40, tuberculin)
- Configurable inputs (units, tick marks, peptide qty, water volume, dose)
- Results: tick marks to draw + total doses per vial
- Multi-peptide blend support
- Saved calculations

**User Praise:** "Cured my frustrations within 15 seconds." "Website calculators are trash and overly complicated."

**Strengths:** Dead simple. Free. Does one thing well. Cross-platform native.
**Weaknesses:** Calculator only - no tracking, no scheduling, no inventory.

---

## 7. SHOTLOG (shotlogapp.com)

**What it is:** Peptide tracker for biohackers
**Platform:** Native iOS + Android
**Pricing:** Free (10 shot logs), Premium $4.99/month or $34.99/year

**Core Features:**
- Protocol management with titration schedules
- Built-in calculator (mg/mcg/IU to syringe units)
- One-tap dose logging with injection site rotation
- Weight trends, body measurements, progress photos
- Nutrition logging (protein, fat, calories, water)
- Wellness journal
- Export reports for healthcare providers

**Rating:** 2.8/5 (10 ratings) - LOWEST rated

**User Complaints:**
- "Very clunky, like something built for Windows 2002"
- No Apple Health or scale sync
- App freezes on certain screens
- Subscription cost excessive for functionality
- Scheduling bugs

**Strengths:** Broadest wellness tracking (nutrition, measurements, journal). Healthcare export.
**Weaknesses:** Poor UX/UI. Buggy. Low ratings. Aggressive paywall (10 logs then pay).

---

## 8. PEPTIQ (PeptIQ: Peptide Tracker)

**What it is:** Comprehensive peptide tracker with Apple Health integration
**Platform:** Native iOS (iPhone, iPad, Mac M1+, Vision Pro)
**Pricing:** Free download, Premium $9.99/month or $79.99/year

**Core Features:**
- Injection logging with body map for site rotation
- Custom protocol scheduling (daily, weekly, cycling)
- Wellness tracking (weight, sleep, mood, energy)
- Half-life decay visualization charts
- Vial inventory with reconstitution calc and low-stock alerts
- Apple Health integration
- Peptide library and glossary
- Local data storage (privacy-first)

**Rating:** 4.7/5 (12 ratings)

**User Praise:** "Built by people who actually use this stuff." Clean interface.

**Strengths:** Apple ecosystem integration. Body map for injection sites. Half-life visualization. Vision Pro support.
**Weaknesses:** iOS only. MOST EXPENSIVE subscription ($80/year). Small user base. No Android/web.

---

## 9. PEPTIDE TRACKER & CALCULATOR (Wild Monkey Labs)

**What it is:** All-in-one tracker with strong inventory focus
**Platform:** Native iOS
**Pricing:** Free tier, Pro $3.99/month or $24.99/year

**Core Features:**
- Inventory management (concentration, vial size, batch numbers, expiration dates)
- Dosing logs with date/time, method, injection site, notes
- Injection site rotation with color-coded indicators and rest periods
- Protocol scheduling with on/off cycles and countdown timers
- Data export for healthcare providers
- Local-only data storage

**Rating:** 4.6/5 (132 ratings) - MOST REVIEWED tracker

**User Praise:** Dev releases features fast. Sleek design. Protocol scheduling is great.

**User Complaints:** Injection site selection is text-based (no body map). Peptide library incomplete. Some features misleadingly described.

**Strengths:** Most reviews of any tracker. Strong inventory. Responsive dev. Reasonable pricing.
**Weaknesses:** iOS only. Text-based injection sites. Missing compounds.

---

## 10. PEPTIDEDOSAGES.COM

**What it is:** Educational protocol library with embedded calculator
**Platform:** Responsive web
**Pricing:** Free (some content behind free account login)

**Core Features:**
- 100+ peptide dosage protocols sourced from peer-reviewed literature
- Reconstitution calculator (mg/mcg input, BAC water volume, desired dose -> mL + syringe units)
- Single peptides, blends, and stack guides
- Academic citations
- Request-a-protocol feature (logged-in users)

**Strengths:** Content authority (academic sourcing). Large protocol library. Free.
**Weaknesses:** Content site, not an app. No tracking/scheduling. Some protocols gated behind login. Blog "Coming Soon." No mobile app.

---

## COMPETITIVE MATRIX

| Feature | PeptidePin | PepStackr | PeptidePro | PeptideCalc.io | PepTracker | SHOTLOG | PeptIQ | PT&C (WML) | PeptideStack |
|---|---|---|---|---|---|---|---|---|---|
| **Recon Calculator** | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No |
| **Dose Tracking** | Planned | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| **Reminders** | Planned | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| **Inventory/Vials** | Planned | Yes | No | No | No | No | Yes | Yes | Yes |
| **Blood Levels** | No | Yes | No | No | No | No | Half-life | No | No |
| **Injection Site Map** | No | No | No | Yes | No | Yes | Yes (body map) | Text-based | No |
| **Wellness Tracking** | No | Yes | No | No | Weight | Full | Yes | No | No |
| **Progress Photos** | No | Yes | No | No | No | Yes | No | No | No |
| **Apple Health** | No | No | No | No | No | No | Yes | No | No |
| **Peptide Library** | Planned | 100+ | Limited | GLP-1+TRT+pep | Limited | Limited | Yes | Partial | No |
| **Multi-peptide Blend** | Yes | Yes | No | Yes | No | No | No | No | No |
| **Calendar Export** | No | Yes | Yes | No | No | No | No | No | No |
| **Data Export** | No | Yes | No | No | Premium | Yes | No | Yes | No |
| **Platform** | PWA | PWA | PWA+Native | Web+iOS | iOS+Android | iOS+Android | iOS only | iOS only | Web |
| **Pricing** | Free? | FREE | Sub $3-45/yr | Free web/$5 iOS | Freemium | $5/mo or $35/yr | $10/mo or $80/yr | $4/mo or $25/yr | Freemium |
| **Rating** | N/A | N/A (PWA) | 4.7 (91) | N/A (web) | N/A | 2.8 (10) | 4.7 (12) | 4.6 (132) | N/A |

---

## KEY MARKET INSIGHTS

### 1. The Market is Crowded but Fragmented
15+ apps, but NO clear winner. Most have <200 reviews. The space is ripe for consolidation.

### 2. Common User Pain Points (from reviews across all apps)
- **Misleading freemium**: Apps advertise as free but lock core features behind paywall
- **Calculation errors**: Several apps have bugs in syringe unit math
- **No Apple Health/Google Fit sync**: Users want their health data connected
- **Poor injection site tracking**: Most are text-based, users want body maps
- **Missing peptides**: Libraries are incomplete, no way to add custom compounds
- **No multi-device sync**: Many are local-only with no cloud backup
- **Buggy reminders**: Notifications unreliable across platforms
- **Subscription fatigue**: Users resent paying $5-10/month for a calculator

### 3. Underserved Opportunities
- **Multi-peptide blend calculator**: Few handle blending multiple peptides in one vial well
- **Blood concentration visualization**: Only PepStackr does this (and PeptIQ partially)
- **Supply chain management**: Only PeptideStack focuses on "when will I run out?"
- **Cross-platform with sync**: Most are iOS-only or have no sync
- **Healthcare provider export**: Only SHOTLOG and PT&C offer this
- **Community/social features**: ZERO apps have this
- **AI-powered protocol suggestions**: ZERO apps do this (regulatory minefield but huge demand)

### 4. Pricing Sweet Spot
- Free web calculators are table stakes
- $4.99 one-time (PeptideCalc.io) is well-received
- $25/year is the comfort zone for subscriptions
- $80/year (PeptIQ) is seen as too expensive
- PepStackr being fully free is disruptive but sustainability is questionable

### 5. PepStackr is the Primary Threat to PeptidePin
- Free, feature-complete, PWA, good UX
- Has blood level curves (unique)
- Has inventory + wellness + scheduling
- BUT: no native app store presence, unknown team/sustainability, PWA notification limitations
