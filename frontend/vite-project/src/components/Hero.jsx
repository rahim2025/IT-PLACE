import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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

function ScrollCue() {
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY < 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={() => document.querySelector("#services")?.scrollIntoView({ behavior: "smooth" })}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          aria-label="Scroll down for more information"
          className="fixed inset-x-0 top-[calc(62vh-46px)] z-30 mx-auto flex w-fit items-start justify-center rounded-full border-2 border-white/70 bg-black/20 p-1.5 text-white/80 shadow-lg backdrop-blur-sm transition-colors duration-200 hover:border-white hover:text-white cursor-pointer md:top-[calc(66vh-46px)]"
          style={{ width: 22, height: 34 }}
        >
          <motion.span
            className="block h-1.5 w-1.5 rounded-full bg-current"
            animate={reduceMotion ? {} : { y: [0, 10, 0], opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export default function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-[62vh] items-center overflow-hidden bg-primary pt-20 pb-8 md:min-h-[66vh] md:pt-24"
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
            className="mt-4 text-4xl font-extrabold leading-tight text-white text-balance md:text-5xl"
          >
            Network Infrastructure &amp; ICT Solutions Built for What&apos;s Next
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 max-w-xl text-lg leading-relaxed text-slate-300 text-balance"
          >
            ITPlace delivers enterprise networking, fiber infrastructure, cybersecurity, and
            surveillance solutions across Saudi Arabia — engineered for performance, security, and
            long-term reliability.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-6 flex flex-col gap-4 sm:flex-row"
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
            className="mt-6 grid grid-cols-2 gap-6 border-t border-white/10 pt-4 sm:grid-cols-4"
          >
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="text-sm text-slate-400">{stat.label}</dt>
                <dd className="mt-1 text-2xl font-bold text-white">{stat.value}</dd>
              </div>
            ))}
          </motion.dl>
        </div>
      </div>

      <ScrollCue />
    </section>
  );
}
