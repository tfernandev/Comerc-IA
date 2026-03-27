"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rocket, Brain, Target, ArrowRight, AlertCircle,
  BarChart3, ChevronRight, ChevronLeft, LayoutDashboard, Zap,
  Share2, Check, FileDown, Activity,
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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
  const [isDownloading, setIsDownloading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const progress = ((currentStep + 1) / QUESTIONS.length) * 100;
  const q = QUESTIONS[currentStep];

  const calculateScore = () => {
    let score = 0;
    
    // 1. Avance facturación (Q1 y Q2)
    const target = parseFloat(answers[1]?.replace(/[^0-9.]/g, '') || "0");
    const actual = parseFloat(answers[2]?.replace(/[^0-9.]/g, '') || "0");
    if (target > 0) {
      const ratio = (actual / target) * 20;
      score += Math.min(ratio, 20);
    }

    // 2. Conversión (Q6)
    const conv = parseFloat(answers[6] || "0");
    score += Math.min(conv * 2, 20);

    // 3. Seguimiento (Q9)
    if (answers[9] === "Sí, sistemático") score += 20;
    else if (answers[9] === "Parcial") score += 10;

    // 4. Contacto base (Q11)
    if (answers[11] === "Semanalmente") score += 20;
    else if (answers[11] === "Mensualmente") score += 10;

    // 5. Posicionamiento (Q13)
    const pos = parseFloat(answers[13] || "0");
    score += Math.min(pos * 2, 20);

    return Math.round(score);
  };

  const finalScore = calculateScore();

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

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setIsDownloading(true);
    
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#0F172A",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Diagnostico_Comercial_${new Date().toLocaleDateString()}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const RadialProgress = ({ score }: { score: number }) => {
    const color = score > 70 ? "#10B981" : score > 40 ? "#F59E0B" : "#EF4444";
    return (
      <div style={{ position: "relative", width: 120, height: 120, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="120" height="120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#1e293b" strokeWidth="10" />
          <motion.circle cx="60" cy="60" r="54" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" strokeDasharray="339.29"
            initial={{ strokeDashoffset: 339.29 }}
            animate={{ strokeDashoffset: 339.29 - (339.29 * score) / 100 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
          />
        </svg>
        <div style={{ position: "absolute", textAlign: "center" }}>
          <span style={{ fontSize: "1.75rem", fontWeight: 900, color }}>{score}</span>
          <span style={{ fontSize: "0.6rem", display: "block", color: "#475569", fontWeight: 800, marginTop: -4 }}>SCORE</span>
        </div>
      </div>
    );
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

            <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 20 }}>
               <button onClick={handleShare} className="glass" style={{ padding: "10px 18px", borderRadius: 12, display: "flex", alignItems: "center", gap: 8, fontSize: "0.85rem", color: "#94a3b8", cursor: "pointer", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
                  {shareStatus === "idle" ? <Share2 size={16} /> : <Check size={16} color="#10b981" />}
                  {shareStatus === "idle" ? "Compartir" : "Copiado"}
               </button>
               <button onClick={handleDownloadPDF} disabled={isDownloading} className="glass" style={{ padding: "10px 18px", borderRadius: 12, display: "flex", alignItems: "center", gap: 8, fontSize: "0.85rem", color: "#94a3b8", cursor: "pointer", opacity: isDownloading ? 0.5 : 1, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
                  <FileDown size={16} />
                  {isDownloading ? "Generando..." : "Descargar PDF"}
               </button>
            </div>

            <div ref={reportRef} style={{ padding: "3rem", borderRadius: "2.5rem", background: "#0F172A", border: "1px solid rgba(255,255,255,0.05)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}>
              <div style={{ textAlign: "center", marginBottom: 50 }}>
                <div style={{ display: "inline-block", padding: "6px 16px", background: "rgba(96,165,250,0.1)", borderRadius: 99, marginBottom: 16 }}>
                  <span style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "#60a5fa" }}>✦ Análisis Estratégico Finalizado</span>
                </div>
                <h1 style={{ fontSize: "clamp(2.2rem, 5vw, 3.5rem)", fontWeight: 900, marginTop: 4, letterSpacing: "-0.03em", lineHeight: 1 }}>Tu Diagnóstico de Salud Comercial</h1>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.8fr 1.2fr", gap: 24, marginBottom: 24 }}>
                
                {/* Card: Score */}
                <div className="card-gradient" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "2.5rem" }}>
                   <RadialProgress score={finalScore} />
                   <div style={{ marginTop: 24 }}>
                      <p style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Estado Actual</p>
                      <strong style={{ color: finalScore > 70 ? "#10B981" : finalScore > 40 ? "#F59E0B" : "#EF4444", fontSize: "1.25rem", fontWeight: 900 }}>
                        {finalScore > 70 ? "EXCELENTE" : finalScore > 40 ? "PROMEDIO" : "CRÍTICO"}
                      </strong>
                   </div>
                </div>

                {/* Card: Diagnóstico */}
                <div className="card-gradient" style={{ position: "relative", overflow: "hidden", padding: "2.5rem" }}>
                  <div style={{ position: "absolute", top: -20, right: -20, width: 140, height: 140, background: "rgba(59,130,246,0.04)", borderRadius: "50%", filter: "blur(40px)" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                    <div style={{ padding: 8, background: "rgba(59,130,246,0.12)", borderRadius: 10 }}><Activity size={22} color="#60a5fa" /></div>
                    <h3 style={{ fontWeight: 800, fontSize: "1.2rem" }}>Resumen Ejecutivo</h3>
                  </div>
                  <p style={{ color: "#cbd5e1", lineHeight: 1.8, fontSize: "1rem" }}>
                    Basado en tus indicadores, tu negocio tiene un score de **{finalScore}/100**. 
                    Aunque mantienes una actividad {finalScore > 60 ? "positiva" : "que requiere atención comercial"}, la falta de un sistema {answers[9] !== "Sí, sistemático" ? "totalmente automatizado" : "más eficiente"} 
                    está frenando tu escalabilidad hacia la facturación objetivo de **{answers[1]}**.
                  </p>
                  <div style={{ marginTop: 32, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                     <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                        <span style={{ fontSize: "0.65rem", color: "#64748b", display: "block", fontWeight: 700, textTransform: "uppercase" }}>Conversión</span>
                        <span style={{ fontSize: "1.1rem", fontWeight: 900, color: "#fff" }}>{answers[6] || 0}/10</span>
                     </div>
                     <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                        <span style={{ fontSize: "0.65rem", color: "#64748b", display: "block", fontWeight: 700, textTransform: "uppercase" }}>Frecuencia</span>
                        <span style={{ fontSize: "1.1rem", fontWeight: 900, color: "#fff" }}>{answers[11] || "—"}</span>
                     </div>
                  </div>
                </div>

                {/* Card: Cuellos de Botella */}
                <div className="card-gradient" style={{ padding: "2.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                    <div style={{ padding: 8, background: "rgba(239,68,68,0.12)", borderRadius: 10 }}><AlertCircle size={22} color="#f87171" /></div>
                    <h3 style={{ fontWeight: 800, fontSize: "1.2rem" }}>Fugas de Energía</h3>
                  </div>
                  <ul style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {[
                      "Seguimiento comercial no sistemático.",
                      "Baja conversión en el cierre de ventas.",
                      "Falta de calificación previa de leads.",
                    ].map((issue, i) => (
                      <li key={i} style={{ display: "flex", gap: 12, fontSize: "0.9rem", color: "#94a3b8", lineHeight: 1.5, alignItems: "flex-start" }}>
                        <span style={{ color: "#f87171", fontWeight: 900 }}>✕</span> {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Card: Prioridades Estratégicas */}
              <div className="card-gradient" style={{ background: "linear-gradient(135deg,rgba(29,78,216,0.2),rgba(15,23,42,0.95))", border: "1px solid rgba(59,130,246,0.25)", marginBottom: 24, padding: "3rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 36 }}>
                  <div style={{ padding: 12, background: "rgba(250,204,21,0.15)", borderRadius: 14 }}><Zap size={28} color="#facc15" /></div>
                  <div>
                    <h3 style={{ fontWeight: 900, fontSize: "1.6rem", lineHeight: 1 }}>Plan de Acción Inmediato</h3>
                    <p style={{ color: "#60a5fa", fontSize: "0.85rem", marginTop: 4, fontWeight: 600 }}>Enfoque sugerido para los próximos 90 días</p>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
                  {[
                    { title: "Sistematización CRM", desc: "Digitalizar el proceso para eliminar el error humano en el seguimiento de contactos." },
                    { title: "Escalado Premium", desc: "Enfocar tus cierres en prospectos de ticket alto para maximizar el margen por venta." },
                    { title: "Activación de Clientes", desc: "Rutina semanal de nutrición de base de datos para generar referidos constantes." },
                  ].map((rec, i) => (
                    <div key={i} style={{ padding: "1.75rem", background: "rgba(255,255,255,0.03)", borderRadius: "1.5rem", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "#1d4ed8", opacity: 0.25, lineHeight: 1, marginBottom: 20 }}>0{i + 1}</div>
                      <h4 style={{ fontWeight: 800, fontSize: "1.1rem", marginBottom: 12, color: "#fff" }}>{rec.title}</h4>
                      <p style={{ color: "#64748b", fontSize: "0.9rem", lineHeight: 1.7 }}>{rec.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.8fr", gap: 24 }}>
                <div className="card-gradient" style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "2.5rem" }}>
                   <div style={{ display: "flex", alignItems: "flex-end", gap: 32, height: 130 }}>
                      <div style={{ width: 70 }}>
                        <div style={{ background: "#1e293b", height: 130, borderRadius: 10, position: "relative", border: "1px solid rgba(255,255,255,0.05)" }}>
                           <div style={{ position: "absolute", bottom: 0, width: "100%", height: "100%", border: "2px dashed #334155", borderRadius: 10 }} />
                        </div>
                        <span style={{ display: "block", textAlign: "center", marginTop: 14, fontSize: "0.75rem", color: "#475569", fontWeight: 700 }}>OBJETIVO</span>
                      </div>
                      <div style={{ width: 70 }}>
                        <motion.div initial={{ height: 0 }} animate={{ height: 55 }} transition={{ duration: 1.2, delay: 0.5, ease: "backOut" }}
                          style={{ width: "100%", background: "linear-gradient(to top, #2563eb, #60a5fa)", borderRadius: 10, boxShadow: "0 15px 35px rgba(37,99,235,0.4)" }} />
                        <span style={{ display: "block", textAlign: "center", marginTop: 14, fontSize: "0.75rem", color: "#3b82f6", fontWeight: 800 }}>ACTUAL</span>
                      </div>
                   </div>
                </div>
                <div className="card-gradient" style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "3rem" }}>
                   <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                      <div style={{ padding: 10, background: "rgba(16,185,129,0.1)", borderRadius: 12 }}><Target size={28} color="#10B981" /></div>
                      <h3 style={{ fontSize: "1.8rem", fontWeight: 950, letterSpacing: "-0.02em" }}>Crecimiento Proyectado</h3>
                   </div>
                   <p style={{ color: "#94a3b8", lineHeight: 1.8, fontSize: "1.1rem" }}>
                      Si implementamos estos 3 vectores, tu negocio podría incrementar su tasa de conversión neta en un <strong style={{ color: "#fff", fontSize: "1.3rem" }}>+20%</strong> durante el primer trimestre.
                   </p>
                </div>
              </div>
            </div>

            <div style={{ textAlign: "center", marginTop: 44 }}>
              <button onClick={restart} style={{ color: "#4b5563", background: "none", border: "none", cursor: "pointer", fontSize: "1.05rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 10, transition: "color 0.2s" }}>
                ↺ Realizar otro diagnóstico
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
