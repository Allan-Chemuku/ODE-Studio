export type ODESection = 
  | "foundations"
  | "first-order"
  | "second-order"
  | "applications"
  | "advanced";

export interface ODETopic {
  id: string;
  title: string;
  section: ODESection;
  subtitle: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  texFormula: string;
  generalForm: string;
  
  // The 4 core pedagogical pillars
  intuition: string;
  geometric: string;
  derivation: string;
  formalStructure: string;

  // Pattern recognition structure identifiers
  recognitionTips: string[];
  commonMistakes: string[];
  substitutions?: {
    original: string;
    target: string;
    motivation: string;
  }[];

  // Interactive step-by-step workflow
  interactiveProblem: {
    question: string;
    initialOde: string;
    classification: string;
    steps: {
      instruction: string;
      hint: string;
      formula: string;
      validationRegex?: string;
      expectedInputPlaceholder?: string;
      explanation: string;
    }[];
  };

  quiz: {
    question: string;
    options: string[];
    answerIdx: number;
    explanation: string;
  }[];
}

export interface StudentProgress {
  completedTopics: string[]; // topic ID
  quizScores: Record<string, number>; // topic ID -> score
  streakCount: number;
  lastActiveDate: string; // ISO String
}

export type LLMMode = "offline-mentor" | "local-ollama" | "gemini-cloud";

export interface AISettings {
  mode: LLMMode;
  ollamaUrl: string; // e.g., http://localhost:11434
  ollamaModel: string; // e.g., llama3, mistral, phi
  systemPrompt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}
