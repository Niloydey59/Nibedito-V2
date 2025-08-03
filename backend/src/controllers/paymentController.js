const { Order } = require("../models/orderModel");
const createError = require("http-errors");
const { successResponse } = require("./responseController");
const Payment = require("../models/paymentModel");

// Process a new payment
const processPayment = async (req, res, next) => {
    try {
        const { orderId, paymentMethod } = req.body;

        // Validate order exists
        const order = await Order.findById(orderId);
        if (!order) {
            throw createError(404, "Order not found");
        }

        // Check if payment already exists
        if (order.isPaid) {
            throw createError(400, "This order has already been paid");
        }

        // Create or update payment
        let payment;
        if (order.payment) {
            // Update existing payment
            payment = await Payment.findByIdAndUpdate(
                order.payment,
                {
                    paymentMethod,
                    amount: order.finalPrice,
                    status: "Completed",
                },
                { new: true }
            );
        } else {
            // Create new payment
            payment = new Payment({
                order: orderId,
                paymentMethod,
                amount: order.finalPrice,
                status: "Completed",
            });
            await payment.save();

            // Update order with payment reference
            order.payment = payment._id;
        }

        // Update order payment status
        order.isPaid = true;
        order.paidAt = Date.now();
        await order.save();

        return successResponse(res, {
            statusCode: 200,
            message: "Payment processed successfully",
            payload: payment,
        });
    } catch (error) {
        next(error);
    }
};

// Get payment details by ID (admin only)
const getPaymentById = async (req, res, next) => {
    try {
        const payment = await Payment.findById(req.params.id).populate({
            path: "order",
            select: "user items finalPrice status",
            populate: {
                path: "user",
                select: "name email",
            },
        });

        if (!payment) {
            throw createError(404, "Payment not found");
        }

        return successResponse(res, {
            statusCode: 200,
            message: "Payment retrieved successfully",
            payload: payment,
        });
    } catch (error) {
        next(error);
    }
};

// Get all payments (admin only)
const getAllPayments = async (req, res, next) => {
    try {
        const { status, startDate, endDate } = req.query;

        // Build query object
        const query = {};
        if (status) query.status = status;

        // Add date range filter if provided
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const payments = await Payment.find(query)
            .populate({
                path: "order",
                select: "user finalPrice status",
                populate: {
                    path: "user",
                    select: "name email",
                },
            })
            .sort({ createdAt: -1 });

        if (!payments.length) {
            throw createError(404, "No payments found");
        }

        return successResponse(res, {
            statusCode: 200,
            message: "Payments retrieved successfully",
            payload: payments,
        });
    } catch (error) {
        next(error);
    }
};

// Get payments by user ID (for logged-in user)
const getUserPayments = async (req, res, next) => {
    try {
        const userId = req.user._id;

        // Find orders for this user first
        const userOrders = await Order.find({ user: userId }).select("_id");
        const orderIds = userOrders.map((order) => order._id);

        // Then find payments for these orders
        const payments = await Payment.find({ order: { $in: orderIds } })
            .populate({
                path: "order",
                select: "finalPrice status createdAt items",
            })
            .sort({ createdAt: -1 });

        if (!payments.length) {
            throw createError(404, "No payments found for this user");
        }

        return successResponse(res, {
            statusCode: 200,
            message: "User payments retrieved successfully",
            payload: payments,
        });
    } catch (error) {
        next(error);
    }
};

// Update payment status (admin only)
const updatePaymentStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        const payment = await Payment.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        ).populate("order");

        if (!payment) {
            throw createError(404, "Payment not found");
        }

        // If payment is now "Refunded", update refundedAt date
        if (status === "Refunded") {
            payment.refundedAt = Date.now();
            await payment.save();

            // Also update order status if necessary
            if (payment.order) {
                const order = await Order.findById(payment.order._id);
                if (order) {
                    order.status = "Cancelled"; // Or any appropriate status for refunds
                    await order.save();
                }
            }
        }

        return successResponse(res, {
            statusCode: 200,
            message: "Payment status updated successfully",
            payload: payment,
        });
    } catch (error) {
        next(error);
    }
};

// Cancel payment (admin only)
const cancelPayment = async (req, res, next) => {
    try {
        const payment = await Payment.findById(req.params.id);

        if (!payment) {
            throw createError(404, "Payment not found");
        }

        if (payment.status === "Refunded") {
            throw createError(400, "Payment has already been refunded");
        }

        // Update payment status to refunded
        payment.status = "Refunded";
        payment.refundedAt = Date.now();
        await payment.save();

        // Update associated order if exists
        if (payment.order) {
            const order = await Order.findById(payment.order);
            if (order) {
                order.status = "Cancelled";
                await order.save();
            }
        }

        return successResponse(res, {
            statusCode: 200,
            message: "Payment cancelled and refunded successfully",
            payload: payment,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    processPayment,
    getPaymentById,
    getAllPayments,
    getUserPayments,
    updatePaymentStatus,
    cancelPayment,
};
