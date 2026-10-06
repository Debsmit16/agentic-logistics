type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export async function sendEmail(input: SendEmailInput): Promise<{ ok: boolean; dev?: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "Agentic Logistics <onboarding@resend.dev>";

  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") {
      console.log("[email-dev]", input.to, input.subject, input.text ?? input.html.slice(0, 120));
    }
    return { ok: true, dev: true };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Email failed: ${err}`);
  }

  return { ok: true };
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const subject = "Reset your Agentic Logistics password";
  const text = `Use this link to reset your password (valid 1 hour):\n\n${resetUrl}`;
  const html = `<p>Use this link to reset your password (valid 1 hour):</p><p><a href="${resetUrl}">${resetUrl}</a></p>`;
  return sendEmail({ to, subject, html, text });
}
