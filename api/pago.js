import { MercadoPagoConfig, Preference } from "mercadopago";

export default async function handler(req, res) {
  // 1. Configurar cabeceras CORS para permitir peticiones desde GitHub Pages
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // 2. Responder a las peticiones preflight (OPTIONS) que envía el navegador
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // 3. Validar que la petición principal sea POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 4. Obtener el Token de las variables de entorno
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MP_TOKEN;

  if (!token) {
    return res.status(500).json({ 
      error: "Falta configurar la variable MERCADOPAGO_ACCESS_TOKEN o MP_TOKEN en Vercel." 
    });
  }

  // 5. Inicializar el cliente de Mercado Pago
  const client = new MercadoPagoConfig({ accessToken: token });
  const preference = new Preference(client);

  const { opcion } = req.body;

  // 6. Mapear precios según la opción elegida
  const monto =
    opcion === "Unico" ? 60000 :
    opcion === "Pack 5" ? 250000 :
    opcion === "Pack 10" ? 400000 : 0;

  if (monto === 0) {
    return res.status(400).json({ error: "Opción de servicio no válida o no especificada." });
  }

  // 7. Crear la preferencia de pago
  try {
    const response = await preference.create({
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
          success: "https://psicotecnicospremium.vercel.app/api/confirmacion",
          failure: "https://psicotecnicospremium.vercel.app/pago-error",
          pending: "https://psicotecnicospremium.vercel.app/pago-pendiente"
        },
        auto_return: "approved"
      }
    });

    // 8. Devolver los datos del checkout al cliente
    return res.status(200).json({
      preferenceId: response.id,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point
    });

  } catch (error) {
    console.error("Error al crear preferencia en Mercado Pago:", error);
    return res.status(500).json({ 
      error: "Error interno al generar el pago", 
      detalle: error.message 
    });
  }
}

