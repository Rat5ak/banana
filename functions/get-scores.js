export async function onRequest(context) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (context.request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (context.request.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
  }

  const kv = context.env.KV_BINDING || context.env.SCORES;
  if (!kv) {
    return new Response('KV namespace not configured', {
      status: 500,
      headers: corsHeaders,
    });
  }
  const list = await kv.list();

  const result = (
    await Promise.all(
      list.keys.map(async (entry) => {
        const data = await kv.get(entry.name, { type: 'json' });
        if (!data || Number.isNaN(parseInt(data.score, 10))) return null;
        return { username: entry.name, score: parseInt(data.score, 10) };
      })
    )
  )
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);

  return new Response(JSON.stringify(result), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}
