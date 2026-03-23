export async function onRequestPost(context) {
  const { request, env } = context;

  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const body = await request.json();
    const { name, email, message, token } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: 'All fields are required.' }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Please complete the verification.' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Verify Turnstile token
    const turnstileResponse = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: env.TURNSTILE_SECRET_KEY,
          response: token,
          remoteip: request.headers.get('CF-Connecting-IP'),
        }),
      }
    );

    const turnstileResult = await turnstileResponse.json();

    if (!turnstileResult.success) {
      return new Response(
        JSON.stringify({ error: 'Verification failed. Please try again.' }),
        { status: 403, headers: corsHeaders }
      );
    }

    // Store in D1
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';

    await env.DB.prepare(
      'INSERT INTO contact_submissions (name, email, message, ip_address) VALUES (?, ?, ?, ?)'
    ).bind(name, email, message, ip).run();

    // Notify via Slack
    if (env.SLACK_WEBHOOK_URL) {
      await fetch(env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `New contact form submission from ${name}`,
          blocks: [
            {
              type: 'header',
              text: { type: 'plain_text', text: 'New Contact Form Submission' },
            },
            {
              type: 'section',
              fields: [
                { type: 'mrkdwn', text: `*Name:*\n${name}` },
                { type: 'mrkdwn', text: `*Email:*\n${email}` },
              ],
            },
            {
              type: 'section',
              text: { type: 'mrkdwn', text: `*Message:*\n${message}` },
            },
          ],
        }),
      });
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Internal server error.' }),
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
