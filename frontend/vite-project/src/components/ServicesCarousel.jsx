import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronUp, ChevronDown, MessageCircle } from "lucide-react";
import { business } from "../data/content";

const imageVariants = {
  hidden: { opacity: 0, rotateY: -24, rotateX: 5, scale: 0.94 },
  visible: { opacity: 1, rotateY: 0, rotateX: 0, scale: 1 },
};

const textVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

function Card({ service, active }) {
  const Icon = service.icon;
  const reduceMotion = useReducedMotion();
  const quoteMessage = encodeURIComponent(
    `Hi ITPlace, I'd like a quote for: ${service.title}`
  );

  const imageTransition = reduceMotion
    ? { duration: 0 }
    : { type: "spring", stiffness: 130, damping: 16, mass: 0.9 };
  const textTransition = reduceMotion
    ? { duration: 0 }
    : { type: "spring", stiffness: 150, damping: 18, delay: active ? 0.2 : 0 };

  return (
    <article className="flex h-full w-full shrink-0 snap-start snap-always flex-col overflow-hidden bg-surface">
      <div className="aspect-video w-full shrink-0 overflow-hidden bg-muted" style={{ perspective: 1000 }}>
        <motion.img
          src={service.image}
          alt={`${service.title} — ITPlace technicians at work`}
          loading="lazy"
          width={640}
          height={360}
          className="h-full w-full object-cover"
          initial={false}
          animate={active ? "visible" : "hidden"}
          variants={imageVariants}
          transition={imageTransition}
          style={{ transformPerspective: 1000 }}
        />
      </div>
      <motion.div
        className="flex flex-1 flex-col justify-center p-6"
        initial={false}
        animate={active ? "visible" : "hidden"}
        variants={textVariants}
        transition={textTransition}
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
        </span>
        <h3 className="mt-4 text-lg font-bold text-primary">{service.title}</h3>
        <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{service.summary}</p>
        <a
          href={`${business.whatsappLink}?text=${quoteMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent-light transition-colors duration-200 cursor-pointer"
        >
          <MessageCircle size={16} />
          Request this service
        </a>
      </motion.div>
    </article>
  );
}

export default function ServicesCarousel({ services }) {
  const trackRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const total = services.length;

  useEffect(() => {
    const el = trackRef.current;
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

  const goTo = (index) => {
    const clamped = Math.min(total - 1, Math.max(0, index));
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ top: clamped * el.clientHeight, behavior: "smooth" });
  };

  return (
    <div className="container-app">
      <div className="relative">
        <div
          ref={trackRef}
          tabIndex={0}
          aria-label="Services, scroll or use arrow keys to browse"
          className="flex h-[68vh] snap-y snap-mandatory flex-col overflow-y-auto scroll-smooth rounded-2xl border border-border outline-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {services.map((service, i) => (
            <Card key={service.id} service={service} active={i === activeIndex} />
          ))}
        </div>

        <div className="pointer-events-none absolute inset-y-0 right-3 flex flex-col items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => goTo(activeIndex - 1)}
            disabled={activeIndex === 0}
            aria-label="Previous service"
            className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-primary shadow-sm disabled:opacity-30 cursor-pointer"
          >
            <ChevronUp size={18} />
          </button>
          <button
            type="button"
            onClick={() => goTo(activeIndex + 1)}
            disabled={activeIndex === total - 1}
            aria-label="Next service"
            className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-primary shadow-sm disabled:opacity-30 cursor-pointer"
          >
            <ChevronDown size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
