export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium tracking-wide text-text-secondary">
        Phase 01 · Foundation
      </span>
      <h1 className="text-4xl font-bold tracking-tight">
        GYM<span className="text-accent">OVA</span> Admin
      </h1>
      <p className="max-w-md text-center text-text-secondary">
        Train. Eat. Track. Transform. The dashboard shell is running; authentication and modules
        arrive in the next phases.
      </p>
    </main>
  );
}
