export async function onRequest(context) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (context.request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (context.request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
  }

  const kv = context.env.KV_BINDING || context.env.SCORES;
  if (!kv) {
    return new Response('KV namespace not configured', {
      status: 500,
      headers: corsHeaders,
    });
  if (context.request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
  const kv = context.env.SCORES || context.env.KV_BINDING;
  if (!kv) {
    return new Response('KV namespace not configured', { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
  const { username, pin, score } = await context.request.json();

  if (!username || !pin || typeof score !== 'number') {
    return new Response('Missing fields', {
      status: 400,
      headers: corsHeaders,
    });
    return new Response('Missing fields', { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  const existing = await kv.get(username, { type: 'json' });

  if (!existing) {
    await kv.put(
      username,
      JSON.stringify({ pin, score: parseInt(score, 10) })
    );
  } else {
    if (existing.pin !== pin) {
      return new Response('Incorrect PIN', {
        status: 403,
        headers: corsHeaders,
      });
      return new Response('Incorrect PIN', { status: 403, headers: { 'Access-Control-Allow-Origin': '*' } });
    }
    if (parseInt(score, 10) > parseInt(existing.score, 10)) {
      await kv.put(
        username,
        JSON.stringify({ pin, score: parseInt(score, 10) })
      );
    }
  }

  return new Response('Score saved', { status: 200, headers: corsHeaders });
  return new Response('Score saved', { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } });
}
