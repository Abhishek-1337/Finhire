import * as React from "react";

export const HeroPanel: React.FC = () => (
  <div className="hidden lg:flex flex-1 flex-col justify-between bg-white text-slate-900 p-12 rounded-3xl shadow-sm relative overflow-hidden">
    {/* Grid texture */}
    <div
      className="absolute inset-0 opacity-[0.07]"
      style={{
        backgroundImage:
          "linear-gradient(rgba(15,23,42,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.08) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    />
    {/* Glow orbs */}
    <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-sky-300 opacity-40 blur-3xl pointer-events-none" />
    <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-violet-200 opacity-40 blur-3xl pointer-events-none" />

    {/* Brand */}
    <div className="relative flex items-center gap-2 text-sm font-semibold tracking-widest uppercase text-slate-500">
      <span className="h-px w-8 bg-slate-200" />
      FinHire
    </div>

    {/* Headline */}
    <div className="relative space-y-4">
      <p className="text-4xl font-bold leading-tight tracking-tight">
        The platform built for
        <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-violet-500">
          ambitious teams.
        </span>
      </p>
      <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
        Join thousands of businesses managing their operations from one elegant dashboard.
      </p>
    </div>

    {/* Social proof */}
    <div className="relative flex items-center gap-3">
      <div className="flex -space-x-2">
        {(["V", "M", "A"] as const).map((letter, i) => (
          <div
            key={letter}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white text-xs font-semibold shadow-sm"
            style={{ background: ["#60a5fa", "#818cf8", "#a78bfa"][i] }}
          >
            {letter}
          </div>
        ))}
      </div>
      <p className="text-slate-500 text-xs">
        <span className="text-slate-900 font-medium">2,400+ teams</span> already on board
      </p>
    </div>
  </div>
);