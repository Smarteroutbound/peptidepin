import { Suspense } from "react";
import { NewScheduleForm } from "./form";

export default function NewSchedulePage() {
  return (
    <Suspense>
      <NewScheduleForm />
    </Suspense>
  );
}
