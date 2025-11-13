const nodemailer = require("nodemailer");

async function main() {
  const {
    SMTP_SERVER,
    SMTP_PORT,
    SMTP_USERNAME,
    SMTP_PASSWORD,
    ALERT_TO_EMAIL,
    GITHUB_REPOSITORY,
    GITHUB_EVENT_PATH
  } = process.env;

  const event = require(GITHUB_EVENT_PATH);
  const issue = event.issue;

  const transporter = nodemailer.createTransport({
    host: SMTP_SERVER,
    port: Number(SMTP_PORT),
    secure: false, // 587 with STARTTLS for AuthSMTP
    auth: {
      user: SMTP_USERNAME, // e.g. mail123456
      pass: SMTP_PASSWORD,
    },
  });

  const subject = `[Triage] New issue #${issue.number}: ${issue.title}`;

  const html = `
    <h2>New triage issue in <code>${GITHUB_REPOSITORY}</code></h2>
    <p><strong>Title:</strong> ${issue.title}</p>
    <p><strong>Number:</strong> #${issue.number}</p>
    <p><strong>Labels:</strong> ${(issue.labels || []).map(l => l.name).join(", ")}</p>
    <p><strong>Link:</strong> <a href="${issue.html_url}">View on GitHub</a></p>
    <hr />
    <p><strong>Description:</strong></p>
    <pre style="white-space:pre-wrap;font-family:monospace;">${issue.body || ""}</pre>
  `;

  await transporter.sendMail({
    from: "innovate@dnaz.org", // must be registered/assigned in AuthSMTP
    to: ALERT_TO_EMAIL,
    subject,
    html,
  });

  console.log("Triage email sent.");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
