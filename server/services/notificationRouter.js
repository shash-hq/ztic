import twilio        from 'twilio';
import { Resend }    from 'resend';
import axios         from 'axios';

// ── Clients (initialised lazily so missing env vars only throw on use) ────────

const getTwilioClient = () =>
  twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

const getResendClient = () => new Resend(process.env.RESEND_API_KEY);

// ── Channel implementations ───────────────────────────────────────────────────

/**
 * Send OTP via SMS using Twilio Programmable Messaging.
 * @param {string} phone  E.164 format e.g. +919876543210
 * @param {string} otp    Plain 6-digit OTP (only sent here, never stored)
 */
const sendSms = async (phone, otp) => {
  const client = getTwilioClient();
  await client.messages.create({
    body: `Your ZTic verification code is ${otp}. Valid for 10 minutes. Do not share it with anyone.`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone,
  });
};

/**
 * Send OTP via Email using Resend.
 * @param {string} email
 * @param {string} otp
 */
const sendEmail = async (email, otp) => {
  const resend = getResendClient();
  const { error } = await resend.emails.send({
    // 👇 FIXED LINE: Use the exact sandbox email or your dedicated env variable
    from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev', 
    to: [email],
    subject: `${otp} is your ZTic verification code`,
    html: `
      <div style="font-family:'Space Grotesk',sans-serif;background:#1A1C1A;padding:48px;">
        <div style="max-width:480px;margin:0 auto;background:#FAF9F6;border:2px solid #1A1C1A;box-shadow:4px 4px 0 0 #800020;padding:40px;">
          <p style="font-size:11px;letter-spacing:0.35em;text-transform:uppercase;color:#800020;margin-bottom:8px;">
            ZTic — Verification
          </p>
          <h1 style="font-size:48px;font-weight:900;letter-spacing:-0.03em;margin:0 0 32px;color:#1A1C1A;">
            ${otp}
          </h1>
          <p style="font-size:13px;line-height:1.75;color:rgba(26,28,26,0.6);margin-bottom:24px;">
            Enter this code to complete your sign-in. It expires in 10 minutes.
            If you did not request this, ignore this email.
          </p>
          <p style="font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(26,28,26,0.3);">
            © 2025 ZTic — The Ink-Stained Architect
          </p>
        </div>
      </div>
    `,
  });
  if (error) throw new Error(`Resend error: ${error.message}`);
};
/**
 * Send OTP via WhatsApp using Gupshup's REST API.
 * Gupshup does not publish an official Node SDK; their REST API is the
 * canonical integration method per their documentation.
 * @param {string} phone  E.164 format
 * @param {string} otp
 */
const sendWhatsApp = async (phone, otp) => {
  // Gupshup requires the phone without the leading '+' sign
  const normalizedPhone = phone.replace(/^\+/, '');

  const params = new URLSearchParams({
    channel:      'whatsapp',
    source:       process.env.GUPSHUP_SOURCE_NUMBER,
    destination:  normalizedPhone,
    // Use a Gupshup-approved template to avoid message filtering
    // Template must be registered in your Gupshup account dashboard
    'src.name':   process.env.GUPSHUP_APP_NAME,
    message: JSON.stringify({
      type: 'text',
      text: `Your ZTic verification code is *${otp}*. Valid for 10 minutes. Do not share it with anyone.`,
    }),
  });

  const response = await axios.post(
    'https://api.gupshup.io/sm/api/v1/msg',
    params.toString(),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        apikey: process.env.GUPSHUP_API_KEY,
      },
    }
  );

  if (response.data?.status === 'error') {
    throw new Error(`Gupshup error: ${response.data.message}`);
  }
};

// ── Router (public interface) ─────────────────────────────────────────────────

/**
 * Route an OTP to the correct delivery channel.
 * @param {string} channel  'email' | 'sms' | 'whatsapp'
 * @param {string} contact  Email address or E.164 phone number
 * @param {string} otp      Plain 6-digit OTP — routed here, never stored
 */
export const routeOtp = async (channel, contact, otp) => {
  switch (channel) {
    case 'sms':
      return sendSms(contact, otp);
    case 'whatsapp':
      return sendWhatsApp(contact, otp);
    case 'email':
      return sendEmail(contact, otp);
    default:
      throw new Error(`Unknown notification channel: ${channel}`);
  }
};
