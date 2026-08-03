"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type AuthShellProps = {
  title: string;
  description: string;
  eyebrow: string;
  footerText: string;
  footerHref: string;
  footerLabel: string;
  children: ReactNode;
};

export function AuthShell({
  title,
  description,
  eyebrow,
  footerText,
  footerHref,
  footerLabel,
  children,
}: AuthShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.14),_transparent_24%),linear-gradient(180deg,#020617_0%,#020410_45%,#000000_100%)]" />
      <motion.div
        aria-hidden="true"
        className="absolute left-1/2 top-[-12rem] h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl"
        animate={{ scale: [1, 1.08, 1], opacity: [0.45, 0.75, 0.45] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
          <section className="flex flex-col justify-center space-y-6 lg:pr-6">
            <span className="inline-flex w-fit rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-cyan-200">
              {eyebrow}
            </span>
            <div className="space-y-4">
              <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Track progress with a premium fitness experience.
              </h1>
              <p className="max-w-lg text-sm leading-7 text-slate-300 sm:text-base">
                {description}
              </p>
            </div>
            <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
              {[
                "Protected account access",
                "Google sign-in ready",
                "Responsive across all devices",
                "Built for a polished SaaS feel",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm"
                >
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="flex items-center justify-center">
            <Card className="w-full max-w-md border-white/10 bg-slate-950/70">
              <CardHeader className="space-y-3">
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {children}
                <p className="text-center text-sm text-slate-400">
                  {footerText}{" "}
                  <Link className="font-medium text-cyan-300 transition hover:text-cyan-200" href={footerHref}>
                    {footerLabel}
                  </Link>
                </p>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </main>
  );
}
