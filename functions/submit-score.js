export async function onRequestPost(context) {
  const kv = context.env.SCORES || context.env.KV_BINDING;
  if (!kv) {
    return new Response('KV namespace not configured', { status: 500 });
  }
  const { username, pin, score } = await context.request.json();

  if (!username || !pin || typeof score !== 'number') {
    return new Response('Missing fields', { status: 400 });
  }

  const existing = await kv.get(username, { type: 'json' });

  if (!existing) {
    await kv.put(
      username,
      JSON.stringify({ pin, score: parseInt(score, 10) })
    );
  } else {
    if (existing.pin !== pin) {
      return new Response('Incorrect PIN', { status: 403 });
    }
    if (parseInt(score, 10) > parseInt(existing.score, 10)) {
      await kv.put(
        username,
        JSON.stringify({ pin, score: parseInt(score, 10) })
      );
    }
  }

  return new Response('Score saved', { status: 200 });
}
