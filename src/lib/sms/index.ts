import { sendOtpSms } from "@/lib/sms/fast2sms";

export type OtpSendResult = {
  sent: boolean;
  /** Present only when SMS is not configured (development). */
  devOtp?: string;
};

export async function sendDeliveryOtpMessage(
  phone: string,
  otp: string,
): Promise<OtpSendResult> {
  const apiKey = process.env.FAST2SMS_API_KEY?.trim();
  const devMode =
    process.env.SMS_DEV_MODE === "true" ||
    !apiKey ||
    apiKey === "your-key";

  if (devMode) {
    console.info(`[SMS_DEV] OTP for ${phone}: ${otp}`);
    return { sent: false, devOtp: otp };
  }

  await sendOtpSms(phone, otp);
  return { sent: true };
}
