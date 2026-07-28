import SectionHeading from "./SectionHeading";
import ServicesCarousel3D from "./ServicesCarousel3D";
import { services } from "../data/content";

export default function Services() {
  return (
    <section id="services" className="overflow-hidden bg-background py-16 md:py-24">
      <div className="container-app">
        <SectionHeading
          eyebrow="Our Services"
          title="Complete ICT infrastructure, under one roof"
          description="From network design to structured cabling, cybersecurity to surveillance — browse our 20 end-to-end technology services."
        />
      </div>

      <div className="mt-12 md:mt-16">
        <ServicesCarousel3D services={services} />
      </div>
    </section>
  );
}
