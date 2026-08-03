import { Bell, ChevronRight, CircleUserRound, LockKeyhole, MoonStar, Palette, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";

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
  { label: "Weekly progress email", value: "On" },
  { label: "Workout reminders", value: "On" },
  { label: "Nutrition alerts", value: "On" },
  { label: "Public profile", value: "Off" },
];

const accountItems = [
  "Connected to Clerk authentication",
  "Google sign-in available",
  "Protected dashboard access enabled",
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(8,15,32,0.92),rgba(15,23,42,0.62))] p-6 shadow-2xl shadow-black/30 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <span className="inline-flex w-fit rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-cyan-200">
              Settings
            </span>
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Personalize your private fitness workspace.
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Control your account, notifications, and visual preferences from one place without leaving the premium dashboard experience.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-cyan-300"
            >
              Back to dashboard
            </Link>
            <Link
              href="/progress"
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Review progress
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Security status", value: "Protected", icon: ShieldCheck },
          { label: "Theme", value: "Dark mode", icon: MoonStar },
          { label: "Customization", value: "Premium", icon: Sparkles },
          { label: "Style system", value: "shadcn/ui", icon: Palette },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.label} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400">{item.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
                </div>
                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-cyan-300">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="space-y-6 rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/80">Account preferences</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Manage your experience</h3>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {preferences.map((preference) => {
              const Icon = preference.icon;

              return (
                <div key={preference.title} className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-cyan-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
                      {preference.status}
                    </span>
                  </div>
                  <h4 className="mt-4 text-lg font-semibold text-white">{preference.title}</h4>
                  <p className="mt-2 text-sm leading-7 text-slate-300">{preference.description}</p>
                </div>
              );
            })}
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400">Quick toggles</p>
                <h4 className="mt-1 text-lg font-semibold text-white">Notification controls</h4>
              </div>
              <Bell className="h-5 w-5 text-cyan-300" />
            </div>

            <div className="mt-5 space-y-3">
              {toggles.map((toggle) => (
                <div key={toggle.label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-sm text-slate-200">{toggle.label}</p>
                  <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">
                    {toggle.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6 rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/80">Account status</p>
            <h3 className="mt-2 text-xl font-semibold text-white">Security and sync</h3>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5">
            <p className="text-sm text-slate-400">Connected account</p>
            <h4 className="mt-1 text-2xl font-semibold text-white">Clerk + Google</h4>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Your authentication is protected by Clerk and ready for social sign-in with Google.
            </p>

            <div className="mt-5 space-y-3">
              {accountItems.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-cyan-300" />
                  <p className="text-sm text-slate-200">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-cyan-400/10 to-blue-500/10 p-5">
            <p className="text-sm text-slate-300">Account action</p>
            <h4 className="mt-1 text-lg font-semibold text-white">Review connected services</h4>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Keep an eye on connected providers and update your privacy settings as your app grows.
            </p>
            <Link
              href="/dashboard"
              className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-cyan-300 transition hover:text-cyan-200"
            >
              Continue browsing <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}