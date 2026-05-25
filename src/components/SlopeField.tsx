import React, { useState, useRef, useEffect } from "react";
import { 
  PRESET_ODE_MODELS, 
  generateSlopeField, 
  solveNumericalODE,
  SlopeFieldPoint 
} from "../mathEngine";
import { Plus, Settings, Eye, HelpCircle, Activity } from "lucide-react";
import MathView from "./MathView";

export default function SlopeField() {
  const [selectedModelId, setSelectedModelId] = useState(PRESET_ODE_MODELS[0].id);
  const [initialX, setInitialX] = useState<number>(0);
  const [initialY, setInitialY] = useState<number>(1);
  const [showSlopes, setShowSlopes] = useState(true);
  const [comparisonMode, setComparisonMode] = useState<"rk4" | "euler" | "both">("rk4");
  const [stepSize, setStepSize] = useState<number>(0.05);
  const [gridDensity, setGridDensity] = useState<number>(18);
  const [isDragging, setIsDragging] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const rangeX: [number, number] = [-4, 4];
  const rangeY: [number, number] = [-4, 4];

  // Map coordinate to Canvas pixel
  const getCanvasCoords = (cx: number, cy: number, width: number, height: number) => {
    const px = ((cx - rangeX[0]) / (rangeX[1] - rangeX[0])) * width;
    const py = height - ((cy - rangeY[0]) / (rangeY[1] - rangeY[0])) * height;
    return { x: px, y: py };
  };

  // Map Canvas pixel to real coordinate
  const getRealCoords = (px: number, py: number, width: number, height: number) => {
    const rx = rangeX[0] + (px / width) * (rangeX[1] - rangeX[0]);
    const ry = rangeY[0] + ((height - py) / height) * (rangeY[1] - rangeY[0]);
    return {
      x: Math.round(rx * 100) / 100,
      y: Math.round(ry * 100) / 100
    };
  };

  const handleCanvasInteraction = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const px = clientX - rect.left;
    const py = clientY - rect.top;

    const real = getRealCoords(px, py, rect.width, rect.height);
    // Limit to bounds
    setInitialX(Math.max(rangeX[0], Math.min(rangeX[1], real.x)));
    setInitialY(Math.max(rangeY[0], Math.min(rangeY[1], real.y)));
  };

  // Redraw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Support high definition screens
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    const width = rect.width;
    const height = rect.height;

    // Clear and background
    ctx.fillStyle = "#0c1017"; // dark cosmic background
    ctx.fillRect(0, 0, width, height);

    // Draw Grid Lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    for (let currentVal = rangeX[0]; currentVal <= rangeX[1]; currentVal += 1) {
      if (currentVal === 0) continue;
      // Verticals
      const vPt = getCanvasCoords(currentVal, 0, width, height);
      ctx.beginPath();
      ctx.moveTo(vPt.x, 0);
      ctx.lineTo(vPt.x, height);
      ctx.stroke();

      // Horizontals
      const hPt = getCanvasCoords(0, currentVal, width, height);
      ctx.beginPath();
      ctx.moveTo(0, hPt.y);
      ctx.lineTo(width, hPt.y);
      ctx.stroke();
    }

    // Draw Axis lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 1.5;
    // X Axis
    const origin = getCanvasCoords(0, 0, width, height);
    ctx.beginPath();
    ctx.moveTo(0, origin.y);
    ctx.lineTo(width, origin.y);
    ctx.stroke();
    // Y Axis
    ctx.beginPath();
    ctx.moveTo(origin.x, 0);
    ctx.lineTo(origin.x, height);
    ctx.stroke();

    // Axis Labels
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "10px ui-monospace, monospace";
    ctx.fillText("x = 0", origin.x + 8, 12);
    ctx.fillText("y = 0", 6, origin.y - 6);

    // Draw Slope Field isoclines
    if (showSlopes) {
      const slopes = generateSlopeField(selectedModelId, gridDensity, gridDensity, rangeX, rangeY);
      slopes.forEach((p) => {
        const c = getCanvasCoords(p.x, p.y, width, height);
        
        ctx.beginPath();
        ctx.moveTo(c.x - p.dx, c.y + p.dy);
        ctx.lineTo(c.x + p.dx, c.y - p.dy);

        // Color based on slope direction
        if (p.slope > 0.1) {
          // Ascending fields (warm orange/red)
          const ratio = Math.min(1, p.slope / 4);
          ctx.strokeStyle = `rgba(${170 + ratio * 85}, ${110 - ratio * 40}, 90, 0.55)`;
        } else if (p.slope < -0.1) {
          // Descending fields (cool blue)
          const ratio = Math.min(1, Math.abs(p.slope) / 4);
          ctx.strokeStyle = `rgba(90, ${150 + ratio * 30}, ${210 + ratio * 45}, 0.55)`;
        } else {
          // Flat horizontal slopes (equilibrium)
          ctx.strokeStyle = "rgba(224, 204, 150, 0.6)";
        }
        
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
    }

    // --- Draw Integral Curve (RK4 Method) ---
    if (comparisonMode === "rk4" || comparisonMode === "both") {
      const rkPath = solveNumericalODE(selectedModelId, initialX, initialY, rangeX, stepSize);
      ctx.beginPath();
      rkPath.forEach((pt, idx) => {
        const cp = getCanvasCoords(pt.x, pt.y, width, height);
        // Crop points outside visual window
        if (idx === 0) {
          ctx.moveTo(cp.x, cp.y);
        } else {
          ctx.lineTo(cp.x, cp.y);
        }
      });
      ctx.strokeStyle = "#38bdf8"; // Emerald-light desmos style blue
      ctx.lineWidth = 3.5;
      ctx.stroke();
    }

    // --- Draw Simple Euler Curve for comparison ---
    if (comparisonMode === "euler" || comparisonMode === "both") {
      // Simulate Euler directly to showcase truncation drift!
      const eulerPath = simulateEulerMethod(selectedModelId, initialX, initialY, rangeX, stepSize);
      ctx.beginPath();
      eulerPath.forEach((pt, idx) => {
        const cp = getCanvasCoords(pt.x, pt.y, width, height);
        if (idx === 0) {
          ctx.moveTo(cp.x, cp.y);
        } else {
          ctx.lineTo(cp.x, cp.y);
        }
      });
      ctx.strokeStyle = "#e11d48"; // Crimson color for comparison
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]); // Dashed line to highlight numerical errors
      ctx.stroke();
      ctx.setLineDash([]); // Reset
    }

    // Draw Initial Value Point Marker
    const iv = getCanvasCoords(initialX, initialY, width, height);
    ctx.beginPath();
    ctx.arc(iv.x, iv.y, 7, 0, 2 * Math.PI);
    ctx.fillStyle = "#38bdf8";
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();

    // Pulse outer ring around point
    ctx.beginPath();
    ctx.arc(iv.x, iv.y, 14, 0, 2 * Math.PI);
    ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

  }, [selectedModelId, initialX, initialY, showSlopes, comparisonMode, stepSize, gridDensity]);

  const activeModel = PRESET_ODE_MODELS.find((m) => m.id === selectedModelId) || PRESET_ODE_MODELS[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#090d16] p-4 rounded-2xl border border-slate-800 shadow-2xl">
      
      {/* Visual Workspace Canvas */}
      <div className="lg:col-span-8 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-sky-400" />
            <h3 className="font-sans font-medium text-slate-200">Interactive Coordinate Space</h3>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2 py-1 rounded">
            Drag Point or Click inside graph
          </span>
        </div>

        <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-slate-800 bg-slate-950 select-none">
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-crosshair block"
            onMouseDown={(e) => {
              setIsDragging(true);
              handleCanvasInteraction(e);
            }}
            onMouseMove={(e) => {
              if (isDragging) handleCanvasInteraction(e);
            }}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            onTouchStart={(e) => {
              setIsDragging(true);
              handleCanvasInteraction(e);
            }}
            onTouchMove={(e) => {
              if (isDragging) handleCanvasInteraction(e);
            }}
            onTouchEnd={() => setIsDragging(false)}
          />

          {/* Coordinate Indicator Tag */}
          <div className="absolute top-4 left-4 bg-slate-900/95 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-700/60 shadow-lg text-xs font-mono text-slate-100 flex flex-col gap-1 pointer-events-none">
            <span className="text-slate-400 font-sans">Initial State Value (IVP)</span>
            <span className="font-semibold text-sky-400 text-sm">
              x₀ = {initialX.toFixed(2)}, y₀ = {initialY.toFixed(2)}
            </span>
          </div>

          {/* Color Guides Legend */}
          <div className="absolute bottom-4 left-4 bg-slate-900/95 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-700/60 text-xxs font-mono text-slate-300 flex items-center gap-3 pointer-events-none">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-1 bg-[#aa6e5a] rounded-smInline" />
              <span>dy/dx &gt; 0 (Growth)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-1 bg-[#e0cc96] rounded-smInline" />
              <span>dy/dx = 0 (Flat)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-1 bg-[#5a9ad2] rounded-smInline" />
              <span>dy/dx &lt; 0 (Decay)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Laboratory Control Desk panel */}
      <div className="lg:col-span-4 flex flex-col gap-4 justify-between bg-slate-900/50 p-4 rounded-xl border border-slate-800">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <Settings className="h-4 w-4 text-slate-400" />
            <h4 className="text-sm font-sans font-semibold text-slate-100 uppercase tracking-wider">Lab Controls</h4>
          </div>

          {/* Model selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-medium">Mathematical Model Presets</label>
            <select
              value={selectedModelId}
              onChange={(e) => setSelectedModelId(e.target.value)}
              className="w-full bg-[#131922] border border-slate-700 rounded-lg p-2 text-xs font-sans text-slate-200 outline-none focus:border-sky-500 transition"
            >
              {PRESET_ODE_MODELS.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-[#121820] p-3 rounded-lg border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xxs font-mono uppercase tracking-widest text-slate-500">Active Equation</span>
            </div>
            <div className="py-2 flex justify-center bg-slate-950 rounded-md">
              <MathView math={activeModel.formula} displayMode={true} />
            </div>
            <p className="text-xs text-slate-400 italic font-sans leading-relaxed">{activeModel.description}</p>
          </div>

          {/* Graphical toggles */}
          <div className="flex flex-col gap-3 mt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300">Show Slope Field Roadmaps</span>
              <button
                onClick={() => setShowSlopes(!showSlopes)}
                className={`w-10 h-5 rounded-full p-0.5 transition-colors focus:outline-none ${
                  showSlopes ? "bg-sky-500" : "bg-slate-700"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    showSlopes ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-slate-400">Numerical Solving Algorithm</span>
              <div className="grid grid-cols-3 gap-1 bg-[#131a24] p-1 rounded-lg border border-slate-800 text-xxs font-mono">
                <button
                  onClick={() => setComparisonMode("rk4")}
                  className={`py-1.5 rounded transition ${
                    comparisonMode === "rk4" ? "bg-sky-500 text-white font-semibold" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  RK4
                </button>
                <button
                  onClick={() => setComparisonMode("euler")}
                  className={`py-1.5 rounded transition ${
                    comparisonMode === "euler" ? "bg-rose-600 text-white font-semibold" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Euler
                </button>
                <button
                  onClick={() => setComparisonMode("both")}
                  className={`py-1.5 rounded transition ${
                    comparisonMode === "both" ? "bg-slate-700 text-white font-semibold" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Compare
                </button>
              </div>
            </div>

            {/* Step size adjustment */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Step Delta (h): {stepSize}</span>
              </div>
              <input
                type="range"
                min="0.02"
                max="0.2"
                step="0.01"
                value={stepSize}
                onChange={(e) => setStepSize(parseFloat(e.target.value))}
                className="w-full accent-sky-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Grid density adjustment */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Slope Arrows Count: {gridDensity * gridDensity}</span>
              </div>
              <input
                type="range"
                min="10"
                max="24"
                step="2"
                value={gridDensity}
                onChange={(e) => setGridDensity(parseInt(e.target.value))}
                className="w-full accent-sky-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Euler/RK4 Comparison helper card */}
        <div className="bg-[#1b1c1e]/40 p-3 rounded-lg border border-yellow-500/10 text-xs text-amber-300 leading-relaxed mt-4">
          <div className="flex items-center gap-1.5 font-semibold font-sans mb-1 text-slate-200">
            <HelpCircle className="h-4 w-4 text-sky-400" />
            <span>Method comparison</span>
          </div>
          {comparisonMode === "rk4" && (
            <span>**Runge-Kutta 4** computes four mini-slopes across each interval to minimize spatial divergence. The blue path maps highly accurate exact curves.</span>
          )}
          {comparisonMode === "euler" && (
            <span>**Euler's Method** is extremely simple: it follows only the derivative slope at the start of each step. Notice how a higher step size causes it to slide rapidly off curvature paths (drift error).</span>
          )}
          {comparisonMode === "both" && (
            <span>Comparing the two reveals **Calculus discretization error** directly. The dashed red Euler line drifts rapidly from the precise solid blue RK4 curve as the step increments!</span>
          )}
        </div>
      </div>

    </div>
  );
}

// Simulated simple Euler calculation pathway purely for differential demonstration
function simulateEulerMethod(
  odeId: string,
  x0: number,
  y0: number,
  rangeX: [number, number],
  stepSize = 0.05
): { x: number; y: number }[] {
  const model = PRESET_ODE_MODELS.find((m) => m.id === odeId) || PRESET_ODE_MODELS[0];
  const points: { x: number; y: number }[] = [];

  points.push({ x: x0, y: y0 });

  // Forwards
  let x = x0;
  let y = y0;
  const maxIt = 200;
  while (x < rangeX[1] && points.length < maxIt) {
    const slope = model.evaluator(x, y);
    y = y + stepSize * slope;
    x = x + stepSize;
    if (isNaN(y) || Math.abs(y) > 50) break;
    points.push({ x, y });
  }

  // Backwards
  x = x0;
  y = y0;
  const backward: { x: number; y: number }[] = [];
  const bwStep = -stepSize;
  while (x > rangeX[0] && backward.length < maxIt) {
    const slope = model.evaluator(x, y);
    y = y + bwStep * slope;
    x = x + bwStep;
    if (isNaN(y) || Math.abs(y) > 50) break;
    backward.unshift({ x, y });
  }

  return [...backward, ...points];
}
