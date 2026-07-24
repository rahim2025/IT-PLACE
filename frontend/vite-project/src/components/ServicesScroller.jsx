import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronUp, ChevronDown, MessageCircle } from "lucide-react";
import { business } from "../data/content";

const imageVariants = {
  hidden: { opacity: 0, rotateY: -28, rotateX: 6, scale: 0.92 },
  visible: { opacity: 1, rotateY: 0, rotateX: 0, scale: 1 },
};

const textVariants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0 },
};

function Slide({ service, active }) {
  const Icon = service.icon;
  const reduceMotion = useReducedMotion();
  const quoteMessage = encodeURIComponent(
    `Hi ITPlace, I'd like a quote for: ${service.title}`
  );

  const imageTransition = reduceMotion
    ? { duration: 0 }
    : { type: "spring", stiffness: 120, damping: 16, mass: 0.9 };
  const textTransition = reduceMotion
    ? { duration: 0 }
    : { type: "spring", stiffness: 140, damping: 18, delay: active ? 0.22 : 0 };

  return (
    <div className="flex h-screen w-full shrink-0 snap-start snap-always flex-col items-center justify-center px-6 py-8 md:px-12">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center">
        <div
          className="w-full overflow-hidden rounded-2xl border border-border shadow-lg"
          style={{ perspective: 1200 }}
        >
          <motion.img
            src={service.image}
            alt={`${service.title} — ITPlace technicians at work`}
            loading="lazy"
            width={900}
            height={600}
            className="h-[34vh] w-full object-cover sm:h-[42vh] md:h-[48vh]"
            initial={false}
            animate={active ? "visible" : "hidden"}
            variants={imageVariants}
            transition={imageTransition}
            style={{ transformPerspective: 1200 }}
          />
        </div>

        <motion.div
          initial={false}
          animate={active ? "visible" : "hidden"}
          variants={textVariants}
          transition={textTransition}
          className="mt-6 flex max-w-xl flex-col items-center text-center md:mt-8"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
          </span>
          <h3 className="mt-4 text-xl font-bold text-primary text-balance md:text-2xl">
            {service.title}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            {service.summary}
          </p>
          <a
            href={`${business.whatsappLink}?text=${quoteMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-light cursor-pointer"
          >
            <MessageCircle size={16} />
            Request this service
          </a>
        </motion.div>
      </div>
    </div>
  );
}

export default function ServicesScroller({ services }) {
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const total = services.length;

  const goTo = (index) => {
    const el = containerRef.current;
    if (!el) return;
    const clamped = Math.min(total - 1, Math.max(0, index));
    el.scrollTo({ top: clamped * el.clientHeight, behavior: "smooth" });
  };

  // Native scroll-snap drives the transition (GPU-composited, no JS per
  // frame); we only listen to know which slide is active for the controls
  // and to trigger each slide's entrance animation.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const idx = Math.round(el.scrollTop / el.clientHeight);
        setActiveIndex(Math.min(total - 1, Math.max(0, idx)));
        ticking = false;
      });
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [total]);

  return (
    <div className="relative h-screen w-full bg-background">
      <div
        ref={containerRef}
        tabIndex={0}
        aria-label="Services, scroll or use arrow keys to browse"
        className="h-screen w-full snap-y snap-mandatory overflow-y-auto scroll-smooth outline-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {services.map((service, i) => (
          <Slide key={service.id} service={service} active={i === activeIndex} />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-y-0 right-4 flex flex-col items-center justify-center gap-4 md:right-8">
        <button
          type="button"
          onClick={() => goTo(activeIndex - 1)}
          disabled={activeIndex === 0}
          aria-label="Previous service"
          className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-primary shadow-sm transition-opacity duration-200 hover:bg-muted disabled:opacity-30 cursor-pointer"
        >
          <ChevronUp size={20} />
        </button>

        <div className="relative h-40 w-1 overflow-hidden rounded-full bg-border md:h-48">
          <div
            className="absolute inset-x-0 top-0 rounded-full bg-accent transition-[height] duration-300 ease-out"
            style={{ height: `${(activeIndex / (total - 1)) * 100}%` }}
          />
        </div>

        <button
          type="button"
          onClick={() => goTo(activeIndex + 1)}
          disabled={activeIndex === total - 1}
          aria-label="Next service"
          className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-primary shadow-sm transition-opacity duration-200 hover:bg-muted disabled:opacity-30 cursor-pointer"
        >
          <ChevronDown size={20} />
        </button>
      </div>
    </div>
  );
}
