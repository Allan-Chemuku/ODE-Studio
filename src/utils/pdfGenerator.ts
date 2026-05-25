import { jsPDF } from "jspdf";
import { ODETopic, StudentProgress } from "../types";

/**
 * Strips LaTeX syntax into hyper-readable unicode representations for PDF rendering
 */
function stripTeXTotext(tex: string): string {
  if (!tex) return "";
  
  let clean = tex;
  // Common replacements
  clean = clean.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1)/($2)");
  clean = clean.replace(/\\lim_\{([^}]+)\}/g, "lim[$1]");
  clean = clean.replace(/\\to/g, "→");
  clean = clean.replace(/\\ln/g, "ln");
  clean = clean.replace(/\\Delta/g, "Δ");
  clean = clean.replace(/\\partial/g, "∂");
  clean = clean.replace(/\\int/g, "∫");
  clean = clean.replace(/\\sqrt\{([^}]+)\}/g, "√($1)");
  clean = clean.replace(/\\infty/g, "∞");
  clean = clean.replace(/\\alpha/g, "α");
  clean = clean.replace(/\\beta/g, "β");
  clean = clean.replace(/\\lambda/g, "λ");
  clean = clean.replace(/\\theta/g, "θ");
  clean = clean.replace(/\\pi/g, "π");
  clean = clean.replace(/\\pm/g, "±");
  clean = clean.replace(/\\neq/g, "≠");
  clean = clean.replace(/\\approx/g, "≈");
  clean = clean.replace(/\\cdot/g, "·");
  clean = clean.replace(/\\times/g, "×");
  clean = clean.replace(/\\le/g, "≤");
  clean = clean.replace(/\\ge/g, "≥");
  clean = clean.replace(/\$/g, ""); // clear simple dollars

  // General clean-ups of braces and slashes
  clean = clean.replace(/\\/g, "");
  clean = clean.replace(/\{/g, "");
  clean = clean.replace(/\}/g, "");
  
  return clean.trim();
}

/**
 * Truncates and wraps word paragraph to max length arrays for jsPDF
 */
function wrapText(text: string, maxLength: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    if ((currentLine + " " + word).trim().length > maxLength) {
      if (currentLine) lines.push(currentLine.trim());
      currentLine = word;
    } else {
      currentLine += (currentLine ? " " : "") + word;
    }
  });
  if (currentLine) {
    lines.push(currentLine.trim());
  }
  return lines;
}

export function generatePDFReport(topic: ODETopic, progress: StudentProgress) {
  // Create jsPDF instance with default A4 formatting
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const timestamp = new Date().toLocaleString();
  const emailVal = "chemukuallan201@gmail.com";
  
  // Section index helper
  const sectionLabels: Record<string, string> = {
    "foundations": "Section 1: Foundations",
    "first-order": "Section 2: First-Order ODEs",
    "second-order": "Section 3: Second-Order ODEs",
    "applications": "Section 4: Applications",
    "advanced": "Section 5: Advanced Topics",
  };

  // Safe fetch of the window lab state parameters
  const labState = (window as any).__ode_lab_state || {
    initialX: 0,
    initialY: 1,
    comparisonMode: "rk4",
    stepSize: 0.05,
    gridDensity: 18,
    modelName: "Linear Population Model",
    modelFormula: "dy/dx = r * y"
  };

  // -------------------------------------------------------------
  // PAGE 1: WORKSPACE CAPTURE & METADATA STUDY CARD
  // -------------------------------------------------------------
  
  // Decorative trim border
  doc.setDrawColor(2, 132, 199); // Sky blue
  doc.setLineWidth(1.5);
  doc.line(10, 10, 200, 10); // top border line
  doc.line(10, 10, 10, 287); // left margin
  doc.line(200, 10, 200, 287); // right margin
  doc.line(10, 287, 200, 287); // bottom border line

  // PDF Header Banner text
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42); // slate 900
  doc.text("ORDINARY DIFFERENTIAL EQUATIONS STUDIO", 15, 22);
  
  doc.setFont("Courier", "bold");
  doc.setFontSize(8);
  doc.setTextColor(2, 132, 199); // sky 400
  doc.text("Deterministic Study Report & Visual Laboratory Archival Matrix", 15, 27);

  // Metadata Block Frame
  doc.setDrawColor(226, 232, 240); // slate 200
  doc.setFillColor(248, 250, 252); // slate 50
  doc.rect(15, 31, 180, 22, "FD");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105); // slate 600
  doc.text("DOCUMENT METADATA", 18, 36);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(`Student User: ${emailVal}`, 18, 42);
  doc.text(`Generated Interval: ${timestamp} (UTC)`, 18, 47);
  doc.text(`Active Learning Streak: ${progress.streakCount} Days`, 110, 42);
  
  const totalCompleted = progress.completedTopics.length;
  doc.text(`Course Progress: ${totalCompleted} Topics Mastered`, 110, 47);

  // Active Subject Card
  doc.setFillColor(15, 23, 42); // Slate-900 beautiful banner
  doc.rect(15, 58, 180, 18, "F");
  
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text(`${topic.title.toUpperCase()}`, 19, 64);
  
  doc.setFont("Helvetica", "oblique");
  doc.setFontSize(8.5);
  doc.setTextColor(186, 230, 253); // sky-200
  doc.text(`${sectionLabels[topic.section]}  |  Difficulty level: ${topic.difficulty}`, 19, 70);

  // Formula Tags in metadata space
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(125, 62, 64, 10, "F");
  doc.setFont("Courier", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  const coreFormulaText = `Eq: ${stripTeXTotext(topic.texFormula)}`;
  doc.text(coreFormulaText.substring(0, 28), 128, 68);

  // Visual Laboratory Snapshot Card
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("I. VISUAL LABORATORY SOLUTION FLOWS", 15, 84);

  // Get active canvas element
  const canvas = document.getElementById("ode-slopefield-canvas") as HTMLCanvasElement;
  let canvasSuccess = false;

  if (canvas) {
    try {
      const dataUrl = canvas.toDataURL("image/png");
      // Add visual canvas snapshot to fit standard bounding area elegantly (120mm x 90mm aspect ratio)
      doc.addImage(dataUrl, "PNG", 35, 89, 140, 105);
      canvasSuccess = true;
    } catch (e) {
      console.error("Failed to copy canvas elements, drawing placeholder.", e);
    }
  }

  if (!canvasSuccess) {
    // Draw visual placeholder if no canvas triggers (fallback)
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(241, 245, 249);
    doc.rect(15, 89, 180, 105, "FD");
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(148, 163, 184);
    doc.text("Live Coordinate Canvas Dynamic Stream Active", 65, 135);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text("(Open applet visual grid on window tab to capture actual slope vectors)", 54, 142);
  }

  // Laboratory Parameters Table Block
  const tableY = 200;
  doc.setFillColor(248, 250, 252);
  doc.rect(15, tableY, 180, 52, "F");
  doc.setDrawColor(226, 232, 240);
  doc.rect(15, tableY, 180, 52, "D");

  // Divider lines inside table
  doc.line(15, tableY + 8, 195, tableY + 8);
  doc.line(15, tableY + 28, 195, tableY + 28);
  doc.line(105, tableY, 105, tableY + 52); // vertical divider

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text("ACTIVE LABORATORY VARIABLES", 18, tableY + 5);
  doc.text("INTEGRATION ALGORITHM DESIGN", 108, tableY + 5);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  
  // Left Column params
  doc.text(`- Selected Preset: ${labState.modelName || "Custom System"}`, 18, tableY + 14);
  doc.text(`- Boundary Equation: ${labState.modelFormula ? stripTeXTotext(labState.modelFormula) : stripTeXTotext(topic.texFormula)}`, 18, tableY + 20);
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(2, 132, 199);
  doc.text(`- Initial Value Coordinates: (x0, y0) = (${Number(labState.initialX).toFixed(2)}, ${Number(labState.initialY).toFixed(2)})`, 18, tableY + 25);
  doc.setFont("Helvetica", "normal");
  doc.setTextColor(51, 65, 85);
  doc.text(`- Cartesian Boundary Plane: [x: -4 to 4, y: -4 to 4]`, 18, tableY + 34);
  doc.text(`- Evaluation State Vector: dy/dx = f(x, y)`, 18, tableY + 40);
  doc.text(`- Coordinate Space Resolution: Scale dynamic fitting (DPR ${window.devicePixelRatio || 1})`, 18, tableY + 46);

  // Right Column params
  doc.text(`- Numerical Method: ${String(labState.comparisonMode).toUpperCase()}`, 108, tableY + 14);
  doc.text(`- Integration Step Delta (h): ${labState.stepSize || 0.05}`, 108, tableY + 20);
  doc.text(`- Grid Vector Density: ${labState.gridDensity} x ${labState.gridDensity} Arrows (${(labState.gridDensity || 18) * (labState.gridDensity || 18)} points)`, 108, tableY + 25);
  
  doc.setFont("Times", "oblique");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Algorithm Note: Runge-Kutta 4th order (RK4) evaluates four", 108, tableY + 34);
  doc.text("intermediate slopes per step, dramatically reducing cumulative drift.", 108, tableY + 39);
  doc.text("Euler's method maps first-order tangential lines but suffers", 108, tableY + 44);
  doc.text("high Taylor discretization error around curves of variable rates.", 108, tableY + 49);

  // Footer archivals page 1
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text("ODE Studio Archival Office", 15, 281);
  doc.setFont("Helvetica", "normal");
  doc.text(`Page 1 of 2  •  Generated by ${emailVal}`, 138, 281);

  // -------------------------------------------------------------
  // PAGE 2: PEDAGOGICAL DEVIATION & GENERALIZED PROOFS
  // -------------------------------------------------------------
  doc.addPage();
  
  // Trim border for page 2
  doc.setDrawColor(2, 132, 199); // Sky blue
  doc.setLineWidth(1.5);
  doc.line(10, 10, 200, 10);
  doc.line(10, 10, 10, 287);
  doc.line(200, 10, 200, 287);
  doc.line(10, 287, 200, 287);

  // Header page 2
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text("II. PEDAGOGICAL DEVIATION CLASSROOM & ALGEBRAIC ANALYSIS", 15, 20);
  
  doc.setDrawColor(226, 232, 240);
  doc.line(15, 24, 195, 24);

  let currentY = 30;

  // PILLAR 1: Intuition
  doc.setFillColor(240, 253, 250); // very soft mint
  doc.setDrawColor(13, 148, 136); // teal
  doc.rect(15, currentY, 180, 28, "FD");
  
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text("1. INTUITIVE PHILOSOPHY & PHYSICAL PARADIGM", 18, currentY + 5);
  
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8.2);
  doc.setTextColor(51, 65, 85);
  const wrappedIntuition = wrapText(topic.intuition, 110);
  wrappedIntuition.slice(0, 4).forEach((line, idx) => {
    doc.text(line, 18, currentY + 11 + idx * 4.5);
  });

  currentY += 33;

  // PILLAR 2: Geometric
  doc.setFillColor(240, 249, 255); // very soft/light sky
  doc.setDrawColor(2, 132, 199); // sky blue
  doc.rect(15, currentY, 180, 28, "FD");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text("2. GEOMETRIC PERSPECTIVE & VECTOR FLOWS", 18, currentY + 5);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8.2);
  doc.setTextColor(51, 65, 85);
  const wrappedGeometric = wrapText(topic.geometric, 110);
  wrappedGeometric.slice(0, 4).forEach((line, idx) => {
    doc.text(line, 18, currentY + 11 + idx * 4.5);
  });

  currentY += 33;

  // PILLAR 3: Derivation
  doc.setFillColor(245, 243, 255); // very soft violet
  doc.setDrawColor(124, 58, 237); // violet
  doc.rect(15, currentY, 180, 48, "FD");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text("3. ALGEBRAIC DERIVATION & CALCULUS PROOFS", 18, currentY + 5);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8.2);
  doc.setTextColor(51, 65, 85);
  
  const cleanDerivation = stripTeXTotext(topic.derivation);
  const wrappedDerivation = wrapText(cleanDerivation, 110);
  wrappedDerivation.slice(0, 8).forEach((line, idx) => {
    doc.text(line, 18, currentY + 11 + idx * 4.5);
  });

  currentY += 53;

  // PILLAR 4: Formal Structure
  doc.setFillColor(254, 253, 236); // very soft amber
  doc.setDrawColor(217, 119, 6); // amber
  doc.rect(15, currentY, 180, 36, "FD");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text("4. FORMAL MATHEMATICAL DEFINITIONS & INTEGRAL BOUNDS", 18, currentY + 5);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8.2);
  doc.setTextColor(51, 65, 85);
  
  const cleanFormal = stripTeXTotext(topic.formalStructure);
  const wrappedFormal = wrapText(cleanFormal, 110);
  wrappedFormal.slice(0, 5).forEach((line, idx) => {
    doc.text(line, 18, currentY + 11 + idx * 4.5);
  });

  currentY += 41;

  // RECOGNITION TIPS & PITFALL COGNITIVE WARNING TRAPS
  // We draw a grid with two boxes side by side
  const gridY = currentY;
  
  // Left Box: Recognition Pointers
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(71, 85, 105);
  doc.rect(15, gridY, 86, 42, "FD");
  
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(2, 132, 199);
  doc.text("STRUCTURAL RECOGNITION PLAN", 18, gridY + 6);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(7.8);
  doc.setTextColor(51, 65, 85);
  let recYOffset = gridY + 12;
  topic.recognitionTips.forEach((tip, idx) => {
    const wrappedTip = wrapText(`▸ ${tip}`, 50);
    wrappedTip.forEach(line => {
      if (recYOffset < gridY + 39) {
        doc.text(line, 18, recYOffset);
        recYOffset += 4;
      }
    });
  });

  // Right Box: Pitfalls
  doc.setFillColor(254, 242, 242); // soft red
  doc.setDrawColor(220, 38, 38); // red
  doc.rect(109, gridY, 86, 42, "FD");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(220, 38, 38);
  doc.text("COGNITIVE TRAPS TO EVADE", 112, gridY + 6);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(7.8);
  doc.setTextColor(153, 27, 27);
  let pitYOffset = gridY + 12;
  topic.commonMistakes.forEach((mistake, idx) => {
    const wrappedMistake = wrapText(`𐄂 ${mistake}`, 50);
    wrappedMistake.forEach(line => {
      if (pitYOffset < gridY + 39) {
        doc.text(line, 112, pitYOffset);
        pitYOffset += 4;
      }
    });
  });

  // Checklist / Evaluation score confirmation indicator
  const checkpointGraded = progress.completedTopics.includes(topic.id);
  const userScore = progress.quizScores[topic.id];

  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.rect(15, gridY + 47, 180, 15, "FD");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text("STUDENT RETENTION ASSESSMENT CERTIFICATE STATUS:", 18, gridY + 54);

  if (checkpointGraded) {
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(22, 163, 74); // green-600
    doc.text(`VERIFIED COMPLETED  (Quiz score achieved: ${userScore} / ${topic.quiz.length} Correct ✓)`, 112, gridY + 54);
  } else {
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(217, 119, 6); // amber-600
    doc.text("ACTIVE LABORATORY EVALUATION SYSTEM INCOMPLETE (NOT SOLVED YET)", 112, gridY + 54);
  }

  // Footer page 2
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text("ODE Studio Archival Office", 15, 281);
  doc.setFont("Helvetica", "normal");
  doc.text(`Page 2 of 2  •  Generated by ${emailVal}`, 138, 281);

  // Save PDF directly to local user browser stream
  const safeFilename = `${topic.id}_Archival_Study_Report.pdf`.replace(/[^a-zA-Z0-9_\-\.]/g, "_");
  doc.save(safeFilename);
}
