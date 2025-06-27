export async function onRequestGet(context) {
  const kv = context.env.SCORES || context.env.KV_BINDING;
  if (!kv) {
    return new Response('KV namespace not configured', { status: 500 });
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
    headers: { 'Content-Type': 'application/json' },
  });
}
