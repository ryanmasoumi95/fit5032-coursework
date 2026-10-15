
import sanitizeHtml from "sanitize-html";

const ISSUE_LABELS = {
  address: "Incorrect address",
  hours: "Incorrect opening hours",
  service: "Service information",
};

const ALLOWED_ATTACHMENT_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
]);

const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
const MAX_DESCRIPTION_HTML_LENGTH = 15000;

const ALLOWED_DESCRIPTION_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "ul",
  "ol",
  "li",
  "h2",
  "h3",
  "blockquote",
];

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function validatePlainText(value, fieldName, minLength, maxLength) {
  if (typeof value !== "string") {
    throw new Error(`${fieldName} is required.`);
  }

  const cleanValue = value.trim();

  if (
    cleanValue.length < minLength ||
    cleanValue.length > maxLength
  ) {
    throw new Error(`${fieldName} has an invalid length.`);
  }

  if (/[<>]/.test(cleanValue)) {
    throw new Error(`${fieldName} cannot contain HTML markup.`);
  }

  return cleanValue;
}

function validateEmail(value) {
  const email = validatePlainText(
    value,
    "Email",
    3,
    120,
  ).toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Please enter a valid email address.");
  }

  return email;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function decodeBasicHtmlEntities(value) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&quot;/gi, '"')
    .replace(/&#(?:39|x27);/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&");
}

function richTextToPlainText(html) {
  const textWithLineBreaks = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<li>/gi, "\n- ")
    .replace(
      /<\/(?:p|h2|h3|li|blockquote)>/gi,
      "\n",
    )
    .replace(/<[^>]*>/g, "");

  return decodeBasicHtmlEntities(textWithLineBreaks)
    .replace(/[ \t]+/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function validateRichTextDescription(value) {
  if (typeof value !== "string") {
    throw new Error("Description is required.");
  }

  const originalHtml = value.trim();

  if (originalHtml.length > MAX_DESCRIPTION_HTML_LENGTH) {
    throw new Error(
      "Description contains too much formatting.",
    );
  }

  // Keep only the formatting supported by our report editor.
  // All HTML attributes are removed, including event handlers.
  const safeHtml = sanitizeHtml(originalHtml, {
    allowedTags: ALLOWED_DESCRIPTION_TAGS,
    allowedAttributes: {},
  });

  const plainText = richTextToPlainText(safeHtml);

  // Validate the actual visible text, not the HTML tag length.
  if (
    plainText.length < 20 ||
    plainText.length > 500
  ) {
    throw new Error(
      "Description must contain between 20 and 500 characters.",
    );
  }

  return {
    html: safeHtml,
    text: plainText,
  };
}

function validateAttachment(attachment) {
  if (!attachment) {
    return null;
  }

  if (
    typeof attachment !== "object" ||
    typeof attachment.name !== "string" ||
    typeof attachment.type !== "string" ||
    typeof attachment.content !== "string"
  ) {
    throw new Error("The attachment is invalid.");
  }

  if (!ALLOWED_ATTACHMENT_TYPES.has(attachment.type)) {
    throw new Error(
      "Only PDF, JPG and PNG attachments are allowed.",
    );
  }

  const estimatedBytes =
    Math.floor(attachment.content.length * 3 / 4);

  if (
    estimatedBytes <= 0 ||
    estimatedBytes > MAX_ATTACHMENT_BYTES
  ) {
    throw new Error(
      "The attachment must be 5 MB or smaller.",
    );
  }

  const safeFilename = attachment.name.replace(
    /[^a-zA-Z0-9._-]/g,
    "_",
  );

  return {
    filename: safeFilename || "attachment",
    content: attachment.content,
    content_type: attachment.type,
  };
}

async function verifyFirebaseUser(idToken, firebaseApiKey) {
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(firebaseApiKey)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idToken,
      }),
    },
  );

  if (!response.ok) {
    return null;
  }

  const data = await response.json();

  return data.users?.[0] || null;
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (
    !env.RESEND_API_KEY ||
    !env.REPORT_RECIPIENT ||
    !env.FIREBASE_API_KEY
  ) {
    return jsonResponse(
      {
        error: "Email service is not configured.",
      },
      500,
    );
  }

  const authorization =
    request.headers.get("Authorization") || "";

  if (!authorization.startsWith("Bearer ")) {
    return jsonResponse(
      {
        error: "You must be signed in to submit a report.",
      },
      401,
    );
  }

  const idToken = authorization.slice(7).trim();

  const firebaseUser = await verifyFirebaseUser(
    idToken,
    env.FIREBASE_API_KEY,
  );

  if (!firebaseUser) {
    return jsonResponse(
      {
        error: "Your login session is invalid or expired.",
      },
      401,
    );
  }

  let report;

  try {
    report = await request.json();
  } catch {
    return jsonResponse(
      {
        error: "Invalid request body.",
      },
      400,
    );
  }

  try {
    const serviceName = validatePlainText(
      report.serviceName,
      "Service name",
      1,
      80,
    );

    const description = validateRichTextDescription(
      report.description,
    );

    const email = validateEmail(report.email);

    if (!ISSUE_LABELS[report.issueType]) {
      throw new Error("Please select a valid issue type.");
    }

    const attachment = validateAttachment(
      report.attachment,
    );

    const issueLabel = ISSUE_LABELS[report.issueType];
    const accountEmail = firebaseUser.email || "Unknown";

    const emailRequest = {
      from: "Circular Melbourne <onboarding@resend.dev>",
      to: [env.REPORT_RECIPIENT],
      subject: `Service report: ${serviceName}`,

      // Plain-text alternative for email clients that do not
      // support formatted HTML messages.
      text: [
        "New Circular Melbourne service report",
        "",
        `Service: ${serviceName}`,
        `Issue: ${issueLabel}`,
        `Reporter email: ${email}`,
        `Authenticated account: ${accountEmail}`,
        "",
        "Description:",
        description.text,
      ].join("\n"),

      // Only sanitised report HTML is inserted here.
      // All other user-provided values are HTML-escaped.
      html: [
        "<h2>New Circular Melbourne service report</h2>",
        `<p><strong>Service:</strong> ${escapeHtml(serviceName)}</p>`,
        `<p><strong>Issue:</strong> ${escapeHtml(issueLabel)}</p>`,
        `<p><strong>Reporter email:</strong> ${escapeHtml(email)}</p>`,
        `<p><strong>Authenticated account:</strong> ${escapeHtml(accountEmail)}</p>`,
        "<h3>Description:</h3>",
        `<div>${description.html}</div>`,
      ].join("\n"),
    };

    if (attachment) {
      emailRequest.attachments = [attachment];
    }

    const resendResponse = await fetch(
      "https://api.resend.com/emails",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailRequest),
      },
    );

    const resendResult = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error(
        "Resend could not send the report email.",
        resendResult,
      );

      return jsonResponse(
        {
          error: "The report email could not be sent.",
        },
        500,
      );
    }

    return jsonResponse({
      success: true,
      emailId: resendResult.id || null,
    });
  } catch (error) {
    return jsonResponse(
      {
        error:
          error instanceof Error
            ? error.message
            : "Invalid report.",
      },
      400,
    );
  }
}
