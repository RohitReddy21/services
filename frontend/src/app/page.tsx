import Hero from "@/components/home/hero";
import StatsBar from "@/components/home/stats-bar";
import ServicesShowcase from "@/components/home/services-showcase";
import ProcessSection from "@/components/home/process-section";
import TechnicalShowcase from "@/components/home/technical-showcase";
import WhyChoose from "@/components/home/why-choose";
import Testimonials from "@/components/home/testimonials";
import {
  BookingCtaSection,
  ServiceAreaStory,
  TechnicianSection,
} from "@/components/home/story-sections";

export default function Home() {
  return (
    <>
      <Hero />
      <StatsBar />
      <ServicesShowcase />
      <ProcessSection />
      <TechnicalShowcase />
      <WhyChoose />
      <TechnicianSection />
      <ServiceAreaStory />
      <Testimonials />
      <BookingCtaSection />
    </>
  );
}
