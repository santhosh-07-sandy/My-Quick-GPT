import mongoose from 'mongoose';
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import Stripe from 'stripe';

// Validate environment variables
if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY is not defined in environment variables');
    process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Credit plans configuration
const PLANS = [
    {
        _id: "basic",
        name: "Basic",
        price: 10,
        credits: 100,
        features: [
            '100 text generations',
            '50 image generations',
            'Standard support',
            'Access to basic models'
        ]
    },
    {
        _id: "pro",
        name: "Pro",
        price: 20,
        credits: 500,
        features: [
            '500 text generations',
            '200 image generations',
            'Priority support',
            'Access to pro models',
            'Faster response time'
        ]
    },
    {
        _id: "premium",
        name: "Premium",
        price: 30,
        credits: 1000,
        features: [
            '1000 text generations',
            '500 image generations',
            '24/7 VIP support',
            'Access to premium models',
            'Dedicated account manager'
        ]
    }
];

// Helper function to find a plan by ID
const findPlanById = (planId) => PLANS.find(plan => plan._id === planId);

/**
 * @desc    Get all available credit plans
 * @route   GET /api/credit/plans
 * @access  Public
 */
export const getPlans = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            count: PLANS.length,
            plans: PLANS
        });
    } catch (error) {
        console.error('Error in getPlans:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch plans',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Purchase a credit plan
 * @route   POST /api/credit/purchase
 * @access  Private
 */
export const purchasePlan = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { planId } = req.body;
        const userId = req.user?._id;

        // Input validation
        if (!planId) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Plan ID is required"
            });
        }

        if (!userId) {
            await session.abortTransaction();
            return res.status(401).json({
                success: false,
                message: "User not authenticated"
            });
        }

        const plan = findPlanById(planId);
        if (!plan) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: "Plan not found"
            });
        }

        // Create transaction record
        const [transaction] = await Transaction.create([{
            userId,
            planId: plan._id,
            planName: plan.name,
            amount: plan.price,
            credits: plan.credits,
            status: 'pending',
            isPaid: false
        }], { session });

        if (!transaction) {
            throw new Error('Failed to create transaction record');
        }

        const { origin } = req.headers;
        if (!origin) {
            throw new Error('Origin header is required for redirect URLs');
        }

        // Create Stripe checkout session
        const sessionOptions = {
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `${plan.name} Plan`,
                        description: `${plan.credits} credits`,
                        metadata: {
                            plan_id: plan._id
                        }
                    },
                    unit_amount: Math.round(plan.price * 100), // Convert to cents
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${origin}/credits?payment=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/credits?payment=cancelled`,
            metadata: {
                transactionId: transaction._id.toString(),
                appId: 'quickgpt',
                userId: userId.toString(),
                planId: plan._id,
                credits: plan.credits
            },
            payment_intent_data: {
                metadata: {
                    transactionId: transaction._id.toString(),
                    userId: userId.toString()
                }
            },
            expires_at: Math.floor(Date.now() / 1000) + 1800, // 30 minutes
            customer_email: req.user.email,
            client_reference_id: userId.toString(),
        };

        const stripeSession = await stripe.checkout.sessions.create(sessionOptions);

        // Update transaction with Stripe session ID
        transaction.stripeSessionId = stripeSession.id;
        await transaction.save({ session });

        await session.commitTransaction();
        console.log(`Transaction ${transaction._id} created successfully`);

        res.status(200).json({
            success: true,
            url: stripeSession.url,
            sessionId: stripeSession.id,
            transactionId: transaction._id
        });

    } catch (error) {
        console.error('Error in purchasePlan:', {
            error: error.message,
            stack: error.stack,
            userId: req.user?._id,
            planId: req.body?.planId
        });

        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        const statusCode = error.type === 'StripeInvalidRequestError' ? 400 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || 'Failed to process payment',
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    } finally {
        await session.endSession();
    }
};

/**
 * @desc    Verify a payment
 * @route   POST /api/credit/verify
 * @access  Private
 */
export const verifyPayment = async (req, res) => {
    try {
        const { sessionId } = req.body;
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['payment_intent']
        });

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        if (session.payment_status === 'paid') {
            const transactionId = session.metadata?.transactionId || session.payment_intent?.metadata?.transactionId;
            const transaction = await Transaction.findById(transactionId);
            
            if (transaction && !transaction.isPaid) {
                // Manually fulfill the transaction if the webhook didn't catch it
                transaction.isPaid = true;
                transaction.paymentId = session.payment_intent?.id || session.payment_intent;
                transaction.completedAt = new Date();
                await transaction.save();

                await User.findByIdAndUpdate(transaction.userId, { $inc: { credits: transaction.credits } });
                
                return res.json({ 
                    success: true, 
                    message: 'Payment verified and credits updated successfully',
                    paymentStatus: session.payment_status
                });
            }
            return res.json({ 
                success: true, 
                message: 'Payment verified successfully (already processed)',
                paymentStatus: session.payment_status
            });
        }

        res.json({
            success: false,
            message: 'Payment not completed',
            paymentStatus: session.payment_status
        });
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify payment',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};