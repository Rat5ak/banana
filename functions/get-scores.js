export async function onRequestGet(context) {
  const list = await context.env.SCORES.list();
  const result = [];

  for (const entry of list.keys) {
    const [username] = entry.name.split(':');
    const score = await context.env.SCORES.get(entry.name);
    result.push({ username, score: parseInt(score) });
  }

  result.sort((a, b) => b.score - a.score);

  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' }
  });
}
