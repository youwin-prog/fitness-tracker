"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BarChart3, CalendarDays, Dumbbell, Flame, Settings2, ShieldCheck, TrendingUp } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

type DashboardShellProps = {
  children: React.ReactNode;
};

const navigationItems = [
  { label: "Overview", href: "/dashboard", icon: BarChart3 },
  { label: "Workouts", href: "/workout", icon: Dumbbell },
  { label: "Progress", href: "/progress", icon: TrendingUp },
  { label: "Calendar", href: "/calendar", icon: CalendarDays },
  { label: "Goals", href: "/goals", icon: Flame },
  { label: "Settings", href: "/settings", icon: Settings2 },
];

const metrics = [
  { label: "Protected account", value: "Clerk", icon: ShieldCheck },
  { label: "Weekly sessions", value: "0", icon: Dumbbell },
  { label: "Consistency", value: "0%", icon: TrendingUp },
];

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();

  useEffect(() => {
    // Sync the shell's CSS variables with the html.dark class
    const html = document.documentElement;
    const updateAppearance = () => {
      if (html.classList.contains("dark")) {
        html.style.setProperty('--bg-primary', '#0f172a');
        html.style.setProperty('--bg-secondary', '#1e293b');
        html.style.setProperty('--text-primary', '#f1f5f9');
        html.style.setProperty('--text-secondary', '#94a3b8');
        html.style.setProperty('--border-color', '#334155');
      } else {
        html.style.setProperty('--bg-primary', '#f8fafc');
        html.style.setProperty('--bg-secondary', '#f1f5f9');
        html.style.setProperty('--text-primary', '#1e293b');
        html.style.setProperty('--text-secondary', '#64748b');
        html.style.setProperty('--border-color', '#e2e8f0');
      }
    };
    updateAppearance();
    const observer = new MutationObserver(updateAppearance);
    observer.observe(html, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const getActive = (href: string) => {
    const cleanHref = href.replace(/^\//, "").replace(/\/?$/, "");
    const cleanPathname = pathname.replace(/^\//, "").replace(/\/?$/, "");
    return cleanPathname === cleanHref || cleanPathname.startsWith(cleanHref + "/");
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <div className="absolute inset-0 -z-10" style={{ 
        background: 'radial-gradient(circle at top left, rgba(239,68,68,0.12) 0%, transparent 30%), radial-gradient(circle at top right, rgba(220,38,38,0.14) 0%, transparent 26%), linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)' 
      }} />

      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <aside className="hidden w-72 shrink-0 flex-col rounded-[2rem] border border-white/10 p-5 backdrop-blur-xl xl:flex" 
          style={{ 
            borderColor: 'var(--border-color)', 
            backgroundColor: 'var(--sidebar-bg)',
            boxShadow: '0 0 20px -5px rgba(239,68,68,0.15)'
          }}>
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-[0.28em]" style={{ color: 'var(--accent)' }}>Fitness Tracker</p>
            <h2 className="text-xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>Control Center</h2>
          </div>

          <div className="mt-8 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = getActive(item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm transition-colors hover:border-border-color hover:bg-white/5 hover:text-primary",
                    active && "border-accent/20 bg-accent/10 text-accent",
                  )}
                  style={{ 
                    color: 'var(--text-secondary)',
                    borderColor: 'var(--border-color)',
                  }}
                >
                  <div className="shrink-0">
                    <Icon className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                  </div>
                  <span style={{ color: 'var(--text-primary)' }}>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="mt-8 rounded-[1.5rem] p-4" style={{ 
            borderColor: 'var(--border-color)', 
            backgroundColor: 'var(--sidebar-bg)',
            boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.05)'
          }}>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Today</p>
            <div className="mt-4 space-y-3">
              {metrics.map((metric) => {
                const Icon = metric.icon;
                return (
                  <div key={metric.label} className="flex items-center justify-between rounded-2xl px-3 py-3" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em]" style={{ color: 'var(--text-muted)' }}>{metric.label}</p>
                      <p className="mt-1 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{metric.value}</p>
                    </div>
                    <Icon className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <header className="flex items-center justify-between rounded-[2rem] p-5 backdrop-blur-xl sm:px-6" style={{ 
            borderColor: 'var(--border-color)', 
            backgroundColor: 'var(--header-bg)',
            boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)'
          }}>
            <div>
              <p className="text-xs uppercase tracking-[0.24em]" style={{ color: 'var(--accent)', opacity: 0.8 }}>Protected area</p>
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl" style={{ color: 'var(--text-primary)' }}>
                {pathname === "/dashboard"
                  ? "Dashboard"
                  : pathname === "/workout"
                  ? "Workouts"
                  : pathname === "/progress"
                  ? "Progress"
                  : pathname === "/calendar"
                  ? "Calendar"
                  : pathname === "/goals"
                  ? "Goals"
                  : pathname === "/settings"
                  ? "Settings"
                  : "Dashboard"}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Welcome back</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Your private fitness workspace</p>
              </div>
              <div className="rounded-full p-1.5" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--header-bg)' }}>
                <UserButton
                  appearance={{
                    elements: {
                      userButtonPopoverCard: "border border-border-color bg-card text-primary shadow-2xl",
                      userButtonPopoverActionButton: "text-secondary hover:bg-white/5 hover:text-primary",
                      userButtonPopoverActionButtonText: "text-secondary",
                      userButtonPopoverFooter: "hidden",
                    },
                  }}
                />
              </div>
            </div>
          </header>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="min-w-0 rounded-[2rem] p-5 shadow-2xl backdrop-blur-xl sm:p-6 lg:p-8" style={{ 
              borderColor: 'var(--border-color)', 
              backgroundColor: 'var(--card-bg)',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
            }}>
              {children}
            </div>

            <motion.aside
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="rounded-[2rem] p-5 backdrop-blur-xl sm:p-6" style={{ 
                borderColor: 'var(--border-color)', 
                backgroundColor: 'var(--sidebar-bg)',
                boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.05)'
              }}>
              <p className="text-xs font-medium uppercase tracking-[0.24em]" style={{ color: 'var(--accent)', opacity: 0.8 }}>Status</p>
              <h2 className="mt-2 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Build the next layer</h2>
              <p className="mt-3 text-sm leading-7" style={{ color: 'var(--text-secondary)' }}>
                This shell is ready for the metrics grid, workout charts, recent activity, and goal tracking.
              </p>
              <div className="mt-6 space-y-3">
                {[
                  "Workout analytics",
                  "Nutrition insights",
                  "Weekly goal progress",
                ].map((item) => (
                  <div key={item} className="rounded-2xl p-4" style={{ 
                    borderColor: 'var(--border-color)', 
                    backgroundColor: 'var(--bg-secondary)',
                    boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.05)'
                  }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{item}</span>
                  </div>
                ))}
              </div>
            </motion.aside>
          </section>
        </div>
      </div>
    </main>
  );
}