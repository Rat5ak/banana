export async function onRequestGet(context) {
  const list = await context.env.SCORES.list();

  const result = (
    await Promise.all(
      list.keys.map(async (entry) => {
        const data = await context.env.SCORES.get(entry.name, { type: 'json' });
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
