export async function onRequestPost(context) {
  const { username, pin, score } = await context.request.json();

  if (!username || !pin || typeof score !== 'number') {
    return new Response('Missing fields', { status: 400 });
  }

  const id = `${username}:${pin}`;
  const existing = await context.env.SCORES.get(id);

  if (!existing || parseInt(score) > parseInt(existing)) {
    await context.env.SCORES.put(id, score.toString());
  }

  return new Response('Score saved', { status: 200 });
}
