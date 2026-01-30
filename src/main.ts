import "./styles.css";

type GameExports = {
  tick?: (state: GameState, input: InputState) => void;
  draw?: (ctx: CanvasRenderingContext2D, state: GameState) => void;
};

type GameState = {
  bounds: { w: number; h: number };
} & Record<string, unknown>;

type InputState = {
  keys: Set<string>;
  justPressed: Set<string>;
};

const defaultCode =
  "// === Главные параметры ===\n" +
  "let cell = 20;\n" +
  "let speedBase = 8;\n" +
  "let speedMin = 3;\n" +
  "let obstacleCount = 5; // количество препятствий\n" +
  "// ==========================\n" +
  "const clamp = (value, min, max) => Math.max(min, Math.min(max, value));\n" +
  "cell = clamp(cell, 12, 40);\n" +
  "speedBase = clamp(speedBase, 3, 20);\n" +
  "speedMin = clamp(speedMin, 2, speedBase);\n" +
  "obstacleCount = clamp(obstacleCount, 0, 20);\n" +
  "\n" +
  "const cols = Math.floor(state.bounds.w / cell);\n" +
  "const rows = Math.floor(state.bounds.h / cell);\n" +
  "\n" +
  "const ensureSnake = () => {\n" +
  "  if (!state.snake) {\n" +
  "    state.snake = [{ x: 8, y: 7 }, { x: 7, y: 7 }, { x: 6, y: 7 }];\n" +
  "    state.dir = { x: 1, y: 0 };\n" +
  "    state.nextDir = { x: 1, y: 0 };\n" +
  "    state.food = { x: 12, y: 10 };\n" +
  "    state.score = 0;\n" +
  "    state.best = state.best ?? 0;\n" +
  "    state.step = 0;\n" +
  "  }\n" +
  "};\n" +
  "\n" +
  "const buildWalls = () => {\n" +
  "  const walls = [];\n" +
  "  const addWallH = (x, y, len) => {\n" +
  "    for (let i = 0; i < len; i += 1) {\n" +
  "      const nx = x + i;\n" +
  "      if (nx >= 0 && nx < cols && y >= 0 && y < rows) {\n" +
  "        walls.push({ x: nx, y });\n" +
  "      }\n" +
  "    }\n" +
  "  };\n" +
  "  const addWallV = (x, y, len) => {\n" +
  "    for (let i = 0; i < len; i += 1) {\n" +
  "      const ny = y + i;\n" +
  "      if (x >= 0 && x < cols && ny >= 0 && ny < rows) {\n" +
  "        walls.push({ x, y: ny });\n" +
  "      }\n" +
  "    }\n" +
  "  };\n" +
  "  const addRandomWalls = (count) => {\n" +
  "    for (let i = 0; i < count; i += 1) {\n" +
  "      const dir = Math.random() > 0.5 ? 'h' : 'v';\n" +
  "      const len = Math.floor(Math.random() * 4) + 2; // 2..5\n" +
  "      const x = Math.floor(Math.random() * (cols - len));\n" +
  "      const y = Math.floor(Math.random() * (rows - len));\n" +
  "      if (dir === 'h') addWallH(x, y, len);\n" +
  "      else addWallV(x, y, len);\n" +
  "    }\n" +
  "  };\n" +
  "  // === ПОНЯТНО ДЛЯ НОВИЧКА ===\n" +
  "  // Ниже 5 стен по умолчанию.\n" +
  "  // addWallH(x, y, длина) — горизонталь.\n" +
  "  // addWallV(x, y, длина) — вертикаль.\n" +
  "  addWallH(3, 3, 5);\n" +
  "  addWallV(12, 2, 4);\n" +
  "  addWallH(18, 7, 4);\n" +
  "  addWallV(6, 11, 3);\n" +
  "  addWallH(2, 15, 4);\n" +
  "  // Если хочешь случайные стены — раскомментируй:\n" +
  "  // addRandomWalls(obstacleCount);\n" +
  "  return walls;\n" +
  "};\n" +
  "\n" +
  "ensureSnake();\n" +
  "state.walls = buildWalls();\n" +
  "\n" +
  "const spawnFood = (snake, walls) => {\n" +
  "  while (true) {\n" +
  "    const x = Math.floor(Math.random() * cols);\n" +
  "    const y = Math.floor(Math.random() * rows);\n" +
  "    const occupied = snake.some((s) => s.x === x && s.y === y);\n" +
  "    const blocked = walls.some((w) => w.x === x && w.y === y);\n" +
  "    if (!occupied && !blocked) return { x, y };\n" +
  "  }\n" +
  "};\n" +
  "\n" +
  "const setDir = (x, y) => {\n" +
  "  if (state.dir.x + x === 0 && state.dir.y + y === 0) return;\n" +
  "  state.nextDir = { x, y };\n" +
  "};\n" +
  "\n" +
  "const reset = () => {\n" +
  "  state.best = Math.max(state.best, state.score);\n" +
  "  state.snake = [{ x: 8, y: 7 }, { x: 7, y: 7 }, { x: 6, y: 7 }];\n" +
  "  state.dir = { x: 1, y: 0 };\n" +
  "  state.nextDir = { x: 1, y: 0 };\n" +
  "  state.food = spawnFood(state.snake, state.walls);\n" +
  "  state.score = 0;\n" +
  "};\n" +
  "\n" +
  "const tick = (state, input) => {\n" +
  "  if (input.justPressed.has('ArrowUp')) setDir(0, -1);\n" +
  "  if (input.justPressed.has('ArrowDown')) setDir(0, 1);\n" +
  "  if (input.justPressed.has('ArrowLeft')) setDir(-1, 0);\n" +
  "  if (input.justPressed.has('ArrowRight')) setDir(1, 0);\n" +
  "\n" +
  "  state.step += 1;\n" +
  "  const speed = Math.max(speedMin, speedBase - Math.floor(state.score / 4));\n" +
  "  if (state.step % speed !== 0) return;\n" +
  "\n" +
  "  state.dir = state.nextDir;\n" +
  "  const head = state.snake[0];\n" +
  "  const next = { x: head.x + state.dir.x, y: head.y + state.dir.y };\n" +
  "\n" +
  "  if (next.x < 0 || next.y < 0 || next.x >= cols || next.y >= rows) {\n" +
  "    reset();\n" +
  "    return;\n" +
  "  }\n" +
  "\n" +
  "  const hitSelf = state.snake.some((s) => s.x === next.x && s.y === next.y);\n" +
  "  const hitWall = state.walls.some((w) => w.x === next.x && w.y === next.y);\n" +
  "  if (hitSelf || hitWall) {\n" +
  "    reset();\n" +
  "    return;\n" +
  "  }\n" +
  "\n" +
  "  state.snake.unshift(next);\n" +
  "  if (next.x === state.food.x && next.y === state.food.y) {\n" +
  "    state.score += 1;\n" +
  "    state.food = spawnFood(state.snake, state.walls);\n" +
  "  } else {\n" +
  "    state.snake.pop();\n" +
  "  }\n" +
  "};\n" +
  "\n" +
  "const draw = (ctx, state) => {\n" +
  "  ctx.strokeStyle = 'rgba(255,255,255,0.15)';\n" +
  "  ctx.strokeRect(1, 1, cols * cell - 2, rows * cell - 2);\n" +
  "\n" +
  "  ctx.fillStyle = 'rgba(255,255,255,0.08)';\n" +
  "  for (const w of state.walls) {\n" +
  "    ctx.fillRect(w.x * cell, w.y * cell, cell - 2, cell - 2);\n" +
  "  }\n" +
  "\n" +
  "  ctx.fillStyle = 'rgba(124, 209, 255, 0.25)';\n" +
  "  for (let i = 0; i < state.snake.length; i += 1) {\n" +
  "    const part = state.snake[i];\n" +
  "    ctx.fillRect(part.x * cell, part.y * cell, cell - 2, cell - 2);\n" +
  "  }\n" +
  "  ctx.fillStyle = '#ff6b4a';\n" +
  "  ctx.fillRect(state.food.x * cell, state.food.y * cell, cell - 2, cell - 2);\n" +
  "  ctx.fillStyle = 'rgba(246,244,240,0.7)';\n" +
  "  ctx.font = '12px IBM Plex Mono';\n" +
  "  ctx.fillText('Score: ' + state.score + '  Best: ' + state.best, 12, 18);\n" +
  "};\n" +
  "\n" +
  "return { tick, draw };";

const storageKey = "aesthetic-editor";
const bestKey = "aesthetic-snake-best";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("App container not found");
}

app.innerHTML = `
  <main class="min-h-screen">
    <section class="relative overflow-hidden">
      <div class="absolute inset-0 bg-hero-radial animate-shimmer opacity-80"></div>
      <div class="relative mx-auto flex min-h-screen max-w-6xl items-center px-6 py-10">
        <div class="glass reveal w-full rounded-[28px] border border-smoke/10 shadow-glow">
          <div class="flex flex-wrap items-center justify-between gap-4 border-b border-smoke/10 px-5 py-4">
            <div>
              <p class="text-xs uppercase tracking-[0.4em] text-smoke/50">AESTETIC WEB</p>
              <h1 class="mt-2 text-2xl font-semibold text-smoke">Snake Lab — игра, которую можно переписать</h1>
              <p class="mt-2 text-sm text-smoke/70">
                Управление: стрелки ← ↑ ↓ →. Меняй скорость, препятствия и правило столкновений.
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-3">
              <button
                data-reset-code
                class="rounded-full border border-smoke/20 px-4 py-2 text-xs uppercase tracking-[0.3em] text-smoke/70"
              >
                Сбросить код
              </button>
              <button
                data-save
                class="glass rounded-full px-5 py-2 text-xs uppercase tracking-[0.3em] text-smoke shadow-glow"
              >
                Сохранить
              </button>
            </div>
          </div>
          <div class="grid gap-6 px-6 py-6 lg:grid-cols-[1.1fr,0.9fr]">
            <div class="space-y-4">
              <div class="rounded-2xl border border-smoke/10 bg-ink/60 p-4">
                <p class="text-xs uppercase tracking-[0.3em] text-smoke/50">Как быстро улучшить игру</p>
                <ul class="mt-3 space-y-2 text-sm text-smoke/70">
                  <li>• Измени <span class="text-smoke">cell</span> — размер клетки.</li>
                  <li>• Скорость: <span class="text-smoke">speedBase</span> и <span class="text-smoke">speedMin</span>.</li>
                  <li>• Стены: редактируй блок <span class="text-smoke">addWallH / addWallV</span>.</li>
                  <li>• Если нужны рандомные — включи <span class="text-smoke">addRandomWalls</span>.</li>
                  <li>• Длина старта в <span class="text-smoke">state.snake</span>.</li>
                </ul>
              </div>
              <div class="code-wrap rounded-2xl border border-smoke/10 bg-ink/60 p-4">
                <div class="code-highlight mb-3 rounded-xl border border-aurora/30 bg-ink/80 p-3 font-mono text-xs text-aurora">
                  Главные параметры: cell, speedBase, speedMin
                </div>
                <textarea
                  data-editor
                  spellcheck="false"
                  class="code-area min-h-[380px] w-full rounded-2xl border border-smoke/10 bg-ink/60 p-4 font-mono text-sm text-smoke/80 focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
                  placeholder="Пиши TypeScript здесь..."
                ></textarea>
              </div>
              <div class="flex flex-wrap items-center justify-between gap-3 text-xs text-smoke/50">
                <span data-status>Готов к вводу</span>
                <span>Auto-save выключен</span>
              </div>
            </div>
            <div class="space-y-4">
              <div class="rounded-2xl border border-smoke/10 bg-ink/60 p-4">
                <div class="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p class="text-xs uppercase tracking-[0.35em] text-smoke/50">Mini-game</p>
                    <h2 class="mt-2 text-lg font-semibold text-smoke">Snake Arena</h2>
                    <p class="mt-2 text-sm text-smoke/70">Канвас увеличен, сетка и препятствия видны.</p>
                  </div>
                  <button
                    data-reset
                    class="rounded-full border border-smoke/20 px-4 py-2 text-xs uppercase tracking-[0.3em] text-smoke/70"
                  >
                    Сброс
                  </button>
                </div>
                <div class="mt-4 rounded-2xl border border-smoke/10 bg-ink/70 p-3">
                  <canvas data-canvas width="760" height="420" class="game-canvas w-full"></canvas>
                </div>
              </div>
              <div class="rounded-2xl border border-smoke/10 bg-ink/60 p-4">
                <p class="text-xs uppercase tracking-[0.3em] text-smoke/50">Статус</p>
                <p class="mt-2 text-sm text-smoke/70">Стрелки для управления • Очки растут за еду</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
`;

const editor = document.querySelector<HTMLTextAreaElement>("[data-editor]");
const resetCodeButton = document.querySelector<HTMLButtonElement>("[data-reset-code]");
const saveButton = document.querySelector<HTMLButtonElement>("[data-save]");
const resetButton = document.querySelector<HTMLButtonElement>("[data-reset]");
const status = document.querySelector<HTMLElement>("[data-status]");
const canvas = document.querySelector<HTMLCanvasElement>("[data-canvas]");

if (!editor || !resetCodeButton || !saveButton || !resetButton || !status || !canvas) {
  throw new Error("Editor controls not found");
}

const ctx = canvas.getContext("2d");
if (!ctx) {
  throw new Error("Canvas context not found");
}

const input: InputState = {
  keys: new Set(),
  justPressed: new Set()
};

const baseState: GameState = {
  bounds: { w: canvas.width, h: canvas.height }
};

let state: GameState = { ...baseState };
let exportsCache: GameExports = {};

const savedBest = Number(localStorage.getItem(bestKey) ?? "0");

const extractNumber = (source: string, name: string): number | null => {
  const match = source.match(new RegExp(String.raw`(?:let|const)\s+${name}\s*=\s*([0-9.]+)`, "i"));
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) ? value : null;
};

const hasSafeParams = (source: string) => {
  const cell = extractNumber(source, "cell");
  const speedBase = extractNumber(source, "speedBase");
  const speedMin = extractNumber(source, "speedMin");
  if (cell === null || speedBase === null || speedMin === null) return false;
  if (cell < 12 || cell > 40) return false;
  if (speedBase < 3 || speedBase > 20) return false;
  if (speedMin < 2 || speedMin > speedBase) return false;
  return true;
};

const loadSaved = () => {
  const saved = localStorage.getItem(storageKey);
  if (saved && hasSafeParams(saved)) {
    editor.value = saved;
    status.textContent = "Загружено из сохранения";
    return;
  }

  editor.value = defaultCode;
  localStorage.setItem(storageKey, defaultCode);
};

const sanitizeSource = (source: string) =>
  source
    .replace(/[\u2028\u2029]/g, "\n")
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, "")
    .replace(/\u00A0/g, " ")
    .replace(/[“”]/g, "\"")
    .replace(/[‘’]/g, "'");

const runUserCode = () => {
  try {
    const cleaned = sanitizeSource(editor.value);
    if (cleaned !== editor.value) {
      editor.value = cleaned;
    }
    const fn = new Function("state", "input", cleaned);
    const result = fn(state, input) as GameExports | undefined;
    exportsCache = result ?? {};
    if (typeof state.best === "number") {
      localStorage.setItem(bestKey, String(state.best));
    }
    status.textContent = "Код запущен";
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка выполнения";
    status.textContent = `Ошибка: ${message}`;
    exportsCache = {};
    if (editor.value !== defaultCode) {
      editor.value = defaultCode;
      localStorage.setItem(storageKey, defaultCode);
      status.textContent = "Ошибка в коде, восстановлен шаблон";
      try {
        const fn = new Function("state", "input", defaultCode);
        const result = fn(state, input) as GameExports | undefined;
        exportsCache = result ?? {};
      } catch {
        // If even the template fails, keep empty exports.
      }
    }
  }
};

const resetGame = () => {
  state = { ...baseState };
  status.textContent = "Сброшено";
  runUserCode();
};

loadSaved();
state.best = savedBest;
runUserCode();

saveButton.addEventListener("click", () => {
  localStorage.setItem(storageKey, editor.value);
  status.textContent = "Код сохранён локально";
  runUserCode();
});


resetCodeButton.addEventListener("click", () => {
  editor.value = defaultCode;
  localStorage.setItem(storageKey, defaultCode);
  status.textContent = "Шаблон восстановлен";
  runUserCode();
});

resetButton.addEventListener("click", resetGame);

window.addEventListener(
  "keydown",
  (event) => {
    const isArrow =
      event.key === "ArrowUp" ||
      event.key === "ArrowDown" ||
      event.key === "ArrowLeft" ||
      event.key === "ArrowRight";
    const target = event.target as HTMLElement | null;
    const isEditable =
      target &&
      (target.tagName === "TEXTAREA" || target.tagName === "INPUT" || target.isContentEditable);
    if (isArrow && !isEditable) {
      event.preventDefault();
    }
    input.keys.add(event.key);
    input.justPressed.add(event.key);
  },
  { passive: false }
);

window.addEventListener("keyup", (event) => {
  input.keys.delete(event.key);
});

const animate = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (exportsCache.tick) {
    exportsCache.tick(state, input);
  }

  if (exportsCache.draw) {
    exportsCache.draw(ctx, state);
  }

  if (typeof state.best === "number") {
    localStorage.setItem(bestKey, String(state.best));
  }

  input.justPressed.clear();
  requestAnimationFrame(animate);
};

animate();

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.2
  }
);

document.querySelectorAll<HTMLElement>(".reveal").forEach((element) => {
  observer.observe(element);
});
