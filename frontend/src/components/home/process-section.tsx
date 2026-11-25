import { ArrowRight, CalendarCheck, ClipboardCheck, FileCheck2, Wrench } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import Reveal, { RevealItem, RevealStagger } from "@/components/ui/reveal";

const steps = [
  {
    icon: CalendarCheck,
    title: "Tell us what you need",
    text: "Choose the service, your equipment and a time that suits you. No prices are shown online.",
  },
  {
    icon: ClipboardCheck,
    title: "We confirm the scope",
    text: "AGS reviews your request and confirms the details and any charges with you before work begins.",
  },
  {
    icon: Wrench,
    title: "Your engineer attends",
    text: "A certified engineer arrives prepared with your job details, equipment history and photos.",
  },
  {
    icon: FileCheck2,
    title: "Checked and documented",
    text: "We verify performance before we leave and send a clear summary of the work completed.",
  },
];

export default function ProcessSection() {
  return (
    <section className="relative overflow-hidden bg-ink-950 py-20 text-white lg:py-28">
      <div aria-hidden="true" className="ags-blueprint absolute inset-0" />

      <div className="container-ags relative">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="ags-eyebrow text-brand-300">How it works</span>
          <h2 className="mt-4 font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
            How a booking works, <span className="ags-gradient-text">start to finish</span>.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-300">
            A simple, transparent process built around clear communication and
            right-first-time engineering.
          </p>
        </Reveal>

        <RevealStagger className="relative mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" step={0.1}>
          <div
            aria-hidden="true"
            className="absolute left-[12%] right-[12%] top-[2.1rem] hidden h-px bg-brand-400/50 lg:block"
          />
          {steps.map(({ icon: Icon, title, text }, index) => (
            <RevealItem key={title} distance={28}>
              <div className="group relative h-full rounded-2xl border border-white/10 bg-white/4 p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-400/50 hover:bg-white/8">
                <div className="flex items-center justify-between">
                  <span className="relative flex size-14 items-center justify-center rounded-2xl bg-brand-400 shadow-lg shadow-brand-500/30">
                    <Icon className="size-6 text-white" />
                  </span>
                  <span className="font-display text-5xl font-extrabold text-white/10 transition-colors duration-300 group-hover:text-brand-400/40">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-6 font-display text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{text}</p>
              </div>
            </RevealItem>
          ))}
        </RevealStagger>

        <Reveal delay={0.1} className="mt-14 flex flex-wrap items-center justify-center gap-3">
          <ButtonLink href="/book" size="lg">
            Start a booking
            <ArrowRight className="size-4" />
          </ButtonLink>
          <ButtonLink href="/how-it-works" variant="outline" size="lg">
            See the full process
          </ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}
