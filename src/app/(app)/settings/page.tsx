"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { LogOut, Moon, Sun, Bell, User, Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [unitPref, setUnitPref] = useState<"mcg" | "mg" | "iu">("mcg");
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = (await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()) as { data: Profile | null; error: any };

      if (data) {
        setProfile(data);
        setDisplayName(data.display_name || "");
        setUnitPref(data.unit_preference);
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  async function handleSave() {
    if (!profile) return;
    setSaving(true);

    const { error } = await (supabase
      .from("profiles") as any)
      .update({
        display_name: displayName,
        unit_preference: unitPref,
      })
      .eq("id", profile.id);

    if (error) {
      toast.error("Failed to save settings");
    } else {
      toast.success("Settings saved");
    }
    setSaving(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4 text-primary" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Display Name
            </Label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="touch-target"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Unit Preference
            </Label>
            <Select
              value={unitPref}
              onValueChange={(v) => { if (v) setUnitPref(v as any); }}
            >
              <SelectTrigger className="touch-target">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mcg">Micrograms (mcg)</SelectItem>
                <SelectItem value="mg">Milligrams (mg)</SelectItem>
                <SelectItem value="iu">International Units (IU)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Moon className="h-4 w-4 text-primary" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {theme === "dark" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
              <span className="text-sm">Dark Mode</span>
            </div>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(checked) =>
                setTheme(checked ? "dark" : "light")
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4 text-primary" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm">Dose Reminders</span>
              <p className="text-xs text-muted-foreground">
                Get notified when it&apos;s time for a dose
              </p>
            </div>
            <Switch
              checked={profile?.notifications_enabled || false}
              onCheckedChange={async (checked) => {
                if (checked && "Notification" in window) {
                  const permission = await Notification.requestPermission();
                  if (permission !== "granted") {
                    toast.error("Please allow notifications in your browser");
                    return;
                  }
                }
                await (supabase
                  .from("profiles") as any)
                  .update({ notifications_enabled: checked })
                  .eq("id", profile!.id);
                setProfile((p) =>
                  p ? { ...p, notifications_enabled: checked } : null
                );
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleSave}
        className="w-full touch-target"
        disabled={saving}
      >
        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Settings
      </Button>

      <Separator />

      <Button
        variant="ghost"
        className="w-full touch-target text-destructive hover:text-destructive"
        onClick={handleSignOut}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Sign Out
      </Button>
    </div>
  );
}
