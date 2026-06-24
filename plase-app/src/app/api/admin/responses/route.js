import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';

    let query = `SELECT id, created_at, language, age, sex, nationality, location,
                        d1, annotation_status, plase_analyzed_at, annotated_at
                 FROM responses`;

    if (status !== 'all') {
      query += ` WHERE annotation_status = '${status}'`;
    }

    query += ` ORDER BY created_at DESC`;

    const result = await pool.query(query);
    return NextResponse.json({ responses: result.rows });
  } catch (error) {
    console.error('Errore fetch responses:', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}
