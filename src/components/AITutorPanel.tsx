import { useState, useRef, useEffect } from "react";
import { ChatMessage, AISettings, LLMMode, ODETopic } from "../types";
import { Send, Bot, Sparkles, AlertCircle, RefreshCw, Zap, ShieldAlert, Cpu } from "lucide-react";
import MathView from "./MathView";

interface AITutorPanelProps {
  activeTopic: ODETopic;
}

const DEFAULT_SETTINGS: AISettings = {
  mode: "offline-mentor",
  ollamaUrl: "http://localhost:11434",
  ollamaModel: "llama3",
  systemPrompt: "You are a patient, expert Ordinary Differential Equations tutor. Teach intuitively. Ask leading questions. Explain why substitutions are motivated before jumping into symbols. Never dump full lists of solutions directly unless explicitly asked.",
};

export default function AITutorPanel({ activeTopic }: AITutorPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [settings, setSettings] = useState<AISettings>(() => {
    const saved = localStorage.getItem("ai-tutor-settings");
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync settings
  useEffect(() => {
    localStorage.setItem("ai-tutor-settings", JSON.stringify(settings));
  }, [settings]);

  // Load welcome prompt when structural topic changes
  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: `👋 Hello there! I'm your ODE companion. We are currently studying: **${activeTopic.title}** (${activeTopic.difficulty}).\n\nHow can I support your reasoning today? I can help you understand *why* this format exists, *how* we motivate its integrations/substitutions, or diagnose any calculation roadblock you're facing.`,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  }, [activeTopic]);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (customText?: string) => {
    const text = (customText || inputVal).trim();
    if (!text || isGenerating) return;

    if (!customText) setInputVal("");

    const newMsg: ChatMessage = {
      id: Math.random().toString(),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setIsGenerating(true);

    try {
      if (settings.mode === "offline-mentor") {
        // High-quality local rules model - 100% offline, immediate fallback!
        setTimeout(() => {
          let responseText = "";
          const lowercaseQuery = text.toLowerCase();

          if (lowercaseQuery.includes("substitution") || lowercaseQuery.includes("sub") || lowercaseQuery.includes("why substitute")) {
            responseText = `🧠 **Substitution Motivation Analysis**\n\nIn ODEs, we substitute because the raw coordinate layout is unsymmetrical or tangled.\n\nFor **${activeTopic.title}**:\n` +
              (activeTopic.substitutions && activeTopic.substitutions.length > 0 
                ? activeTopic.substitutions.map(s => `- Transforming **${s.original}** into **${s.target}** is motivated because: *${s.motivation}*`).join("\n")
                : "Substituting is used to simplify the derivative relation. For instance, in Homogeneous ODEs we substitute $y = vx$ to eliminate the non-autonomous dimension ratio $y/x$. This transforms a complex coupled system into a clean separable equation.") +
              `\n\nWhat terms are you currently performing operations on? Let's check them together!`;
          } else if (lowercaseQuery.includes("hint") || lowercaseQuery.includes("leading") || lowercaseQuery.includes("step")) {
            const firstStep = activeTopic.interactiveProblem.steps[0];
            responseText = `💡 **Progressive Hint Guide**\n\nLet's reason through this step-by-step. For a problem like:\n\n$$\\text{Solve } ${activeTopic.interactiveProblem.initialOde}$$\n\n**Leading Question:**\n${firstStep.instruction}\n\n*Recall:* ${firstStep.hint}\n\nCan you attempt this algebraic rearrangement first? Post your rearrangement and I will check your terms.`;
          } else if (lowercaseQuery.includes("mistake") || lowercaseQuery.includes("pitfall") || lowercaseQuery.includes("diagnose")) {
            responseText = `⚠️ **Common Roadmap Roadblocks for ${activeTopic.title}**\n\nAvoid these frequent mistakes:\n` +
              activeTopic.commonMistakes.map(m => `- **${m}**`).join("\n") +
              `\n\nDo any of these pitfalls resonate with your current working equations?`;
          } else {
            responseText = `📘 **ODE Mathematical Coach (Offline)**\n\nRegarding your question about **${activeTopic.title}**:\n\nTo think about this intuitively, remember: \n*${activeTopic.intuition}*\n\nThe formal structure we must fit is:\n$$\\text{General Form: } ${activeTopic.generalForm}$$\n\nHow does this structure map to the factors in your specific calculations? Describe your formula, and let's decompose it together!`;
          }

          setMessages((prev) => [
            ...prev,
            {
              id: Math.random().toString(),
              role: "assistant",
              content: responseText,
              timestamp: new Date().toLocaleTimeString(),
            },
          ]);
          setIsGenerating(false);
        }, 800);

      } else if (settings.mode === "local-ollama") {
        // Local Ollama integration (100% local, offline-capable)
        const response = await fetch(`${settings.ollamaUrl}/api/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: settings.ollamaModel,
            prompt: `
              System Instructions: ${settings.systemPrompt}
              Currently Studied Math Topic: ${activeTopic.title}
              Topic Intuition: ${activeTopic.intuition}
              Formula Reference: ${activeTopic.texFormula}

              User Question: ${text}
            `,
            stream: false,
          }),
        });

        if (!response.ok) throw new Error("Local model is unresponsive or not started.");
        const data = await response.json();
        
        setMessages((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            role: "assistant",
            content: data.response || "No response produced by local Ollama model.",
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
        setIsGenerating(false);

      } else {
        // Gemini server proxy `/api/chat`
        const history = messages.map(m => ({ role: m.role, content: m.content }));
        // Append current message
        history.push({ role: "user", content: text });

        const systemPromptFull = `
          ${settings.systemPrompt}
          
          Active Topic: ${activeTopic.title}
          Core Intuition: ${activeTopic.intuition}
          Geometric Meaning: ${activeTopic.geometric}
          Formal Math: ${activeTopic.formalStructure}
          Formula Notation: ${activeTopic.texFormula}

          Crucial Guideline: Emphasize conceptual logic, do not just spit formulas. Walk the student through pattern recognition.
        `;

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history,
            systemPrompt: systemPromptFull,
          }),
        });

        if (!response.ok) throw new Error("Failed to reach cloud tutor network.");
        const data = await response.json();

        setMessages((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            role: "assistant",
            content: data.text,
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
        setIsGenerating(false);
      }
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          role: "assistant",
          content: `⚠️ **AI Tutor Engine Connection Issue**\n\nI was unable to retrieve a response from the designated AI backend (**${settings.mode === "local-ollama" ? `${settings.ollamaUrl} - Model: ${settings.ollamaModel}` : "Gemini Cloud Proxy"}**).\n\n*Error details:* ${err.message || err}\n\n**Troubleshooting:**\n- If running **Ollama** locally, verify it is powered on and started (e.g. run \`ollama run ${settings.ollamaModel}\`).\n- Alternatively, switch back to **Local Mathematical Rule Mentor (Offline Mode)** in settings to get instant offline tutoring responses!`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
      setIsGenerating(false);
    }
  };

  const handleShortcut = (type: "substitution" | "hint" | "pitfalls") => {
    let text = "";
    if (type === "substitution") text = "Why do we use the chosen substitutions and transformations for this method?";
    if (type === "hint") text = "Give me a progressive mathematical question hint to solve current interactive problem.";
    if (type === "pitfalls") text = "Can you diagnose typical mistakes and roadblocks for this method?";
    handleSendMessage(text);
  };

  return (
    <div className="flex flex-col h-[550px] bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      
      {/* Tutor Top Bar header */}
      <div className="flex items-center justify-between px-4 py-3.5 bg-slate-900/90 border-b border-slate-800 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-sky-500/10 rounded-lg">
            <Bot className="h-5 w-5 text-sky-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 font-sans">AI Mathematics Companion</h3>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-slate-400 font-mono scale-[0.95] origin-left">
                {settings.mode === "offline-mentor" && "Rule-Based Mentor (100% Offline)"}
                {settings.mode === "local-ollama" && `Ollama (${settings.ollamaModel})`}
                {settings.mode === "gemini-cloud" && "Gemini 3.5 Flash Supercomputer"}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-1 px-2.5 py-1 text-xxs font-mono text-slate-300 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition"
        >
          <Cpu className="h-3 w-3 text-sky-400" />
          <span>Config Engine</span>
        </button>
      </div>

      {/* Settings Panel toggle */}
      {showSettings && (
        <div className="p-4 bg-slate-950 border-b border-slate-800 text-xs text-slate-200 flex flex-col gap-3">
          <div className="flex items-center gap-1.5 text-sky-400 font-semibold uppercase tracking-wider text-[10px]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Tutor AI Engine Configuration</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setSettings(prev => ({ ...prev, mode: "offline-mentor" }))}
              className={`p-2 rounded border text-center transition ${
                settings.mode === "offline-mentor" 
                  ? "border-sky-500/40 bg-sky-500/10 text-sky-400 font-semibold" 
                  : "border-slate-800 bg-[#121620]"
              }`}
            >
              <span className="block text-[10px] font-mono">Off-Grid</span>
              <span>Local Mentor</span>
            </button>
            <button
              onClick={() => setSettings(prev => ({ ...prev, mode: "local-ollama" }))}
              className={`p-2 rounded border text-center transition ${
                settings.mode === "local-ollama" 
                  ? "border-sky-500/40 bg-sky-500/10 text-sky-400 font-semibold" 
                  : "border-slate-800 bg-[#121620]"
              }`}
            >
              <span className="block text-[10px] font-mono">Local LLM</span>
              <span>Ollama</span>
            </button>
            <button
              onClick={() => setSettings(prev => ({ ...prev, mode: "gemini-cloud" }))}
              className={`p-2 rounded border text-center transition ${
                settings.mode === "gemini-cloud" 
                  ? "border-sky-500/40 bg-sky-500/10 text-sky-400 font-semibold" 
                  : "border-slate-800 bg-[#121620]"
              }`}
            >
              <span className="block text-[10px] font-mono">Cloud AI</span>
              <span>Gemini Flash</span>
            </button>
          </div>

          {settings.mode === "local-ollama" && (
            <div className="grid grid-cols-2 gap-2 p-2 bg-slate-900 rounded border border-slate-800">
              <div className="flex flex-col gap-1">
                <span className="text-xxs text-slate-400 font-mono">Connection Link</span>
                <input
                  type="text"
                  value={settings.ollamaUrl}
                  onChange={(e) => setSettings(prev => ({ ...prev, ollamaUrl: e.target.value }))}
                  className="bg-slate-950 border border-slate-700 rounded p-1 text-xxs font-mono focus:border-sky-500 outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xxs text-slate-400 font-mono">Loaded Model</span>
                <input
                  type="text"
                  value={settings.ollamaModel}
                  onChange={(e) => setSettings(prev => ({ ...prev, ollamaModel: e.target.value }))}
                  className="bg-slate-950 border border-slate-700 rounded p-1 text-xxs font-mono focus:border-sky-500 outline-none"
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-xxs bg-amber-500/5 text-amber-300/85 p-2 rounded border border-amber-500/10">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
            <span>
              {settings.mode === "offline-mentor" && "Mathematical template mentor operates 100% offline immediately inside your browser."}
              {settings.mode === "local-ollama" && "Ollama allows fully offline client-side LLM inference. Ensure Ollama running CORS is active."}
              {settings.mode === "gemini-cloud" && "Utilizes highly competent remote Gemini mathematical models over secure server-side routes."}
            </span>
          </div>
        </div>
      )}

      {/* Messages Stream area */}
      <div 
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto bg-slate-950/40 space-y-4"
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col max-w-[85%] ${
              m.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
            }`}
          >
            <span className="text-[10px] font-mono text-slate-500 mb-1 px-1">
              {m.role === "user" ? "You" : "ODE Mentor"} · {m.timestamp}
            </span>
            <div
              className={`p-3.5 rounded-2xl text-xs leading-relaxed break-words border ${
                m.role === "user"
                  ? "bg-sky-600/15 text-sky-200 border-sky-500/25 rounded-tr-sm"
                  : "bg-slate-900 text-slate-200 border-slate-800 rounded-tl-sm"
              }`}
            >
              {/* Parse headers/markdown elements simply */}
              <div className="space-y-2 whitespace-pre-wrap">
                {m.content.split("\n\n").map((paragraph, pIdx) => {
                  // If block markdown, render code or simple blockquote
                  if (paragraph.startsWith("$$") && paragraph.endsWith("$$")) {
                    return <div className="py-2 text-center" key={pIdx}><MathView math={paragraph} /></div>;
                  }
                  return <p key={pIdx} className="leading-relaxed">{paragraph}</p>;
                })}
              </div>
            </div>
          </div>
        ))}

        {isGenerating && (
          <div className="flex items-center gap-2 mr-auto text-xxs text-slate-400 font-mono bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl">
            <RefreshCw className="h-3 w-3 animate-spin text-sky-400" />
            <span>Math mentor is compiling response...</span>
          </div>
        )}
      </div>

      {/* Pedagogy helper shortcuts */}
      <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-950 border-t border-slate-900 overflow-x-auto whitespace-nowrap scrollbar-none">
        <button
          onClick={() => handleShortcut("substitution")}
          className="px-2.5 py-1 text-xxs font-mono font-medium rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition"
        >
          Substitute Motivation 🔍
        </button>
        <button
          onClick={() => handleShortcut("hint")}
          className="px-2.5 py-1 text-xxs font-mono font-medium rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition"
        >
          Solve Hint 💡
        </button>
        <button
          onClick={() => handleShortcut("pitfalls")}
          className="px-2.5 py-1 text-xxs font-mono font-medium rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition"
        >
          Common Pitfalls ⚠️
        </button>
      </div>

      {/* User Prompt Input field */}
      <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder={`Inquire about ${activeTopic.title}...`}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSendMessage();
          }}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-sans text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500 transition"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={!inputVal.trim() || isGenerating}
          className="p-2 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-slate-600 rounded-xl text-white transition font-semibold"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>

    </div>
  );
}
