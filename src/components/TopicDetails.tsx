import { ODETopic } from "../types";
import { BookOpen, Compass, Code, BrainCircuit, AlertCircle } from "lucide-react";
import MathView from "./MathView";

interface TopicDetailsProps {
  topic: ODETopic;
}

export default function TopicDetails({ topic }: TopicDetailsProps) {
  return (
    <div className="flex flex-col gap-6">
      
      {/* Title block */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col gap-2 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 bg-sky-500/5 text-sky-400 font-mono text-[10px] uppercase tracking-widest border-l border-b border-slate-800 rounded-bl-xl font-bold">
          {topic.difficulty} level
        </div>
        
        <span className="text-xxs font-mono uppercase tracking-wider text-slate-500 font-semibold">
          Section: {topic.section.toUpperCase()}
        </span>
        <h2 className="text-2xl font-sans font-bold text-slate-100 tracking-tight">{topic.title}</h2>
        <p className="text-sm text-slate-400 italic font-sans max-w-2xl">{topic.subtitle}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-slate-950 text-slate-200 border border-slate-800 rounded-md font-mono text-xs">
            General Form: <MathView math={topic.generalForm} />
          </span>
          <span className="px-3 py-1 bg-slate-950 text-slate-200 border border-slate-800 rounded-md font-mono text-xs">
            Core Model: <MathView math={topic.texFormula} />
          </span>
        </div>
      </div>

      {/* The Four Pedagogical Pillars grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* PILLAR 1: Intuition Before Memorization */}
        <div className="bg-[#0b1016]/95 border border-slate-800 p-5 rounded-2xl shadow-lg flex flex-col gap-3">
          <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2.5">
            <BookOpen className="h-5 w-5 text-indigo-400" />
            <h3 className="font-sans font-semibold text-slate-200 text-sm tracking-wide">1. Intuitive Philosophy</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans hyphens-auto">
            {topic.intuition}
          </p>
        </div>

        {/* PILLAR 2: Geometric Interpretation */}
        <div className="bg-[#0b1016]/95 border border-slate-800 p-5 rounded-2xl shadow-lg flex flex-col gap-3">
          <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2.5">
            <Compass className="h-5 w-5 text-sky-400" />
            <h3 className="font-sans font-semibold text-slate-200 text-sm tracking-wide">2. Geometric Perspective</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {topic.geometric}
          </p>
        </div>

        {/* PILLAR 3: Algebraic Derivation */}
        <div className="bg-[#0b1016]/95 border border-slate-800 p-5 rounded-2xl shadow-lg flex flex-col gap-3 md:col-span-2">
          <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2.5">
            <Code className="h-5 w-5 text-emerald-400" />
            <h3 className="font-sans font-semibold text-slate-200 text-sm tracking-wide">3. Algebraic Derivation & Calculus Proof</h3>
          </div>
          <div className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/65 overflow-x-auto space-y-3">
            {topic.derivation.split("\n\n").map((para, idx) => (
              <div key={idx}>
                {para.startsWith("$$") && para.endsWith("$$") ? (
                  <div className="py-2 overflow-x-auto"><MathView math={para} displayMode={true} /></div>
                ) : (
                  <p>{para}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* PILLAR 4: Formal Mathematical Structure */}
        <div className="bg-[#0b1016]/95 border border-slate-800 p-5 rounded-2xl shadow-lg flex flex-col gap-3 md:col-span-2">
          <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2.5">
            <BrainCircuit className="h-5 w-5 text-amber-500" />
            <h3 className="font-sans font-semibold text-slate-200 text-sm tracking-wide">4. Formal Mathematical Definition</h3>
          </div>
          <div className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/65 overflow-x-auto">
            {topic.formalStructure.split("\n\n").map((para, idx) => (
              <div key={idx}>
                {para.startsWith("$$") && para.endsWith("$$") ? (
                  <div className="py-2 overflow-x-auto"><MathView math={para} displayMode={true} /></div>
                ) : (
                  <p>{para}</p>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Structural Pattern Matching tips */}
      <div className="bg-slate-900 border border-slate-800/90 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6 shadow-md">
        
        {/* Recognition strategies */}
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">Structural Recognition Strategy</span>
          <ul className="space-y-2">
            {topic.recognitionTips.map((tip, idx) => (
              <li key={idx} className="flex gap-2 text-xs text-slate-300">
                <span className="text-sky-500 font-bold font-mono">▸</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Common cognitive traps */}
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-red-400">Avoid Cognitive Pitfall Traps</span>
          <ul className="space-y-2">
            {topic.commonMistakes.map((mistake, idx) => (
              <li key={idx} className="flex gap-2 text-xs text-slate-300">
                <span className="text-red-500 font-bold font-mono">𐄂</span>
                <span>{mistake}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

    </div>
  );
}
