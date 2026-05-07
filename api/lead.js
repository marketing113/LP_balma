function allowMethod(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return false;
  }

  return true;
}

function readIp(req) {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (typeof forwardedFor === "string" && forwardedFor.length > 0) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = req.headers["x-real-ip"];

  if (typeof realIp === "string" && realIp.length > 0) {
    return realIp.trim();
  }

  return "";
}

function sanitize(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\r?\n/g, " ").trim();
}

function buildLeadMessage(payload) {
  const lines = [];

  if (sanitize(payload.message)) {
    lines.push(`message_libre: ${sanitize(payload.message)}`);
  }

  return lines.join(" | ");
}

function buildMessage(payload, ip) {
  return [
    `nom=${sanitize(payload.nom)}`,
    "",
    `prenom=${sanitize(payload.prenom)}`,
    "",
    `email=${sanitize(payload.email)}`,
    "",
    `telephone=${sanitize(payload.telephone)}`,
    "",
    `secteur_recherche=${sanitize(payload.secteur_recherche)}`,
    "",
    `message=${buildLeadMessage(payload)}`,
    "",
    `landing_page=${sanitize(payload.landing_page)}`,
    "",
    `IP=${sanitize(ip)}`,
  ].join("\n");
}

async function sendToMake(payload) {
  const response = await fetch(process.env.MAKE_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Make webhook error: ${errorBody}`);
  }
}

module.exports = async function handler(req, res) {
  if (!allowMethod(req, res)) {
    return;
  }

  const payload = req.body || {};

  if (payload.company) {
    return res.status(200).json({ ok: true });
  }

  const requiredFields = ["nom", "prenom", "email", "telephone", "secteur_recherche"];
  const missingField = requiredFields.find((field) => !sanitize(payload[field]));

  if (missingField) {
    return res.status(400).json({ error: "Merci de renseigner les champs obligatoires." });
  }

  if (!process.env.MAKE_WEBHOOK_URL) {
    return res.status(500).json({
      error: "Le formulaire n'est pas encore configuré pour l'envoi des leads.",
    });
  }

  const ip = readIp(req);
  const leadPayload = {
    nom: sanitize(payload.nom),
    prenom: sanitize(payload.prenom),
    email: sanitize(payload.email),
    telephone: sanitize(payload.telephone),
    secteur_recherche: sanitize(payload.secteur_recherche),
    message: buildLeadMessage(payload),
    landing_page: sanitize(payload.landing_page),
    IP: sanitize(ip),
    subject: process.env.LEAD_SUBJECT || "LEAD|FacebookAds|pub_balma",
    email_body: buildMessage(payload, ip),
  };

  try {
    await sendToMake(leadPayload);

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "L'envoi du message a échoué. Merci de réessayer dans quelques instants.",
    });
  }
};
