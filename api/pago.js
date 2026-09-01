import { MercadoPagoConfig, Preference } from "mercadopago";

export default async function handler(req, res) {
  // 1. Configuración de cabeceras CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  try {
    // 2. Obtener Token de entorno
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MP_TOKEN;

    if (!token) {
      return res.status(500).json({ error: "Falta configurar la variable MERCADOPAGO_ACCESS_TOKEN en Vercel." });
    }

    // 3. Inicializar cliente con el SDK v2
    const client = new MercadoPagoConfig({ accessToken: token });
    const preference = new Preference(client);

    // 4. Leer datos del cuerpo
    const bodyData = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const opcion = bodyData?.opcion;

    const monto =
      opcion === "Unico" ? 10 :
      opcion === "Pack 5" ? 20 :
      opcion === "Pack 10" ? 30 : 0;

    if (!monto) {
      return res.status(400).json({ error: "Opción de servicio inválida: " + opcion });
    }

    // 5. Crear la preferencia
    const result = await preference.create({
      body: {
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
          success: "https://psicotecnicospremium.vercel.app/registrovercel11.html?resultado=success",
          failure: "https://psicotecnicospremium.vercel.app/registrovercel11.html?resultado=failure",
          pending: "https://psicotecnicospremium.vercel.app/registrovercel11.html?resultado=pending"
        },
        auto_return: "approved"
      }
    });

    // 6. Devolver puntos de inicio al frontend
    return res.status(200).json({
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point
    });

  } catch (err) {
    console.error("Error al crear la preferencia:", err);
    return res.status(500).json({ error: "Error en el servidor", detalle: err.message });
  }
}
