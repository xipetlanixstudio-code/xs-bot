import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

// 1. VERIFICACIÓN DEL WEBHOOK (GET)
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verificado correctamente");
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

// 2. RECEPCIÓN DE MENSAJES (POST)
app.post("/webhook", async (req, res) => {
  const body = req.body;

  if (body.object === "whatsapp_business_account") {
    const change = body.entry?.[0]?.changes?.[0];
    const messages = change?.value?.messages;

    if (messages && messages.length > 0) {
      const msg = messages[0];
      const from = msg.from; 
      const text = msg.text?.body;

      console.log("MENSAJE RECIBIDO:", text);

      await sendMessage(from, "XS Bot conectado correctamente 🚀");
    }

    return res.sendStatus(200);
  }

  res.sendStatus(404);
});

// 3. FUNCIÓN PARA ENVIAR MENSAJES
async function sendMessage(to, message) {
  const url = `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`;

  const body = {
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
    body: JSON.stringify(body)
  });
}

app.listen(process.env.PORT || 3000, () => {
  console.log("XS Bot running...");
});