import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "XS_VERIFY_TOKEN";
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;

// 1. Verificación del webhook (GET)
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verificado correctamente.");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// 2. Recepción de mensajes (POST)
app.post("/webhook", async (req, res) => {
  const body = req.body;

  if (body.object === "whatsapp_business_account") {
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0]?.value;

    const messages = changes?.messages;

    if (messages && messages.length > 0) {
      const msg = messages[0];

      const from = msg.from; // número del usuario
      const text = msg.text?.body || null;

      console.log("Mensaje recibido:", text);

      // RESPUESTA BÁSICA (luego la reemplazamos con tu IA)
      await sendMessage(from, "XS Bot conectado correctamente 🚀");

    }

    return res.sendStatus(200);
  }

  return res.sendStatus(404);
});

// --- FUNCIONES PARA ENVIAR MENSAJES ---
async function sendMessage(to, message) {
  const url = "https://graph.facebook.com/v19.0/" + process.env.PHONE_NUMBER_ID + "/messages";

  const payload = {
    messaging_product: "whatsapp",
    to,
    text: { body: message }
  };

  await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
}

// Puerto para Render
app.listen(process.env.PORT || 3000, () => {
  console.log("XS Bot running on port", process.env.PORT || 3000);
});
