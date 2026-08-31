const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:3000";

/**
 * Shared branded wrapper for all AGS transactional emails — light blue/white
 * styling matching the frontend design system, inline CSS throughout since
 * most email clients strip <style> blocks.
 */
export function emailLayout({
  preheader,
  heading,
  bodyHtml,
  ctaLabel,
  ctaUrl,
}: {
  preheader: string;
  heading: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${heading}</title>
</head>
<body style="margin:0;padding:0;background-color:#eef4ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <span style="display:none;font-size:1px;color:#eef4ff;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#eef4ff;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #dce9ff;">
          <tr>
            <td style="padding:28px 32px;border-bottom:1px solid #eef4ff;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <div style="width:34px;height:34px;border-radius:50%;background-color:#0b1b33;text-align:center;line-height:34px;color:#ffffff;font-weight:700;font-size:14px;">AGS</div>
                  </td>
                  <td style="vertical-align:middle;padding-left:10px;">
                    <div style="font-weight:800;font-size:16px;color:#0b1b33;">AGS</div>
                    <div style="font-size:9px;letter-spacing:0.08em;text-transform:uppercase;color:#1a4fd1;font-weight:600;">Advanced Gas Solutions</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 16px;font-size:20px;color:#0b1b33;font-weight:800;">${heading}</h1>
              <div style="font-size:14px;line-height:1.6;color:#334155;">
                ${bodyHtml}
              </div>
              ${
                ctaLabel && ctaUrl
                  ? `<div style="margin-top:28px;">
                      <a href="${ctaUrl}" style="display:inline-block;background-color:#1a4fd1;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 24px;border-radius:8px;">${ctaLabel}</a>
                    </div>`
                  : ""
              }
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;background-color:#f8fafc;border-top:1px solid #eef4ff;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">
                AGS &ndash; Advanced Gas Solutions &middot; 13 Baker Street, London, W1U 3BW<br/>
                020 7946 0018 &middot; info@agsolutions.co.uk
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function detailRow(label: string, value: string) {
  return `<tr>
    <td style="padding:6px 0;color:#64748b;font-size:13px;">${label}</td>
    <td style="padding:6px 0;color:#0b1b33;font-size:13px;font-weight:600;text-align:right;">${value}</td>
  </tr>`;
}

export function detailTable(rows: string) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;border-top:1px solid #eef4ff;border-bottom:1px solid #eef4ff;">${rows}</table>`;
}

/**
 * Navy "amount" card with a gold accent bar — the hero element of billing
 * emails. `meta` is a short line under the figure (invoice no., date, etc.).
 */
export function amountHero({
  label,
  amount,
  meta,
}: {
  label: string;
  amount: string;
  meta?: string;
}) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
    <tr><td style="background-color:#0b1b33;border-radius:14px;padding:22px 24px;">
      <div style="height:3px;width:44px;background-color:#cf9f3d;border-radius:2px;margin-bottom:14px;"></div>
      <div style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#8ab5ff;font-weight:700;">${label}</div>
      <div style="font-size:32px;font-weight:800;color:#ffffff;margin-top:6px;line-height:1.1;">${amount}</div>
      ${
        meta
          ? `<div style="font-size:12px;color:#a8c4ff;margin-top:8px;">${meta}</div>`
          : ""
      }
    </td></tr>
  </table>`;
}

/** Soft sky-tinted callout box, e.g. "your invoice PDF is attached". */
export function noteBox(html: string) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0;">
    <tr><td style="background-color:#f4f8fd;border:1px solid #dce9ff;border-radius:10px;padding:14px 16px;font-size:13px;color:#334155;line-height:1.55;">${html}</td></tr>
  </table>`;
}

export { FRONTEND_URL };
