import nodemailer from 'nodemailer';
import { logError, logInfo, logWarn } from '../utils/logger';

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    logWarn('email', 'SMTP no configurado. Usando transporte de desarrollo (jsonTransport).');
    transporter = nodemailer.createTransport({ jsonTransport: true });
    return transporter;
  }

  try {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
    });

    transporter.verify().then(() => {
      logInfo('email', 'Conexión SMTP verificada.');
    }).catch((err) => {
      logWarn('email', `Error verificando SMTP: ${err.message}`);
    });

    return transporter;
  } catch (err: any) {
    logError('email', `Error creando transporter: ${err.message}`);
    return null;
  }
}

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const transport = getTransporter();
  if (!transport) {
    logWarn('email', `Correo no enviado: ${subject} → ${to}`);
    return false;
  }

  try {
    const fromName = process.env.SMTP_FROM_NAME || 'UIDE Escucha';
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'noreply@uide.edu.ec';

    const info = await transport.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      html,
    });

    if (info.messageId) {
      logInfo('email', `Correo enviado: ${subject} → ${to}`);
    } else {
      logInfo('email', `[DEV] Correo para ${to}: ${subject}`);
      // @ts-ignore - jsonTransport devuelve message en envelope
      if (info.message) logInfo('email', `[DEV] Contenido:\n${info.message}`);
    }

    return true;
  } catch (err: any) {
    logError('email', `Error enviando correo a ${to}: ${err.message}`);
    return false;
  }
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<boolean> {
  const baseUrl = process.env.APP_URL || process.env.CORS_ORIGIN || 'http://localhost:5173';
  const resetUrl = `${baseUrl}/reset-password/${token}`;

  const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style type="text/css">
  .ExternalClass, .ReadMsgBody { width:100%; }
  body { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
</style>
</head>
<body style="margin:0;padding:0;background-color:#f4f2f3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f2f3;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:520px;background-color:#ffffff;border-radius:8px;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="background-color:#680036;padding:28px 24px;text-align:center;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
              <tr>
                <td style="width:40px;height:40px;background-color:rgba(255,255,255,0.12);border-radius:10px;text-align:center;vertical-align:middle;font-size:20px;color:#fcc019;">🏛</td>
                <td style="padding-left:12px;text-align:left;">
                  <p style="margin:0;color:#ffffff;font-size:18px;font-weight:700;letter-spacing:-0.3px;">Hubi</p>
                  <p style="margin:2px 0 0;color:rgba(255,255,255,0.6);font-size:11px;letter-spacing:0.3px;text-transform:uppercase;">UIDE Escucha</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px 28px 28px;">
            <h2 style="margin:0 0 20px;color:#1c1c1c;font-size:22px;font-weight:700;letter-spacing:-0.3px;">Restablecimiento de contraseña</h2>
            <p style="margin:0 0 20px;color:#5c4a50;font-size:14px;line-height:1.7;">
              Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>UIDE Escucha</strong>. Haz clic en el botón para crear una nueva contraseña.
            </p>
            <p style="margin:0 0 28px;color:#8a7177;font-size:12px;line-height:1.5;">
              ⏱ Este enlace expira en <strong>1 hora</strong>. Si no solicitaste este cambio, ignora este correo.
            </p>

            <!-- Button (bulletproof) -->
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
              <tr>
                <td align="center" style="border-radius:8px;background-color:#8e0e4d;">
                  <!--[if mso]>
                  <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${resetUrl}" style="height:48px;v-text-anchor:middle;width:220px;" arcsize="16%" strokecolor="#8e0e4d" fillcolor="#8e0e4d">
                    <w:anchorlock/>
                    <center style="color:#ffffff;font-weight:700;font-size:14px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
                      Restablecer contraseña
                    </center>
                  </v:roundrect>
                  <![endif]-->
                  <a href="${resetUrl}" target="_blank" style="display:inline-block;padding:14px 36px;background-color:#8e0e4d;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;border-radius:8px;mso-hide:all;">Restablecer contraseña</a>
                </td>
              </tr>
            </table>

            <hr style="border:none;border-top:1px solid #e8dce0;margin:0 0 20px;">

            <p style="margin:0 0 8px;color:#a0989b;font-size:11px;line-height:1.6;">
              Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:
            </p>
            <p style="margin:0;font-size:11px;word-break:break-all;">
              <a href="${resetUrl}" style="color:#680036;font-weight:500;">${resetUrl}</a>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color:#faf8f9;padding:20px 28px;text-align:center;border-top:1px solid #e8dce0;">
            <p style="margin:0 0 4px;color:#8a7177;font-size:11px;line-height:1.5;">
              Universidad Internacional del Ecuador — UIDE
            </p>
            <p style="margin:0;color:#a0989b;font-size:10px;">
              Este es un mensaje automático, por favor no respondas a este correo.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return sendEmail(to, 'Restablecimiento de Contraseña - UIDE Escucha', html);
}

export async function sendReportUpdateEmail(to: string, reportLabel: string, updateType: string, reportId: number): Promise<boolean> {
  const baseUrl = process.env.APP_URL || process.env.CORS_ORIGIN || 'http://localhost:5173';
  const reportUrl = `${baseUrl}/reporte/${reportId}`;

  const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style type="text/css">
  .ExternalClass, .ReadMsgBody { width:100%; }
  body { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
</style>
</head>
<body style="margin:0;padding:0;background-color:#f4f2f3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f2f3;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:520px;background-color:#ffffff;border-radius:8px;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="background-color:#680036;padding:28px 24px;text-align:center;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
              <tr>
                <td style="width:40px;height:40px;background-color:rgba(255,255,255,0.12);border-radius:10px;text-align:center;vertical-align:middle;font-size:20px;color:#fcc019;">&#x1f3db;</td>
                <td style="padding-left:12px;text-align:left;">
                  <p style="margin:0;color:#ffffff;font-size:18px;font-weight:700;letter-spacing:-0.3px;">Hubi</p>
                  <p style="margin:2px 0 0;color:rgba(255,255,255,0.6);font-size:11px;letter-spacing:0.3px;text-transform:uppercase;">UIDE Escucha</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px 28px 28px;">
            <h2 style="margin:0 0 20px;color:#1c1c1c;font-size:22px;font-weight:700;letter-spacing:-0.3px;">Actualizacion de tu reporte</h2>
            <p style="margin:0 0 20px;color:#5c4a50;font-size:14px;line-height:1.7;">
              Tu reporte <strong>"${reportLabel}"</strong> tiene una actualizacion: <strong>${updateType}</strong>.
            </p>
            <p style="margin:0 0 28px;color:#8a7177;font-size:12px;line-height:1.5;">
              Ingresa a la plataforma para revisar los detalles de esta actualizacion.
            </p>

            <!-- Button -->
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
              <tr>
                <td align="center" style="border-radius:8px;background-color:#8e0e4d;">
                  <a href="${reportUrl}" target="_blank" style="display:inline-block;padding:14px 36px;background-color:#8e0e4d;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;border-radius:8px;">Ver reporte</a>
                </td>
              </tr>
            </table>

            <hr style="border:none;border-top:1px solid #e8dce0;margin:0 0 20px;">

            <p style="margin:0 0 8px;color:#a0989b;font-size:11px;line-height:1.6;">
              Si el boton no funciona, copia y pega el siguiente enlace en tu navegador:
            </p>
            <p style="margin:0;font-size:11px;word-break:break-all;">
              <a href="${reportUrl}" style="color:#680036;font-weight:500;">${reportUrl}</a>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color:#faf8f9;padding:20px 28px;text-align:center;border-top:1px solid #e8dce0;">
            <p style="margin:0 0 4px;color:#8a7177;font-size:11px;line-height:1.5;">
              Universidad Internacional del Ecuador — UIDE
            </p>
            <p style="margin:0;color:#a0989b;font-size:10px;">
              Este es un mensaje automatico, por favor no respondas a este correo.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return sendEmail(to, `Actualizacion de reporte - UIDE Escucha`, html);
}

export async function sendEmailVerificationEmail(to: string, cedula: string, token: string): Promise<boolean> {
  const baseUrl = process.env.APP_URL || process.env.CORS_ORIGIN || 'http://localhost:5173';
  const verifyUrl = `${baseUrl}/ingreso?vtoken=${encodeURIComponent(token)}&cedula=${encodeURIComponent(cedula)}`;

  const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style type="text/css">
  .ExternalClass, .ReadMsgBody { width:100%; }
  body { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
</style>
</head>
<body style="margin:0;padding:0;background-color:#f4f2f3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f2f3;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:520px;background-color:#ffffff;border-radius:8px;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="background-color:#680036;padding:28px 24px;text-align:center;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
              <tr>
                <td style="width:40px;height:40px;background-color:rgba(255,255,255,0.12);border-radius:10px;text-align:center;vertical-align:middle;font-size:20px;color:#fcc019;">&#x1f3db;</td>
                <td style="padding-left:12px;text-align:left;">
                  <p style="margin:0;color:#ffffff;font-size:18px;font-weight:700;letter-spacing:-0.3px;">Hubi</p>
                  <p style="margin:2px 0 0;color:rgba(255,255,255,0.6);font-size:11px;letter-spacing:0.3px;text-transform:uppercase;">UIDE Escucha</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px 28px 28px;">
            <h2 style="margin:0 0 20px;color:#1c1c1c;font-size:22px;font-weight:700;letter-spacing:-0.3px;">Verifica tu identidad</h2>
            <p style="margin:0 0 20px;color:#5c4a50;font-size:14px;line-height:1.7;">
              Estás creando una cuenta en <strong>UIDE Escucha</strong>. Haz clic en el botón para verificar que este correo te pertenece y continuar con tu registro.
            </p>
            <p style="margin:0 0 28px;color:#8a7177;font-size:12px;line-height:1.5;">
              Este enlace expira en <strong>1 hora</strong>. Si no intentaste crear una cuenta, ignora este correo.
            </p>

            <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
              <tr>
                <td align="center" style="border-radius:8px;background-color:#8e0e4d;">
                  <a href="${verifyUrl}" target="_blank" style="display:inline-block;padding:14px 36px;background-color:#8e0e4d;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;border-radius:8px;">Verificar correo</a>
                </td>
              </tr>
            </table>

            <hr style="border:none;border-top:1px solid #e8dce0;margin:0 0 20px;">

            <p style="margin:0 0 8px;color:#a0989b;font-size:11px;line-height:1.6;">
              Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:
            </p>
            <p style="margin:0;font-size:11px;word-break:break-all;">
              <a href="${verifyUrl}" style="color:#680036;font-weight:500;">${verifyUrl}</a>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color:#faf8f9;padding:20px 28px;text-align:center;border-top:1px solid #e8dce0;">
            <p style="margin:0 0 4px;color:#8a7177;font-size:11px;line-height:1.5;">
              Universidad Internacional del Ecuador — UIDE
            </p>
            <p style="margin:0;color:#a0989b;font-size:10px;">
              Este es un mensaje automático, por favor no respondas a este correo.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return sendEmail(to, 'Verifica tu identidad - UIDE Escucha', html);
}
