const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const token = process.env.WHATSAPP_TOKEN;
const verifyToken = process.env.VERIFY_TOKEN;
const phoneNumberId = process.env.PHONE_NUMBER_ID;

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const challenge = req.query["hub.challenge"];
  const verifyTokenQuery = req.query["hub.verify_token"];

  if (mode === "subscribe" && verifyTokenQuery === verifyToken) {
    return res.status(200).send(challenge);
  } else {
    return res.sendStatus(403);
  }
});

app.post("/webhook", async (req, res) => {
  try {
    const entry = req.body.entry?.[0]?.changes?.[0]?.value;
    const message = entry?.messages?.[0];

    if (message && message.text) {
      const from = message.from;
      const text = message.text.body.trim().toLowerCase();

      console.log("MENSAJE RECIBIDO:", text);

      await axios.post(
        `https://graph.facebook.com/v24.0/${phoneNumberId}/messages`,
        {
          messaging_product: "whatsapp",
          to: from,
          text: { body: "Recibido ✔️ - XS Bot está ON" },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    }

    return res.sendStatus(200);
  } catch (error) {
    console.log("ERROR AL ENVIAR:", error.response?.data || error.message);
    return res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("XS Bot running on port", PORT));