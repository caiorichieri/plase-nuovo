import "./globals.css";

export const metadata = {
  title: "PLASE Research — Bidoc S.r.l.",
  description: "Questionario di ricerca PLASE — Phase-Conditioned Longitudinal Affective State Estimator",
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body className="bg-stone-50 text-stone-800 antialiased">{children}</body>
    </html>
  );
}
