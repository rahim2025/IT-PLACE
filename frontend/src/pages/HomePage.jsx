import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Hero from "../components/Hero";
import Services from "../components/Services";
import About from "../components/About";
import Values from "../components/Values";
import WhyUs from "../components/WhyUs";
import Clients from "../components/Clients";
import Contact from "../components/Contact";

export default function HomePage() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const el = document.querySelector(location.hash);
    if (!el) return;
    const id = requestAnimationFrame(() => el.scrollIntoView({ behavior: "smooth", block: "start" }));
    return () => cancelAnimationFrame(id);
  }, [location]);

  return (
    <>
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
