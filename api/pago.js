import mercadopago from "mercadopago";

export default async function handler(req, res) {
  // Configuración de CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  try {
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MP_TOKEN;

    if (!token) {
      return res.status(500).json({ error: "Falta configurar la variable MERCADOPAGO_ACCESS_TOKEN en Vercel" });
    }

    // Configurar cliente v1.x
    mercadopago.configure({ access_token: token });

    const bodyData = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const opcion = bodyData?.opcion;

    const monto =
      opcion === "Unico" ? 60000 :
      opcion === "Pack 5" ? 250000 :
      opcion === "Pack 10" ? 400000 : 0;

    if (!monto) {
      return res.status(400).json({ error: "Opción de servicio inválida: " + opcion });
    }

    // Crear la preferencia en Mercado Pago
    const preference = {
      items: [
        {
          id: opcion,
          title: "Psicotécnicos Premium - " + opcion,
          quantity: 1,
          unit_price: Number(monto),
          currency_id: "ARS"
        }
      ],
      back_urls: {
        success: "https://psicotecnicospremium.vercel.app/api/confirmacion",
        failure: "https://psicotecnicospremium.vercel.app/pago-error",
        pending: "https://psicotecnicospremium.vercel.app/pago-pendiente"
      },
      auto_return: "approved"
    };

    const response = await mercadopago.preferences.create(preference);

    // DEVOLVER LAS URLs NECESARIAS POR EL FRONTEND
    return res.status(200).json({
      init_point: response.body.init_point,
      sandbox_init_point: response.body.sandbox_init_point
    });

  } catch (err) {
    console.error("Error al generar preferencia:", err);
    return res.status(500).json({ error: "Error en el servidor", detalle: err.message });
  }
}
