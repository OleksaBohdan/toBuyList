const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  productCount: { type: String },
  isBuyed: { type: Boolean, default: false },
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
