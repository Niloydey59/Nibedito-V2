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
  getUserPendingReviews,
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

// Review collections and filtering
reviewRouter.get("/", isAdmin, getReviews); // Get all reviews (with filters)
reviewRouter.get("/product/:productId", getProductReviews); //get reviews for a product
reviewRouter.get("/user", isLoggedIn, getUserReviews); //get reviews by user
reviewRouter.get("/user/pending", isLoggedIn, getUserPendingReviews); //get pending reviews by user

// Review CRUD operations (put /:id routes AFTER specific paths)
reviewRouter.get("/:id", getReview); //get a review by ID

reviewRouter.patch(
  "/:id",
  isLoggedIn,
  uploadReview,
  validateReviewUpdate,
  validateRequest,
  updateReview
); //update a review by ID

router.post(
  "/:id/images",
  authMiddleware,
  upload.array("images", 5),
  addReviewImages
); // add images to a review

// Delete image
router.delete("/:id/images/:imageId", authMiddleware, deleteReviewImage); // delete an image from a review

reviewRouter.delete("/:id", isLoggedIn, deleteReview); //delete a review by ID

// Review interactions
reviewRouter.post("/:id/helpful", isLoggedIn, markReviewHelpful); // Mark review as helpful

// Review statistics
reviewRouter.get("/product/:productId/stats", getReviewStats); //get review stats for a product

module.exports = reviewRouter;
