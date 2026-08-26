let pagos = {};

export default function handler(req, res) {
  const { pref } = req.query;
  res.status(200).json({ status: pagos[pref] || "pending" });
}
