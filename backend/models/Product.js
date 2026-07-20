const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
{
name: {
type: String,
required: true,
trim: true
},

size: {
type: String,
trim: true
},

category:{
type:String,
enum:["water","ice","refill","other"],
required:true
},

price: {
type: Number,
required: true,
min: 0
},

stock: {
type: Number,
default: 0
},

image: {
type: String,   // filename of uploaded image
default: null
}

},
{
timestamps: true
}
);

module.exports = mongoose.model("Product", productSchema);