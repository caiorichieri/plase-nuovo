import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const { password } = await request.json();

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Password errata' }, { status: 401 });
    }

    const token = crypto.randomBytes(32).toString('hex');

    await pool.query(
      `INSERT INTO admin_sessions (token, expires_at) VALUES ($1, now() + INTERVAL '24 hours')`,
      [token]
    );

    const response = NextResponse.json({ success: true });
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Errore login:', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const token = request.cookies.get('admin_token')?.value;
  if (token) {
    await pool.query('DELETE FROM admin_sessions WHERE token = $1', [token]);
  }
  const response = NextResponse.json({ success: true });
  response.cookies.delete('admin_token');
  return response;
}
