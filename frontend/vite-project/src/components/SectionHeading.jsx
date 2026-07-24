import { motion } from "framer-motion";

export default function SectionHeading({ eyebrow, title, description, align = "center", tone = "dark" }) {
  const isCenter = align === "center";
  const isLight = tone === "light";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`max-w-2xl ${isCenter ? "mx-auto text-center" : "text-left"}`}
    >
      {eyebrow && (
        <span
          className={`inline-block text-sm font-semibold tracking-wide uppercase mb-3 ${
            isLight ? "text-sky-300" : "text-accent"
          }`}
        >
          {eyebrow}
        </span>
      )}
      <h2
        className={`text-3xl md:text-4xl font-bold text-balance ${
          isLight ? "text-white" : "text-primary"
        }`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`mt-4 text-base md:text-lg leading-relaxed text-balance ${
            isLight ? "text-slate-300" : "text-muted-foreground"
          }`}
        >
          {description}
        </p>
      )}
    </motion.div>
  );
}
