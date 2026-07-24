import { useEffect, useState } from "react";
import SectionHeading from "./SectionHeading";
import ServicesScroller from "./ServicesScroller";
import ServicesCarousel from "./ServicesCarousel";
import { services } from "../data/content";

function usePinnedScrollEnabled() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const widthQuery = window.matchMedia("(min-width: 1024px)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const update = () => setEnabled(widthQuery.matches && !motionQuery.matches);
    update();

    widthQuery.addEventListener("change", update);
    motionQuery.addEventListener("change", update);
    return () => {
      widthQuery.removeEventListener("change", update);
      motionQuery.removeEventListener("change", update);
    };
  }, []);

  return enabled;
}

export default function Services() {
  const pinnedScrollEnabled = usePinnedScrollEnabled();

  return (
    <section id="services" className="bg-background">
      <div className="container-app pt-16 md:pt-24">
        <SectionHeading
          eyebrow="Our Services"
          title="Complete ICT infrastructure, under one roof"
          description="From network design to structured cabling, cybersecurity to surveillance — scroll through our 20 end-to-end technology services."
        />
      </div>

      <div className="mt-10 md:mt-14">
        {pinnedScrollEnabled ? (
          <ServicesScroller services={services} />
        ) : (
          <div className="pb-16 md:pb-24">
            <ServicesCarousel services={services} />
          </div>
        )}
      </div>
    </section>
  );
}
