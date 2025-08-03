const { Schema, model } = require("mongoose");

const paymentSchema = new Schema(
    {
        order: {
            type: Schema.Types.ObjectId,
            ref: "Order",
            required: true,
        },

        paymentMethod: {
            type: String,
            enum: ["Cash on Delivery"],
            required: true,
        },

        amount: {
            type: Number,
            required: true,
        },

        status: {
            type: String,
            enum: ["Pending", "Completed", "Failed", "Refunded"],
            default: "Pending",
        },

        refundedAt: {
            type: Date, // If the payment was refunded
            default: null,
        },
    },
    { timestamps: true }
);

const Payment = model("Payment", paymentSchema);
module.exports = Payment;