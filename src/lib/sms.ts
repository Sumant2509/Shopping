interface SendSmsParams {
  phone: string;
  otp: string;
  adminName: string;
}

export async function sendOtpSms({
  phone,
  otp,
  adminName,
}: SendSmsParams): Promise<{ delivered: boolean; error?: string; provider?: string }> {
  const cleanPhone = phone.replace(/[^0-9]/g, ''); // e.g. 918878112007 or 8878112007
  const rawNumber = cleanPhone.length === 12 && cleanPhone.startsWith('91') ? cleanPhone.slice(2) : cleanPhone;

  // 1. FAST2SMS Integration (Fastest & Free for India +91 numbers)
  const fast2SmsKey = process.env.FAST2SMS_API_KEY;
  if (fast2SmsKey) {
    try {
      const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: fast2SmsKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: otp,
          numbers: rawNumber,
        }),
      });
      const data = await res.json();
      if (data.return) {
        console.log(`[SMS Gateway - Fast2SMS] Real SMS OTP delivered to ${rawNumber}`);
        return { delivered: true, provider: 'Fast2SMS' };
      } else {
        console.warn(`[SMS Gateway - Fast2SMS] Failed to send SMS:`, data);
        return { delivered: false, error: data.message || 'Fast2SMS failed' };
      }
    } catch (err: any) {
      console.error(`[SMS Gateway - Fast2SMS] Error:`, err);
      return { delivered: false, error: err.message };
    }
  }

  // 2. TWILIO SMS Integration
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER;
  if (twilioSid && twilioToken && twilioFrom) {
    try {
      const basicAuth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
      const body = new URLSearchParams({
        To: phone.startsWith('+') ? phone : `+91${rawNumber}`,
        From: twilioFrom,
        Body: `Sumant Crafts Security: Your Admin 2FA OTP code is ${otp}. Valid for 5 minutes.`,
      });

      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${basicAuth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: body.toString(),
        }
      );
      const data = await res.json();
      if (res.ok) {
        console.log(`[SMS Gateway - Twilio] Real SMS OTP delivered to ${phone}`);
        return { delivered: true, provider: 'Twilio' };
      } else {
        return { delivered: false, error: data.message };
      }
    } catch (err: any) {
      return { delivered: false, error: err.message };
    }
  }

  // If no SMS gateway configured
  console.log(
    `[SMS Gateway] No FAST2SMS_API_KEY or TWILIO credentials in .env.local. Mobile OTP for ${phone} is: ${otp}`
  );
  return {
    delivered: false,
    error: 'SMS_GATEWAY_CREDENTIALS_MISSING',
  };
}
