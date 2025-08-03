const { Schema, model } = require("mongoose");

const shippingRateSchema = new Schema(
    {
        region: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },

        cost: {
            type: Number,
            required: true,
            min: 0,
        },

        description: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
);

// Find by region name (case-insensitive)
shippingRateSchema.statics.findByRegion = function (regionName) {
    return this.findOne({
        region: { $regex: new RegExp("^" + regionName + "$", "i") },
    });
};

const ShippingRate = model("ShippingRate", shippingRateSchema);
module.exports = ShippingRate;