export async function onRequestPost(context) {
  const { request, env } = context;

  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const body = await request.json();
    const { name, email, message, contact_time, token } = body;

    // Honeypot - if filled in, it's a bot
    if (contact_time) {
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: corsHeaders }
      );
    }

    // Validate required fields (must be strings)
    if (typeof name !== 'string' || typeof email !== 'string' || typeof message !== 'string'
        || !name.trim() || !email.trim() || !message.trim()) {
      return new Response(
        JSON.stringify({ error: 'All fields are required.' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Length caps (protect D1 and stay within Slack Block Kit limits)
    if (name.length > 200 || email.length > 254 || message.length > 5000) {
      return new Response(
        JSON.stringify({ error: 'One or more fields are too long.' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Please enter a valid email address.' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Message length check
    if (message.trim().length < 10) {
      return new Response(
        JSON.stringify({ error: 'Message is too short.' }),
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

    // Time check - reject if submitted too quickly after Turnstile challenge
    if (turnstileResult.challenge_ts) {
      const challengeAge = Date.now() - new Date(turnstileResult.challenge_ts).getTime();
      if (challengeAge < 3000) {
        return new Response(
          JSON.stringify({ error: 'Please take a moment before submitting.' }),
          { status: 429, headers: corsHeaders }
        );
      }
    }

    // Store in D1
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';

    await env.DB.prepare(
      'INSERT INTO contact_submissions (name, email, message, ip_address) VALUES (?, ?, ?, ?)'
    ).bind(name, email, message, ip).run();

    // Notify via Slack. Escape mrkdwn metacharacters so a submission cannot inject
    // channel mentions or masked links, and keep each block within Slack's limits.
    // Failure here must not fail the response, but must be logged (the row is already in D1).
    if (env.SLACK_WEBHOOK_URL) {
      const esc = (str) => String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const msgText = esc(message).slice(0, 2900);
      try {
        const slackRes = await fetch(env.SLACK_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `New contact form submission from ${esc(name)}`,
            blocks: [
              {
                type: 'header',
                text: { type: 'plain_text', text: 'New Contact Form Submission' },
              },
              {
                type: 'section',
                fields: [
                  { type: 'mrkdwn', text: `*Name:*\n${esc(name).slice(0, 1900)}` },
                  { type: 'mrkdwn', text: `*Email:*\n${esc(email)}` },
                ],
              },
              {
                type: 'section',
                text: { type: 'mrkdwn', text: `*Message:*\n${msgText}${message.length > 2900 ? '\n_(truncated - full text in D1)_' : ''}` },
              },
            ],
          }),
        });
        if (!slackRes.ok) {
          console.error('Slack notify failed', slackRes.status, await slackRes.text());
        }
      } catch (slackErr) {
        console.error('Slack notify threw', slackErr);
      }
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
