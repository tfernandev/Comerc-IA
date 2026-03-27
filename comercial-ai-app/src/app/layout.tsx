import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Diagnóstico Comercial IA | Potencia tu negocio en 5 minutos",
  description: "Descubre los cuellos de botella y prioridades estratégicas clave para tu negocio comercial en menos de 5 minutos, con IA.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body style={{ fontFamily: "'Inter', system-ui, sans-serif", margin: 0, padding: 0 }} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
