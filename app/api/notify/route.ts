import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      waybillNumber,
      courierEmail,
      courierCompanyName,
      status,
      locationName,
      latitude,
      longitude,
      photoUrl,
      timestamp,
    } = body;

    console.log(`[SMTP Notify Request] Waybill: ${waybillNumber}, Status: ${status}, Email: ${courierEmail}`);

    const isLoaded = status === 'LOADED';
    const actionText = isLoaded ? 'LOADED INTO HOLD' : 'UNLOADED (DELIVERED)';
    const subject = `[${status}] Waybill ${waybillNumber} - Parcel ${isLoaded ? 'Loaded' : 'Unloaded'} at ${locationName}`;

    // Create HTML email body
    const mapsLink = (latitude && longitude)
      ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
      : null;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #78350f, #0f172a); padding: 20px; border-radius: 8px 8px 0 0; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 800;">CargoFlow Transit Update</h1>
          <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8; font-family: monospace;">MSRTC SMART CARGO NETWORK</p>
        </div>
        
        <div style="padding: 20px; color: #334155;">
          <p style="font-size: 16px; line-height: 1.5; margin-top: 0;">
            Dear <strong>${courierCompanyName}</strong> Dispatch Team,
          </p>
          <p style="font-size: 14px; line-height: 1.5;">
            We are writing to notify you that your cargo shipment has been processed at a transit waypoint. Please review the scanning logs below.
          </p>
          
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: bold; width: 120px;">WAYBILL NUMBER:</td>
                <td style="padding: 6px 0; font-family: monospace; font-weight: bold; color: #0f172a;">${waybillNumber}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: bold;">STATUS UPDATE:</td>
                <td style="padding: 6px 0;">
                  <span style="background-color: ${isLoaded ? '#eff6ff' : '#f1f5f9'}; color: ${isLoaded ? '#1d4ed8' : '#334155'}; border: 1px solid ${isLoaded ? '#bfdbfe' : '#cbd5e1'}; border-radius: 4px; padding: 2px 8px; font-size: 11px; font-weight: bold;">
                    ${actionText}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: bold;">LOCATION:</td>
                <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${locationName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: bold;">TIMESTAMP:</td>
                <td style="padding: 6px 0; color: #0f172a;">${new Date(timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} (IST)</td>
              </tr>
              ${latitude && longitude ? `
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: bold;">GPS COORDINATES:</td>
                <td style="padding: 6px 0; color: #0f172a;">
                  ${latitude.toFixed(6)}, ${longitude.toFixed(6)}
                  <br/>
                  <a href="${mapsLink}" target="_blank" style="color: #2563eb; text-decoration: none; font-weight: bold; font-size: 11px;">View Pin on Google Maps &rarr;</a>
                </td>
              </tr>
              ` : ''}
            </table>
          </div>

          ${photoUrl ? `
          <div style="margin: 20px 0; text-align: center;">
            <p style="font-size: 12px; color: #64748b; font-weight: bold; margin-bottom: 8px; text-align: left;">VERIFICATION SCAN PHOTO:</p>
            <img src="${photoUrl.startsWith('data:') ? 'cid:verification_img' : photoUrl}" alt="Verification Capture" style="max-width: 100%; height: auto; max-height: 250px; border-radius: 8px; border: 1px solid #cbd5e1; box-shadow: 0 1px 3px rgba(0,0,0,0.1);" />
          </div>
          ` : ''}
        </div>
        
        <div style="background-color: #f1f5f9; padding: 15px; border-radius: 0 0 8px 8px; font-size: 11px; text-align: center; color: #64748b; border-top: 1px solid #e2e8f0;">
          This is an automated dispatch update from CargoFlow on behalf of MSRTC.
          <br/>
          Do not reply directly to this email. For capacity bookings, visit the CargoFlow Partner Console.
        </div>
      </div>
    `;

    // Check if SMTP is configured
    const hasSmtpConfig = Boolean(
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
    );

    if (hasSmtpConfig) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const attachments: any[] = [];
      if (photoUrl && photoUrl.startsWith('data:image/')) {
        const matches = photoUrl.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          attachments.push({
            filename: `verification_${waybillNumber}.jpg`,
            content: Buffer.from(matches[2], 'base64'),
            cid: 'verification_img',
          });
        }
      }

      const mailOptions: any = {
        from: process.env.SMTP_FROM || 'notifications@cargoflow.msrtc.gov.in',
        to: courierEmail,
        subject,
        html: htmlContent,
        attachments,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`[SMTP SUCCESS] Mail sent: ${info.messageId}`);
      return NextResponse.json({ success: true, messageId: info.messageId });
    } else {
      // Log payload to server console for simulation
      console.log('\n============================================================');
      console.log('SIMULATED OUTGOING EMAIL (SMTP Not Configured in .env)');
      console.log(`Subject: ${subject}`);
      console.log(`To: ${courierEmail}`);
      console.log(`Present Location: ${locationName} (${latitude || 'N/A'}, ${longitude || 'N/A'})`);
      if (photoUrl) {
        console.log(`Photo: [Embedded base64 string, length ${photoUrl.length} characters]`);
      } else {
        console.log('Photo: [None]');
      }
      console.log('============================================================\n');

      return NextResponse.json({
        success: true,
        simulated: true,
        message: 'Email output simulated in server console (SMTP not configured).',
      });
    }
  } catch (err: any) {
    console.error('Failed to process email notification:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
