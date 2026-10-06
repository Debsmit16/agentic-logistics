const FAST2SMS_URL = "https://www.fast2sms.com/dev/bulkV2";

export async function sendOtpSms(phone: string, otp: string): Promise<void> {
  const apiKey = process.env.FAST2SMS_API_KEY;
  if (!apiKey) {
    throw new Error("FAST2SMS_API_KEY is not configured");
  }

  const senderId = process.env.FAST2SMS_SENDER_ID ?? "FSTSMS";
  const route = process.env.FAST2SMS_ROUTE ?? "otp";
  const message = `Your Agentic Logistics delivery OTP is ${otp}. Do not share it.`;

  const body = new URLSearchParams({
    authorization: apiKey,
    route,
    sender_id: senderId,
    message,
    numbers: phone.replace(/\D/g, ""),
    flash: "0",
  });

  const res = await fetch(FAST2SMS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`SMS send failed: ${text.slice(0, 200)}`);
  }

  const json = (await res.json()) as { return?: boolean; message?: string };
  if (json.return === false) {
    throw new Error(json.message ?? "SMS provider rejected the request");
  }
}
