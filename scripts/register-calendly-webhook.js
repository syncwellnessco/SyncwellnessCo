const fs = require('fs');
const path = require('path');

// Load environment variables manually
const envPath = path.resolve(__dirname, '../.env');
let env = {};
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const firstEquals = trimmed.indexOf('=');
    if (firstEquals === -1) return;
    const key = trimmed.substring(0, firstEquals).trim();
    let val = trimmed.substring(firstEquals + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.substring(1, val.length - 1);
    }
    env[key] = val;
  });
}

const apiKey = env.CALENDLY_API_KEY || process.env.CALENDLY_API_KEY;
const siteUrl = env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

if (!apiKey) {
  console.error("Error: CALENDLY_API_KEY is not defined in your .env file.");
  console.log("Please add your Calendly Personal Access Token to the .env file first.");
  process.exit(1);
}

const webhookUrl = `${siteUrl.replace(/\/$/, '')}/api/webhooks/calendly`;
console.log(`Target Webhook URL: ${webhookUrl}`);
console.log("Fetching your Calendly user details...");

async function register() {
  try {
    const meRes = await fetch("https://api.calendly.com/users/me", {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }
    });

    if (!meRes.ok) {
      const errText = await meRes.text();
      throw new Error(`Failed to fetch user info: ${meRes.status} ${meRes.statusText}\n${errText}`);
    }

    const meData = await meRes.json();
    const userUri = meData.resource.uri;
    const orgUri = meData.resource.current_organization;
    console.log(`Logged in as: ${meData.resource.name} (${meData.resource.email})`);
    console.log(`User URI: ${userUri}`);
    console.log(`Organization URI: ${orgUri}`);

    console.log("Registering webhook subscription...");
    // Try registering with organization scope first
    let subRes = await fetch("https://api.calendly.com/webhook_subscriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url: webhookUrl,
        events: ["invitee.created", "invitee.canceled"],
        organization: orgUri,
        scope: "organization"
      })
    });

    if (!subRes.ok) {
      const errData = await subRes.json().catch(() => ({}));
      console.warn("Failed to subscribe with organization scope. Trying user scope instead...");
      
      subRes = await fetch("https://api.calendly.com/webhook_subscriptions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          url: webhookUrl,
          events: ["invitee.created", "invitee.canceled"],
          organization: orgUri,
          user: userUri,
          scope: "user"
        })
      });
    }

    if (!subRes.ok) {
      const errText = await subRes.text();
      throw new Error(`Webhook registration failed: ${subRes.status} ${subRes.statusText}\n${errText}`);
    }

    const subData = await subRes.json();
    console.log("Successfully registered Calendly Webhook!");
    console.log("Subscription details:", JSON.stringify(subData.resource, null, 2));
    console.log("\nMake sure your NEXT_PUBLIC_SITE_URL is set to your public domain (e.g. ngrok or production domain) so Calendly can reach it!");
  } catch (err) {
    console.error("Error during registration:", err.message);
  }
}

register();
