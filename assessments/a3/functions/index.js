const {setGlobalOptions} = require("firebase-functions");
const {
  onCall,
  HttpsError,
} = require("firebase-functions/v2/https");
const {defineSecret} = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const {Resend} = require("resend");

setGlobalOptions({
  region: "australia-southeast2",
  maxInstances: 10,
});

const resendApiKey = defineSecret("RESEND_API_KEY");
const reportRecipient = defineSecret("REPORT_RECIPIENT");

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

/**
 * Validates and cleans a plain-text form value.
 *
 * @param {*} value Value supplied by the client.
 * @param {string} fieldName Field name used in validation messages.
 * @param {number} minLength Minimum allowed text length.
 * @param {number} maxLength Maximum allowed text length.
 * @return {string} The validated and trimmed text value.
 */
function validatePlainText(
    value,
    fieldName,
    minLength,
    maxLength,
) {
  if (typeof value !== "string") {
    throw new HttpsError(
        "invalid-argument",
        `${fieldName} is required.`,
    );
  }

  const cleanValue = value.trim();

  if (
    cleanValue.length < minLength ||
    cleanValue.length > maxLength
  ) {
    throw new HttpsError(
        "invalid-argument",
        `${fieldName} has an invalid length.`,
    );
  }

  if (/[<>]/.test(cleanValue)) {
    throw new HttpsError(
        "invalid-argument",
        `${fieldName} cannot contain HTML markup.`,
    );
  }

  return cleanValue;
}

/**
 * Validates and normalises an email address.
 *
 * @param {*} value Email address supplied by the client.
 * @return {string} The validated lowercase email address.
 */
function validateEmail(value) {
  const email = validatePlainText(
      value,
      "Email",
      3,
      120,
  ).toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpsError(
        "invalid-argument",
        "Please enter a valid email address.",
    );
  }

  return email;
}

/**
 * Validates an optional report attachment.
 *
 * @param {*} attachment Attachment supplied by the client.
 * @return {?Object} A validated Resend attachment or null.
 */
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
    throw new HttpsError(
        "invalid-argument",
        "The attachment is invalid.",
    );
  }

  if (!ALLOWED_ATTACHMENT_TYPES.has(attachment.type)) {
    throw new HttpsError(
        "invalid-argument",
        "Only PDF, JPG and PNG attachments are allowed.",
    );
  }

  const maxBase64Length =
    Math.ceil(MAX_ATTACHMENT_BYTES * 4 / 3) + 4;

  if (
    !attachment.content ||
    attachment.content.length > maxBase64Length
  ) {
    throw new HttpsError(
        "invalid-argument",
        "The attachment must be 5 MB or smaller.",
    );
  }

  const fileBuffer = Buffer.from(
      attachment.content,
      "base64",
  );

  if (
    !fileBuffer.length ||
    fileBuffer.length > MAX_ATTACHMENT_BYTES
  ) {
    throw new HttpsError(
        "invalid-argument",
        "The attachment must be 5 MB or smaller.",
    );
  }

  const safeFilename = attachment.name.replace(
      /[^a-zA-Z0-9._-]/g,
      "_",
  );

  return {
    filename: safeFilename || "attachment",
    content: fileBuffer.toString("base64"),
  };
}

exports.sendReportEmail = onCall(
    {
      secrets: [
        resendApiKey,
        reportRecipient,
      ],
    },
    async (request) => {
      if (!request.auth) {
        throw new HttpsError(
            "unauthenticated",
            "You must be signed in to submit a report.",
        );
      }

      const report = request.data || {};

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
        throw new HttpsError(
            "invalid-argument",
            "Please select a valid issue type.",
        );
      }

      const attachment =
        validateAttachment(report.attachment);

      const resend = new Resend(resendApiKey.value());

      const emailRequest = {
        from: "Circular Melbourne <onboarding@resend.dev>",
        to: [reportRecipient.value()],
        subject: `Service report: ${serviceName}`,
        text: [
          "New Circular Melbourne service report",
          "",
          `Service: ${serviceName}`,
          `Issue: ${ISSUE_LABELS[report.issueType]}`,
          `Reporter email: ${email}`,
          "",
          "Description:",
          description,
        ].join("\n"),
      };

      if (attachment) {
        emailRequest.attachments = [attachment];
      }

      const {
        data,
        error,
      } = await resend.emails.send(emailRequest);

      if (error) {
        logger.error(
            "Resend could not send the report email.",
            {
              error,
              uid: request.auth.uid,
            },
        );

        throw new HttpsError(
            "internal",
            "The report email could not be sent.",
        );
      }

      logger.info(
          "Report email sent successfully.",
          {
            emailId: data?.id,
            uid: request.auth.uid,
          },
      );

      return {
        success: true,
        emailId: data?.id || null,
      };
    },
);
