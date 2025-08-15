export async function onRequest({ request, env }) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
  }

  const kv = env.SCORES || env.KV_BINDING;
  if (!kv) {
    return new Response('KV namespace not configured', { status: 500, headers: corsHeaders });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response('Invalid JSON', { status: 400, headers: corsHeaders });
  }

  let { username, pin, score } = body;
  if (typeof username !== 'string' || typeof pin !== 'string' || (typeof score !== 'number' && typeof score !== 'string')) {
    return new Response('Missing fields', { status: 400, headers: corsHeaders });
  }

  username = username.trim();
  pin = pin.trim();
  const numericScore = Number.parseInt(score, 10);

  if (!username || !pin || !Number.isFinite(numericScore)) {
    return new Response('Missing fields', { status: 400, headers: corsHeaders });
  }

  try {
    const existing = await kv.get(username, { type: 'json' });

    if (!existing) {
      await kv.put(username, JSON.stringify({ pin, score: numericScore }));
      return new Response('Score saved', { status: 200, headers: corsHeaders });
    }

    if (existing.pin !== pin) {
      return new Response('Incorrect PIN', { status: 403, headers: corsHeaders });
    }

    const current = Number.parseInt(existing.score, 10);
    if (!Number.isFinite(current) || numericScore > current) {
      await kv.put(username, JSON.stringify({ pin, score: numericScore }));
    }

    return new Response('Score saved', { status: 200, headers: corsHeaders });
  } catch {
    return new Response('Failed to save score', { status: 500, headers: corsHeaders });
  }
}
