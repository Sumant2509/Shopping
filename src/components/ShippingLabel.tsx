'use client';

import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import { Printer, Download, ExternalLink, X, Check, MessageCircle } from 'lucide-react';
import { Order } from '@/lib/types';
import { formatPrice, formatDate } from '@/lib/utils';
import {
  formatOrderStatusWhatsAppMessage,
  createCustomerWhatsAppLink,
} from '@/lib/whatsapp';

interface ShippingLabelProps {
  order: Order;
  onClose?: () => void;
  isModal?: boolean;
}

export function ShippingLabel({ order, onClose, isModal = false }: ShippingLabelProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const barcodeSvgRef = useRef<SVGSVGElement | null>(null);

  // Generate AWB tracking number if not set (standard 14-digit Delhivery AWB format)
  const awbNumber = order.trackingNumber || `1490${order.orderNumber.replace(/[^0-9]/g, '').padEnd(8, '0').slice(-8)}${order.id.replace(/[^0-9]/g, '').padEnd(4, '0').slice(-4)}`;
  const courier = order.courierPartner || 'Delhivery';
  const isCod = order.paymentMethod === 'COD' || order.paymentStatus === 'PENDING';

  // Order & Invoice date formatting
  const orderDateFormatted = new Date(order.createdAt).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).replace(/\//g, '.');

  // Destination hub routing code
  const cityUpper = (order.customer.address.city || 'City').toUpperCase().replace(/\s+/g, '');
  const stateUpper = (order.customer.address.state || 'State').toUpperCase();
  const destCode = `${cityUpper}_${stateUpper.slice(0, 6)}Ward_D (${order.customer.address.state || 'India'})`;

  // Generate QR Code & Barcode on mount
  useEffect(() => {
    // 1. Generate QR code with tracking URL
    const trackingUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/track-order?orderId=${encodeURIComponent(order.orderNumber)}`
      : `https://homewarrior.in/track-order?orderId=${order.orderNumber}`;

    QRCode.toDataURL(trackingUrl, {
      margin: 1,
      width: 130,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error('Failed to generate QR code', err));

    // 2. Generate Barcode (Code128)
    if (barcodeSvgRef.current) {
      try {
        JsBarcode(barcodeSvgRef.current, awbNumber, {
          format: 'CODE128',
          displayValue: false,
          height: 48,
          margin: 0,
          width: 2.1,
          lineColor: '#000000',
        });
      } catch (err) {
        console.error('Failed to generate Barcode', err);
      }
    }
  }, [order, awbNumber]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`${isModal ? 'fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-2 sm:p-4 overflow-y-auto' : ''}`}>
      {/* Container wrapper */}
      <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden print:shadow-none print:m-0 print:p-0 print:max-w-none print:w-full ${isModal ? 'max-h-[96vh] flex flex-col' : ''}`}>
        
        {/* Modal / Page Action Toolbar (Hidden in Print) */}
        <div className="bg-craft-900 text-white px-4 py-3 flex items-center justify-between gap-3 border-b border-craft-800 print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-xs bg-amber-400 text-craft-950 px-2 py-0.5 rounded">
              DELHIVERY SHIPPING LABEL
            </span>
            <span className="text-xs text-craft-300 font-mono">
              #{order.orderNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-amber-500 hover:bg-amber-400 text-craft-950 font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Label (PDF)</span>
            </button>

            <a
              href={createCustomerWhatsAppLink(
                order.customer.phone,
                formatOrderStatusWhatsAppMessage(order, order.orderStatus, awbNumber, courier)
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#1EBE5D] text-gray-950 font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md transition-all active:scale-95"
              title={`Send WhatsApp dispatch update to customer (+91 ${order.customer.phone})`}
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span>WhatsApp Customer</span>
            </a>

            <a
              href={`/admin/orders/${order.id}/label`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-craft-800 hover:bg-craft-700 text-craft-200 text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all"
              title="Open full page in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Fullscreen</span>
            </a>

            {onClose && (
              <button
                onClick={onClose}
                className="text-craft-400 hover:text-white p-1 rounded-lg transition-colors ml-1"
                title="Close preview"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Printable Label Body */}
        <div className="p-3 sm:p-6 overflow-y-auto print:p-0 print:overflow-visible flex-1 bg-white">
          
          {/* THE SHIPPING LABEL AND TAX INVOICE */}
          <div id="printable-shipping-label" className="border-2 border-black bg-white text-black font-sans text-xs leading-normal mx-auto max-w-[700px] print:max-w-none print:w-full print:border-2">
            
            {/* ══════════════════════════════════════════════════════════════════
                SECTION 1: TOP 2-COLUMN GRID (Address & Carrier Routing)
            ══════════════════════════════════════════════════════════════════ */}
            <div className="grid grid-cols-2 border-b-2 border-black">
              
              {/* TOP LEFT: Customer Address & Return Address */}
              <div className="border-r-2 border-black p-3 sm:p-4 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-[13px] tracking-tight">Customer Address</h4>
                  <p className="font-black text-sm sm:text-base mt-0.5 text-black">
                    {order.customer.name}
                  </p>
                  <p className="mt-0.5 font-bold text-[11px] text-gray-800 font-mono">
                    Phone: +91 {order.customer.phone}
                  </p>
                  <div className="mt-1 text-[11px] text-black leading-tight space-y-0.5 font-medium">
                    <p>{order.customer.address.houseNo}</p>
                    <p>{order.customer.address.street}</p>
                    {order.customer.address.landmark && (
                      <p>Landmark: {order.customer.address.landmark}</p>
                    )}
                    <p className="font-bold pt-0.5">
                      {order.customer.address.city}, {order.customer.address.state}, {order.customer.address.pincode}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-black">
                  <p className="font-bold text-[11px]">If undelivered, return to:</p>
                  <p className="font-bold text-xs mt-0.5">Jai Bajrang Fancy (Home-Warrior)</p>
                  <p className="text-[10px] text-black leading-tight mt-0.5">
                    H.no 171, 60 Ward 44 Laxmi Narayan Nagar<br />
                    Udiya Mohalla Khursipar Bhilai<br />
                    Shiv mandir<br />
                    Bhilai, Chhattisgarh, 490011
                  </p>
                  <p className="text-[10px] font-mono mt-0.5 font-bold">
                    Phone: +91 8878112007
                  </p>
                </div>
              </div>

              {/* TOP RIGHT: Payment Mode Banner + Delhivery Routing + QR + Barcode */}
              <div className="flex flex-col">
                {/* Mode of Payment Banner (Black Bar) */}
                <div className="bg-black text-white px-3 py-1.5 font-bold text-xs sm:text-sm tracking-wide text-left flex items-center justify-between">
                  <span>
                    {isCod
                      ? 'COD: Check the payable amount on the app'
                      : 'PREPAID: Do not collect cash'}
                  </span>
                  {isCod && (
                    <span className="font-black text-amber-300 ml-1">
                      (₹{order.totalAmount})
                    </span>
                  )}
                </div>

                {/* Routing & Barcode Content */}
                <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
                  {/* Courier & QR Code */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-xl sm:text-2xl tracking-tight text-black">
                          {courier}
                        </span>
                        <span className="bg-black text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                          Pickup
                        </span>
                      </div>

                      <div className="text-[10px] sm:text-[11px] leading-tight pt-1">
                        <span className="text-gray-700 block text-[9px] uppercase font-bold tracking-wider">Destination Code</span>
                        <strong className="block text-black font-bold">
                          {destCode}
                        </strong>
                      </div>

                      <div className="text-[10px] leading-tight pt-1">
                        <span className="text-gray-700 block text-[9px] uppercase font-bold tracking-wider">Return Code</span>
                        <strong className="block text-black font-bold">
                          490011,4898124
                        </strong>
                      </div>
                    </div>

                    {/* QR Code */}
                    <div className="border border-black p-1 bg-white shrink-0 shadow-sm">
                      {qrCodeUrl ? (
                        <img
                          src={qrCodeUrl}
                          alt="Order QR Code"
                          className="w-20 h-20 sm:w-24 sm:h-24 object-contain"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 animate-pulse flex items-center justify-center text-[10px]">
                          QR
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tracking Number & Barcode (Centered) */}
                  <div className="mt-3 pt-2 text-center">
                    <p className="font-black font-mono text-base sm:text-lg tracking-wider text-black">
                      {awbNumber}
                    </p>
                    <div className="flex justify-center mt-1 overflow-hidden">
                      <svg
                        ref={barcodeSvgRef}
                        className="w-full max-w-[270px] h-11"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════════
                SECTION 2: PRODUCT DETAILS TABLE
            ══════════════════════════════════════════════════════════════════ */}
            <div className="border-b-2 border-black">
              <div className="px-3 py-1 font-black text-xs uppercase tracking-wider">
                Product Details
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-t border-black text-[11px]">
                  <thead>
                    <tr className="border-b border-black font-bold text-black bg-gray-50">
                      <th className="py-1 px-3 border-r border-black w-1/4">SKU</th>
                      <th className="py-1 px-3 border-r border-black w-1/4">Size</th>
                      <th className="py-1 px-3 border-r border-black text-center w-12">Qty</th>
                      <th className="py-1 px-3 border-r border-black w-1/4">Color</th>
                      <th className="py-1 px-3">Order No.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, idx) => {
                      const sku = `SKM-${(item.productId || '44301').replace(/[^0-9]/g, '').padEnd(5, '0').slice(-5)}`;
                      const size = item.dimensions || (item.shape ? `${item.shape} size` : 'Free Size');
                      const color = item.selectedColor || 'Multicolor';

                      return (
                        <tr key={idx} className="border-b border-black last:border-b-0 font-medium">
                          <td className="py-1 px-3 border-r border-black font-mono font-bold">
                            {sku}
                          </td>
                          <td className="py-1 px-3 border-r border-black">
                            {size}
                          </td>
                          <td className="py-1 px-3 border-r border-black text-center font-bold">
                            {item.quantity}
                          </td>
                          <td className="py-1 px-3 border-r border-black">
                            {color}
                          </td>
                          <td className="py-1 px-3 font-mono font-bold">
                            {order.orderNumber}_{idx + 1}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════════
                SECTION 3: BILL OF SUPPLY / COMMERCIAL INVOICE
            ══════════════════════════════════════════════════════════════════ */}
            <div>
              {/* Header Bar */}
              <div className="bg-gray-100 px-3 py-1 flex items-center justify-between font-bold text-xs uppercase border-b border-black">
                <span className="font-black tracking-wide">
                  BILL OF SUPPLY/COMMERCIAL INVOICE
                </span>
                <span className="text-[10px] font-semibold text-gray-700">
                  Original For Recipient
                </span>
              </div>

              {/* Bill To & Sold By (2 columns) */}
              <div className="grid grid-cols-2 border-b border-black text-[10px] leading-tight">
                {/* Left: Bill To / Ship To */}
                <div className="p-2.5 sm:p-3 border-r border-black space-y-0.5">
                  <p className="font-bold text-[11px] uppercase tracking-wider mb-1">
                    BILL TO / SHIP TO
                  </p>
                  <p className="font-black text-xs text-black">{order.customer.name}</p>
                  <p>{order.customer.address.houseNo}, {order.customer.address.street}</p>
                  {order.customer.address.landmark && <p>Landmark: {order.customer.address.landmark}</p>}
                  <p>{order.customer.address.city}, {order.customer.address.state}, {order.customer.address.pincode}</p>
                  <p className="font-bold pt-1">
                    Place of Supply: {order.customer.address.state}
                  </p>
                  <p className="text-gray-700 font-mono">
                    Contact: +91 {order.customer.phone}
                  </p>
                </div>

                {/* Right: Sold By & Invoice Meta */}
                <div className="p-2.5 sm:p-3 space-y-1">
                  <div>
                    <p className="font-bold text-[11px]">
                      Sold by : <span className="font-normal">Devanand Mandal</span>
                    </p>
                    <p className="text-[9.5px] text-gray-800 leading-tight mt-0.5">
                      Jai Bajrang Fancy, H.no 171 60 Ward 33 Udiya Mohalla Khursipar Bhilai , Bhilai, Chhattisgarh, 490011
                    </p>
                    <p className="font-bold text-[10px] mt-0.5">
                      Enrolment No. - 222600027887ES4
                    </p>
                  </div>

                  <div className="grid grid-cols-4 gap-1 text-[9px] pt-1.5 border-t border-gray-300">
                    <div>
                      <span className="text-gray-500 block">Order No.</span>
                      <strong className="font-mono text-black font-bold block truncate">{order.orderNumber}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Invoice No.</span>
                      <strong className="font-mono text-black font-bold block truncate">INV-{order.orderNumber.slice(-8)}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Order Date</span>
                      <strong className="text-black font-bold block">{orderDateFormatted}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Invoice Date</span>
                      <strong className="text-black font-bold block">{orderDateFormatted}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financials Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-black font-bold text-black bg-gray-50">
                      <th className="py-1 px-3 border-r border-black w-1/2">Description</th>
                      <th className="py-1 px-2 border-r border-black text-center w-12">Qty</th>
                      <th className="py-1 px-3 border-r border-black text-right w-24">Gross Amount</th>
                      <th className="py-1 px-3 border-r border-black text-right w-20">Discount</th>
                      <th className="py-1 px-3 text-right w-24">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, idx) => {
                      const gross = item.mrp && item.mrp > item.price ? item.mrp * item.quantity : item.price * item.quantity;
                      const discount = gross - (item.price * item.quantity);
                      const total = item.price * item.quantity;

                      return (
                        <tr key={idx} className="border-b border-black last:border-b-0 font-medium">
                          <td className="py-1 px-3 border-r border-black">
                            {item.name} ({item.shape || 'Flower'} Design) - {item.dimensions || 'Free Size'}
                          </td>
                          <td className="py-1 px-2 border-r border-black text-center">
                            {item.quantity}
                          </td>
                          <td className="py-1 px-3 border-r border-black text-right font-mono">
                            Rs.{gross.toFixed(2)}
                          </td>
                          <td className="py-1 px-3 border-r border-black text-right font-mono text-emerald-800">
                            Rs.{discount.toFixed(2)}
                          </td>
                          <td className="py-1 px-3 text-right font-mono font-bold">
                            Rs.{total.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}

                    {/* Other Charges (Shipping / COD fee) */}
                    <tr className="border-t border-black font-medium text-[10px] bg-gray-50/50">
                      <td className="py-1 px-3 border-r border-black text-gray-700">
                        Other Charges (Logistics / Shipping Fee)
                      </td>
                      <td className="py-1 px-2 border-r border-black text-center text-gray-500">
                        NA
                      </td>
                      <td className="py-1 px-3 border-r border-black text-right font-mono">
                        Rs.{order.shippingFee.toFixed(2)}
                      </td>
                      <td className="py-1 px-3 border-r border-black text-right font-mono">
                        Rs.0.00
                      </td>
                      <td className="py-1 px-3 text-right font-mono font-bold">
                        Rs.{order.shippingFee.toFixed(2)}
                      </td>
                    </tr>

                    {/* Total Row */}
                    <tr className="border-t-2 border-black font-black text-xs bg-gray-100">
                      <td colSpan={4} className="py-1.5 px-3 border-r border-black text-right uppercase tracking-wider">
                        Total
                      </td>
                      <td className="py-1.5 px-3 text-right font-mono text-sm">
                        Rs.{order.totalAmount.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Disclaimer Footer */}
              <div className="p-2 text-[9.5px] leading-tight border-t border-black text-gray-800 bg-gray-50">
                This is a computer generated invoice and does not require signature. Other charges are charges that are applicable to your order and include charges for logistics fee (where applicable). Includes discounts for your city and/or online payments (as applicable).
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
