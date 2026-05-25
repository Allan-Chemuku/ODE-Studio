import { ODETopic } from "./types";

export const CURRICULUM: ODETopic[] = [
  // --- SECTION 1: FOUNDATIONS ---
  {
    id: "derivatives-rates",
    title: "Rates of Change & The Meaning of Derivatives",
    section: "foundations",
    subtitle: "Understanding derivatives as instantaneous ratios and slopes",
    difficulty: "Beginner",
    texFormula: "\\frac{dy}{dx} = f(x)",
    generalForm: "dy = f(x) dx",
    intuition: "A derivative is not just a fraction, nor is it merely a calculation rule like the power rule. It represents the *instantaneous rate of change* of a quantity. For example, if $y$ represents your location and $x$ represents time, then $\\frac{dy}{dx}$ is your exact velocity at an infintesimally small moment. It is the ratio of an infinite-ly small change in $y$ over an infinite-ly small change in $x$.",
    geometric: "Geometrically, the derivative is the limiting slope ofsecant lines passing through a point. It represents the slope of the *tangent line* to the curve $y(x)$ at any coordinate $(x, y)$. If the derivative is positive, the curve climbs; if negative, it slopes downwards.",
    derivation: "We define the derivative as the limit of the average rate of change:\n\n$$\\frac{dy}{dx} = \\lim_{\\Delta x \\to 0} \\frac{y(x + \\Delta x) - y(x)}{\\Delta x}$$\n\nIf we let $y = x^2$, the quotient is:\n\n$$\\frac{(x+\\Delta x)^2 - x^2}{\\Delta x} = \\frac{2x\\Delta x + (\\Delta x)^2}{\\Delta x} = 2x + \\Delta x$$\n\nTaking the limit as $\\Delta x \\to 0$, we are left with the exact instantaneous value $2x$.",
    formalStructure: "An ordinary differential equation of order $n$ is an equation of the form:\n\n$$F\\left(x, y, \\frac{dy}{dx}, \\dots, \\frac{d^n y}{dx^n}\\right) = 0$$\n\nWhere $x$ is the independent variable, $y$ is the dependent variable, and the derivatives are taken with respect to $x$ only.",
    recognitionTips: [
      "Check if variables represent changing physical quantities (e.g., velocity, acceleration, heating).",
      "Look for rates described as 'proportional to' some quantity (e.g. $\\frac{dy}{dx} = k y$)."
    ],
    commonMistakes: [
      "Treating $dy$ and $dx$ as separate variables without understanding their dynamic limiting relation.",
      "Forgetting that derivatives are local properties that vary point-by-point along a curve."
    ],
    interactiveProblem: {
      question: "Examine the differential equation representing a population $P(t)$ with a constant per capita birth rate $r$:\n\n$$\\frac{dP}{dt} = r P(t)$$\n\nLet's isolate the rate factor and find the general form.",
      initialOde: "dP/dt = r*P",
      classification: "First-Order Linear Separable ODE",
      steps: [
        {
          instruction: "Divide both sides by $P$ to group the state variable together on the left.",
          hint: "Simply move $P$ to the denominator of the rates equation.",
          formula: "\\frac{1}{P} \\frac{dP}{dt} = r",
          validationRegex: "1/P",
          explanation: "Grouping variables corresponding to the same dimension is called separating variables. It prepares the equation for direct integration."
        },
        {
          instruction: "Integrate both sides with respect to time ($t$).",
          hint: "Integrating $1/P \\, dP$ yields a logarithm function.",
          formula: "\\ln(P) = r t + C",
          validationRegex: "ln\\(P\\)",
          explanation: "Since the derivative of $\\ln(P)$ is $\\frac{1}{P}$, the integral of $\\frac{dP}{P}$ evaluates to $\\ln|P| + C_1$."
        }
      ]
    },
    quiz: [
      {
        question: "What does the slope of a tangent line indicate in a rate of change context?",
        options: [
          "The total area enclosed under the curve",
          "The instantaneous rate of change of the dependent variable with respect to the independent variable",
          "The average value of the function over a long interval",
          "The degree of curvature or bendiness of the function"
        ],
        answerIdx: 1,
        explanation: "The slope of the tangent line represents the instantaneous derivative, which is the immediate rate of change at that single coordinate point."
      }
    ]
  },
  {
    id: "slope-direction-fields",
    title: "Slope & Direction Fields",
    section: "foundations",
    subtitle: "Visualizing differential equations without solving them analytically",
    difficulty: "Beginner",
    texFormula: "\\frac{dy}{dx} = f(x, y)",
    generalForm: "dy/dx = f(x,y)",
    intuition: "When we cannot solve an ODE using algebraic algebra, we don't have to give up. A first-order differential equation $\\frac{dy}{dx} = f(x, y)$ is actually a recipe book of instructions. It states: 'At any point $(x, y)$, the slope of any passing solution curve *must* equal exactly $f(x, y)$'. By plotting mini tangent lines at a grid of points, we get a roadmap of the solutions.",
    geometric: "Geometrically, if you drop a particle into a slope field, it will drift along the tangent directions. Moving along these vectors traces out a unique *solution curve*. Setting an initial condition $y(x_0)=y_0$ pins down a single path from the infinite possible flows.",
    derivation: "A slope field evaluates $f(x, y)$ on a lattice. An isocline is a curve where the slope is constant:\n\n$$f(x, y) = c$$\n\nFor example, if $\\frac{dy}{dx} = x$, the isoclines are vertical lines $x = c$. If $\\frac{dy}{dx} = y$, the isoclines are horizontal lines $y = c$. Analyzing these pathways shows us the qualitative behavior of curves.",
    formalStructure: "Any first-order ODE defines a vector field on the plane:\n\n$$\\vec{v}(x, y) = (1, f(x, y))$$\n\nAn integral curve is a parameterized curve $\\alpha(t) = (x(t), y(t))$ that is tangent to this vector field everywhere.",
    recognitionTips: [
      "If the slope field values depend only on $y$, the system is autonomous: horizontal lines have identical slopes.",
      "If slopes are horizontal (zero slope) along a curve, $f(x, y) = 0$ represents equilibrium states."
    ],
    commonMistakes: [
      "Confusing the coordinates: plugging in the value of $y$ where $x$ belongs when drawing tangent lines.",
      "Thinking slope lines are actual solutions themselves. They are local tangent indicators only!"
    ],
    interactiveProblem: {
      question: "Let first-order slope instructions be $\\frac{dy}{dx} = x - y$. Let's identify the equilibrium slope line of slope zero $2D$ field.",
      initialOde: "dy/dx = x - y",
      classification: "Linear Non-Autonomous First-Order",
      steps: [
        {
          instruction: "Set the derivative $\\frac{dy}{dx} = 0$ and find the relation between $y$ and $x$ representing zero-slope tangent lines.",
          hint: "Set $x - y = 0$ and solve for $y$.",
          formula: "y = x",
          validationRegex: "y\\s*=\\s*x",
          explanation: "The line $y = x$ is an isocline of slope zero. All solution curves will reach their local extremum exactly when they cross this straight line!"
        }
      ]
    },
    quiz: [
      {
        question: "If a slope field has slopes that are constant horizontally across any given height (dependent only on y), what is this ODE called?",
        options: [
          "Linear homogenous equation of order 2",
          "An Autonomous differential equation",
          "A Fourier periodic transform equation",
          "A Bernoulli variable density equation"
        ],
        answerIdx: 1,
        explanation: "Autonomous ODEs of the form dy/dx = f(y) have rates that depend only on the state y, meaning slopes are invariant when shifted horizontally."
      }
    ]
  },

  // --- SECTION 2: FIRST-ORDER METHODS ---
  {
    id: "separation-variables",
    title: "Separation of Variables",
    section: "first-order",
    subtitle: "The most fundamental method: sorting variables to opposite sides",
    difficulty: "Beginner",
    texFormula: "\\frac{dy}{dx} = g(x)h(y)",
    generalForm: "\\frac{1}{h(y)} dy = g(x) dx",
    intuition: "The core trick of separation of variables is variable segregation. If you can factor your rate equation so that $x$-stuff and $y$-stuff do not multiply or add interactively, but are purely distinct factors, you can group all $y$'s with the differential $dy$ on the left, and all $x$'s with $dx$ on the right. Once separated, each side is an independent calculus integration problem.",
    geometric: "Visually, separation shows that the rate of expansion can be decoupled into two independent dimensions: an independent stretching along the $x$-axis and a vertical compression along the $y$-axis.",
    derivation: "Given:\n\n$$\\frac{dy}{dx} = g(x)h(y)$$\n\nIf $h(y) \\neq 0$, divide both sides by $h(y)$:\n\n$$\\frac{1}{h(y)} \\frac{dy}{dx} = g(x)$$\n\nNow integrate both sides with respect to $x$:\n\n$$\\int \\frac{1}{h(y)} \\frac{dy}{dx} dx = \\int g(x) dx$$\n\nUsing the chain rule change of variables, this simplifies to:\n\n$$\\int \\frac{1}{h(y)} dy = \\int g(x) dx$$\n\nSolving these integrations provides our implicit relation.",
    formalStructure: "A separable first-order differential equation satisfies the exact algebraic format:\n\n$$\\frac{dy}{dx} = g(x)h(y)$$\n\nIts solutions are found by integrating the differential forms $\\int \\frac{dy}{h(y)} = \\int g(x)dx + C$.",
    recognitionTips: [
      "Can the right-hand-side expression $f(x, y)$ be factored into a single function of $x$ multiplied by a function of $y$?",
      "For example, $\\frac{dy}{dx} = e^{x+y} = e^x e^y$ is separable, but $\\frac{dy}{dx} = x + y$ is NOT separable."
    ],
    commonMistakes: [
      "Adding a integration constant $+C$ only at the very end of the algebraic operations, rather than immediately when integrating.",
      "Dividing by functions like $h(y)$ without considering singular solutions where $h(y) = 0$ (such as $y=0$ in $\\frac{dy}{dx}=y$)."
    ],
    interactiveProblem: {
      question: "Let's solve the separable ODE:\n\n$$\\frac{dy}{dx} = 4x y$$\n\nIsolate the $y$ terms and prepare for integration.",
      initialOde: "dy/dx = 4*x*y",
      classification: "First-Order Separable ODE",
      steps: [
        {
          instruction: "Divide both sides by $y$ to group it with $dy$.",
          hint: "Your equation should have 1/y dy/dx = 4x",
          formula: "\\frac{1}{y} dy = 4x dx",
          validationRegex: "1/y",
          explanation: "This separates $y$ on the left and $x$ on the right, putting the equation into separable differential form."
        },
        {
          instruction: "Integrate both sides to solve for the general expression.",
          hint: "Integrals are ln(y) and 2x^2 + C respectively.",
          formula: "\\ln|y| = 2x^2 + C",
          validationRegex: "2x\\^2",
          explanation: "Exponentiating both sides results in: $y(x) = A e^{2x^2}$ where $A = \\pm e^C$."
        }
      ]
    },
    quiz: [
      {
        question: "Which of the following differential equations is separable?",
        options: [
          "dy/dx = x^2 y + y",
          "dy/dx = x^2 + y",
          "dy/dx = sin(x + y)",
          "dy/dx = ln(x + y)"
        ],
        answerIdx: 0,
        explanation: "The equation dy/dx = x^2 y + y can be factored into y(x^2 + 1), which is a function of y times a function of x, making it completely separable."
      }
    ]
  },
  {
    id: "linear-first-order",
    title: "First-Order Linear ODEs",
    section: "first-order",
    subtitle: "The elegance of the Integrating Factor method",
    difficulty: "Beginner",
    texFormula: "\\frac{dy}{dx} + P(x)y = Q(x)",
    generalForm: "dy/dx + P(x)*y = Q(x)",
    intuition: "A first-order linear equation cannot be separated since $y$ and the independent variable have an interactive additive relationship. To solve it, we use a brilliant trick: we multiply the entire equation by a magic function $\\mu(x)$ called the *Integrating Factor*. This multiplier collapses the entire left side using the *Product Rule of derivatives* backwards!",
    geometric: "Geometrically, the integrating factor shifts and scales our coordinate system dynamically over $x$ to match the compounding growth or decay represented by $P(x)$, straightening out the vector fields so we can integrate them.",
    derivation: "We multiply through by an arbitrary function $\\mu(x)$:\n\n$$\\mu(x) \\frac{dy}{dx} + \\mu(x) P(x) y = \\mu(x) Q(x)$$\n\nWe want the left-hand side to exactly equal the product rule expansion:\n\n$$\\frac{d}{dx}[\\mu(x) y] = \\mu(x) \\frac{dy}{dx} + \\frac{d\\mu}{dx} y$$\n\nComparing terms, we see that we require:\n\n$$\\frac{d\\mu}{dx} = \\mu(x) P(x) \\implies \\frac{d\\mu}{\\mu} = P(x)dx$$\n\nIntegrating this gives our integrating factor Formula:\n\n$$\\mu(x) = e^{\\int P(x) dx}$$\n\nOnce multiplied, we simply integrate both sides:\n\n$$\\mu(x) y = \\int \\mu(x) Q(x) dx + C$$",
    formalStructure: "A linear first-order differential equation has the standard mathematical structure:\n\n$$\\frac{dy}{dx} + P(x)y = Q(x)$$\n\nIts general solution is explicitly calculated as:\n\n$$y(x) = \\frac{1}{\\mu(x)} \\left( \\int \\mu(x)Q(x)dx + C \\right), \\quad \\mu(x) = e^{\\int P(x)dx}$$",
    recognitionTips: [
      "Ensure $y$ and its derivative $\\frac{dy}{dx}$ both appear strictly to the power of 1.",
      "No terms should multiply $y$ by $\\frac{dy}{dx}$, nor can $y$ appear inside non-linear functions like $\\sin(y)$ or $e^y$."
    ],
    commonMistakes: [
      "Forgetting to divide through by the coefficient of $\\frac{dy}{dx}$ to put the equation in standard form before identifying $P(x)$.",
      "Forgetting to apply the negative sign when $P(x)$ has a minus sign in front (e.g. $\\frac{dy}{dx} - 3y = e^x \\implies P(x) = -3$)."
    ],
    interactiveProblem: {
      question: "Let's find the integrating factor $\\mu(x)$ for the linear ODE:\n\n$$\\frac{dy}{dx} + \\frac{2}{x} y = x^3$$",
      initialOde: "dy/dx + (2/x)*y = x^3",
      classification: "First-Order Linear Non-Homogeneous",
      steps: [
        {
          instruction: "Identify $P(x)$ and compute its integral $\\int P(x) dx$.",
          hint: "Here, P(x) is 2/x. Integrals of 2/x is 2 ln(x) or ln(x^2).",
          formula: "\\int \\frac{2}{x} dx = 2 \\ln(x)",
          validationRegex: "2\\s*ln|ln\\(x\\^2\\)",
          explanation: "Calculating the integrating factor exponent requires first integrating $P(x) = \\frac{2}{x}$."
        },
        {
          instruction: "Exponentiate this result to get the Integrating Factor $\\mu(x) = e^{\\int P(x)dx}$.",
          hint: "Recall that e^(2 ln(x)) simplified is x^2.",
          formula: "\\mu(x) = x^2",
          validationRegex: "x\\^2",
          explanation: "The exponential and natural log cancel each other out, leaving $e^{\\ln(x^2)} = x^2$ as the perfect multiplier!"
        }
      ]
    },
    quiz: [
      {
        question: "For dy/dx + P(x)y = Q(x), why do we multiply by the Integrating Factor?",
        options: [
          "To allow the direct separation of P(x) and Q(x)",
          "To render the left-hand side as the derivative of a single product: d/dx [mu(x) * y]",
          "To linearize a non-linear coefficient structure",
          "To cancel the independent variable x entirely from the equation"
        ],
        answerIdx: 1,
        explanation: "Multiplying by mu(x) turns the two separate terms of the left-hand side into the exact derivative of the product (mu(x)*y), making direct integration possible."
      }
    ]
  },
  {
    id: "exact-equations",
    title: "Exact Equations",
    section: "first-order",
    subtitle: "Conserved systems and total differentials on a potential surface",
    difficulty: "Intermediate",
    texFormula: "M(x, y) \\, dx + N(x, y) \\, dy = 0",
    generalForm: "M(x,y) dx + N(x,y) dy = 0",
    intuition: "Imagine walking on a hilly mountain landscape where the height function is $\\psi(x, y) = C$. If you stay completely flat along a contour, your rate of change of altitude is exactly zero ($d\\psi = 0$). An exact differential equation represents these constant-height contours. If we can reconstruct this potential surface $\\psi$, then the solution paths are simply the level curves!",
    geometric: "Visually, an exact equation is a contour map. Every curve represents a slice of a 3D landscape. Tangents along these level sets are orthogonal to the gradient of the surface.",
    derivation: "A total differential of a surface $\\psi(x, y)$ is given by:\n\n$$d\\psi = \\frac{\\partial \\psi}{\\partial x} dx + \\frac{\\partial \\psi}{\\partial y} dy = 0$$\n\nComparing this to $M\\,dx + N\\,dy = 0$, we set:\n\n$$M = \\frac{\\partial \\psi}{\\partial x}, \\quad N = \\frac{\\partial \\psi}{\\partial y}$$\n\nAccording to Clairaut's theorem on mixed partial derivatives, the cross-derivatives must match if the function is smooth:\n\n$$\\frac{\\partial M}{\\partial y} = \\frac{\\partial^2 \\psi}{\\partial y \\partial x} = \\frac{\\partial^2 \\psi}{\\partial x \\partial y} = \\frac{\\partial N}{\\partial x}$$\n\nIf $\\frac{\\partial M}{\\partial y} = \\frac{\\partial N}{\\partial x}$, the equation is **exact**. We discover $\\psi$ by integrating $M$ with respect to $x$ and finding the residual function in terms of $y$.",
    formalStructure: "An exact differential equation has the form $M(x,y)dx + N(x,y)dy = 0$ where:\n\n$$\\frac{\\partial M}{\\partial y} = \\frac{\\partial N}{\\partial x}$$\n\nIts general implicit solution is written as $\\psi(x, y) = C$.",
    recognitionTips: [
      "Check if terms are split nicely using differentials: $(\\dots)dx + (\\dots)dy = 0$.",
      "Always compute $\\frac{\\partial M}{\\partial y}$ and $\\frac{\\partial N}{\\partial x}$ to verify they are perfectly equal before continuing."
    ],
    commonMistakes: [
      "Integrating $M$ with respect to $y$, or integrating $N$ with respect to $x$. Always match $M$ (paired with $dx$) to integration with respect to $x$.",
      "Forgetting the constant function of $y$, $g(y)$, that appears when integrating with respect to $x$ only."
    ],
    interactiveProblem: {
      question: "Examine the differential equation:\n\n$$(2x + y) dx + (x + 3y^2) dy = 0$$\n\nLet's test if this equation is exact by calculating the partial derivatives of $M = 2x + y$ and $N = x + 3y^2$.",
      initialOde: "(2x+y)dx + (x+3y^2)dy = 0",
      classification: "First-Order Exact ODE",
      steps: [
        {
          instruction: "Find the partial derivative $\\frac{\\partial M}{\\partial y}$ of $2x + y$.",
          hint: "Take the derivative with respect to y, treating x as a constant.",
          formula: "\\frac{\\partial M}{\\partial y} = 1",
          validationRegex: "1",
          explanation: "Since the derivative of $2x$ with respect to $y$ is 0 and $y$ derivative is 1, the result is 1."
        },
        {
          instruction: "Find the partial derivative $\\frac{\\partial N}{\\partial x}$ of $x + 3y^2$.",
          hint: "Take the derivative with respect to x, treating y as constant.",
          formula: "\\frac{\\partial N}{\\partial x} = 1",
          validationRegex: "1",
          explanation: "The derivatives of $x$ with respect to $x$ is 1 and $3y^2$ behaves as a constant. Since $\\partial M/\\partial y = \\partial N/\\partial x = 1$, the equation is exact!"
        }
      ]
    },
    quiz: [
      {
        question: "What is the enabling condition that makes M(x, y) dx + N(x, y) dy = 0 an exact differential equation?",
        options: [
          "M/N = constant",
          "dM/dx = dN/dy",
          "The mixed partial derivatives match: dM/dy = dN/dx",
          "The equation can be solved by variable substitution y = vx"
        ],
        answerIdx: 2,
        explanation: "Exactness requires the mixed partial derivatives of the potential surface to be identical, translating directly to dM/dy = dN/dx."
      }
    ]
  },
  {
    id: "integrating-factors-exact",
    title: "Integrating Factors for Non-Exact ODEs",
    section: "first-order",
    subtitle: "Forcing exactness on uncooperative differential equations",
    difficulty: "Advanced",
    texFormula: "\\mu(x) [M \\, dx + N \\, dy] = 0",
    generalForm: "I(x) * (M dx + N dy) = 0",
    intuition: "Sometimes a differential equation contour map is scrambled. It could have been derived from a potential surface $\\psi$, but someone divided or multiplied it by our secret modifier, making $\\frac{\\partial M}{\\partial y} \\neq \\frac{\\partial N}{\\partial x}$. We can salvage this by multiplying by an adapting factor $\\mu(x, y)$ that forces exactness back into the equations.",
    geometric: "Geometrically, the integrating factor rescales the vector field vectors so that they align back into the perpendicular gradient of a single cohesive potential landscape.",
    derivation: "If $\\mu(M\\,dx + N\\,dy) = 0$ is exact, it must satisfy:\n\n$$\\frac{\\partial}{\\partial y}[\\mu M] = \\frac{\\partial}{\\partial x}[\\mu N]$$\n\nExpanding this using the product rule:\n\n$$\\mu \\frac{\\partial M}{\\partial y} + M \\frac{\\partial \\mu}{\\partial y} = \\mu \\frac{\\partial N}{\\partial x} + N \\frac{\\partial \\mu}{\\partial x}$$\n\nIf we assume $\\mu$ depends only on $x$, then $\\frac{\\partial \\mu}{\\partial y} = 0$, reducing the relation to:\n\n$$\\mu \\left( \\frac{\\partial M}{\\partial y} - \\frac{\\partial N}{\\partial x} \\right) = N \\frac{d\\mu}{dx} \\implies \\frac{d\\mu}{\\mu} = \\left( \\frac{\\frac{\\partial M}{\\partial y} - \\frac{\\partial N}{\\partial x}}{N} \\right) dx$$\n\nIf this bracket expression depends on $x$ only, we can solve for our integrating factor as:\n\n$$\\mu(x) = e^{\\int \\frac{\\partial M/\\partial y - \\partial N/\\partial x}{N} dx}$$",
    formalStructure: "A non-exact equation is transformed into an exact equation by multiplying with an integrating factor $\\mu$ calculated based on matching variables.",
    recognitionTips: [
      "Test exactness first: if dM/dy does not equal dN/dx, notice if $(dM/dy - dN/dx)/N$ depends purely on $x$.",
      "If terms are highly complex, seek integrating factors depending purely on $x$ or purely on $y$."
    ],
    commonMistakes: [
      "Forgetting to verify if the quotient is solely a function of $x$ (or $y$). If it contains both, you cannot use the simple single-variable integration factor formulas directly!"
    ],
    interactiveProblem: {
      question: "For an ODE with $M = y$, $N = -x$, we get $\\partial M / \\partial y = 1$ and $\\partial N / \\partial x = -1$. Let's compute the numerator of the scaling quotient.",
      initialOde: "y dx - x dy = 0",
      classification: "Integrating Factor exactness recovery",
      steps: [
        {
          instruction: "Calculate the exact derivative subtraction $\\frac{\\partial M}{\\partial y} - \\frac{\\partial N}{\\partial x}$.",
          hint: "Subtract -1 from 1.",
          formula: "\\Delta = 2",
          validationRegex: "2",
          explanation: "Subtracting mixed derivatives: $1 - (-1) = 2$."
        }
      ]
    },
    quiz: [
      {
        question: "When is the integrating factor technique for exactness viable?",
        options: [
          "Only when the resulting fractional quotient contains only one variable, either x or y",
          "For all possible first-order partial differential equations",
          "Only when the coefficients are algebraic constants",
          "When the independent variable is a periodic trigonometric function"
        ],
        answerIdx: 0,
        explanation: "Simple single-variable integrating factors exist only when the quotient evaluated yields an expression containing only the target variable (either x or y)."
      }
    ]
  },

  // --- SECTION 3: SECOND-ORDER ODES ---
  {
    id: "characteristic-equations",
    title: "Linear Homogeneous Second-Order Equations",
    section: "second-order",
    subtitle: "The mechanics of the Characteristic Equation and auxiliary polynomial roots",
    difficulty: "Intermediate",
    texFormula: "a \\frac{d^2 y}{dx^2} + b \\frac{dy}{dx} + c y = 0",
    generalForm: "a*y'' + b*y' + c*y = 0",
    intuition: "A first-order linear homogeneous ODE has an exponential solution. For a second-order linear ODE with constant coefficients, we make a natural assumption: 'Could the solution still be an exponential of the form $y = e^{r x}$?' When we feed this model into the differential equation, the derivatives pull out factors of $r$, transforming a calculus derivative equation into a simple high-school quadratic equation!",
    geometric: "Geometrically, second-order ODEs represent pathways of forces. Depending on the auxiliary roots, solutions are exponential expansions (overdamped), straight shearing lines (critically damped), or spirals on a phase diagram representing rotational oscillation (underdamped).",
    derivation: "Substitute $y = e^{rx}$, $y' = r e^{rx}$, and $y'' = r^2 e^{rx}$ into:\n\n$$a y'' + b y' + c y = 0$$\n\nThis leads directly to:\n\n$$a r^2 e^{rx} + b r e^{rx} + c e^{rx} = 0$$\n\nSince exponential terms are never zero, we can divide them out. We are left with the **Characteristic Equation**:\n\n$$a r^2 + b r + c = 0$$\n\nSolving this quadratic equation yields roots $r_1, r_2$:\n\n1. **Distinct Real Roots** ($b^2 - 4ac > 0$): $y(x) = C_1 e^{r_1 x} + C_2 e^{r_2 x}$\n2. **Repeated Real Roots** ($b^2 - 4ac = 0$): $y(x) = C_1 e^{r x} + C_2 x e^{r x}$\n3. **Complex Roots** ($b^2 - 4ac < 0$, $r = \\alpha \\pm i\\beta$): $y(x) = e^{\\alpha x}(C_1 \\cos(\\beta x) + C_2 \\sin(\\beta x))$",
    formalStructure: "Linearly independent solutions $y_1, y_2$ form a vector space. Any linear homogeneous system solution can be represented as a linear combination of these elements, verified using a non-zero Wronskian determinant.",
    recognitionTips: [
      "Ensure the coefficients of $y''$, $y'$, and $y$ are completely constant numbers.",
      "Homogeneous linear second-order equations always equal zero on the right side."
    ],
    commonMistakes: [
      "Forgetting to multiply the second term by $x$ in repeated root cases, which is needed to maintain linear independence.",
      "Plugging imaginary coefficients directly in Euler's formula without resolving them to standard real trigonometric terms: $\\cos(\\beta x)$ and $\\sin(\\beta x)$."
    ],
    interactiveProblem: {
      question: "Let's find the characteristic equation and identify the roots of:\n\n$$y'' - 5y' + 6y = 0$$",
      initialOde: "y'' - 5y' + 6y = 0",
      classification: "Constant-coefficient Linear Homogeneous Second-Order",
      steps: [
        {
          instruction: "Formulate the auxiliary characteristic equation using the root variable $r$.",
          hint: "Simply swap y'' with r^2, y' with r, and y with 1.",
          formula: "r^2 - 5r + 6 = 0",
          validationRegex: "r\\^2\\s*-\\s*5r\\s*\\+\\s*6",
          explanation: "Replacing derivatives with polynomial powers of $r$ provides our quadratic algebraic form."
        },
        {
          instruction: "Factor this quadratic equation and find the two distinct roots.",
          hint: "Roots of (r-2)(r-3)=0 are r=2,3. Enter them separated by a comma.",
          formula: "r = 2, 3",
          validationRegex: "2\\s*,\\s*3|3\\s*,\\s*2",
          explanation: "Factorization yields $(r-2)(r-3) = 0$, giving the distinct roots $r_1 = 2$ and $r_2 = 3$."
        }
      ]
    },
    quiz: [
      {
        question: "When solving constant-coefficient homogeneous second-order ODEs, what solution do we get for a repeated roots auxiliary outcome r?",
        options: [
          "y = (C1 + C2 * x) * e^(r*x)",
          "y = C1 * e^(r*x) + C2 * e^(-r*x)",
          "y = C1 * cos(r*x) + C2 * sin(r*x)",
          "y = C1 * x^r"
        ],
        answerIdx: 0,
        explanation: "Identical roots require scaling the second independent solution with a linear factor of x, producing the general form y = (C1 + C2*x) * e^(r*x)."
      }
    ]
  },

  // --- SECTION 4: PHYSICAL APPLICATIONS ---
  {
    id: "spring-mass-systems",
    title: "Mass-Mass-Spring Systems & Harmonic Motion",
    section: "applications",
    subtitle: "The mechanics of oscillating springs, damping, resonance, and forces",
    difficulty: "Advanced",
    texFormula: "m y'' + c y' + k y = F(t)",
    generalForm: "m*y'' + c*y' + k*y = F(t)",
    intuition: "Nearly everything in physical mechanics oscillates. A mass attached to a spring behaves based on Newton's Second Law ($F=ma$). Three major actions are at play: 1) inertia of the mass ($m y''$), 2) resistance of the fluid/damping ($c y'$), and 3) restoration force of the spring Hooke's Law ($k y$). Balancing these three forces models everything from a car shock absorber to building tremors.",
    geometric: "Visually, mass-spring phase space describes circles or spirals. When external driving forces match the mechanical natural frequency ($F(t) = F_0 \\cos(\\omega x)$), energy accumulates infinitely, causing massive oscillations known as mechanical Resonance.",
    derivation: "By Newton's second law:\n\n$$F_{\\text{total}} = m a \\implies F_{\\text{spring}} + F_{\\text{damping}} + F_{\\text{external}} = m y''$$\n\nSubstituting force formulations:\n\n$$-ky - cy' + F(t) = my'' \\implies m y'' + c y' + k y = F(t)$$\n\nAnalyzing homogeneous solutions ($F(t) = 0$):\n\n- **No Damping** ($c = 0$): Pure harmonic wave $y(t) = C_1 \\cos(\\omega_0 t) + C_2 \\sin(\\omega_0 t)$ with $\\omega_0 = \\sqrt{k/m}$.\n- **Underdamped** ($c^2 < 4km$): Exponentially decaying amplitude with periodic waves.\n- **Overdamped** ($c^2 > 4km$): Highly viscous decay lacking oscillations.",
    formalStructure: "The equation $m y'' + c y' + k y = F_0 \\cos(\\omega t)$ constitutes a non-homogeneous second-order ODE with constant coefficients.",
    recognitionTips: [
      "Identify the physical constants: mass $m$, damping factor $c$, and spring elasticity coefficient $k$.",
      "Look for terms like 'resistance proportional to velocity' to establish $c y'$."
    ],
    commonMistakes: [
      "Using incorrect signs: restoring spring forces always oppose motion direction, requiring positive signs on the left hand side of the equation when variables are grouped."
    ],
    interactiveProblem: {
      question: "A non-damped harmonic oscillator has mass $m = 1$ and spring coefficient $k = 9$. Write down the natural frequency $\\omega_0 = \\sqrt{k/m}$.",
      initialOde: "y'' + 9y = 0",
      classification: "Undamped Harmonic Oscillator",
      steps: [
        {
          instruction: "Calculate the angular frequency value $\\omega_0$.",
          hint: "The root of k/m = sqrt(9/1).",
          formula: "\\omega_0 = 3",
          validationRegex: "3",
          explanation: "Taking the root: $\\omega_0 = \\sqrt{9/1} = 3$ radians per second."
        }
      ]
    },
    quiz: [
      {
        question: "Under what electrical or physical parameter constraints does catastrophic Resonance occur?",
        options: [
          "When the damping factor becomes extremely large",
          "When the driving external frequency exactly matches the natural frequency of the non-damped system",
          "When spring constant k is reduced below zero",
          "When the mass is removed from the oscillating loop"
        ],
        answerIdx: 1,
        explanation: "Resonance happens when an external driving force shakes the system at its precise natural frequency, continually feeding energy into the system and causing amplitude to grow without limit."
      }
    ]
  },

  // --- SECTION 5: ADVANCED TOPICS ---
  {
    id: "laplace-transforms",
    title: "Laplace Transforms",
    section: "advanced",
    subtitle: "Taking differential equations into the complex frequency domain",
    difficulty: "Advanced",
    texFormula: "\\mathcal{L}\\{f(t)\\} = \\int_0^\\infty e^{-st}f(t)\\,dt",
    generalForm: "L{f(t)} = integral(e^{-st}f(t)dt)",
    intuition: "Solving high-order differential equations directly is mathematically tedious. The Laplace Transform acts as a wormhole to an alternate mathematical universe called the *s-domain*. It maps complex operations like derivatives into simple algebraic multiplication. We transform our ODE into a basic algebraic problem, solve it there, and translate it back to time space!",
    geometric: "Geometrically, Laplace acts as a continuous projection of our function onto exponentially decaying templates. It maps time-domain dynamics onto a map of complex poles and zeroes representing resonance modes.",
    derivation: "The Laplace integral of a function $f(t)$ is defined as:\n\n$$\\mathcal{L}\\{f(t)\\} = F(s) = \\int_0^\\infty e^{-st} f(t) dt$$\n\nCrucially, transforming derivatives maps them directly to values containing initial conditions:\n\n$$\\mathcal{L}\\{y'\\} = s Y(s) - y(0)$$\n\n$$\\mathcal{L}\\{y''\\} = s^2 Y(s) - s y(0) - y'(0)$$\n\nThis completely bypasses the need to solve homogeneous and particular equations independently!",
    formalStructure: "The transformation is an integral operator mapping continuous real-space coordinates to complex algebraic structures.",
    recognitionTips: [
      "Particularly useful when systems contain discontinuous, piecewise, or pulse-like inputs (e.g. Heaviside step functions, Dirac delta pulses).",
      "Look for ODEs with specified initial conditions at time $t = 0$."
    ],
    commonMistakes: [
      "Forgetting to include the initial states conditions in the derivative expansions $\\mathcal{L}\\{y'\\} = s Y(s) - y(0)$.",
      "Confusing inverse transform rules when performing partial fraction decomposition on $Y(s)$."
    ],
    interactiveProblem: {
      question: "Compute the Laplace transform of the basic exponential decay function:\n\n$$f(t) = e^{3t}$$",
      initialOde: "f(t) = e^(3t)",
      classification: "Laplace Transform of basic function",
      steps: [
        {
          instruction: "Evaluate the Laplace integral scaling rule for $e^{at}$ where $a = 3$.",
          hint: "The formula is 1/(s - a).",
          formula: "F(s) = \\frac{1}{s - 3}",
          validationRegex: "1/\\(\\s*s\\s*-\\s*3\\s*\\)",
          explanation: "Direct integration yields $\\int_0^\\infty e^{-(s-3)t} dt = \\frac{1}{s-3}$ for $s > 3$."
        }
      ]
    },
    quiz: [
      {
        question: "What makes Laplace transforms exceptionally convenient for electrical circuits and structural physics engineering?",
        options: [
          "They translate non-linear equations into linear representations",
          "They convert derivatives into standard algebraic polynomials of s and easily model step/pulse inputs",
          "They remove the need for initial conditions entirely",
          "They scale the coordinate grid symmetrically"
        ],
        answerIdx: 1,
        explanation: "Laplace transforms map differentiation in time onto multiplication by the frequency variable s, converting differential equations into algebraic expressions that excel at handling step steps and sudden pulses."
      }
    ]
  }
];
