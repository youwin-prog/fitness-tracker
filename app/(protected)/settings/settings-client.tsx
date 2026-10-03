"use client";

import { Bell, ChevronRight, CircleUserRound, LockKeyhole, MoonStar, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getUserSettings, updateDarkMode, updateNotificationSetting, updatePublicProfile } from "@/actions/settings-actions";

const preferences = [
  {
    title: "Notifications",
    description: "Manage workout reminders, nutrition prompts, and weekly summaries.",
    icon: Bell,
    status: "Enabled",
  },
  {
    title: "Appearance",
    description: "Dark mode is active across the app with a polished high-contrast UI.",
    icon: MoonStar,
    status: "Dark",
  },
  {
    title: "Profile",
    description: "Update your display name, photo, and contact details.",
    icon: CircleUserRound,
    status: "Synced",
  },
  {
    title: "Privacy",
    description: "Control what data is visible in your fitness dashboard.",
    icon: LockKeyhole,
    status: "Protected",
  },
];

const toggles = [
  { label: "Weekly progress email", value: "On", setting: "weeklySummaryEmail" },
  { label: "Workout reminders", value: "On", setting: "emailWorkoutReminders" },
  { label: "Nutrition alerts", value: "On", setting: "emailNutritionReminders" },
  { label: "Public profile", value: "Off", setting: "publicProfile" },
];

const accountItems = [
  "Connected to Clerk authentication",
  "Google sign-in available",
  "Protected dashboard access enabled",
];

const topStatusCards = [
  { label: "Security status", value: "Protected", icon: ShieldCheck, status: "Protected" },
  { label: "Theme", value: "Light mode", icon: MoonStar, status: "Light" },
];

interface SettingsInitialData {
  darkMode: boolean;
  emailWorkoutReminders: boolean;
  emailNutritionReminders: boolean;
  weeklySummaryEmail: boolean;
  publicProfile: boolean;
}

export interface SettingsClientProps {
  initialSettings: SettingsInitialData;
}

export default function SettingsClient({ initialSettings }: SettingsClientProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const data = await getUserSettings();
    setSettings(data);
  };

  const handleToggleChange = async (setting: keyof typeof settings, value: boolean) => {
    const previousValue = settings[setting];
    setSettings((prev) => ({ ...prev, [setting]: value }));
    setErrorMessage(null);

    try {
      switch (setting) {
        case "darkMode":
          await updateDarkMode(value);
          if (typeof document !== "undefined") {
            if (value) {
              document.documentElement.classList.add("dark");
            } else {
              document.documentElement.classList.remove("dark");
            }
          }
          break;
        case "emailWorkoutReminders":
          await updateNotificationSetting("workoutReminders", value);
          break;
        case "emailNutritionReminders":
          await updateNotificationSetting("nutritionAlerts", value);
          break;
        case "weeklySummaryEmail":
          await updateNotificationSetting("weeklySummary", value);
          break;
        case "publicProfile":
          await updatePublicProfile(value);
          break;
      }
    } catch {
      setSettings((prev) => ({ ...prev, [setting]: previousValue }));
      if (typeof document !== "undefined" && setting === "darkMode") {
        if (previousValue) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
      setErrorMessage("Failed to update. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      {errorMessage && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">
          {errorMessage}
        </div>
      )}
      <section className="rounded-2xl border border-border-color bg-card dark:bg-card p-6 shadow-xl sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <span className="inline-flex w-fit rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-accent-foreground">
              Settings
            </span>
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Personalize your private fitness workspace.
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-text-secondary sm:text-base">
                Control your account, notifications, and visual preferences from one place without leaving the premium dashboard experience.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-medium text-background primary-foreground transition hover:bg-accent/90"
            >
              Back to dashboard
            </Link>
            <Link
              href="/progress"
              className="inline-flex items-center justify-center rounded-full border border-border-color bg-card dark:bg-card px-5 py-3 text-sm font-medium text-text-primary transition hover:bg-card/50"
            >
              Review progress
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
        {topStatusCards.map((item) => {
          const Icon = item.icon;
          const isTheme = item.label === "Theme";

          return (
            <div
              key={item.label}
              className="rounded-2xl border border-border-color bg-card dark:bg-card p-5 backdrop-blur-xl transform hover:bg-card/50 dark:hover:bg-card/80 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-text-secondary mb-2">{item.label}</p>
                  <p className="text-xl font-semibold text-text-primary">
                    {isTheme ? (settings.darkMode ? "Dark mode" : "Light mode") : item.value}
                  </p>
                  <p className="text-xs rounded-full border border-border-color bg-secondary/50 px-2 py-1 text-text-secondary dark:text-text-secondary mt-2">
                    {isTheme ? (settings.darkMode ? "Dark" : "Light") : item.status}
                  </p>
                </div>
                <div className="rounded-2xl border border-accent/20 bg-accent/10 p-3 text-accent-foreground">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="space-y-6 rounded-2xl border border-border-color bg-card dark:bg-card p-6 backdrop-blur-xl sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-text-secondary/80">Account preferences</p>
              <h3 className="mt-2 text-xl font-semibold text-text-primary">Manage your experience</h3>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {preferences.map((preference) => {
              const Icon = preference.icon;

              return (
                <div
                  key={preference.title}
                  className="rounded-2xl border border-border-color bg-card dark:bg-card p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="rounded-2xl border border-accent/20 bg-accent/10 p-3 text-accent-foreground">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full border border-secondary bg-secondary/50 px-3 py-1 text-xs font-medium text-text-secondary dark:text-text-secondary/80">
                      {preference.title === "Appearance" ? (settings.darkMode ? "Dark" : "Light") : preference.status}
                    </span>
                  </div>
                  <h4 className="mt-4 text-lg font-semibold text-text-primary">{preference.title}</h4>
                  <p className="mt-2 text-sm leading-7 text-text-secondary">
                    {preference.title === "Appearance"
                      ? (settings.darkMode
                          ? "Dark mode is active across the app with a polished high-contrast UI."
                          : "Light mode is active across the app with a clean, high-contrast UI.")
                      : preference.description}
                  </p>
                  <div className="mt-4 pt-4 border-t border-secondary/20">
                    {preference.title === "Notifications" && (
                      <p className="text-xs text-text-secondary">
                        Quick controls below manage your notification preferences.
                      </p>
                    )}
                    {preference.title === "Appearance" && (
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={settings.darkMode}
                            onChange={(e) => handleToggleChange("darkMode", e.target.checked)}
                            className="block h-4 w-4 cursor-pointer appearance-none rounded border-2 border-border-color bg-secondary outline-none transition-colors checked:border-accent checked:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:border-border dark:bg-primary dark:checked:border-accent dark:checked:bg-accent"
                          />
                          <span className="text-sm text-text-secondary">Dark mode</span>
                        </label>
                      </div>
                    )}
                    {preference.title === "Profile" && (
                      <Link
                        href="/profile"
                        className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-accent-foreground transition hover:text-accent-foreground/90"
                      >
                        <ChevronRight className="h-4 w-4" /> Go to profile
                      </Link>
                    )}
                    {preference.title === "Privacy" && (
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={settings.publicProfile}
                            onChange={(e) => handleToggleChange("publicProfile", e.target.checked)}
                            className="block h-4 w-4 cursor-pointer appearance-none rounded border-2 border-border-color bg-secondary outline-none transition-colors checked:border-accent checked:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:border-border dark:bg-primary dark:checked:border-accent dark:checked:bg-accent"
                          />
                          <span className="text-sm text-text-secondary">Public profile</span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {toggles.map((toggle) => (
            <div
              key={toggle.label}
              className="flex items-center justify-between rounded-lg border border-border-color bg-card dark:bg-card px-4 py-3"
            >
              <p className="text-sm text-text-secondary">{toggle.label}</p>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={settings[toggle.setting as keyof typeof settings]}
                  onChange={(e) => handleToggleChange(toggle.setting as keyof typeof settings, e.target.checked)}
                  className="block h-4 w-4 cursor-pointer appearance-none rounded border-2 border-border-color bg-secondary outline-none transition-colors checked:border-accent checked:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:border-border dark:bg-primary dark:checked:border-accent dark:checked:bg-accent"
                />
                <span className="text-sm text-text-secondary">{settings[toggle.setting as keyof typeof settings] === true ? "On" : "Off"}</span>
              </label>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border-color bg-card dark:bg-card p-5">
        <p className="text-sm text-text-secondary">Connected account</p>
        <h4 className="mt-1 text-xl font-semibold text-text-primary">Clerk + Google</h4>
        <p className="mt-3 text-sm leading-7 text-text-secondary">
          Your authentication is protected by Clerk and ready for social sign-in with Google.
        </p>

        <div className="mt-5 space-y-3">
          {accountItems.map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-lg border border-border-color bg-card dark:bg-card px-4 py-3">
              <ShieldCheck className="h-4 w-4 text-accent-foreground" />
              <p className="text-sm text-text-secondary">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="rounded-2xl border border-accent/20 bg-accent/10 p-5">
        <p className="text-sm text-text-secondary">Account action</p>
        <h4 className="mt-1 text-lg font-semibold text-text-primary">Review connected services</h4>
        <p className="mt-3 text-sm leading-7 text-text-secondary">
          Keep an eye on connected providers and update your privacy settings as your app grows.
        </p>
        <Link
          href="/dashboard"
          className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-accent-foreground transition hover:text-accent-foreground/90"
        >
          Continue browsing <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}