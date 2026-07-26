import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation } from "lucide-react";

export default function StoreMap({ stores }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const store = stores[activeIndex];
  const embedSrc = `https://www.google.com/maps?q=${store.lat},${store.lng}&z=16&output=embed`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5 }}
      className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm"
    >
      <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8">
        <div>
          <span className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-sky-300">
            <MapPin size={16} />
            Store Locations
          </span>
          <h3 className="mt-2 text-xl font-bold text-white md:text-2xl">Visit us in Riyadh</h3>
        </div>

        <div
          role="tablist"
          aria-label="Choose a store location"
          className="flex flex-wrap gap-2"
        >
          {stores.map((s, i) => (
            <button
              key={s.name}
              type="button"
              role="tab"
              aria-selected={i === activeIndex}
              onClick={() => setActiveIndex(i)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors duration-200 cursor-pointer ${
                i === activeIndex
                  ? "border-accent bg-accent text-white"
                  : "border-white/20 bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              {s.shortName}
            </button>
          ))}
        </div>
      </div>

      <div className="h-72 w-full md:h-96">
        <iframe
          key={store.name}
          title={`Map showing ${store.name}`}
          src={embedSrc}
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <div className="flex flex-col gap-4 border-t border-white/10 p-6 sm:flex-row sm:items-center sm:justify-between md:p-8">
        <p className="text-sm leading-relaxed text-slate-300">{store.name}</p>
        <a
          href={store.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white/10 cursor-pointer"
        >
          <Navigation size={16} />
          Get Directions
        </a>
      </div>
    </motion.div>
  );
}
