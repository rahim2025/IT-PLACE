import { PackageSearch } from "lucide-react";
import SectionHeading from "../components/SectionHeading";

export default function OrdersPage() {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container-app">
        <SectionHeading eyebrow="Account" title="My Orders" align="left" />

        <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface px-6 py-20 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <PackageSearch size={28} />
          </span>
          <h3 className="mt-5 text-lg font-bold text-primary">Order tracking is coming soon</h3>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Once checkout is live, you'll be able to track order status and history right here.
          </p>
        </div>
      </div>
    </section>
  );
}
