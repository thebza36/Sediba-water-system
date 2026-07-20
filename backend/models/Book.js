const mongoose = require("mongoose");

const bookItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },

  name: String,

  size: String,

  category: String,

  quantity: {
    type: Number,
    required: true,
    min: 1
  },

  price: {
    type: Number,
    required: true,
    min: 0
  },

  total: {
    type: Number,
    required: true
  }

});

const bookSchema = new mongoose.Schema({

  documentNumber: {
    type: String,
    required: true,
    unique: true
  },

  type: {
    type: String,
    enum: ["quotation", "invoice"],
    required: true
  },

  customer: {
    type: String,
    required: true,
    trim: true
  },

  phone: {
    type: String,
    trim: true
  },

  address: {
    type: String,
    trim: true
  },

  deliveryAddress: {
    type: String,
    trim: true
  },

  status: {
    type: String,
    enum: [
      "draft",
      "pending",
      "approved",
      "converted",
      "paid",
      "overdue"
    ],
    default: "pending"
  },

  items: [bookItemSchema],

  subtotal: {
    type: Number,
    default: 0
  },

  vat: {
    type: Number,
    default: 0
  },

  discount: {
    type: Number,
    default: 0
  },

  total: {
    type: Number,
    default: 0
  },

  paidAmount: {
    type: Number,
    default: 0
  },

  outstandingBalance: {
    type: Number,
    default: 0
  },

  notes: {
    type: String
  },

  dueDate: {
    type: Date
  }

},
{
  timestamps: true
});

module.exports =
mongoose.model("Book", bookSchema);