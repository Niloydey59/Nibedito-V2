const express = require("express");

const {
  createReview,
  getProductReviews,
  getUserReviews,
  deleteReview,
  updateReview,
} = require("../controllers/reviewController");
const { uploadReview } = require("../config/cloudinary");
const { isLoggedIn } = require("../middlewares/authMiddleware");

const reviewRouter = express.Router();

// /api/reviews common path
reviewRouter.post("/", isLoggedIn, uploadReview, createReview); //create a review

reviewRouter.get("/", getProductReviews); //get reviews for a product
reviewRouter.get("/user", isLoggedIn, getUserReviews); //get reviews by user
reviewRouter.delete("/:id", isLoggedIn, deleteReview); //delete a review by ID
reviewRouter.put("/:id", isLoggedIn, uploadReview, updateReview); //update a review by ID

module.exports = reviewRouter;
