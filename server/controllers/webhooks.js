import Stripe from "stripe";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import mongoose from 'mongoose';

export const stripeWebhooks = async (request, response) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const sig = request.headers['stripe-signature'];

    console.log('Received webhook event');

    let event;

    try {
        // Get the raw body as a buffer
        const rawBody = request.rawBody || request.body;
        event = stripe.webhooks.constructEvent(
            rawBody,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
        console.log('Webhook event verified:', event.type);
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return response.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        // Handle the checkout.session.completed event
        if (event.type === 'checkout.session.completed') {
            console.log('Processing checkout.session.completed event');
            const session = event.data.object;
            const { transactionId, appId } = session.metadata || {};

            console.log('Session metadata:', { transactionId, appId });

            if (appId !== 'quickgpt') {
                console.error('Invalid app ID in webhook');
                return response.status(400).json({ received: false, message: 'Invalid app ID' });
            }

            if (!transactionId) {
                console.error('No transaction ID in metadata');
                return response.status(400).json({ received: false, message: 'No transaction ID' });
            }

            // Start a session for transaction
            const sessionDb = await mongoose.startSession();
            sessionDb.startTransaction();

            try {
                // Retrieve the transaction with session
                const transaction = await Transaction.findOne({
                    _id: transactionId,
                    isPaid: false
                }).session(sessionDb);

                if (!transaction) {
                    console.log('Transaction not found or already processed:', transactionId);
                    await sessionDb.abortTransaction();
                    return response.json({ received: true, message: 'Transaction not found or already processed' });
                }

                console.log('Found transaction:', transaction);

                // Update user credits with session
                const updatedUser = await User.findByIdAndUpdate(
                    transaction.userId,
                    { $inc: { credits: transaction.credits } },
                    { 
                        new: true, 
                        select: '-password',
                        session: sessionDb
                    }
                );

                if (!updatedUser) {
                    console.error('User not found for transaction:', transactionId);
                    await sessionDb.abortTransaction();
                    return response.status(404).json({ error: 'User not found' });
                }

                console.log('Updated user credits:', {
                    userId: updatedUser._id,
                    oldCredits: updatedUser.credits - transaction.credits,
                    newCredits: updatedUser.credits,
                    addedCredits: transaction.credits
                });

                // Update transaction status
                transaction.isPaid = true;
                transaction.paymentId = session.payment_intent;
                transaction.completedAt = new Date();
                await transaction.save({ session: sessionDb });

                // Commit the transaction
                await sessionDb.commitTransaction();
                console.log('Successfully processed payment for user:', updatedUser._id);

                return response.json({ 
                    success: true, 
                    message: 'Payment processed successfully',
                    userId: updatedUser._id,
                    creditsAdded: transaction.credits,
                    newBalance: updatedUser.credits
                });

            } catch (error) {
                await sessionDb.abortTransaction();
                throw error;
            } finally {
                sessionDb.endSession();
            }
        }

        console.log(`Unhandled event type: ${event.type}`);
        response.json({ received: true, message: `Unhandled event type: ${event.type}` });

    } catch (error) {
        console.error('Webhook processing error:', error);
        response.status(500).json({ 
            error: 'Internal server error',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};