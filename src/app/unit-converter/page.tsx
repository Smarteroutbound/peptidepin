"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRightLeft, Syringe, Scale } from "lucide-react";
import Link from "next/link";

// Note: metadata must be exported from a server component or layout.
// For client components, use the layout instead.

function UnitConverterContent() {
  // mg ↔ mcg converter
  const [mgValue, setMgValue] = useState<number | null>(5);
  const [mcgValue, setMcgValue] = useState<number | null>(5000);

  // Syringe units ↔ mL converter
  const [mlValue, setMlValue] = useState<number | null>(0.1);
  const [unitsValue, setUnitsValue] = useState<number | null>(10);

  const handleMgChange = (v: number) => {
    setMgValue(v);
    setMcgValue(v * 1000);
  };

  const handleMcgChange = (v: number) => {
    setMcgValue(v);
    setMgValue(v / 1000);
  };

  const handleMlChange = (v: number) => {
    setMlValue(v);
    setUnitsValue(v * 100);
  };

  const handleUnitsChange = (v: number) => {
    setUnitsValue(v);
    setMlValue(v / 100);
  };

  return (
    <article className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground mb-3">
          Peptide Unit Converter
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Convert between mg, mcg, IU, mL, and syringe units. Understanding
          these conversions is essential for accurate peptide dosing.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* mg ↔ mcg Converter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Scale className="h-4 w-4 text-primary" />
              mg ↔ mcg Converter
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Milligrams (mg)
              </Label>
              <Input
                type="number"
                step="0.001"
                value={mgValue ?? ""}
                onChange={(e) => handleMgChange(Number(e.target.value))}
                placeholder="e.g. 5"
                className="touch-target"
              />
            </div>

            <div className="flex justify-center">
              <ArrowRightLeft className="h-5 w-5 text-muted-foreground rotate-90" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Micrograms (mcg)
              </Label>
              <Input
                type="number"
                step="1"
                value={mcgValue ?? ""}
                onChange={(e) => handleMcgChange(Number(e.target.value))}
                placeholder="e.g. 5000"
                className="touch-target"
              />
            </div>

            <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
              <p className="text-sm text-foreground">
                <strong>1 mg = 1,000 mcg</strong>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Confusing mg and mcg is the #1 dosing error. Always double-check
                which unit your protocol uses.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* mL ↔ Syringe Units */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Syringe className="h-4 w-4 text-primary" />
              mL ↔ Syringe Units
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Volume (mL)
              </Label>
              <Input
                type="number"
                step="0.01"
                value={mlValue ?? ""}
                onChange={(e) => handleMlChange(Number(e.target.value))}
                placeholder="e.g. 0.1"
                className="touch-target"
              />
            </div>

            <div className="flex justify-center">
              <ArrowRightLeft className="h-5 w-5 text-muted-foreground rotate-90" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Syringe Units (U-100)
              </Label>
              <Input
                type="number"
                step="1"
                value={unitsValue ?? ""}
                onChange={(e) => handleUnitsChange(Number(e.target.value))}
                placeholder="e.g. 10"
                className="touch-target"
              />
            </div>

            <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
              <p className="text-sm text-foreground">
                <strong>1 mL = 100 units</strong> on a U-100 insulin syringe
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Syringe &quot;units&quot; for peptides are purely a volume measurement,
                not drug units. Each unit equals 0.01 mL.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Educational content */}
      <section className="prose prose-sm dark:prose-invert max-w-none">
        <h2 className="text-xl font-heading font-semibold">
          Understanding Peptide Units
        </h2>

        <h3>mg vs mcg — The 1000x Difference</h3>
        <p>
          Peptide vials are labeled in <strong>milligrams (mg)</strong>, but
          dosing protocols often use <strong>micrograms (mcg)</strong>. The
          conversion is simple: 1 mg = 1,000 mcg. However, confusing these
          units can result in a dose that is 1,000x too high or too low.
        </p>

        <h3>Syringe Units — A Volume Measurement</h3>
        <p>
          When using insulin syringes for peptide injection, the &quot;units&quot; on
          the syringe measure <strong>volume, not drug amount</strong>. On a
          standard U-100 insulin syringe:
        </p>
        <ul>
          <li>100 units = 1.0 mL</li>
          <li>50 units = 0.5 mL</li>
          <li>10 units = 0.1 mL</li>
          <li>1 unit = 0.01 mL (10 microliters)</li>
        </ul>

        <h3>Important: Syringe Tick Marks</h3>
        <p>
          Not all syringes have the same tick mark intervals:
        </p>
        <ul>
          <li>
            <strong>0.3 mL (30-unit) syringe:</strong> Each tick = 1 unit.
            Most precise for small doses.
          </li>
          <li>
            <strong>0.5 mL (50-unit) syringe:</strong> Each tick = 1 unit.
            Good for medium doses.
          </li>
          <li>
            <strong>1.0 mL (100-unit) syringe:</strong> Each tick = 2 units.
            Less precise for small amounts — a common source of dosing errors.
          </li>
        </ul>

        <h3>IU (International Units)</h3>
        <p>
          Some peptides like HCG and HGH use International Units (IU) instead
          of mg or mcg. IU measures biological activity, not weight. The
          conversion between IU and mg varies by compound and cannot be
          generalized.
        </p>
      </section>

      {/* Related tools */}
      <section>
        <h2 className="text-lg font-heading font-semibold mb-4">
          Related Tools
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/calculator"
            className="block p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors"
          >
            <span className="font-medium text-sm">Peptide Calculator</span>
            <span className="text-xs text-muted-foreground block mt-0.5">
              Full reconstitution calculator →
            </span>
          </Link>
          <Link
            href="/bac-water-calculator"
            className="block p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors"
          >
            <span className="font-medium text-sm">BAC Water Calculator</span>
            <span className="text-xs text-muted-foreground block mt-0.5">
              How much BAC water to add →
            </span>
          </Link>
          <Link
            href="/calculator/semaglutide"
            className="block p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors"
          >
            <span className="font-medium text-sm">Semaglutide Calculator</span>
            <span className="text-xs text-muted-foreground block mt-0.5">
              Calculate semaglutide dosing →
            </span>
          </Link>
        </div>
      </section>
    </article>
  );
}

export default function UnitConverterPage() {
  return <UnitConverterContent />;
}
