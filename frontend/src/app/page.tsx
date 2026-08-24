import Hero from "@/components/home/hero";
import StatsBar from "@/components/home/stats-bar";
import ServicesShowcase from "@/components/home/services-showcase";
import TechnicalShowcase from "@/components/home/technical-showcase";
import WhyChoose from "@/components/home/why-choose";
import Testimonials from "@/components/home/testimonials";
import {
  BookingCtaSection,
  RefrigerationStory,
  ServiceAreaStory,
  TechnicianSection,
} from "@/components/home/story-sections";

export default function Home() {
  return (
    <>
      <Hero />
      <StatsBar />
      <ServicesShowcase />
      <TechnicalShowcase />
      <WhyChoose />
      <TechnicianSection />
      <RefrigerationStory />
      <ServiceAreaStory />
      <Testimonials />
      <BookingCtaSection />
    </>
  );
}
