const createError = require("http-errors"); // error-handling middleware
const { successResponse } = require("./responseController");
const Product = require("../models/productModel");
const cloudinary = require("../config/cloudinary");
const { publicIDfromURL } = require("../helper/cloudinaryHelper");
const Review = require("../models/reviewModel");

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

    // Return success response
    return successResponse(res, {
      statusCode: 200,
      message: `Review created successfully`,
      payload: { Review: review },
    });
  } catch (error) {
    next(error);
  }
};

const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.body;
    // Pagination and search query parameters
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;

    const filter = { product: productId };
    const options = {
      page,
      limit,
      sort: { createdAt: -1 }, // Sort by creation date, newest first
    };

    // Get reviews from database
    const reviews = await Review.find(filter, null, options);

    // Get total count of products
    const count = await Review.find(filter).countDocuments();

    return successResponse(res, {
      statusCode: 200,
      message: "Reviews were returned successfully!",
      payload: {
        reviews: reviews,
        pagination: {
          totalReviews: count,
          totalpages: Math.ceil(count / limit),
          currentPage: page,
          previousPage: page > 1 ? page - 1 : null,
          nextPage: page + 1 <= Math.ceil(count / limit) ? page + 1 : null,
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
    console.log("User ID:", userId);
    // Pagination and search query parameters
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const filter = { user: userId };
    const options = {
      page,
      limit,
      sort: { createdAt: -1 }, // Sort by creation date, newest first
    };
    // Get reviews from database
    const reviews = await Review.find(filter, null, options);

    // Get total count of reviews
    const count = await Review.find(filter).countDocuments();

    return successResponse(res, {
      statusCode: 200,
      message: "Reviews were returned successfully!",
      payload: {
        reviews: reviews,
        pagination: {
          totalReviews: count,
          totalpages: Math.ceil(count / limit),
          currentPage: page,
          previousPage: page > 1 ? page - 1 : null,
          nextPage: page + 1 <= Math.ceil(count / limit) ? page + 1 : null,
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

    // Find review from database
    const reviewExist = await Review.findById(id);

    // Check if review exists
    if (!reviewExist) {
      throw createError(404, "Review not found!");
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

module.exports = {
  createReview,
  getProductReviews,
  getUserReviews,
  deleteReview,
  updateReview,
};
