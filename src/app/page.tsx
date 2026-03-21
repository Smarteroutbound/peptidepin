import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Calculator,
  CalendarClock,
  Bell,
  FlaskConical,
  Syringe,
  Shield,
  ArrowRight,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      {/* Nav */}
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

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            <Syringe className="h-3.5 w-3.5" />
            Precision dosing made simple
          </div>

          <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Never miss a
            <span className="text-primary"> peptide dose</span> again
          </h1>

          <p className="mx-auto max-w-lg text-lg text-muted-foreground">
            Calculate reconstitution, track your vials, schedule doses, and get
            reminders. The all-in-one peptide companion app.
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/signup">
              <Button size="lg" className="touch-target w-full sm:w-auto">
                Start for free
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="outline"
                size="lg"
                className="touch-target w-full sm:w-auto"
              >
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border/50 bg-muted/30 px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-10 text-center font-heading text-2xl font-bold sm:text-3xl">
            Everything you need
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Calculator className="h-5 w-5" />}
              title="Mixing Calculator"
              description="Calculate exact BAC water volumes, concentrations, and syringe units with a visual syringe guide."
            />
            <FeatureCard
              icon={<FlaskConical className="h-5 w-5" />}
              title="Vial Tracking"
              description="Track your peptide inventory. Know exactly how many doses remain in each vial."
            />
            <FeatureCard
              icon={<CalendarClock className="h-5 w-5" />}
              title="Dose Scheduling"
              description="Set up dose schedules with flexible frequencies. See your daily plan at a glance."
            />
            <FeatureCard
              icon={<Bell className="h-5 w-5" />}
              title="Smart Reminders"
              description="Push notifications when it's time for your dose. Never miss a scheduled injection."
            />
            <FeatureCard
              icon={<Syringe className="h-5 w-5" />}
              title="Syringe Visual"
              description="See exactly where to draw on your insulin syringe with an animated fill-level guide."
            />
            <FeatureCard
              icon={<Shield className="h-5 w-5" />}
              title="Private & Secure"
              description="Your data is encrypted and never shared. Access from any device with your account."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 text-center">
        <div className="mx-auto max-w-lg space-y-4">
          <h2 className="font-heading text-2xl font-bold">
            Ready to get precise?
          </h2>
          <p className="text-muted-foreground">
            Join thousands of peptide users who trust PeptidePin for accurate
            dosing.
          </p>
          <Link href="/signup">
            <Button size="lg" className="touch-target">
              Create free account
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 px-4 py-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between text-xs text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} PeptidePin</span>
          <span>Not medical advice. Consult your healthcare provider.</span>
        </div>
      </footer>
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
