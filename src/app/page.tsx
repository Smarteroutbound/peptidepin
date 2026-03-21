import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Bell,
  ClipboardCheck,
  DollarSign,
  Droplets,
  FlaskConical,
  Syringe,
  TrendingUp,
  Check,
  FlaskRound,
} from "lucide-react";
import { CalculatorV2 } from "@/components/calculator/calculator-v2";

/* ---------- Peptide list for Section 5 ---------- */
const POPULAR_PEPTIDES = [
  { name: "Semaglutide", slug: "semaglutide", popular: true },
  { name: "Tirzepatide", slug: "tirzepatide", popular: true },
  { name: "BPC-157", slug: "bpc-157", popular: true },
  { name: "Retatrutide", slug: "retatrutide", popular: true },
  { name: "TB-500", slug: "tb-500" },
  { name: "CJC-1295 (no DAC)", slug: "cjc-1295-no-dac" },
  { name: "Ipamorelin", slug: "ipamorelin" },
  { name: "HCG", slug: "hcg" },
  { name: "GHK-Cu", slug: "ghk-cu" },
  { name: "PT-141", slug: "pt-141" },
  { name: "HGH", slug: "hgh" },
  { name: "DSIP", slug: "dsip" },
  { name: "Selank", slug: "selank" },
  { name: "Semax", slug: "semax" },
  { name: "Epithalon", slug: "epithalon" },
  { name: "AOD-9604", slug: "aod-9604" },
  { name: "Tesamorelin", slug: "tesamorelin" },
  { name: "GHRP-6", slug: "ghrp-6" },
  { name: "GHRP-2", slug: "ghrp-2" },
  { name: "Hexarelin", slug: "hexarelin" },
  { name: "Sermorelin", slug: "sermorelin" },
  { name: "Melanotan II", slug: "melanotan-ii" },
  { name: "Kisspeptin-10", slug: "kisspeptin-10" },
  { name: "Gonadorelin", slug: "gonadorelin" },
  { name: "NAD+", slug: "nad" },
  { name: "SS-31", slug: "ss-31" },
  { name: "Thymosin Alpha-1", slug: "thymosin-alpha-1" },
  { name: "LL-37", slug: "ll-37" },
  { name: "Oxytocin", slug: "oxytocin" },
  { name: "Cerebrolysin", slug: "cerebrolysin" },
];

/* ---------- FAQ data ---------- */
const FAQS = [
  {
    q: "Is PeptidePin free?",
    a: "Yes, the calculator is completely free to use with no signup required. Creating an account (also free) unlocks dose tracking, vial inventory, and reminders.",
  },
  {
    q: "How accurate is the calculator?",
    a: "Our calculator uses the standard reconstitution formula: (desired dose / concentration per unit volume) = units to draw. Every step is shown transparently so you can verify the math yourself.",
  },
  {
    q: "What peptides do you support?",
    a: "We support 30+ peptides including semaglutide, tirzepatide, BPC-157, retatrutide, TB-500, CJC-1295, ipamorelin, HCG, HGH, and many more. Each has pre-configured vial sizes and recommended doses.",
  },
  {
    q: "Do I need to create an account?",
    a: "No. The calculator works instantly without signup. An account is only needed if you want to save calculations, track doses, manage vial inventory, or receive reminders.",
  },
  {
    q: "Is my data private?",
    a: "Yes. Calculations are performed client-side in your browser. If you create an account, your data is encrypted and stored securely. We never sell or share your information.",
  },
  {
    q: "Will there be a mobile app?",
    a: "PeptidePin is a Progressive Web App (PWA) that works like a native app on any device. Install it from your browser for an app-like experience with push notifications and offline access.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      {/* ============ Nav ============ */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="font-heading text-sm font-bold text-primary-foreground">
                Pp
              </span>
            </div>
            <span className="font-heading text-lg font-bold">PeptidePin</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ============ Section 1: Hero ============ */}
      <section className="flex min-h-[calc(100dvh-3.5rem)] flex-col items-center justify-center px-4 py-20 text-center">
        <div className="mx-auto max-w-3xl space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            Free to use — no credit card required
          </div>

          <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Calculate your exact{" "}
            <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              peptide dose
            </span>{" "}
            in seconds
          </h1>

          <p className="mx-auto max-w-xl text-lg text-muted-foreground sm:text-xl">
            Free reconstitution calculator with visual syringe guide. Track
            vials, schedule doses, never miss an injection.
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/calculator">
              <Button size="lg" className="touch-target h-12 px-8 text-base w-full sm:w-auto">
                Try Calculator
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                variant="outline"
                size="lg"
                className="touch-target h-12 px-8 text-base w-full sm:w-auto"
              >
                Create Free Account
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-primary" />
              30+ peptides
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-primary" />
              Works on any device
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-primary" />
              100% free calculator
            </span>
          </div>
        </div>
      </section>

      {/* ============ Section 2: Embedded Calculator ============ */}
      <section className="border-t border-border/50 bg-muted/20 px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="text-center space-y-3">
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">
              Try it now — no signup needed
            </h2>
            <p className="mx-auto max-w-lg text-muted-foreground">
              Enter your vial details and see your exact syringe units instantly.
            </p>
          </div>

          <Suspense
            fallback={
              <div className="mx-auto max-w-2xl rounded-xl border border-border/50 bg-card p-8 text-center text-muted-foreground">
                Loading calculator...
              </div>
            }
          >
            <CalculatorV2 compact={true} showCost={false} syncUrl={false} />
          </Suspense>

          <div className="text-center space-y-3">
            <p className="text-muted-foreground">
              Want to save your calculations?
            </p>
            <Link href="/signup">
              <Button variant="outline" className="touch-target">
                Create Free Account
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ============ Section 3: How It Works ============ */}
      <section className="px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-5xl space-y-12">
          <div className="text-center space-y-3">
            <span className="inline-block rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary">
              How it works
            </span>
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">
              Three steps to perfect dosing
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <StepCard
              number={1}
              icon={<FlaskRound className="h-6 w-6" />}
              title="Select your peptide"
              description="Choose from 30+ peptides with pre-configured vial sizes and recommended doses."
            />
            <StepCard
              number={2}
              icon={<Droplets className="h-6 w-6" />}
              title="Enter your details"
              description="Tell us your vial size, BAC water amount, and desired dose. We do the math instantly."
            />
            <StepCard
              number={3}
              icon={<Syringe className="h-6 w-6" />}
              title="See your syringe units"
              description="Get exact units to draw with a visual syringe guide. No guessing, no math errors."
            />
          </div>
        </div>
      </section>

      {/* ============ Section 4: Features Grid ============ */}
      <section className="border-t border-border/50 bg-muted/20 px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-5xl space-y-12">
          <div className="text-center space-y-3">
            <span className="inline-block rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary">
              Features
            </span>
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">
              Everything you need to manage your protocol
            </h2>
            <p className="mx-auto max-w-xl text-muted-foreground">
              From reconstitution math to dose tracking, PeptidePin handles the
              complexity so you can focus on results.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Syringe className="h-5 w-5" />}
              title="Visual Syringe Guide"
              description="See exactly where to draw on your insulin syringe with an animated fill-level guide."
            />
            <FeatureCard
              icon={<ClipboardCheck className="h-5 w-5" />}
              title="Dose Tracking"
              description="Log every dose with one tap. Track your history, see adherence streaks, never wonder 'did I take it?'"
            />
            <FeatureCard
              icon={<FlaskConical className="h-5 w-5" />}
              title="Vial Inventory"
              description="Track reconstitution dates, remaining doses, and get alerts before your vial expires or runs out."
            />
            <FeatureCard
              icon={<TrendingUp className="h-5 w-5" />}
              title="Titration Planner"
              description="Plan your GLP-1 dose escalation with a week-by-week calendar. Know when you'll reach maintenance."
            />
            <FeatureCard
              icon={<Bell className="h-5 w-5" />}
              title="Smart Reminders"
              description="Push notifications when it's time for your dose. Snooze, skip, or log — right from the notification."
            />
            <FeatureCard
              icon={<DollarSign className="h-5 w-5" />}
              title="Cost Calculator"
              description="Enter your vial price, see your cost per dose and cost per day. Compare vendors and optimize spending."
            />
          </div>
        </div>
      </section>

      {/* ============ Section 5: Supported Peptides ============ */}
      <section className="px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="text-center space-y-3">
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">
              30+ peptides supported
            </h2>
            <p className="mx-auto max-w-lg text-muted-foreground">
              Pre-configured calculators for the most popular peptides
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {POPULAR_PEPTIDES.map((p) => (
              <Link
                key={p.slug}
                href={`/calculator/${p.slug}`}
                className={`inline-flex items-center rounded-full border px-3.5 py-2 text-sm font-medium transition-colors hover:bg-primary hover:text-primary-foreground hover:border-primary ${
                  p.popular
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border/60 text-muted-foreground hover:text-primary-foreground"
                }`}
              >
                {p.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============ Section 6: Why PeptidePin ============ */}
      <section className="border-t border-border/50 bg-muted/20 px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center font-heading text-3xl font-bold sm:text-4xl">
            Why peptide users choose PeptidePin
          </h2>

          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            {/* Value props */}
            <ul className="space-y-4">
              {[
                "Free calculator — no signup required",
                "Transparent math — see every step of the calculation",
                "Visual syringe — know exactly where to draw",
                "Works everywhere — phone, tablet, desktop",
                "Privacy first — your data stays yours",
                "No ads — clean, distraction-free experience",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>

            {/* Stylized result card */}
            <div className="mx-auto w-full max-w-sm rounded-2xl border border-border/50 bg-card p-6 shadow-lg">
              <div className="mb-4 space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Your result
                </p>
                <p className="font-heading text-4xl font-bold text-primary">
                  10 units
                </p>
                <p className="text-sm text-muted-foreground">
                  Draw to the 10-unit mark on your insulin syringe
                </p>
              </div>
              <div className="relative h-8 w-full overflow-hidden rounded-full border border-border/50 bg-muted/30">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-blue-400"
                  style={{ width: "20%" }}
                />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>0 units</span>
                <span>50 units</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ Section 7: FAQ ============ */}
      <section className="px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-3xl space-y-8">
          <h2 className="text-center font-heading text-3xl font-bold sm:text-4xl">
            Frequently Asked Questions
          </h2>

          <div className="divide-y divide-border/50">
            {FAQS.map((faq) => (
              <details key={faq.q} className="group py-4">
                <summary className="flex cursor-pointer items-center justify-between font-heading font-semibold text-foreground [&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <span className="ml-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ============ Section 8: Final CTA ============ */}
      <section className="border-t border-border/50 bg-gradient-to-br from-primary/10 via-background to-blue-500/10 px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-lg space-y-6 text-center">
          <h2 className="font-heading text-3xl font-bold sm:text-4xl">
            Start calculating for free
          </h2>
          <p className="text-muted-foreground">
            Join thousands of peptide users who trust PeptidePin for accurate
            dosing.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/calculator">
              <Button size="lg" className="touch-target h-12 px-8 text-base w-full sm:w-auto">
                Try Calculator
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                variant="outline"
                size="lg"
                className="touch-target h-12 px-8 text-base w-full sm:w-auto"
              >
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ============ Footer ============ */}
      <footer className="border-t border-border/50 px-4 py-8">
        <div className="mx-auto max-w-5xl space-y-4 text-center">
          <p className="text-xs text-muted-foreground">
            Not medical advice. Consult your healthcare provider.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            <Link
              href="/calculator"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Calculator
            </Link>
            <Link
              href="/bac-water-calculator"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              BAC Water Calculator
            </Link>
            <Link
              href="/unit-converter"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Unit Converter
            </Link>
            <Link
              href="/login"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} PeptidePin
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ---------- Sub-components ---------- */

function StepCard({
  number,
  icon,
  title,
  description,
}: {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="relative rounded-xl border border-border/50 bg-card p-6 text-center">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="absolute right-4 top-4 font-heading text-5xl font-bold text-muted/60">
        {number}
      </div>
      <h3 className="mb-2 font-heading text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-5 transition-colors hover:bg-muted/50">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mb-1 font-heading font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
