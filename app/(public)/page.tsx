import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white sm:px-8 lg:px-12">
      <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-6xl flex-col justify-center gap-10 rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl lg:p-12">
        <div className="max-w-3xl space-y-6">
          <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-cyan-200">
            Fitness Tracker
          </span>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Premium fitness tracking built for progress.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Sign in to access your dashboard, workouts, and health data.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-6 py-3 text-sm font-medium text-slate-950 transition hover:bg-cyan-300"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Create account
          </Link>
        </div>
      </div>
    </main>
  );
}
