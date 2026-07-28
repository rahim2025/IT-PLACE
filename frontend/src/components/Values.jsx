import { motion } from "framer-motion";
import { Award, HeartHandshake, Lightbulb, Users, ShieldCheck, Handshake } from "lucide-react";
import SectionHeading from "./SectionHeading";
import { coreValues } from "../data/content";

const ICONS = [Award, ShieldCheck, Lightbulb, Users, HeartHandshake, Handshake];

export default function Values() {
  return (
    <section className="bg-charcoal py-16 md:py-24">
      <div className="container-app">
        <SectionHeading
          eyebrow="Core Values"
          title="What drives every project we deliver"
          description="These principles guide how we work with every client, on every engagement."
          tone="light"
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {coreValues.map((value, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: (i % 3) * 0.08 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/20 text-sky-300">
                  <Icon size={22} strokeWidth={1.75} aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-white">{value.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-300">
                  {value.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
