import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const result = await pool.query('SELECT * FROM responses WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Risposta non trovata' }, { status: 404 });
    }
    return NextResponse.json({ response: result.rows[0] });
  } catch (error) {
    console.error('Errore fetch response:', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const { selections, notes } = await request.json();

    // Calcola vettore finale dalle selezioni
    const final = computeFinalVector(selections);

    await pool.query(
      `UPDATE responses SET
        annotation_status = 'annotated',
        annotated_at = now(),
        annotator_notes = $1,
        selections = $2,
        final_V = $3,
        final_A = $4,
        final_R = $5,
        final_T = $6,
        final_phi_elab = $7,
        final_phi_comport = $8,
        final_delta = $9,
        final_window = $10,
        final_stadio = $11
       WHERE id = $12`,
      [notes, JSON.stringify(selections),
       final.V, final.A, final.R, final.T,
       final.phi_elab, final.phi_comport, final.delta,
       final.window, final.stadio, id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Errore save annotation:', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}

function computeFinalVector(selections) {
  // selections = { D1: { V: {option: 'A', value: -0.65}, A: {...}, ... }, D2: {...} }
  const dims = ['V', 'A', 'R', 'T', 'Phi_elab', 'Phi_comport', 'Delta'];
  const result = {};

  // Media ponderata sui valori selezionati per ogni dimensione
  const keys = Object.keys(selections); // D1, D2, ...
  const counts = {};
  const sums = {};

  dims.forEach(d => { sums[d] = 0; counts[d] = 0; });

  keys.forEach(dKey => {
    const dSel = selections[dKey];
    dims.forEach(dim => {
      if (dSel[dim] && dSel[dim].value !== null && dSel[dim].value !== undefined) {
        sums[dim] += dSel[dim].value;
        counts[dim]++;
      }
    });
  });

  // Window state da V e A medi
  const avgV = counts.V > 0 ? sums.V / counts.V : 0;
  const avgA = counts.A > 0 ? sums.A / counts.A : 0;

  let window = 'OPEN';
  if (avgA < -0.60 && avgV < -0.60) window = 'CLOSED_BELOW';
  else if (avgA > 0.80 && avgV < -0.40) window = 'CLOSED_ABOVE';

  return {
    V: counts.V > 0 ? +(sums.V / counts.V).toFixed(3) : null,
    A: counts.A > 0 ? +(sums.A / counts.A).toFixed(3) : null,
    R: counts.R > 0 ? +(sums.R / counts.R).toFixed(3) : null,
    T: counts.T > 0 ? +(sums.T / counts.T).toFixed(3) : null,
    phi_elab: counts.Phi_elab > 0 ? +(sums.Phi_elab / counts.Phi_elab).toFixed(3) : null,
    phi_comport: counts.Phi_comport > 0 ? +(sums.Phi_comport / counts.Phi_comport).toFixed(3) : null,
    delta: counts.Delta > 0 ? +(sums.Delta / counts.Delta).toFixed(3) : null,
    window,
    stadio: deriveStadio(avgV, avgA, sums.Phi_elab / (counts.Phi_elab || 1)),
  };
}

function deriveStadio(V, A, phi) {
  if (A < -0.60 && V < -0.60) return 'Stadio 0 — Freeze';
  if (phi < 1.8) return 'Stadio 1 — Difesa attiva';
  if (phi < 2.5) return 'Stadio 2 — Riconoscimento';
  if (phi < 3.5) return 'Stadio 3 — Valutazione';
  if (phi < 4.5) return 'Stadio 4 — Decisione';
  return 'Stadio 5 — In percorso';
}
