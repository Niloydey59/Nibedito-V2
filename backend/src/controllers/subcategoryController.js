const createError = require("http-errors");
const { successResponse } = require("./responseController");
const Subcategory = require("../models/subcategoryModel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const slugify = require("slugify");
const { uploadImage, deleteImage } = require("../helper/cloudinaryHelper");

const createSubcategory = async (req, res, next) => {
  try {
    const { name, description, category } = req.body;
    const image = req.file;

    // Check if subcategory name already exists
    const subcategoryExists = await Subcategory.findOne({ name });
    if (subcategoryExists) {
      throw createError(409, "Subcategory already exists");
    }

    // Verify that category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      throw createError(404, "Parent category not found");
    }

    let imageUrl = "";
    if (image) {
      const timestamp = Date.now();
      imageUrl = await uploadImage(
        image,
        "subcategory",
        `${slugify(name).toLowerCase()}-${timestamp}`
      );
    }

    const subcategory = await Subcategory.create({
      name,
      slug: slugify(name),
      description,
      image: imageUrl,
      category,
      productCount: 0,
    });

    // Add subcategory to parent category's subcategories array
    await Category.findByIdAndUpdate(category, {
      $push: { subcategories: subcategory._id },
    });

    return successResponse(res, {
      statusCode: 201,
      message: "Subcategory created successfully",
      payload: { subcategory },
    });
  } catch (error) {
    next(error);
  }
};

const getSubcategories = async (req, res, next) => {
  try {
    const { categoryId } = req.query;
    let query = {};

    if (categoryId) {
      query.category = categoryId;
    }

    const subcategories = await Subcategory.find(query)
      .select("name slug description image category productCount isActive")
      .populate("category", "name slug")
      .lean();

    return successResponse(res, {
      statusCode: 200,
      message: "Subcategories fetched successfully",
      payload: { subcategories },
    });
  } catch (error) {
    next(error);
  }
};

const getSubcategory = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const subcategory = await Subcategory.findOne({ slug })
      .select("name slug description image category productCount isActive")
      .populate("category", "name slug")
      .lean();

    if (!subcategory) {
      throw createError(404, "Subcategory not found");
    }

    return successResponse(res, {
      statusCode: 200,
      message: "Subcategory fetched successfully",
      payload: { subcategory },
    });
  } catch (error) {
    next(error);
  }
};

const updateSubcategory = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { name, description, category } = req.body;
    const image = req.file;

    const subcategory = await Subcategory.findOne({ slug });
    if (!subcategory) {
      throw createError(404, "Subcategory not found");
    }

    let updates = { description };
    const oldCategoryId = subcategory.category;

    // If category is being updated, verify it exists
    if (category && category !== subcategory.category.toString()) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        throw createError(404, "Parent category not found");
      }
      updates.category = category;

      // Remove from old category and add to new category
      await Category.findByIdAndUpdate(oldCategoryId, {
        $pull: { subcategories: subcategory._id },
      });
      await Category.findByIdAndUpdate(category, {
        $push: { subcategories: subcategory._id },
      });
    }

    // Handle name update
    if (name && name !== subcategory.name) {
      const subcategoryExists = await Subcategory.findOne({ name });
      if (subcategoryExists) {
        throw createError(409, "Subcategory with this name already exists");
      }
      updates.name = name;
      updates.slug = slugify(name);
    }

    // Handle image update
    if (image) {
      // Delete old image if exists
      if (subcategory.image) {
        try {
          await deleteImage(subcategory.image);
        } catch (error) {
          console.error("Error deleting old image:", error);
          // Continue with upload even if delete fails
        }
      }

      // Upload new image
      const timestamp = Date.now();
      const imageUrl = await uploadImage(
        image,
        "subcategory",
        `${slugify(name || subcategory.name).toLowerCase()}-${timestamp}`
      );
      updates.image = imageUrl;
    }

    const updatedSubcategory = await Subcategory.findOneAndUpdate(
      { slug },
      updates,
      { new: true }
    ).populate("category", "name slug");

    return successResponse(res, {
      statusCode: 200,
      message: "Subcategory updated successfully",
      payload: { subcategory: updatedSubcategory },
    });
  } catch (error) {
    next(error);
  }
};

const deleteSubcategory = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const subcategory = await Subcategory.findOne({ slug });

    if (!subcategory) {
      throw createError(404, "Subcategory not found");
    }

    // Check if subcategory has products
    const hasProducts = await Product.exists({ subcategory: subcategory._id });
    if (hasProducts) {
      console.log(
        "Subcategory has products and cannot be deleted:",
        subcategory._id
      );
      console.log(hasProducts);
      throw createError(
        400,
        "Cannot delete subcategory with existing products"
      );
    }

    // Remove subcategory from parent category's subcategories array
    await Category.findByIdAndUpdate(subcategory.category, {
      $pull: { subcategories: subcategory._id },
    });

    // Delete image if exists
    if (subcategory.image) {
      try {
        await deleteImage(subcategory.image);
        console.log(
          "Subcategory image deleted from Cloudinary:",
          subcategory.image
        );
      } catch (error) {
        console.error("Error deleting image:", error);
      }
    }

    await Subcategory.findOneAndDelete({ slug });

    return successResponse(res, {
      statusCode: 200,
      message: "Subcategory deleted successfully",
      payload: { subcategory },
    });
  } catch (error) {
    next(error);
  }
};

const recalculateProductCounts = async (req, res, next) => {
  try {
    await Subcategory.recalculateProductCounts();

    const subcategories = await Subcategory.find({})
      .select("name slug description image category productCount isActive")
      .populate("category", "name slug")
      .lean();

    return successResponse(res, {
      statusCode: 200,
      message: "Product counts recalculated successfully",
      payload: { subcategories },
    });
  } catch (error) {
    next(error);
  }
};

const getSubcategoriesByCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;

    // Verify that category exists
    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      throw createError(404, "Category not found");
    }

    const subcategories = await Subcategory.find({ category: categoryId })
      .select("name slug description image category productCount isActive")
      .lean();

    return successResponse(res, {
      statusCode: 200,
      message: "Subcategories fetched successfully",
      payload: { subcategories },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSubcategory,
  getSubcategories,
  getSubcategory,
  updateSubcategory,
  deleteSubcategory,
  recalculateProductCounts,
  getSubcategoriesByCategory,
};
