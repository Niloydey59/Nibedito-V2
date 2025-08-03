const mongoose = require('mongoose');

// name, slug, description, image, category, productCount, isActive
const subcategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Subcategory name is required'],
        trim: true,
        minlength: [3, 'Subcategory name must be at least 3 characters'],
        maxlength: [100, 'Subcategory name cannot exceed 100 characters']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        required: false,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    image: {
        type: String,
        required: false
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Parent category is required']
    },
    productCount: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Add static method to recalculate product counts
subcategorySchema.statics.recalculateProductCounts = async function() {
    const subcategories = await this.find({});
    const Product = mongoose.model('Product');
    
    for (const subcategory of subcategories) {
        const count = await Product.countDocuments({ subcategory: subcategory._id });
        await this.findByIdAndUpdate(subcategory._id, { productCount: count });
    }
};

const Subcategory = mongoose.model('Subcategory', subcategorySchema);
module.exports = Subcategory; 