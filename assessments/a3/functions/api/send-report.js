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

    const description = validatePlainText(
      report.description,
      "Description",
      20,
      500,
    );

    const email = validateEmail(report.email);

    if (!ISSUE_LABELS[report.issueType]) {
      throw new Error("Please select a valid issue type.");
    }

    const attachment = validateAttachment(
      report.attachment,
    );

    const emailRequest = {
      from: "Circular Melbourne <onboarding@resend.dev>",
      to: [env.REPORT_RECIPIENT],
      subject: `Service report: ${serviceName}`,
      text: [
        "New Circular Melbourne service report",
        "",
        `Service: ${serviceName}`,
        `Issue: ${ISSUE_LABELS[report.issueType]}`,
        `Reporter email: ${email}`,
        `Authenticated account: ${firebaseUser.email || "Unknown"}`,
        "",
        "Description:",
        description,
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