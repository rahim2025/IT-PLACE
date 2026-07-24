import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, MessageCircle } from "lucide-react";
import { business, stats } from "../data/content";

const PROMO_VIDEO_SRC = "/video/itplace-promo.mp4";

function VideoBackground() {
  const videoRef = useRef(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      videoRef.current?.pause();
    }
  }, []);

  return (
    <video
      ref={videoRef}
      src={PROMO_VIDEO_SRC}
      className="absolute inset-0 h-full w-full object-cover"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden="true"
    />
  );
}

export default function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-dvh items-center overflow-hidden bg-primary pt-24 pb-16 md:pt-28"
    >
      <div className="absolute inset-0 z-0">
        <VideoBackground />
      </div>
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-primary/50 via-primary/70 to-primary"
        aria-hidden="true"
      />

      <div className="container-app relative z-10">
        <div className="max-w-3xl">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm font-medium text-sky-200 backdrop-blur-sm"
          >
            Trusted Technology Partner since {business.founded}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 text-4xl font-extrabold leading-tight text-white text-balance md:text-6xl"
          >
            Network Infrastructure &amp; ICT Solutions Built for What&apos;s Next
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300 text-balance"
          >
            ITPlace delivers enterprise networking, fiber infrastructure, cybersecurity, and
            surveillance solutions across Riyadh — engineered for performance, security, and
            long-term reliability.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-9 flex flex-col gap-4 sm:flex-row"
          >
            <a
              href="#services"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector("#services")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-accent/20 transition-colors duration-200 hover:bg-accent-light cursor-pointer"
            >
              Explore Our Services
              <ArrowRight size={18} />
            </a>
            <a
              href={business.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-colors duration-200 hover:bg-white/10 cursor-pointer"
            >
              <MessageCircle size={18} />
              Chat on WhatsApp
            </a>
          </motion.div>

          <motion.dl
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-14 grid grid-cols-2 gap-6 border-t border-white/10 pt-8 sm:grid-cols-4"
          >
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="text-sm text-slate-400">{stat.label}</dt>
                <dd className="mt-1 text-2xl font-bold text-white md:text-3xl">{stat.value}</dd>
              </div>
            ))}
          </motion.dl>
        </div>
      </div>
    </section>
  );
}
