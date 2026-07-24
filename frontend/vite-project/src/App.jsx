import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Values from "./components/Values";
import Services from "./components/Services";
import WhyUs from "./components/WhyUs";
import Clients from "./components/Clients";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";
import BackToTopButton from "./components/BackToTopButton";

function App() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content">
        <Hero />
        <Services />
        <About />
        <Values />
        <WhyUs />
        <Clients />
        <Contact />
      </main>
      <Footer />
      <WhatsAppButton />
      <BackToTopButton />
    </>
  );
}

export default App;
