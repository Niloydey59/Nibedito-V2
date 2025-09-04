const express = require("express");

const {
  createReview,
  getProductReviews,
  getUserReviews,
  deleteReview,
  updateReview,
  getReviewStats,
  markReviewHelpful,
  getReviews,
  getReview,
} = require("../controllers/reviewController");
const { uploadReview } = require("../config/cloudinary");
const { isLoggedIn, isAdmin } = require("../middlewares/authMiddleware");
const {
  validateReview,
  validateReviewUpdate,
} = require("../validators/review");
const { validateRequest } = require("../middlewares/validateRequest");

const reviewRouter = express.Router();

// /api/reviews common path

// Review CRUD operations
reviewRouter.post(
  "/",
  isLoggedIn,
  uploadReview,
  validateReview,
  validateRequest,
  createReview
); //create a review
reviewRouter.get("/:id", getReview); //get a review by ID
reviewRouter.put(
  "/:id",
  isLoggedIn,
  uploadReview,
  validateReviewUpdate,
  validateRequest,
  updateReview
); //update a review by ID
reviewRouter.delete("/:id", isLoggedIn, deleteReview); //delete a review by ID

// Review collections and filtering
reviewRouter.get("/", isAdmin, getReviews); // Get all reviews (with filters)
reviewRouter.get("/product/:productId", getProductReviews); //get reviews for a product
reviewRouter.get("/user", isLoggedIn, getUserReviews); //get reviews by user

// Review interactions
reviewRouter.post("/:id/helpful", isLoggedIn, markReviewHelpful); // Mark review as helpful

// Review statistics
reviewRouter.get("/product/:productId/stats", getReviewStats); //get review stats for a product

module.exports = reviewRouter;
