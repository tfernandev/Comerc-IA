"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rocket, Brain, Target, ArrowRight, AlertCircle,
  BarChart3, ChevronRight, ChevronLeft, LayoutDashboard, Zap,
  Share2, Check, FileDown, Activity, TrendingUp, HelpCircle
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

type Section = "landing" | "form" | "analyzing" | "results";

const QUESTIONS = [
  { id: 1, text: "¿Cuál es la facturación que buscás alcanzar este año?", placeholder: "Ej. 100,000 USD", type: "text" },
  { id: 2, text: "¿Cuánto facturaste en los últimos 12 meses?", placeholder: "Ej. 25,000 USD", type: "text" },
  { id: 3, text: "¿Cuál es tu ticket promedio actual?", placeholder: "Ej. 500 USD", type: "text" },
  { id: 4, text: "¿Cuál es tu principal fuente de clientes?", options: ["Referidos", "Anuncios (FB/IG/Google)", "LinkedIn Outbound", "Frío / Puerta", "Redes Orgánico"] },
  { id: 5, text: "¿Cuántas reuniones de venta tenés por semana?", placeholder: "Ej. 5", type: "number" },
  { id: 6, text: "De cada 10 reuniones, ¿cuántas ventas cerrás?", placeholder: "Ej. 3", type: "number" },
  { id: 7, text: "¿Cuántos leads nuevos entran a tu base por mes?", placeholder: "Ej. 50", type: "number" },
  { id: 8, text: "¿Cuánto tiempo pasás prospectando por día?", placeholder: "Ej. 2 horas", type: "text" },
  { id: 9, text: "¿Tenés un proceso de seguimiento estructurado?", options: ["Sí, sistemático", "Parcial / Manual", "No, me olvido a veces", "Cero seguimiento"] },
  { id: 10, text: "¿Qué presupuesto mensual tenés para marketing?", placeholder: "Ej. 300 USD", type: "text" },
  { id: 11, text: "¿Con qué frecuencia contactás a tu base actual?", options: ["Semanalmente", "Mensualmente", "Trimestralmente", "Casi nunca"] },
  { id: 12, text: "¿Tenés claridad sobre quién es tu cliente ideal?", options: ["Sí", "No", "Varios perfiles", "Lo estamos definiendo"] },
  { id: 13, text: "Del 1 al 10, ¿cómo calificarías tu nivel de organización?", placeholder: "Ej. 7", type: "number" },
  { id: 14, text: "¿Cuál creés que es tu mayor freno hoy?", options: ["Falta de leads", "Baja conversión", "Falta de tiempo", "Miedo a vender", "Tecnología"] },
  { id: 15, text: "¿En qué te gustaría que te ayude la IA?", options: ["Cerrar más ventas", "Automatizar mensajes", "Calificar leads", "Organizar mi agenda"] },
];

export default function Home() {
  const [section, setSection] =Section>("landing");
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "shared">("idle");
  const [isDownloading, setIsDownloading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const progress = ((currentStep + 1) / QUESTIONS.length) * 100;
  const q = QUESTIONS[currentStep];

  const calculateScore = () => {
    let score = 0;
    const target = parseFloat(answers[1]?.replace(/[^0-9.]/g, '') || "0");
    const actual = parseFloat(answers[2]?.replace(/[^0-9.]/g, '') || "0");
    if (target > 0) score += Math.min((actual / target) * 20, 20);
    const conv = parseFloat(answers[6] || "0");
    score += Math.min(conv * 2, 20);
    if (answers[9] === "Sí, sistemático") score += 20;
    else if (answers[9] === "Parcial / Manual") score += 10;
    if (answers[11] === "Semanalmente") score += 20;
    else if (answers[11] === "Mensualmente") score += 10;
    const pos = parseFloat(answers[13] || "0");
    score += Math.min(pos * 2, 20);
    return Math.round(score);
  };

  const finalScore = calculateScore();

  const handleNext = () => {
    if (currentStep < QUESTIONS.length - 1) setCurrentStep((c) => c + 1);
    else setSection("analyzing");
  };

  const handleBack = () => { if (currentStep > 0) setCurrentStep((c) => c - 1); else setSection("landing"); };

  useEffect(() => {
    if (section === "analyzing") {
      const t = setTimeout(() => setSection("results"), 3500);
      return () => clearTimeout(t);
    }
  }, [section]);

  const restart = () => { setSection("landing"); setCurrentStep(0); setAnswers({}); setShareStatus("idle"); };

  const handleShare = async () => {
    const reportText = `✦ DIAGNÓSTICO DE SALUD COMERCIAL\nScore: ${finalScore}/100\nResumen: ${finalScore > 60 ? "Estable" : "Requiere Atención"}\n\nGenerado por Diagnóstico Comercial IA (Estilo 2015)`;
    if (navigator.share) {
      try { await navigator.share({ title: "Mi Diagnóstico Comercial", text: reportText }); setShareStatus("shared"); } catch {}
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
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true, backgroundColor: "#f5f7fa" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, Math.min(pdfHeight, 297));
      pdf.save(`Reporte_Comercial_2015.pdf`);
    } catch (e) { console.error(e); } finally { setIsDownloading(false); }
  };

  const RadialProgress = ({ score }: { score: number }) => {
    const color = score > 70 ? "#4caf50" : score > 40 ? "#ff9800" : "#f44336";
    return (
      <div style={{ position: "relative", width: 140, height: 140, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="140" height="140">
          <circle cx="70" cy="70" r="60" fill="white" stroke="#eceff1" strokeWidth="12" />
          <motion.circle cx="70" cy="70" r="60" fill="none" stroke={color} strokeWidth="12" strokeLinecap="butt"
            strokeDasharray="377" initial={{ strokeDashoffset: 377 }} animate={{ strokeDashoffset: 377 - (377 * score) / 100 }}
            transition={{ duration: 1.5, ease: "easeOut" }} style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
          />
        </svg>
        <div style={{ position: "absolute", textAlign: "center" }}>
          <span style={{ fontSize: "2.5rem", fontWeight: 800, color: "#37474f", letterSpacing: "-1px" }}>{score}%</span>
        </div>
      </div>
    );
  };

  return (
    <main style={{ minHeight: "100vh", background: "#f5f7fa", color: "#2c3e50" }}>
      
      {/* 2015 Top Header Bar */}
      <header style={{ background: "#2196f3", padding: "12px 0", color: "white", boxShadow: "0 2px 4px rgba(0,0,0,0.2)", position: "fixed", top: 0, width: "100%", zIndex: 100 }}>
         <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
               <div style={{ background: "white", padding: 6, borderRadius: 4 }}><BarChart3 size={20} color="#2196f3" /></div>
               <span style={{ fontWeight: 800, fontSize: "1.1rem", textTransform: "uppercase" }}>Comercial IA</span>
            </div>
            {section !== "landing" && (
               <button onClick={restart} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "white", padding: "6px 12px", borderRadius: 4, cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>CERRAR</button>
            )}
         </div>
      </header>

      <div style={{ paddingTop: 100, paddingBottom: 60, display: "flex", justifyContent: "center" }}>
        <AnimatePresence mode="wait">
          
          {/* ─────────────── LANDING (Flat Design 2015) ─────────────── */}
          {section === "landing" && (
            <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ maxWidth: 900, width: "100%", padding: "0 20px" }}>
              
              <div style={{ textAlign: "center", marginBottom: 60 }}>
                <h1 style={{ fontSize: "3.5rem", fontWeight: 900, color: "#2c3e50", marginBottom: 20 }}>Herramienta de Diagnóstico Comercial</h1>
                <p style={{ fontSize: "1.25rem", color: "#7f8c8d", maxWidth: 600, margin: "0 auto 40px" }}>
                  Análisis inteligente de tu embudo de ventas y estrategia de captación. Gratis y en menos de 5 minutos.
                </p>
                <button className="btn-retro" style={{ fontSize: "1.1rem", padding: "16px 32px" }} onClick={() => setSection("form")}>
                  EMPEZAR DIAGNÓSTICO AHORA
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 30 }}>
                {[
                  { icon: <TrendingUp size={40} />, title: "Resultados Reales", color: "#4caf50" },
                  { icon: <Brain size={40} />, title: "Análisis con IA", color: "#9c27b0" },
                  { icon: <HelpCircle size={40} />, title: "Check de Salud", color: "#ff9800" },
                ].map((item, i) => (
                  <div key={i} className="retro-card" style={{ padding: 40, textAlign: "center" }}>
                    <div style={{ color: item.color, marginBottom: 20, display: "flex", justifyContent: "center" }}>{item.icon}</div>
                    <h3 style={{ fontWeight: 800, fontSize: "1.2rem", color: "#34495e" }}>{item.title}</h3>
                    <div style={{ width: 40, height: 4, background: item.color, margin: "16px auto" }} />
                    <p style={{ fontSize: "0.9rem", color: "#7f8c8d", lineHeight: 1.6 }}>Optimiza cada paso de tu proceso comercial con datos validados.</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ─────────────── FORM (Retro Form Style) ─────────────── */}
          {section === "form" && (
            <motion.div key="form" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              style={{ width: "100%", maxWidth: 640, padding: "0 20px" }}>
              <div className="retro-card" style={{ padding: "3rem" }}>
                <div style={{ marginBottom: 40 }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "#9e9e9e", textTransform: "uppercase" }}>PREGUNTA {currentStep + 1} / {QUESTIONS.length}</span>
                  <div style={{ height: 8, background: "#e0e0e0", borderRadius: 4, marginTop: 12, overflow: "hidden" }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} style={{ height: "100%", background: "#2196f3" }} />
                  </div>
                </div>

                <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: 40, color: "#2c3e50" }}>{q.text}</h2>

                {q.options ? (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
                    {q.options.map((opt) => (
                      <button key={opt} onClick={() => { setAnswers({ ...answers, [q.id]: opt }); setTimeout(handleNext, 200); }}
                        style={{ padding: "16px", background: answers[q.id] === opt ? "#2196f3" : "white", color: answers[q.id] === opt ? "white" : "#2c3e50", border: `2px solid ${answers[q.id] === opt ? "#2196f3" : "#e0e0e0"}`, borderRadius: 6, cursor: "pointer", fontWeight: 700, textAlign: "center", transition: "all 0.2s" }}>
                        {opt}
                      </button>
                    ))}
                  </div>
                ) : (
                  <input type={q.type} placeholder={q.placeholder} className="input-retro" autoFocus
                    value={answers[q.id] || ""} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && answers[q.id] && handleNext()} />
                )}

                <div style={{ marginTop: 50, display: "flex", justifyContent: "space-between" }}>
                  <button onClick={handleBack} style={{ background: "none", border: "none", color: "#9e9e9e", cursor: "pointer", fontWeight: 700 }}>ATRÁS</button>
                  {!q.options && (
                    <button className="btn-retro" onClick={handleNext} disabled={!answers[q.id]} style={{ opacity: answers[q.id] ? 1 : 0.5 }}>SIGUIENTE</button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ─────────────── ANALYZING ─────────────── */}
          {section === "analyzing" && (
            <motion.div key="analyzing" style={{ textAlign: "center" }}>
              <div className="animate-pulse-custom" style={{ display: "inline-block", padding: 30, background: "white", borderRadius: "50%", boxShadow: "0 10px 20px rgba(0,0,0,0.1)", marginBottom: 30 }}>
                <Activity size={80} color="#2196f3" />
              </div>
              <h2 style={{ fontSize: "2rem", fontWeight: 900, color: "#2c3e50" }}>Generando Informe...</h2>
              <p style={{ color: "#7f8c8d", marginTop: 10 }}>Analizando patrones comerciales y proyección de escala.</p>
            </motion.div>
          )}

          {/* ─────────────── RESULTS (The 2015 Dashboard) ─────────────── */}
          {section === "results" && (
            <motion.div key="results" style={{ maxWidth: 1000, width: "100%", padding: "0 20px" }}>
              
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginBottom: 24 }}>
                <button onClick={handleShare} className="btn-retro" style={{ background: "#455a64", fontSize: "0.8rem" }}>
                   <Share2 size={16} /> {shareStatus === "idle" ? "COMPARTIR" : "COPIADO"}
                </button>
                <button onClick={handleDownloadPDF} disabled={isDownloading} className="btn-retro" style={{ background: "#2196f3", fontSize: "0.8rem" }}>
                   <FileDown size={16} /> {isDownloading ? "GENERANDO..." : "DESCARGAR PDF"}
                </button>
              </div>

              <div ref={reportRef} style={{ background: "white", padding: 60, borderRadius: 8, boxShadow: "0 10px 30px rgba(0,0,0,0.1)", border: "1px solid #e1e8ed" }}>
                <div style={{ borderBottom: "4px solid #f5f7fa", paddingBottom: 40, marginBottom: 40, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                   <div>
                      <h1 style={{ fontSize: "2.5rem", fontWeight: 900, color: "#2c3e50" }}>Reporte de Diagnóstico</h1>
                      <p style={{ color: "#9e9e9e", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Comercial IA / Análisis Estratégico</p>
                   </div>
                   <RadialProgress score={finalScore} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 40 }}>
                   <div className="retro-card" style={{ padding: 40, border: "none", background: "#f8f9fa" }}>
                      <h3 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                         <Activity color="#2196f3" /> ESTADO DEL NEGOCIO
                      </h3>
                      <p style={{ lineHeight: 1.8, color: "#34495e" }}>
                        Tu negocio presenta un score de <strong>{finalScore}%</strong>. Para alcanzar tu meta de <strong>{answers[1]}</strong>, 
                        es crítico optimizar el proceso de {answers[14] === "Falta de leads" ? "generación de demanda" : "conversión en ventas"}. 
                        Actualmente cierras <strong>{answers[6]}/10</strong> ventas, lo cual es {parseInt(answers[6] || "0") > 4 ? "muy sólido" : "un área de mejora urgente"}.
                      </p>
                   </div>

                   <div className="retro-card" style={{ padding: 40, border: "none", background: "#fff5f5" }}>
                      <h3 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: 20, color: "#c62828" }}>FUGA DE VENTAS</h3>
                      <ul style={{ padding: 0, listStyle: "none" }}>
                         <li style={{ marginBottom: 15, display: "flex", gap: 10, fontSize: "0.9rem" }}><AlertCircle size={18} color="#ef5350" /> Falta de sistema de escala.</li>
                         <li style={{ marginBottom: 15, display: "flex", gap: 10, fontSize: "0.9rem" }}><AlertCircle size={18} color="#ef5350" /> Seguimiento inconsistente.</li>
                         <li style={{ display: "flex", gap: 10, fontSize: "0.9rem" }}><AlertCircle size={18} color="#ef5350" /> Nivel de organización: {answers[13]}/10.</li>
                      </ul>
                   </div>
                </div>

                <div style={{ marginTop: 40 }}>
                   <h3 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: 30, textAlign: "center" }}>PLAN DE ACCIÓN RECOMENDADO</h3>
                   <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
                      {[
                        { title: "SISTEMATIZACIÓN", color: "#2196f3" },
                        { title: "NICHO PREMIUM", color: "#9c27b0" },
                        { title: "AUTOMATIZACIÓN", color: "#4caf50" }
                      ].map((item, id) => (
                        <div key={id} style={{ border: `2px solid #f5f7fa`, padding: 30, borderRadius: 8 }}>
                           <span style={{ fontSize: "0.8rem", fontWeight: 800, color: item.color }}>PASO 0{id+1}</span>
                           <h4 style={{ fontWeight: 800, margin: "8px 0" }}>{item.title}</h4>
                           <p style={{ fontSize: "0.85rem", color: "#7f8c8d" }}>Optimización estratégica focalizada en el corto plazo.</p>
                        </div>
                      ))}
                   </div>
                </div>

                <div style={{ marginTop: 60, textAlign: "center", borderTop: "2px solid #f5f7fa", paddingTop: 40 }}>
                   <button onClick={restart} style={{ background: "#eee", border: "none", padding: "12px 24px", borderRadius: 4, fontWeight: 700, cursor: "pointer", color: "#777" }}>REALIZAR OTRO ANÁLISIS</button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </main>
  );
}
