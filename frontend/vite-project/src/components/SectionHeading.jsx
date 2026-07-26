import { motion } from "framer-motion";

const TONES = {
  dark: {
    eyebrow: "text-accent",
    title: "text-primary",
    description: "text-muted-foreground",
  },
  light: {
    eyebrow: "text-sky-300",
    title: "text-white",
    description: "text-slate-300",
  },
};

export default function SectionHeading({ eyebrow, title, description, align = "center", tone = "dark" }) {
  const isCenter = align === "center";
  const palette = TONES[tone] ?? TONES.dark;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`max-w-2xl ${isCenter ? "mx-auto text-center" : "text-left"}`}
    >
      {eyebrow && (
        <span className={`inline-block text-sm font-semibold tracking-wide uppercase mb-3 ${palette.eyebrow}`}>
          {eyebrow}
        </span>
      )}
      <h2 className={`text-3xl md:text-4xl font-bold text-balance ${palette.title}`}>{title}</h2>
      {description && (
        <p className={`mt-4 text-base md:text-lg leading-relaxed text-balance ${palette.description}`}>
          {description}
        </p>
      )}
    </motion.div>
  );
}
