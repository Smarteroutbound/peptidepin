import { createClient } from "@/lib/supabase/server";
import { PeptideLibrary } from "@/components/peptides/peptide-library";

export const metadata = {
  title: "Peptide Library",
};

export default async function LibraryPage() {
  const supabase = await createClient();
  const { data: peptides } = await supabase
    .from("peptides")
    .select("*")
    .eq("is_published", true)
    .order("name");

  return <PeptideLibrary peptides={peptides || []} />;
}
