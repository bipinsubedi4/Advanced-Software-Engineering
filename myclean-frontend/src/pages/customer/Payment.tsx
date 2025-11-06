import React, { useState } from 'react';
import { FaCreditCard, FaLock, FaCheckCircle } from 'react-icons/fa';
import Card from '../../components/Card';

const Payment: React.FC = () => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'afterpay'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [saveCard, setSaveCard] = useState(false);

  // Mock booking details
  const booking = {
    providerName: 'Sarah Johnson',
    service: 'Deep Cleaning',
    date: 'January 25, 2024',
    time: '10:00 AM',
    duration: 3,
    hourlyRate: 45,
    subtotal: 135,
    serviceFee: 10,
    total: 145,
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle payment processing
    console.log('Processing payment...');
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Secure Payment</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <Card>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Payment Method</h2>
                
                <div className="space-y-3">
                  <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === 'card' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-blue-300'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'card')}
                      className="h-4 w-4 text-blue-600"
                    />
                    <FaCreditCard className="ml-3 mr-2 text-gray-600" />
                    <span className="font-medium">Credit/Debit Card</span>
                  </label>

                  <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === 'afterpay' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-blue-300'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="afterpay"
                      checked={paymentMethod === 'afterpay'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'afterpay')}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="ml-3 font-medium">Afterpay</span>
                    <span className="ml-2 text-sm text-gray-600">Pay in 4 installments</span>
                  </label>
                </div>
              </div>

              {paymentMethod === 'card' && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                        placeholder="MM/YY"
                        maxLength={5}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="123"
                        maxLength={4}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="John Smith"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="saveCard"
                      checked={saveCard}
                      onChange={(e) => setSaveCard(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="saveCard" className="ml-2 text-sm text-gray-700">
                      Save this card for future bookings
                    </label>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
                    <FaLock className="text-blue-600 mr-3 mt-1" />
                    <div>
                      <p className="text-sm text-blue-900 font-medium">Secure Payment</p>
                      <p className="text-xs text-blue-700 mt-1">
                        Your payment information is encrypted and secure. We never store your full card details.
                      </p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg flex items-center justify-center"
                  >
                    <FaLock className="mr-2" />
                    Pay ${booking.total}
                  </button>
                </form>
              )}

              {paymentMethod === 'afterpay' && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-mint-100 to-mint-50 border border-mint-300 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Pay in 4 interest-free installments</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Today:</span>
                        <span className="font-semibold">${(booking.total / 4).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>In 2 weeks:</span>
                        <span className="font-semibold">${(booking.total / 4).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>In 4 weeks:</span>
                        <span className="font-semibold">${(booking.total / 4).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>In 6 weeks:</span>
                        <span className="font-semibold">${(booking.total / 4).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="w-full bg-mint-600 text-white py-4 rounded-lg hover:bg-mint-700 transition-colors font-medium text-lg"
                  >
                    Continue with Afterpay
                  </button>
                </div>
              )}
            </Card>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Summary</h2>
              
              <div className="space-y-3 pb-4 border-b border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Provider:</span>
                  <span className="font-medium">{booking.providerName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium">{booking.service}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{booking.date}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">{booking.time}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{booking.duration} hours</span>
                </div>
              </div>

              <div className="space-y-2 mt-4 pb-4 border-b border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">${booking.subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service Fee:</span>
                  <span className="font-medium">${booking.serviceFee}</span>
                </div>
              </div>

              <div className="flex justify-between mt-4">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-2xl font-bold text-blue-600">${booking.total}</span>
              </div>

              <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <FaCheckCircle className="text-green-600 mr-2 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-green-900">Payment Protection</p>
                    <p className="text-xs text-green-700 mt-1">
                      Your payment is held securely and only released to the provider after service completion.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;

