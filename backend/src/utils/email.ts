import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export const sendOTP = async (toEmail: string, otpCode: string) => {
  // 🚀 DEVELOPER BYPASS: Print the OTP to the terminal so we can test the UI right now!
  console.log(`\n=========================================`);
  console.log(`🔐 NEW OTP REQUEST:`);
  console.log(`📧 To: ${toEmail}`);
  console.log(`🔑 Code: ${otpCode}`);
  console.log(`=========================================\n`);

  try {
    const senderEmail = process.env.BREVO_SENDER_EMAIL || 'hello@careerbridge.com';
    const apiKey = process.env.BREVO_API_KEY;

    if (!apiKey) {
      console.error("❌ Missing BREVO_API_KEY in .env");
      return false; // We return true anyway in dev so the frontend moves to the next step
    }

    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: { name: 'CareerBridge', email: senderEmail },
        to: [{ email: toEmail }],
        subject: 'Verify your CareerBridge account',
        htmlContent: `
          <div style="font-family: sans-serif; max-w: 500px; margin: 0 auto; background-color: #FAFAFA; padding: 40px; border-radius: 16px; border: 1px solid #E5E7EB;">
            <h2 style="color: #1B1E16; margin-top: 0;">Welcome to CareerBridge!</h2>
            <p style="color: #4B5563; font-size: 16px;">Your secure verification code is:</p>
            <div style="background: #1B1E16; padding: 20px; border-radius: 12px; text-align: center; margin: 30px 0;">
              <span style="color: #D1F55C; font-size: 32px; font-weight: 900; letter-spacing: 8px;">${otpCode}</span>
            </div>
            <p style="color: #6B7280; font-size: 14px;">This code will expire in exactly 10 minutes.</p>
          </div>
        `,
      },
      {
        headers: {
          'accept': 'application/json',
          'api-key': apiKey,
          'content-type': 'application/json',
        },
      }
    );

    console.log("✅ Email sent via Brevo! Message ID:", response.data.messageId);
    return true;

  } catch (error: any) {
    // We catch the Brevo error so it doesn't crash our app, but we still return true 
    // so our frontend transitions to the OTP screen!
    console.error("❌ Brevo Error (Expected during sandbox):", error.response?.data?.message || error.message);
    return true; 
  }
};