const Client = require("../models/Client");
const WaterSale = require("../models/WaterSale");


/* ======================================================
   GET ALL CLIENTS + TOTAL WATER + TOTAL REVENUE
====================================================== */
exports.getClients = async (req, res) => {
  try {
    const clients = await Client.find().populate("meters");

    const results = await Promise.all(
      clients.map(async (c) => {
        const sales = await WaterSale.find({
          meter: { $in: c.meters || [] }
        });

        const totalWater = sales.reduce(
          (sum, s) => sum + (s.totalSold || 0),
          0
        );

        const totalRevenue = sales.reduce(
          (sum, s) => sum + (s.revenue || 0),
          0
        );

        return {
          ...c.toObject(),
          totalWater,
          totalRevenue,
        };
      })
    );

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch clients" });
  }
};


/* ======================================================
   CREATE CLIENT
====================================================== */
exports.createClient = async (req, res) => {
  try {
    const { name, location, phone, type } = req.body;

    const client = await Client.create({
      name,
      location,
      phone,
      type,
      meters: [],
      debt: 0,
    });

    res.status(201).json(client);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create client" });
  }
};


/* ======================================================
   UPDATE CLIENT
====================================================== */
exports.updateClient = async (req, res) => {
  try {
    const updated = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ message: "Client not found" });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update client" });
  }
};


/* ======================================================
   DELETE CLIENT
====================================================== */
exports.deleteClient = async (req, res) => {
  try {
    const deleted = await Client.findByIdAndDelete(req.params.id);

    if (!deleted)
      return res.status(404).json({ message: "Client not found" });

    res.json({ message: "Client deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete client" });
  }
};


/* ======================================================
   ASSIGN METER TO CLIENT
====================================================== */
exports.assignMeter = async (req, res) => {
  try {
    const { meterId } = req.body;

    const client = await Client.findById(req.params.id);
    if (!client)
      return res.status(404).json({ message: "Client not found" });

    const exists = client.meters.some(
      (m) => m.toString() === meterId
    );

    if (!exists) {
      client.meters.push(meterId);
      await client.save();
    }

    res.json(client);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to assign meter" });
  }
};


/* ======================================================
   CLIENT PROFILE (FULL HISTORY + TOTALS)
====================================================== */
exports.getClientProfile = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id)
      .populate("meters");

    if (!client)
      return res.status(404).json({ message: "Client not found" });

    const sales = await WaterSale.find({
      meter: { $in: client.meters || [] },
    })
      .populate("meter")
      .sort({ date: -1 });

    const totalWater = sales.reduce(
      (sum, s) => sum + (s.totalSold || 0),
      0
    );

    const totalRevenue = sales.reduce(
      (sum, s) => sum + (s.revenue || 0),
      0
    );

    res.json({
      client,
      totalWater,
      totalRevenue,
      sales,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load profile" });
  }
};


/* ======================================================
   RECORD PAYMENT (SAFE VERSION)
====================================================== */
exports.recordPayment = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0)
      return res.status(400).json({
        message: "Invalid payment amount",
      });

    const client = await Client.findById(req.params.id);

    if (!client)
      return res.status(404).json({
        message: "Client not found",
      });

    client.debt = Math.max(0, (client.debt || 0) - amount);

    await client.save();

    res.json(client);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to record payment",
    });
  }
};
