export async function onRequest({ request, env }) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
  }

  const kv = env.SCORES || env.KV_BINDING;
  if (!kv) {
    return new Response('KV namespace not configured', { status: 500, headers: corsHeaders });
  }

  try {
    const list = await kv.list();
    const result = (await Promise.all(
      list.keys.map(async (entry) => {
        try {
          const data = await kv.get(entry.name, { type: 'json' });
          if (!data) return null;
          const s = Number.parseInt(data.score, 10);
          if (!Number.isFinite(s)) return null;
          return { username: entry.name, score: s };
        } catch {
          return null;
        }
      })
    ))
      .filter(Boolean)
      .sort((a, b) => b.score - a.score);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch {
    return new Response('Failed to load scores', { status: 500, headers: corsHeaders });
  }
}
