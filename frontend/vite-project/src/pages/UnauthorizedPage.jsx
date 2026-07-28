import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <section className="flex min-h-[calc(100vh-4rem)] items-center bg-background py-16">
      <div className="container-app text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert size={32} />
        </span>
        <h1 className="mt-6 text-3xl font-extrabold text-primary md:text-4xl">403 — Access Denied</h1>
        <p className="mx-auto mt-3 max-w-md text-base text-muted-foreground">
          You don't have permission to view this page. If you think this is a mistake, contact an administrator.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-light cursor-pointer"
        >
          Back to Home
        </Link>
      </div>
    </section>
  );
}
