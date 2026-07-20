import { Link } from "react-router-dom";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <PageLayout>
      <section className="w-full max-w-3xl rounded-2xl border border-border bg-white p-8 shadow-sm sm:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">HIMTI Regis</p>
        <h1 className="mt-4 max-w-xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Frontend boilerplate ready for the next feature.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
          React, TypeScript, routing, server-state management, API configuration, Tailwind,
          testing, and linting are ready to use.
        </p>
        <Button asChild className="mt-8">
          <Link to="/">Start building</Link>
        </Button>
      </section>
    </PageLayout>
  );
}
