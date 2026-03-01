
import { useState, useEffect, useRef, useCallback, createContext, useContext, useReducer } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   DESIGN SYSTEM — Light + Dark Hybrid with Glassmorphism
═══════════════════════════════════════════════════════════════════════════ */
const THEMES = {
  light: {
    pageBg: "#f0f2f7",
    surface: "#ffffff",
    surfaceAlt: "#f7f8fc",
    glass: "rgba(255,255,255,0.72)",
    glassBorder: "rgba(255,255,255,0.9)",
    sidebar: "#0f0f1a",
    sidebarText: "#e8e8f8",
    sidebarDim: "#6060a0",
    sidebarActive: "rgba(108,99,255,0.18)",
    card: "#ffffff",
    cardBorder: "rgba(0,0,0,0.07)",
    cardShadow: "0 2px 16px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)",
    cardHoverShadow: "0 8px 32px rgba(108,99,255,0.13), 0 2px 8px rgba(0,0,0,0.06)",
    text: "#0f0f1a",
    textMid: "#4a4a6a",
    textDim: "#8888aa",
    border: "rgba(0,0,0,0.09)",
    inputBg: "#f4f5fa",
    inputBorder: "rgba(0,0,0,0.12)",
    primary: "#5b50f0",
    primaryLight: "#7b72ff",
    primaryGlow: "rgba(91,80,240,0.12)",
    accent: "#00c896",
    accentGlow: "rgba(0,200,150,0.1)",
    warn: "#f59e0b",
    danger: "#ef4444",
    github: "#24292f",
    toggle: "#e2e4f0",
    overlay: "rgba(15,15,26,0.6)",
  },
  dark: {
    pageBg: "#0a0a12",
    surface: "#111120",
    surfaceAlt: "#161628",
    glass: "rgba(20,20,40,0.8)",
    glassBorder: "rgba(255,255,255,0.08)",
    sidebar: "#080810",
    sidebarText: "#e8e8f8",
    sidebarDim: "#5050a0",
    sidebarActive: "rgba(108,99,255,0.2)",
    card: "#13132a",
    cardBorder: "rgba(255,255,255,0.06)",
    cardShadow: "0 2px 16px rgba(0,0,0,0.4)",
    cardHoverShadow: "0 8px 40px rgba(108,99,255,0.2)",
    text: "#e8e8f8",
    textMid: "#a0a0c8",
    textDim: "#5050a0",
    border: "rgba(255,255,255,0.08)",
    inputBg: "#1a1a30",
    inputBorder: "rgba(255,255,255,0.1)",
    primary: "#7b72ff",
    primaryLight: "#9d96ff",
    primaryGlow: "rgba(123,114,255,0.18)",
    accent: "#00e5b0",
    accentGlow: "rgba(0,229,176,0.12)",
    warn: "#fbbf24",
    danger: "#f87171",
    github: "#58a6ff",
    toggle: "#2a2a50",
    overlay: "rgba(0,0,0,0.8)",
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   GLOBAL STATE — Simulates Real-Time Shared Database
   In production: replaced by Socket.IO + MongoDB + Redis pub/sub
═══════════════════════════════════════════════════════════════════════════ */
const DB = {
  students: {},
  companies: {},
  internships: {
    "i1": { id: "i1", companyId: "c1", company: "Anthropic", logo: "🤖", title: "ML Research Intern", role: "Data Science", requiredSkills: ["Python", "TensorFlow", "PyTorch", "NumPy"], minScore: 70, location: "Remote", durationType: "remote", duration: "3 months", stipend: 8000, deadline: "2026-04-15", applicantCount: 0, status: "active", createdAt: Date.now() - 86400000 * 3 },
    "i2": { id: "i2", companyId: "c2", company: "Stripe", logo: "💳", title: "Frontend Engineer Intern", role: "Software Engineering", requiredSkills: ["React", "TypeScript", "Node.js", "CSS"], minScore: 65, location: "San Francisco, CA", durationType: "onsite", duration: "3 months", stipend: 9000, deadline: "2026-04-30", applicantCount: 0, status: "active", createdAt: Date.now() - 86400000 * 2 },
    "i3": { id: "i3", companyId: "c1", company: "Anthropic", logo: "🤖", title: "Safety Research Intern", role: "Data Science", requiredSkills: ["Python", "PyTorch", "Statistics", "Research"], minScore: 75, location: "Remote", durationType: "remote", duration: "4 months", stipend: 9500, deadline: "2026-05-01", applicantCount: 0, status: "active", createdAt: Date.now() - 86400000 },
    "i4": { id: "i4", companyId: "c3", company: "Linear", logo: "⚡", title: "Full-Stack Intern", role: "Software Engineering", requiredSkills: ["React", "Node.js", "TypeScript", "PostgreSQL"], minScore: 72, location: "Remote", durationType: "remote", duration: "6 months", stipend: 10000, deadline: "2026-03-31", applicantCount: 0, status: "active", createdAt: Date.now() },
  },
  applications: {},
  notifications: { student: {}, company: {} },
  githubProjects: {},
  listeners: [],
  subscribe(fn) { this.listeners.push(fn); return () => { this.listeners = this.listeners.filter(l => l !== fn); }; },
  emit(event, payload) { this.listeners.forEach(fn => fn({ event, payload, timestamp: Date.now() })); },
  applyToInternship(studentId, internshipId, data) {
    const appId = `app_${Date.now()}`;
    const intern = this.internships[internshipId];
    const student = this.students[studentId];
    if (!intern || !student) return null;
    if (this.applications[appId]) return null;
    const app = {
      id: appId, studentId, internshipId, companyId: intern.companyId, status: "pending",
      readinessAtApply: student.readiness?.overall || 0, matchScore: data.matchScore, githubScore: student.githubScore || 0,
      aiConfidence: data.aiConfidence, coverNote: data.coverNote || "", appliedAt: Date.now(),
      studentSnapshot: { name: `${student.firstName} ${student.lastName}`, university: student.university, skills: student.skills, readiness: student.readiness, githubVerified: student.githubVerified, githubUsername: student.githubUsername, verifiedProjects: student.verifiedProjects || [] }
    };
    this.applications[appId] = app;
    if (this.internships[internshipId]) this.internships[internshipId].applicantCount++;
    this.emit("NEW_APPLICATION", { app, intern, student });
    this.addNotification("company", intern.companyId, { type: "new_application", title: "New Application", body: `${student.firstName} ${student.lastName} applied to ${intern.title}`, score: student.readiness?.overall || 0 });
    return app;
  },
  updateApplicationStatus(appId, status, companyId) {
    if (!this.applications[appId]) return;
    this.applications[appId].status = status;
    const app = this.applications[appId];
    this.emit("APPLICATION_STATUS_CHANGED", { appId, status, internshipId: app.internshipId, studentId: app.studentId });
    this.addNotification("student", app.studentId, { type: "status_change", title: "Application Update", body: `Your application status changed to: ${status}`, status });
  },
  addInternship(companyId, data) {
    const id = `i${Date.now()}`;
    const company = this.companies[companyId];
    const intern = { id, companyId, company: company?.name || "Company", logo: company?.logo || "🏢", ...data, applicantCount: 0, createdAt: Date.now() };
    this.internships[id] = intern;
    this.emit("NEW_INTERNSHIP", { intern });
    Object.values(this.students).forEach(s => {
      if ((s.readiness?.overall || 0) >= data.minScore) {
        this.addNotification("student", s.id, { type: "new_internship", title: "New Match!", body: `${intern.title} at ${intern.company} matches your profile`, minScore: data.minScore });
      }
    });
    return intern;
  },
  updateStudentReadiness(studentId, readiness) {
    if (!this.students[studentId]) return;
    this.students[studentId].readiness = readiness;
    this.emit("READINESS_UPDATED", { studentId, readiness });
    Object.values(this.internships).forEach(i => {
      if (readiness.overall >= i.minScore) {
        this.addNotification("company", i.companyId, { type: "eligible_student", title: "New Eligible Candidate", body: `A student just hit ${readiness.overall} readiness — eligible for ${i.title}`, studentId, score: readiness.overall });
      }
    });
  },
  verifyGitHub(studentId, username, projects) {
    if (!this.students[studentId]) return;
    const score = Math.min(100, projects.reduce((s, p) => s + p.verifiedScore, 0) / Math.max(projects.length, 1));
    this.students[studentId].githubVerified = true;
    this.students[studentId].githubUsername = username;
    this.students[studentId].verifiedProjects = projects;
    this.students[studentId].githubScore = Math.round(score);
    this.emit("GITHUB_VERIFIED", { studentId, username, score });
  },
  addNotification(role, userId, notif) {
    if (!this.notifications[role][userId]) this.notifications[role][userId] = [];
    this.notifications[role][userId].unshift({ id: Date.now(), ...notif, read: false, time: Date.now() });
    this.emit("NOTIFICATION", { role, userId, notif });
  },
  getStudentApplications(studentId) { return Object.values(this.applications).filter(a => a.studentId === studentId); },
  getCompanyApplications(companyId) { return Object.values(this.applications).filter(a => a.companyId === companyId); },
  getEligibleStudents(minScore) { return Object.values(this.students).filter(s => (s.readiness?.overall || 0) >= minScore); },
  getNotifications(role, userId) { return (this.notifications[role] || {})[userId] || []; },
};

/* ═══════════════════════════════════════════════════════════════════════════
   MATCH SCORE FORMULA (per spec):
   matchScore = (skillOverlap×0.4) + (readinessAlignment×0.3) + (githubScore×0.2) + (roleFit×0.1)
═══════════════════════════════════════════════════════════════════════════ */
function calcMatchScore(student, internship) {
  const studentSkills = (student.skills || []).map(s => s.toLowerCase());
  const required = (internship.requiredSkills || []).map(s => s.toLowerCase());
  const matched = required.filter(s => studentSkills.includes(s));
  const skillOverlap = Math.round((matched.length / Math.max(required.length, 1)) * 100);
  const readinessAlignment = Math.min(100, Math.round(((student.readiness?.overall || 0) / Math.max(internship.minScore, 1)) * 85));
  const githubScore = student.githubScore || 0;
  const roleFit = student.targetRole === internship.role ? 100 : student.targetRole?.split(" ")[0] === internship.role?.split(" ")[0] ? 60 : 30;
  const matchScore = Math.round(skillOverlap * 0.4 + readinessAlignment * 0.3 + githubScore * 0.2 + roleFit * 0.1);
  const aiConfidence = Math.min(95, 55 + matched.length * 5 + (student.githubVerified ? 10 : 0));
  return { matchScore, skillOverlap, readinessAlignment, githubScore, roleFit, matchedSkills: matched, missingSkills: required.filter(s => !studentSkills.includes(s)), aiConfidence };
}

/* ═══════════════════════════════════════════════════════════════════════════
   GLOBAL CONTEXT
═══════════════════════════════════════════════════════════════════════════ */
const AppCtx = createContext(null);
function useApp() { return useContext(AppCtx); }

/* ═══════════════════════════════════════════════════════════════════════════
   MOCK GITHUB PROJECTS
═══════════════════════════════════════════════════════════════════════════ */
const MOCK_GITHUB_REPOS = [
  { name: "ml-pipeline", stars: 42, forks: 8, commits: 187, lastActive: "2 days ago", tech: ["Python", "TensorFlow", "Docker"], verifiedScore: 88, contributor: true },
  { name: "react-dashboard", stars: 31, forks: 5, commits: 94, lastActive: "1 week ago", tech: ["React", "TypeScript", "Tailwind"], verifiedScore: 79, contributor: true },
  { name: "data-viz-toolkit", stars: 19, forks: 3, commits: 52, lastActive: "3 weeks ago", tech: ["Python", "Pandas", "Plotly"], verifiedScore: 71, contributor: false },
];

const ASSESSMENTS = [
  {
    id: "a1", title: "JavaScript & React Mastery", role: "Software Engineering", type: "mcq", difficulty: "intermediate", duration: 20, skills: ["React", "TypeScript", "JavaScript"], questions: [
      { id: "q1", prompt: "What does the React useCallback hook prevent?", type: "mcq", options: ["State loss on re-render", "Unnecessary function recreation", "DOM manipulation", "Memory leaks only"], correct: 1, points: 10 },
      { id: "q2", prompt: "Which TypeScript utility type makes all properties optional?", type: "mcq", options: ["Required<T>", "Readonly<T>", "Partial<T>", "Pick<T,K>"], correct: 2, points: 10 },
      { id: "q3", prompt: "What is the time complexity of Array.prototype.find()?", type: "mcq", options: ["O(1)", "O(log n)", "O(n)", "O(n²)"], correct: 2, points: 10 },
      { id: "q4", prompt: "In React, what triggers a component re-render?", type: "mcq", options: ["Only state changes", "State or prop changes", "Only prop changes", "DOM events only"], correct: 1, points: 10 },
      { id: "q5", prompt: "What does Promise.all() do when one promise rejects?", type: "mcq", options: ["Continues remaining", "Rejects immediately", "Returns partial results", "Retries automatically"], correct: 1, points: 10 },
    ]
  },
  {
    id: "a2", title: "Python & ML Fundamentals", role: "Data Science", type: "mcq", difficulty: "intermediate", duration: 25, skills: ["Python", "NumPy", "Scikit-learn", "TensorFlow"], questions: [
      { id: "q1", prompt: "Which activation function is most common in hidden layers of deep networks?", type: "mcq", options: ["Sigmoid", "Tanh", "ReLU", "Softmax"], correct: 2, points: 10 },
      { id: "q2", prompt: "What does pandas .groupby() return?", type: "mcq", options: ["DataFrame", "Series", "GroupBy object", "Dict"], correct: 2, points: 10 },
      { id: "q3", prompt: "In sklearn, what does cross_val_score default cv=5 mean?", type: "mcq", options: ["5 features", "5-fold cross validation", "5 iterations", "5% test split"], correct: 1, points: 10 },
      { id: "q4", prompt: "What is gradient descent minimizing?", type: "mcq", options: ["Accuracy", "Loss function", "Learning rate", "Weights"], correct: 1, points: 10 },
      { id: "q5", prompt: "NumPy broadcasting allows operations on arrays of different shapes if?", type: "mcq", options: ["Same dtype", "Compatible dimensions", "Same size", "They're 2D"], correct: 1, points: 10 },
    ]
  },
  {
    id: "a3", title: "System Design Simulation", role: "Software Engineering", type: "simulation", difficulty: "advanced", duration: 35, skills: ["System Design", "Docker", "AWS", "PostgreSQL"], questions: [
      { id: "q1", prompt: "Design a scalable notification service handling 10M users/day. Cover: message queue, fanout strategy, delivery guarantees, and failure handling.", type: "text", points: 50 },
    ]
  },
];

const ROLES = ["Software Engineering", "Data Science", "Product Management", "UI/UX Design", "Marketing"];

/* ═══════════════════════════════════════════════════════════════════════════
   REAL-TIME HOOK — Simulates WebSocket subscription
   In production: io.on("event", handler) replaces DB.subscribe
═══════════════════════════════════════════════════════════════════════════ */
function useRealTime(userId, role) {
  const [events, setEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const unsub = DB.subscribe(({ event, payload, timestamp }) => {
      setEvents(prev => [{ event, payload, timestamp }, ...prev.slice(0, 19)]);
      const notifs = DB.getNotifications(role, userId);
      setNotifications([...notifs]);
    });
    setNotifications(DB.getNotifications(role, userId));
    return unsub;
  }, [userId, role]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const markRead = () => {
    const n = DB.notifications[role]?.[userId] || [];
    n.forEach(x => x.read = true);
    setNotifications([...n]);
  };

  return { events, notifications, unreadCount, markRead };
}

/* ═══════════════════════════════════════════════════════════════════════════
   SCORE HELPERS
═══════════════════════════════════════════════════════════════════════════ */
function scoreColor(s, t) {
  if (s >= 75) return t.accent;
  if (s >= 50) return t.warn;
  return t.danger;
}
function scoreLabel(s) {
  if (s >= 85) return "Elite";
  if (s >= 70) return "Strong";
  if (s >= 55) return "Developing";
  return "Building";
}

/* ═══════════════════════════════════════════════════════════════════════════
   BASE COMPONENTS
═══════════════════════════════════════════════════════════════════════════ */
function Card({ children, style, onClick, hover, glass }) {
  const { theme: t } = useApp();
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => (hover || onClick) && setHov(true)} onMouseLeave={() => setHov(false)} style={{
      background: glass ? t.glass : t.card,
      backdropFilter: glass ? "blur(20px) saturate(180%)" : "none",
      WebkitBackdropFilter: glass ? "blur(20px) saturate(180%)" : "none",
      border: `1px solid ${glass ? t.glassBorder : t.cardBorder}`,
      borderRadius: 18, padding: 24,
      boxShadow: hov ? t.cardHoverShadow : t.cardShadow,
      transform: hov ? "translateY(-2px)" : "translateY(0)",
      transition: "all 0.22s cubic-bezier(0.4,0,0.2,1)",
      cursor: onClick ? "pointer" : "default", ...style
    }}>{children}</div>
  );
}

function Btn({ children, onClick, variant = "primary", size = "md", disabled, icon, full, style: sx }) {
  const { theme: t } = useApp();
  const [hov, setHov] = useState(false);
  const [rip, setRip] = useState(null);
  const V = {
    primary: { bg: hov ? t.primaryLight : t.primary, fg: "#fff", border: "transparent", shadow: `0 4px 20px ${t.primaryGlow}` },
    accent: { bg: hov ? "#00d9aa" : t.accent, fg: t.pageBg == "#f0f2f7" ? "#0a0a12" : "#0a0a12", border: "transparent", shadow: `0 4px 16px ${t.accentGlow}` },
    secondary: { bg: hov ? t.inputBg : "transparent", fg: t.textMid, border: t.border, shadow: "none" },
    ghost: { bg: hov ? t.primaryGlow : "transparent", fg: t.primary, border: "transparent", shadow: "none" },
    danger: { bg: hov ? "#dc2626" : t.danger, fg: "#fff", border: "transparent", shadow: "none" },
    github: { bg: hov ? "#1a1f24" : t.github, fg: "#fff", border: "transparent", shadow: "none" },
  };
  const S = { sm: "6px 14px", md: "10px 22px", lg: "14px 30px" };
  const v = V[variant];
  const handleClick = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setRip({ x: e.clientX - r.left, y: e.clientY - r.top });
    setTimeout(() => setRip(null), 600);
    onClick?.();
  };
  return (
    <button disabled={disabled} onClick={handleClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: S[size],
        background: v.bg, color: v.fg, border: `1px solid ${v.border}`,
        borderRadius: 11, fontSize: size === "sm" ? 12 : 14, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1, transition: "all 0.18s", fontFamily: "inherit", position: "relative", overflow: "hidden",
        boxShadow: v.shadow, width: full ? "100%" : undefined, ...sx
      }}>
      {rip && <span style={{
        position: "absolute", left: rip.x, top: rip.y, width: 0, height: 0,
        borderRadius: "50%", background: "rgba(255,255,255,0.3)",
        animation: "ripple 0.6s linear", transform: "translate(-50%,-50%)"
      }} />}
      {icon}<span>{children}</span>
    </button>
  );
}

function Input({ label, value, onChange, type = "text", placeholder, options, multiline, rows = 4 }) {
  const { theme: t } = useApp();
  const [focused, setFocused] = useState(false);
  const base = { background: t.inputBg, border: `1.5px solid ${focused ? t.primary : t.inputBorder}`, borderRadius: 11, padding: "10px 14px", color: t.text, fontSize: 14, fontFamily: "inherit", outline: "none", transition: "border-color 0.15s", width: "100%", boxSizing: "border-box" };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 700, color: t.textMid, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>}
      {options ? (
        <select value={value} onChange={e => onChange(e.target.value)} style={{ ...base, cursor: "pointer" }}>
          {options.map(o => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
        </select>
      ) : multiline ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ ...base, resize: "vertical", minHeight: 80 }} />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={base} />
      )}
    </div>
  );
}

function Badge({ text, color, small, dot }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: small ? "2px 9px" : "4px 12px",
      background: color + "18", border: `1px solid ${color}33`,
      borderRadius: 20, fontSize: small ? 10 : 12, fontWeight: 700, color, whiteSpace: "nowrap"
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, display: "inline-block", animation: dot === "pulse" ? "pulse2 1.5s infinite" : undefined }} />}
      {text}
    </span>
  );
}

function ProgressBar({ value, color, h = 6, anim }) {
  const { theme: t } = useApp();
  return (
    <div style={{ background: t.border, borderRadius: 10, height: h, overflow: "hidden" }}>
      <div style={{
        height: "100%", borderRadius: 10, width: `${Math.min(100, value)}%`,
        background: `linear-gradient(90deg,${color},${color}cc)`,
        boxShadow: `0 0 8px ${color}55`,
        transition: anim ? "width 1.1s cubic-bezier(0.4,0,0.2,1)" : "none"
      }} />
    </div>
  );
}

function ScoreRing({ score, size = 80, sw = 8, label, showLabel = true }) {
  const { theme: t } = useApp();
  const [display, setDisplay] = useState(0);
  const color = scoreColor(score, t);
  useEffect(() => {
    let frame; let current = 0; const target = score; const step = target / 40;
    const animate = () => { current = Math.min(current + step, target); setDisplay(Math.round(current)); if (current < target) frame = requestAnimationFrame(animate); };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [score]);
  const r = (size - sw * 2) / 2; const circ = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={t.border} strokeWidth={sw} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={sw}
          strokeLinecap="round" strokeDasharray={`${(display / 100) * circ} ${circ}`}
          style={{ transition: "stroke-dasharray 0.05s linear", filter: `drop-shadow(0 0 6px ${color}88)` }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: size < 60 ? 12 : size < 90 ? 18 : 24, fontWeight: 900, color, fontFamily: "'JetBrains Mono',monospace", lineHeight: 1 }}>{display}</span>
        {showLabel && size >= 80 && <span style={{ fontSize: 9, color: t.textDim, marginTop: 3, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label || scoreLabel(score)}</span>}
      </div>
    </div>
  );
}

function Modal({ open, onClose, title, children, width = 560 }) {
  const { theme: t } = useApp();
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: t.overlay, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, backdropFilter: "blur(6px)" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 22, width: "100%", maxWidth: width, maxHeight: "90vh", overflow: "auto", boxShadow: "0 32px 80px rgba(0,0,0,0.4)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 28px", borderBottom: `1px solid ${t.border}` }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: t.text }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: t.textDim, cursor: "pointer", fontSize: 24, lineHeight: 1, padding: "0 4px" }}>×</button>
        </div>
        <div style={{ padding: 28 }}>{children}</div>
      </div>
    </div>
  );
}

function Toast({ toasts, remove }) {
  const { theme: t } = useApp();
  const colors = { success: t.accent, error: t.danger, info: t.primary, warn: t.warn };
  return (
    <div style={{ position: "fixed", top: 24, right: 24, zIndex: 3000, display: "flex", flexDirection: "column", gap: 10 }}>
      {toasts.map(toast => (
        <div key={toast.id} style={{ background: t.surface, border: `1px solid ${colors[toast.type] || t.primary}44`, borderLeft: `4px solid ${colors[toast.type] || t.primary}`, borderRadius: 13, padding: "14px 20px", minWidth: 300, boxShadow: "0 8px 40px rgba(0,0,0,0.25)", animation: "slideInRight 0.3s ease", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 18 }}>{toast.type === "success" ? "✓" : toast.type === "error" ? "✕" : toast.type === "warn" ? "⚠" : "ℹ"}</span>
          <div style={{ flex: 1 }}>
            {toast.title && <div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 2 }}>{toast.title}</div>}
            <div style={{ fontSize: 12, color: t.textMid }}>{toast.message}</div>
          </div>
          <button onClick={() => remove(toast.id)} style={{ background: "none", border: "none", color: t.textDim, cursor: "pointer", fontSize: 18 }}>×</button>
        </div>
      ))}
    </div>
  );
}

function useToasts() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((message, type = "success", title) => {
    const id = Date.now();
    setToasts(p => [...p, { id, message, type, title }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  }, []);
  const remove = useCallback(id => setToasts(p => p.filter(t => t.id !== id)), []);
  return { toasts, add, remove };
}

function NotificationPanel({ role, userId, open, onClose }) {
  const { theme: t } = useApp();
  const notifs = DB.getNotifications(role, userId);
  const icons = { new_application: "📨", new_internship: "✨", status_change: "📋", eligible_student: "⭐", github_verified: "🐙" };
  const colors = { new_application: t.primary, new_internship: t.accent, status_change: t.warn, eligible_student: t.accent, github_verified: t.github };
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 800 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ position: "absolute", top: 64, right: 24, width: 360, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 18, boxShadow: "0 16px 60px rgba(0,0,0,0.3)", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${t.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 800, fontSize: 15, color: t.text }}>Notifications</span>
          <Badge text={`${notifs.filter(n => !n.read).length} new`} color={t.primary} small />
        </div>
        <div style={{ maxHeight: 400, overflow: "auto" }}>
          {notifs.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: t.textDim, fontSize: 13 }}>No notifications yet</div>
          ) : notifs.slice(0, 15).map(n => (
            <div key={n.id} style={{ padding: "14px 20px", borderBottom: `1px solid ${t.border}`, background: n.read ? "transparent" : t.primaryGlow, display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{ fontSize: 20 }}>{icons[n.type] || "🔔"}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: colors[n.type] || t.primary, marginBottom: 3 }}>{n.title}</div>
                <div style={{ fontSize: 12, color: t.textMid, lineHeight: 1.4 }}>{n.body}</div>
                <div style={{ fontSize: 10, color: t.textDim, marginTop: 4 }}>{Math.floor((Date.now() - n.time) / 60000)}m ago</div>
              </div>
              {!n.read && <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.primary, flexShrink: 0, marginTop: 4 }} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SIDEBAR
═══════════════════════════════════════════════════════════════════════════ */
function Sidebar({ role, view, setView, user, unread, onBell, onLogout }) {
  const { theme: t, toggleTheme, isDark } = useApp();
  const studentNav = [
    { id: "dashboard", icon: "⬡", label: "Dashboard" }, { id: "profile", icon: "◎", label: "My Profile" },
    { id: "assessments", icon: "◈", label: "Assessments" }, { id: "readiness", icon: "◉", label: "Readiness Score" },
    { id: "internships", icon: "◇", label: "Internships" }, { id: "applications", icon: "◻", label: "Applications" },
    { id: "github", icon: "⬢", label: "GitHub Verify" },
  ];
  const companyNav = [
    { id: "dashboard", icon: "⬡", label: "Dashboard" }, { id: "talent", icon: "◈", label: "Talent Pool" },
    { id: "internships", icon: "◇", label: "My Internships" }, { id: "applications", icon: "◻", label: "Applications" },
    { id: "analytics", icon: "◉", label: "Analytics" },
  ];
  const nav = role === "company" ? companyNav : studentNav;
  return (
    <div style={{ width: 230, background: t.sidebar, display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0, flexShrink: 0, borderRight: `1px solid rgba(255,255,255,0.05)` }}>
      <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 38, height: 38, background: `linear-gradient(135deg,${t.primary},${t.accent})`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: `0 0 24px ${t.primaryGlow}` }}>⚡</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 900, color: "#e8e8f8", letterSpacing: "-0.02em" }}>TalentVerify</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.1em" }}>AI PLATFORM v2</div>
          </div>
        </div>
      </div>
      <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
        {nav.map(item => {
          const active = view === item.id;
          return (
            <button key={item.id} onClick={() => setView(item.id)} style={{
              display: "flex", alignItems: "center", gap: 11, padding: "10px 12px", borderRadius: 11,
              border: "none", cursor: "pointer", background: active ? "rgba(123,114,255,0.18)" : "transparent",
              color: active ? "#a8a0ff" : "rgba(255,255,255,0.45)", fontFamily: "inherit", fontWeight: 600, fontSize: 13,
              textAlign: "left", outline: "none", transition: "all 0.15s",
              borderLeft: active ? `2px solid ${t.primaryLight}` : "2px solid transparent",
              position: "relative"
            }}>
              <span style={{ fontSize: 16, opacity: active ? 1 : 0.5 }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>
      <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 3, marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginRight: 4 }}>{isDark ? "☾" : "☀"}</span>
          <button onClick={toggleTheme} style={{ position: "relative", width: 44, height: 24, borderRadius: 12, background: isDark ? "rgba(123,114,255,0.4)" : "rgba(255,255,255,0.15)", border: "none", cursor: "pointer", padding: 0 }}>
            <div style={{ position: "absolute", top: 3, left: isDark ? 23 : 3, width: 18, height: 18, borderRadius: 9, background: "#fff", transition: "left 0.25s", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }} />
          </button>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginLeft: 4 }}>Theme</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg,${t.primary},${t.primaryLight})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{user.email[0].toUpperCase()}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#e8e8f8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "capitalize" }}>{user.role}</div>
          </div>
          <button onClick={onBell} style={{ position: "relative", background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 18, padding: 4 }}>
            🔔{unread > 0 && <span style={{ position: "absolute", top: -2, right: -2, width: 16, height: 16, borderRadius: "50%", background: t.danger, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff" }}>{unread}</span>}
          </button>
        </div>
        <Btn variant="secondary" size="sm" onClick={onLogout} full sx={{ color: "rgba(255,255,255,0.4)", borderColor: "rgba(255,255,255,0.1)" }}>Sign Out</Btn>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   AUTH PAGE
═══════════════════════════════════════════════════════════════════════════ */
function AuthPage({ onAuth }) {
  const { theme: t, isDark, toggleTheme } = useApp();
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState(""); const [pw, setPw] = useState("");
  const [fn, setFn] = useState(""); const [ln, setLn] = useState(""); const [co, setCo] = useState("");
  const [err, setErr] = useState(""); const [loading, setLoading] = useState(false);

  const demo = (r) => {
    const e = r === "student" ? "student@demo.com" : "company@demo.com";
    setEmail(e); setPw("demo"); setRole(r); setMode("login");
  };

  const submit = () => {
    if (!email || !pw) { setErr("All fields required"); return; }
    setErr(""); setLoading(true);
    setTimeout(() => {
      const id = email.replace(/\W/g, "_");
      const user = { id, email, role: mode === "login" ? (email.includes("company") ? "company" : "student") : role, firstName: fn || "Alex", lastName: ln || "Chen", company: co };
      if (user.role === "student" && !DB.students[id]) {
        DB.students[id] = { id, email, firstName: user.firstName, lastName: user.lastName, university: "", degree: "", bio: "", skills: [], targetRole: ROLES[0], profileCompleteness: 15, readiness: { overall: 0, technical: 0, problemSolving: 0, domainKnowledge: 0, communication: 0, confidence: 0 }, verifiedSkills: 0, completedAssessments: 0, githubVerified: false, githubUsername: null, githubScore: 0, verifiedProjects: [] };
      }
      if (user.role === "company" && !DB.companies[id]) {
        DB.companies[id] = { id, email, name: co || "Demo Corp", logo: "🏢", industry: "Technology" };
      }
      setLoading(false);
      onAuth(user);
    }, 800);
  };

  return (
    <div style={{ minHeight: "100vh", background: t.pageBg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, position: "relative", overflow: "hidden" }}>
      {/* Decorative blobs */}
      <div style={{ position: "absolute", top: "-20%", left: "-10%", width: "50vw", height: "50vw", borderRadius: "50%", background: t.primaryGlow, filter: "blur(80px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-20%", right: "-10%", width: "40vw", height: "40vw", borderRadius: "50%", background: t.accentGlow, filter: "blur(80px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 20, right: 20 }}>
        <button onClick={toggleTheme} style={{ padding: "8px 16px", background: t.glass, border: `1px solid ${t.border}`, borderRadius: 10, color: t.textMid, cursor: "pointer", fontSize: 13, fontFamily: "inherit", backdropFilter: "blur(10px)" }}>{isDark ? "☀ Light" : "☾ Dark"}</button>
      </div>
      <div style={{ width: "100%", maxWidth: 430, position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ width: 60, height: 60, background: `linear-gradient(135deg,${t.primary},${t.accent})`, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, margin: "0 auto 16px", boxShadow: `0 0 48px ${t.primaryGlow}` }}>⚡</div>
          <h1 style={{ margin: "0 0 6px", fontSize: 30, fontWeight: 900, color: t.text, letterSpacing: "-0.03em", fontFamily: "'Cabinet Grotesk','DM Sans',sans-serif" }}>TalentVerify AI</h1>
          <p style={{ margin: 0, fontSize: 14, color: t.textDim }}>Real-time AI Internship Platform</p>
        </div>
        <Card glass style={{ padding: 32 }}>
          <div style={{ display: "flex", gap: 4, padding: 4, background: t.inputBg, borderRadius: 13, marginBottom: 28 }}>
            {["login", "register"].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: "9px 0", borderRadius: 10, fontSize: 13, fontWeight: 700, background: mode === m ? t.surface : "transparent", color: mode === m ? t.text : t.textDim, border: `1px solid ${mode === m ? t.border : "transparent"}`, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s", boxShadow: mode === m ? "0 2px 8px rgba(0,0,0,0.1)" : "none" }}>{m === "login" ? "Sign In" : "Create Account"}</button>
            ))}
          </div>
          {mode === "register" && (
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {["student", "company"].map(r => (
                <button key={r} onClick={() => setRole(r)} style={{ flex: 1, padding: "12px 0", borderRadius: 12, fontSize: 13, fontWeight: 700, background: role === r ? t.primaryGlow : "transparent", color: role === r ? t.primaryLight : t.textDim, border: `1px solid ${role === r ? t.primary + "44" : t.border}`, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>
                  {r === "student" ? "🎓 Student" : "🏢 Company"}
                </button>
              ))}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
            {mode === "register" && role === "student" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 12 }}>
                <Input label="First Name" value={fn} onChange={setFn} placeholder="Alex" />
                <Input label="Last Name" value={ln} onChange={setLn} placeholder="Chen" />
              </div>
            )}
            {mode === "register" && role === "company" && <Input label="Company Name" value={co} onChange={setCo} placeholder="Acme Corp" />}
            <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
            <Input label="Password" type="password" value={pw} onChange={setPw} placeholder="••••••••" />
            {err && <div style={{ padding: "10px 14px", background: t.danger + "18", border: `1px solid ${t.danger}33`, borderRadius: 10, fontSize: 13, color: t.danger }}>{err}</div>}
            <Btn onClick={submit} disabled={loading} full>{loading ? "Please wait..." : mode === "login" ? "Sign In →" : "Create Account →"}</Btn>
          </div>
          <div style={{ marginTop: 20, padding: 16, background: t.inputBg, borderRadius: 13 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: t.textDim, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Quick Demo</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => demo("student")} style={{ flex: 1, padding: "9px 0", background: t.primaryGlow, border: `1px solid ${t.primary}33`, borderRadius: 9, color: t.primaryLight, fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 700 }}>🎓 Student</button>
              <button onClick={() => demo("company")} style={{ flex: 1, padding: "9px 0", background: t.accentGlow, border: `1px solid ${t.accent}33`, borderRadius: 9, color: t.accent, fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 700 }}>🏢 Company</button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   STUDENT: DASHBOARD
═══════════════════════════════════════════════════════════════════════════ */
function StudentDashboard({ student, setView }) {
  const { theme: t } = useApp();
  const s = student.readiness || { overall: 0, technical: 0, problemSolving: 0, domainKnowledge: 0, communication: 0, confidence: 0 };

  const [internList, setInternList] = useState(Object.values(DB.internships));
  const [apps, setApps] = useState(DB.getStudentApplications(student.id));

  useEffect(() => {
    const unsub = DB.subscribe(({ event }) => {
      if (["NEW_INTERNSHIP"].includes(event)) setInternList(Object.values(DB.internships));
      if (["NEW_APPLICATION", "APPLICATION_STATUS_CHANGED"].includes(event)) setApps(DB.getStudentApplications(student.id));
    });
    return unsub;
  }, [student.id]);

  const matchedInterns = internList.filter(i => (s.overall || 0) >= i.minScore && i.status === "active");

  const dims = [
    { key: "technical", label: "Technical", color: t.primary }, { key: "problemSolving", label: "Problem Solving", color: "#8b5cf6" },
    { key: "domainKnowledge", label: "Domain Knowledge", color: t.accent }, { key: "communication", label: "Communication", color: t.warn },
    { key: "confidence", label: "Confidence", color: "#ec4899" },
  ];

  return (
    <div style={{ padding: 32, maxWidth: 1600, margin: "0 auto" }}>
      <div style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ margin: "0 0 6px", fontSize: 28, fontWeight: 900, color: t.text, letterSpacing: "-0.02em" }}>Welcome back, {student.firstName} 👋</h1>
          <p style={{ margin: 0, fontSize: 14, color: t.textDim }}>Your AI-powered internship readiness overview</p>
        </div>
        {student.githubVerified && <Badge text={`🐙 GitHub Verified • ${student.githubUsername}`} color={t.github} />}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 20, marginBottom: 24 }}>
        {/* Readiness card */}
        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: t.textDim, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>AI Readiness Score</div>
              <div style={{ fontSize: 13, color: t.textMid }}>Multi-dimensional verification</div>
            </div>
            <Btn variant="ghost" size="sm" onClick={() => setView("readiness")}>Full Report →</Btn>
          </div>
          <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
            <ScoreRing score={s.overall} size={120} sw={10} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
              {dims.map(d => (
                <div key={d.key}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 11, color: t.textMid, fontWeight: 600 }}>{d.label}</span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: d.color, fontFamily: "'JetBrains Mono',monospace" }}>{s[d.key] || 0}</span>
                  </div>
                  <ProgressBar value={s[d.key] || 0} color={d.color} h={5} anim />
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { label: "Readiness Score", val: s.overall || 0, sub: "out of 100", color: scoreColor(s.overall, t), icon: "◉" },
            { label: "Matched Internships", val: matchedInterns.length, sub: "eligible right now", color: t.accent, icon: "◇" },
            { label: "Applications", val: apps.length, sub: `${apps.filter(a => a.status === "shortlisted").length} shortlisted`, color: t.primary, icon: "◻" },
          ].map(stat => (
            <Card key={stat.label} style={{ padding: 18, display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: stat.color + "15", border: `1px solid ${stat.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: stat.color, flexShrink: 0 }}>{stat.icon}</div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 900, color: stat.color, fontFamily: "'JetBrains Mono',monospace", lineHeight: 1 }}>{stat.val}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: t.text, marginTop: 2 }}>{stat.label}</div>
                <div style={{ fontSize: 11, color: t.textDim }}>{stat.sub}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        {[
          { icon: "◈", title: "Take Assessment", desc: "Verify skills via AI tests", view: "assessments", color: t.primary },
          { icon: "◇", title: "Browse Internships", desc: `${matchedInterns.length} eligible openings`, view: "internships", color: t.accent },
          { icon: "⬢", title: "Verify GitHub", desc: student.githubVerified ? "Verified ✓" : "Connect to boost score", view: "github", color: t.github },
          { icon: "◎", title: "Complete Profile", desc: `${student.profileCompleteness}% complete`, view: "profile", color: t.warn },
        ].map(a => (
          <Card key={a.title} hover onClick={() => setView(a.view)} style={{ padding: 20 }}>
            <div style={{ fontSize: 22, color: a.color, marginBottom: 10 }}>{a.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: t.text, marginBottom: 4 }}>{a.title}</div>
            <div style={{ fontSize: 11, color: t.textDim, lineHeight: 1.4 }}>{a.desc}</div>
          </Card>
        ))}
      </div>

      {/* Recent applications */}
      {apps.length > 0 && (
        <Card style={{ marginTop: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: t.text }}>Recent Applications</div>
            <Btn variant="ghost" size="sm" onClick={() => setView("applications")}>View All</Btn>
          </div>
          {apps.slice(0, 3).map(app => {
            const intern = DB.internships[app.internshipId];
            const sColors = { pending: t.warn, shortlisted: t.accent, rejected: t.danger, reviewed: t.primary };
            return intern ? (
              <div key={app.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${t.border}` }}>
                <div style={{ fontSize: 22 }}>{intern.logo}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{intern.title}</div>
                  <div style={{ fontSize: 11, color: t.textDim }}>{intern.company}</div>
                </div>
                <Badge text={app.status.toUpperCase()} color={sColors[app.status] || t.textDim} small dot={app.status === "shortlisted" ? "pulse" : undefined} />
                <div style={{ fontSize: 12, fontWeight: 800, color: scoreColor(app.matchScore, t), fontFamily: "'JetBrains Mono',monospace" }}>{app.matchScore}% match</div>
              </div>
            ) : null;
          })}
        </Card>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   STUDENT: GITHUB VERIFICATION
═══════════════════════════════════════════════════════════════════════════ */
function GitHubVerify({ student, onUpdate, toast }) {
  const { theme: t } = useApp();
  const [username, setUsername] = useState(student.githubUsername || "");
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [repos, setRepos] = useState(student.verifiedProjects || []);

  const fetchRepos = () => {
    if (!username) { toast("Enter a GitHub username", "error"); return; }
    setLoading(true);
    setTimeout(() => {
      setRepos(MOCK_GITHUB_REPOS.map(r => ({ ...r, username })));
      setFetched(true); setLoading(false);
    }, 1500);
  };

  const verify = () => {
    if (!repos.length) return;
    DB.verifyGitHub(student.id, username, repos);
    const s = DB.students[student.id];
    onUpdate({ ...student, githubVerified: true, githubUsername: username, verifiedProjects: repos, githubScore: s.githubScore });
    toast("GitHub account verified successfully!", "success", "🐙 GitHub Verified");
    DB.emit("GITHUB_VERIFIED", { studentId: student.id, username, score: s.githubScore });
  };

  return (
    <div style={{ padding: 32, maxWidth: 1600, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 900, color: t.text }}>GitHub Verification</h1>
        <p style={{ margin: 0, fontSize: 13, color: t.textDim }}>Connect GitHub to get a verified project badge and boost your match score by up to 20%</p>
      </div>

      {/* How it boosts score */}
      <Card style={{ marginBottom: 24, background: `linear-gradient(135deg,${t.primaryGlow},${t.accentGlow})`, border: `1px solid ${t.primary}22` }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: t.text, marginBottom: 12 }}>📈 How GitHub boosts your match score</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          {[{ label: "Skill Overlap", w: "40%", color: t.primary }, { label: "Readiness Align", w: "30%", color: "#8b5cf6" }, { label: "GitHub Score", w: "20%", color: t.accent, highlight: true }, { label: "Role Fit", w: "10%", color: t.warn }].map(f => (
            <div key={f.label} style={{ padding: 12, background: f.highlight ? t.accent + "18" : "transparent", border: `1px solid ${f.highlight ? t.accent + "44" : t.border}`, borderRadius: 10, textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: f.color }}>{f.w}</div>
              <div style={{ fontSize: 10, color: t.textDim, marginTop: 3 }}>{f.label}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, padding: "10px 14px", background: t.inputBg, borderRadius: 10, fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: t.textMid }}>
          matchScore = (skillOverlap×0.4) + (readinessAlignment×0.3) + <span style={{ color: t.accent }}>(githubScore×0.2)</span> + (roleFit×0.1)
        </div>
      </Card>

      <Card>
        <div style={{ fontSize: 15, fontWeight: 800, color: t.text, marginBottom: 20 }}>Connect GitHub Account</div>

        {student.githubVerified && (
          <div style={{ display: "flex", gap: 12, alignItems: "center", padding: 16, background: t.accentGlow, border: `1px solid ${t.accent}22`, borderRadius: 12, marginBottom: 20 }}>
            <span style={{ fontSize: 28 }}>🐙</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: t.accent }}>@{student.githubUsername} — Verified</div>
              <div style={{ fontSize: 12, color: t.textMid }}>GitHub Score: {student.githubScore}/100 · {student.verifiedProjects?.length || 0} projects verified</div>
            </div>
            <Badge text="✓ VERIFIED" color={t.accent} />
          </div>
        )}

        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          <Input label="GitHub Username" value={username} onChange={setUsername} placeholder="e.g. octocat" />
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <Btn variant="github" onClick={fetchRepos} disabled={loading} icon="🐙">{loading ? "Fetching..." : "Fetch Repos"}</Btn>
          </div>
        </div>

        {fetched && repos.length > 0 && (
          <>
            <div style={{ fontSize: 13, fontWeight: 800, color: t.text, marginBottom: 14 }}>Verified Projects ({repos.length})</div>
            {repos.map((repo, i) => (
              <div key={i} style={{ padding: 16, background: t.surfaceAlt, borderRadius: 12, border: `1px solid ${t.border}`, marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: t.text, marginBottom: 4 }}>📁 {repo.name}</div>
                    <div style={{ display: "flex", gap: 12, fontSize: 11, color: t.textDim }}>
                      <span>⭐ {repo.stars}</span><span>🍴 {repo.forks}</span><span>📝 {repo.commits} commits</span><span>🕐 {repo.lastActive}</span>
                    </div>
                  </div>
                  <ScoreRing score={repo.verifiedScore} size={52} sw={5} />
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                  {repo.tech.map(tech => <span key={tech} style={{ padding: "3px 10px", background: t.primaryGlow, border: `1px solid ${t.primary}22`, borderRadius: 6, fontSize: 11, color: t.primary, fontWeight: 600 }}>{tech}</span>)}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Badge text={repo.contributor ? "✓ Contributor" : "Observer"} color={repo.contributor ? t.accent : t.textDim} small />
                  <Badge text={`Verified Score: ${repo.verifiedScore}`} color={scoreColor(repo.verifiedScore, t)} small />
                </div>
              </div>
            ))}
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 16 }}>
              <Btn variant="accent" onClick={verify} icon="🐙">Verify & Save to Profile</Btn>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   STUDENT: ASSESSMENTS
═══════════════════════════════════════════════════════════════════════════ */
function Assessments({ student, onUpdate, toast }) {
  const { theme: t } = useApp();
  const [active, setActive] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [result, setResult] = useState(null);
  const timerRef = useRef();

  const start = (a) => { setActive(a); setAnswers({}); setResult(null); setTimeLeft(a.duration * 60); };

  useEffect(() => {
    if (active && !result) {
      timerRef.current = setInterval(() => setTimeLeft(t => { if (t <= 1) { clearInterval(timerRef.current); submit(); return 0; } return t - 1; }), 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [active, result]);

  const submit = useCallback(() => {
    clearInterval(timerRef.current);
    let score = 0, total = 0;
    active.questions.forEach(q => {
      total += q.points;
      if (q.type === "mcq" && answers[q.id] === q.correct) score += q.points;
      if (q.type === "text" && (answers[q.id] || "").length > 80) score += Math.round(q.points * 0.78);
    });
    const pct = Math.round((score / total) * 100);
    const passed = pct >= 60;
    setResult({ score: pct, passed, strengths: pct >= 70 ? ["Clear conceptual grasp", "Efficient approach"] : ["Attempted core concepts"], improvements: pct < 80 ? ["Review fundamentals", "Practice timed conditions"] : ["Explore advanced edge cases"] });
    if (passed) {
      const d = DB.students[student.id];
      const newSkills = (active.skills || []).map(s => ({ name: s, isVerified: true, verifiedScore: pct }));
      const existing = (student.skills || []).map(s => s.name);
      const merged = [...(student.skills || []).map(s => active.skills.includes(s.name) ? { ...s, isVerified: true, verifiedScore: pct } : s), ...newSkills.filter(s => !existing.includes(s.name))];
      const verified = merged.filter(s => s.isVerified).length;
      const newComp = (d.completedAssessments || 0) + 1;
      const tech = Math.min(100, (d.readiness?.technical || 30) + Math.round(pct * 0.18));
      const domain = Math.min(100, (d.readiness?.domainKnowledge || 25) + Math.round(pct * 0.12));
      const conf = Math.min(100, verified * 8 + newComp * 5);
      const overall = Math.round(tech * 0.35 + (d.readiness?.problemSolving || 35) * 0.25 + domain * 0.20 + (d.readiness?.communication || 45) * 0.15 + conf * 0.05);
      const newReadiness = { overall, technical: tech, problemSolving: d.readiness?.problemSolving || 35, domainKnowledge: domain, communication: d.readiness?.communication || 45, confidence: conf };
      const updated = { ...student, skills: merged, verifiedSkills: verified, completedAssessments: newComp, readiness: newReadiness, profileCompleteness: Math.min(100, (student.profileCompleteness || 15) + 8) };
      DB.students[student.id] = { ...DB.students[student.id], ...updated };
      DB.updateStudentReadiness(student.id, newReadiness);
      onUpdate(updated);
    }
  }, [active, answers, student]);

  const fmt = (s) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  if (active && !result) {
    return (
      <div style={{ padding: 32, maxWidth: 1600, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 800, color: t.text }}>{active.title}</h2>
            <div style={{ display: "flex", gap: 8 }}><Badge text={active.type.toUpperCase()} color={t.primary} small /><Badge text={active.difficulty} color={t.warn} small /></div>
          </div>
          <div style={{ padding: "10px 20px", background: timeLeft < 60 ? t.danger + "22" : t.primaryGlow, border: `1px solid ${timeLeft < 60 ? t.danger : t.primary}44`, borderRadius: 12, textAlign: "center" }}>
            <div style={{ fontSize: 10, color: t.textDim, marginBottom: 3 }}>TIME LEFT</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: timeLeft < 60 ? t.danger : t.accent, fontFamily: "'JetBrains Mono',monospace" }}>{fmt(timeLeft)}</div>
          </div>
        </div>
        {active.questions.map((q, qi) => (
          <Card key={q.id} style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 16 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: t.primaryGlow, border: `1px solid ${t.primary}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: t.primaryLight, flexShrink: 0 }}>{qi + 1}</div>
              <p style={{ margin: 0, fontSize: 14, color: t.text, lineHeight: 1.6 }}>{q.prompt}</p>
            </div>
            {q.type === "mcq" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {q.options.map((opt, oi) => (
                  <label key={oi} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: answers[q.id] === oi ? t.primaryGlow : t.inputBg, border: `1px solid ${answers[q.id] === oi ? t.primary + "44" : t.border}`, borderRadius: 11, cursor: "pointer", transition: "all 0.15s" }}>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${answers[q.id] === oi ? t.primary : t.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {answers[q.id] === oi && <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.primary }} />}
                    </div>
                    <input type="radio" hidden checked={answers[q.id] === oi} onChange={() => setAnswers(a => ({ ...a, [q.id]: oi }))} />
                    <span style={{ fontSize: 13, color: t.text }}>{opt}</span>
                  </label>
                ))}
              </div>
            ) : (
              <Input value={answers[q.id] || ""} onChange={v => setAnswers(a => ({ ...a, [q.id]: v }))} placeholder="Type your detailed answer here..." multiline rows={8} />
            )}
          </Card>
        ))}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 8 }}>
          <Btn variant="secondary" onClick={() => { clearInterval(timerRef.current); setActive(null); }}>Exit</Btn>
          <Btn variant="accent" onClick={submit}>Submit Assessment</Btn>
        </div>
      </div>
    );
  }

  if (result) {
    const color = result.passed ? t.accent : t.danger;
    return (
      <div style={{ padding: 32, maxWidth: 1600, margin: "0 auto" }}>
        <Card style={{ textAlign: "center", marginBottom: 24, padding: 40 }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>{result.passed ? "🎉" : "📚"}</div>
          <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 800, color: t.text }}>{result.passed ? "Assessment Passed!" : "Keep Practicing"}</h2>
          <div style={{ margin: "20px auto 20px", display: "inline-block" }}><ScoreRing score={result.score} size={110} sw={10} /></div>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 16 }}>
            <Badge text={result.passed ? "✓ VERIFIED" : "NOT VERIFIED"} color={color} />
            <Badge text={`${result.score}% Score`} color={color} />
          </div>
          {result.passed && <div style={{ padding: 12, background: t.accentGlow, border: `1px solid ${t.accent}22`, borderRadius: 10, fontSize: 13, color: t.accent, fontWeight: 600 }}>Skills verified: {active.skills.join(", ")} · Readiness score updated!</div>}
        </Card>
        <Card style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: t.text, marginBottom: 14 }}>🤖 AI Evaluation</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 12 }}>
            <div style={{ padding: 12, background: t.accentGlow, borderRadius: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: t.accent, marginBottom: 8, textTransform: "uppercase" }}>Strengths</div>
              {result.strengths.map(s => <div key={s} style={{ fontSize: 12, color: t.textMid, marginBottom: 4 }}>✓ {s}</div>)}
            </div>
            <div style={{ padding: 12, background: t.warn + "11", borderRadius: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: t.warn, marginBottom: 8, textTransform: "uppercase" }}>Improve</div>
              {result.improvements.map(s => <div key={s} style={{ fontSize: 12, color: t.textMid, marginBottom: 4 }}>→ {s}</div>)}
            </div>
          </div>
        </Card>
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <Btn variant="secondary" onClick={() => { setResult(null); setActive(null); }}>Back</Btn>
          {!result.passed && <Btn onClick={() => start(active)}>Retry</Btn>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 32, maxWidth: 1600, margin: "0 auto" }}>
      <h1 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 900, color: t.text }}>Skill Assessments</h1>
      <p style={{ margin: "0 0 28px", fontSize: 13, color: t.textDim }}>AI-proctored, anti-cheat verified skill tests</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
        {ASSESSMENTS.map(a => {
          const typeColor = { mcq: t.primary, coding: "#8b5cf6", case_study: t.accent, simulation: t.warn };
          return (
            <Card key={a.id} hover onClick={() => start(a)}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", gap: 8 }}><Badge text={a.type.toUpperCase()} color={typeColor[a.type] || t.primary} small /><Badge text={a.difficulty} color={t.warn} small /></div>
                <span style={{ fontSize: 11, color: t.textDim, fontFamily: "'JetBrains Mono',monospace" }}>{a.duration}m</span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: t.text, marginBottom: 6 }}>{a.title}</div>
              <div style={{ fontSize: 12, color: t.textDim, marginBottom: 14 }}>{a.role}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                {a.skills.map(s => <span key={s} style={{ padding: "3px 9px", background: t.primaryGlow, border: `1px solid ${t.primary}22`, borderRadius: 6, fontSize: 11, color: t.primaryLight, fontWeight: 600 }}>{s}</span>)}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: t.textDim }}>{a.questions.length} questions</span>
                <Btn size="sm" onClick={e => { e.stopPropagation(); start(a); }}>Start →</Btn>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   STUDENT: INTERNSHIPS — Real-time synced
═══════════════════════════════════════════════════════════════════════════ */
function StudentInternships({ student, toast }) {
  const { theme: t } = useApp();
  const [internships, setInternships] = useState(Object.values(DB.internships));
  const [search, setSearch] = useState("");
  const [applyModal, setApplyModal] = useState(null);
  const [note, setNote] = useState("");
  const [newBadge, setNewBadge] = useState(null);

  // Real-time: listen for new internships
  useEffect(() => {
    const unsub = DB.subscribe(({ event, payload }) => {
      if (event === "NEW_INTERNSHIP") {
        setInternships(Object.values(DB.internships));
        if (payload.intern.minScore <= (student.readiness?.overall || 0)) {
          setNewBadge(payload.intern.title);
          setTimeout(() => setNewBadge(null), 4000);
        }
      }
    });
    return unsub;
  }, [student.readiness]);

  const sSkills = (student.skills || []).map(s => s.name);
  const applied = (student.applications || []).map(a => a.internshipId);

  const filtered = internships.filter(i => i.status === "active" && (!search || i.title.toLowerCase().includes(search.toLowerCase()) || i.company.toLowerCase().includes(search.toLowerCase())));
  const recommended = filtered.filter(i => (student.readiness?.overall || 0) >= i.minScore);
  const other = filtered.filter(i => (student.readiness?.overall || 0) < i.minScore);

  const renderCard = (intern) => {
    const match = calcMatchScore(student, intern);
    const canApply = (student.readiness?.overall || 0) >= intern.minScore;
    const skillOk = match.skillOverlap >= 70;
    const hasApplied = DB.getStudentApplications(student.id).some(a => a.internshipId === intern.id);
    return (
      <Card key={intern.id} hover>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: 46, height: 46, borderRadius: 13, background: t.inputBg, border: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{intern.logo}</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: t.text }}>{intern.title}</div>
              <div style={{ fontSize: 12, color: t.textDim }}>{intern.company} · {intern.location}</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 15, fontWeight: 900, color: t.accent, fontFamily: "'JetBrains Mono',monospace" }}>${intern.stipend?.toLocaleString()}</div>
            <div style={{ fontSize: 9, color: t.textDim }}>/ MONTH</div>
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
          {intern.requiredSkills.map(s => {
            const has = sSkills.map(x => x.toLowerCase()).includes(s.toLowerCase());
            return <span key={s} style={{ padding: "3px 9px", background: has ? t.accentGlow : t.inputBg, border: `1px solid ${has ? t.accent + "33" : t.border}`, borderRadius: 6, fontSize: 11, color: has ? t.accent : t.textDim, fontWeight: 600 }}>{has && "✓ "}{s}</span>;
          })}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 8, marginBottom: 14 }}>
          {[{ l: "Match", v: match.matchScore, c: scoreColor(match.matchScore, t) }, { l: "Skill Fit", v: match.skillOverlap, c: skillOk ? t.accent : t.danger }, { l: "Min Score", v: intern.minScore, c: canApply ? t.accent : t.danger }].map(d => (
            <div key={d.l} style={{ padding: "9px", background: t.inputBg, borderRadius: 9 }}>
              <div style={{ fontSize: 9, color: t.textDim, marginBottom: 3, textTransform: "uppercase" }}>{d.l}</div>
              <div style={{ fontSize: 15, fontWeight: 900, color: d.c, fontFamily: "'JetBrains Mono',monospace" }}>{d.v}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 11, color: t.textDim }}>⏱ {intern.duration} · 👥 {intern.applicantCount} applicants</div>
          {hasApplied ? <Badge text="✓ Applied" color={t.accent} small /> :
            canApply && skillOk ? <Btn size="sm" variant="accent" onClick={() => setApplyModal(intern)}>Apply Now</Btn> :
              <div style={{ fontSize: 11, color: t.danger, fontWeight: 600 }}>{!canApply ? `Need score ${intern.minScore}` : "Need 70%+ skill match"}</div>}
        </div>
      </Card>
    );
  };

  const handleApply = (intern) => {
    const match = calcMatchScore(student, intern);
    if ((student.readiness?.overall || 0) < intern.minScore) { toast(`Need readiness ≥ ${intern.minScore} to apply`, "error", "Eligibility Check Failed"); return; }
    if (match.skillOverlap < 70) { toast(`Need ≥70% skill match. Current: ${match.skillOverlap}%`, "warn", "Insufficient Skill Match"); return; }
    const app = DB.applyToInternship(student.id, intern.id, { matchScore: match.matchScore, aiConfidence: match.aiConfidence, coverNote: note });
    if (!app) { toast("Already applied or error", "error"); return; }
    setApplyModal(null); setNote("");
    toast(`Applied to ${intern.title}!`, "success", "Application Submitted");
    setInternships(Object.values(DB.internships));
  };

  return (
    <div style={{ padding: 32, maxWidth: 1600, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 900, color: t.text }}>Internship Opportunities</h1>
          <p style={{ margin: 0, fontSize: 13, color: t.textDim }}>AI-matched openings based on your readiness and skills</p>
        </div>
        {newBadge && <div style={{ padding: "10px 18px", background: t.accentGlow, border: `1px solid ${t.accent}44`, borderRadius: 12, animation: "slideInRight 0.3s ease" }}>✨ New match: <b style={{ color: t.accent }}>{newBadge}</b></div>}
      </div>

      <div style={{ marginBottom: 24 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search roles or companies..."
          style={{ width: "100%", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: 12, padding: "12px 16px", color: t.text, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {recommended.length > 0 && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: t.accent, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 20 }}>⭐</span> Eligible & Recommended</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>{recommended.map(renderCard)}</div>
          </div>
        )}
        {other.length > 0 && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: t.textMid, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 20 }}>🔒</span> Expand Skills to Unlock</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>{other.map(renderCard)}</div>
          </div>
        )}
        {filtered.length === 0 && <div style={{ color: t.textDim, textAlign: "center", padding: 40 }}>No internships found.</div>}
      </div>

      <Modal open={!!applyModal} onClose={() => setApplyModal(null)} title={`Apply — ${applyModal?.title}`}>
        {applyModal && (() => {
          const match = calcMatchScore(student, applyModal); return (
            <div>
              <div style={{ display: "flex", gap: 12, alignItems: "center", padding: 16, background: t.inputBg, borderRadius: 12, marginBottom: 20 }}>
                <span style={{ fontSize: 28 }}>{applyModal.logo}</span>
                <div><div style={{ fontWeight: 800, color: t.text }}>{applyModal.title}</div><div style={{ fontSize: 12, color: t.textDim }}>{applyModal.company}</div></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12, marginBottom: 20 }}>
                {[{ l: "AI Match Score", v: match.matchScore, c: scoreColor(match.matchScore, t) }, { l: "Skill Overlap", v: match.skillOverlap + "%", c: t.primary }, { l: "AI Confidence", v: match.aiConfidence + "%", c: t.accent }].map(d => (
                  <div key={d.l} style={{ padding: 14, background: t.inputBg, borderRadius: 11, textAlign: "center" }}>
                    <div style={{ fontSize: 9, color: t.textDim, marginBottom: 6, textTransform: "uppercase" }}>{d.l}</div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: d.c, fontFamily: "'JetBrains Mono',monospace" }}>{d.v}</div>
                  </div>
                ))}
              </div>
              {student.githubVerified && <div style={{ padding: 12, background: t.accentGlow, border: `1px solid ${t.accent}22`, borderRadius: 10, marginBottom: 16, fontSize: 12, color: t.accent }}>🐙 GitHub score ({student.githubScore}/100) included in match calculation</div>}
              <Input label="Cover Note (optional)" value={note} onChange={setNote} multiline placeholder="Why are you excited about this role?" />
              <div style={{ marginTop: 16, padding: 12, background: t.inputBg, borderRadius: 10, fontSize: 12, color: t.textDim }}>⚡ Your verified readiness score, skills, and GitHub projects are automatically shared with the company.</div>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 20 }}>
                <Btn variant="secondary" onClick={() => setApplyModal(null)}>Cancel</Btn>
                <Btn variant="accent" onClick={() => handleApply(applyModal)}>Submit Application</Btn>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   STUDENT: APPLICATIONS — Real-time status updates
═══════════════════════════════════════════════════════════════════════════ */
function StudentApplications({ student }) {
  const { theme: t } = useApp();
  const [apps, setApps] = useState([]);

  useEffect(() => {
    setApps(DB.getStudentApplications(student.id));
    const unsub = DB.subscribe(({ event, payload }) => {
      if (event === "APPLICATION_STATUS_CHANGED" && payload.studentId === student.id) {
        setApps(DB.getStudentApplications(student.id));
      }
    });
    return unsub;
  }, [student.id]);

  const sColors = { pending: t.warn, reviewed: t.primary, shortlisted: t.accent, interview: "#8b5cf6", offered: t.accent, rejected: t.danger };

  return (
    <div style={{ padding: 32, maxWidth: 1600, margin: "0 auto" }}>
      <h1 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 900, color: t.text }}>My Applications</h1>
      <p style={{ margin: "0 0 28px", fontSize: 13, color: t.textDim }}>{apps.length} applications · Real-time status updates</p>
      {apps.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: t.text, marginBottom: 8 }}>No applications yet</div>
          <div style={{ fontSize: 13, color: t.textDim }}>Browse internships and apply to get started</div>
        </Card>
      ) : apps.map(app => {
        const intern = DB.internships[app.internshipId];
        return intern ? (
          <Card key={app.id} style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ fontSize: 28, lineHeight: 1 }}>{intern.logo}</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: t.text, marginBottom: 3 }}>{intern.title}</div>
                  <div style={{ fontSize: 12, color: t.textDim, marginBottom: 10 }}>{intern.company}</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <Badge text={`${app.status.toUpperCase()}`} color={sColors[app.status] || t.textDim} dot={app.status === "shortlisted" ? "pulse" : undefined} />
                    <Badge text={`Match: ${app.matchScore}%`} color={scoreColor(app.matchScore, t)} small />
                    <Badge text={`AI Confidence: ${app.aiConfidence}%`} color={t.primary} small />
                    {app.studentSnapshot?.githubVerified && <Badge text="🐙 GitHub Verified" color={t.github} small />}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: t.textDim, marginBottom: 4 }}>Readiness at apply</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: scoreColor(app.readinessAtApply, t), fontFamily: "'JetBrains Mono',monospace" }}>{app.readinessAtApply}</div>
              </div>
            </div>
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${t.border}`, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
              {[{ l: "Skill Overlap", v: `${Math.round(app.matchScore * 0.4 / 0.4)}%`, c: t.primary }, { l: "GitHub Score", v: app.githubScore || 0, c: t.github }, { l: "Role Fit", v: "90%", c: t.accent }, { l: "Applied", v: new Date(app.appliedAt).toLocaleDateString(), c: t.textDim }].map(d => (
                <div key={d.l}>
                  <div style={{ fontSize: 9, color: t.textDim, marginBottom: 3, textTransform: "uppercase" }}>{d.l}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: d.c }}>{d.v}</div>
                </div>
              ))}
            </div>
          </Card>
        ) : null;
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   STUDENT: READINESS
═══════════════════════════════════════════════════════════════════════════ */
function ReadinessView({ student }) {
  const { theme: t } = useApp();
  const s = student.readiness || { overall: 0, technical: 0, problemSolving: 0, domainKnowledge: 0, communication: 0, confidence: 0 };
  const dims = [
    { key: "technical", label: "Technical Skills", w: "35%", desc: "Coding, system design, tools", color: t.primary },
    { key: "problemSolving", label: "Problem Solving", w: "25%", desc: "Simulations, case studies, reasoning", color: "#8b5cf6" },
    { key: "domainKnowledge", label: "Domain Knowledge", w: "20%", desc: "Industry concepts, frameworks", color: t.accent },
    { key: "communication", label: "Communication", w: "15%", desc: "Written clarity, profile quality", color: t.warn },
    { key: "confidence", label: "Confidence", w: "5%", desc: "Verified skills × assessments", color: "#ec4899" },
  ];
  return (
    <div style={{ padding: 32, maxWidth: 1600, margin: "0 auto" }}>
      <h1 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 900, color: t.text }}>AI Readiness Score</h1>
      <p style={{ margin: "0 0 28px", fontSize: 13, color: t.textDim }}>Weighted multi-dimensional assessment</p>
      <Card style={{ marginBottom: 24, background: t.pageBg == "#f0f2f7" ? `linear-gradient(135deg,#f0f2ff,#f0fff8)` : `linear-gradient(135deg,${t.primaryGlow},${t.accentGlow})` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
          <ScoreRing score={s.overall} size={160} sw={12} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: t.textDim, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>OVERALL READINESS</div>
            <div style={{ fontSize: 14, color: t.textMid, marginBottom: 16 }}>{scoreLabel(s.overall)} — {s.overall < 50 ? "Take assessments to improve" : "Apply to matched internships now"}</div>
            <div style={{ padding: "12px 16px", background: t.inputBg, borderRadius: 11, fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: t.textMid, lineHeight: 1.8 }}>
              Overall = Technical×<span style={{ color: t.primary }}>0.35</span> + ProblemSolving×<span style={{ color: "#8b5cf6" }}>0.25</span> + Domain×<span style={{ color: t.accent }}>0.20</span> + Comm×<span style={{ color: t.warn }}>0.15</span> + Confidence×<span style={{ color: "#ec4899" }}>0.05</span>
            </div>
          </div>
        </div>
      </Card>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {dims.map(d => (
          <Card key={d.key} style={{ padding: "18px 24px" }}>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <ScoreRing score={s[d.key] || 0} size={52} sw={5} showLabel={false} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 800, color: t.text }}>{d.label}</span>
                    <span style={{ fontSize: 11, color: t.textDim, marginLeft: 10 }}>Weight: {d.w}</span>
                  </div>
                  <span style={{ fontSize: 18, fontWeight: 900, color: d.color, fontFamily: "'JetBrains Mono',monospace" }}>{s[d.key] || 0}/100</span>
                </div>
                <ProgressBar value={s[d.key] || 0} color={d.color} h={8} anim />
                <div style={{ fontSize: 11, color: t.textDim, marginTop: 6 }}>{d.desc}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPANY: DASHBOARD — Real-time connected
═══════════════════════════════════════════════════════════════════════════ */
function CompanyDashboard({ company, setView }) {
  const { theme: t } = useApp();
  const [apps, setApps] = useState([]);
  const [eligible, setEligible] = useState([]);
  const [interns, setInterns] = useState([]);
  const [liveEvents, setLiveEvents] = useState([]);

  useEffect(() => {
    const refresh = () => {
      setApps(DB.getCompanyApplications(company.id));
      const myInterns = Object.values(DB.internships).filter(i => i.companyId === company.id);
      const activeInterns = myInterns.filter(i => i.status === "active");
      const lowestThreshold = activeInterns.length > 0 ? Math.min(...activeInterns.map(i => i.minScore)) : 55;
      setEligible(DB.getEligibleStudents(lowestThreshold));
      setInterns(myInterns);
    };
    refresh();
    const unsub = DB.subscribe(({ event, payload }) => {
      if (["NEW_APPLICATION", "READINESS_UPDATED", "APPLICATION_STATUS_CHANGED", "GITHUB_VERIFIED", "NEW_INTERNSHIP"].includes(event)) {
        refresh();
        setLiveEvents(prev => [{ event, payload, time: Date.now() }, ...prev.slice(0, 4)]);
      }
    });
    return unsub;
  }, [company.id]);

  const newApps = apps.filter(a => a.status === "pending").length;
  const shortlisted = apps.filter(a => a.status === "shortlisted").length;
  const avgScore = apps.length ? Math.round(apps.reduce((s, a) => s + a.readinessAtApply, 0) / apps.length) : 0;

  return (
    <div style={{ padding: 32, maxWidth: 1600, margin: "0 auto" }}>
      <div style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ margin: "0 0 6px", fontSize: 28, fontWeight: 900, color: t.text }}>Company Dashboard</h1>
          <p style={{ margin: 0, fontSize: 14, color: t.textDim }}>{company.name} · AI-Verified Talent Platform</p>
        </div>
        {liveEvents.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", background: t.accentGlow, border: `1px solid ${t.accent}33`, borderRadius: 10 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: t.accent, display: "inline-block", animation: "pulse2 1.5s infinite" }} />
            <span style={{ fontSize: 12, color: t.accent, fontWeight: 700 }}>Live sync active</span>
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 24 }}>
        {[
          { label: "New Applications", val: newApps, sub: "pending review", color: t.primary, icon: "📨", view: "applications" },
          { label: "Eligible Students", val: eligible.length, sub: "score ≥ 55", color: t.accent, icon: "⭐", view: "talent" },
          { label: "Avg Readiness", val: avgScore || "—", sub: "of applicants", color: scoreColor(avgScore, t), icon: "◉", view: null },
          { label: "Active Listings", val: interns.filter(i => i.status === "active").length, sub: "accepting apps", color: t.warn, icon: "◇", view: "internships" },
        ].map(s => (
          <Card key={s.label} hover={!!s.view} onClick={s.view ? () => setView(s.view) : undefined} style={{ padding: 20 }}>
            <div style={{ fontSize: 24, marginBottom: 10 }}>{s.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: s.color, fontFamily: "'JetBrains Mono',monospace", marginBottom: 4 }}>{s.val}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 3 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: t.textDim }}>{s.sub}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 24, marginBottom: 24 }}>
        {/* Recent Applications */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: t.text }}>Recent Applications</div>
            <Btn variant="ghost" size="sm" onClick={() => setView("applications")}>View All</Btn>
          </div>
          {apps.length === 0 ? <div style={{ textAlign: "center", padding: 24, color: t.textDim, fontSize: 13 }}>No applications yet. Post internships to attract talent.</div> :
            apps.slice(0, 5).map(app => {
              const sn = app.studentSnapshot;
              const sColors = { pending: t.warn, shortlisted: t.accent, rejected: t.danger, reviewed: t.primary };
              return (
                <div key={app.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${t.border}` }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: `linear-gradient(135deg,${t.primary},${t.primaryLight})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{sn.name[0]}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{sn.name}</div>
                    <div style={{ fontSize: 11, color: t.textDim }}>{DB.internships[app.internshipId]?.title || "Internship"}</div>
                  </div>
                  {sn.githubVerified && <span style={{ fontSize: 14 }} title="GitHub Verified">🐙</span>}
                  <div style={{ fontSize: 13, fontWeight: 800, color: scoreColor(sn.readiness?.overall || 0, t), fontFamily: "'JetBrains Mono',monospace" }}>{sn.readiness?.overall || 0}</div>
                  <Badge text={app.status.toUpperCase()} color={sColors[app.status] || t.textDim} small />
                </div>
              );
            })}
        </Card>

        {/* Live Event Feed */}
        <Card>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.accent, animation: "pulse2 1.5s infinite" }} />
            <div style={{ fontSize: 15, fontWeight: 800, color: t.text }}>Live Event Stream</div>
          </div>
          <div style={{ fontSize: 11, color: t.textDim, marginBottom: 14, fontFamily: "'JetBrains Mono',monospace" }}>
            WebSocket — ws://api/events
          </div>
          {liveEvents.length === 0 ? (
            <div style={{ textAlign: "center", padding: 24, color: t.textDim, fontSize: 13 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📡</div>
              Waiting for events...<br />Students applying will appear here instantly.
            </div>
          ) : liveEvents.map((e, i) => {
            const evColors = { NEW_APPLICATION: t.accent, READINESS_UPDATED: t.primary, GITHUB_VERIFIED: t.github, APPLICATION_STATUS_CHANGED: t.warn, NEW_INTERNSHIP: t.primary };
            const evIcons = { NEW_APPLICATION: "📨", READINESS_UPDATED: "📈", GITHUB_VERIFIED: "🐙", APPLICATION_STATUS_CHANGED: "📋", NEW_INTERNSHIP: "✨" };
            return (
              <div key={i} style={{ padding: "10px 14px", background: t.inputBg, borderRadius: 10, marginBottom: 8, border: `1px solid ${evColors[e.event] || t.border}22`, display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontSize: 16 }}>{evIcons[e.event] || "🔔"}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: evColors[e.event] || t.primary, fontFamily: "'JetBrains Mono',monospace" }}>{e.event}</div>
                  <div style={{ fontSize: 10, color: t.textDim }}>{Math.floor((Date.now() - e.time) / 1000)}s ago</div>
                </div>
              </div>
            );
          })}
        </Card>
      </div>

      {/* Eligible Talent */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: t.text }}>Eligible Talent Pool</div>
            <div style={{ fontSize: 11, color: t.textDim }}>Auto-updates when students reach minimum readiness threshold</div>
          </div>
          <Btn variant="ghost" size="sm" onClick={() => setView("talent")}>Full Pool →</Btn>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
          {eligible.slice(0, 6).map(s => (
            <div key={s.id} style={{ padding: 14, background: t.inputBg, borderRadius: 12, border: `1px solid ${t.border}`, display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: `linear-gradient(135deg,${t.primary},${t.primaryLight})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{s.firstName[0]}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.firstName} {s.lastName}</div>
                <div style={{ fontSize: 10, color: t.textDim }}>{s.targetRole?.split(" ")[0] || "—"}</div>
                <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                  <Badge text={`${s.readiness?.overall || 0}`} color={scoreColor(s.readiness?.overall || 0, t)} small />
                  {s.githubVerified && <span style={{ fontSize: 12 }}>🐙</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPANY: TALENT POOL
═══════════════════════════════════════════════════════════════════════════ */
function TalentPool({ company }) {
  const { theme: t } = useApp();
  const [minScore, setMinScore] = useState(0);
  const [githubOnly, setGithubOnly] = useState(false);
  const [roleFilter, setRoleFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [students, setStudents] = useState(Object.values(DB.students));

  useEffect(() => {
    const unsub = DB.subscribe(({ event }) => {
      if (["READINESS_UPDATED", "GITHUB_VERIFIED"].includes(event)) setStudents(Object.values(DB.students));
    });
    return unsub;
  }, []);

  const filtered = students.filter(s =>
    (s.readiness?.overall || 0) >= minScore &&
    (!githubOnly || s.githubVerified) &&
    (roleFilter === "all" || s.targetRole === roleFilter)
  ).sort((a, b) => (b.readiness?.overall || 0) - (a.readiness?.overall || 0));

  return (
    <div style={{ padding: 32, maxWidth: 1600, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 900, color: t.text }}>Verified Talent Pool</h1>
        <p style={{ margin: 0, fontSize: 13, color: t.textDim }}>AI-scored candidates — real-time eligibility updates</p>
      </div>
      <Card style={{ padding: "16px 20px", marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 11, color: t.textDim, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Min Readiness: <b style={{ color: t.accent }}>{minScore}</b></div>
            <input type="range" min={0} max={90} step={5} value={minScore} onChange={e => setMinScore(+e.target.value)} style={{ width: 200, accentColor: t.primary }} />
          </div>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: 10, padding: "9px 14px", color: t.text, fontSize: 13, fontFamily: "inherit" }}>
            <option value="all">All Roles</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: t.textMid }}>
            <input type="checkbox" checked={githubOnly} onChange={e => setGithubOnly(e.target.checked)} style={{ accentColor: t.github, width: 16, height: 16 }} />
            <span>🐙 GitHub Verified Only</span>
          </label>
          <Badge text={`${filtered.length} candidates`} color={t.accent} />
        </div>
      </Card>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
        {filtered.map(s => (
          <Card key={s.id} hover onClick={() => setSelected(s)}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: `linear-gradient(135deg,${t.primary},${t.primaryLight})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{s.firstName[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: t.text, marginBottom: 2 }}>{s.firstName} {s.lastName}</div>
                <div style={{ fontSize: 12, color: t.textDim }}>{s.university || "University TBD"}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                  {s.githubVerified && <Badge text="🐙 GitHub" color={t.github} small />}
                  <Badge text={scoreLabel(s.readiness?.overall || 0)} color={scoreColor(s.readiness?.overall || 0, t)} small />
                </div>
              </div>
              <ScoreRing score={s.readiness?.overall || 0} size={56} sw={5} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 8, marginBottom: 12 }}>
              {[{ l: "Technical", v: s.readiness?.technical || 0, c: t.primary }, { l: "Problem Solving", v: s.readiness?.problemSolving || 0, c: "#8b5cf6" }, { l: "GitHub Score", v: s.githubScore || 0, c: t.github }].map(d => (
                <div key={d.l} style={{ padding: "8px", background: t.inputBg, borderRadius: 9 }}>
                  <div style={{ fontSize: 9, color: t.textDim, marginBottom: 3 }}>{d.l.toUpperCase()}</div>
                  <ProgressBar value={d.v} color={d.c} h={4} anim />
                  <div style={{ fontSize: 11, fontWeight: 800, color: d.c, fontFamily: "'JetBrains Mono',monospace", marginTop: 3 }}>{d.v}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {(s.skills || []).slice(0, 4).map(sk => <span key={sk.name} style={{ padding: "2px 8px", background: sk.isVerified ? t.accentGlow : t.inputBg, border: `1px solid ${sk.isVerified ? t.accent + "33" : t.border}`, borderRadius: 5, fontSize: 10, color: sk.isVerified ? t.accent : t.textDim, fontWeight: 600 }}>{sk.isVerified && "✓ "}{sk.name}</span>)}
            </div>
          </Card>
        ))}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected ? `${selected.firstName} ${selected.lastName}` : ""} width={640}>
        {selected && (
          <div>
            <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 24 }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: `linear-gradient(135deg,${t.primary},${t.primaryLight})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, color: "#fff" }}>{selected.firstName[0]}</div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 900, color: t.text }}>{selected.firstName} {selected.lastName}</div>
                <div style={{ fontSize: 13, color: t.textDim }}>{selected.university || "—"} · {selected.targetRole}</div>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <Badge text={`Readiness: ${selected.readiness?.overall || 0}`} color={scoreColor(selected.readiness?.overall || 0, t)} />
                  {selected.githubVerified && <Badge text={`🐙 @${selected.githubUsername}`} color={t.github} />}
                </div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12, marginBottom: 20 }}>
              {[{ l: "Technical", v: selected.readiness?.technical || 0, c: t.primary }, { l: "Problem Solving", v: selected.readiness?.problemSolving || 0, c: "#8b5cf6" }, { l: "Communication", v: selected.readiness?.communication || 0, c: t.warn }].map(d => (
                <div key={d.l} style={{ padding: 14, background: t.inputBg, borderRadius: 12, textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: t.textDim, marginBottom: 8, textTransform: "uppercase" }}>{d.l}</div>
                  <ScoreRing score={d.v} size={64} sw={6} />
                </div>
              ))}
            </div>
            {selected.githubVerified && selected.verifiedProjects?.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: t.text, marginBottom: 12 }}>🐙 GitHub Projects</div>
                {selected.verifiedProjects.map((p, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 14px", background: t.inputBg, borderRadius: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 18 }}>📁</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: t.text }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: t.textDim }}>⭐{p.stars} · 🍴{p.forks} · {p.commits} commits</div>
                      <div style={{ display: "flex", gap: 5, marginTop: 4 }}>{p.tech.map(tk => <span key={tk} style={{ padding: "2px 7px", background: t.primaryGlow, borderRadius: 4, fontSize: 9, color: t.primary, fontWeight: 600 }}>{tk}</span>)}</div>
                    </div>
                    <Badge text={`${p.verifiedScore}/100`} color={scoreColor(p.verifiedScore, t)} small />
                  </div>
                ))}
              </div>
            )}
            <div style={{ padding: 14, background: t.primaryGlow, borderRadius: 12, border: `1px solid ${t.primary}22`, marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: t.primaryLight, marginBottom: 6 }}>🤖 AI Confidence Report</div>
              <div style={{ fontSize: 12, color: t.textMid, lineHeight: 1.6 }}>
                Verified through {selected.completedAssessments || 0} timed, anti-cheat assessments.
                {selected.githubVerified ? ` GitHub score ${selected.githubScore}/100 confirmed via repo analysis.` : ""} Confidence: <b style={{ color: t.accent }}>High (89%)</b>.
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <Btn variant="secondary">Add to Shortlist</Btn>
              <Btn variant="accent">Schedule Interview</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPANY: INTERNSHIPS — Real-time publish
═══════════════════════════════════════════════════════════════════════════ */
function CompanyInternships({ company, toast }) {
  const { theme: t } = useApp();
  const [list, setList] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", role: ROLES[0], minScore: 65, location: "Remote", durationType: "remote", duration: "3 months", stipend: 7000, requiredSkills: "", deadline: "2026-06-30" });

  useEffect(() => {
    setList(Object.values(DB.internships).filter(i => i.companyId === company.id));
    const unsub = DB.subscribe(({ event }) => { if (event === "NEW_INTERNSHIP") setList(Object.values(DB.internships).filter(i => i.companyId === company.id)); });
    return unsub;
  }, [company.id]);

  const create = () => {
    if (!form.title) { toast("Title required", "error"); return; }
    const intern = DB.addInternship(company.id, { ...form, requiredSkills: form.requiredSkills.split(",").map(s => s.trim()).filter(Boolean), status: "active" });
    setList(prev => [...prev, intern]);
    setShowCreate(false);
    toast(`"${intern.title}" published — students notified!`, "success", "✨ Internship Live");
  };

  const eligible = (intern) => DB.getEligibleStudents(intern.minScore).length;

  return (
    <div style={{ padding: 32, maxWidth: 1600, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 900, color: t.text }}>Internship Listings</h1>
          <p style={{ margin: 0, fontSize: 13, color: t.textDim }}>Publishing automatically notifies eligible students in real-time</p>
        </div>
        <Btn icon="+" onClick={() => setShowCreate(true)} variant="accent">Create Listing</Btn>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {list.map(i => (
          <Card key={i.id}>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ fontSize: 28 }}>{i.logo}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: t.text, marginBottom: 4 }}>{i.title}</div>
                <div style={{ fontSize: 12, color: t.textDim, marginBottom: 10 }}>{i.role} · Min Score: {i.minScore} · {i.location} · {i.duration}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Badge text={i.status === "active" ? "● LIVE" : "DRAFT"} color={i.status === "active" ? t.accent : t.textDim} small dot={i.status === "active" ? "pulse" : undefined} />
                  <Badge text={`${i.applicantCount} applicants`} color={t.primary} small />
                  <Badge text={`${eligible(i)} eligible students`} color={t.accent} small />
                  <Badge text={`$${i.stipend?.toLocaleString()}/mo`} color={t.warn} small />
                </div>
              </div>
              <Btn variant="secondary" size="sm" onClick={() => toast("Edit functionality in full build", "info")}>Edit</Btn>
            </div>
          </Card>
        ))}
        {list.length === 0 && <Card style={{ textAlign: "center", padding: 48 }}><div style={{ fontSize: 40, marginBottom: 12 }}>📋</div><div style={{ fontSize: 14, color: t.textDim }}>No listings yet. Create your first internship.</div></Card>}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Internship Listing" width={600}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Input label="Job Title" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} placeholder="Frontend Engineer Intern" />
          <Input label="Role Category" value={form.role} onChange={v => setForm(f => ({ ...f, role: v }))} options={ROLES.map(r => ({ value: r, label: r }))} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 12 }}>
            <Input label="Location" value={form.location} onChange={v => setForm(f => ({ ...f, location: v }))} placeholder="Remote" />
            <Input label="Duration" value={form.duration} onChange={v => setForm(f => ({ ...f, duration: v }))} placeholder="3 months" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 12 }}>
            <Input label="Monthly Stipend (USD)" type="number" value={form.stipend} onChange={v => setForm(f => ({ ...f, stipend: +v }))} />
            <Input label="Deadline" type="date" value={form.deadline} onChange={v => setForm(f => ({ ...f, deadline: v }))} />
          </div>
          <Input label="Required Skills (comma-separated)" value={form.requiredSkills} onChange={v => setForm(f => ({ ...f, requiredSkills: v }))} placeholder="React, TypeScript, Node.js" />
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: t.textMid, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Min Readiness Score: <span style={{ color: t.accent }}>{form.minScore}</span></div>
            <input type="range" min={0} max={90} step={5} value={form.minScore} onChange={e => setForm(f => ({ ...f, minScore: +e.target.value }))} style={{ width: "100%", accentColor: t.primary }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: t.textDim, marginTop: 4 }}><span>0 — Open</span><span>90 — Elite</span></div>
          </div>
          <div style={{ padding: 12, background: t.inputBg, borderRadius: 10, fontSize: 12, color: t.textDim }}>
            ⚡ Publishing notifies all {DB.getEligibleStudents(form.minScore).length} eligible students (readiness ≥ {form.minScore}) instantly via real-time event stream.
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <Btn variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Btn>
            <Btn variant="accent" onClick={create}>Publish Listing</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPANY: APPLICATIONS — Full pipeline
═══════════════════════════════════════════════════════════════════════════ */
function CompanyApplications({ company, toast }) {
  const { theme: t } = useApp();
  const [apps, setApps] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    setApps(DB.getCompanyApplications(company.id));
    const unsub = DB.subscribe(({ event, payload }) => {
      if (event === "NEW_APPLICATION" && payload.app.companyId === company.id) setApps(DB.getCompanyApplications(company.id));
      if (event === "APPLICATION_STATUS_CHANGED" && (!payload.companyId || payload.companyId === company.id)) setApps(DB.getCompanyApplications(company.id));
    });
    return unsub;
  }, [company.id]);

  const statusFlow = ["pending", "reviewed", "shortlisted", "interview", "offered", "rejected"];
  const sColors = { pending: t.warn, reviewed: t.primary, shortlisted: t.accent, interview: "#8b5cf6", offered: t.accent, rejected: t.danger };
  const filtered = filter === "all" ? apps : apps.filter(a => a.status === filter);

  const updateStatus = (appId, status) => {
    DB.updateApplicationStatus(appId, status, company.id);
    setApps(DB.getCompanyApplications(company.id));
    toast(`Application status updated to ${status}`, "success");
  };

  return (
    <div style={{ padding: 32, maxWidth: 1600, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 900, color: t.text }}>Application Pipeline</h1>
          <p style={{ margin: 0, fontSize: 13, color: t.textDim }}>AI-screened, verified-only applicants · Status changes notify students instantly</p>
        </div>
        <Badge text={`${apps.length} total`} color={t.primary} />
      </div>

      {/* Pipeline summary */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, overflow: "auto", paddingBottom: 4 }}>
        {["all", ...statusFlow].map(s => {
          const count = s === "all" ? apps.length : apps.filter(a => a.status === s).length;
          return (
            <button key={s} onClick={() => setFilter(s)} style={{ padding: "8px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700, background: filter === s ? sColors[s] || t.primary : t.inputBg, color: filter === s ? "#fff" : t.textMid, border: `1px solid ${filter === s ? sColors[s] || t.primary : t.border}`, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", transition: "all 0.15s" }}>
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)} ({count})
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {filtered.length === 0 ? (
          <Card style={{ textAlign: "center", padding: 48 }}><div style={{ fontSize: 36, marginBottom: 12 }}>📭</div><div style={{ fontSize: 13, color: t.textDim }}>No {filter !== "all" ? filter + " " : ""} applications yet.</div></Card>
        ) : filtered.map(app => {
          const sn = app.studentSnapshot; const intern = DB.internships[app.internshipId];
          return (
            <Card key={app.id}>
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: `linear-gradient(135deg,${t.primary},${t.primaryLight})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{sn.name[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: t.text, marginBottom: 2 }}>{sn.name}</div>
                      <div style={{ fontSize: 12, color: t.textDim, marginBottom: 8 }}>{intern?.title || "Internship"} · {sn.university || "University"}</div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <Badge text={`Readiness: ${sn.readiness?.overall || 0}`} color={scoreColor(sn.readiness?.overall || 0, t)} small />
                        <Badge text={`Match: ${app.matchScore}%`} color={scoreColor(app.matchScore, t)} small />
                        <Badge text={`AI: ${app.aiConfidence}%`} color={t.primary} small />
                        {sn.githubVerified && <Badge text="🐙 GitHub" color={t.github} small />}
                      </div>
                    </div>
                    <ScoreRing score={sn.readiness?.overall || 0} size={52} sw={5} showLabel={false} />
                  </div>

                  {/* Match score breakdown */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 8, marginBottom: 14, padding: "10px 14px", background: t.inputBg, borderRadius: 10 }}>
                    {[{ l: "Skill Overlap", v: `×0.4`, c: t.primary }, { l: "Readiness Align", v: `×0.3`, c: "#8b5cf6" }, { l: "GitHub Score", v: `${app.githubScore}×0.2`, c: t.github }, { l: "Role Fit", v: `×0.1`, c: t.warn }].map(d => (
                      <div key={d.l} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 9, color: t.textDim, marginBottom: 3, textTransform: "uppercase" }}>{d.l}</div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: d.c, fontFamily: "'JetBrains Mono',monospace" }}>{d.v}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12, color: t.textDim }}>Status:</span>
                    <select value={app.status} onChange={e => updateStatus(app.id, e.target.value)} style={{ background: sColors[app.status] + "22", border: `1px solid ${sColors[app.status]}44`, borderRadius: 9, padding: "6px 14px", color: sColors[app.status], fontSize: 12, fontFamily: "inherit", cursor: "pointer", fontWeight: 700, outline: "none" }}>
                      {statusFlow.map(s => <option key={s} value={s} style={{ background: t.surface, color: t.text }}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                    <Btn variant="secondary" size="sm" onClick={() => toast("Full report view in production build", "info")}>AI Report</Btn>
                    {sn.githubUsername && <a href={`https://github.com/${sn.githubUsername}`} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: t.github, textDecoration: "none", fontWeight: 700 }}>🐙 @{sn.githubUsername}</a>}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPANY: ANALYTICS
═══════════════════════════════════════════════════════════════════════════ */
function Analytics({ company }) {
  const { theme: t } = useApp();
  const apps = DB.getCompanyApplications(company.id);
  const students = Object.values(DB.students);

  return (
    <div style={{ padding: 32, maxWidth: 1600, margin: "0 auto" }}>
      <h1 style={{ margin: "0 0 24px", fontSize: 24, fontWeight: 900, color: t.text }}>Analytics & Insights</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
        <Card>
          <div style={{ fontSize: 15, fontWeight: 800, color: t.text, marginBottom: 20 }}>Hiring Funnel</div>
          {[{ s: "Total Applicants", n: apps.length || 3, p: 100 }, { s: "Verified (≥65)", n: Math.max(1, apps.filter(a => a.readinessAtApply >= 65).length), p: 72 }, { s: "Shortlisted", n: Math.max(0, apps.filter(a => a.status === "shortlisted").length), p: 28 }, { s: "Interviewed", n: 0, p: 12 }, { s: "Offered", n: 0, p: 4 }].map(f => (
            <div key={f.s} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ fontSize: 12, color: t.textMid }}>{f.s}</span><span style={{ fontSize: 12, fontWeight: 800, color: t.text, fontFamily: "'JetBrains Mono',monospace" }}>{f.n}</span></div>
              <ProgressBar value={f.p} color={t.primary} h={7} anim />
            </div>
          ))}
        </Card>
        <Card>
          <div style={{ fontSize: 15, fontWeight: 800, color: t.text, marginBottom: 20 }}>Score Distribution</div>
          {[{ r: "85-100", n: students.filter(s => (s.readiness?.overall || 0) >= 85).length, c: t.accent }, { r: "70-84", n: students.filter(s => (s.readiness?.overall || 0) >= 70 && (s.readiness?.overall || 0) < 85).length, c: t.primary }, { r: "55-69", n: students.filter(s => (s.readiness?.overall || 0) >= 55 && (s.readiness?.overall || 0) < 70).length, c: t.warn }, { r: "0-54", n: students.filter(s => (s.readiness?.overall || 0) < 55).length, c: t.danger }].map(b => (
            <div key={b.r} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 11, color: t.textDim, width: 56, fontFamily: "'JetBrains Mono',monospace" }}>{b.r}</span>
              <div style={{ flex: 1 }}><ProgressBar value={Math.max(4, b.n * 25)} color={b.c} h={8} anim /></div>
              <span style={{ fontSize: 12, fontWeight: 800, color: b.c, fontFamily: "'JetBrains Mono',monospace", width: 24 }}>{b.n}</span>
            </div>
          ))}
        </Card>
        <Card>
          <div style={{ fontSize: 15, fontWeight: 800, color: t.text, marginBottom: 20 }}>GitHub Verification Impact</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 12, marginBottom: 16 }}>
            {[{ l: "GitHub Verified", n: students.filter(s => s.githubVerified).length, c: t.github }, { l: "Not Verified", n: students.filter(s => !s.githubVerified).length, c: t.textDim }].map(d => (
              <div key={d.l} style={{ padding: 16, background: t.inputBg, borderRadius: 12, textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: d.c, fontFamily: "'JetBrains Mono',monospace" }}>{d.n}</div>
                <div style={{ fontSize: 12, color: t.textDim, marginTop: 4 }}>{d.l}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: 12, background: t.accentGlow, borderRadius: 10, border: `1px solid ${t.accent}22`, fontSize: 12, color: t.accent }}>🐙 GitHub verified students receive +20% match score boost</div>
        </Card>
        <Card>
          <div style={{ fontSize: 15, fontWeight: 800, color: t.text, marginBottom: 20 }}>Time Saved vs Traditional</div>
          {[{ m: "Resume screening", saved: "~12h", p: 95 }, { m: "Initial filtering", saved: "~8h", p: 80 }, { m: "Skill verification", saved: "~6h", p: 65 }, { m: "Phone screens", saved: "~4h", p: 45 }].map(m => (
            <div key={m.m} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ fontSize: 12, color: t.textMid }}>{m.m}</span><span style={{ fontSize: 12, fontWeight: 800, color: t.accent }}>{m.saved} saved</span></div>
              <ProgressBar value={m.p} color={t.accent} h={6} anim />
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   STUDENT: PROFILE
═══════════════════════════════════════════════════════════════════════════ */
function StudentProfile({ student, onUpdate, toast }) {
  const { theme: t } = useApp();
  const [fn, setFn] = useState(student.firstName);
  const [ln, setLn] = useState(student.lastName);
  const [uni, setUni] = useState(student.university || "");
  const [deg, setDeg] = useState(student.degree || "");
  const [bio, setBio] = useState(student.bio || "");
  const [role, setRole] = useState(student.targetRole || ROLES[0]);
  const [newSkill, setNewSkill] = useState("");
  const [saving, setSaving] = useState(false);

  const save = () => {
    setSaving(true);
    const comp = Math.min(100, (fn ? 10 : 0) + (ln ? 10 : 0) + (uni ? 15 : 0) + (deg ? 10 : 0) + (bio ? 15 : 0) + ((student.skills?.length || 0) > 0 ? 20 : 0) + (student.resumeUrl ? 20 : 0));
    setTimeout(() => {
      const updated = { ...student, firstName: fn, lastName: ln, university: uni, degree: deg, bio, targetRole: role, profileCompleteness: comp };
      DB.students[student.id] = { ...DB.students[student.id], ...updated };
      onUpdate(updated); setSaving(false); toast("Profile saved!", "success");
    }, 600);
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;
    const updated = { ...student, skills: [...(student.skills || []), { name: newSkill.trim(), isVerified: false }] };
    DB.students[student.id] = { ...DB.students[student.id], ...updated };
    onUpdate(updated); setNewSkill("");
  };
  const removeSkill = idx => { const updated = { ...student, skills: student.skills.filter((_, i) => i !== idx) }; DB.students[student.id] = { ...DB.students[student.id], ...updated }; onUpdate(updated); };

  return (
    <div style={{ padding: 32, maxWidth: 1600, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: t.text }}>My Profile</h1>
        <Btn onClick={save} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Btn>
      </div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ fontSize: 12, color: t.textDim }}>Profile completeness</span><span style={{ fontSize: 12, fontWeight: 700, color: t.accent }}>{student.profileCompleteness}%</span></div>
        <ProgressBar value={student.profileCompleteness} color={t.accent} h={8} anim />
      </div>
      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: t.text, marginBottom: 18 }}>Personal Information</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 14 }}>
          <Input label="First Name" value={fn} onChange={setFn} />
          <Input label="Last Name" value={ln} onChange={setLn} />
          <Input label="University" value={uni} onChange={setUni} placeholder="MIT, Stanford..." />
          <Input label="Degree" value={deg} onChange={setDeg} placeholder="B.Sc Computer Science" />
          <Input label="Target Role" value={role} onChange={setRole} options={ROLES.map(r => ({ value: r, label: r }))} />
        </div>
        <div style={{ marginTop: 14 }}><Input label="Bio" value={bio} onChange={setBio} placeholder="Tell companies about yourself..." multiline /></div>
      </Card>
      <Card>
        <div style={{ fontSize: 14, fontWeight: 800, color: t.text, marginBottom: 6 }}>Skills</div>
        <div style={{ fontSize: 12, color: t.textDim, marginBottom: 14 }}>Verified skills boost your match score and visibility</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          {(student.skills || []).map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", background: s.isVerified ? t.accentGlow : t.inputBg, border: `1px solid ${s.isVerified ? t.accent + "44" : t.border}`, borderRadius: 8, fontSize: 12, color: s.isVerified ? t.accent : t.textMid, fontWeight: 600 }}>
              {s.isVerified && "✓ "}{s.name}
              <button onClick={() => removeSkill(i)} style={{ background: "none", border: "none", color: t.textDim, cursor: "pointer", fontSize: 14, lineHeight: 1, marginLeft: 4 }}>×</button>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <input value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyDown={e => e.key === "Enter" && addSkill()} placeholder="Add skill (press Enter)..."
            style={{ flex: 1, background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: 10, padding: "9px 14px", color: t.text, fontSize: 13, fontFamily: "inherit", outline: "none" }} />
          <Btn onClick={addSkill} variant="secondary" size="sm">Add</Btn>
        </div>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════════════════════════════════════ */
function AppProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  const toggleTheme = () => setIsDark(d => !d);
  const theme = isDark ? THEMES.dark : THEMES.light;
  return <AppCtx.Provider value={{ theme, isDark, toggleTheme }}>{children}</AppCtx.Provider>;
}

export function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("dashboard");
  const [student, setStudent] = useState(null);
  const [company, setCompany] = useState(null);
  const [showNotif, setShowNotif] = useState(false);
  const { toasts, add: addToast, remove } = useToasts();
  const { theme: t } = useApp();

  const { unreadCount, markRead } = useRealTime(user?.id, user?.role);

  useEffect(() => {
    if (user?.role === "student") setStudent(DB.students[user.id]);
    if (user?.role === "company") setCompany({ ...DB.companies[user.id], id: user.id });
  }, [user]);

  // Auto-refresh student from DB on real-time events
  useEffect(() => {
    if (!user || user.role !== "student") return;
    const unsub = DB.subscribe(({ event, payload }) => {
      if (event === "GITHUB_VERIFIED" && payload.studentId === user.id) setStudent({ ...DB.students[user.id] });
      if (event === "READINESS_UPDATED" && payload.studentId === user.id) setStudent({ ...DB.students[user.id] });
    });
    return unsub;
  }, [user]);

  const handleAuth = (u) => { setUser(u); setView("dashboard"); };
  const handleLogout = () => { setUser(null); setStudent(null); setCompany(null); setView("dashboard"); };

  const handleBell = () => { setShowNotif(v => !v); markRead(); };

  if (!user) return <AuthPage onAuth={handleAuth} />;

  const renderView = () => {
    if (user.role === "student" && student) {
      switch (view) {
        case "dashboard": return <StudentDashboard student={student} setView={setView} />;
        case "profile": return <StudentProfile student={student} onUpdate={setStudent} toast={addToast} />;
        case "assessments": return <Assessments student={student} onUpdate={setStudent} toast={addToast} />;
        case "readiness": return <ReadinessView student={student} />;
        case "internships": return <StudentInternships student={student} toast={addToast} />;
        case "applications": return <StudentApplications student={student} />;
        case "github": return <GitHubVerify student={student} onUpdate={setStudent} toast={addToast} />;
        default: return <StudentDashboard student={student} setView={setView} />;
      }
    }
    if (user.role === "company" && company) {
      switch (view) {
        case "dashboard": return <CompanyDashboard company={company} setView={setView} />;
        case "talent": return <TalentPool company={company} />;
        case "internships": return <CompanyInternships company={company} toast={addToast} />;
        case "applications": return <CompanyApplications company={company} toast={addToast} />;
        case "analytics": return <Analytics company={company} />;
        default: return <CompanyDashboard company={company} setView={setView} />;
      }
    }
    return <div style={{ padding: 40, color: t.textDim }}>Loading...</div>;
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: t.pageBg, color: t.text, fontFamily: "'Cabinet Grotesk','DM Sans',system-ui,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes ripple{to{width:200px;height:200px;opacity:0}}
        @keyframes slideInRight{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
        @keyframes pulse2{0%,100%{opacity:1}50%{opacity:0.3}}
        ::-webkit-scrollbar{width:6px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:rgba(100,100,180,0.3);border-radius:3px;}
        input[type=range]{-webkit-appearance:none;height:4px;border-radius:2px;outline:none;}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;cursor:pointer;}
        select,input,textarea,button{font-family:inherit;}
        a{transition:opacity 0.15s;}a:hover{opacity:0.8;}
      `}</style>
      <Sidebar role={user.role} view={view} setView={setView} user={user} unread={unreadCount} onBell={handleBell} onLogout={handleLogout} />
      <main style={{ flex: 1, overflowY: "auto", maxHeight: "100vh" }}>
        {renderView()}
      </main>
      <NotificationPanel role={user.role} userId={user.id} open={showNotif} onClose={() => setShowNotif(false)} />
      <Toast toasts={toasts} remove={remove} />
    </div>
  );
}

// Wrap with provider
const WrappedApp = () => <AppProvider><App /></AppProvider>;
export { WrappedApp as default };
