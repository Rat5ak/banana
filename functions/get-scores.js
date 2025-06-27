export async function onRequestGet(context) {
  const list = await context.env.SCORES.list();

  const result = (await Promise.all(
    list.keys.map(async (entry) => {
      const [username] = entry.name.split(":");
      const scoreStr = await context.env.SCORES.get(entry.name);
      const score = parseInt(scoreStr, 10);
      if (Number.isNaN(score)) return null;
      return { username, score };
    })
  ))
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);

  return new Response(JSON.stringify(result), {
    headers: { "Content-Type": "application/json" },
  });
}
