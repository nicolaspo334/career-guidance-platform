export async function sendLicenseApprovedEmail(resendApiKey, { to, centerName, licenseCode, password }) {
  const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#4f46e5,#0891b2);padding:40px 48px;">
            <div style="font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">MindPath</div>
            <div style="font-size:14px;color:rgba(255,255,255,0.7);margin-top:4px;">Orientación académica con IA</div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 48px;">
            <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a;">¡Licencia aprobada!</h1>
            <p style="margin:0 0 24px;color:#64748b;font-size:15px;line-height:1.6;">
              Hola <strong>${centerName}</strong>, tu solicitud de licencia para MindPath ha sido aprobada.
              A continuación encontrarás tus credenciales de acceso.
            </p>

            <!-- License code box -->
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px 24px;margin-bottom:16px;">
              <div style="font-size:12px;font-weight:600;color:#16a34a;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Código de licencia</div>
              <div style="font-family:monospace;font-size:22px;font-weight:800;color:#15803d;letter-spacing:2px;">${licenseCode}</div>
              <div style="font-size:12px;color:#4ade80;margin-top:4px;">Comparte este código con tus alumnos para que puedan registrarse</div>
            </div>

            <!-- Credentials box -->
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
              <div style="font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;">Tus credenciales de acceso al portal</div>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:6px 0;">
                    <span style="font-size:13px;color:#94a3b8;">Usuario (email)</span><br>
                    <span style="font-size:15px;font-weight:600;color:#0f172a;">${to}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:12px;border-top:1px solid #e2e8f0;">
                    <span style="font-size:13px;color:#94a3b8;">Contraseña temporal</span><br>
                    <span style="font-family:monospace;font-size:16px;font-weight:700;color:#0f172a;letter-spacing:1px;">${password}</span>
                  </td>
                </tr>
              </table>
            </div>

            <!-- Warning -->
            <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:14px 18px;margin-bottom:28px;">
              <span style="font-size:14px;color:#92400e;">
                ⚠️ <strong>Importante:</strong> Al iniciar sesión por primera vez se te pedirá que cambies la contraseña temporal.
              </span>
            </div>

            <!-- CTA -->
            <a href="https://career-guidance-platform.pages.dev/licencias"
              style="display:inline-block;background:#4f46e5;color:#ffffff;font-size:15px;font-weight:600;padding:14px 32px;border-radius:10px;text-decoration:none;">
              Acceder al portal del centro →
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:24px 48px;border-top:1px solid #f1f5f9;">
            <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">
              Si tienes alguna duda contacta con nosotros respondiendo a este email.<br>
              © 2025 MindPath. Todos los derechos reservados.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'MindPath <onboarding@resend.dev>',
      to: [to],
      subject: `✅ Tu licencia MindPath ha sido aprobada — ${licenseCode}`,
      html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error('Resend error:', body);
    // No lanzamos error para no bloquear la aprobación si el email falla
  }
}
