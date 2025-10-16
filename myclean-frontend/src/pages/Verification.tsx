import React, { useState } from 'react';
import { FaCheckCircle, FaIdCard, FaPhone, FaEnvelope, FaUpload } from 'react-icons/fa';
import Card from '../components/Card';

const Verification: React.FC = () => {
  const [emailVerified] = useState(true); // Auto verified on signup
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneVerificationCode, setPhoneVerificationCode] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [phoneCodeSent, setPhoneCodeSent] = useState(false);
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [idSubmitted, setIdSubmitted] = useState(false);

  const handleSendPhoneCode = () => {
    // Send verification code to phone
    console.log('Sending code to:', phoneNumber);
    setPhoneCodeSent(true);
  };

  const handleVerifyPhone = () => {
    // Verify the code
    console.log('Verifying code:', phoneVerificationCode);
    setPhoneVerified(true);
  };

  const handleIdUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idDocument) return;
    
    console.log('Uploading ID document:', idDocument);
    setIdSubmitted(true);
  };

  const verificationSteps = [
    { id: 1, title: 'Email Verification', verified: emailVerified },
    { id: 2, title: 'Phone Verification', verified: phoneVerified },
    { id: 3, title: 'ID Verification', verified: idSubmitted },
  ];

  const completedSteps = verificationSteps.filter(step => step.verified).length;
  const progress = (completedSteps / verificationSteps.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Verification</h1>
        <p className="text-gray-600 mb-6">
          Complete these verification steps to build trust with customers and unlock all features.
        </p>

        {/* Progress Bar */}
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Verification Progress</span>
            <span className="text-sm font-medium text-blue-600">{completedSteps} of {verificationSteps.length} completed</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </Card>

        {/* Verification Steps */}
        <div className="space-y-6">
          {/* Email Verification */}
          <Card>
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-full ${emailVerified ? 'bg-green-100' : 'bg-gray-100'}`}>
                <FaEnvelope className={`text-2xl ${emailVerified ? 'text-green-600' : 'text-gray-400'}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">Email Verification</h3>
                  {emailVerified && (
                    <span className="flex items-center text-green-600 font-medium">
                      <FaCheckCircle className="mr-1" /> Verified
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-4">
                  Verify your email address to receive important notifications and booking updates.
                </p>
                {emailVerified ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800">✓ Your email has been verified successfully!</p>
                  </div>
                ) : (
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Resend Verification Email
                  </button>
                )}
              </div>
            </div>
          </Card>

          {/* Phone Verification */}
          <Card>
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-full ${phoneVerified ? 'bg-green-100' : 'bg-gray-100'}`}>
                <FaPhone className={`text-2xl ${phoneVerified ? 'text-green-600' : 'text-gray-400'}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">Phone Verification</h3>
                  {phoneVerified && (
                    <span className="flex items-center text-green-600 font-medium">
                      <FaCheckCircle className="mr-1" /> Verified
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-4">
                  Verify your phone number to enable SMS notifications and build customer trust.
                </p>
                
                {!phoneVerified && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="+61 4XX XXX XXX"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          onClick={handleSendPhoneCode}
                          disabled={!phoneNumber || phoneCodeSent}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {phoneCodeSent ? 'Code Sent' : 'Send Code'}
                        </button>
                      </div>
                    </div>

                    {phoneCodeSent && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Verification Code
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={phoneVerificationCode}
                            onChange={(e) => setPhoneVerificationCode(e.target.value)}
                            placeholder="Enter 6-digit code"
                            maxLength={6}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            onClick={handleVerifyPhone}
                            disabled={phoneVerificationCode.length !== 6}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Verify
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {phoneVerified && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800">✓ Your phone number has been verified successfully!</p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* ID Verification */}
          <Card>
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-full ${idSubmitted ? 'bg-green-100' : 'bg-gray-100'}`}>
                <FaIdCard className={`text-2xl ${idSubmitted ? 'text-green-600' : 'text-gray-400'}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">ID Verification</h3>
                  {idSubmitted && (
                    <span className="flex items-center text-yellow-600 font-medium">
                      <FaCheckCircle className="mr-1" /> Under Review
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-4">
                  Upload a government-issued ID to become a verified provider. This builds customer confidence.
                </p>
                
                {!idSubmitted && (
                  <form onSubmit={handleIdUpload} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload ID Document
                      </label>
                      <p className="text-xs text-gray-500 mb-2">
                        Accepted: Driver's License, Passport, National ID Card
                      </p>
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <FaUpload className="text-gray-400 text-3xl mb-2" />
                            <p className="text-sm text-gray-600">
                              {idDocument ? idDocument.name : 'Click to upload or drag and drop'}
                            </p>
                            <p className="text-xs text-gray-500">PNG, JPG, PDF (MAX. 10MB)</p>
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*,.pdf"
                            onChange={(e) => setIdDocument(e.target.files?.[0] || null)}
                          />
                        </label>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!idDocument}
                      className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      Submit for Verification
                    </button>
                  </form>
                )}
                
                {idSubmitted && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800 font-medium mb-1">
                      ⏳ Document Under Review
                    </p>
                    <p className="text-xs text-yellow-700">
                      Your ID document is being reviewed. This usually takes 24-48 hours. We'll notify you via email once complete.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Benefits Card */}
        <Card className="mt-6 bg-blue-50 border border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-3">Benefits of Full Verification</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <FaCheckCircle className="text-blue-600 mr-2 mt-0.5" />
              <span>Get a "Verified Provider" badge on your profile</span>
            </li>
            <li className="flex items-start">
              <FaCheckCircle className="text-blue-600 mr-2 mt-0.5" />
              <span>Appear higher in search results</span>
            </li>
            <li className="flex items-start">
              <FaCheckCircle className="text-blue-600 mr-2 mt-0.5" />
              <span>Build trust with potential customers</span>
            </li>
            <li className="flex items-start">
              <FaCheckCircle className="text-blue-600 mr-2 mt-0.5" />
              <span>Access premium features and promotions</span>
            </li>
            <li className="flex items-start">
              <FaCheckCircle className="text-blue-600 mr-2 mt-0.5" />
              <span>Increase your booking rate by up to 40%</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default Verification;

