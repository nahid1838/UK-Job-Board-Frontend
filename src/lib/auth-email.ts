export const authEmailEnabled = Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);

export async function sendAuthEmail(to: string, subject: string, text: string) {
  const result = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [to], subject, text }),
    signal: AbortSignal.timeout(8000),
  });
  if (!result.ok) {
    console.error("Authentication email delivery failed", result.status);
    throw new Error("Email delivery is temporarily unavailable.");
  }
}
