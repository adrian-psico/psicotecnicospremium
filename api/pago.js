import mercadopago from "mercadopago";

mercadopago.configure({
  access_token: process.env.MP_TOKEN
});

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { opcion } = req.body;

  const monto =
    opcion === "Unico" ? 60000 :
    opcion === "Pack 5" ? 250000 :
    opcion === "Pack 10" ? 400000 : 0;

  try {
    const preference = await mercadopago.preferences.create({
      items: [{
        title: "Psicotécnicos Premium - " + opcion,
        quantity: 1,
        unit_price: monto
      }],
      back_urls: {
        success: "https://psicotecnicospremium.vercel.app/api/confirmacion",
        failure: "https://psicotecnicospremium.vercel.app/pago-error",
        pending: "https://psicotecnicospremium.vercel.app/pago-pendiente"
      },
      auto_return: "approved"
    });

    return res.status(200).json({
      preferenceId: preference.body.id
    });

  } catch (error) {
    console.error("Error creando preferencia:", error);
    return res.status(500).json({ error: "Error creando preferencia" });
  }
}
