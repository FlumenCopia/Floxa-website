import { apiClient } from './apiClient';
export const paymentService = {
    createOrder(data) {
        return apiClient.post('/client-portal/payments/orders/', data, { auth: false });
    },
    verifyRazorpay(data) {
        return apiClient.post('/payments/razorpay/verify/', data, { auth: false });
    },
};
