import { MercadoPagoConfig, Payment } from "mercadopago";

export default async function handler(req, res) {
  // 1. Responder a las peticiones GET (verificación básica)
  if (req.method === "GET") {
    return res.status(200).send("Webhook de Mercado Pago activo");
  }

  // 2. Procesar únicamente eventos POST enviados por Mercado Pago
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MP_TOKEN;

  if (!token) {
    console.error("Error: Token de Mercado Pago no configurado.");
    return res.status(500).json({ error: "Token no configurado" });
  }

  try {
    const evento = req.body;

    // 3. Verificar si la notificación corresponde a un pago
    if (evento?.type === "payment" && evento?.data?.id) {
      const paymentId = evento.data.id;

      // Inicializar cliente y SDK de pagos
      const client = new MercadoPagoConfig({ accessToken: token });
      const payment = new Payment(client);

      // Obtener la información oficial del pago
      const pagoInfo = await payment.get({ id: paymentId });

      if (pagoInfo.status === "approved") {
        console.log(`✅ Pago Aprobado. ID: ${pagoInfo.id}`);
        console.log(`Detalle: ${pagoInfo.description}`);
        console.log(`Monto: $${pagoInfo.transaction_amount}`);
        
        // AQUÍ puedes ejecutar acciones como:
        // - Enviar correos con credenciales/claves de acceso
        // - Registrar la transacción en tu base de datos
      }
    }

    // 4. Mercado Pago exige una respuesta 200 OK para confirmar recepción
    return res.status(200).send("OK");

  } catch (error) {
    console.error("Error procesando Webhook:", error);
    // Devolvemos 200 OK para evitar retentativas infinitas en caso de errores no críticos
    return res.status(200).send("Error registrado");
  }
}
