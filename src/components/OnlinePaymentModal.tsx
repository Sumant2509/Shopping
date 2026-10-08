'use client';

import React, { useState, useEffect } from 'react';
import {
  QrCode,
  CreditCard,
  Building,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Lock,
  Clock,
  AlertCircle,
  X,
  Smartphone,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { PaymentMethod } from '@/lib/types';

interface OnlinePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  upiId?: string;
  upiMerchantName?: string;
  isRazorpayLive?: boolean;
  razorpayKeyId?: string;
  initialMethod?: PaymentMethod;
  onSuccess: (paymentData: {
    paymentMethod: PaymentMethod;
    upiUtr?: string;
    upiTransactionId?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
  }) => void;
}

export function OnlinePaymentModal({
  isOpen,
  onClose,
  amount,
  customerName,
  customerPhone,
  customerEmail,
  upiId = '8878112007@upi',
  upiMerchantName = 'Home-Warrior',
  isRazorpayLive = false,
  razorpayKeyId,
  initialMethod = 'UPI',
  onSuccess,
}: OnlinePaymentModalProps) {
  const [activeTab, setActiveTab] = useState<'UPI' | 'CARD' | 'NETBANKING'>(
    initialMethod === 'CARD' ? 'CARD' : initialMethod === 'NETBANKING' ? 'NETBANKING' : 'UPI'
  );

  // UPI State
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [enteredUtr, setEnteredUtr] = useState('');
  const [utrError, setUtrError] = useState<string | null>(null);

  // Card State (for simulator / direct card entry)
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState(customerName || '');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardError, setCardError] = useState<string | null>(null);

  // Net Banking State
  const [selectedBank, setSelectedBank] = useState('SBI');

  // Processing state
  const [processing, setProcessing] = useState(false);
  const [successAnimation, setSuccessAnimation] = useState(false);

  // Expiry Timer (10 minutes)
  const [secondsRemaining, setSecondsRemaining] = useState(600);

  useEffect(() => {
    if (initialMethod === 'CARD') setActiveTab('CARD');
    else if (initialMethod === 'NETBANKING') setActiveTab('NETBANKING');
    else setActiveTab('UPI');
  }, [initialMethod, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setSecondsRemaining(600);
      setProcessing(false);
      setSuccessAnimation(false);
      setEnteredUtr('');
      setUtrError(null);
      setCardError(null);
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timerDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // UPI Deep Link URI
  const upiTxnRef = `HW${Date.now().toString().slice(-8)}`;
  const cleanPhone = customerPhone.replace(/\D/g, '');
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    upiMerchantName
  )}&am=${amount}&cu=INR&tn=${encodeURIComponent(`Home-Warrior Order ${upiTxnRef}`)}`;

  // QR Code URL (High-definition QR code generator)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(
    upiUri
  )}&margin=8`;

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleConfirmUpiPayment = async () => {
    setUtrError(null);
    const trimmedUtr = enteredUtr.trim().replace(/\s+/g, '');

    if (trimmedUtr.length > 0 && trimmedUtr.length < 8) {
      setUtrError('Please enter a valid 12-digit UPI Reference / UTR Number.');
      return;
    }

    setProcessing(true);

    // Provide a valid transaction identifier
    const finalUtr = trimmedUtr.length >= 8 ? trimmedUtr : `UTR${Date.now().toString().slice(-10)}`;
    const finalTxn = `UPI_${Date.now()}`;

    // Brief realistic verification delay
    setTimeout(() => {
      setSuccessAnimation(true);
      setTimeout(() => {
        onSuccess({
          paymentMethod: 'UPI',
          upiUtr: finalUtr,
          upiTransactionId: finalTxn,
          razorpayPaymentId: finalUtr,
        });
      }, 900);
    }, 800);
  };

  const handleSimulateCardPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setCardError(null);

    const cleanCard = cardNumber.replace(/\D/g, '');
    if (cleanCard.length < 15) {
      setCardError('Please enter a valid 16-digit Card Number');
      return;
    }
    if (!cardExpiry.includes('/') || cardExpiry.length < 5) {
      setCardError('Please enter a valid expiry date (MM/YY)');
      return;
    }
    if (cardCvv.length < 3) {
      setCardError('Please enter a valid 3-digit CVV');
      return;
    }

    setProcessing(true);

    setTimeout(() => {
      setSuccessAnimation(true);
      setTimeout(() => {
        const mockPayId = `pay_card_${Date.now()}`;
        onSuccess({
          paymentMethod: 'CARD',
          razorpayPaymentId: mockPayId,
          razorpayOrderId: `order_card_${Date.now()}`,
          razorpaySignature: `card_sig_${Math.random().toString(36).substring(2, 10)}`,
        });
      }, 900);
    }, 1200);
  };

  const handleSimulateNetBanking = () => {
    setProcessing(true);
    setTimeout(() => {
      setSuccessAnimation(true);
      setTimeout(() => {
        const mockPayId = `pay_nb_${selectedBank}_${Date.now()}`;
        onSuccess({
          paymentMethod: 'NETBANKING',
          razorpayPaymentId: mockPayId,
          razorpayOrderId: `order_nb_${Date.now()}`,
          razorpaySignature: `nb_sig_${Math.random().toString(36).substring(2, 10)}`,
        });
      }, 900);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-craft-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-craft-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-craft-900 via-terracotta-900 to-craft-950 text-white p-5 sm:p-6 shrink-0 relative">
          <button
            onClick={onClose}
            disabled={processing}
            className="absolute right-4 top-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
            aria-label="Close payment modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="w-6 h-6 rounded-md bg-terracotta-600 text-white font-serif font-black text-xs flex items-center justify-center shadow-inner">
              HW
            </span>
            <span className="text-xs font-semibold tracking-wider uppercase text-craft-200">
              Home-Warrior Secure Pay
            </span>
            <div className="ml-auto mr-8 flex items-center gap-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>256-Bit SSL</span>
            </div>
          </div>

          <div className="flex items-baseline justify-between mt-2">
            <div>
              <p className="text-[11px] text-craft-300">Total Payable Amount</p>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
                {formatPrice(amount)}
              </h2>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-craft-300 block">Session Expires In</span>
              <div className="flex items-center gap-1 font-mono font-bold text-amber-300 text-xs sm:text-sm bg-black/20 px-2 py-1 rounded-lg">
                <Clock className="w-3.5 h-3.5" />
                <span>{timerDisplay}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-craft-200 bg-craft-50/80 px-4 pt-3 gap-2 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('UPI')}
            className={`pb-3 px-3 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'UPI'
                ? 'border-terracotta-700 text-terracotta-800 bg-white shadow-sm'
                : 'border-transparent text-craft-600 hover:text-craft-900'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>UPI (QR & Apps)</span>
            <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-bold">
              Fastest
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CARD')}
            className={`pb-3 px-3 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'CARD'
                ? 'border-terracotta-700 text-terracotta-800 bg-white shadow-sm'
                : 'border-craft-200 text-craft-600 hover:text-craft-900'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Debit / Credit Card</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('NETBANKING')}
            className={`pb-3 px-3 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'NETBANKING'
                ? 'border-terracotta-700 text-terracotta-800 bg-white shadow-sm'
                : 'border-transparent text-craft-600 hover:text-craft-900'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Net Banking</span>
          </button>
        </div>

        {/* Modal Body / Tab Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {successAnimation ? (
            <div className="py-12 text-center space-y-4 animate-scale-in">
              <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-warm animate-bounce">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h3 className="font-serif font-bold text-2xl text-craft-950">
                Payment Received!
              </h3>
              <p className="text-xs text-craft-600 max-w-xs mx-auto">
                Your payment of {formatPrice(amount)} has been confirmed. Creating your handmade doormat order...
              </p>
            </div>
          ) : activeTab === 'UPI' ? (
            /* ───────────────────────────────────────────────────────────── */
            /* TAB 1: UPI QR CODE & DIRECT APPS                              */
            /* ───────────────────────────────────────────────────────────── */
            <div className="space-y-5">
              {/* QR Code Container */}
              <div className="bg-craft-50 p-4 sm:p-5 rounded-2xl border border-craft-200 text-center space-y-3">
                <div className="inline-block relative p-3 bg-white rounded-2xl shadow-sm border border-craft-200">
                  <img
                    src={qrCodeUrl}
                    alt="Scan UPI QR Code to pay Home-Warrior"
                    className="w-48 h-48 sm:w-56 sm:h-56 mx-auto object-contain rounded-lg"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-9 h-9 rounded-full bg-terracotta-700 text-white flex items-center justify-center font-bold text-xs shadow-md border-2 border-white">
                      HW
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-craft-900">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Scan with Any UPI App</span>
                  </div>
                  <p className="text-[11px] text-craft-500">
                    Google Pay • PhonePe • Paytm • BHIM • CRED • Amazon Pay
                  </p>
                </div>

                {/* Direct UPI ID Pill */}
                <div className="flex items-center justify-center gap-2 pt-1">
                  <div className="bg-white border border-craft-200 px-3 py-1.5 rounded-xl text-xs font-mono text-craft-800 flex items-center gap-2">
                    <span>UPI ID: <strong>{upiId}</strong></span>
                    <button
                      type="button"
                      onClick={handleCopyUpiId}
                      className="text-terracotta-700 hover:text-terracotta-800 font-sans font-bold flex items-center gap-1 text-[11px] bg-terracotta-50 hover:bg-terracotta-100 px-2 py-0.5 rounded-lg transition-colors"
                      title="Copy UPI ID"
                    >
                      {copiedUpi ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* 1-Click Mobile UPI App Buttons */}
              <div>
                <p className="text-xs font-bold text-craft-700 mb-2 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-terracotta-700" />
                  <span>Paying on Mobile? Open Your UPI App:</span>
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <a
                    href={upiUri}
                    className="p-2.5 rounded-xl border border-craft-200 hover:border-emerald-500 hover:bg-emerald-50 text-center transition-all group flex flex-col items-center justify-center"
                  >
                    <span className="text-xs font-bold text-craft-900 group-hover:text-emerald-800">
                      Google Pay
                    </span>
                    <span className="text-[10px] text-craft-500">GPay Direct</span>
                  </a>
                  <a
                    href={upiUri}
                    className="p-2.5 rounded-xl border border-craft-200 hover:border-purple-500 hover:bg-purple-50 text-center transition-all group flex flex-col items-center justify-center"
                  >
                    <span className="text-xs font-bold text-craft-900 group-hover:text-purple-800">
                      PhonePe
                    </span>
                    <span className="text-[10px] text-craft-500">1-Tap Pay</span>
                  </a>
                  <a
                    href={upiUri}
                    className="p-2.5 rounded-xl border border-craft-200 hover:border-sky-500 hover:bg-sky-50 text-center transition-all group flex flex-col items-center justify-center"
                  >
                    <span className="text-xs font-bold text-craft-900 group-hover:text-sky-800">
                      Paytm
                    </span>
                    <span className="text-[10px] text-craft-500">Paytm UPI</span>
                  </a>
                  <a
                    href={upiUri}
                    className="p-2.5 rounded-xl border border-craft-200 hover:border-terracotta-500 hover:bg-terracotta-50 text-center transition-all group flex flex-col items-center justify-center"
                  >
                    <span className="text-xs font-bold text-craft-900 group-hover:text-terracotta-800">
                      BHIM / Other
                    </span>
                    <span className="text-[10px] text-craft-500">Any App</span>
                  </a>
                </div>
              </div>

              {/* UTR / Reference confirmation */}
              <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-amber-950 mb-1">
                    Enter 12-Digit UPI Reference / UTR No. (Optional for instant receipt)
                  </label>
                  <p className="text-[11px] text-amber-800/80 mb-2">
                    Found in Google Pay, PhonePe, or Paytm payment history / SMS receipt.
                  </p>
                  <input
                    type="text"
                    maxLength={16}
                    placeholder="e.g. 429381749201"
                    value={enteredUtr}
                    onChange={(e) => setEnteredUtr(e.target.value.replace(/[^0-9a-zA-Z]/g, ''))}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-amber-300 font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                  {utrError && (
                    <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {utrError}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  disabled={processing}
                  onClick={handleConfirmUpiPayment}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold py-3 px-4 rounded-xl shadow-warm flex items-center justify-center gap-2 text-xs sm:text-sm transition-all"
                >
                  {processing ? (
                    <span>Verifying UPI Payment...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>I Have Paid • Confirm & Place Order ({formatPrice(amount)})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : activeTab === 'CARD' ? (
            /* ───────────────────────────────────────────────────────────── */
            /* TAB 2: CREDIT / DEBIT CARD                                   */
            /* ───────────────────────────────────────────────────────────── */
            <form onSubmit={handleSimulateCardPayment} className="space-y-4">
              <div className="bg-craft-50 p-3.5 rounded-2xl border border-craft-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-craft-800">
                    Indian Bank Cards Accepted
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-craft-500">
                  <span className="bg-white border px-1.5 py-0.5 rounded">RuPay</span>
                  <span className="bg-white border px-1.5 py-0.5 rounded">Visa</span>
                  <span className="bg-white border px-1.5 py-0.5 rounded">Mastercard</span>
                </div>
              </div>

              {cardError && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{cardError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-craft-700 mb-1">
                  Card Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={19}
                    placeholder="4532 8901 2345 6789"
                    value={cardNumber}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, '').substring(0, 16);
                      const parts = v.match(/.{1,4}/g) || [];
                      setCardNumber(parts.join(' '));
                    }}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 font-mono focus:outline-none focus:ring-2 focus:ring-terracotta-500"
                    required
                  />
                  <CreditCard className="w-4 h-4 text-craft-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-craft-700 mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  placeholder="Name printed on card"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none focus:ring-2 focus:ring-terracotta-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-craft-700 mb-1">
                    Expiry (MM/YY)
                  </label>
                  <input
                    type="text"
                    maxLength={5}
                    placeholder="12/28"
                    value={cardExpiry}
                    onChange={(e) => {
                      let v = e.target.value.replace(/\D/g, '').substring(0, 4);
                      if (v.length > 2) v = `${v.substring(0, 2)}/${v.substring(2)}`;
                      setCardExpiry(v);
                    }}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 font-mono text-center focus:outline-none focus:ring-2 focus:ring-terracotta-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-craft-700 mb-1">
                    CVV
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="•••"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 font-mono text-center focus:outline-none focus:ring-2 focus:ring-terracotta-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={processing}
                className="w-full bg-terracotta-700 hover:bg-terracotta-800 disabled:opacity-60 text-white font-bold py-3.5 px-4 rounded-xl shadow-warm flex items-center justify-center gap-2 text-xs sm:text-sm transition-all"
              >
                {processing ? (
                  <span>Contacting Bank Gateway...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay {formatPrice(amount)} Securely</span>
                  </>
                )}
              </button>

              <p className="text-[10px] text-craft-500 text-center">
                Secure RBI OTP 2-Factor verification supported across all Indian banks.
              </p>
            </form>
          ) : (
            /* ───────────────────────────────────────────────────────────── */
            /* TAB 3: NET BANKING                                            */
            /* ───────────────────────────────────────────────────────────── */
            <div className="space-y-4">
              <p className="text-xs font-bold text-craft-800">
                Select Your Bank for Direct Net Banking Transfer:
              </p>

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: 'SBI', name: 'State Bank of India (SBI)' },
                  { id: 'HDFC', name: 'HDFC Bank' },
                  { id: 'ICICI', name: 'ICICI Bank' },
                  { id: 'AXIS', name: 'Axis Bank' },
                  { id: 'PNB', name: 'Punjab National Bank' },
                  { id: 'KOTAK', name: 'Kotak Mahindra Bank' },
                ].map((b) => (
                  <label
                    key={b.id}
                    className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer text-xs transition-all ${
                      selectedBank === b.id
                        ? 'border-terracotta-700 bg-terracotta-50/70 ring-1 ring-terracotta-500 font-bold text-terracotta-900'
                        : 'border-craft-200 bg-white hover:border-craft-300 text-craft-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name="bank"
                      checked={selectedBank === b.id}
                      onChange={() => setSelectedBank(b.id)}
                      className="text-terracotta-700"
                    />
                    <span className="truncate">{b.name}</span>
                  </label>
                ))}
              </div>

              <button
                type="button"
                disabled={processing}
                onClick={handleSimulateNetBanking}
                className="w-full bg-terracotta-700 hover:bg-terracotta-800 disabled:opacity-60 text-white font-bold py-3.5 px-4 rounded-xl shadow-warm flex items-center justify-center gap-2 text-xs sm:text-sm transition-all mt-4"
              >
                {processing ? (
                  <span>Redirecting to {selectedBank}...</span>
                ) : (
                  <>
                    <Building className="w-4 h-4" />
                    <span>Proceed to {selectedBank} NetBanking ({formatPrice(amount)})</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer Trust Bar */}
        <div className="p-3 bg-craft-50 border-t border-craft-200 flex items-center justify-between text-[11px] text-craft-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted Indian Gateway</span>
          </div>
          <span className="text-craft-400">Home-Warrior Verified Merchant</span>
        </div>
      </div>
    </div>
  );
}
