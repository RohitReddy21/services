"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Send, X } from "lucide-react";
import { matchFaq, SUGGESTED_QUESTIONS } from "@/lib/chat/match-faq";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  from: "bot" | "user";
  text: string;
  showContactCta?: boolean;
}

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `msg-${idCounter}`;
}

const GREETING: ChatMessage = {
  id: "greeting",
  from: "bot",
  text: "Hi! I'm the AGS assistant. Ask me about bookings, Care Plans, rewards, or anything else — I'll do my best to help, or point you to the team.",
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const respond = (question: string) => {
    const trimmed = question.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = { id: nextId(), from: "user", text: trimmed };
    const match = matchFaq(trimmed);

    const botMsg: ChatMessage = match
      ? { id: nextId(), from: "bot", text: match.faq.answer }
      : {
          id: nextId(),
          from: "bot",
          text: "I don't have a ready answer for that yet. Our team can help directly.",
          showContactCta: true,
        };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    respond(input);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="mb-3 flex h-[28rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-2xl shadow-navy-900/20"
          >
            <div className="flex items-center justify-between bg-ink-900 px-4 py-3.5 text-white">
              <div>
                <p className="text-sm font-bold">AGS Assistant</p>
                <p className="text-[11px] text-brand-200">Usually replies instantly</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="ags-focus flex size-7 items-center justify-center rounded-full text-white/80 hover:bg-white/10"
              >
                <X className="size-4" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-25 p-4">
              {messages.map((msg) => (
                <div key={msg.id} className={cn("flex", msg.from === "user" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed",
                      msg.from === "user"
                        ? "bg-brand-600 text-white"
                        : "border border-slate-200 bg-white text-navy-800"
                    )}
                  >
                    {msg.text}
                    {msg.showContactCta && (
                      <Link
                        href="/contact"
                        className="mt-2 block font-semibold text-brand-600 hover:text-brand-700"
                      >
                        Contact our team &rarr;
                      </Link>
                    )}
                  </div>
                </div>
              ))}

              {messages.length === 1 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => respond(q)}
                      className="ags-focus rounded-full border border-brand-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-brand-700 hover:bg-brand-50"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-slate-200 p-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                type="text"
                placeholder="Type your question..."
                aria-label="Type your question"
                className="h-10 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
              />
              <button
                type="submit"
                aria-label="Send"
                className="ags-focus flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white hover:bg-brand-700"
              >
                <Send className="size-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat assistant" : "Open chat assistant"}
        className="ags-focus flex size-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-xl shadow-brand-600/30 transition-transform hover:scale-105"
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </button>
    </div>
  );
}
