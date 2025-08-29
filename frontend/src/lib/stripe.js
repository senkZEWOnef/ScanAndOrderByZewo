import { loadStripe } from '@stripe/stripe-js';

// This is your test publishable API key - replace with your actual key
const stripePromise = loadStripe('pk_test_51234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890');

export default stripePromise;