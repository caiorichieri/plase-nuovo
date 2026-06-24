import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import pool from '@/lib/db';
import { buildAnnotationMessage, ANNOTATION_SYSTEM_PROMPT } from '@/lib/annotation-prompt';

export const maxDuration = 60;

export async function POST(request) {
  try {
    const data = await request.json();

    // Validação básica
    const required = ['language', 'age', 'sex', 'nationality', 'location', 'd1', 'd2', 'd3', 'd4', 'd5', 'd6_scale'];
    for (const field of required) {
      if (!data[field]) return NextResponse.json({ error: `Campo mancante: ${field}` }, { status: 400 });
    }

    // Inserir resposta no banco
    const insertResult = await pool.query(
      `INSERT INTO responses (language, age, sex, nationality, location, d1, d2, d3, d4, d5, d6_scale, d6_text)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`,
      [data.language, data.age, data.sex, data.nationality, data.location,
       data.d1, data.d2, data.d3, data.d4, data.d5, data.d6_scale, data.d6_text || null]
    );

    const responseId = insertResult.rows[0].id;

    // Chamar Claude para gerar opções de anotação
    try {
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const message = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 4000,
        system: ANNOTATION_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: buildAnnotationMessage(data) }],
      });

      const rawText = message.content[0].text;

      // Parse JSON — remove possíveis blocos markdown
      const jsonStr = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const plaseOptions = JSON.parse(jsonStr);

      // Atualizar com as opções geradas
      await pool.query(
        `UPDATE responses SET plase_options = $1, plase_analyzed_at = now() WHERE id = $2`,
        [JSON.stringify(plaseOptions), responseId]
      );
    } catch (aiError) {
      console.error('Errore analisi PLASE:', aiError);
      // Continua mesmo sem análise — a resposta está salva
    }

    return NextResponse.json({ success: true, id: responseId });
  } catch (error) {
    console.error('Errore submit:', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}
