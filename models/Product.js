const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  // ...existing fields...
  order: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);