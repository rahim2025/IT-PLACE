import { motion } from "framer-motion";
import { Eye, Target } from "lucide-react";
import SectionHeading from "./SectionHeading";

export default function About() {
  return (
    <section id="about" className="bg-background py-16 md:py-24">
      <div className="container-app">
        <SectionHeading
          eyebrow="About Us"
          title="A trusted technology partner since 2020"
          description="ITPlace is a trusted provider of network infrastructure, ICT solutions, security systems, and technology services — helping businesses stay connected, secure, and future-ready."
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto mt-10 max-w-3xl space-y-5 text-base leading-relaxed text-secondary text-balance"
        >
          <p>
            From small businesses to large enterprises, we have successfully delivered networking
            and technology solutions across commercial, industrial, educational, healthcare,
            hospitality, retail, and government sectors. Our expertise spans enterprise
            networking, structured cabling, fiber optic infrastructure, enterprise wireless
            solutions, CCTV surveillance, server and data center infrastructure, cybersecurity,
            and managed technical support.
          </p>
          <p>
            Our experienced engineers work closely with every client to understand their
            operational requirements and deliver tailored solutions that enhance performance,
            security, and business continuity — from consultation and system design through
            implementation, testing, commissioning, and long-term support.
          </p>
        </motion.div>

        <div className="mx-auto mt-14 grid max-w-4xl gap-6 md:grid-cols-2">
          {[
            {
              icon: Eye,
              title: "Our Vision",
              text: "To become one of the region's most respected technology solution providers, recognized for delivering innovative ICT infrastructure, engineering excellence, and exceptional customer experiences that drive sustainable business success.",
            },
            {
              icon: Target,
              title: "Our Mission",
              text: "To empower businesses with reliable technology solutions through world-class products, professional engineering services, and outstanding customer support — building long-term partnerships based on trust, quality, and continuous innovation.",
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-2xl border border-border bg-surface p-8 shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <item.icon size={24} strokeWidth={1.75} aria-hidden="true" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-primary">{item.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
