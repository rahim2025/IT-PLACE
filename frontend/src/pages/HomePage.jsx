import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Hero from "../components/Hero";
import Services from "../components/Services";
import About from "../components/About";
import Values from "../components/Values";
import WhyUs from "../components/WhyUs";
import Clients from "../components/Clients";
import Contact from "../components/Contact";
import SeoHead from "../seo/SeoHead";
import { buildOrganizationSchema, buildWebsiteSchema } from "../seo/schema";
import { useSettings } from "../hooks/useSettings";

export default function HomePage() {
  const location = useLocation();
  const settings = useSettings();

  useEffect(() => {
    if (!location.hash) return;
    const el = document.querySelector(location.hash);
    if (!el) return;
    const id = requestAnimationFrame(() => el.scrollIntoView({ behavior: "smooth", block: "start" }));
    return () => cancelAnimationFrame(id);
  }, [location]);

  return (
    <>
      <SeoHead jsonLd={[buildOrganizationSchema(settings), buildWebsiteSchema()]} />
      <Hero />
      <Services />
      <About />
      <Values />
      <WhyUs />
      <Clients />
      <Contact />
    </>
  );
}
