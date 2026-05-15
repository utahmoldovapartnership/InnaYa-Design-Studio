import { Resend } from "resend";
import * as z from "zod";

const bodySchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  phone: z.string().trim().min(5),
  projectType: z.string().optional(),
  message: z.string().optional(),
});

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json(
      { ok: false, error: "Please check the form fields." },
      { status: 400 },
    );
  }

  const { name, email, phone, projectType, message } = parsed.data;
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const to = process.env.CONTACT_TO ?? "innaya.d.studio@gmail.com";

  if (!apiKey || !from) {
    return Response.json(
      {
        ok: false,
        error:
          "Email delivery is not configured. Set RESEND_API_KEY and RESEND_FROM.",
      },
      { status: 503 },
    );
  }

  const resend = new Resend(apiKey);
  const html = `
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
    <p><strong>Project type:</strong> ${escapeHtml(projectType ?? "—")}</p>
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(message ?? "—").replace(/\n/g, "<br/>")}</p>
  `;

  const { error } = await resend.emails.send({
    from,
    to,
    subject: `InnaYa inquiry — ${name}`,
    replyTo: email,
    html,
  });

  if (error) {
    return Response.json(
      { ok: false, error: "Could not send email. Please try again later." },
      { status: 502 },
    );
  }

  return Response.json({ ok: true });
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
