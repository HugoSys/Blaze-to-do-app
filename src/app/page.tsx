"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Entry = {
  id: number;
  category: "Salud" | "Productividad" | "Finanzas" | "Estado de ánimo";
  label: string;
  value: number;
  unit: string;
  date: string;
};

const initialEntries: Entry[] = [
  { id: 1, category: "Salud", label: "Horas de sueño", value: 7.5, unit: "h", date: "Hoy" },
  { id: 2, category: "Productividad", label: "Tareas completadas", value: 8, unit: "tareas", date: "Hoy" },
  { id: 3, category: "Finanzas", label: "Gasto del día", value: 245, unit: "MXN", date: "Hoy" },
  { id: 4, category: "Estado de ánimo", label: "Nivel de ánimo", value: 8, unit: "/10", date: "Hoy" },
  { id: 5, category: "Salud", label: "Pasos", value: 6420, unit: "pasos", date: "Ayer" },
];

const categoryStyles: Record<Entry["category"], { color: string; icon: string }> = {
  Salud: { color: "mint", icon: "♥" },
  Productividad: { color: "blue", icon: "↗" },
  Finanzas: { color: "orange", icon: "$" },
  "Estado de ánimo": { color: "purple", icon: "☺" },
};

function formatValue(entry: Entry) {
  return entry.category === "Finanzas"
    ? `$${entry.value.toLocaleString("es-MX")}`
    : entry.value.toLocaleString("es-MX");
}

export default function Home() {
  const [entries, setEntries] = useState<Entry[]>(() => {
    if (typeof window === "undefined") return initialEntries;
    const stored = window.localStorage.getItem("my-life-dashboard");
    return stored ? JSON.parse(stored) : initialEntries;
  });
  const [showForm, setShowForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"Todos" | Entry["category"]>("Todos");
  const [form, setForm] = useState({ category: "Salud" as Entry["category"], label: "", value: "", unit: "" });

  useEffect(() => {
    window.localStorage.setItem("my-life-dashboard", JSON.stringify(entries));
  }, [entries]);

  const visibleEntries = useMemo(
    () => (activeFilter === "Todos" ? entries : entries.filter((entry) => entry.category === activeFilter)),
    [activeFilter, entries],
  );
  const totalEntries = entries.length;
  const todayEntries = entries.filter((entry) => entry.date === "Hoy").length;
  const totalSpent = entries.filter((entry) => entry.category === "Finanzas").reduce((sum, entry) => sum + entry.value, 0);

  function addEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.label || !form.value) return;
    setEntries((current) => [
      { id: Date.now(), category: form.category, label: form.label, value: Number(form.value), unit: form.unit || "unidades", date: "Hoy" },
      ...current,
    ]);
    setForm({ category: "Salud", label: "", value: "", unit: "" });
    setShowForm(false);
  }

  return (
    <main className="dashboard-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">✦</span><span>Mi Vida</span></div>
        <nav className="main-nav">
          <a className="nav-item active" href="#resumen"><span>▦</span> Resumen</a>
          <a className="nav-item" href="#registros"><span>▤</span> Registros</a>
          <a className="nav-item" href="#tendencias"><span>⌁</span> Tendencias</a>
        </nav>
        <div className="sidebar-bottom">
          <div className="privacy-card"><span className="lock">♢</span><strong>Tus datos son tuyos</strong><p>Guardados de forma privada en este dispositivo.</p></div>
          <div className="profile"><div className="avatar">HS</div><div><strong>Hugo</strong><span>Panel personal</span></div><span className="dots">•••</span></div>
        </div>
      </aside>

      <section className="content">
        <header className="topbar">
          <div><p className="eyebrow">JUEVES, 29 DE OCTUBRE</p><h1>Tu vida, en perspectiva.</h1><p className="subtitle">Un vistazo simple a los números que cuentan tu historia.</p></div>
          <button className="primary-button" onClick={() => setShowForm(true)}><span>＋</span> Nuevo registro</button>
        </header>

        <div className="stats-grid" id="resumen">
          <article className="stat-card stat-blue"><div className="stat-icon">▥</div><p>Registros totales</p><strong>{totalEntries}</strong><span className="trend">↑ 12% <small>vs. mes pasado</small></span></article>
          <article className="stat-card stat-mint"><div className="stat-icon">◷</div><p>Registros este mes</p><strong>{todayEntries + 24}</strong><span className="trend">↑ 8% <small>vs. mes pasado</small></span></article>
          <article className="stat-card stat-orange"><div className="stat-icon">$</div><p>Gasto registrado</p><strong>${totalSpent.toLocaleString("es-MX")}</strong><span className="trend neutral">Últimos registros</span></article>
          <article className="stat-card stat-purple"><div className="stat-icon">↗</div><p>Racha actual</p><strong>7 <em>días</em></strong><span className="trend">¡Sigue así!</span></article>
        </div>

        <div className="section-heading"><div><h2>Actividad reciente</h2><p>Tus últimos registros en todas las categorías</p></div><button className="text-button" onClick={() => setActiveFilter("Todos")}>Ver todo <span>→</span></button></div>
        <div className="filter-row">
          {(["Todos", ...Object.keys(categoryStyles)] as const).map((filter) => <button key={filter} className={activeFilter === filter ? "filter active-filter" : "filter"} onClick={() => setActiveFilter(filter as "Todos" | Entry["category"])}>{filter}</button>)}
        </div>
        <div className="entries-list" id="registros">
          {visibleEntries.slice(0, 5).map((entry) => {
            const style = categoryStyles[entry.category];
            return <div className="entry-row" key={entry.id}><div className={`entry-icon ${style.color}`}>{style.icon}</div><div className="entry-main"><strong>{entry.label}</strong><span>{entry.category} · {entry.date}</span></div><strong className="entry-value">{formatValue(entry)} <small>{entry.unit}</small></strong><button className="row-menu" aria-label="Opciones">•••</button></div>;
          })}
        </div>

        <div className="section-heading trends-heading" id="tendencias"><div><h2>Tendencias de la semana</h2><p>Pequeños patrones, grandes cambios.</p></div><button className="period-button">Últimos 7 días⌄</button></div>
        <div className="chart-card"><div className="chart-legend"><span><i className="legend-dot blue-dot" /> Productividad</span><span><i className="legend-dot orange-dot" /> Finanzas</span></div><div className="chart"><div className="y-labels"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div><div className="chart-area"><div className="grid-lines"><i /><i /><i /><i /><i /></div><svg viewBox="0 0 640 180" preserveAspectRatio="none" aria-label="Gráfica de tendencias"><polyline points="0,132 105,110 210,125 315,70 420,88 525,48 640,62" fill="none" stroke="#4167f4" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /><polyline points="0,148 105,130 210,145 315,120 420,132 525,105 640,118" fill="none" stroke="#f59b54" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg><div className="x-labels"><span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span></div></div></div></div>

        {showForm && <div className="modal-backdrop" onClick={() => setShowForm(false)}><form className="modal" onSubmit={addEntry} onClick={(event) => event.stopPropagation()}><button type="button" className="close-button" onClick={() => setShowForm(false)}>×</button><p className="eyebrow">NUEVO DATO</p><h2>Agregar registro</h2><label>Categoría<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as Entry["category"] })}>{Object.keys(categoryStyles).map((category) => <option key={category}>{category}</option>)}</select></label><label>Qué quieres medir<input value={form.label} onChange={(event) => setForm({ ...form, label: event.target.value })} placeholder="Ej. Minutos de ejercicio" /></label><div className="form-grid"><label>Valor<input type="number" step="any" value={form.value} onChange={(event) => setForm({ ...form, value: event.target.value })} placeholder="0" /></label><label>Unidad<input value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })} placeholder="minutos" /></label></div><button className="primary-button full-button" type="submit">Guardar registro</button></form></div>}
      </section>
    </main>
  );
}
