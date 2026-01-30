(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))a(n);new MutationObserver(n=>{for(const o of n)if(o.type==="childList")for(const f of o.addedNodes)f.tagName==="LINK"&&f.rel==="modulepreload"&&a(f)}).observe(document,{childList:!0,subtree:!0});function s(n){const o={};return n.integrity&&(o.integrity=n.integrity),n.referrerPolicy&&(o.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?o.credentials="include":n.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function a(n){if(n.ep)return;n.ep=!0;const o=s(n);fetch(n.href,o)}})();const c=`// === Главные параметры ===
let cell = 20;
let speedBase = 8;
let speedMin = 3;
let obstacleCount = 5; // количество препятствий
// ==========================
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
cell = clamp(cell, 12, 40);
speedBase = clamp(speedBase, 3, 20);
speedMin = clamp(speedMin, 2, speedBase);
obstacleCount = clamp(obstacleCount, 0, 20);

const cols = Math.floor(state.bounds.w / cell);
const rows = Math.floor(state.bounds.h / cell);

const ensureSnake = () => {
  if (!state.snake) {
    state.snake = [{ x: 8, y: 7 }, { x: 7, y: 7 }, { x: 6, y: 7 }];
    state.dir = { x: 1, y: 0 };
    state.nextDir = { x: 1, y: 0 };
    state.food = { x: 12, y: 10 };
    state.score = 0;
    state.best = state.best ?? 0;
    state.step = 0;
  }
};

const buildWalls = () => {
  const walls = [];
  const addWallH = (x, y, len) => {
    for (let i = 0; i < len; i += 1) {
      const nx = x + i;
      if (nx >= 0 && nx < cols && y >= 0 && y < rows) {
        walls.push({ x: nx, y });
      }
    }
  };
  const addWallV = (x, y, len) => {
    for (let i = 0; i < len; i += 1) {
      const ny = y + i;
      if (x >= 0 && x < cols && ny >= 0 && ny < rows) {
        walls.push({ x, y: ny });
      }
    }
  };
  const addRandomWalls = (count) => {
    for (let i = 0; i < count; i += 1) {
      const dir = Math.random() > 0.5 ? 'h' : 'v';
      const len = Math.floor(Math.random() * 4) + 2; // 2..5
      const x = Math.floor(Math.random() * (cols - len));
      const y = Math.floor(Math.random() * (rows - len));
      if (dir === 'h') addWallH(x, y, len);
      else addWallV(x, y, len);
    }
  };
  // === ПОНЯТНО ДЛЯ НОВИЧКА ===
  // Ниже 5 стен по умолчанию.
  // addWallH(x, y, длина) — горизонталь.
  // addWallV(x, y, длина) — вертикаль.
  addWallH(3, 3, 5);
  addWallV(12, 2, 4);
  addWallH(18, 7, 4);
  addWallV(6, 11, 3);
  addWallH(2, 15, 4);
  // Если хочешь случайные стены — раскомментируй:
  // addRandomWalls(obstacleCount);
  return walls;
};

ensureSnake();
state.walls = buildWalls();

const spawnFood = (snake, walls) => {
  while (true) {
    const x = Math.floor(Math.random() * cols);
    const y = Math.floor(Math.random() * rows);
    const occupied = snake.some((s) => s.x === x && s.y === y);
    const blocked = walls.some((w) => w.x === x && w.y === y);
    if (!occupied && !blocked) return { x, y };
  }
};

const setDir = (x, y) => {
  if (state.dir.x + x === 0 && state.dir.y + y === 0) return;
  state.nextDir = { x, y };
};

const reset = () => {
  state.best = Math.max(state.best, state.score);
  state.snake = [{ x: 8, y: 7 }, { x: 7, y: 7 }, { x: 6, y: 7 }];
  state.dir = { x: 1, y: 0 };
  state.nextDir = { x: 1, y: 0 };
  state.food = spawnFood(state.snake, state.walls);
  state.score = 0;
};

const tick = (state, input) => {
  if (input.justPressed.has('ArrowUp')) setDir(0, -1);
  if (input.justPressed.has('ArrowDown')) setDir(0, 1);
  if (input.justPressed.has('ArrowLeft')) setDir(-1, 0);
  if (input.justPressed.has('ArrowRight')) setDir(1, 0);

  state.step += 1;
  const speed = Math.max(speedMin, speedBase - Math.floor(state.score / 4));
  if (state.step % speed !== 0) return;

  state.dir = state.nextDir;
  const head = state.snake[0];
  const next = { x: head.x + state.dir.x, y: head.y + state.dir.y };

  if (next.x < 0 || next.y < 0 || next.x >= cols || next.y >= rows) {
    reset();
    return;
  }

  const hitSelf = state.snake.some((s) => s.x === next.x && s.y === next.y);
  const hitWall = state.walls.some((w) => w.x === next.x && w.y === next.y);
  if (hitSelf || hitWall) {
    reset();
    return;
  }

  state.snake.unshift(next);
  if (next.x === state.food.x && next.y === state.food.y) {
    state.score += 1;
    state.food = spawnFood(state.snake, state.walls);
  } else {
    state.snake.pop();
  }
};

const draw = (ctx, state) => {
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.strokeRect(1, 1, cols * cell - 2, rows * cell - 2);

  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  for (const w of state.walls) {
    ctx.fillRect(w.x * cell, w.y * cell, cell - 2, cell - 2);
  }

  ctx.fillStyle = 'rgba(124, 209, 255, 0.25)';
  for (let i = 0; i < state.snake.length; i += 1) {
    const part = state.snake[i];
    ctx.fillRect(part.x * cell, part.y * cell, cell - 2, cell - 2);
  }
  ctx.fillStyle = '#ff6b4a';
  ctx.fillRect(state.food.x * cell, state.food.y * cell, cell - 2, cell - 2);
  ctx.fillStyle = 'rgba(246,244,240,0.7)';
  ctx.font = '12px IBM Plex Mono';
  ctx.fillText('Score: ' + state.score + '  Best: ' + state.best, 12, 18);
};

return { tick, draw };`,p="aesthetic-editor",h="aesthetic-snake-best",w=document.querySelector("#app");if(!w)throw new Error("App container not found");w.innerHTML=`
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
`;const r=document.querySelector("[data-editor]"),g=document.querySelector("[data-reset-code]"),k=document.querySelector("[data-save]"),v=document.querySelector("[data-reset]"),i=document.querySelector("[data-status]"),x=document.querySelector("[data-canvas]");if(!r||!g||!k||!v||!i||!x)throw new Error("Editor controls not found");const b=x.getContext("2d");if(!b)throw new Error("Canvas context not found");const u={keys:new Set,justPressed:new Set},S={bounds:{w:x.width,h:x.height}};let l={...S},d={};const W=Number(localStorage.getItem(h)??"0"),y=(e,t)=>{const s=e.match(new RegExp(String.raw`(?:let|const)\s+${t}\s*=\s*([0-9.]+)`,"i"));if(!s)return null;const a=Number(s[1]);return Number.isFinite(a)?a:null},A=e=>{const t=y(e,"cell"),s=y(e,"speedBase"),a=y(e,"speedMin");return!(t===null||s===null||a===null||t<12||t>40||s<3||s>20||a<2||a>s)},C=()=>{const e=localStorage.getItem(p);if(e&&A(e)){r.value=e,i.textContent="Загружено из сохранения";return}r.value=c,localStorage.setItem(p,c)},B=e=>e.replace(/[\u2028\u2029]/g,`
`).replace(/[\u200B-\u200D\u2060\uFEFF]/g,"").replace(/\u00A0/g," ").replace(/[“”]/g,'"').replace(/[‘’]/g,"'"),m=()=>{try{const e=B(r.value);e!==r.value&&(r.value=e),d=new Function("state","input",e)(l,u)??{},typeof l.best=="number"&&localStorage.setItem(h,String(l.best)),i.textContent="Код запущен"}catch(e){const t=e instanceof Error?e.message:"Ошибка выполнения";if(i.textContent=`Ошибка: ${t}`,d={},r.value!==c){r.value=c,localStorage.setItem(p,c),i.textContent="Ошибка в коде, восстановлен шаблон";try{d=new Function("state","input",c)(l,u)??{}}catch{}}}},L=()=>{l={...S},i.textContent="Сброшено",m()};C();l.best=W;m();k.addEventListener("click",()=>{localStorage.setItem(p,r.value),i.textContent="Код сохранён локально",m()});g.addEventListener("click",()=>{r.value=c,localStorage.setItem(p,c),i.textContent="Шаблон восстановлен",m()});v.addEventListener("click",L);window.addEventListener("keydown",e=>{const t=e.key==="ArrowUp"||e.key==="ArrowDown"||e.key==="ArrowLeft"||e.key==="ArrowRight",s=e.target,a=s&&(s.tagName==="TEXTAREA"||s.tagName==="INPUT"||s.isContentEditable);t&&!a&&e.preventDefault(),u.keys.add(e.key),u.justPressed.add(e.key)},{passive:!1});window.addEventListener("keyup",e=>{u.keys.delete(e.key)});const M=()=>{b.clearRect(0,0,x.width,x.height),d.tick&&d.tick(l,u),d.draw&&d.draw(b,l),typeof l.best=="number"&&localStorage.setItem(h,String(l.best)),u.justPressed.clear(),requestAnimationFrame(M)};M();const E=new IntersectionObserver(e=>{e.forEach(t=>{t.isIntersecting&&(t.target.classList.add("is-visible"),E.unobserve(t.target))})},{threshold:.2});document.querySelectorAll(".reveal").forEach(e=>{E.observe(e)});
