import { Suspense } from "react";
import { AddPeptideForm } from "./form";

export default function AddPeptidePage() {
  return (
    <Suspense>
      <AddPeptideForm />
    </Suspense>
  );
}
