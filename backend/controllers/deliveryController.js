const Delivery = require("../models/Delivery");

/* ==========================================
   CREATE DELIVERY
========================================== */

const createDelivery = async (req, res) => {
  try {
    const {
      customerName,
      phone,
      location,
      address,
      waterQuantity,
      deliveryCost,
      notes,
    } = req.body;

    if (!customerName || !location) {
      return res.status(400).json({
        message: "Customer name and location are required.",
      });
    }

    const delivery = await Delivery.create({
      customerName,
      phone: phone || "",
      location,
      address: address || "",
      employee: req.user.id,
      waterQuantity: Number(waterQuantity) || 0,
      deliveryCost: Number(deliveryCost) || 0,
      notes: notes || "",
    });

    const populated = await Delivery.findById(delivery._id)
      .populate("employee", "name");

    res.status(201).json({
      message: "✅ Delivery created successfully",
      delivery: populated,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create delivery",
    });
  }
};

/* ==========================================
   GET MY DELIVERIES
========================================== */

const getMyDeliveries = async (req, res) => {
  try {

    const deliveries = await Delivery.find({
      employee: req.user.id,
    })
      .populate("employee", "name")
      .sort({ createdAt: -1 });

    res.json(deliveries);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Failed to load deliveries",
    });

  }
};

/* ==========================================
   UPDATE DELIVERY
========================================== */

const updateDelivery = async (req, res) => {

  try {

    const delivery = await Delivery.findById(req.params.id);

    if (!delivery) {
      return res.status(404).json({
        message: "Delivery not found",
      });
    }

    delivery.customerName = req.body.customerName;
    delivery.phone = req.body.phone;
    delivery.location = req.body.location;
    delivery.address = req.body.address;
    delivery.waterQuantity = Number(req.body.waterQuantity);
    delivery.deliveryCost = Number(req.body.deliveryCost);
    delivery.notes = req.body.notes;

    await delivery.save();

    res.json({
      message: "Delivery updated successfully.",
      delivery,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Failed to update delivery.",
    });

  }

};

/* ==========================================
   DELETE DELIVERY
========================================== */

const deleteDelivery = async (req, res) => {

  try {

    const delivery = await Delivery.findById(req.params.id);

    if (!delivery) {
      return res.status(404).json({
        message: "Delivery not found.",
      });
    }

    await delivery.deleteOne();

    res.json({
      message: "Delivery deleted successfully.",
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Failed to delete delivery.",
    });

  }

};

/* ==========================================
   UPDATE DELIVERY STATUS
========================================== */

const updateDeliveryStatus = async (req, res) => {

  try {

    const { status } = req.body;

    const delivery = await Delivery.findById(req.params.id);

    if (!delivery) {
      return res.status(404).json({
        message: "Delivery not found",
      });
    }

    delivery.status = status;

    if (status === "Accepted") {
      delivery.acceptedAt = new Date();
    }

    if (status === "On Route") {
      delivery.startedAt = new Date();
    }

    if (status === "Delivered") {
      delivery.deliveredAt = new Date();
      delivery.paymentStatus = "Paid";
    }

    await delivery.save();

    const updated = await Delivery.findById(delivery._id)
      .populate("employee", "name");

    res.json({
      message: "Status updated",
      delivery: updated,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Failed to update status",
    });

  }

};

/* ==========================================
   ADMIN GET ALL
========================================== */

const getAllDeliveries = async (req, res) => {

  try {

    const deliveries = await Delivery.find()
      .populate("employee", "name email")
      .sort({ createdAt: -1 });

    res.json(deliveries);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Failed to fetch deliveries",
    });

  }

};

module.exports = {
  createDelivery,
  getMyDeliveries,
  updateDelivery,
  deleteDelivery,
  updateDeliveryStatus,
  getAllDeliveries,
};