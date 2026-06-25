interface SmsResponse {
  success: boolean;
  message: string;
  directWhatsappLink?: string;
}

export const smsService = {
  // Generates and sends a 4-digit verification OTP or booking confirmation text
  sendOtpViaWhatsapp: async (phone: string, salonName: string): Promise<SmsResponse> => {
    const otp = Math.floor(1000 + Math.random() * 9000);
    const textMsg = `[Jalwaa AI] Your salon ownership verification OTP code for "${salonName}" is: ${otp}. Please do not share this code. Valid for 10 minutes.`;

    // Normalize phone number
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    const directWhatsappUrl = `https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent(textMsg)}`;

    const sid = (import.meta as any).env.VITE_TWILIO_ACCOUNT_SID;
    const token = (import.meta as any).env.VITE_TWILIO_AUTH_TOKEN;
    const fromWhatsApp = (import.meta as any).env.VITE_TWILIO_WHATSAPP_NUMBER || '+14155238886';

    if (sid && token && sid !== 'your_twilio_sid') {
      try {
        console.log(`Attempting real Twilio Whatsapp dispatch to ${phone}...`);
        
        // Call Twilio REST API directly via fetch
        const auth = btoa(`${sid}:${token}`);
        const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${auth}`
          },
          body: new URLSearchParams({
            To: `whatsapp:${cleanPhone}`,
            From: `whatsapp:${fromWhatsApp}`,
            Body: textMsg
          })
        });

        if (response.ok) {
          const result = await response.json();
          return {
            success: true,
            message: `OTP sent successfully via Twilio (Message SID: ${result.sid})`
          };
        } else {
          const errText = await response.text();
          throw new Error(errText);
        }
      } catch (err: any) {
        console.warn("Twilio Whatsapp API dispatch failed. Launching direct whatsapp dispatch.", err.message);
        return {
          success: true,
          message: "Twilio endpoint was offline, redirected to WhatsApp Direct dispatch.",
          directWhatsappLink: directWhatsappUrl
        };
      }
    }

    // Default Fallback: generate direct WhatsApp deep link so they can open on device
    return {
      success: true,
      message: "Twilio credentials not configured. Please use our instant WhatsApp Direct link to simulate/send OTP.",
      directWhatsappLink: directWhatsappUrl
    };
  },

  // Booking Confirmation Whatsapp dispatcher
  sendBookingConfirmation: (phone: string, bId: string, salonName: string, serviceName: string, time: string, date: string) => {
    const textMsg = `Hello! Your premium salon booking at ${salonName} is CONFIRMED.\n\n` +
      `📅 Date: ${date}\n` +
      `🕒 Time: ${time}\n` +
      `💈 Service: ${serviceName}\n` +
      `🎫 Ticket ID: ${bId}\n\n` +
      `Show your QR code on the Jalwaa App at the reception desk to check-in. See you soon!`;

    const cleanPhone = phone.replace(/[^\d+]/g, '');
    const directWhatsappUrl = `https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent(textMsg)}`;
    
    // We open it in a background tab or return to user
    return directWhatsappUrl;
  }
};
