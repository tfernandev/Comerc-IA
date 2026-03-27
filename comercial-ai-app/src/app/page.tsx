"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rocket, Brain, Target, ArrowRight, AlertCircle,
  BarChart3, ChevronRight, ChevronLeft, LayoutDashboard, Zap,
  Share2, Check,
} from "lucide-react";

type Section = "landing" | "form" | "analyzing" | "results";

type Question = {
  id: number;
  text: string;
  placeholder?: string;
  type?: string;
  options?: string[];
};

const QUESTIONS: Question[] = [
  { id: 1,  text: "¿Cuál es la facturación que buscás alcanzar este año?",        placeholder: "Ej. 100,000 USD",      type: "number" },
  { id: 2,  text: "¿Cuál es tu facturación acumulada en lo que va del año?",      placeholder: "Ej. 25,000 USD",       type: "number" },
  { id: 3,  text: "¿Cuál es el ticket promedio de tus operaciones o ventas?",     placeholder: "Ej. 500 USD",          type: "number" },
  { id: 4,  text: "¿De dónde provienen la mayoría de tus clientes hoy?",          options: ["Referidos","Base de contactos","Redes sociales","Publicidad paga","Prospección directa","Otros"] },
  { id: 5,  text: "¿Cuántas nuevas oportunidades comerciales generás por semana?", placeholder: "Ej. 5",               type: "number" },
  { id: 6,  text: "De cada 10 conversaciones, ¿cuántas terminan en una venta?",   placeholder: "Número del 1 al 10",   type: "number" },
  { id: 7,  text: "¿Cuántas oportunidades reales de venta tenés hoy en proceso?", placeholder: "Ej. 12",              type: "number" },
  { id: 8,  text: "¿Cuántas conversaciones comerciales nuevas tenés por semana?", placeholder: "Ej. 10",              type: "number" },
  { id: 9,  text: "¿Tenés un sistema estructurado para hacer seguimiento?",        options: ["Sí, sistemático","Parcial","No"] },
  { id: 10, text: "¿Cuántos contactos activos tenés en tu base comercial?",       placeholder: "Ej. 500",             type: "number" },
  { id: 11, text: "¿Cada cuánto contactás o interactuás con tu base?",            options: ["Semanalmente","Mensualmente","Ocasionalmente","Casi nunca"] },
  { id: 12, text: "¿Tenés definido un público objetivo o nicho claro?",           options: ["Sí","Parcial","No"] },
  { id: 13, text: "¿Sentís que el mercado entiende claramente qué valor aportás?", placeholder: "Escala 1 a 10",      type: "number" },
  { id: 14, text: "¿Cuál considerás hoy tu mayor obstáculo comercial?",           options: ["Falta de oportunidades","Baja conversión","Falta de posicionamiento","Falta de organización","Falta de tiempo","Otro"] },
  { id: 15, text: "¿Qué buscás principalmente en este momento?",                  options: ["Generar más oportunidades","Cerrar más ventas","Aumentar ticket promedio","Organizar el negocio","Escalar el negocio"] },
];

export default function Home() {
  const [section, setSection] = useState<Section>("landing");
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "shared">("idle");

  const progress = ((currentStep + 1) / QUESTIONS.length) * 100;
  const q = QUESTIONS[currentStep];

  const handleNext = () => {
    if (currentStep < QUESTIONS.length - 1) setCurrentStep((c) => c + 1);
    else setSection("analyzing");
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((c) => c - 1);
    else setSection("landing");
  };

  useEffect(() => {
    if (section === "analyzing") {
      const t = setTimeout(() => setSection("results"), 3200);
      return () => clearTimeout(t);
    }
  }, [section]);

  const restart = () => { setSection("landing"); setCurrentStep(0); setAnswers({}); setShareStatus("idle"); };

  const handleShare = async () => {
    const reportText = `✦ DIAGNÓSTICO DE SALUD COMERCIAL\n\n📊 DIAGNÓSTICO EJECUTIVO\nTu negocio muestra alta actividad semanal con una brecha significativa entre facturación actual y objetivo anual. La principal fuga está en la conversión comercial y la falta de seguimiento sistemático.\n\n🚨 CUELLOS DE BOTELLA\n1. Falta de seguimiento sistemático de la base instalada.\n2. Ticket promedio por debajo del nicho objetivo.\n3. Sin proceso claro de calificación de leads.\n\n⚡ PRIORIDADES ESTRATÉGICAS\n01. Implementar CRM de Seguimiento\n02. Definir y Escalar Nicho Premium\n03. Rutina de Contacto con la Base\n\n— Generado por Diagnóstico Comercial IA`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "Mi Diagnóstico Comercial", text: reportText });
        setShareStatus("shared");
      } catch { /* usuario canceló */ }
    } else {
      await navigator.clipboard.writeText(reportText);
      setShareStatus("copied");
    }
    setTimeout(() => setShareStatus("idle"), 3000);
  };

  return (
    <main style={{ minHeight: "100vh", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem" }}>

      {/* Ambient blobs */}
      <div style={{ position: "absolute", top: "-15%", left: "-15%", width: "45%", height: "45%", background: "rgba(59,130,246,0.15)", borderRadius: "50%", filter: "blur(120px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-15%", right: "-15%", width: "45%", height: "45%", background: "rgba(99,102,241,0.15)", borderRadius: "50%", filter: "blur(120px)", pointerEvents: "none" }} />

      <AnimatePresence mode="wait">
        {/* ─────────────── LANDING ─────────────── */}
        {section === "landing" && (
          <motion.div key="landing" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.4 }}
            style={{ maxWidth: 860, width: "100%", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", zIndex: 10 }}>

            <div className="glass" style={{ padding: "6px 20px", borderRadius: 9999, marginBottom: 28, display: "inline-flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#60a5fa", display: "inline-block", animation: "pulse 1.5s infinite" }} />
              <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#93c5fd" }}>Diagnóstico impulsado por IA</span>
            </div>

            <h1 style={{ fontSize: "clamp(2.4rem, 6vw, 4.5rem)", fontWeight: 900, lineHeight: 1.1, marginBottom: 24, letterSpacing: "-0.03em" }}>
              Transforma tu Estrategia<br />
              con <span style={{ backgroundImage: "linear-gradient(90deg,#60a5fa,#818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Inteligencia Comercial</span>
            </h1>

            <p style={{ fontSize: "1.15rem", color: "#94a3b8", maxWidth: 580, marginBottom: 44, lineHeight: 1.75 }}>
              Descubre los cuellos de botella reales de tu negocio y obtén 3 prioridades estratégicas personalizadas en menos de 5 minutos.
            </p>

            <button className="btn-primary" onClick={() => setSection("form")} id="btn-start-diagnostic">
              Iniciar Diagnóstico Gratis
              <ArrowRight size={20} style={{ marginLeft: 12, transition: "transform 0.2s" }} />
            </button>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 20, marginTop: 60, width: "100%", textAlign: "left" }}>
              {[
                { icon: <Target size={28} color="#60a5fa" />, title: "Precisión", desc: "Análisis basado en los datos reales de tu negocio." },
                { icon: <Brain size={28} color="#a78bfa" />,  title: "Insights IA", desc: "Modelos entrenados para detectar fricciones comerciales." },
                { icon: <Rocket size={28} color="#34d399" />, title: "Accionable", desc: "Resultados concretos orientados a la ejecución inmediata." },
              ].map((card, i) => (
                <div key={i} className="glass" style={{ padding: "1.5rem", borderRadius: "1.25rem" }}>
                  <div style={{ marginBottom: 14 }}>{card.icon}</div>
                  <h3 style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: 8 }}>{card.title}</h3>
                  <p style={{ color: "#94a3b8", fontSize: "0.875rem", lineHeight: 1.65 }}>{card.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ─────────────── FORM ─────────────── */}
        {section === "form" && (
          <motion.div key="form" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.35 }}
            style={{ width: "100%", maxWidth: 620, zIndex: 10 }}>

            {/* Progress */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: "0.875rem" }}>
                <span style={{ color: "#60a5fa", fontWeight: 600 }}>Pregunta {currentStep + 1} de {QUESTIONS.length}</span>
                <span style={{ color: "#475569" }}>{Math.round(progress)}% completado</span>
              </div>
              <div style={{ height: 5, background: "#1e293b", borderRadius: 9999, overflow: "hidden" }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }}
                  style={{ height: "100%", background: "linear-gradient(90deg,#3b82f6,#6366f1)", borderRadius: 9999 }} />
              </div>
            </div>

            <div className="glass" style={{ borderRadius: "2rem", padding: "2.5rem" }}>
              <h2 style={{ fontSize: "clamp(1.3rem,3vw,1.7rem)", fontWeight: 700, marginBottom: 32, lineHeight: 1.35 }}>
                {q.text}
              </h2>

              {q.options ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {q.options.map((opt) => {
                    const selected = answers[q.id] === opt;
                    return (
                      <button key={opt} id={`opt-${opt.replace(/\s+/g,"-")}`}
                        onClick={() => { setAnswers({ ...answers, [q.id]: opt }); setTimeout(handleNext, 280); }}
                        style={{ textAlign: "left", padding: "1rem 1.25rem", borderRadius: "1rem", border: `1px solid ${selected ? "#3b82f6" : "rgba(255,255,255,0.1)"}`, background: selected ? "rgba(59,130,246,0.18)" : "rgba(255,255,255,0.03)", color: selected ? "#fff" : "#94a3b8", cursor: "pointer", fontWeight: selected ? 600 : 400, transition: "all 0.2s", fontSize: "0.95rem" }}>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <input id="answer-input" type={q.type || "text"} placeholder={q.placeholder} className="input-field" autoFocus
                  value={answers[q.id] || ""}
                  onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && answers[q.id] && handleNext()} />
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 36 }}>
                <button onClick={handleBack} style={{ display: "flex", alignItems: "center", gap: 6, color: "#475569", background: "none", border: "none", cursor: "pointer", fontSize: "0.9rem", padding: "8px 12px", borderRadius: "0.75rem", transition: "color 0.2s" }}>
                  <ChevronLeft size={18} /> Atrás
                </button>
                {!q.options && (
                  <button id="btn-siguiente" onClick={handleNext} disabled={!answers[q.id]}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "0.75rem 1.75rem", background: "#2563eb", border: "none", borderRadius: "0.875rem", color: "#fff", fontWeight: 700, cursor: "pointer", opacity: answers[q.id] ? 1 : 0.35, transition: "opacity 0.2s, background 0.2s" }}>
                    Siguiente <ChevronRight size={18} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ─────────────── ANALYZING ─────────────── */}
        {section === "analyzing" && (
          <motion.div key="analyzing" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
            style={{ textAlign: "center", zIndex: 10 }}>
            <div style={{ position: "relative", display: "inline-block", marginBottom: 32 }}>
              <div style={{ position: "absolute", inset: 0, background: "rgba(59,130,246,0.25)", borderRadius: "50%", filter: "blur(40px)", animation: "pulse 1.5s infinite" }} />
              <Brain size={112} color="#3b82f6" className="animate-brain" style={{ position: "relative", zIndex: 10 }} />
            </div>
            <h2 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: 16 }}>Procesando respuestas con IA...</h2>
            <p style={{ color: "#64748b", marginBottom: 8, animation: "pulse 2s infinite" }}>Sincronizando con modelos predictivos</p>
            <p style={{ color: "#475569", fontSize: "0.875rem" }}>Identificando patrones de conversión y actividad...</p>
          </motion.div>
        )}

        {/* ─────────────── RESULTS ─────────────── */}
        {section === "results" && (
          <motion.div key="results" initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            style={{ width: "100%", maxWidth: 1100, zIndex: 10, paddingBottom: "3rem" }}>

            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#60a5fa" }}>✦ Análisis Finalizado</span>
              <h1 style={{ fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 900, marginTop: 12 }}>Tu Diagnóstico de Salud Comercial</h1>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 20 }}>

              {/* Card: Diagnóstico */}
              <div className="card-gradient" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    <div style={{ padding: 8, background: "rgba(59,130,246,0.15)", borderRadius: 10 }}><LayoutDashboard size={20} color="#60a5fa" /></div>
                    <h3 style={{ fontWeight: 700, fontSize: "1.1rem" }}>Diagnóstico Ejecutivo</h3>
                  </div>
                  <p style={{ color: "#cbd5e1", lineHeight: 1.8, fontSize: "0.95rem" }}>
                    Tu negocio muestra un sólido nivel de actividad semanal, pero existe una brecha 
                    significativa entre facturación actual y objetivo anual. La principal fuga de energía está 
                    en la <strong style={{ color: "#fff" }}>conversión comercial</strong> y la falta de 
                    seguimiento sistemático. Una mejora en estos dos vectores puede cambiar radicalmente tus resultados en 90 días.
                  </p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginTop: 28, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  {[["Actividad Semanal","Alta","#34d399"],["Pipeline","Estable","#fbbf24"],["Riesgo","Bajo","#94a3b8"]].map(([label,val,color]) => (
                    <div key={label}>
                      <span style={{ fontSize: "0.7rem", color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>{label}</span>
                      <span style={{ fontSize: "1.5rem", fontWeight: 800, color, fontFamily: "monospace" }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card: Cuellos de Botella */}
              <div className="card-gradient">
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <div style={{ padding: 8, background: "rgba(239,68,68,0.15)", borderRadius: 10 }}><AlertCircle size={20} color="#f87171" /></div>
                  <h3 style={{ fontWeight: 700, fontSize: "1.1rem" }}>Cuellos de Botella</h3>
                </div>
                <ul style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    "Falta de seguimiento sistemático de la base instalada.",
                    "Ticket promedio por debajo del nicho objetivo.",
                    "Sin proceso claro de calificación de leads.",
                  ].map((issue, i) => (
                    <li key={i} style={{ display: "flex", gap: 12, padding: "0.875rem 1rem", background: "rgba(255,255,255,0.04)", borderRadius: "0.75rem", border: "1px solid rgba(255,255,255,0.06)", fontSize: "0.875rem", color: "#94a3b8", alignItems: "flex-start" }}>
                      <span style={{ color: "#f87171", fontWeight: 700, minWidth: 20 }}>{i + 1}.</span>
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Card: Prioridades Estratégicas */}
            <div className="card-gradient" style={{ background: "linear-gradient(135deg,rgba(29,78,216,0.18),rgba(15,23,42,0.95))", border: "1px solid rgba(59,130,246,0.2)", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
                <div style={{ padding: 8, background: "rgba(250,204,21,0.15)", borderRadius: 10 }}><Zap size={20} color="#facc15" /></div>
                <h3 style={{ fontWeight: 700, fontSize: "1.1rem" }}>Prioridades Estratégicas Proyectadas</h3>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))", gap: 20 }}>
                {[
                  { title: "Implementar CRM de Seguimiento", desc: "Digitalizar el proceso de contacto para no perder oportunidades calificadas por olvido o desorganización." },
                  { title: "Definir y Escalar Nicho Premium", desc: "Ajustar el posicionamiento hacia clientes con ticket promedio superior, reduciendo esfuerzo por venta." },
                  { title: "Rutina de Contacto con la Base", desc: "Crear una cadencia semanal de nutrición y activación de contactos para generar referidos orgánicos." },
                ].map((rec, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.12, duration: 0.4 }}
                    style={{ padding: "1.5rem", background: "rgba(255,255,255,0.04)", borderRadius: "1.25rem", border: "1px solid rgba(255,255,255,0.07)", cursor: "default", transition: "border-color 0.2s" }}>
                    <div style={{ fontSize: "3rem", fontWeight: 900, color: "#1d4ed8", opacity: 0.4, lineHeight: 1, marginBottom: 16, fontFamily: "monospace" }}>0{i + 1}</div>
                    <h4 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: 10 }}>{rec.title}</h4>
                    <p style={{ color: "#64748b", fontSize: "0.875rem", lineHeight: 1.7 }}>{rec.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Card: gráfico + CTA */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div className="card-gradient" style={{ minHeight: 240, position: "relative" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                  <BarChart3 size={18} color="#60a5fa" />
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b" }}>Progreso vs Objetivo Anual</span>
                </div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 16, height: 140, paddingBottom: 8 }}>
                  {[{ label: "Objetivo", pct: 100, color: "#1e293b" }, { label: "Actual", pct: 40, color: "#3b82f6" }].map((bar) => (
                    <div key={bar.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                      <span style={{ color: "#94a3b8", fontSize: "0.8rem", fontWeight: 600 }}>{bar.pct}%</span>
                      <motion.div initial={{ height: 0 }} animate={{ height: bar.pct * 1.2 }} transition={{ duration: 0.8, delay: 0.3 }}
                        style={{ width: 56, background: bar.color, borderRadius: "6px 6px 0 0", boxShadow: bar.color !== "#1e293b" ? "0 0 20px rgba(59,130,246,0.4)" : "none" }} />
                      <span style={{ fontSize: "0.75rem", color: "#475569" }}>{bar.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card-gradient" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <h3 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: 14 }}>¡Buen punto de partida!</h3>
                <p style={{ color: "#64748b", lineHeight: 1.7, marginBottom: 24, fontSize: "0.9rem" }}>
                  Corregir estos 3 vectores estratégicos puede incrementar tu tasa de conversión hasta un <strong style={{ color: "#fff" }}>15–20%</strong> en el próximo trimestre.
                </p>
                <button
                  id="btn-compartir-reporte"
                  onClick={handleShare}
                  className="btn-primary"
                  style={{ fontSize: "0.9rem", padding: "0.75rem 1.5rem", alignSelf: "flex-start", gap: 8 }}
                >
                  {shareStatus === "copied" ? (
                    <><Check size={16} /> ¡Copiado al portapapeles!</>
                  ) : shareStatus === "shared" ? (
                    <><Check size={16} /> ¡Compartido!</>
                  ) : (
                    <><Share2 size={16} /> Compartir Reporte</>
                  )}
                </button>
              </div>
            </div>

            <div style={{ textAlign: "center", marginTop: 36 }}>
              <button onClick={restart} style={{ color: "#475569", background: "none", border: "none", cursor: "pointer", fontSize: "0.9rem", transition: "color 0.2s" }}>
                ↺ Realizar otro diagnóstico
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
