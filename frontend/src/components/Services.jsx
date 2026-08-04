import { useEffect, useState } from "react";
import SectionHeading from "./SectionHeading";
import ServicesCarousel3D from "./ServicesCarousel3D";
import { api } from "../utils/api";

function ServicesSkeleton() {
  return (
    <div className="container-app">
      <div className="mx-auto h-[500px] max-w-4xl animate-pulse rounded-2xl bg-muted sm:h-[540px] md:h-[580px]" />
    </div>
  );
}

export default function Services() {
  const [services, setServices] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;
    api
      .get("/services")
      .then((data) => {
        if (cancelled) return;
        setServices(data.services.filter((s) => s.status === "active"));
        setStatus("success");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="services" className="relative z-10 overflow-hidden bg-background py-16 md:py-24">
      <div className="container-app">
        <SectionHeading
          eyebrow="Our Services"
          title="Complete ICT infrastructure, under one roof"
          description="From network design to structured cabling, cybersecurity to surveillance — browse our end-to-end technology services."
        />
      </div>

      <div className="mt-12 md:mt-16">
        {status === "loading" ? (
          <ServicesSkeleton />
        ) : status === "error" || services.length === 0 ? null : (
          <ServicesCarousel3D services={services} />
        )}
      </div>
    </section>
  );
}
