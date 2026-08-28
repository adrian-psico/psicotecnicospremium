export default async function handler(req, res) {
  // Manejo de CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MP_TOKEN;

    // Devuelve un JSON de prueba
    return res.status(200).json({
      mensaje: "Conexión con Vercel exitosa",
      tokenPresente: !!token,
      bodyRecibido: req.body
    });
  } catch (err) {
    return res.status(500).json({ error: "Error en servidor", detalle: err.message });
  }
}
