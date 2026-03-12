"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { LANGUAGES } from "@/lib/translate";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [preferredLanguage, setPreferredLanguage] = useState("en");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setPreferredLanguage(data.preferredLanguage);
      }
    }
    fetchSettings();
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferredLanguage }),
      });
      if (res.ok) setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  const languageOptions = LANGUAGES.map((l) => ({
    value: l.code,
    label: l.name,
  }));

  return (
    <div className="w-full max-w-lg mx-auto p-6">
      <h1 className="text-4xl font-black uppercase mb-8">Settings</h1>

      <Card>
        <h2 className="text-xl font-black uppercase mb-4 pb-4 border-b-4 border-black">
          Profile
        </h2>

        <div className="space-y-5">
          <div>
            <p className="text-sm font-black uppercase tracking-wide mb-2">Name</p>
            <p className="px-4 py-3 border-4 border-black font-bold bg-teal">
              {session?.user?.name}
            </p>
          </div>

          <div>
            <p className="text-sm font-black uppercase tracking-wide mb-2">Email</p>
            <p className="px-4 py-3 border-4 border-black font-bold bg-yellow">
              {session?.user?.email}
            </p>
          </div>

          <Select
            id="preferredLanguage"
            label="Preferred Language"
            options={languageOptions}
            value={preferredLanguage}
            onChange={(e) => {
              setPreferredLanguage(e.target.value);
              setSaved(false);
            }}
          />

          <div className="flex items-center gap-4 mt-6">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            {saved && (
              <span className="font-black text-sm px-4 py-2 border-4 border-black bg-lime">
                ✓ SAVED!
              </span>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
