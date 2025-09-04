const createError = require("http-errors"); // error-handling middleware
const { successResponse } = require("./responseController");
const Product = require("../models/productModel");
const cloudinary = require("../config/cloudinary");
const { publicIDfromURL } = require("../helper/cloudinaryHelper");
const Review = require("../models/reviewModel");
const mongoose = require("mongoose");

const createReview = async (req, res, next) => {
  try {
    const { product, rating, comment } = req.body;
    const user = req.user._id;

    // check if user has already reviewed the product
    const existingReview = await Review.findOne({ product, user });
    if (existingReview) {
      throw createError(409, "You have already reviewed this product.");
    }

    // Check if image is uploaded
    const images = req.files;
    let imageUrls = [];

    // Only process images if they are provided
    if (images && images.length > 0) {
      // Check each image size
      for (const image of images) {
        if (image.size > 1024 * 1024 * 2) {
          throw createError(400, "Each image should be less than 2MB");
        }
      }

      // Upload images to Cloudinary
      for (const image of images) {
        const response = await cloudinary.uploader.upload(image.path, {
          folder: "ecommerce/products",
        });
        imageUrls.push(response.secure_url);
      }
    }

    const review = {
      product,
      user,
      rating,
      comment,
      image: imageUrls,
    };

    //update product ratings
    const productExist = await Product.findById(product);
    if (!productExist) {
      throw createError(404, "Product not found!");
    }
    const currentTotalRating =
      (productExist.ratings || 0) * (productExist.reviewCount || 0);
    const newTotalRating = currentTotalRating + Number(rating);
    const newReviewCount = (productExist.reviewCount || 0) + 1;
    console.log("New Total Rating:", newTotalRating);
    console.log("New Review Count:", newReviewCount);

    productExist.reviewCount = newReviewCount;
    productExist.ratings = Number((newTotalRating / newReviewCount).toFixed(1));
    await productExist.save();

    // Create new review in database
    const newReview = await Review.create(review);
    if (!newReview) {
      throw createError(500, "Failed to create review");
    }

    // Return the created review with populated fields
    const populatedReview = await Review.findById(newReview._id)
      .populate("user", "name email")
      .populate("product", "name slug");

    // Return success response
    return successResponse(res, {
      statusCode: 201,
      message: `Review created successfully`,
      payload: { review: populatedReview },
    });
  } catch (error) {
    next(error);
  }
};

const getReviews = async (req, res, next) => {
  try {
    // Pagination and search query parameters
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const searchQuery = req.query.search || "";

    // Build filter object
    const filter = {};
    if (searchQuery) {
      filter.comment = { $regex: searchQuery, $options: "i" }; // Case-insensitive search in comment field
    }

    // Get reviews from database
    const reviews = await Review.find(filter)

      .populate("user", "name email") // user population
      .populate("product", "name slug") // product population
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count of products
    const count = await Review.countDocuments(filter);
    return successResponse(res, {
      statusCode: 200,
      message: "Reviews were returned successfully!",
      payload: {
        reviews: reviews,
        pagination: {
          totalReviews: count,
          totalPages: Math.ceil(count / limit),
          currentPage: page,
          previousPage: page > 1 ? page - 1 : null,
          nextPage: page < Math.ceil(count / limit) ? page + 1 : null,
        },
        filters: {
          searchQuery,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createError(400, "Invalid review ID");
    }

    // Find review from database
    const review = await Review.findById(id)
      .populate("user", "name email") // user population
      .populate("product", "name slug"); // product population

    // Check if review exists
    if (!review) {
      throw createError(404, "Review not found!");
    }

    return successResponse(res, {
      statusCode: 200,
      message: "Review was returned successfully!",
      payload: { review: review },
    });
  } catch (error) {
    next(error);
  }
};

const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    if (!productId) {
      throw createError(400, "Product ID is required");
    }
    // Pagination  parameters
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    // Filtering parameters
    const rating = req.query.rating; // Filter by specific rating
    const sortBy = req.query.sortBy || "createdAt"; // Sort by: createdAt, rating, helpful
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    // Build filter object
    const filter = { product: productId };
    if (rating) {
      filter.rating = Number(rating);
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder;

    // Get reviews from database
    const reviews = await Review.find(filter)
      .populate("user", "name email") // user population
      .populate("product", "name slug") // product population
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count of products
    const count = await Review.countDocuments(filter);

    return successResponse(res, {
      statusCode: 200,
      message: "Reviews were returned successfully!",
      payload: {
        reviews: reviews,
        pagination: {
          totalReviews: count,
          totalPages: Math.ceil(count / limit),
          currentPage: page,
          previousPage: page > 1 ? page - 1 : null,
          nextPage: page < Math.ceil(count / limit) ? page + 1 : null,
        },
        filters: {
          rating,
          sortBy,
          sortOrder: sortOrder === 1 ? "asc" : "desc",
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getUserReviews = async (req, res, next) => {
  try {
    const userId = req.user._id;
    //console.log("User ID:", userId);

    // Pagination and search query parameters
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const filter = { user: userId };

    const reviews = await Review.find(filter)
      .populate("product", "name slug thumbnailImage") // ADD product population
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count of reviews
    const count = await Review.countDocuments(filter);

    return successResponse(res, {
      statusCode: 200,
      message: "Reviews were returned successfully!",
      payload: {
        reviews: reviews,
        pagination: {
          totalReviews: count,
          totalPages: Math.ceil(count / limit),
          currentPage: page,
          previousPage: page > 1 ? page - 1 : null,
          nextPage: page < Math.ceil(count / limit) ? page + 1 : null,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    // Get product by slug
    const { id } = req.params;
    const userId = req.user._id;

    // Find review from database
    const reviewExist = await Review.findById(id);

    // Check if review exists
    if (!reviewExist) {
      throw createError(404, "Review not found!");
    }

    // Check if the user is the owner of the review
    if (reviewExist.user.toString() !== userId.toString()) {
      throw createError(403, "You are not authorized to delete this review");
    }

    //Update product ratings before deleting review
    const productExist = await Product.findById(reviewExist.product);
    if (productExist) {
      const currentTotalRating =
        (productExist.ratings || 0) * (productExist.reviewCount || 0);
      const newTotalRating = currentTotalRating - Number(reviewExist.rating);
      const newReviewCount = Math.max(0, (productExist.reviewCount || 0) - 1);

      if (newReviewCount === 0) {
        productExist.ratings = 0;
      } else {
        productExist.ratings = Number(
          (newTotalRating / newReviewCount).toFixed(1)
        );
      }
      productExist.reviewCount = newReviewCount;
      await productExist.save();
    }

    // Delete review images from Cloudinary
    if (reviewExist.image.length > 0) {
      for (const image of reviewExist.image) {
        const publicID = await publicIDfromURL(image);
        const { result } = await cloudinary.uploader.destroy(
          `ecommerce/products/${publicID}`
        );
        if (result !== "ok") {
          throw createError(
            500,
            "Failed to delete review image from Cloudinary"
          );
        }
      }
    }

    // Delete review from database
    const review = await Review.findByIdAndDelete(id);

    if (!review) {
      throw createError(404, "Review not found!");
    }
    return successResponse(res, {
      statusCode: 200,
      message: "Review deleted successfully!",
      payload: { review },
    });
  } catch (error) {
    next(error);
  }
};

const updateReview = async (req, res, next) => {
  try {
    // Get product by slug
    const { id } = req.params;

    const userId = req.user._id;

    // Find review from database
    const reviewExist = await Review.findById(id);
    // Check if review exists
    if (!reviewExist) {
      throw createError(404, "Review not found!");
    }

    // Check if the user is the owner of the review
    if (reviewExist.user.toString() !== userId.toString()) {
      throw createError(403, "You are not authorized to update this review");
    }

    // update fields and allowed fields to update
    let updates = {};
    const allowedFields = ["rating", "comment"];
    // Check if the request body contains the allowed fields
    for (const key in req.body) {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    }
    console.log("Request Body:", req.body);
    console.log("Updates:", updates);

    // Check if images are uploaded
    const images = req.files;

    if (images && images.length > 0) {
      // Check each image size
      for (const image of images) {
        if (image.size > 1024 * 1024 * 2) {
          throw createError(400, "Each image should be less than 2MB");
        }
      }

      // Upload images to Cloudinary
      const imageUrls = [];
      for (const image of images) {
        const response = await cloudinary.uploader.upload(image.path, {
          folder: "ecommerce/products",
        });
        imageUrls.push(response.secure_url);
      }

      // Add new images to updates
      updates.image = imageUrls;
    }
    // Check if rating is updated
    if (updates.rating) {
      // Update product ratings
      const productExist = await Product.findById(reviewExist.product);
      if (!productExist) {
        throw createError(404, "Product not found!");
      }

      // Remove old rating from total and add new rating
      const currentTotalRating =
        (productExist.ratings || 0) * (productExist.reviewCount || 0);
      const newTotalRating =
        currentTotalRating -
        Number(reviewExist.rating) +
        Number(updates.rating);

      productExist.ratings = Number(
        (newTotalRating / (productExist.reviewCount || 1)).toFixed(1)
      );
      await productExist.save();
    }

    // Update review in database
    const updatedReview = await Review.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!updatedReview) {
      throw createError(404, "Review not found!");
    }

    // Delete old images from Cloudinary if new images are uploaded
    if (images && images.length > 0 && reviewExist.image.length > 0) {
      for (const image of reviewExist.image) {
        const publicID = await publicIDfromURL(image);
        const { result } = await cloudinary.uploader.destroy(
          `ecommerce/products/${publicID}`
        );
        if (result !== "ok") {
          throw createError(
            500,
            "Failed to delete old review image from Cloudinary"
          );
        }
      }
    }

    // Return success response
    return successResponse(res, {
      statusCode: 200,
      message: "Review was updated successfully!",
      payload: { review: updatedReview },
    });
  } catch (error) {
    next(error);
  }
};

const markReviewHelpful = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const review = await Review.findById(id);
    if (!review) {
      throw createError(404, "Review not found!");
    }

    // Check if user already marked as helpful
    const alreadyMarked = review.helpfulUsers.includes(userId);

    if (alreadyMarked) {
      // Remove from helpful
      review.helpfulUsers.pull(userId);
      review.helpful = Math.max(0, review.helpful - 1);
    } else {
      // Add to helpful
      review.helpfulUsers.push(userId);
      review.helpful += 1;
    }

    await review.save();

    return successResponse(res, {
      statusCode: 200,
      message: alreadyMarked ? "Removed from helpful" : "Marked as helpful",
      payload: {
        helpful: review.helpful,
        isHelpful: !alreadyMarked,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getReviewStats = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const stats = await Review.aggregate([
      { $match: { product: mongoose.Types.ObjectId(productId) } },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    const totalReviews = await Review.countDocuments({ product: productId });

    // Calculate average rating and percentages
    let totalRatingSum = 0;
    const statsWithPercentage = stats.map((stat) => {
      totalRatingSum += stat._id * stat.count;
      return {
        rating: stat._id,
        count: stat.count,
        percentage: Math.round((stat.count / totalReviews) * 100),
      };
    });

    const averageRating =
      totalReviews > 0 ? (totalRatingSum / totalReviews).toFixed(1) : 0;

    return successResponse(res, {
      statusCode: 200,
      message: "Review statistics retrieved successfully",
      payload: {
        stats: statsWithPercentage,
        totalReviews,
        averageRating: parseFloat(averageRating),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getReviews,
  getReview,
  getProductReviews,
  getUserReviews,
  deleteReview,
  updateReview,
  markReviewHelpful,
  getReviewStats,
};
