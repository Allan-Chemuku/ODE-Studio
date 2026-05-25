import { useState, useEffect } from "react";
import { CURRICULUM } from "./curriculumData";
import { StudentProgress, ODETopic } from "./types";
import SlopeField from "./components/SlopeField";
import TopicDetails from "./components/TopicDetails";
import InteractiveSolver from "./components/InteractiveSolver";
import AITutorPanel from "./components/AITutorPanel";
import { generatePDFReport } from "./utils/pdfGenerator";
import { 
  BookOpen, 
  Activity, 
  Sparkles, 
  Sliders, 
  Flame, 
  Award, 
  CheckCircle2, 
  HelpCircle, 
  Minimize2, 
  Maximize2, 
  Menu, 
  X, 
  Bot, 
  Download, 
  Info,
  Layers,
  GraduationCap
} from "lucide-react";

export default function App() {
  const [activeTopicId, setActiveTopicId] = useState("derivatives-rates");
  const [activeTab, setActiveTab] = useState<"laboratory" | "derivation">("laboratory");
  const [focusMode, setFocusMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tutorOpen, setTutorOpen] = useState(true);

  // Student progress state
  const [progress, setProgress] = useState<StudentProgress>(() => {
    const saved = localStorage.getItem("ode-student-progress");
    if (saved) return JSON.parse(saved);
    return {
      completedTopics: [],
      quizScores: {},
      streakCount: 3, // starting friendly encouraging streak
      lastActiveDate: new Date().toISOString().split("T")[0],
    };
  });

  // Keep progress synchronised offline-first
  useEffect(() => {
    localStorage.setItem("ode-student-progress", JSON.stringify(progress));
  }, [progress]);

  // Handle active active study changes
  const activeTopic = CURRICULUM.find((t) => t.id === activeTopicId) || CURRICULUM[0];

  const handleProgressComplete = (topicId: string, quizScore: number) => {
    setProgress((prev) => {
      const isAlreadyCompleted = prev.completedTopics.includes(topicId);
      const updatedFinished = isAlreadyCompleted 
        ? prev.completedTopics 
        : [...prev.completedTopics, topicId];

      const updatedScores = { ...prev.quizScores, [topicId]: quizScore };

      // Re-evaluate daily streak
      const todayStr = new Date().toISOString().split("T")[0];
      let streak = prev.streakCount;
      if (prev.lastActiveDate !== todayStr) {
        streak += 1;
      }

      return {
        completedTopics: updatedFinished,
        quizScores: updatedScores,
        streakCount: streak,
        lastActiveDate: todayStr
      };
    });
  };

  const resetAllProgress = () => {
    if (confirm("Are you sure you want to reset your local ODE learning analytics? This action cannot be undone.")) {
      setProgress({
        completedTopics: [],
        quizScores: {},
        streakCount: 1,
        lastActiveDate: new Date().toISOString().split("T")[0]
      });
    }
  };

  // Sections labels representation
  const sectionLabels: Record<string, string> = {
    "foundations": "Section 1: Foundations",
    "first-order": "Section 2: First-Order ODEs",
    "second-order": "Section 3: Second-Order ODEs",
    "applications": "Section 4: Applications",
    "advanced": "Section 5: Advanced Topics",
  };

  const sectionsList = ["foundations", "first-order", "second-order", "applications", "advanced"];

  // Compute stats
  const masteredCount = progress.completedTopics.length;
  const totalTopicsCount = CURRICULUM.length;
  const scoresArray = Object.values(progress.quizScores) as number[];
  const averageGrade = scoresArray.length > 0
    ? Math.round(scoresArray.reduce((acc, score) => acc + score, 0) / scoresArray.length * 10) / 10
    : 0;

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-sky-200">
      
      {/* Platform header */}
      <header className="flex items-center justify-between px-5 py-3 bg-[#0a0f1d] border-b border-slate-800/80 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 px-2 text-slate-400 hover:text-slate-100 border border-slate-800 rounded transition focus:outline-none"
            title="Toggle Curriculum Panel"
          >
            <Menu className="h-4.5 w-4.5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="h-6.5 w-6.5 bg-gradient-to-tr from-sky-500 via-indigo-600 to-amber-500 rounded-lg flex items-center justify-center font-bold font-mono text-sm tracking-tighter text-white shadow-md">
              y'
            </span>
            <div>
              <h1 className="text-sm font-bold tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
                Ordinary Differential Equations Studio
              </h1>
              <p className="text-[10px] text-sky-400 font-medium font-mono uppercase tracking-widest hidden sm:block">
                Deterministic Workspace & AI Mentor
              </p>
            </div>
          </div>
        </div>

        {/* Top Header stats counters */}
        <div className="flex items-center gap-4 text-xs">
          <div className="hidden md:flex items-center gap-4 bg-slate-900/60 px-3.5 py-1.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5 border-r border-slate-800 pr-3">
              <Flame className="h-4.5 w-4.5 text-amber-500 fill-amber-500" />
              <span className="font-semibold text-slate-200">{progress.streakCount} Day Streak</span>
            </div>
            <div className="flex items-center gap-1.5 border-r border-slate-800 pr-3">
              <Award className="h-4.5 w-4.5 text-sky-400" />
              <span className="font-semibold text-slate-200">{masteredCount}/{totalTopicsCount} Solved</span>
            </div>
            <div className="flex items-center gap-1.5">
              <GraduationCap className="h-4.5 w-4.5 text-indigo-400" />
              <span className="font-semibold text-slate-200">{averageGrade > 0 ? `${averageGrade} Avg Checkpoint` : "0 Checked"}</span>
            </div>
          </div>

          <button
            onClick={() => setFocusMode(!focusMode)}
            className={`p-2 rounded-xl transition-all border ${
              focusMode
                ? "bg-amber-500/10 border-amber-500/40 text-amber-400"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
            title={focusMode ? "Exit Widescreen Focus Mode" : "Activate Focus Mode"}
          >
            {focusMode ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>

          <button
            onClick={() => setTutorOpen(!tutorOpen)}
            className={`p-2 rounded-xl border flex items-center gap-1.5 px-3 transition-colors ${
              tutorOpen
                ? "bg-sky-500/10 border-sky-500/40 text-sky-400"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Bot className="h-4 w-4" />
            <span className="text-xxs font-semibold font-mono uppercase tracking-wider hidden sm:inline">AI Tutor</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Frame container */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* SIDEBAR: collapsible Curriculum catalog */}
        {sidebarOpen && !focusMode && (
          <aside className="w-80 border-r border-slate-800/80 bg-[#070b14] flex flex-col shrink-0 overflow-y-auto">
            
            {/* Local student diagnostics */}
            <div className="p-4 border-b border-slate-800/60 bg-slate-900/10 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xxs font-mono uppercase text-slate-500 font-semibold tracking-wider">
                <span>Offline Progress Persistence</span>
                <span className="text-emerald-500 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Ready
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/50 flex flex-col gap-1.5">
                <span className="text-xxs text-slate-400">Mastery Progress Bar</span>
                <div className="w-full bg-slate-850 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="bg-gradient-to-r from-sky-400 via-indigo-500 to-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(masteredCount / totalTopicsCount) * 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono mt-0.5 text-slate-400">
                  <span>{Math.round((masteredCount / totalTopicsCount) * 100)}% Mastered</span>
                  <button 
                    onClick={resetAllProgress} 
                    className="hover:text-red-400 underline cursor-pointer text-[10px]"
                  >
                    Reset analytics
                  </button>
                </div>
              </div>
            </div>

            {/* Sections Catalog Nav Tree */}
            <nav className="flex-1 p-3 space-y-4">
              {sectionsList.map((sectKey) => {
                const sectTopics = CURRICULUM.filter((t) => t.section === sectKey);

                return (
                  <div key={sectKey} className="space-y-1.5">
                    <h5 className="text-[10px] font-semibold text-slate-500 font-mono tracking-widest uppercase px-2 py-1">
                      {sectionLabels[sectKey]}
                    </h5>
                    
                    <div className="space-y-1">
                      {sectTopics.map((topic) => {
                        const isCurrent = activeTopicId === topic.id;
                        const isQuizzed = progress.completedTopics.includes(topic.id);
                        const quizResult = progress.quizScores[topic.id];

                        return (
                          <button
                            key={topic.id}
                            onClick={() => {
                              setActiveTopicId(topic.id);
                              // Auto-enable logic panel
                              setActiveTab("laboratory");
                            }}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs transition flex flex-col border ${
                              isCurrent
                                ? "bg-sky-500/5 border-sky-400/30 text-sky-200"
                                : "bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="font-semibold tracking-tight truncate pr-1">
                                {topic.title}
                              </span>
                              
                              {/* Passed Checkpoint Indicators */}
                              {isQuizzed && (
                                <span className="text-emerald-400 shrink-0 flex items-center gap-0.5 font-semibold text-[10px]">
                                  ★ {quizResult !== undefined ? quizResult : ""}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-mono text-slate-500 mt-0.5">
                              {topic.subtitle.length > 50 ? `${topic.subtitle.slice(0, 48)}...` : topic.subtitle}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </nav>

            {/* Offline cache indicators footer */}
            <div className="p-3 bg-slate-950 border-t border-slate-900 text-xxs text-slate-500 space-y-1">
              <p className="flex items-center gap-1.5 font-semibold text-slate-400">
                <Download className="h-3.5 w-3.5 text-sky-500" />
                <span>PWA Local Modules Cached</span>
              </p>
              <p className="leading-relaxed">All deterministic solver arrays, slope direction fields, and mathematical reasoning models are pre-cached and operate fully offline.</p>
            </div>
          </aside>
        )}

        {/* WORKSPACE CORE AREA: visual graphing and mathematical derivations */}
        <main className="flex-1 flex flex-col bg-[#050810] p-4 lg:p-6 overflow-y-auto min-w-0">
          
          {/* Workspace navigation controls */}
          <div className="flex items-center justify-between bg-slate-900/35 p-3 rounded-2xl border border-slate-800/80 mb-6 gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-sky-500/10 text-sky-400 rounded-lg">
                <Layers className="h-4.5 w-4.5" />
              </span>
              <div>
                <span className="text-xxs text-slate-500 font-mono tracking-widest uppercase block">Selected Topic</span>
                <span className="text-xs font-bold font-sans text-slate-200">{activeTopic.title}</span>
              </div>
            </div>

            {/* Actions Block: Export Action + Tab controls */}
            <div className="flex items-center gap-3.5 flex-wrap">
              {/* Export Archival PDF Button */}
              <button
                onClick={() => generatePDFReport(activeTopic, progress)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/25 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-sky-500/5 active:scale-95"
                title="Export Formatted Archival Study PDF of active derivation milestones and laboratory states"
              >
                <Download className="h-4 w-4 text-sky-400" />
                <span>Export Report PDF</span>
              </button>

              {/* Navigation tabs */}
              <div className="flex bg-[#0d131f] p-1 rounded-xl border border-slate-800 text-xs font-mono">
                <button
                  onClick={() => setActiveTab("laboratory")}
                  className={`flex items-center gap-1 px-4 py-1.5 rounded-lg transition ${
                    activeTab === "laboratory"
                      ? "bg-sky-500/15 text-sky-400 font-bold border border-sky-500/10"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Activity className="h-4 w-4 shrink-0" />
                  <span>🔬 Mathematics Lab</span>
                </button>
                
                <button
                  onClick={() => setActiveTab("derivation")}
                  className={`flex items-center gap-1 px-4 py-1.5 rounded-lg transition ${
                    activeTab === "derivation"
                      ? "bg-indigo-500/15 text-indigo-400 font-bold border border-indigo-500/10"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <GraduationCap className="h-4 w-4 shrink-0" />
                  <span>🎓 Guided Derivation</span>
                </button>
              </div>
            </div>
          </div>

          {/* Core content toggled workspace */}
          <div className="flex-1 flex flex-col gap-6">
            {activeTab === "laboratory" ? (
              <div className="flex flex-col gap-6">
                
                {/* Laboratory header details */}
                <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl flex items-start gap-4 shadow-lg">
                  <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl shrink-0">
                    <Sliders className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-200">Interactive Slope Fields & Directional Roadmap</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Visualize how the equation structure shapes the pathways of calculus solutions. The arrows represent the local derivative slope evaluated grid-point by grid-point. **Click anywhere on the grid** to position an initial coordinate values $(x_0, y_0)$ and watch the integral trajectory compute in real-time.
                    </p>
                  </div>
                </div>

                {/* Plot canvas system */}
                <SlopeField />
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Cognitive details layout */}
                <TopicDetails topic={activeTopic} />

                {/* Guided Solving modes and Quiz checks */}
                <InteractiveSolver 
                  topic={activeTopic} 
                  onProgressUpdate={handleProgressComplete}
                />
              </div>
            )}
          </div>
        </main>

        {/* TUTOR SIDEBAR SYSTEM - Collapsible */}
        {tutorOpen && (
          <aside className="w-96 border-l border-slate-800 bg-[#070b14]/95 p-4 flex flex-col shrink-0 overflow-hidden shadow-2xl z-20">
            <AITutorPanel activeTopic={activeTopic} />
          </aside>
        )}

      </div>
    </div>
  );
}
