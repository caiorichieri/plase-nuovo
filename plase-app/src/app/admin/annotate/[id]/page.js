"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

const DIMS = ["V", "A", "R", "T", "Phi_elab", "Phi_comport", "Delta"];
const DIM_LABELS = {
  V: "Valenza", A: "Arousal", R: "Resistenza",
  T: "Traiettoria", Phi_elab: "Phi Elaborativa",
  Phi_comport: "Phi Comportamentale", Delta: "Desiderata"
};
const DIM_RANGE = {
  V: "[-1, +1]", A: "[-1, +1]", R: "[-1, +1]",
  T: "[-1, +1]", Phi_elab: "[1, 5]", Phi_comport: "[1, 5]", Delta: "[-1, +1]"
};

export default function AnnotatePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState("");
  const [selections, setSelections] = useState({});
  const [manualValues, setManualValues] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/annotate/${id}`)
      .then(r => r.json())
      .then(d => {
        setData(d.response);
        setNotes(d.response.annotator_notes || "");
        if (d.response.selections) setSelections(d.response.selections);
        setLoading(false);
      });
  }, [id]);

  const plaseOptions = data?.plase_options;
  const domande = plaseOptions?.domande || [];

  const setSelection = (dId, dim, option, value) => {
    setSelections(prev => ({
      ...prev,
      [dId]: { ...prev[dId], [dim]: { option, value } }
    }));
  };

  const setManual = (dId, dim, value) => {
    const num = parseFloat(value);
    setManualValues(prev => ({ ...prev, [`${dId}_${dim}`]: value }));
    if (!isNaN(num)) {
      setSelection(dId, dim, "manual", num);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    const res = await fetch(`/api/admin/annotate/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selections, notes }),
    });
    if (res.ok) {
      router.push("/admin/dashboard");
    } else {
      setError("Errore nel salvataggio.");
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: "2rem", fontFamily: "system-ui" }}>Caricamento...</div>;
  if (!data) return <div style={{ padding: "2rem" }}>Risposta non trovata.</div>;

  const windowState = plaseOptions?.window_state;
  const windowColors = { OPEN: "#27ae60", CLOSED_BELOW: "#c0392b", CLOSED_ABOVE: "#e67e22" };

  return (
    <div style={{ minHeight: "100vh", background: "#f4f4f8", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#1a1a2e", color: "#fff", padding: "1rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span style={{ fontWeight: 700 }}>Annotazione PLASE</span>
          <span style={{ marginLeft: "1rem", fontSize: "0.8rem", opacity: 0.6, fontFamily: "monospace" }}>{id?.slice(0, 8)}...</span>
        </div>
        <button onClick={() => router.push("/admin/dashboard")} style={{ background: "transparent", border: "1px solid #555", color: "#ccc", padding: "0.4rem 0.8rem", borderRadius: "4px", cursor: "pointer", fontSize: "0.85rem" }}>
          ← Dashboard
        </button>
      </div>

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "2rem" }}>

        {/* Info risposta */}
        <div style={{ background: "#fff", borderRadius: "8px", padding: "1.25rem", marginBottom: "1.5rem", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", fontSize: "0.875rem", color: "#555" }}>
            <span><b>Data:</b> {new Date(data.created_at).toLocaleString("it-IT")}</span>
            <span><b>Lingua:</b> {data.language?.toUpperCase()}</span>
            <span><b>Età:</b> {data.age}</span>
            <span><b>Sesso:</b> {data.sex}</span>
            <span><b>Naz.:</b> {data.nationality}</span>
            <span><b>Area:</b> {data.location}</span>
            {windowState && (
              <span style={{ background: (windowColors[windowState] || "#999") + "20", color: windowColors[windowState] || "#999", padding: "0.2rem 0.6rem", borderRadius: "12px", fontWeight: 600 }}>
                {windowState}
              </span>
            )}
            {plaseOptions?.crisis_flag && (
              <span style={{ background: "#c0392b20", color: "#c0392b", padding: "0.2rem 0.6rem", borderRadius: "12px", fontWeight: 700 }}>
                🔴 CRISI
              </span>
            )}
          </div>
        </div>

        {/* Errore analisi */}
        {!plaseOptions && (
          <div style={{ background: "#fff3cd", border: "1px solid #ffc107", borderRadius: "8px", padding: "1rem", marginBottom: "1.5rem", color: "#856404" }}>
            ⚠️ L'analisi PLASE non è ancora disponibile per questa risposta.
          </div>
        )}

        {/* Domande e anotação */}
        {domande.map((domanda, dIdx) => (
          <div key={domanda.domanda_id} style={{ background: "#fff", borderRadius: "8px", marginBottom: "1.5rem", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", overflow: "hidden" }}>
            {/* Header domanda */}
            <div style={{ background: "#1a1a2e", color: "#fff", padding: "0.75rem 1.25rem" }}>
              <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>{domanda.domanda_id}</span>
            </div>

            {/* Testo risposta */}
            <div style={{ padding: "1rem 1.25rem", background: "#f8f9fa", borderBottom: "1px solid #eee", fontStyle: "italic", color: "#333", fontSize: "0.95rem" }}>
              "{domanda.testo}"
            </div>

            {/* Dimensioni */}
            <div style={{ padding: "1.25rem" }}>
              {DIMS.map(dim => {
                const dimData = domanda.dimensioni?.[dim];
                if (!dimData) return null;
                const sel = selections[domanda.domanda_id]?.[dim];
                const manualKey = `${domanda.domanda_id}_${dim}`;

                return (
                  <div key={dim} style={{ marginBottom: "1.25rem", paddingBottom: "1.25rem", borderBottom: "1px solid #f0f0f0" }}>
                    <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#1a1a2e", marginBottom: "0.5rem" }}>
                      {DIM_LABELS[dim]} <span style={{ fontWeight: 400, color: "#999" }}>{DIM_RANGE[dim]}</span>
                    </div>

                    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                      {["A", "B", "C"].map(opt => {
                        const optData = dimData[`opzione_${opt}`];
                        if (!optData) return null;
                        const isSelected = sel?.option === opt;

                        return (
                          <div key={opt} onClick={() => setSelection(domanda.domanda_id, dim, opt, optData.valore)}
                            style={{
                              flex: "1", minWidth: "200px", padding: "0.75rem", borderRadius: "6px", cursor: "pointer",
                              border: `2px solid ${isSelected ? "#1a1a2e" : "#e0e0e0"}`,
                              background: isSelected ? "#1a1a2e08" : "#fff",
                              transition: "all 0.15s"
                            }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                              <span style={{ fontWeight: 700, fontSize: "0.8rem", color: isSelected ? "#1a1a2e" : "#555" }}>
                                {opt} — {optData.nome}
                              </span>
                              <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "#2980b9", fontFamily: "monospace" }}>
                                {optData.valore}
                              </span>
                            </div>
                            <p style={{ fontSize: "0.78rem", color: "#555", margin: "0 0 0.25rem" }}>{optData.descrizione}</p>
                            <p style={{ fontSize: "0.72rem", color: "#999", margin: 0, fontStyle: "italic" }}>{optData.teoria}</p>
                          </div>
                        );
                      })}

                      {/* Valore manuale */}
                      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", minWidth: "120px" }}>
                        <label style={{ fontSize: "0.75rem", color: "#999", marginBottom: "0.25rem" }}>Manuale</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="es. -0.72"
                          value={manualValues[manualKey] || ""}
                          onChange={e => setManual(domanda.domanda_id, dim, e.target.value)}
                          style={{
                            padding: "0.5rem", border: `2px solid ${sel?.option === "manual" ? "#1a1a2e" : "#e0e0e0"}`,
                            borderRadius: "6px", fontSize: "0.85rem", width: "100%", boxSizing: "border-box"
                          }}
                        />
                      </div>
                    </div>

                    {sel && (
                      <div style={{ marginTop: "0.4rem", fontSize: "0.75rem", color: "#27ae60" }}>
                        ✓ Selezionato: {sel.option === "manual" ? `Manuale (${sel.value})` : `Opzione ${sel.option} (${sel.value})`}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Note e salvataggio */}
        <div style={{ background: "#fff", borderRadius: "8px", padding: "1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
          <label style={{ fontWeight: 600, fontSize: "0.9rem", display: "block", marginBottom: "0.5rem" }}>Note cliniche</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={4}
            placeholder="Osservazioni, flag clinici, motivazioni per scelte manuali..."
            style={{ width: "100%", padding: "0.75rem", border: "1px solid #ddd", borderRadius: "6px", fontSize: "0.9rem", resize: "vertical", boxSizing: "border-box" }}
          />

          {error && <p style={{ color: "#c0392b", fontSize: "0.85rem", marginTop: "0.5rem" }}>{error}</p>}

          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", justifyContent: "flex-end" }}>
            <button onClick={() => router.push("/admin/dashboard")}
              style={{ padding: "0.75rem 1.5rem", background: "#f0f0f0", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.9rem" }}>
              Annulla
            </button>
            <button onClick={handleSave} disabled={saving}
              style={{ padding: "0.75rem 2rem", background: "#27ae60", color: "#fff", border: "none", borderRadius: "6px", cursor: saving ? "not-allowed" : "pointer", fontSize: "0.9rem", opacity: saving ? 0.7 : 1, fontWeight: 600 }}>
              {saving ? "Salvataggio..." : "✓ Salva Annotazione"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
