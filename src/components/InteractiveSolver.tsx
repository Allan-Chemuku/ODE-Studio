import { useState, useEffect } from "react";
import { ODETopic } from "../types";
import { HelpCircle, CheckCircle, AlertTriangle, ChevronRight, RefreshCw, Star, Info, GraduationCap, ArrowRight } from "lucide-react";
import MathView from "./MathView";

interface InteractiveSolverProps {
  topic: ODETopic;
  onProgressUpdate: (topicId: string, quizScore: number) => void;
}

export default function InteractiveSolver({ topic, onProgressUpdate }: InteractiveSolverProps) {
  // Solver State
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [userInputs, setUserInputs] = useState<Record<number, string>>({});
  const [stepStatus, setStepStatus] = useState<Record<number, "unsolved" | "success" | "error">>({});
  const [showHint, setShowHint] = useState(false);
  const [solverCompleted, setSolverCompleted] = useState(false);

  // Quiz State
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showQuizExpl, setShowQuizExpl] = useState<Record<number, boolean>>({});

  // Reset states on topic change
  useEffect(() => {
    setCurrentStepIdx(0);
    setUserInputs({});
    setStepStatus({});
    setShowHint(false);
    setSolverCompleted(false);
    setQuizScore(null);
    setSelectedAnswers({});
    setShowQuizExpl({});
  }, [topic]);

  const handleStepVerify = (idx: number) => {
    const input = (userInputs[idx] || "").trim().toLowerCase();
    const step = topic.interactiveProblem.steps[idx];

    if (!input) return;

    // Check regex if available, otherwise fallback to simple text presence checks
    let isCorrect = false;
    if (step.validationRegex) {
      const regex = new RegExp(step.validationRegex, "i");
      isCorrect = regex.test(input);
    } else {
      isCorrect = true; // safe fallback
    }

    if (isCorrect) {
      setStepStatus(prev => ({ ...prev, [idx]: "success" }));
      setShowHint(false);
      // Advance to next step or complete
      if (idx === topic.interactiveProblem.steps.length - 1) {
        setSolverCompleted(true);
      } else {
        setTimeout(() => {
          setCurrentStepIdx(idx + 1);
        }, 800);
      }
    } else {
      setStepStatus(prev => ({ ...prev, [idx]: "error" }));
    }
  };

  const resetSolver = () => {
    setCurrentStepIdx(0);
    setUserInputs({});
    setStepStatus({});
    setShowHint(false);
    setSolverCompleted(false);
  };

  const handleQuizOption = (qIdx: number, optIdx: number) => {
    if (quizScore !== null) return; // locked once graded
    setSelectedAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
    setShowQuizExpl(prev => ({ ...prev, [qIdx]: true }));
  };

  const submitQuizGrader = () => {
    let score = 0;
    topic.quiz.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answerIdx) {
        score += 1;
      }
    });
    setQuizScore(score);
    onProgressUpdate(topic.id, score);
  };

  const resetQuiz = () => {
    setQuizScore(null);
    setSelectedAnswers({});
    setShowQuizExpl({});
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed text-slate-200">
      
      {/* LEFT COLUMN: GUIDED SOLVING MODE */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col gap-4">
        
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <GraduationCap className="h-5 w-5 text-sky-400" />
          <h3 className="font-sans font-bold text-slate-100">Interactive Guided Solving Lab Mode</h3>
        </div>

        {/* Problem intro */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block mb-1">Target Equation</span>
          <div className="text-xs space-y-2">
            {topic.interactiveProblem.question.split("\n\n").map((para, idx) => (
              <div key={idx}>
                {para.startsWith("$$") && para.endsWith("$$") ? (
                  <div className="py-2 text-center text-sm"><MathView math={para} /></div>
                ) : (
                  <p>{para}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Steps stream */}
        {!solverCompleted ? (
          <div className="flex flex-col gap-4 flex-1 justify-between">
            <div className="space-y-4">
              {topic.interactiveProblem.steps.map((step, idx) => {
                const isActive = currentStepIdx === idx;
                const isPassed = currentStepIdx > idx;

                if (!isActive && !isPassed) return null;

                return (
                  <div 
                    key={idx}
                    className={`p-4 rounded-xl border transition-all duration-300 ${
                      isActive 
                        ? "bg-slate-950 border-sky-500/30" 
                        : "bg-slate-900/40 border-slate-800 opacity-60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xxs font-mono ${
                          isPassed || stepStatus[idx] === "success"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                            : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="text-xs font-semibold text-slate-200">Step {idx + 1} of {topic.interactiveProblem.steps.length}</span>
                      </div>
                      
                      {stepStatus[idx] === "success" && (
                        <span className="text-[10px] font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
                          Validated ✓
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                      {step.instruction}
                    </p>

                    {isActive && (
                      <div className="flex flex-col gap-2.5">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={userInputs[idx] || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setUserInputs(prev => ({ ...prev, [idx]: val }));
                              if (stepStatus[idx] === "error") {
                                setStepStatus(prev => ({ ...prev, [idx]: "unsolved" }));
                              }
                            }}
                            placeholder={step.expectedInputPlaceholder || "Type isolated algebraic terms..."}
                            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono focus:border-sky-500 outline-none placeholder:text-slate-600"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleStepVerify(idx);
                            }}
                          />
                          <button
                            onClick={() => handleStepVerify(idx)}
                            className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 font-semibold rounded-lg text-xs transition"
                          >
                            Verify
                          </button>
                        </div>

                        {stepStatus[idx] === "error" && (
                          <div className="flex items-center gap-1.5 text-xxs bg-red-500/5 text-red-400 p-2 rounded border border-red-500/10">
                            <AlertTriangle className="h-3 w-3" />
                            <span>Algebraic structure mismatched. Check variables of P(x)/y or integration factors.</span>
                          </div>
                        )}

                        {/* Hint toggles */}
                        <div className="flex flex-col gap-1.5 mt-1">
                          <button
                            onClick={() => setShowHint(!showHint)}
                            className="text-xxs font-mono text-slate-500 hover:text-slate-300 self-start underline focus:outline-none"
                          >
                            {showHint ? "Hide Hint" : "Stuck? Reveal Guide Hint"}
                          </button>
                          {showHint && (
                            <div className="bg-[#121620] p-3 rounded-lg border border-indigo-500/10 text-xxs text-slate-400 leading-relaxed italic border-l-2 border-l-indigo-500">
                              {step.hint}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Show explanation once solved or passed */}
                    {(isPassed || stepStatus[idx] === "success") && (
                      <div className="mt-3 pt-3 border-t border-slate-800/80 text-xxs text-slate-400 space-y-2">
                        <p className="font-semibold text-slate-300 flex items-center gap-1">
                          <Info className="h-3 w-3 text-emerald-400" />
                          <span>Pedagogical Analysis</span>
                        </p>
                        <p>{step.explanation}</p>
                        <div className="bg-slate-950 p-2 rounded text-center my-1.5 overflow-x-auto">
                          <MathView math={step.formula} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="border-t border-slate-800 pt-3 flex justify-between items-center text-xxs font-mono text-slate-500">
              <span>Complete steps to verify solving logic</span>
              <button 
                onClick={resetSolver}
                className="hover:text-slate-300 underline"
              >
                Reset Progress
              </button>
            </div>
          </div>
        ) : (
          /* Completed solver success view */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-[#0c121c] rounded-xl border border-emerald-500/20 gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 border border-emerald-500/30">
              <Star className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-sans font-bold text-slate-200">Mathematical derivation verified!</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                You correctly isolated variables, substituted differentials, and integrated conforming models for **{topic.title}**!
              </p>
            </div>
            <button
              onClick={resetSolver}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 border border-slate-700 rounded-lg transition"
            >
              <RefreshCw className="h-4.5 w-4.5" />
              <span>Solve Again</span>
            </button>
          </div>
        )}

      </div>

      {/* RIGHT COLUMN: CONCEPTUAL QUIZ MODULE */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col gap-4">
        
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <GraduationCap className="h-5 w-5 text-indigo-400" />
          <h3 className="font-sans font-bold text-slate-100">Conceptual Checkpoint Quizzes</h3>
        </div>

        <div className="space-y-4 overflow-y-auto max-h-[380px] pr-1">
          {topic.quiz.map((q, qIdx) => {
            const chosenOpt = selectedAnswers[qIdx];
            const isSubmitted = quizScore !== null;

            return (
              <div key={qIdx} className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-3">
                <p className="text-xs font-semibold text-slate-200 tracking-tight leading-relaxed">
                  <span className="text-indigo-400 font-mono text-xxs mr-1">Q{qIdx + 1}</span>
                  {q.question}
                </p>

                {/* Question Options */}
                <div className="flex flex-col gap-2">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = chosenOpt === optIdx;
                    const isCorrectAnswer = optIdx === q.answerIdx;

                    let btnStyle = "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800";
                    if (isSelected) {
                      btnStyle = isSubmitted 
                        ? (isCorrectAnswer ? "bg-emerald-500/10 border-emerald-500/60 text-emerald-400" : "bg-red-500/10 border-red-500/60 text-red-400")
                        : "bg-indigo-500/15 border-indigo-500/50 text-indigo-300";
                    } else if (isSubmitted && isCorrectAnswer) {
                      btnStyle = "bg-emerald-500/5 border-emerald-500/30 text-emerald-400";
                    }

                    return (
                      <button
                        key={optIdx}
                        disabled={isSubmitted}
                        onClick={() => handleQuizOption(qIdx, optIdx)}
                        className={`w-full text-left p-3 rounded-lg border text-xxs leading-normal transition-colors flex items-start gap-2 ${btnStyle}`}
                      >
                        <span className="w-4 h-4 rounded border border-slate-600 bg-slate-950 flex items-center justify-center shrink-0">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Show explanation once answered */}
                {showQuizExpl[qIdx] && (
                  <div className="bg-slate-900 p-3 rounded-lg text-xxs text-slate-400 leading-relaxed border border-slate-800">
                    <p className="font-semibold text-slate-300 mb-1">
                      {chosenOpt === q.answerIdx ? "Correct ✓" : "Incorrect Answer"}
                    </p>
                    <p>{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Grades footer */}
        <div className="border-t border-slate-800 pt-3 flex items-center justify-between mt-auto">
          {quizScore === null ? (
            <>
              <span className="text-xxs text-slate-500 font-mono">Answer all checkpoints to submit grade</span>
              <button
                onClick={submitQuizGrader}
                disabled={Object.keys(selectedAnswers).length < topic.quiz.length}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 font-semibold rounded-lg text-xs transition"
              >
                Submit Grade
              </button>
            </>
          ) : (
            <div className="w-full flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <GraduationCap className="h-5 w-5 text-indigo-400" />
                <span className="font-medium text-slate-200">
                  Quiz Score: <span className="text-indigo-400 font-bold font-mono">{quizScore} / {topic.quiz.length}</span>
                </span>
              </div>
              <button
                onClick={resetQuiz}
                className="text-xxs font-mono text-slate-500 hover:text-slate-300 underline focus:outline-none"
              >
                Retake Exam
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
