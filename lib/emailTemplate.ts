import { BudgetBreakdown } from "./budgetEngine";

interface EmailData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  propertyAddress: string;
  squareFootage: string;
  projectType: string;
  occupancyType: string;
  scopeOfWork: string;
  estimatedCost?: string;
  startDate?: string;
  completionDate?: string;
  usingOwnContractor: boolean;
  contractorName?: string;
  permitElectrical: boolean;
  permitMechanical: boolean;
  permitHVAC: boolean;
  financingType: string;
  lenderName?: string;
}

export function buildConfirmationEmail(
  data: EmailData,
  budget: BudgetBreakdown | null,
  referenceId: string
): string {
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);

  const permits: string[] = [];
  if (data.permitElectrical) permits.push("Electrical");
  if (data.permitMechanical) permits.push("Mechanical");
  if (data.permitHVAC) permits.push("HVAC");

  const budgetRows = budget
    ? budget.lineItems
        .map(
          (item) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #E5E7EB;color:#374151;font-size:14px;">${item.label}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #E5E7EB;color:#374151;font-size:14px;text-align:right;">${fmt(item.amount)}</td>
        </tr>`
        )
        .join("")
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Submission Confirmation - Southern Cities Enterprises</title>
</head>
<body style="margin:0;padding:0;background-color:#F3F4F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F3F4F6;">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#1B2A4A;border-radius:16px 16px 0 0;padding:32px 24px;text-align:center;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="background:#1B2A4A;border:2px solid #C8A951;border-radius:12px;width:48px;height:48px;text-align:center;vertical-align:middle;">
                    <span style="color:#C8A951;font-size:20px;font-weight:bold;">SC</span>
                  </td>
                  <td style="padding-left:14px;">
                    <span style="color:#FFFFFF;font-size:22px;font-weight:700;display:block;">Southern Cities Enterprises</span>
                    <span style="color:#C8A951;font-size:13px;">Permit &amp; Project Intake Portal</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#FFFFFF;padding:32px 28px;">

              <!-- Confirmation Badge -->
              <div style="text-align:center;margin-bottom:24px;">
                <div style="display:inline-block;background:#ECFDF5;border-radius:50%;width:64px;height:64px;line-height:64px;text-align:center;font-size:28px;">✓</div>
                <h1 style="margin:16px 0 4px;color:#1B2A4A;font-size:24px;">Application Received!</h1>
                <p style="margin:0;color:#6B7280;font-size:15px;">Thank you, ${data.firstName}. We've received your project intake form.</p>
              </div>

              <!-- Reference ID -->
              <div style="background:#FEF9E7;border:1px solid #C8A951;border-radius:10px;padding:16px;text-align:center;margin-bottom:28px;">
                <span style="color:#92700C;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Reference ID</span>
                <div style="color:#1B2A4A;font-size:22px;font-weight:700;margin-top:4px;">${referenceId}</div>
                <p style="margin:8px 0 0;color:#92700C;font-size:12px;">Save this ID for your records</p>
              </div>

              <!-- Submitted Information -->
              <h2 style="color:#1B2A4A;font-size:17px;margin:0 0 12px;border-bottom:2px solid #C8A951;padding-bottom:8px;">Submitted Information</h2>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="padding:6px 0;color:#6B7280;font-size:14px;width:40%;">Name</td>
                  <td style="padding:6px 0;color:#1B2A4A;font-size:14px;font-weight:600;">${data.firstName} ${data.lastName}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#6B7280;font-size:14px;">Email</td>
                  <td style="padding:6px 0;color:#1B2A4A;font-size:14px;">${data.email}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#6B7280;font-size:14px;">Phone</td>
                  <td style="padding:6px 0;color:#1B2A4A;font-size:14px;">${data.phone}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#6B7280;font-size:14px;">Property Address</td>
                  <td style="padding:6px 0;color:#1B2A4A;font-size:14px;font-weight:600;">${data.propertyAddress}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#6B7280;font-size:14px;">Project Type</td>
                  <td style="padding:6px 0;color:#1B2A4A;font-size:14px;">${data.projectType}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#6B7280;font-size:14px;">Occupancy</td>
                  <td style="padding:6px 0;color:#1B2A4A;font-size:14px;">${data.occupancyType}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#6B7280;font-size:14px;">Square Footage</td>
                  <td style="padding:6px 0;color:#1B2A4A;font-size:14px;">${parseInt(data.squareFootage).toLocaleString()} SF</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#6B7280;font-size:14px;">Permits Requested</td>
                  <td style="padding:6px 0;color:#1B2A4A;font-size:14px;font-weight:600;">${permits.length > 0 ? permits.join(", ") : "None"}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#6B7280;font-size:14px;">Financing</td>
                  <td style="padding:6px 0;color:#1B2A4A;font-size:14px;">${data.financingType}${data.lenderName ? ` (${data.lenderName})` : ""}</td>
                </tr>
                ${data.usingOwnContractor ? `
                <tr>
                  <td style="padding:6px 0;color:#6B7280;font-size:14px;">Contractor</td>
                  <td style="padding:6px 0;color:#1B2A4A;font-size:14px;">${data.contractorName || "—"}</td>
                </tr>` : ""}
                ${data.startDate ? `
                <tr>
                  <td style="padding:6px 0;color:#6B7280;font-size:14px;">Start Date</td>
                  <td style="padding:6px 0;color:#1B2A4A;font-size:14px;">${data.startDate}</td>
                </tr>` : ""}
                ${data.completionDate ? `
                <tr>
                  <td style="padding:6px 0;color:#6B7280;font-size:14px;">Target Completion</td>
                  <td style="padding:6px 0;color:#1B2A4A;font-size:14px;">${data.completionDate}</td>
                </tr>` : ""}
              </table>

              <!-- Scope of Work -->
              <h2 style="color:#1B2A4A;font-size:17px;margin:0 0 12px;border-bottom:2px solid #C8A951;padding-bottom:8px;">Scope of Work</h2>
              <div style="background:#F9FAFB;border-radius:8px;padding:14px;margin-bottom:24px;color:#374151;font-size:14px;line-height:1.6;">
                ${data.scopeOfWork}
              </div>

              ${budget ? `
              <!-- Budget Breakdown -->
              <h2 style="color:#1B2A4A;font-size:17px;margin:0 0 12px;border-bottom:2px solid #C8A951;padding-bottom:8px;">Budget Estimate</h2>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;border:1px solid #E5E7EB;border-radius:8px;overflow:hidden;">
                <tr style="background:#F9FAFB;">
                  <td style="padding:10px 12px;font-weight:600;color:#1B2A4A;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Item</td>
                  <td style="padding:10px 12px;font-weight:600;color:#1B2A4A;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;text-align:right;">Amount</td>
                </tr>
                ${budgetRows}
                <tr style="background:#1B2A4A;">
                  <td style="padding:12px;color:#FFFFFF;font-weight:700;font-size:15px;">Total Estimate</td>
                  <td style="padding:12px;color:#C8A951;font-weight:700;font-size:18px;text-align:right;">${fmt(budget.total)}</td>
                </tr>
              </table>
              ${budget.notes.length > 0 ? `
              <div style="margin-bottom:24px;">
                ${budget.notes.map((n) => `<p style="margin:4px 0;color:#6B7280;font-size:13px;font-style:italic;">📌 ${n}</p>`).join("")}
              </div>` : ""}
              ` : ""}

              <!-- Next Steps -->
              <h2 style="color:#1B2A4A;font-size:17px;margin:0 0 12px;border-bottom:2px solid #C8A951;padding-bottom:8px;">What Happens Next</h2>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="padding:8px 0;vertical-align:top;width:32px;">
                    <div style="background:#C8A951;color:#1B2A4A;width:24px;height:24px;border-radius:50%;text-align:center;line-height:24px;font-size:13px;font-weight:700;">1</div>
                  </td>
                  <td style="padding:8px 0 8px 10px;color:#374151;font-size:14px;">
                    <strong>Review</strong> — Our team will review your submission within <strong>2-3 business days</strong>.
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;vertical-align:top;">
                    <div style="background:#C8A951;color:#1B2A4A;width:24px;height:24px;border-radius:50%;text-align:center;line-height:24px;font-size:13px;font-weight:700;">2</div>
                  </td>
                  <td style="padding:8px 0 8px 10px;color:#374151;font-size:14px;">
                    <strong>Contact</strong> — We'll reach out via phone or email to discuss your project and confirm details.
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;vertical-align:top;">
                    <div style="background:#C8A951;color:#1B2A4A;width:24px;height:24px;border-radius:50%;text-align:center;line-height:24px;font-size:13px;font-weight:700;">3</div>
                  </td>
                  <td style="padding:8px 0 8px 10px;color:#374151;font-size:14px;">
                    <strong>Permit Filing</strong> — Once approved, we'll begin the permit application process on your behalf.
                  </td>
                </tr>
              </table>

              <!-- Contact Info -->
              <div style="background:#F0F4FF;border-radius:10px;padding:20px;text-align:center;margin-bottom:8px;">
                <p style="margin:0 0 8px;color:#1B2A4A;font-weight:600;font-size:15px;">Questions? We're here to help.</p>
                <p style="margin:0;color:#374151;font-size:14px;">
                  📧 <a href="mailto:asher@developthesouth.com" style="color:#1B2A4A;font-weight:600;">asher@developthesouth.com</a>
                </p>
                <p style="margin:4px 0 0;color:#374151;font-size:14px;">
                  📞 <a href="tel:+17042992742" style="color:#1B2A4A;font-weight:600;">(704) 299-2742</a>
                </p>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#1B2A4A;border-radius:0 0 16px 16px;padding:24px;text-align:center;">
              <p style="margin:0 0 8px;color:#C8A951;font-size:14px;font-weight:600;">Southern Cities Enterprises</p>
              <p style="margin:0 0 12px;color:#9CA3AF;font-size:12px;">Charlotte, NC | developthesouth.com</p>
              <p style="margin:0;color:#6B7280;font-size:11px;line-height:1.5;">
                This email confirms receipt of your permit intake form submission. The budget estimate provided is preliminary
                and subject to change upon detailed review. This is not a binding contract or guarantee of services.
                Southern Cities Enterprises reserves the right to adjust estimates based on site conditions and market factors.
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
