import { SignIn } from "@clerk/nextjs";
import { AuthShell } from "@/components/auth-shell";

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to continue tracking workouts, metrics, and progress. Google Sign-In is available once enabled in your Clerk dashboard."
      eyebrow="Member access"
      footerText="New here?"
      footerHref="/signup"
      footerLabel="Create an account"
    >
      <SignIn
        routing="path"
        path="/login"
        signUpUrl="/signup"
        forceRedirectUrl="/dashboard"
        appearance={{
          elements: {
            card: "shadow-none bg-transparent p-0",
            headerTitle: "hidden",
            headerSubtitle: "hidden",
            socialButtonsBlockButton: "rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10",
            formButtonPrimary: "rounded-xl bg-cyan-400 text-slate-950 hover:bg-cyan-300",
            footerActionLink: "text-cyan-300 hover:text-cyan-200",
            identityPreviewText: "text-slate-300",
            formFieldLabel: "text-slate-300",
            formFieldInput: "rounded-xl border-white/10 bg-white/5 text-white placeholder:text-slate-500",
            dividerLine: "bg-white/10",
            dividerText: "text-slate-400",
          },
        }}
      />
    </AuthShell>
  );
}
