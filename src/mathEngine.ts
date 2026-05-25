// Deterministic Mathematics Engine for ODE Workspace (100% Offline-Capable)

export interface SlopeFieldPoint {
  x: number;
  y: number;
  dx: number;
  dy: number;
  slope: number;
}

export interface ODEModel {
  id: string;
  name: string;
  formula: string;
  description: string;
  evaluator: (x: number, y: number, params?: Record<string, number>) => number;
  defaultParams?: Record<string, number>;
}

export const PRESET_ODE_MODELS: ODEModel[] = [
  {
    id: "linear-field",
    name: "Linear Field: dy/dx = x - y",
    formula: "\\frac{dy}{dx} = x - y",
    description: "Classic test field. Contains an asymptote attraction line along y = x - 1.",
    evaluator: (x, y) => x - y,
  },
  {
    id: "logistic-growth",
    name: "Logistic Population: dy/dx = y * (2 - y)",
    formula: "\\frac{dy}{dx} = y(2 - y)",
    description: "Autonomous ODE representing capacity-regulated model structure. Equilibriums at y = 0 and y = 2.",
    evaluator: (x, y) => y * (2 - y),
  },
  {
    id: "cooling-law",
    name: "Newton's Cooling: dy/dx = -0.5 * (y - 1)",
    formula: "\\frac{dy}{dx} = -0.5(y - 1)",
    description: "Steady attraction toward ambient temperature of y = 1.",
    evaluator: (x, y) => -0.5 * (y - 1),
  },
  {
    id: "sine-wave",
    name: "Oscillation: dy/dx = cos(x) * y",
    formula: "\\frac{dy}{dx} = y \\cos(x)",
    description: "Multiplicative waves representing periodic state changes.",
    evaluator: (x, y) => Math.cos(x) * y,
  },
  {
    id: "vortex-field",
    name: "Vortex Ripple: dy/dx = x^2 - y^2",
    formula: "\\frac{dy}{dx} = x^2 - y^2",
    description: "Non-linear saddle directions showing clean symmetric patterns.",
    evaluator: (x, y) => x * x - y * y,
  },
  {
    id: "circular-field",
    name: "Rotational: dy/dx = -x / y",
    formula: "\\frac{dy}{dx} = -\\frac{x}{y}",
    description: "Orbits representing circles. Undefined or singular at y = 0.",
    evaluator: (x, y) => (Math.abs(y) < 0.01 ? -x / 0.01 : -x / y),
  }
];

/**
 * Generate slope field directional markers
 */
export function generateSlopeField(
  odeId: string,
  gridX: number,
  gridY: number,
  rangeX: [number, number],
  rangeY: [number, number]
): SlopeFieldPoint[] {
  const model = PRESET_ODE_MODELS.find((m) => m.id === odeId) || PRESET_ODE_MODELS[0];
  const points: SlopeFieldPoint[] = [];

  const stepX = (rangeX[1] - rangeX[0]) / (gridX - 1);
  const stepY = (rangeY[1] - rangeY[0]) / (gridY - 1);

  for (let i = 0; i < gridX; i++) {
    const x = rangeX[0] + i * stepX;
    for (let j = 0; j < gridY; j++) {
      const y = rangeY[0] + j * stepY;
      const slope = model.evaluator(x, y);

      // Normalize length of the tangent segment
      const angle = Math.atan(slope);
      const length = 0.4 * Math.min(stepX, stepY); // Limit the visual line length
      const dx = Math.cos(angle) * length;
      const dy = Math.sin(angle) * length;

      points.push({ x, y, dx, dy, slope });
    }
  }

  return points;
}

/**
 * Compute solution path using Runge-Kutta 4th Order (RK4) integration
 */
export function solveNumericalODE(
  odeId: string,
  x0: number,
  y0: number,
  rangeX: [number, number],
  stepSize = 0.05
): { x: number; y: number }[] {
  const model = PRESET_ODE_MODELS.find((m) => m.id === odeId) || PRESET_ODE_MODELS[0];
  const points: { x: number; y: number }[] = [];

  // Start with the initial condition
  points.push({ x: x0, y: y0 });

  // 1. Integrate Forward
  let x = x0;
  let y = y0;
  const maxIterationsOuter = 200;
  
  while (x < rangeX[1] && points.length < maxIterationsOuter) {
    const k1 = model.evaluator(x, y);
    const k2 = model.evaluator(x + stepSize / 2, y + (stepSize / 2) * k1);
    const k3 = model.evaluator(x + stepSize / 2, y + (stepSize / 2) * k2);
    const k4 = model.evaluator(x + stepSize, y + stepSize * k3);

    y = y + (stepSize / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
    x = x + stepSize;

    // Safety bounds checking
    if (isNaN(y) || Math.abs(y) > 50) break;
    points.push({ x, y });
  }

  // 2. Integrate Backward
  x = x0;
  y = y0;
  const backwardPoints: { x: number; y: number }[] = [];
  const bwStep = -stepSize;

  while (x > rangeX[0] && backwardPoints.length < maxIterationsOuter) {
    const k1 = model.evaluator(x, y);
    const k2 = model.evaluator(x + bwStep / 2, y + (bwStep / 2) * k1);
    const k3 = model.evaluator(x + bwStep / 2, y + (bwStep / 2) * k2);
    const k4 = model.evaluator(x + bwStep, y + bwStep * k3);

    y = y + (bwStep / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
    x = x + bwStep;

    if (isNaN(y) || Math.abs(y) > 50) break;
    backwardPoints.unshift({ x, y }); // Keep values sorted by x ascending
  }

  return [...backwardPoints, ...points];
}

/**
 * Categorize and analyze custom ODE formulas for educational recognition
 */
export function classifyOdeStructure(formulaText: string): {
  order: number;
  isLinear: boolean;
  classificationName: string;
  recommendedMethod: string;
  complexityFactor: string;
} {
  const clean = formulaText.toLowerCase().replace(/\s+/g, "");

  let order = 1;
  if (clean.includes("y''") || clean.includes("d^2") || clean.includes("y2")) {
    order = 2;
  }

  let isLinear = true;
  if (
    clean.includes("y^2") ||
    clean.includes("y*y'") ||
    clean.includes("y*dy") ||
    clean.includes("sin(y)") ||
    clean.includes("cos(y)") ||
    clean.includes("e^y") ||
    clean.includes("1/y")
  ) {
    isLinear = false;
  }

  let classificationName = "First-Order Linear ODE";
  let recommendedMethod = "Integrating Factor Method";
  let complexityFactor = "Moderate";

  if (order === 2) {
    classificationName = isLinear ? "Second-Order Linear ODE" : "Second-Order Non-Linear ODE";
    recommendedMethod = isLinear ? "Characteristic Auxiliary Method" : "Numerical Phase Solver";
    complexityFactor = isLinear ? "Rigorous" : "Advanced Computational";
  } else {
    // Determine 1st order types
    if (!isLinear) {
      if (clean.includes("y^2") || clean.includes("y^3") || clean.includes("y^n")) {
        classificationName = "First-Order Non-Linear Bernoulli ODE";
        recommendedMethod = "Substitute z = y^(1-n) to reduce order to Linear";
        complexityFactor = "Advanced Algebraic";
      } else {
        classificationName = "First-Order Non-Linear Separable ODE";
        recommendedMethod = "Separate variables: integral(1/h(y) dy) = integral(g(x) dx)";
        complexityFactor = "Algebraic Separation";
      }
    } else {
      if (clean.includes("dx") && clean.includes("dy")) {
        classificationName = "First-Order Total Differential System";
        recommendedMethod = "Check mixed partial derivatives for Exactness";
        complexityFactor = "Exactness Verification";
      }
    }
  }

  return { order, isLinear, classificationName, recommendedMethod, complexityFactor };
}
