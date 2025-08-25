const { Schema, model } = require("mongoose");

const reviewSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: [true, "Product ID is required"],
  },

  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"],
  },

  rating: {
    type: Number,
    required: [true, "Rating is required"],
    min: 1,
    max: 5,
    validate: {
      validator: function (value) {
        // Check if the number has at most 1 decimal place
        return Number.isInteger(value * 10);
      },
      message: "Rating must have at most 1 decimal place",
    },
  },

  comment: {
    type: String,
    required: [true, "Comment is required"],
    trim: true,
    maxlength: [500, "Comment cannot exceed 500 characters"],
  },

  image: {
    type: [String],
    required: [true, "Product image is required"],
  },
});

const Review = model("Review", reviewSchema);
module.exports = Review;
