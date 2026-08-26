export default async function handler(req, res) {
  const evento = req.body;

  if (evento.type === "payment" && evento.data.id) {
    const paymentId = evento.data.id;

    const r = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${process.env.MP_TOKEN}` }
    });

    const pago = await r.json();

    if (pago.status === "approved") {
      pagos[pago.preference_id] = "approved";
    }
  }

  res.status(200).send("OK");
}
