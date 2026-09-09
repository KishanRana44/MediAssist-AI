import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import Stats from "../components/landing/Stats";
import Features from "../components/landing/Features";
import HowItWorks from "../components/landing/HowItWorks";
import AIModules from "../components/landing/AIModules";
import Benefits from "../components/landing/Benefits";
import About from "../components/landing/About";
import TechStack from "../components/landing/TechStack";
import FAQ from "../components/landing/FAQ";
import Contact from "../components/landing/Contact";
import Footer from "../components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="bg-white min-h-screen overflow-x-hidden antialiased text-gray-900 text-base md:text-lg">
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Features />
        <HowItWorks />
        <AIModules />
        <Benefits />
        <About />
        <TechStack />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}