import { useState, useEffect, useRef, useCallback } from "react";
import {
  Trash2,
  Plus,
  Bell,
  CheckCircle2,
  UtensilsCrossed,
  BarChart2,
  Settings,
  ListTodo,
  Clock,
  RefreshCw,
  Flame,
  Snowflake,
  Brain,
  Send,
  X,
  AlertCircle,
  ChevronRight,
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

const RECIPES = {
  breakfast: [
    {
      name: "Вівсянка з ягодами",
      emoji: "🥣",
      time: "15 хв",
      ing: ["вівсяні пластівці", "молоко", "ягоди", "мед", "горіхи"],
      steps: "Залий пластівці гарячим молоком 5 хв. Додай ягоди, полий медом.",
    },
    {
      name: "Авокадо-тост",
      emoji: "🥑",
      time: "20 хв",
      ing: ["хліб", "авокадо", "2 яйця", "лимон", "чилі"],
      steps: "Підсмаж хліб. Розімни авокадо. Зроби яйця пашот. Збери тост.",
    },
    {
      name: "Омлет з овочами",
      emoji: "🍳",
      time: "15 хв",
      ing: ["3 яйця", "перець", "помідор", "сир", "зелень"],
      steps: "Збий яйця. Обсмаж овочі, залий яйцями. Посип сиром.",
    },
    {
      name: "Сирники",
      emoji: "🧀",
      time: "25 хв",
      ing: ["сир 250г", "2 яйця", "борошно", "цукор", "ванілін"],
      steps: "Змішай інгредієнти. Обсмаж до золотистого. З джемом.",
    },
    {
      name: "Смузі-боул",
      emoji: "🍓",
      time: "10 хв",
      ing: ["ягоди", "банан", "йогурт", "чіа", "фрукти"],
      steps: "Збий у блендері. Вилий у миску, прикрась чіа.",
    },
  ],
  lunch: [
    {
      name: "Боул з куркою",
      emoji: "🥗",
      time: "30 хв",
      ing: ["курка 200г", "булгур", "огірок", "черрі", "хумус"],
      steps: "Відвари булгур. Обсмаж курку. Зібери боул.",
    },
    {
      name: "Крем-суп з гарбуза",
      emoji: "🎃",
      time: "40 хв",
      ing: ["гарбуз 500г", "цибуля", "часник", "кокосове молоко", "імбир"],
      steps: "Запечи гарбуз 25 хв. Збий із кокосовим молоком.",
    },
    {
      name: "Паста з лососем",
      emoji: "🍝",
      time: "25 хв",
      ing: ["паста 200г", "лосось 150г", "вершки", "часник", "шпинат"],
      steps: "Відвари пасту. Обсмаж лосось з вершками. Змішай.",
    },
    {
      name: "Шакшука",
      emoji: "🍅",
      time: "25 хв",
      ing: ["4 яйця", "помідори", "перець", "цибуля", "зіра"],
      steps: "Обсмаж овочі. Додай помідори. Вбий яйця, накрий 5 хв.",
    },
    {
      name: "Кіноа-салат",
      emoji: "🥙",
      time: "20 хв",
      ing: ["кіноа 80г", "нут", "авокадо", "огірок", "олія"],
      steps: "Відвари кіноа. Змішай з нутом та овочами.",
    },
  ],
  dinner: [
    {
      name: "Запечена сьомга",
      emoji: "🐟",
      time: "35 хв",
      ing: ["стейк 250г", "броколі", "перець", "часник", "лимон"],
      steps: "Замаринуй. Запікай при 200°C 20 хв з овочами.",
    },
    {
      name: "Курка теріякі",
      emoji: "🍱",
      time: "30 хв",
      ing: ["курка 250г", "теріякі", "рис", "кунжут", "цибуля"],
      steps: "Маринуй 15 хв. Обсмаж. Подавай з рисом.",
    },
    {
      name: "Гречка з грибами",
      emoji: "🍄",
      time: "25 хв",
      ing: ["гречка 150г", "печериці 200г", "цибуля", "часник", "масло"],
      steps: "Відвари гречку. Обсмаж цибулю та гриби. Змішай.",
    },
    {
      name: "Вегетаріанське карі",
      emoji: "🫘",
      time: "35 хв",
      ing: ["нут 400г", "кокосове молоко", "шпинат", "помідори", "каррі"],
      steps: "Обсмаж спеції. Додай кокосове молоко та нут. Туши 15 хв.",
    },
    {
      name: "Запіканка з індички",
      emoji: "🫕",
      time: "45 хв",
      ing: ["фарш 400г", "броколі 300г", "моцарела", "2 яйця", "вершки"],
      steps: "Обсмаж фарш. Змішай з броколі. Посип сиром. Запікай 25 хв.",
    },
  ],
};

const MEAL_META = {
  breakfast: { label: "Сніданок", emoji: "🌅", defaultTime: "08:00" },
  lunch: { label: "Обід", emoji: "☀️", defaultTime: "13:00" },
  dinner: { label: "Вечеря", emoji: "🌙", defaultTime: "19:00" },
};

const ENERGY_OPTIONS = [
  {
    val: "100",
    label: "💚 100%",
    color: "#22c55e",
    bg: "#052e16",
    border: "#16a34a",
  },
  {
    val: "50",
    label: "💛 50%",
    color: "#eab308",
    bg: "#422006",
    border: "#ca8a04",
  },
  {
    val: "20",
    label: "❤️ 20%",
    color: "#ef4444",
    bg: "#450a0a",
    border: "#dc2626",
  },
];

const FOOD_TAGS = [
  { val: "green", label: "🟢 Корисна", color: "#22c55e", bg: "#052e16" },
  { val: "yellow", label: "🟡 Компроміс", color: "#eab308", bg: "#422006" },
  { val: "red", label: "🔴 Шкідлива", color: "#ef4444", bg: "#450a0a" },
];

const SYSTEM_PROMPT = `Ти — емпатичний, мудрий життєвий ментор та психолог. Твоя мета — підтримувати користувача, допомагати йому тримати дисципліну, аналізувати причини ліні чи вигоряння, і давати короткі, дієві поради. Спілкуйся виключно українською мовою, будь дружнім і теплим, але не пиши занадто довгі тексти — максимум 3-4 речення у відповіді.`;

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

const s = {
  wrap: {
    minHeight: "100vh",
    backgroundColor: "#030712",
    color: "#f1f5f9",
    fontFamily: "system-ui,sans-serif",
  },
  header: {
    position: "sticky",
    top: 0,
    zIndex: 20,
    backgroundColor: "#0f172a",
    borderBottom: "1px solid #1e293b",
    padding: "10px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: 14,
    padding: 16,
  },
  input: {
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    borderRadius: 10,
    padding: "11px 14px",
    color: "#fff",
    fontSize: 14,
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  btn: {
    backgroundColor: "#7c3aed",
    border: "none",
    borderRadius: 12,
    padding: "12px 0",
    color: "#fff",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    width: "100%",
  },
  label: {
    fontSize: 13,
    color: "#94a3b8",
    margin: "0 0 6px",
    display: "block",
  },
  h2: { fontSize: 18, fontWeight: 700, margin: "0 0 4px" },
};

/* ─── MAIN APP ──────────────────────────────────────────── */
export default function App() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [tab, setTab] = useState("tasks");
  const [energy, setEnergy] = useState(null);
  const [streak, setStreak] = useState(3);
  const [frozenThisWeek, setFrozenThisWeek] = useState(false);
  const [notifTime, setNotifTime] = useState("08:00");
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [meals, setMeals] = useState(
    Object.fromEntries(
      Object.entries(MEAL_META).map(([k, v]) => [
        k,
        { time: v.defaultTime, recipe: null },
      ])
    )
  );
  const [foodLogs, setFoodLogs] = useState([]);
  const [foodInput, setFoodInput] = useState("");
  const [foodTag, setFoodTag] = useState("green");
  const [toast, setToast] = useState(null);

  // Mentor state
  const DEFAULT_KEY = "Твій_ключ";
  const [groqKey, setGroqKey] = useState(DEFAULT_KEY);
  const [showKey, setShowKey] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    {
      role: "assistant",
      content:
        "Привіт! 👋 Я твій особистий ментор. Розкажи мені, як твій день? Є щось, що тебе турбує або в чому потрібна підтримка?",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);

  const fired = useRef({});
  const toastTimer = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isTyping]);

  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  /* notifications */
  useEffect(() => {
    if (!notifEnabled) return;
    const tick = () => {
      const now = new Date();
      const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}`;
      const k = `${now.toDateString()}_${hhmm}`;
      if (hhmm === notifTime && !fired.current[k]) {
        fired.current[k] = true;
        new Notification("Доброго ранку! ☀️", { body: rand(PHRASES) });
      }
    };
    const iv = setInterval(tick, 30000);
    tick();
    return () => clearInterval(iv);
  }, [notifEnabled, notifTime]);

  /* ── TASKS ── */
  const addTask = () => {
    if (!input.trim()) return;
    setTasks((p) => [
      ...p,
      {
        id: Date.now(),
        text: input.trim(),
        completed: false,
        isFrog: false,
        createdAt: new Date().toISOString(),
      },
    ]);
    setInput("");
  };

  const toggleTask = (id) => {
    setTasks((prev) => {
      const updated = prev.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      );
      const task = updated.find((t) => t.id === id);
      if (task.completed && task.text.toLowerCase().includes("ши-тцу")) {
        const exists = updated.some((t) => t.text === "Випити склянку води");
        if (!exists) {
          setTimeout(() => {
            setTasks((p) => [
              ...p,
              {
                id: Date.now() + 1,
                text: "Випити склянку води",
                completed: false,
                isFrog: false,
                createdAt: new Date().toISOString(),
              },
            ]);
            showToast("🔗 Якірна звичка: додано «Випити склянку води»!");
          }, 300);
        }
      }
      if (task.completed && task.isFrog) {
        setStreak((s) => s + 1);
        showToast("🔥 Жабу з'їдено! Стрик +1");
      }
      return updated;
    });
  };

  const deleteTask = (id) => setTasks((p) => p.filter((t) => t.id !== id));
  const setFrog = (id) =>
    setTasks((p) =>
      p.map((t) => ({ ...t, isFrog: t.id === id ? !t.isFrog : false }))
    );
  const sortedTasks = [...tasks].sort(
    (a, b) => (b.isFrog ? 1 : 0) - (a.isFrog ? 1 : 0)
  );
  const completed = tasks.filter((t) => t.completed).length;
  const total = tasks.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  /* ── FOOD ── */
  const foodStats = FOOD_TAGS.map((ft) => ({
    ...ft,
    count: foodLogs.filter((l) => l.tag === ft.val).length,
  }));
  const addFoodLog = () => {
    if (!foodInput.trim()) return;
    setFoodLogs((p) => [
      ...p,
      { id: Date.now(), name: foodInput.trim(), tag: foodTag },
    ]);
    setFoodInput("");
  };

  /* ── MENTOR / AI ── */
  const sendMessage = async () => {
    const text = chatInput.trim();
    if (!text || isTyping) return;
    setChatInput("");
    const userMsg = { role: "user", content: text };
    const newHistory = [...chatHistory, userMsg];
    setChatHistory(newHistory);
    setIsTyping(true);
    try {
      const res = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              ...newHistory.map((m) => ({ role: m.role, content: m.content })),
            ],
          }),
        }
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.error?.message || `Помилка ${res.status}`);
      const reply = data.choices?.[0]?.message?.content || "...";
      setChatHistory((p) => [...p, { role: "assistant", content: reply }]);
    } catch (err) {
      setChatHistory((p) => [
        ...p,
        { role: "assistant", content: `⚠️ Помилка: ${err.message}` },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setChatHistory([
      {
        role: "assistant",
        content:
          "Привіт! 👋 Я твій особистий ментор. Розкажи мені, як твій день?",
      },
    ]);
    setClearConfirm(false);
    showToast("💬 Історію чату очищено");
  };

  const TABS = [
    { id: "tasks", label: "Завдання", Icon: ListTodo },
    { id: "stats", label: "Статистика", Icon: BarChart2 },
    { id: "food", label: "Їжа", Icon: UtensilsCrossed },
    { id: "mentor", label: "Ментор", Icon: Brain },
    { id: "settings", label: "Налашт.", Icon: Settings },
  ];

  return (
    <div style={s.wrap}>
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 80,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 999,
            backgroundColor: "#1e293b",
            border: "1px solid #334155",
            borderRadius: 14,
            padding: "12px 20px",
            fontSize: 14,
            color: "#e2e8f0",
            whiteSpace: "nowrap",
            boxShadow: "0 8px 32px #0008",
          }}
        >
          {toast}
        </div>
      )}

      {/* Header */}
      <header style={s.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>✅</span>
          <span style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>
            DayTracker
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {energy && (
            <span
              style={{
                fontSize: 12,
                backgroundColor: "#1e293b",
                padding: "3px 8px",
                borderRadius: 8,
                color: "#94a3b8",
              }}
            >
              {ENERGY_OPTIONS.find((e) => e.val === energy)?.label}
            </span>
          )}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              backgroundColor: "#1e293b",
              padding: "3px 10px",
              borderRadius: 8,
            }}
          >
            <Flame size={14} color="#f97316" />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#f97316" }}>
              {streak}
            </span>
          </div>
          {notifEnabled && <Bell size={15} color="#a78bfa" />}
        </div>
      </header>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          backgroundColor: "#0f172a",
          borderBottom: "1px solid #1e293b",
          overflowX: "auto",
        }}
      >
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              flex: "0 0 auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              padding: "9px 14px",
              fontSize: 10,
              fontWeight: 500,
              border: "none",
              cursor: "pointer",
              background: "transparent",
              color: tab === id ? "#a78bfa" : "#64748b",
              borderBottom:
                tab === id ? "2px solid #a78bfa" : "2px solid transparent",
              whiteSpace: "nowrap",
            }}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      <main
        style={{ maxWidth: 520, margin: "0 auto", padding: "16px 14px 90px" }}
      >
        {/* ══ TASKS ══ */}
        {tab === "tasks" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ ...s.card }}>
              <p
                style={{
                  margin: "0 0 10px",
                  fontSize: 13,
                  color: "#94a3b8",
                  fontWeight: 600,
                }}
              >
                ⚡ Твій рівень енергії сьогодні?
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                {ENERGY_OPTIONS.map((opt) => (
                  <button
                    key={opt.val}
                    onClick={() => {
                      setEnergy(opt.val);
                      showToast(`Рівень енергії: ${opt.label}`);
                    }}
                    style={{
                      flex: 1,
                      border: `2px solid ${
                        energy === opt.val ? opt.color : "#1e293b"
                      }`,
                      backgroundColor: energy === opt.val ? opt.bg : "#1e293b",
                      borderRadius: 10,
                      padding: "9px 4px",
                      color: energy === opt.val ? opt.color : "#64748b",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTask()}
                placeholder="Нове завдання..."
                style={{
                  flex: 1,
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: 14,
                  padding: "13px 16px",
                  color: "#fff",
                  fontSize: 15,
                  outline: "none",
                }}
              />
              <button
                onClick={addTask}
                style={{
                  backgroundColor: "#7c3aed",
                  border: "none",
                  borderRadius: 14,
                  padding: "13px 18px",
                  cursor: "pointer",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Plus size={22} />
              </button>
            </div>

            {tasks.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "50px 0",
                  color: "#475569",
                }}
              >
                <CheckCircle2
                  size={48}
                  style={{ margin: "0 auto 12px", opacity: 0.3 }}
                />
                <p style={{ fontSize: 14 }}>
                  Список порожній. Додай перше завдання!
                </p>
              </div>
            ) : (
              <ul
                style={{
                  listStyle: "none",
                  margin: 0,
                  padding: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {sortedTasks.map((task) => (
                  <li
                    key={task.id}
                    style={{
                      backgroundColor: task.isFrog ? "#0d0a1a" : "#0f172a",
                      border: task.isFrog
                        ? "1.5px solid #7c3aed"
                        : "1px solid #1e293b",
                      boxShadow: task.isFrog ? "0 0 12px #7c3aed44" : "none",
                      borderRadius: 14,
                      padding: "12px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      opacity: task.completed ? 0.55 : 1,
                    }}
                  >
                    {task.isFrog && (
                      <span style={{ fontSize: 16, flexShrink: 0 }}>🐸</span>
                    )}
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                      style={{
                        width: 19,
                        height: 19,
                        accentColor: "#7c3aed",
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        flex: 1,
                        fontSize: 15,
                        color: task.completed ? "#475569" : "#e2e8f0",
                        textDecoration: task.completed
                          ? "line-through"
                          : "none",
                      }}
                    >
                      {task.text}
                    </span>
                    <button
                      onClick={() => setFrog(task.id)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: task.isFrog ? "#a78bfa" : "#334155",
                        padding: 3,
                        fontSize: 14,
                      }}
                    >
                      🐸
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#334155",
                        padding: 3,
                        display: "flex",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "#f87171")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "#334155")
                      }
                    >
                      <Trash2 size={16} />
                    </button>
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
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              {[
                { label: "Всього", val: total, color: "#a78bfa" },
                { label: "Виконано", val: completed, color: "#34d399" },
                {
                  label: "Залишилось",
                  val: total - completed,
                  color: "#fbbf24",
                },
                { label: "Прогрес", val: `${pct}%`, color: "#60a5fa" },
              ].map(({ label, val, color }) => (
                <div key={label} style={{ ...s.card, textAlign: "center" }}>
                  <p
                    style={{
                      fontSize: 30,
                      fontWeight: 800,
                      color,
                      margin: "0 0 4px",
                    }}
                  >
                    {val}
                  </p>
                  <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>
                    {label}
                  </p>
                </div>
              ))}
            </div>
            <div style={s.card}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  color: "#94a3b8",
                  marginBottom: 8,
                }}
              >
                <span>Прогрес завдань</span>
                <span style={{ fontWeight: 600, color: "#a78bfa" }}>
                  {pct}%
                </span>
              </div>
              <div
                style={{
                  backgroundColor: "#1e293b",
                  borderRadius: 99,
                  height: 10,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${pct}%`,
                    background: "linear-gradient(90deg,#7c3aed,#34d399)",
                    borderRadius: 99,
                    transition: "width .5s",
                  }}
                />
              </div>
            </div>
            <div
              style={{
                ...s.card,
                border: "1px solid #f97316",
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <Flame size={40} color="#f97316" />
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 28,
                    fontWeight: 800,
                    color: "#f97316",
                  }}
                >
                  {streak} {streak === 1 ? "день" : "днів"}
                </p>
                <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>
                  Стрик виконання Жаби
                </p>
              </div>
            </div>
            {completed > 0 && (
              <div style={s.card}>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#94a3b8",
                    margin: "0 0 10px",
                  }}
                >
                  ✅ Виконані завдання
                </p>
                {tasks
                  .filter((t) => t.completed)
                  .map((t) => (
                    <p
                      key={t.id}
                      style={{
                        margin: "0 0 5px",
                        fontSize: 13,
                        color: "#475569",
                        textDecoration: "line-through",
                      }}
                    >
                      {t.isFrog && "🐸 "}
                      {t.text}
                    </p>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* ══ FOOD ══ */}
        {tab === "food" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <h2 style={s.h2}>🍽️ Харчування</h2>
            <div style={s.card}>
              <p
                style={{
                  margin: "0 0 10px",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#94a3b8",
                }}
              >
                🚦 Світлофор харчування
              </p>
              {foodLogs.length === 0 ? (
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    color: "#475569",
                    textAlign: "center",
                    padding: "10px 0",
                  }}
                >
                  Ще немає записів.
                </p>
              ) : (
                <>
                  <div
                    style={{
                      display: "flex",
                      height: 14,
                      borderRadius: 99,
                      overflow: "hidden",
                      marginBottom: 10,
                      gap: 2,
                    }}
                  >
                    {foodStats.map(
                      (ft) =>
                        ft.count > 0 && (
                          <div
                            key={ft.val}
                            style={{
                              flex: ft.count,
                              backgroundColor: ft.color,
                              borderRadius: 99,
                            }}
                          />
                        )
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {foodStats.map((ft) => (
                      <div
                        key={ft.val}
                        style={{
                          flex: 1,
                          textAlign: "center",
                          backgroundColor: ft.bg,
                          borderRadius: 10,
                          padding: "8px 4px",
                          border: `1px solid ${ft.color}33`,
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: 20,
                            fontWeight: 800,
                            color: ft.color,
                          }}
                        >
                          {ft.count}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 10,
                            color: ft.color,
                            opacity: 0.8,
                          }}
                        >
                          {ft.label.split(" ")[1]}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div style={s.card}>
              <p
                style={{
                  margin: "0 0 10px",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#94a3b8",
                }}
              >
                ➕ Додати прийом їжі
              </p>
              <input
                value={foodInput}
                onChange={(e) => setFoodInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addFoodLog()}
                placeholder="Що ти їв(ла)?"
                style={{ ...s.input, marginBottom: 10 }}
              />
              <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                {FOOD_TAGS.map((ft) => (
                  <button
                    key={ft.val}
                    onClick={() => setFoodTag(ft.val)}
                    style={{
                      flex: 1,
                      padding: "8px 4px",
                      borderRadius: 10,
                      border: `2px solid ${
                        foodTag === ft.val ? ft.color : "#1e293b"
                      }`,
                      backgroundColor: foodTag === ft.val ? ft.bg : "#1e293b",
                      color: foodTag === ft.val ? ft.color : "#64748b",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {ft.label}
                  </button>
                ))}
              </div>
              <button
                onClick={addFoodLog}
                style={{
                  ...s.btn,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <Plus size={15} />
                Додати
              </button>
            </div>
            {foodLogs.length > 0 && (
              <div style={s.card}>
                <p
                  style={{
                    margin: "0 0 10px",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#94a3b8",
                  }}
                >
                  📋 Сьогодні
                </p>
                {foodLogs.map((log) => {
                  const tag = FOOD_TAGS.find((t) => t.val === log.tag);
                  return (
                    <div
                      key={log.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        backgroundColor: tag.bg,
                        border: `1px solid ${tag.color}44`,
                        borderRadius: 10,
                        padding: "10px 12px",
                        marginBottom: 6,
                      }}
                    >
                      <span style={{ fontSize: 14, color: "#e2e8f0" }}>
                        {log.name}
                      </span>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            color: tag.color,
                            fontWeight: 600,
                            padding: "2px 8px",
                            borderRadius: 6,
                            border: `1px solid ${tag.color}`,
                          }}
                        >
                          {tag.label}
                        </span>
                        <button
                          onClick={() =>
                            setFoodLogs((p) => p.filter((l) => l.id !== log.id))
                          }
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#475569",
                            display: "flex",
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {Object.entries(MEAL_META).map(([meal, meta]) => {
              const rec = meals[meal].recipe;
              return (
                <div key={meal} style={s.card}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 12,
                    }}
                  >
                    <span style={{ fontSize: 15, fontWeight: 700 }}>
                      {meta.emoji} {meta.label}
                    </span>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <Clock size={13} color="#64748b" />
                      <input
                        type="time"
                        value={meals[meal].time}
                        onChange={(e) =>
                          setMeals((p) => ({
                            ...p,
                            [meal]: { ...p[meal], time: e.target.value },
                          }))
                        }
                        style={{
                          backgroundColor: "#1e293b",
                          border: "1px solid #334155",
                          borderRadius: 8,
                          padding: "5px 9px",
                          color: "#fff",
                          fontSize: 12,
                          outline: "none",
                        }}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setMeals((p) => ({
                        ...p,
                        [meal]: { ...p[meal], recipe: rand(RECIPES[meal]) },
                      }))
                    }
                    style={{
                      width: "100%",
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: 10,
                      padding: "9px 0",
                      color: "#94a3b8",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <RefreshCw size={13} />
                    {rec ? "Інший рецепт" : "Отримати рецепт"}
                  </button>
                  {rec && (
                    <div
                      style={{
                        marginTop: 10,
                        backgroundColor: "#020617",
                        borderRadius: 10,
                        padding: 12,
                      }}
                    >
                      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 20 }}>{rec.emoji}</span>
                        <div>
                          <p
                            style={{
                              margin: 0,
                              fontWeight: 700,
                              color: "#fff",
                              fontSize: 14,
                            }}
                          >
                            {rec.name}
                          </p>
                          <p
                            style={{
                              margin: 0,
                              fontSize: 11,
                              color: "#64748b",
                            }}
                          >
                            ⏱ {rec.time}
                          </p>
                        </div>
                      </div>
                      <p
                        style={{
                          margin: "0 0 4px",
                          fontSize: 10,
                          color: "#64748b",
                          textTransform: "uppercase",
                          letterSpacing: 1,
                        }}
                      >
                        Інгредієнти
                      </p>
                      <p
                        style={{
                          margin: "0 0 8px",
                          fontSize: 12,
                          color: "#94a3b8",
                        }}
                      >
                        {rec.ing.join(" • ")}
                      </p>
                      <p
                        style={{
                          margin: "0 0 4px",
                          fontSize: 10,
                          color: "#64748b",
                          textTransform: "uppercase",
                          letterSpacing: 1,
                        }}
                      >
                        Приготування
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 12,
                          color: "#cbd5e1",
                          lineHeight: 1.6,
                        }}
                      >
                        {rec.steps}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ══ MENTOR CHAT ══ */}
        {tab === "mentor" && !groqKey && (
          <div style={{ ...s.card, textAlign: "center", padding: "48px 24px" }}>
            <Brain
              size={52}
              color="#7c3aed"
              style={{ margin: "0 auto 16px", opacity: 0.7 }}
            />
            <p
              style={{
                fontSize: 17,
                fontWeight: 700,
                color: "#fff",
                margin: "0 0 8px",
              }}
            >
              Ментор ще не підключений
            </p>
            <p
              style={{
                fontSize: 14,
                color: "#94a3b8",
                margin: "0 0 24px",
                lineHeight: 1.6,
              }}
            >
              Щоб спілкуватися з ментором,
              <br />
              додайте свій Groq API ключ у Налаштуваннях.
            </p>
            <button
              onClick={() => setTab("settings")}
              style={{
                ...s.btn,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                width: "auto",
                padding: "12px 28px",
              }}
            >
              <Settings size={15} /> Відкрити налаштування
            </button>
          </div>
        )}
        {tab === "mentor" && groqKey && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 0,
              height: "calc(100vh - 140px)",
              maxHeight: 680,
            }}
          >
            {/* Chat header */}
            <div
              style={{
                ...s.card,
                borderRadius: "14px 14px 0 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                borderBottom: "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Brain size={20} color="#fff" />
                </div>
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontWeight: 700,
                      fontSize: 14,
                      color: "#fff",
                    }}
                  >
                    AI Ментор
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: "#22c55e" }}>
                    ● онлайн
                  </p>
                </div>
              </div>
              {!clearConfirm ? (
                <button
                  onClick={() => setClearConfirm(true)}
                  style={{
                    background: "none",
                    border: "1px solid #334155",
                    borderRadius: 8,
                    padding: "5px 10px",
                    color: "#64748b",
                    fontSize: 12,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Trash2 size={13} /> Очистити
                </button>
              ) : (
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={clearChat}
                    style={{
                      background: "#7f1d1d",
                      border: "1px solid #dc2626",
                      borderRadius: 8,
                      padding: "5px 10px",
                      color: "#fca5a5",
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    Так
                  </button>
                  <button
                    onClick={() => setClearConfirm(false)}
                    style={{
                      background: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: 8,
                      padding: "5px 10px",
                      color: "#94a3b8",
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    Ні
                  </button>
                </div>
              )}
            </div>

            {/* Messages */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                backgroundColor: "#070d1a",
                border: "1px solid #1e293b",
                borderTop: "none",
                borderBottom: "none",
                padding: "16px 14px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {chatHistory.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent:
                      msg.role === "user" ? "flex-end" : "flex-start",
                    alignItems: "flex-end",
                    gap: 8,
                  }}
                >
                  {msg.role === "assistant" && (
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginBottom: 2,
                      }}
                    >
                      <Brain size={13} color="#fff" />
                    </div>
                  )}
                  <div
                    style={{
                      maxWidth: "78%",
                      padding: "10px 14px",
                      borderRadius:
                        msg.role === "user"
                          ? "16px 16px 4px 16px"
                          : "16px 16px 16px 4px",
                      backgroundColor:
                        msg.role === "user" ? "#7c3aed" : "#1e293b",
                      color: "#f1f5f9",
                      fontSize: 14,
                      lineHeight: 1.6,
                      boxShadow:
                        msg.role === "user" ? "0 2px 8px #7c3aed44" : "none",
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div
                  style={{ display: "flex", alignItems: "flex-end", gap: 8 }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Brain size={13} color="#fff" />
                  </div>
                  <div
                    style={{
                      backgroundColor: "#1e293b",
                      padding: "12px 16px",
                      borderRadius: "16px 16px 16px 4px",
                      display: "flex",
                      gap: 5,
                      alignItems: "center",
                    }}
                  >
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          backgroundColor: "#a78bfa",
                          animation: `pulse 1.2s ${i * 0.2}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div
              style={{
                backgroundColor: "#0f172a",
                border: "1px solid #1e293b",
                borderTop: "none",
                borderRadius: "0 0 14px 14px",
                padding: "12px 14px",
                display: "flex",
                gap: 8,
                alignItems: "flex-end",
              }}
            >
              <textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Напиши щось ментору... (Enter — надіслати)"
                rows={1}
                style={{
                  flex: 1,
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: 12,
                  padding: "11px 14px",
                  color: "#fff",
                  fontSize: 14,
                  outline: "none",
                  resize: "none",
                  fontFamily: "system-ui,sans-serif",
                  lineHeight: 1.5,
                  maxHeight: 100,
                  overflowY: "auto",
                }}
              />
              <button
                onClick={sendMessage}
                disabled={isTyping || !chatInput.trim()}
                style={{
                  backgroundColor:
                    isTyping || !chatInput.trim() ? "#1e293b" : "#7c3aed",
                  border: "none",
                  borderRadius: 12,
                  padding: "11px 14px",
                  cursor:
                    isTyping || !chatInput.trim() ? "not-allowed" : "pointer",
                  color: isTyping || !chatInput.trim() ? "#475569" : "#fff",
                  display: "flex",
                  alignItems: "center",
                  flexShrink: 0,
                  transition: "all .2s",
                }}
              >
                <Send size={18} />
              </button>
            </div>

            <style>{`@keyframes pulse{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1.1)}}`}</style>
          </div>
        )}

        {/* ══ SETTINGS ══ */}
        {tab === "settings" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <h2 style={s.h2}>⚙️ Налаштування</h2>

            <div style={s.card}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 14,
                }}
              >
                <Bell size={18} color="#a78bfa" />
                <span style={{ fontWeight: 700, fontSize: 15 }}>
                  Ранкові сповіщення
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 14,
                }}
              >
                <span style={{ fontSize: 13, color: "#94a3b8" }}>
                  Час сповіщення
                </span>
                <input
                  type="time"
                  value={notifTime}
                  onChange={(e) => setNotifTime(e.target.value)}
                  style={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: 8,
                    padding: "7px 12px",
                    color: "#fff",
                    fontSize: 13,
                    outline: "none",
                  }}
                />
              </div>
              <button
                onClick={(reqPerm) =>
                  (async () => {
                    if (!("Notification" in window))
                      return alert("Браузер не підтримує сповіщення");
                    const p = await Notification.requestPermission();
                    setNotifEnabled(p === "granted");
                  })()
                }
                style={{
                  ...s.btn,
                  backgroundColor: notifEnabled ? "#14532d" : "#7c3aed",
                  color: notifEnabled ? "#86efac" : "#fff",
                }}
              >
                {notifEnabled
                  ? "✅ Сповіщення увімкнено"
                  : "🔔 Увімкнути сповіщення"}
              </button>
            </div>

            <div style={s.card}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 14,
                }}
              >
                <Flame size={18} color="#f97316" />
                <span style={{ fontWeight: 700, fontSize: 15 }}>
                  Стрик та Заморозка
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 14,
                  backgroundColor: "#1e293b",
                  borderRadius: 12,
                  padding: "12px 14px",
                }}
              >
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontWeight: 700,
                      color: "#fff",
                      fontSize: 15,
                    }}
                  >
                    🔥 Поточний стрик
                  </p>
                  <p
                    style={{
                      margin: "2px 0 0",
                      fontSize: 12,
                      color: "#94a3b8",
                    }}
                  >
                    Виконуй Жабу щодня
                  </p>
                </div>
                <span
                  style={{ fontSize: 28, fontWeight: 800, color: "#f97316" }}
                >
                  {streak}
                </span>
              </div>
              <button
                onClick={() => {
                  if (frozenThisWeek)
                    return showToast(
                      "❄️ Заморозка вже використана цього тижня"
                    );
                  setFrozenThisWeek(true);
                  showToast("❄️ День заморожено! Стрик збережено.");
                }}
                style={{
                  ...s.btn,
                  border: `2px solid ${frozenThisWeek ? "#1e293b" : "#38bdf8"}`,
                  backgroundColor: frozenThisWeek ? "#1e293b" : "#0c4a6e",
                  color: frozenThisWeek ? "#475569" : "#38bdf8",
                }}
              >
                <Snowflake
                  size={15}
                  style={{
                    display: "inline",
                    marginRight: 6,
                    verticalAlign: "middle",
                  }}
                />
                {frozenThisWeek
                  ? "Заморозка вже використана"
                  : "❄️ Заморозити день (1× на тиждень)"}
              </button>
            </div>

            <div style={s.card}>
              <p style={{ margin: "0 0 10px", fontWeight: 700, fontSize: 15 }}>
                🔗 Якірні звички
              </p>
              <div
                style={{
                  backgroundColor: "#020617",
                  borderRadius: 10,
                  padding: 12,
                  borderLeft: "3px solid #7c3aed",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    color: "#94a3b8",
                    lineHeight: 1.6,
                  }}
                >
                  Відмітити завдання з{" "}
                  <strong style={{ color: "#a78bfa" }}>"ши-тцу"</strong> →
                  автоматично з'явиться{" "}
                  <strong style={{ color: "#34d399" }}>
                    "Випити склянку води"
                  </strong>{" "}
                  🐶
                </p>
              </div>
            </div>

            <div style={s.card}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 14,
                }}
              >
                <Brain size={18} color="#a78bfa" />
                <span style={{ fontWeight: 700, fontSize: 15 }}>
                  Groq API — AI Ментор
                </span>
              </div>
              <label style={s.label}>API Ключ (Groq)</label>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <input
                  type={showKey ? "text" : "password"}
                  value={groqKey}
                  onChange={(e) => setGroqKey(e.target.value)}
                  placeholder="gsk_..."
                  style={{
                    ...s.input,
                    fontFamily: "monospace",
                    fontSize: 12,
                    flex: 1,
                  }}
                />
                <button
                  onClick={() => setShowKey((p) => !p)}
                  style={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: 10,
                    padding: "0 13px",
                    color: "#94a3b8",
                    cursor: "pointer",
                    fontSize: 12,
                    flexShrink: 0,
                  }}
                >
                  {showKey ? "Сховати" : "Показати"}
                </button>
              </div>
              {groqKey ? (
                <div
                  style={{
                    backgroundColor: "#052e16",
                    border: "1px solid #16a34a",
                    borderRadius: 10,
                    padding: "10px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <CheckCircle2 size={15} color="#22c55e" />
                  <p style={{ margin: 0, fontSize: 13, color: "#86efac" }}>
                    Ключ збережено. Ментор готовий!
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    backgroundColor: "#450a0a",
                    border: "1px solid #dc2626",
                    borderRadius: 10,
                    padding: "10px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <AlertCircle size={15} color="#f87171" />
                  <p style={{ margin: 0, fontSize: 13, color: "#fca5a5" }}>
                    Введи ключ для роботи Ментора
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
