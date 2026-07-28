import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import SectionHeading from "./SectionHeading";
import { whyItplace } from "../data/content";

export default function WhyUs() {
  return (
    <section id="why-us" className="bg-background py-16 md:py-24">
      <div className="container-app">
        <SectionHeading
          eyebrow="Why ITPlace"
          title="Complete, dependable technology partnership"
          description="Since 2020, ITPlace has earned the confidence of organizations across Saudi Arabia through consistent delivery and technical excellence."
        />

        <div className="mt-14 grid gap-x-8 gap-y-10 md:grid-cols-2">
          {whyItplace.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: (i % 4) * 0.06 }}
              className="flex gap-4"
            >
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                <CheckCircle2 size={20} strokeWidth={2} aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-base font-bold text-primary">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
