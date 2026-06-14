import prisma from './prisma';

export interface OutboundNotification {
  type: 'EMAIL' | 'WHATSAPP';
  recipient: string;
  subject?: string;
  content: string;
}

export async function sendEmailNotification(
  orderId: string,
  email: string,
  subject: string,
  htmlContent: string
): Promise<boolean> {
  console.log(`[Notification Engine] [EMAIL] Sending to ${email} (Order ID: ${orderId})...`);
  console.log(`[Subject] ${subject}`);

  try {
    // If Resend API Key is set, you would make a fetch to:
    // https://api.resend.com/emails
    const resendApiKey = process.env.RESEND_API_KEY;
    let status = 'SENT_MOCK';

    if (resendApiKey) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Photo Frame Store <orders@yourdomain.com>',
            to: email,
            subject: subject,
            html: htmlContent,
          }),
        });
        if (response.ok) {
          status = 'SENT';
          console.log(`[Notification Engine] [EMAIL] Sent via Resend successfully.`);
        } else {
          status = 'FAILED';
          console.error(`[Notification Engine] [EMAIL] Resend returned status ${response.status}.`);
        }
      } catch (err) {
        status = 'FAILED';
        console.error(`[Notification Engine] [EMAIL] Failed to send via Resend:`, err);
      }
    }

    // Always log to database
    await prisma.notificationLog.create({
      data: {
        orderId,
        type: 'EMAIL',
        recipient: email,
        status,
        content: `Subject: ${subject}\n\n${htmlContent}`,
      },
    });

    return status.startsWith('SENT');
  } catch (error) {
    console.error('Error logging email notification:', error);
    return false;
  }
}

export async function sendWhatsAppNotification(
  orderId: string,
  phone: string,
  message: string
): Promise<boolean> {
  console.log(`[Notification Engine] [WHATSAPP] Sending to ${phone} (Order ID: ${orderId})...`);
  console.log(`[Message] ${message}`);

  try {
    // If Meta WhatsApp Business API parameters are configured, we would send it
    const whatsappToken = process.env.WHATSAPP_API_TOKEN;
    const whatsappPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    let status = 'SENT_MOCK';

    if (whatsappToken && whatsappPhoneId) {
      try {
        const response = await fetch(
          `https://graph.facebook.com/v18.0/${whatsappPhoneId}/messages`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${whatsappToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              to: phone,
              type: 'text',
              text: { body: message },
            }),
          }
        );
        if (response.ok) {
          status = 'SENT';
          console.log(`[Notification Engine] [WHATSAPP] Sent via Meta API successfully.`);
        } else {
          status = 'FAILED';
          console.error(`[Notification Engine] [WHATSAPP] Meta API returned status ${response.status}.`);
        }
      } catch (err) {
        status = 'FAILED';
        console.error(`[Notification Engine] [WHATSAPP] Failed to send via Meta API:`, err);
      }
    }

    // Always log to database
    await prisma.notificationLog.create({
      data: {
        orderId,
        type: 'WHATSAPP',
        recipient: phone,
        status,
        content: message,
      },
    });

    return status.startsWith('SENT');
  } catch (error) {
    console.error('Error logging WhatsApp notification:', error);
    return false;
  }
}
