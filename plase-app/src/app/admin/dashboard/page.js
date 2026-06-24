"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const STATUS_LABEL = {
  pending: { label: "Da annotare", color: "#e67e22" },
  annotated: { label: "Annotata", color: "#27ae60" },
  exported: { label: "Esportata", color: "#2980b9" },
};

export default function Dashboard() {
  const router = useRouter();
  const [responses, setResponses] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/responses?status=${filter}`)
      .then(r => r.json())
      .then(d => { setResponses(d.responses || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [filter]);

  const handleLogout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/admin");
  };

  const counts = responses.reduce((acc, r) => {
    acc[r.annotation_status] = (acc[r.annotation_status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#1a1a2e", color: "#fff", padding: "1rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>PLASE — Annotation Dashboard</span>
          <span style={{ marginLeft: "1rem", fontSize: "0.85rem", opacity: 0.7 }}>Bidoc S.r.l.</span>
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <a href="/api/admin/export?format=csv" style={{ color: "#aaa", fontSize: "0.85rem", textDecoration: "none" }}>↓ CSV</a>
          <a href="/api/admin/export?format=json" style={{ color: "#aaa", fontSize: "0.85rem", textDecoration: "none" }}>↓ JSON</a>
          <button onClick={handleLogout} style={{ background: "transparent", border: "1px solid #555", color: "#ccc", padding: "0.4rem 0.8rem", borderRadius: "4px", cursor: "pointer", fontSize: "0.85rem" }}>Esci</button>
        </div>
      </div>

      <div style={{ padding: "2rem", maxWidth: "1100px", margin: "0 auto" }}>
        {/* Stats */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
          {["pending", "annotated", "exported"].map(s => (
            <div key={s} style={{ background: "#fff", padding: "1rem 1.5rem", borderRadius: "8px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", borderLeft: `4px solid ${STATUS_LABEL[s].color}` }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{counts[s] || 0}</div>
              <div style={{ fontSize: "0.8rem", color: "#666" }}>{STATUS_LABEL[s].label}</div>
            </div>
          ))}
          <div style={{ background: "#fff", padding: "1rem 1.5rem", borderRadius: "8px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", borderLeft: "4px solid #9b59b6" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{responses.length}</div>
            <div style={{ fontSize: "0.8rem", color: "#666" }}>Totale</div>
          </div>
        </div>

        {/* Filtro */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          {["all", "pending", "annotated", "exported"].map(s => (
            <button key={s} onClick={() => { setFilter(s); setLoading(true); }}
              style={{ padding: "0.4rem 1rem", borderRadius: "20px", border: "1px solid #ddd", background: filter === s ? "#1a1a2e" : "#fff", color: filter === s ? "#fff" : "#333", cursor: "pointer", fontSize: "0.85rem" }}>
              {s === "all" ? "Tutte" : STATUS_LABEL[s].label}
            </button>
          ))}
        </div>

        {/* Tabella */}
        {loading ? (
          <p style={{ color: "#999" }}>Caricamento...</p>
        ) : responses.length === 0 ? (
          <p style={{ color: "#999" }}>Nessuna risposta trovata.</p>
        ) : (
          <div style={{ background: "#fff", borderRadius: "8px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f1f3f5", fontSize: "0.8rem", color: "#555" }}>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "left" }}>Data</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "left" }}>Lingua</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "left" }}>Età/Sesso</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "left" }}>D1 (anteprima)</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "left" }}>Analisi</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "left" }}>Stato</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "left" }}></th>
                </tr>
              </thead>
              <tbody>
                {responses.map((r, i) => {
                  const s = STATUS_LABEL[r.annotation_status] || STATUS_LABEL.pending;
                  return (
                    <tr key={r.id} style={{ borderTop: "1px solid #f0f0f0", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                      <td style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", color: "#555" }}>
                        {new Date(r.created_at).toLocaleDateString("it-IT")}
                      </td>
                      <td style={{ padding: "0.75rem 1rem", fontSize: "0.85rem" }}>{r.language?.toUpperCase()}</td>
                      <td style={{ padding: "0.75rem 1rem", fontSize: "0.85rem" }}>{r.age} / {r.sex}</td>
                      <td style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", color: "#333", maxWidth: "220px" }}>
                        <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.d1}</span>
                      </td>
                      <td style={{ padding: "0.75rem 1rem", fontSize: "0.8rem" }}>
                        {r.plase_analyzed_at ? <span style={{ color: "#27ae60" }}>✓ Pronta</span> : <span style={{ color: "#e67e22" }}>In attesa</span>}
                      </td>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        <span style={{ background: s.color + "20", color: s.color, padding: "0.2rem 0.6rem", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 600 }}>
                          {s.label}
                        </span>
                      </td>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        <button onClick={() => router.push(`/admin/annotate/${r.id}`)}
                          style={{ background: "#1a1a2e", color: "#fff", border: "none", padding: "0.4rem 0.8rem", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" }}>
                          {r.annotation_status === "pending" ? "Annota" : "Rivedi"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
