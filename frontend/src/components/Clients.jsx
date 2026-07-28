import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Building2, Quote } from "lucide-react";
import SectionHeading from "./SectionHeading";
import { api } from "../utils/api";

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;
    api
      .get("/clients")
      .then((data) => {
        if (cancelled) return;
        setClients(data.clients.filter((c) => c.status === "active"));
        setStatus("success");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (status !== "loading" && (status === "error" || clients.length === 0)) return null;

  return (
    <section id="clients" className="bg-background py-16 md:py-24">
      <div className="container-app">
        <SectionHeading
          eyebrow="Who We've Worked With"
          title="Trusted on mission-critical projects"
          description="Organizations that rely on ITPlace for infrastructure that has to work, every time."
        />

        <div className="mx-auto mt-12 max-w-3xl space-y-6">
          {status === "loading"
            ? Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-40 animate-pulse rounded-2xl border border-border bg-surface" />
              ))
            : clients.map((client, i) => (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="relative overflow-hidden rounded-2xl border border-border bg-surface p-8 shadow-sm md:p-10"
                >
                  <Quote
                    size={64}
                    strokeWidth={1.5}
                    className="pointer-events-none absolute -right-2 -top-2 text-accent/10"
                    aria-hidden="true"
                  />
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
                      <Building2 size={22} strokeWidth={1.75} aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-primary">{client.name}</h3>
                      <p className="text-sm text-muted-foreground">{client.location}</p>
                    </div>
                  </div>
                  <p className="relative mt-5 text-base leading-relaxed text-secondary text-balance">{client.work}</p>
                </motion.div>
              ))}
        </div>
      </div>
    </section>
  );
}
