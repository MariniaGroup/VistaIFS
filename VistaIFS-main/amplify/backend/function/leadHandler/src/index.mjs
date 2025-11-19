
// amplify/backend/function/leadHandler/src/index.mjs
// VistaIFS Lead Capture Lambda (API Gateway → Lambda → DynamoDB + SES email)
// Env vars required: LEADS_TABLE, TO_EMAIL, FROM_EMAIL, AWS_REGION (from Lambda runtime)

import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const ddb = new DynamoDBClient({});
const ses = new SESClient({});

const TABLE = process.env.LEADS_TABLE;
const TO = process.env.TO_EMAIL;
const FROM = process.env.FROM_EMAIL;

export const handler = async (event) => {
  try {
    const body = typeof event.body === "string" ? JSON.parse(event.body) : (event.body || {});
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    // Basic validation
    const name = (body.name || "").toString().trim();
    const email = (body.email || "").toString().trim();
    const company = (body.company || "").toString().trim();
    const page = (body.page || "").toString().trim();
    const ts = body.ts || now;

    if (!email) {
      return { statusCode: 400, headers: cors(), body: JSON.stringify({ error: "EMAIL_REQUIRED" }) };
    }

    // Save to DynamoDB
    const item = {
      id:         { S: id },
      createdAt:  { S: now },
      name:       { S: name },
      email:      { S: email },
      company:    { S: company },
      page:       { S: page },
      ts:         { S: ts }
    };
    await ddb.send(new PutItemCommand({ TableName: TABLE, Item: item }));

    // Email notification (SES sandbox requires verified TO/FROM)
    if (TO && FROM) {
      const subject = `New VistaIFS Lead: ${name || email}`;
      const html = `
        <h3>New website lead</h3>
        <p><strong>Name:</strong> ${escapeHtml(name) || "(none)"}<br/>
        <strong>Email:</strong> ${escapeHtml(email)}<br/>
        <strong>Company:</strong> ${escapeHtml(company) || "(none)"}<br/>
        <strong>Page:</strong> ${escapeHtml(page) || "(unknown)"}<br/>
        <strong>When:</strong> ${now}</p>
      `;
      await ses.send(new SendEmailCommand({
        Destination: { ToAddresses: [TO] },
        Message: {
          Body: { Html: { Data: html } },
          Subject: { Data: subject }
        },
        Source: FROM
      }));
    }

    return { statusCode: 200, headers: cors(), body: JSON.stringify({ id }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers: cors(), body: JSON.stringify({ error: "LEAD_SAVE_FAILED" }) };
  }
};

function cors(){
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "OPTIONS,POST"
  };
}

function escapeHtml(str=""){
  return str.replace(/[&<>"']/g, s => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[s]));
}
