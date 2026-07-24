import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, MessageCircle, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import SectionHeading from "./SectionHeading";
import { business } from "../data/content";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const EMPTY_FORM = { name: "", email: "", phone: "", message: "" };

export default function Contact() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Please enter your name.";
    if (!form.email.trim()) {
      next.email = "Please enter your email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = "Please enter a valid email address.";
    }
    if (!form.message.trim()) next.message = "Please tell us a bit about your project.";
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstField = Object.keys(validationErrors)[0];
      document.getElementById(`field-${firstField}`)?.focus();
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
      setForm(EMPTY_FORM);
    } catch {
      setStatus("error");
    }
  };

  return (
    <section id="contact" className="bg-primary py-16 md:py-24">
      <div className="container-app">
        <SectionHeading
          eyebrow="Contact Us"
          title="Let's talk about your infrastructure"
          description="Reach out for a consultation, a project quote, or general enquiries — our team responds fast."
          tone="light"
        />

        <div className="mt-14 grid gap-8 lg:grid-cols-5">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2 flex flex-col gap-5"
          >
            <a
              href={business.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-colors duration-200 hover:bg-white/10 cursor-pointer"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#25D366]/20 text-[#25D366]">
                <MessageCircle size={22} aria-hidden="true" />
              </span>
              <span>
                <span className="block text-sm text-slate-400">WhatsApp</span>
                <span className="block text-base font-semibold text-white">
                  {business.whatsapp}
                </span>
              </span>
            </a>

            <a
              href={`mailto:${business.email}`}
              className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-colors duration-200 hover:bg-white/10 cursor-pointer"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/20 text-sky-300">
                <Mail size={22} aria-hidden="true" />
              </span>
              <span>
                <span className="block text-sm text-slate-400">Email</span>
                <span className="block text-base font-semibold text-white">{business.email}</span>
              </span>
            </a>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <span className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/20 text-sky-300">
                  <MapPin size={22} aria-hidden="true" />
                </span>
                <span className="block text-sm text-slate-400">
                  Store Locations, {business.location}
                </span>
              </span>
              <ul className="mt-4 space-y-3 pl-1">
                {business.stores.map((store) => (
                  <li key={store.name}>
                    <a
                      href={store.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-white underline decoration-white/30 underline-offset-4 hover:decoration-white cursor-pointer"
                    >
                      {store.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            onSubmit={handleSubmit}
            noValidate
            className="lg:col-span-3 rounded-2xl border border-white/10 bg-surface p-6 shadow-xl md:p-8"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <label htmlFor="field-name" className="block text-sm font-medium text-secondary">
                  Name <span className="text-destructive">*</span>
                </label>
                <input
                  id="field-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={form.name}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "error-name" : undefined}
                  className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-base text-foreground outline-none transition-colors focus:border-accent"
                />
                {errors.name && (
                  <p id="error-name" role="alert" className="mt-1.5 text-sm text-destructive">
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="sm:col-span-1">
                <label htmlFor="field-email" className="block text-sm font-medium text-secondary">
                  Email <span className="text-destructive">*</span>
                </label>
                <input
                  id="field-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "error-email" : undefined}
                  className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-base text-foreground outline-none transition-colors focus:border-accent"
                />
                {errors.email && (
                  <p id="error-email" role="alert" className="mt-1.5 text-sm text-destructive">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="field-phone" className="block text-sm font-medium text-secondary">
                  Phone <span className="text-muted-foreground">(optional)</span>
                </label>
                <input
                  id="field-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={handleChange}
                  className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-base text-foreground outline-none transition-colors focus:border-accent"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="field-message"
                  className="block text-sm font-medium text-secondary"
                >
                  How can we help? <span className="text-destructive">*</span>
                </label>
                <textarea
                  id="field-message"
                  name="message"
                  rows={4}
                  value={form.message}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? "error-message" : undefined}
                  className="mt-1.5 w-full resize-none rounded-lg border border-border bg-background px-4 py-2.5 text-base text-foreground outline-none transition-colors focus:border-accent"
                />
                {errors.message && (
                  <p id="error-message" role="alert" className="mt-1.5 text-sm text-destructive">
                    {errors.message}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-base font-semibold text-white transition-colors duration-200 hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto cursor-pointer"
            >
              {status === "loading" && <Loader2 size={18} className="animate-spin" />}
              {status === "loading" ? "Sending..." : "Send Message"}
            </button>

            {status === "success" && (
              <p
                role="status"
                className="mt-4 flex items-center gap-2 text-sm font-medium text-success"
              >
                <CheckCircle2 size={18} />
                Thanks — your message has been sent. We'll get back to you shortly.
              </p>
            )}
            {status === "error" && (
              <p role="alert" className="mt-4 flex items-center gap-2 text-sm font-medium text-destructive">
                <AlertCircle size={18} />
                Something went wrong. Please try again or reach us on WhatsApp.
              </p>
            )}
          </motion.form>
        </div>
      </div>
    </section>
  );
}
