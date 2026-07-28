import { ShoppingCart } from "lucide-react";
import SectionHeading from "../components/SectionHeading";

export default function CheckoutPage() {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container-app">
        <SectionHeading eyebrow="Checkout" title="Cart Checkout" align="left" />

        <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface px-6 py-20 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <ShoppingCart size={28} />
          </span>
          <h3 className="mt-5 text-lg font-bold text-primary">Checkout is coming soon</h3>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Cart and payment are still in development. You'll be able to complete purchases here soon.
          </p>
        </div>
      </div>
    </section>
  );
}
