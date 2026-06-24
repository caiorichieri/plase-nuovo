import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';

    const result = await pool.query(
      `SELECT id, created_at, language, age, sex, nationality, location,
              d1, d2, d3, d4, d5, d6_scale, d6_text,
              selections, annotator_notes, annotated_at,
              final_V, final_A, final_R, final_T,
              final_phi_elab, final_phi_comport, final_delta,
              final_window, final_stadio
       FROM responses
       WHERE annotation_status = 'annotated'
       ORDER BY annotated_at DESC`
    );

    const rows = result.rows;

    if (format === 'csv') {
      const headers = [
        'id','created_at','language','age','sex','nationality','location',
        'd1','d2','d3','d4','d5','d6_scale','d6_text',
        'final_V','final_A','final_R','final_T',
        'final_phi_elab','final_phi_comport','final_delta',
        'final_window','final_stadio','annotator_notes'
      ];

      const csv = [
        headers.join(','),
        ...rows.map(r => headers.map(h => {
          const val = r[h];
          if (val === null || val === undefined) return '';
          const str = String(val).replace(/"/g, '""');
          return str.includes(',') || str.includes('\n') ? `"${str}"` : str;
        }).join(','))
      ].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="plase_training_${Date.now()}.csv"`,
        },
      });
    }

    // JSON format
    const jsonData = {
      exported_at: new Date().toISOString(),
      count: rows.length,
      dataset: rows,
    };

    return new NextResponse(JSON.stringify(jsonData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="plase_training_${Date.now()}.json"`,
      },
    });
  } catch (error) {
    console.error('Errore export:', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}
