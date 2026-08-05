import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown, ChevronLeft, ChevronRight, MessageCircle, ShoppingBag } from "lucide-react";
import { business } from "../data/content";
import { getServiceIcon } from "../data/serviceIcons";

const SUMMARY_TRUNCATE_LENGTH = 100;

function cardTransform(offset) {
  const abs = Math.abs(offset);
  const dir = Math.sign(offset);

  if (abs > 2) {
    return {
      x: `${dir * 210}%`,
      scale: 0.6,
      opacity: 0,
      rotateY: 0,
      zIndex: 0,
      pointerEvents: "none",
    };
  }

  return {
    x: `${offset * 66}%`,
    scale: abs === 0 ? 1 : abs === 1 ? 0.82 : 0.66,
    opacity: abs === 0 ? 1 : abs === 1 ? 0.55 : 0.24,
    rotateY: abs === 0 ? 0 : dir * -30,
    zIndex: 20 - abs,
    pointerEvents: "auto",
  };
}

function Card({ service, offset, onSelect, reduceMotion, expanded, onToggleExpand }) {
  const Icon = getServiceIcon(service.icon);
  const isActive = offset === 0;
  const transform = cardTransform(offset);
  const quoteMessage = encodeURIComponent(
    `Hi ITPlace, I'd like a quote for: ${service.title}`
  );
  const showExpanded = isActive && expanded;
  const canExpand = service.summary.length > SUMMARY_TRUNCATE_LENGTH;
  const summaryRef = useRef(null);
  const [hasMoreToScroll, setHasMoreToScroll] = useState(false);

  useEffect(() => {
    if (!showExpanded) return undefined;
    const el = summaryRef.current;
    if (!el) return undefined;

    const updateHint = () => {
      setHasMoreToScroll(el.scrollHeight - el.scrollTop - el.clientHeight > 4);
    };
    updateHint();
    el.addEventListener("scroll", updateHint, { passive: true });
    return () => el.removeEventListener("scroll", updateHint);
  }, [showExpanded, service.summary]);

  if (Math.abs(offset) > 3) return null;

  return (
    <motion.div
      className="absolute left-1/2 top-0 w-[260px] -translate-x-1/2 sm:w-[300px] md:w-[340px]"
      style={{ pointerEvents: transform.pointerEvents }}
      animate={{
        x: transform.x,
        scale: transform.scale,
        opacity: transform.opacity,
        rotateY: reduceMotion ? 0 : transform.rotateY,
        zIndex: transform.zIndex,
      }}
      transition={
        reduceMotion
          ? { duration: 0.15 }
          : { type: "spring", stiffness: 260, damping: 30 }
      }
      onClick={() => !isActive && onSelect()}
      role={isActive ? undefined : "button"}
      aria-label={isActive ? undefined : `Show ${service.title}`}
      tabIndex={-1}
    >
      <div
        className={`overflow-hidden rounded-2xl border bg-surface shadow-xl transition-shadow duration-300 ${
          isActive ? "border-accent/30 shadow-2xl cursor-default" : "border-border cursor-pointer"
        }`}
      >
        <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
          <img
            src={service.image}
            alt={`${service.title} — ITPlace technicians at work`}
            loading="lazy"
            width={680}
            height={510}
            className="h-full w-full object-cover"
            draggable={false}
          />
        </div>
        <div className="p-5 md:p-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
          </span>
          <h3 className="mt-4 line-clamp-2 text-base font-bold text-primary md:text-lg">
            {service.title}
          </h3>
          <div className="relative">
            <p
              ref={summaryRef}
              className={`mt-2 text-sm leading-relaxed text-muted-foreground ${
                showExpanded
                  ? "max-h-32 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border"
                  : "line-clamp-2"
              }`}
            >
              {service.summary}
            </p>
            {showExpanded && hasMoreToScroll && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 flex h-6 items-end justify-center bg-gradient-to-t from-surface to-transparent"
              >
                <ChevronDown size={14} className="mb-0.5 animate-bounce text-muted-foreground" />
              </div>
            )}
          </div>
          {isActive && canExpand && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand();
              }}
              aria-expanded={showExpanded}
              className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent-light transition-colors duration-200 cursor-pointer"
            >
              {showExpanded ? "See less" : "See more"}
              <ChevronDown
                size={13}
                className={`transition-transform duration-200 ${showExpanded ? "rotate-180" : ""}`}
              />
            </button>
          )}
          {isActive && (
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
              <a
                href={`${business.whatsappLink}?text=${quoteMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent-light transition-colors duration-200 cursor-pointer"
              >
                <MessageCircle size={16} />
                Request this service
              </a>
              <Link
                to={
                  service.productCategoryId
                    ? `/products?category=${service.productCategoryId}`
                    : "/products"
                }
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-secondary hover:text-primary transition-colors duration-200 cursor-pointer"
              >
                <ShoppingBag size={16} />
                View Products
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function ServicesCarousel3D({ services }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [expandedActive, setExpandedActive] = useState(false);
  const total = services.length;
  const reduceMotion = useReducedMotion();
  const stageRef = useRef(null);

  const goTo = useCallback(
    (index) => {
      setExpandedActive(false);
      setActiveIndex(Math.min(total - 1, Math.max(0, index)));
    },
    [total]
  );

  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") goTo(activeIndex - 1);
    if (e.key === "ArrowRight") goTo(activeIndex + 1);
    if (e.key === "Home") goTo(0);
    if (e.key === "End") goTo(total - 1);
  };

  const handleDragEnd = (_e, info) => {
    const threshold = 60;
    if (info.offset.x < -threshold || info.velocity.x < -400) {
      goTo(activeIndex + 1);
    } else if (info.offset.x > threshold || info.velocity.x > 400) {
      goTo(activeIndex - 1);
    }
  };

  return (
    <div className="container-app overflow-hidden">
      <div
        ref={stageRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-label="Services carousel — use arrow keys, drag, or the buttons to browse"
        className={`relative mx-auto max-w-4xl outline-none transition-[height] duration-300 ease-out ${
          expandedActive ? "h-[640px]" : "h-[500px] sm:h-[540px] md:h-[580px]"
        }`}
        style={{ perspective: 1600 }}
      >
        <motion.div
          className="absolute inset-0 cursor-grab touch-pan-y active:cursor-grabbing"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.12}
          onDragEnd={handleDragEnd}
        >
          {services.map((service, i) => (
            <Card
              key={service.id}
              service={service}
              offset={i - activeIndex}
              onSelect={() => goTo(i)}
              reduceMotion={reduceMotion}
              expanded={expandedActive}
              onToggleExpand={() => setExpandedActive((v) => !v)}
            />
          ))}
        </motion.div>

        <button
          type="button"
          onClick={() => goTo(activeIndex - 1)}
          disabled={activeIndex === 0}
          aria-label="Previous service"
          className="absolute left-0 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface text-primary shadow-md transition-opacity duration-200 hover:bg-muted disabled:opacity-30 cursor-pointer sm:-left-2 md:-left-4"
        >
          <ChevronLeft size={22} />
        </button>
        <button
          type="button"
          onClick={() => goTo(activeIndex + 1)}
          disabled={activeIndex === total - 1}
          aria-label="Next service"
          className="absolute right-0 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface text-primary shadow-md transition-opacity duration-200 hover:bg-muted disabled:opacity-30 cursor-pointer sm:-right-2 md:-right-4"
        >
          <ChevronRight size={22} />
        </button>
      </div>
    </div>
  );
}
