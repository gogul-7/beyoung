const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    coupon_code: {
      type: String,
    },
    amount_off: {
      type: Number,
    },
    minimum_purchase: {
      type: Number,
    },
    valid_from: {
      type: Date,
    },
    valid_till: {
      type: Date,
    },
    status: {
      type: Boolean,
      default: true,
    },
    isExpired: {
      type: Boolean,
      default: false,
    },
    users: {
      type: Array,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Coupon", couponSchema);
