import React, { useEffect, useMemo, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import axios from 'axios';
import Card from '../../components/Card';
import { useLocation, useNavigate } from 'react-router-dom';

interface BookingSummary {
  id: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  service: { name: string };
  provider: { name: string };
  address: string;
  city: string;
}

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '');

const Payment: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const bookingIdParam = params.get('bookingId');
  const bookingId = bookingIdParam ? Number(bookingIdParam) : null;
  const [booking, setBooking] = useState<BookingSummary | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) return;
    const loadBooking = async () => {
      try {
        const response = await axios.get(`/api/bookings/${bookingId}`);
        setBooking(response.data.booking);
      } catch (err) {
        console.error('Failed to load booking', err);
        setError('Unable to load booking details.');
      }
    };
    loadBooking();
  }, [bookingId]);

  useEffect(() => {
    if (!bookingId) return;
    const createIntent = async () => {
      try {
        const response = await axios.post('/api/stripe/create-payment-intent', {
          bookingId,
        });
        setClientSecret(response.data.clientSecret);
      } catch (err) {
        console.error('Create intent failed', err);
        setError('Unable to initialise payment.');
      }
    };
    createIntent();
  }, [bookingId]);

  const elementsOptions = useMemo(() => ({
    clientSecret: clientSecret || undefined,
    appearance: { theme: 'stripe' as const },
  }), [clientSecret]);

  if (!bookingId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <p className="text-gray-700">Missing booking ID. Please start payment from your bookings list.</p>
        </Card>
      </div>
    );
  }

  if (!stripePromise) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <p className="text-gray-700">Stripe publishable key is not configured.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Complete Payment</h1>
          <p className="text-gray-600">Securely pay for your booking below.</p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}
        {statusMessage && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">{statusMessage}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Summary</h2>
            {booking ? (
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Cleaner</p>
                  <p className="text-gray-900 font-medium">{booking.provider?.name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Service</p>
                  <p className="text-gray-900 font-medium">{booking.service?.name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Date & Time</p>
                  <p className="text-gray-900 font-medium">
                    {new Date(booking.bookingDate).toLocaleDateString()} · {booking.startTime} - {booking.endTime}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Address</p>
                  <p className="text-gray-900 font-medium">{booking.address}, {booking.city}</p>
                </div>
                <div className="border-t pt-3">
                  <p className="text-gray-500">Total</p>
                  <p className="text-2xl font-bold text-blue-600">${(booking.totalPrice / 100).toFixed(2)}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Loading booking info…</p>
            )}
          </Card>

          <Card>
            {!clientSecret ? (
              <p className="text-gray-500">Preparing payment form…</p>
            ) : (
              <Elements stripe={stripePromise} options={elementsOptions}>
                <CheckoutForm onStatus={setStatusMessage} bookingId={bookingId} onError={setError} onSuccess={() => navigate('/my-bookings')} />
              </Elements>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

interface CheckoutProps {
  bookingId: number;
  onStatus: (message: string | null) => void;
  onError: (message: string | null) => void;
  onSuccess: () => void;
}

const CheckoutForm: React.FC<CheckoutProps> = ({ bookingId, onStatus, onError, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    onStatus(null);
    onError(null);
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/my-bookings`,
      },
    });

    if (result.error) {
      onError(result.error.message || 'Payment failed.');
      setSubmitting(false);
      return;
    }

    const paymentIntent = (result as { paymentIntent?: { status?: string } }).paymentIntent;
    if (paymentIntent?.status === 'succeeded') {
      onStatus('Payment successful!');
      onSuccess();
    } else {
      onStatus('Payment submitted. Awaiting confirmation.');
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <button
        type="submit"
        disabled={submitting || !stripe}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
      >
        {submitting ? 'Processing…' : 'Pay now'}
      </button>
      <p className="text-xs text-gray-500 text-center">Secured by Stripe</p>
    </form>
  );
};

export default Payment;
