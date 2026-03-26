import { NextRequest, NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";
import { buildConfirmationEmail } from "@/lib/emailTemplate";

export async function POST(req: NextRequest) {
  try {
    const { data, budget, referenceId } = await req.json();

    if (!data?.email || !referenceId) {
      return NextResponse.json(
        { error: "Missing required fields (email, referenceId)" },
        { status: 400 }
      );
    }

    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      console.error("SENDGRID_API_KEY not configured");
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    sgMail.setApiKey(apiKey);

    const htmlContent = buildConfirmationEmail(data, budget, referenceId);

    const msg = {
      to: data.email,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || "asher@developthesouth.com",
        name: "Southern Cities Enterprises",
      },
      subject: `Application Received — Reference ${referenceId}`,
      html: htmlContent,
    };

    await sgMail.send(msg);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Email send error:", error?.response?.body || error?.message || error);
    return NextResponse.json(
      { error: "Failed to send confirmation email" },
      { status: 500 }
    );
  }
}
