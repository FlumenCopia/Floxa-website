// src/components/client/PaymentButton.tsx
// Handles Razorpay checkout for client portal payments
'use client';
import { useState, useEffect } from 'react';
import { paymentService } from '@/services/paymentService';
export function PaymentButton({ projectId, paymentType, amount, projectName, token, onSuccess, disabled }) {
    const [loading, setLoading] = useState(false);
    const [scriptLoaded, setScript] = useState(false);
    // Load Razorpay script
    useEffect(() => {
        if (window.Razorpay) {
            setScript(true);
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => setScript(true);
        script.onerror = () => console.error('Razorpay script failed to load');
        document.body.appendChild(script);
    }, []);
    async function handlePay() {
        if (!scriptLoaded) {
            alert('Payment system loading. Please try again.');
            return;
        }
        setLoading(true);
        try {
            // Step 1: Create order
            const orderData = await paymentService.createOrder({ projectId, paymentType, token });
            if (!orderData.success || !orderData.data) {
                alert('Failed to create payment order. Please try again.');
                setLoading(false);
                return;
            }
            const order = orderData.data;
            // Step 2: Open Razorpay modal
            const rzp = new window.Razorpay({
                key: order.keyId,
                order_id: order.orderId,
                amount: order.amount,
                currency: 'INR',
                name: 'FLOXA',
                description: `${paymentType.charAt(0).toUpperCase() + paymentType.slice(1)} payment — ${projectName}`,
                image: '/assets/floxa-logo-white.svg',
                theme: { color: '#1C342E' },
                modal: {
                    ondismiss: () => setLoading(false),
                },
                handler: async (response) => {
                    // Step 3: Verify payment
                    const verifyData = await paymentService.verifyRazorpay({
                        ...response,
                        projectId,
                        paymentType,
                    });
                    if (verifyData.success) {
                        onSuccess();
                    }
                    else {
                        alert('Payment verification failed. Please contact support.');
                    }
                    setLoading(false);
                },
            });
            rzp.on('payment.failed', (response) => {
                console.error('Razorpay payment failed:', response.error);
                alert(`Payment failed: ${response.error.description}`);
                setLoading(false);
            });
            rzp.open();
        }
        catch (err) {
            console.error('Payment error:', err);
            alert('Something went wrong. Please try again.');
            setLoading(false);
        }
    }
    const labelMap = { advance: 'Pay Advance', mid: 'Pay Mid-point', final: 'Pay Final & Unlock Files' };
    return (<button onClick={handlePay} disabled={disabled || loading || !scriptLoaded} style={{
            padding: '14px 32px',
            borderRadius: '32px',
            background: 'linear-gradient(135deg, rgba(28,52,46,0.9), rgba(10,30,20,0.9))',
            border: '1px solid rgba(77,255,160,0.35)',
            color: '#4DFFA0',
            fontFamily: "'Jost',sans-serif",
            fontSize: '14px',
            fontWeight: 600,
            cursor: (disabled || loading) ? 'not-allowed' : 'pointer',
            opacity: (disabled || loading) ? 0.6 : 1,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            letterSpacing: '.04em',
            transition: 'all .28s',
        }}>
      {loading ? (<>Processing...</>) : (<>{labelMap[paymentType]} — ₹{amount.toLocaleString('en-IN')} →</>)}
    </button>);
}
