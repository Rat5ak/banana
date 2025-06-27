export async function onRequestPost(context) {
  const { username, pin, score } = await context.request.json();

  if (!username || !pin || typeof score !== 'number') {
    return new Response('Missing fields', { status: 400 });
  }

  const existing = await context.env.SCORES.get(username, { type: 'json' });

  if (!existing) {
    await context.env.SCORES.put(
      username,
      JSON.stringify({ pin, score: parseInt(score, 10) })
    );
  } else {
    if (existing.pin !== pin) {
      return new Response('Incorrect PIN', { status: 403 });
    }
    if (parseInt(score, 10) > parseInt(existing.score, 10)) {
      await context.env.SCORES.put(
        username,
        JSON.stringify({ pin, score: parseInt(score, 10) })
      );
    }
  }

  return new Response('Score saved', { status: 200 });
}
