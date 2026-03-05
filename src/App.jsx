import { useState, useEffect, useRef, useCallback } from "react";
import {
  Trash2, Plus, Bell, CheckCircle2, UtensilsCrossed, BarChart2,
  Settings, ListTodo, Clock, RefreshCw, Flame, Snowflake, Brain,
  Send, AlertCircle, BookOpen, Search, BookMarked, Camera,
  Play, Pause, RotateCcw, Leaf, Wind, Sparkles,
} from "lucide-react";

/* ─── CONSTANTS ─────────────────────────────────────────── */
const PHRASES = [
  "Сьогодні — ідеальний день, щоб стати кращою версією себе.",
  "Не чекай натхнення — дій, і воно прийде само.",
  "Великі справи починаються з маленьких рішень.",
  "Зроби сьогодні те, за що завтра скажеш собі дякую.",
  "Твій єдиний конкурент — вчорашня версія тебе.",
  "Дискомфорт сьогодні — це зростання завтра.",
  "Не шукай ідеального моменту — створюй його.",
  "Успіх — це сума щоденних маленьких зусиль.",
  "Ти сильніший, ніж думаєш, і здатний на більше, ніж уявляєш.",
  "Кожен крок вперед — це перемога, навіть якщо він маленький.",
  "Твоя наполегливість — твоя суперсила.",
  "Найкращі інвестиції — це інвестиції у власний розвиток.",
  "Прокидайся з думкою: сьогодні я зроблю щось важливе.",
  "Ти не можеш контролювати все, але можеш контролювати свої дії.",
  "Кожне ранкове рішення формує весь твій день.",
];

const MEAL_META = {
  breakfast: { label: "Сніданок", emoji: "🌅", defaultTime: "08:00" },
  lunch:     { label: "Обід",     emoji: "☀️",  defaultTime: "13:00" },
  dinner:    { label: "Вечеря",   emoji: "🌙",  defaultTime: "19:00" },
};

const ENERGY_OPTIONS = [
  { val: "100", label: "💚 100%", color: "#22c55e", bg: "#052e16", border: "#16a34a" },
  { val: "50",  label: "💛 50%",  color: "#eab308", bg: "#422006", border: "#ca8a04" },
  { val: "20",  label: "❤️ 20%",  color: "#ef4444", bg: "#450a0a", border: "#dc2626" },
];

const FOOD_TAGS = [
  { val: "green",  label: "🟢 Корисна",   color: "#22c55e", bg: "#052e16" },
  { val: "yellow", label: "🟡 Компроміс", color: "#eab308", bg: "#422006" },
  { val: "red",    label: "🔴 Шкідлива",  color: "#ef4444", bg: "#450a0a" },
];

const SYSTEM_PROMPT = `Ти — емпатичний, мудрий життєвий ментор та психолог. Твоя мета — підтримувати користувача, допомагати йому тримати дисципліну, аналізувати причини ліні чи вигоряння, і давати короткі, дієві поради. Спілкуйся виключно українською мовою, будь дружнім і теплим, але не пиши занадто довгі тексти — максимум 3-4 речення у відповіді.`;

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const fmtTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
const fmtTotalTime = (s) => {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h} год ${m} хв` : `${m} хв`;
};

const TIMER_PRESETS = [5, 10, 20];
const CIRC = 2 * Math.PI * 80;

const s = {
  wrap:   { minHeight: "100vh", backgroundColor: "#030712", color: "#f1f5f9", fontFamily: "system-ui,sans-serif" },
  header: { position: "sticky", top: 0, zIndex: 20, backgroundColor: "#0f172a", borderBottom: "1px solid #1e293b", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  card:   { backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: 14, padding: 16 },
  input:  { backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" },
  btn:    { backgroundColor: "#7c3aed", border: "none", borderRadius: 12, padding: "12px 0", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", width: "100%" },
  label:  { fontSize: 13, color: "#94a3b8", margin: "0 0 6px", display: "block" },
  h2:     { fontSize: 18, fontWeight: 700, margin: "0 0 4px" },
};

/* ─── MAIN APP ──────────────────────────────────────────── */
export default function App() {
  // Core
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [tab, setTab] = useState("tasks");
  const [energy, setEnergy] = useState(null);
  const [streak, setStreak] = useState(3);
  const [frozenThisWeek, setFrozenThisWeek] = useState(false);
  const [notifTime, setNotifTime] = useState("08:00");
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [meals, setMeals] = useState(
    Object.fromEntries(Object.entries(MEAL_META).map(([k, v]) => [k, { time: v.defaultTime, recipe: null }]))
  );
  // Track which meal is currently generating a recipe
  const [isGeneratingRecipe, setIsGeneratingRecipe] = useState({
    breakfast: false,
    lunch: false,
    dinner: false,
  });
  const [foodLogs, setFoodLogs] = useState([]);
  const [foodInput, setFoodInput] = useState("");
  const [foodTag, setFoodTag] = useState("green");
  const [toast, setToast] = useState(null);

  // Mentor
  const DEFAULT_KEY = "Твій_ключ";
  const [groqKey, setGroqKey] = useState(DEFAULT_KEY);
  const [showKey, setShowKey] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { role: "assistant", content: "Привіт! 👋 Я твій особистий ментор. Розкажи мені, як твій день? Є щось, що тебе турбує або в чому потрібна підтримка?" },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);

  // Reading
  const [readPages, setReadPages] = useState(0);
  const [readGoal, setReadGoal] = useState(20);
  const [books, setBooks] = useState([]);
  const [bookInput, setBookInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isScanningBook, setIsScanningBook] = useState(false);
  const [scanPreview, setScanPreview] = useState(null);

  // Yoga
  const [yogaSelectedMin, setYogaSelectedMin] = useState(10);
  const [yogaRemainSec, setYogaRemainSec] = useState(10 * 60);
  const [yogaRunning, setYogaRunning] = useState(false);
  const [yogaTotalTime, setYogaTotalTime] = useState(0);
  const [yogaPractice, setYogaPractice] = useState(null);
  const [yogaLoadingPractice, setYogaLoadingPractice] = useState(false);
  const [breathPhase, setBreathPhase] = useState("inhale");

  const fired = useRef({});
  const toastTimer = useRef(null);
  const chatEndRef = useRef(null);
  const cameraInputRef = useRef(null);
  const yogaIntervalRef = useRef(null);
  const breathIntervalRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatHistory, isTyping]);

  const showToast = useCallback((msg) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  // Notifications
  useEffect(() => {
    if (!notifEnabled) return;
    const tick = () => {
      const now = new Date();
      const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const k = `${now.toDateString()}_${hhmm}`;
      if (hhmm === notifTime && !fired.current[k]) {
        fired.current[k] = true;
        new Notification("Доброго ранку! ☀️", { body: rand(PHRASES) });
      }
    };
    const iv = setInterval(tick, 30000); tick();
    return () => clearInterval(iv);
  }, [notifEnabled, notifTime]);

  // ── Yoga timer countdown ──
  useEffect(() => {
    if (yogaRunning) {
      yogaIntervalRef.current = setInterval(() => {
        setYogaRemainSec((prev) => {
          if (prev <= 1) {
            clearInterval(yogaIntervalRef.current);
            setYogaRunning(false);
            setYogaTotalTime((t) => t + yogaSelectedMin * 60);
            showToast("🧘 Сесію завершено! Чудова практика!");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(yogaIntervalRef.current);
    }
    return () => clearInterval(yogaIntervalRef.current);
  }, [yogaRunning]);

  // ── Breathing phase toggle every 4s ──
  useEffect(() => {
    breathIntervalRef.current = setInterval(() => {
      setBreathPhase((p) => (p === "inhale" ? "exhale" : "inhale"));
    }, 4000);
    return () => clearInterval(breathIntervalRef.current);
  }, []);

  // ── Yoga helpers ──
  const selectYogaPreset = (min) => {
    if (yogaRunning) return;
    setYogaSelectedMin(min);
    setYogaRemainSec(min * 60);
  };

  const toggleYogaTimer = () => {
    if (yogaRemainSec === 0) return;
    setYogaRunning((r) => !r);
  };

  const resetYogaTimer = () => {
    setYogaRunning(false);
    setYogaRemainSec(yogaSelectedMin * 60);
  };

  const generateYogaPractice = async () => {
    if (!groqKey || groqKey === "Твій_ключ") {
      showToast("⚠️ Потрібен Groq API ключ у Налаштуваннях");
      return;
    }
    setYogaLoadingPractice(true);
    setYogaPractice(null);
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKey}` },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          max_tokens: 200,
          messages: [
            { role: "system", content: "Ти — інструктор йоги. Відповідай ТІЛЬКИ українською мовою. Давай стислі, практичні рекомендації." },
            { role: "user", content: "Дай мені рівно 3 пози або поради для сьогоднішньої йога-практики. Формат: кожна порада — окремий рядок, починається з емодзі, максимум 20 слів. Без вступу і висновків." },
          ],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || `Помилка ${res.status}`);
      const raw = data.choices?.[0]?.message?.content?.trim() || "";
      const lines = raw.split("\n").filter((l) => l.trim()).slice(0, 3);
      setYogaPractice(lines);
    } catch (err) {
      showToast(`❌ Помилка: ${err.message}`);
    } finally {
      setYogaLoadingPractice(false);
    }
  };

  // ── AI Recipe Generator ──
  const generateRecipe = async (mealKey) => {
    if (!groqKey || groqKey === "Твій_ключ") {
      showToast("⚠️ Потрібен Groq API ключ у Налаштуваннях");
      return;
    }
    setIsGeneratingRecipe((prev) => ({ ...prev, [mealKey]: true }));
    // Clear previous recipe while loading
    setMeals((prev) => ({ ...prev, [mealKey]: { ...prev[mealKey], recipe: null } }));
    try {
      const mealLabel = MEAL_META[mealKey].label;
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKey}` },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          max_tokens: 400,
          messages: [
            {
              role: "system",
              content: "Ти — шеф-кухар здорового харчування. Відповідай ТІЛЬКИ валідним JSON без будь-якого додаткового тексту, markdown або пояснень.",
            },
            {
              role: "user",
              content: `Придумай корисний рецепт на ${mealLabel}. Надай відповідь строго у форматі JSON: { "name": "Назва", "emoji": "🍎", "time": "Х хв", "ing": ["інгредієнт 1", "інгредієнт 2", "інгредієнт 3"], "steps": "опис приготування у 2-3 реченнях" }. Мова: українська. Тільки JSON, без додаткового тексту.`,
            },
          ],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || `Помилка ${res.status}`);
      const raw = data.choices?.[0]?.message?.content?.trim() || "";
      // Strip markdown code fences if present
      const cleaned = raw.replace(/```json|```/g, "").trim();
      const recipe = JSON.parse(cleaned);
      setMeals((prev) => ({ ...prev, [mealKey]: { ...prev[mealKey], recipe } }));
    } catch (err) {
      showToast("❌ Не вдалося отримати рецепт. Спробуй ще раз.");
    } finally {
      setIsGeneratingRecipe((prev) => ({ ...prev, [mealKey]: false }));
    }
  };

  // SVG circle progress
  const yogaTotalSec = yogaSelectedMin * 60;
  const yogaProgress = yogaTotalSec > 0 ? (yogaRemainSec / yogaTotalSec) : 1;
  const strokeDash = CIRC * yogaProgress;

  // Tasks
  const addTask = () => {
    if (!input.trim()) return;
    setTasks((p) => [...p, { id: Date.now(), text: input.trim(), completed: false, isFrog: false, createdAt: new Date().toISOString() }]);
    setInput("");
  };
  const toggleTask = (id) => {
    setTasks((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
      const task = updated.find((t) => t.id === id);
      if (task.completed && task.text.toLowerCase().includes("ши-тцу")) {
        const exists = updated.some((t) => t.text === "Випити склянку води");
        if (!exists) {
          setTimeout(() => {
            setTasks((p) => [...p, { id: Date.now() + 1, text: "Випити склянку води", completed: false, isFrog: false, createdAt: new Date().toISOString() }]);
            showToast("🔗 Якірна звичка: додано «Випити склянку води»!");
          }, 300);
        }
      }
      if (task.completed && task.isFrog) { setStreak((s) => s + 1); showToast("🔥 Жабу з'їдено! Стрик +1"); }
      return updated;
    });
  };
  const deleteTask = (id) => setTasks((p) => p.filter((t) => t.id !== id));
  const setFrog = (id) => setTasks((p) => p.map((t) => ({ ...t, isFrog: t.id === id ? !t.isFrog : false })));
  const sortedTasks = [...tasks].sort((a, b) => (b.isFrog ? 1 : 0) - (a.isFrog ? 1 : 0));
  const completed = tasks.filter((t) => t.completed).length;
  const total = tasks.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Food
  const foodStats = FOOD_TAGS.map((ft) => ({ ...ft, count: foodLogs.filter((l) => l.tag === ft.val).length }));
  const addFoodLog = () => {
    if (!foodInput.trim()) return;
    setFoodLogs((p) => [...p, { id: Date.now(), name: foodInput.trim(), tag: foodTag }]);
    setFoodInput("");
  };

  // Mentor
  const sendMessage = async () => {
    const text = chatInput.trim();
    if (!text || isTyping) return;
    setChatInput("");
    const userMsg = { role: "user", content: text };
    const newHistory = [...chatHistory, userMsg];
    setChatHistory(newHistory);
    setIsTyping(true);
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKey}` },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "system", content: SYSTEM_PROMPT }, ...newHistory.map((m) => ({ role: m.role, content: m.content }))],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || `Помилка ${res.status}`);
      setChatHistory((p) => [...p, { role: "assistant", content: data.choices?.[0]?.message?.content || "..." }]);
    } catch (err) {
      setChatHistory((p) => [...p, { role: "assistant", content: `⚠️ Помилка: ${err.message}` }]);
    } finally { setIsTyping(false); }
  };
  const clearChat = () => {
    setChatHistory([{ role: "assistant", content: "Привіт! 👋 Я твій особистий ментор. Розкажи мені, як твій день?" }]);
    setClearConfirm(false);
    showToast("💬 Історію чату очищено");
  };

  // Books
  const addBook = () => {
    if (!bookInput.trim()) return;
    setBooks((p) => [...p, { id: Date.now(), title: bookInput.trim(), completed: false }]);
    setBookInput(""); setScanPreview(null);
  };
  const toggleBook = (id) => setBooks((p) => p.map((b) => (b.id === id ? { ...b, completed: !b.completed } : b)));
  const deleteBook = (id) => setBooks((p) => p.filter((b) => b.id !== id));
  const filteredBooks = books
    .filter((b) => b.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => Number(a.completed) - Number(b.completed));
  const readPct = readGoal > 0 ? Math.min(100, Math.round((readPages / readGoal) * 100)) : 0;

  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result.split(",")[1]);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
  const scanBookCover = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    if (!groqKey || groqKey === "Твій_ключ") { showToast("⚠️ Спочатку введи Groq API ключ у Налаштуваннях"); return; }
    setIsScanningBook(true); setScanPreview(null);
    try {
      const base64 = await fileToBase64(file);
      setScanPreview(`data:${file.type};base64,${base64}`);
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKey}` },
        body: JSON.stringify({
          model: "meta-llama/llama-4-scout-17b-16e-instruct", max_tokens: 100,
          messages: [{ role: "user", content: [{ type: "image_url", image_url: { url: `data:${file.type};base64,${base64}` } }, { type: "text", text: `Look at this book cover image. Extract and return ONLY the book title and author in this exact format: "Title by Author". If you cannot determine the title, return only the title without author. Do not add any explanation, quotes, or extra text.` }] }],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || `Помилка API ${res.status}`);
      const raw = data.choices?.[0]?.message?.content?.trim() || "";
      if (!raw) throw new Error("AI не зміг розпізнати обкладинку");
      setBookInput(raw);
      showToast(`📚 Розпізнано: ${raw}`);
    } catch (err) { showToast(`❌ Помилка сканування: ${err.message}`); setScanPreview(null); }
    finally { setIsScanningBook(false); }
  };

  const TABS = [
    { id: "tasks",    label: "Завдання",   Icon: ListTodo },
    { id: "stats",    label: "Статистика", Icon: BarChart2 },
    { id: "food",     label: "Їжа",        Icon: UtensilsCrossed },
    { id: "reading",  label: "Читання",    Icon: BookOpen },
    { id: "yoga",     label: "Йога",       Icon: Leaf },
    { id: "mentor",   label: "Ментор",     Icon: Brain },
    { id: "settings", label: "Налашт.",    Icon: Settings },
  ];

  /* ══════════════════════════════════════════════════════ RENDER */
  return (
    <div style={s.wrap}>
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={scanBookCover} />

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes pulse   { 0%,100%{opacity:.3;transform:scale(.8)} 50%{opacity:1;transform:scale(1.1)} }
        @keyframes breatheIn  { 0%{transform:scale(1);opacity:.5} 100%{transform:scale(1.35);opacity:1} }
        @keyframes breatheOut { 0%{transform:scale(1.35);opacity:1} 100%{transform:scale(1);opacity:.5} }
        @keyframes glowPulse  { 0%,100%{box-shadow:0 0 20px #10b98144} 50%{box-shadow:0 0 50px #10b98188} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)", zIndex: 999, backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 14, padding: "12px 20px", fontSize: 14, color: "#e2e8f0", whiteSpace: "nowrap", boxShadow: "0 8px 32px #0008" }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <header style={s.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>✅</span>
          <span style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>DayTracker</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {energy && <span style={{ fontSize: 12, backgroundColor: "#1e293b", padding: "3px 8px", borderRadius: 8, color: "#94a3b8" }}>{ENERGY_OPTIONS.find((e) => e.val === energy)?.label}</span>}
          <div style={{ display: "flex", alignItems: "center", gap: 4, backgroundColor: "#1e293b", padding: "3px 10px", borderRadius: 8 }}>
            <Flame size={14} color="#f97316" />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#f97316" }}>{streak}</span>
          </div>
          {yogaTotalTime > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, backgroundColor: "#052e16", padding: "3px 10px", borderRadius: 8 }}>
              <Leaf size={13} color="#10b981" />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#10b981" }}>{fmtTotalTime(yogaTotalTime)}</span>
            </div>
          )}
          {notifEnabled && <Bell size={15} color="#a78bfa" />}
        </div>
      </header>

      {/* Tabs */}
      <div style={{ display: "flex", backgroundColor: "#0f172a", borderBottom: "1px solid #1e293b", overflowX: "auto" }}>
        {TABS.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setTab(id)} style={{ flex: "0 0 auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, padding: "9px 12px", fontSize: 10, fontWeight: 500, border: "none", cursor: "pointer", background: "transparent", color: tab === id ? (id === "yoga" ? "#10b981" : "#a78bfa") : "#64748b", borderBottom: tab === id ? `2px solid ${id === "yoga" ? "#10b981" : "#a78bfa"}` : "2px solid transparent", whiteSpace: "nowrap" }}>
            <Icon size={15} />{label}
          </button>
        ))}
      </div>

      <main style={{ maxWidth: 520, margin: "0 auto", padding: "16px 14px 90px" }}>

        {/* ══ TASKS ══ */}
        {tab === "tasks" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={s.card}>
              <p style={{ margin: "0 0 10px", fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>⚡ Твій рівень енергії сьогодні?</p>
              <div style={{ display: "flex", gap: 8 }}>
                {ENERGY_OPTIONS.map((opt) => (
                  <button key={opt.val} onClick={() => { setEnergy(opt.val); showToast(`Рівень енергії: ${opt.label}`); }} style={{ flex: 1, border: `2px solid ${energy === opt.val ? opt.color : "#1e293b"}`, backgroundColor: energy === opt.val ? opt.bg : "#1e293b", borderRadius: 10, padding: "9px 4px", color: energy === opt.val ? opt.color : "#64748b", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTask()} placeholder="Нове завдання..." style={{ flex: 1, backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 14, padding: "13px 16px", color: "#fff", fontSize: 15, outline: "none" }} />
              <button onClick={addTask} style={{ backgroundColor: "#7c3aed", border: "none", borderRadius: 14, padding: "13px 18px", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center" }}><Plus size={22} /></button>
            </div>
            {tasks.length === 0 ? (
              <div style={{ textAlign: "center", padding: "50px 0", color: "#475569" }}>
                <CheckCircle2 size={48} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
                <p style={{ fontSize: 14 }}>Список порожній. Додай перше завдання!</p>
              </div>
            ) : (
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {sortedTasks.map((task) => (
                  <li key={task.id} style={{ backgroundColor: task.isFrog ? "#0d0a1a" : "#0f172a", border: task.isFrog ? "1.5px solid #7c3aed" : "1px solid #1e293b", boxShadow: task.isFrog ? "0 0 12px #7c3aed44" : "none", borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, opacity: task.completed ? 0.55 : 1 }}>
                    {task.isFrog && <span style={{ fontSize: 16, flexShrink: 0 }}>🐸</span>}
                    <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task.id)} style={{ width: 19, height: 19, accentColor: "#7c3aed", cursor: "pointer", flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: 15, color: task.completed ? "#475569" : "#e2e8f0", textDecoration: task.completed ? "line-through" : "none" }}>{task.text}</span>
                    <button onClick={() => setFrog(task.id)} style={{ background: "none", border: "none", cursor: "pointer", color: task.isFrog ? "#a78bfa" : "#334155", padding: 3, fontSize: 14 }}>🐸</button>
                    <button onClick={() => deleteTask(task.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#334155", padding: 3, display: "flex" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")} onMouseLeave={(e) => (e.currentTarget.style.color = "#334155")}><Trash2 size={16} /></button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* ══ STATS ══ */}
        {tab === "stats" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <h2 style={s.h2}>📊 Статистика дня</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[{ label: "Всього", val: total, color: "#a78bfa" }, { label: "Виконано", val: completed, color: "#34d399" }, { label: "Залишилось", val: total - completed, color: "#fbbf24" }, { label: "Прогрес", val: `${pct}%`, color: "#60a5fa" }].map(({ label, val, color }) => (
                <div key={label} style={{ ...s.card, textAlign: "center" }}>
                  <p style={{ fontSize: 30, fontWeight: 800, color, margin: "0 0 4px" }}>{val}</p>
                  <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>{label}</p>
                </div>
              ))}
            </div>
            <div style={s.card}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#94a3b8", marginBottom: 8 }}>
                <span>Прогрес завдань</span><span style={{ fontWeight: 600, color: "#a78bfa" }}>{pct}%</span>
              </div>
              <div style={{ backgroundColor: "#1e293b", borderRadius: 99, height: 10, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#7c3aed,#34d399)", borderRadius: 99, transition: "width .5s" }} />
              </div>
            </div>
            <div style={{ ...s.card, border: "1px solid #f97316", display: "flex", alignItems: "center", gap: 14 }}>
              <Flame size={40} color="#f97316" />
              <div>
                <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#f97316" }}>{streak} {streak === 1 ? "день" : "днів"}</p>
                <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>Стрик виконання Жаби</p>
              </div>
            </div>
            {yogaTotalTime > 0 && (
              <div style={{ ...s.card, border: "1px solid #10b981", display: "flex", alignItems: "center", gap: 14 }}>
                <Leaf size={36} color="#10b981" />
                <div>
                  <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#10b981" }}>{fmtTotalTime(yogaTotalTime)}</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>Загальний час йоги</p>
                </div>
              </div>
            )}
            {completed > 0 && (
              <div style={s.card}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", margin: "0 0 10px" }}>✅ Виконані завдання</p>
                {tasks.filter((t) => t.completed).map((t) => (
                  <p key={t.id} style={{ margin: "0 0 5px", fontSize: 13, color: "#475569", textDecoration: "line-through" }}>{t.isFrog && "🐸 "}{t.text}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ FOOD ══ */}
        {tab === "food" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <h2 style={s.h2}>🍽️ Харчування</h2>

            {/* Traffic light */}
            <div style={s.card}>
              <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 600, color: "#94a3b8" }}>🚦 Світлофор харчування</p>
              {foodLogs.length === 0 ? (
                <p style={{ margin: 0, fontSize: 13, color: "#475569", textAlign: "center", padding: "10px 0" }}>Ще немає записів.</p>
              ) : (
                <>
                  <div style={{ display: "flex", height: 14, borderRadius: 99, overflow: "hidden", marginBottom: 10, gap: 2 }}>
                    {foodStats.map((ft) => ft.count > 0 && <div key={ft.val} style={{ flex: ft.count, backgroundColor: ft.color, borderRadius: 99 }} />)}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {foodStats.map((ft) => (
                      <div key={ft.val} style={{ flex: 1, textAlign: "center", backgroundColor: ft.bg, borderRadius: 10, padding: "8px 4px", border: `1px solid ${ft.color}33` }}>
                        <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: ft.color }}>{ft.count}</p>
                        <p style={{ margin: 0, fontSize: 10, color: ft.color, opacity: 0.8 }}>{ft.label.split(" ")[1]}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Add food log */}
            <div style={s.card}>
              <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 600, color: "#94a3b8" }}>➕ Додати прийом їжі</p>
              <input value={foodInput} onChange={(e) => setFoodInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addFoodLog()} placeholder="Що ти їв(ла)?" style={{ ...s.input, marginBottom: 10 }} />
              <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                {FOOD_TAGS.map((ft) => (
                  <button key={ft.val} onClick={() => setFoodTag(ft.val)} style={{ flex: 1, padding: "8px 4px", borderRadius: 10, border: `2px solid ${foodTag === ft.val ? ft.color : "#1e293b"}`, backgroundColor: foodTag === ft.val ? ft.bg : "#1e293b", color: foodTag === ft.val ? ft.color : "#64748b", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{ft.label}</button>
                ))}
              </div>
              <button onClick={addFoodLog} style={{ ...s.btn, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><Plus size={15} />Додати</button>
            </div>

            {/* Food log list */}
            {foodLogs.length > 0 && (
              <div style={s.card}>
                <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 600, color: "#94a3b8" }}>📋 Сьогодні</p>
                {foodLogs.map((log) => {
                  const tag = FOOD_TAGS.find((t) => t.val === log.tag);
                  return (
                    <div key={log.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: tag.bg, border: `1px solid ${tag.color}44`, borderRadius: 10, padding: "10px 12px", marginBottom: 6 }}>
                      <span style={{ fontSize: 14, color: "#e2e8f0" }}>{log.name}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 11, color: tag.color, fontWeight: 600, padding: "2px 8px", borderRadius: 6, border: `1px solid ${tag.color}` }}>{tag.label}</span>
                        <button onClick={() => setFoodLogs((p) => p.filter((l) => l.id !== log.id))} style={{ background: "none", border: "none", cursor: "pointer", color: "#475569", display: "flex" }}><Trash2 size={14} /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── AI Recipe cards per meal ── */}
            {Object.entries(MEAL_META).map(([meal, meta]) => {
              const rec = meals[meal].recipe;
              const isLoading = isGeneratingRecipe[meal];
              const hasKey = groqKey && groqKey !== "Твій_ключ";

              return (
                <div key={meal} style={s.card}>
                  {/* Meal header with time picker */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <span style={{ fontSize: 15, fontWeight: 700 }}>{meta.emoji} {meta.label}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Clock size={13} color="#64748b" />
                      <input type="time" value={meals[meal].time} onChange={(e) => setMeals((p) => ({ ...p, [meal]: { ...p[meal], time: e.target.value } }))} style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 8, padding: "5px 9px", color: "#fff", fontSize: 12, outline: "none" }} />
                    </div>
                  </div>

                  {/* Generate button */}
                  <button
                    onClick={() => generateRecipe(meal)}
                    disabled={isLoading}
                    style={{
                      width: "100%",
                      border: isLoading ? "1px solid #7c3aed44" : "1px solid #334155",
                      borderRadius: 10,
                      padding: "10px 0",
                      color: isLoading ? "#a78bfa" : "#94a3b8",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: isLoading ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      transition: "all .2s",
                      // Shimmer effect while loading
                      background: isLoading
                        ? "linear-gradient(90deg, #1e293b 25%, #2d1f6e 50%, #1e293b 75%)"
                        : "#1e293b",
                      backgroundSize: isLoading ? "200% auto" : "auto",
                      animation: isLoading ? "shimmer 1.5s linear infinite" : "none",
                    }}
                  >
                    <RefreshCw size={13} style={{ animation: isLoading ? "spin 1s linear infinite" : "none" }} />
                    {isLoading
                      ? "Шеф готує..."
                      : rec
                      ? "Інший рецепт від AI"
                      : hasKey
                      ? "✨ Отримати AI-рецепт"
                      : "Отримати рецепт (потрібен API ключ)"}
                  </button>

                  {/* No key hint */}
                  {!hasKey && !rec && (
                    <p style={{ margin: "8px 0 0", fontSize: 11, color: "#475569", textAlign: "center" }}>
                      ⚙️ Додай Groq API ключ у Налаштуваннях, щоб генерувати рецепти
                    </p>
                  )}

                  {/* Recipe card */}
                  {rec && !isLoading && (
                    <div style={{ marginTop: 12, backgroundColor: "#020617", borderRadius: 10, padding: 14 }}>
                      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                        <span style={{ fontSize: 24, flexShrink: 0 }}>{rec.emoji}</span>
                        <div>
                          <p style={{ margin: 0, fontWeight: 700, color: "#fff", fontSize: 15 }}>{rec.name}</p>
                          <p style={{ margin: "2px 0 0", fontSize: 11, color: "#64748b" }}>⏱ {rec.time}</p>
                        </div>
                      </div>
                      <p style={{ margin: "0 0 4px", fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 1 }}>Інгредієнти</p>
                      <p style={{ margin: "0 0 10px", fontSize: 12, color: "#94a3b8" }}>
                        {Array.isArray(rec.ing) ? rec.ing.join(" • ") : rec.ing}
                      </p>
                      <p style={{ margin: "0 0 4px", fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 1 }}>Приготування</p>
                      <p style={{ margin: 0, fontSize: 13, color: "#cbd5e1", lineHeight: 1.7 }}>{rec.steps}</p>
                    </div>
                  )}

                  {/* Skeleton while loading (recipe slot placeholder) */}
                  {isLoading && (
                    <div style={{ marginTop: 12, backgroundColor: "#020617", borderRadius: 10, padding: 14 }}>
                      <div style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "center" }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "#1e293b" }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ height: 14, backgroundColor: "#1e293b", borderRadius: 6, marginBottom: 6, width: "60%" }} />
                          <div style={{ height: 10, backgroundColor: "#1e293b", borderRadius: 6, width: "30%" }} />
                        </div>
                      </div>
                      <div style={{ height: 10, backgroundColor: "#1e293b", borderRadius: 6, marginBottom: 8, width: "40%" }} />
                      <div style={{ height: 10, backgroundColor: "#1e293b", borderRadius: 6, marginBottom: 4 }} />
                      <div style={{ height: 10, backgroundColor: "#1e293b", borderRadius: 6, width: "80%" }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ══ READING ══ */}
        {tab === "reading" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <h2 style={s.h2}>📖 Читання</h2>
            <div style={s.card}>
              <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 600, color: "#94a3b8" }}>📄 Трекер сторінок сьогодні</p>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <button onClick={() => setReadPages((p) => Math.max(0, p - 1))} style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid #334155", backgroundColor: "#1e293b", color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                <div style={{ flex: 1, textAlign: "center" }}>
                  <p style={{ margin: 0, fontSize: 36, fontWeight: 800, color: "#a78bfa" }}>{readPages}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>з {readGoal} сторінок</p>
                </div>
                <button onClick={() => setReadPages((p) => p + 1)} style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid #7c3aed", backgroundColor: "#7c3aed", color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
              </div>
              <div style={{ backgroundColor: "#1e293b", borderRadius: 99, height: 8, overflow: "hidden", marginBottom: 8 }}>
                <div style={{ height: "100%", width: `${readPct}%`, background: "linear-gradient(90deg,#7c3aed,#a78bfa)", borderRadius: 99, transition: "width .4s" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "#64748b" }}>{readPct}% виконано</span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 12, color: "#64748b" }}>Мета:</span>
                  <input type="number" value={readGoal} min={1} onChange={(e) => setReadGoal(Math.max(1, Number(e.target.value)))} style={{ width: 54, backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 8, padding: "4px 8px", color: "#fff", fontSize: 13, outline: "none", textAlign: "center" }} />
                  <span style={{ fontSize: 12, color: "#64748b" }}>стор.</span>
                </div>
              </div>
              {readPages >= readGoal && readGoal > 0 && (
                <div style={{ marginTop: 10, backgroundColor: "#052e16", border: "1px solid #16a34a", borderRadius: 10, padding: "8px 12px", fontSize: 13, color: "#86efac", textAlign: "center" }}>🎉 Ціль на сьогодні виконана!</div>
              )}
            </div>
            <div style={s.card}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <BookMarked size={18} color="#a78bfa" />
                <span style={{ fontWeight: 700, fontSize: 15, color: "#fff" }}>📚 Моя бібліотека</span>
                {books.length > 0 && <span style={{ marginLeft: "auto", fontSize: 12, backgroundColor: "#1e293b", padding: "2px 10px", borderRadius: 99, color: "#94a3b8" }}>{books.filter((b) => b.completed).length}/{books.length} прочитано</span>}
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <input value={bookInput} onChange={(e) => setBookInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addBook()} placeholder="Назва книги..." style={{ ...s.input }} />
                <button onClick={() => cameraInputRef.current?.click()} disabled={isScanningBook} style={{ backgroundColor: isScanningBook ? "#1e293b" : "#0f172a", border: `1px solid ${isScanningBook ? "#7c3aed" : "#334155"}`, borderRadius: 10, padding: "0 13px", cursor: isScanningBook ? "not-allowed" : "pointer", color: isScanningBook ? "#a78bfa" : "#64748b", display: "flex", alignItems: "center", flexShrink: 0 }}>
                  {isScanningBook ? <RefreshCw size={18} style={{ animation: "spin 1s linear infinite" }} /> : <Camera size={18} />}
                </button>
                <button onClick={addBook} disabled={!bookInput.trim()} style={{ backgroundColor: bookInput.trim() ? "#7c3aed" : "#1e293b", border: "none", borderRadius: 10, padding: "0 14px", cursor: bookInput.trim() ? "pointer" : "not-allowed", color: bookInput.trim() ? "#fff" : "#475569", display: "flex", alignItems: "center", flexShrink: 0 }}><Plus size={20} /></button>
              </div>
              {isScanningBook && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, backgroundColor: "#0d0a1a", border: "1px solid #7c3aed44", borderRadius: 10, padding: "10px 14px", marginBottom: 12 }}>
                  {scanPreview && <img src={scanPreview} alt="preview" style={{ width: 48, height: 64, objectFit: "cover", borderRadius: 6, flexShrink: 0 }} />}
                  <div>
                    <p style={{ margin: 0, fontSize: 13, color: "#a78bfa", fontWeight: 600 }}>🔍 AI читає обкладинку...</p>
                    <p style={{ margin: "2px 0 0", fontSize: 11, color: "#64748b" }}>Використовується Llama 4 Scout Vision</p>
                  </div>
                </div>
              )}
              {!isScanningBook && scanPreview && bookInput && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, backgroundColor: "#052e16", border: "1px solid #16a34a44", borderRadius: 10, padding: "10px 14px", marginBottom: 12 }}>
                  <img src={scanPreview} alt="preview" style={{ width: 40, height: 54, objectFit: "cover", borderRadius: 6, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>Розпізнано:</p>
                    <p style={{ margin: "2px 0 0", fontSize: 13, color: "#86efac", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{bookInput}</p>
                  </div>
                  <button onClick={() => { setScanPreview(null); setBookInput(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#475569", padding: 4 }}><Trash2 size={14} /></button>
                </div>
              )}
              {books.length > 0 && (
                <div style={{ position: "relative", marginBottom: 14 }}>
                  <Search size={15} color="#64748b" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Пошук книги..." style={{ ...s.input, paddingLeft: 36 }} />
                </div>
              )}
              {books.length === 0 ? (
                <div style={{ textAlign: "center", padding: "28px 0", color: "#475569" }}>
                  <BookOpen size={42} style={{ margin: "0 auto 10px", opacity: 0.25 }} />
                  <p style={{ fontSize: 13, margin: 0 }}>Бібліотека порожня.<br />Додай книгу або сфотографуй обкладинку 📷</p>
                </div>
              ) : filteredBooks.length === 0 ? (
                <p style={{ textAlign: "center", fontSize: 13, color: "#475569", padding: "16px 0", margin: 0 }}>Нічого не знайдено за запитом «{searchQuery}»</p>
              ) : (
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                  {filteredBooks.map((book) => (
                    <li key={book.id} style={{ display: "flex", alignItems: "center", gap: 10, backgroundColor: "#020617", border: `1px solid ${book.completed ? "#1e293b" : "#2d1f6e"}`, borderRadius: 12, padding: "11px 14px", opacity: book.completed ? 0.6 : 1 }}>
                      <input type="checkbox" checked={book.completed} onChange={() => toggleBook(book.id)} style={{ width: 18, height: 18, accentColor: "#7c3aed", cursor: "pointer", flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: 14, color: book.completed ? "#475569" : "#e2e8f0", textDecoration: book.completed ? "line-through" : "none", lineHeight: 1.4 }}>{book.completed ? "✅ " : "📘 "}{book.title}</span>
                      <button onClick={() => deleteBook(book.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#334155", padding: 3, display: "flex", flexShrink: 0 }} onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")} onMouseLeave={(e) => (e.currentTarget.style.color = "#334155")}><Trash2 size={15} /></button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* ══ YOGA ══ */}
        {tab === "yoga" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ ...s.h2, color: "#10b981", margin: 0 }}>🧘 Йога & Дихання</h2>
              {yogaTotalTime > 0 && (
                <span style={{ fontSize: 12, backgroundColor: "#052e16", border: "1px solid #10b98144", padding: "4px 12px", borderRadius: 99, color: "#10b981", fontWeight: 600 }}>
                  Всього: {fmtTotalTime(yogaTotalTime)}
                </span>
              )}
            </div>
            <div style={{ ...s.card, border: "1px solid #10b98133", background: "linear-gradient(160deg,#030f09,#0f172a)", textAlign: "center", padding: "28px 16px" }}>
              <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                <div style={{ position: "absolute", width: 190, height: 190, borderRadius: "50%", backgroundColor: "#10b98112", animation: `${breathPhase === "inhale" ? "breatheIn" : "breatheOut"} 4s ease-in-out forwards` }} />
                <div style={{ position: "absolute", width: 170, height: 170, borderRadius: "50%", backgroundColor: "#10b98120", animation: `${breathPhase === "inhale" ? "breatheIn" : "breatheOut"} 4s ease-in-out forwards`, animationDelay: "0.2s" }} />
                <svg width="200" height="200" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#1e293b" strokeWidth="6" />
                  <circle cx="100" cy="100" r="80" fill="none" stroke={yogaRemainSec === 0 ? "#34d399" : "#10b981"} strokeWidth="6" strokeLinecap="round" strokeDasharray={`${CIRC}`} strokeDashoffset={CIRC - strokeDash} style={{ transition: "stroke-dashoffset 1s linear" }} />
                </svg>
                <div style={{ position: "absolute", textAlign: "center" }}>
                  <p style={{ margin: 0, fontSize: 36, fontWeight: 800, color: yogaRemainSec === 0 ? "#34d399" : "#fff", letterSpacing: -1 }}>{yogaRemainSec === 0 ? "🎉" : fmtTime(yogaRemainSec)}</p>
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "#10b981", fontWeight: 600 }}>{yogaRemainSec === 0 ? "Завершено!" : breathPhase === "inhale" ? "🌬 Вдих..." : "💨 Видих..."}</p>
                </div>
              </div>
              <p style={{ margin: "0 0 16px", fontSize: 13, color: "#6b7280" }}>{yogaRunning ? "Практика триває · синхронізуй дихання з колом" : "Обери тривалість та натисни старт"}</p>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 16 }}>
                {TIMER_PRESETS.map((min) => (
                  <button key={min} onClick={() => selectYogaPreset(min)} disabled={yogaRunning} style={{ padding: "8px 18px", borderRadius: 99, fontSize: 13, fontWeight: 600, cursor: yogaRunning ? "not-allowed" : "pointer", border: `1.5px solid ${yogaSelectedMin === min && !yogaRunning ? "#10b981" : "#1e293b"}`, backgroundColor: yogaSelectedMin === min && !yogaRunning ? "#052e16" : "#1e293b", color: yogaSelectedMin === min && !yogaRunning ? "#10b981" : "#64748b", transition: "all .2s" }}>{min} хв</button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                <button onClick={resetYogaTimer} style={{ width: 48, height: 48, borderRadius: "50%", border: "1.5px solid #334155", backgroundColor: "#1e293b", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><RotateCcw size={18} /></button>
                <button onClick={toggleYogaTimer} disabled={yogaRemainSec === 0} style={{ width: 64, height: 64, borderRadius: "50%", border: "none", cursor: yogaRemainSec === 0 ? "not-allowed" : "pointer", background: yogaRemainSec === 0 ? "#1e293b" : "linear-gradient(135deg,#059669,#10b981)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: yogaRunning ? "0 0 24px #10b98166" : "none", transition: "box-shadow .3s" }}>{yogaRunning ? <Pause size={26} /> : <Play size={26} style={{ marginLeft: 3 }} />}</button>
                <div style={{ width: 48 }} />
              </div>
            </div>
            <div style={{ ...s.card, border: "1px solid #10b98133" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <Sparkles size={18} color="#10b981" />
                <span style={{ fontWeight: 700, fontSize: 15, color: "#fff" }}>AI-практика на сьогодні</span>
              </div>
              <button onClick={generateYogaPractice} disabled={yogaLoadingPractice} style={{ width: "100%", border: "none", borderRadius: 12, padding: "13px 0", background: yogaLoadingPractice ? "#1e293b" : "linear-gradient(135deg,#059669,#10b981)", color: yogaLoadingPractice ? "#64748b" : "#fff", fontWeight: 700, fontSize: 14, cursor: yogaLoadingPractice ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: yogaPractice ? 14 : 0 }}>
                {yogaLoadingPractice ? <><RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }} /> Генерую практику...</> : <><Sparkles size={16} /> Згенерувати практику</>}
              </button>
              {yogaPractice && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {yogaPractice.map((tip, i) => (
                    <div key={i} style={{ backgroundColor: "#020617", borderRadius: 12, padding: "12px 14px", borderLeft: "3px solid #10b981", display: "flex", alignItems: "flex-start", gap: 8 }}>
                      <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{["🌿", "🧘", "🌬"][i]}</span>
                      <p style={{ margin: 0, fontSize: 14, color: "#d1fae5", lineHeight: 1.5 }}>{tip.replace(/^[\p{Emoji}\s]+/u, "").trim()}</p>
                    </div>
                  ))}
                  <p style={{ margin: "4px 0 0", fontSize: 11, color: "#475569", textAlign: "center" }}>Натисни ще раз, щоб отримати нову практику ✨</p>
                </div>
              )}
              {!yogaPractice && !yogaLoadingPractice && (
                <p style={{ margin: "10px 0 0", fontSize: 12, color: "#475569", textAlign: "center" }}>
                  {(!groqKey || groqKey === "Твій_ключ") ? "⚙️ Потрібен Groq API ключ у Налаштуваннях" : "Натисни кнопку — AI підбере 3 пози спеціально для тебе"}
                </p>
              )}
            </div>
            <div style={{ ...s.card, border: "1px solid #10b98122", backgroundColor: "#030f09" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Wind size={16} color="#10b981" />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#10b981" }}>Техніка дихання 4-4-4</span>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>
                Вдихай <strong style={{ color: "#d1fae5" }}>4 сек</strong> → Затримай <strong style={{ color: "#d1fae5" }}>4 сек</strong> → Видихай <strong style={{ color: "#d1fae5" }}>4 сек</strong>. Коло вгорі допомагає синхронізувати ритм дихання з таймером.
              </p>
            </div>
          </div>
        )}

        {/* ══ MENTOR CHAT ══ */}
        {tab === "mentor" && !groqKey && (
          <div style={{ ...s.card, textAlign: "center", padding: "48px 24px" }}>
            <Brain size={52} color="#7c3aed" style={{ margin: "0 auto 16px", opacity: 0.7 }} />
            <p style={{ fontSize: 17, fontWeight: 700, color: "#fff", margin: "0 0 8px" }}>Ментор ще не підключений</p>
            <p style={{ fontSize: 14, color: "#94a3b8", margin: "0 0 24px", lineHeight: 1.6 }}>Щоб спілкуватися з ментором,<br />додайте свій Groq API ключ у Налаштуваннях.</p>
            <button onClick={() => setTab("settings")} style={{ ...s.btn, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: "auto", padding: "12px 28px" }}><Settings size={15} /> Відкрити налаштування</button>
          </div>
        )}
        {tab === "mentor" && groqKey && (
          <div style={{ display: "flex", flexDirection: "column", gap: 0, height: "calc(100vh - 140px)", maxHeight: 680 }}>
            <div style={{ ...s.card, borderRadius: "14px 14px 0 0", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center" }}><Brain size={20} color="#fff" /></div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#fff" }}>AI Ментор</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#22c55e" }}>● онлайн</p>
                </div>
              </div>
              {!clearConfirm ? (
                <button onClick={() => setClearConfirm(true)} style={{ background: "none", border: "1px solid #334155", borderRadius: 8, padding: "5px 10px", color: "#64748b", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}><Trash2 size={13} /> Очистити</button>
              ) : (
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={clearChat} style={{ background: "#7f1d1d", border: "1px solid #dc2626", borderRadius: 8, padding: "5px 10px", color: "#fca5a5", fontSize: 12, cursor: "pointer" }}>Так</button>
                  <button onClick={() => setClearConfirm(false)} style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, padding: "5px 10px", color: "#94a3b8", fontSize: 12, cursor: "pointer" }}>Ні</button>
                </div>
              )}
            </div>
            <div style={{ flex: 1, overflowY: "auto", backgroundColor: "#070d1a", border: "1px solid #1e293b", borderTop: "none", borderBottom: "none", padding: "16px 14px", display: "flex", flexDirection: "column", gap: 12 }}>
              {chatHistory.map((msg, i) => (
                <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 8 }}>
                  {msg.role === "assistant" && (
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginBottom: 2 }}><Brain size={13} color="#fff" /></div>
                  )}
                  <div style={{ maxWidth: "78%", padding: "10px 14px", borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", backgroundColor: msg.role === "user" ? "#7c3aed" : "#1e293b", color: "#f1f5f9", fontSize: 14, lineHeight: 1.6, boxShadow: msg.role === "user" ? "0 2px 8px #7c3aed44" : "none" }}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Brain size={13} color="#fff" /></div>
                  <div style={{ backgroundColor: "#1e293b", padding: "12px 16px", borderRadius: "16px 16px 16px 4px", display: "flex", gap: 5, alignItems: "center" }}>
                    {[0, 1, 2].map((i) => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: "#a78bfa", animation: `pulse 1.2s ${i * 0.2}s infinite` }} />)}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div style={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderTop: "none", borderRadius: "0 0 14px 14px", padding: "12px 14px", display: "flex", gap: 8, alignItems: "flex-end" }}>
              <textarea value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} placeholder="Напиши щось ментору... (Enter — надіслати)" rows={1} style={{ flex: 1, backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 12, padding: "11px 14px", color: "#fff", fontSize: 14, outline: "none", resize: "none", fontFamily: "system-ui,sans-serif", lineHeight: 1.5, maxHeight: 100, overflowY: "auto" }} />
              <button onClick={sendMessage} disabled={isTyping || !chatInput.trim()} style={{ backgroundColor: isTyping || !chatInput.trim() ? "#1e293b" : "#7c3aed", border: "none", borderRadius: 12, padding: "11px 14px", cursor: isTyping || !chatInput.trim() ? "not-allowed" : "pointer", color: isTyping || !chatInput.trim() ? "#475569" : "#fff", display: "flex", alignItems: "center", flexShrink: 0, transition: "all .2s" }}><Send size={18} /></button>
            </div>
          </div>
        )}

        {/* ══ SETTINGS ══ */}
        {tab === "settings" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <h2 style={s.h2}>⚙️ Налаштування</h2>
            <div style={s.card}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}><Bell size={18} color="#a78bfa" /><span style={{ fontWeight: 700, fontSize: 15 }}>Ранкові сповіщення</span></div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <span style={{ fontSize: 13, color: "#94a3b8" }}>Час сповіщення</span>
                <input type="time" value={notifTime} onChange={(e) => setNotifTime(e.target.value)} style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 8, padding: "7px 12px", color: "#fff", fontSize: 13, outline: "none" }} />
              </div>
              <button onClick={() => (async () => {
                if (!("Notification" in window)) return alert("Браузер не підтримує сповіщення");
                const p = await Notification.requestPermission();
                setNotifEnabled(p === "granted");
              })()} style={{ ...s.btn, backgroundColor: notifEnabled ? "#14532d" : "#7c3aed", color: notifEnabled ? "#86efac" : "#fff" }}>
                {notifEnabled ? "✅ Сповіщення увімкнено" : "🔔 Увімкнути сповіщення"}
              </button>
            </div>
            <div style={s.card}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}><Flame size={18} color="#f97316" /><span style={{ fontWeight: 700, fontSize: 15 }}>Стрик та Заморозка</span></div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, backgroundColor: "#1e293b", borderRadius: 12, padding: "12px 14px" }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, color: "#fff", fontSize: 15 }}>🔥 Поточний стрик</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94a3b8" }}>Виконуй Жабу щодня</p>
                </div>
                <span style={{ fontSize: 28, fontWeight: 800, color: "#f97316" }}>{streak}</span>
              </div>
              <button onClick={() => {
                if (frozenThisWeek) return showToast("❄️ Заморозка вже використана цього тижня");
                setFrozenThisWeek(true); showToast("❄️ День заморожено! Стрик збережено.");
              }} style={{ ...s.btn, border: `2px solid ${frozenThisWeek ? "#1e293b" : "#38bdf8"}`, backgroundColor: frozenThisWeek ? "#1e293b" : "#0c4a6e", color: frozenThisWeek ? "#475569" : "#38bdf8" }}>
                <Snowflake size={15} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
                {frozenThisWeek ? "Заморозка вже використана" : "❄️ Заморозити день (1× на тиждень)"}
              </button>
            </div>
            <div style={s.card}>
              <p style={{ margin: "0 0 10px", fontWeight: 700, fontSize: 15 }}>🔗 Якірні звички</p>
              <div style={{ backgroundColor: "#020617", borderRadius: 10, padding: 12, borderLeft: "3px solid #7c3aed" }}>
                <p style={{ margin: 0, fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>
                  Відмітити завдання з <strong style={{ color: "#a78bfa" }}>"ши-тцу"</strong> → автоматично з'явиться <strong style={{ color: "#34d399" }}>"Випити склянку води"</strong> 🐶
                </p>
              </div>
            </div>
            <div style={s.card}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}><Brain size={18} color="#a78bfa" /><span style={{ fontWeight: 700, fontSize: 15 }}>Groq API — AI Ментор & Сканер</span></div>
              <label style={s.label}>API Ключ (Groq)</label>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <input type={showKey ? "text" : "password"} value={groqKey} onChange={(e) => setGroqKey(e.target.value)} placeholder="gsk_..." style={{ ...s.input, fontFamily: "monospace", fontSize: 12, flex: 1 }} />
                <button onClick={() => setShowKey((p) => !p)} style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 10, padding: "0 13px", color: "#94a3b8", cursor: "pointer", fontSize: 12, flexShrink: 0 }}>{showKey ? "Сховати" : "Показати"}</button>
              </div>
              {groqKey && groqKey !== "Твій_ключ" ? (
                <div style={{ backgroundColor: "#052e16", border: "1px solid #16a34a", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                  <CheckCircle2 size={15} color="#22c55e" />
                  <p style={{ margin: 0, fontSize: 13, color: "#86efac" }}>Ключ збережено. Всі AI-функції активні!</p>
                </div>
              ) : (
                <div style={{ backgroundColor: "#450a0a", border: "1px solid #dc2626", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                  <AlertCircle size={15} color="#f87171" />
                  <p style={{ margin: 0, fontSize: 13, color: "#fca5a5" }}>Введи ключ для Ментора, сканера книг, рецептів та йога-практик</p>
                </div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}