import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Truck, 
  ChevronRight, 
  Loader2, 
  Smartphone, 
  AlertCircle,
  Download,
  ShoppingBag,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '../context/StoreContext';
import { ShippingDetails, PaymentDetails, PaymentMethodType, Order } from '../types';

export const CheckoutModal: React.FC = () => {
  const { 
    isCheckoutOpen, 
    setIsCheckoutOpen, 
    cart, 
    getCartTotal, 
    processCheckout, 
    showToast 
  } = useStore();

  const [currentStep, setCurrentStep] = useState<'shipping' | 'payment' | 'processing' | 'success'>('shipping');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State - Shipping
  const [shippingData, setShippingData] = useState<ShippingDetails>({
    fullName: 'Carlos Mendoza',
    email: 'carlos.mendoza@email.com',
    phone: '+34 612 345 678',
    address: 'Calle Mayor 24, 3º B',
    city: 'Madrid',
    postalCode: '28013',
    country: 'España',
  });

  // Form State - Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('card');
  const [cardNumber, setCardNumber] = useState('4532 8492 1029 4821');
  const [cardHolder, setCardHolder] = useState('CARLOS MENDOZA');
  const [expiryDate, setExpiryDate] = useState('08/28');
  const [cvv, setCvv] = useState('789');
  const [bizumPhone, setBizumPhone] = useState('612345678');

  if (!isCheckoutOpen) return null;

  const { subtotal, discount, shipping, tax, total } = getCartTotal();

  // Helper formatting for card number
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').substring(0, 16);
    const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setCardNumber(formatted);
  };

  // Helper formatting for expiry
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (val.length >= 3) {
      val = `${val.substring(0, 2)}/${val.substring(2, 4)}`;
    }
    setExpiryDate(val);
  };

  // Determine card provider
  const getCardType = () => {
    const clean = cardNumber.replace(/\s/g, '');
    if (clean.startsWith('4')) return 'VISA';
    if (clean.startsWith('5')) return 'Mastercard';
    if (clean.startsWith('3')) return 'AMEX';
    return 'Tarjeta Bancaria';
  };

  const handleNextToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingData.fullName || !shippingData.email || !shippingData.address || !shippingData.city || !shippingData.postalCode) {
      setErrorMessage('Por favor completa todos los campos de entrega obligatorios.');
      return;
    }
    setErrorMessage(null);
    setCurrentStep('payment');
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setCurrentStep('processing');

    const paymentDetails: PaymentDetails = {
      method: paymentMethod,
      cardNumber: paymentMethod === 'card' ? cardNumber : undefined,
      cardHolder: paymentMethod === 'card' ? cardHolder : undefined,
      expiryDate: paymentMethod === 'card' ? expiryDate : undefined,
      cvv: paymentMethod === 'card' ? cvv : undefined,
      bizumPhone: paymentMethod === 'bizum' ? bizumPhone : undefined,
    };

    try {
      const result = await processCheckout(shippingData, paymentDetails);

      if (result.success && result.order) {
        setCompletedOrder(result.order);
        setCurrentStep('success');

        // Confetti Celebration
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#f59e0b', '#10b981', '#6366f1', '#ec4899'],
          });
        } catch {
          // Ignore
        }
      } else {
        setErrorMessage(result.error || 'Error al procesar el pago. Por favor intenta de nuevo.');
        setCurrentStep('payment');
      }
    } catch {
      setErrorMessage('Error en la comunicación con la pasarela bancaria.');
      setCurrentStep('payment');
    }
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setCurrentStep('shipping');
    setCompletedOrder(null);
    setErrorMessage(null);
  };

  return (
    <div 
      id="checkout-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={handleClose}
    >
      <div 
        id="checkout-modal-container"
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-2xl rounded-xl overflow-hidden shadow-2xl border border-[#EEEEEE] relative my-6 animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-white text-[#1A1A1A] p-4 sm:p-5 flex items-center justify-between border-b border-[#EEEEEE]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#F5F5F5] text-[#1A1A1A]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm sm:text-base text-[#1A1A1A]">
                {currentStep === 'success' ? 'Pedido Confirmado' : 'Pasarela de Pago Segura'}
              </h3>
              <p className="text-xs text-[#777777] flex items-center gap-1">
                <Lock className="w-3 h-3 text-[#777777]" />
                Encriptación SSL de 256 bits
              </p>
            </div>
          </div>
          
          <button
            id="close-checkout-modal-btn"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-[#777777] hover:text-[#1A1A1A] hover:bg-[#F5F5F5] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stepper indicator */}
        {currentStep !== 'success' && currentStep !== 'processing' && (
          <div className="bg-[#F9F9F9] px-6 py-2.5 border-b border-[#EEEEEE] flex items-center justify-between text-xs">
            <div className={`flex items-center gap-2 font-medium ${currentStep === 'shipping' ? 'text-[#1A1A1A]' : 'text-[#777777]'}`}>
              <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${currentStep === 'shipping' ? 'bg-black text-white font-semibold' : 'bg-[#EEEEEE] text-[#1A1A1A]'}`}>
                {currentStep === 'payment' ? '✓' : '1'}
              </div>
              <span>1. Entrega</span>
            </div>

            <ChevronRight className="w-3.5 h-3.5 text-[#999999]" />

            <div className={`flex items-center gap-2 font-medium ${currentStep === 'payment' ? 'text-[#1A1A1A]' : 'text-[#777777]'}`}>
              <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${currentStep === 'payment' ? 'bg-black text-white font-semibold' : 'bg-[#EEEEEE] text-[#777777]'}`}>
                2
              </div>
              <span>2. Pago</span>
            </div>
          </div>
        )}

        {/* Error Notification Bar */}
        {errorMessage && (
          <div className="bg-rose-50 border-b border-rose-100 p-3 px-6 flex items-center gap-2 text-xs font-medium text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: SHIPPING DETAILS */}
        {currentStep === 'shipping' && (
          <form onSubmit={handleNextToPayment} className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#EEEEEE]">
              <h4 className="text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-[#777777]" />
                Dirección de Envío y Contacto
              </h4>
              <span className="text-[11px] text-[#777777]">Entrega en 24-48 horas</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#1A1A1A]">Nombre completo *</label>
                <input
                  id="checkout-fullname"
                  type="text"
                  required
                  value={shippingData.fullName}
                  onChange={(e) => setShippingData({ ...shippingData, fullName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#EEEEEE] bg-[#F5F5F5] focus:bg-white focus:border-black focus:outline-none transition-colors"
                  placeholder="Ej. Carlos Mendoza"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#1A1A1A]">Correo electrónico *</label>
                <input
                  id="checkout-email"
                  type="email"
                  required
                  value={shippingData.email}
                  onChange={(e) => setShippingData({ ...shippingData, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#EEEEEE] bg-[#F5F5F5] focus:bg-white focus:border-black focus:outline-none transition-colors"
                  placeholder="nombre@ejemplo.com"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#1A1A1A]">Teléfono móvil *</label>
                <input
                  id="checkout-phone"
                  type="tel"
                  required
                  value={shippingData.phone}
                  onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#EEEEEE] bg-[#F5F5F5] focus:bg-white focus:border-black focus:outline-none transition-colors"
                  placeholder="+34 600 000 000"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#1A1A1A]">Ciudad *</label>
                <input
                  id="checkout-city"
                  type="text"
                  required
                  value={shippingData.city}
                  onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#EEEEEE] bg-[#F5F5F5] focus:bg-white focus:border-black focus:outline-none transition-colors"
                  placeholder="Madrid, Barcelona..."
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-medium text-[#1A1A1A]">Dirección completa *</label>
                <input
                  id="checkout-address"
                  type="text"
                  required
                  value={shippingData.address}
                  onChange={(e) => setShippingData({ ...shippingData, address: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#EEEEEE] bg-[#F5F5F5] focus:bg-white focus:border-black focus:outline-none transition-colors"
                  placeholder="Calle, número, piso..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#1A1A1A]">Código Postal *</label>
                <input
                  id="checkout-postal"
                  type="text"
                  required
                  value={shippingData.postalCode}
                  onChange={(e) => setShippingData({ ...shippingData, postalCode: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#EEEEEE] bg-[#F5F5F5] focus:bg-white focus:border-black focus:outline-none transition-colors"
                  placeholder="28001"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#777777]">País</label>
                <input
                  id="checkout-country"
                  type="text"
                  disabled
                  value={shippingData.country}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#EEEEEE] bg-[#F5F5F5] text-[#777777] font-medium"
                />
              </div>
            </div>

            {/* Total Preview & Next Button */}
            <div className="pt-4 border-t border-[#EEEEEE] flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[#777777] block">Total a pagar</span>
                <span className="text-base sm:text-lg font-semibold text-[#1A1A1A]">{total.toFixed(2)}€</span>
              </div>

              <button
                id="btn-goto-payment"
                type="submit"
                className="px-5 py-2.5 bg-black hover:bg-zinc-800 text-white rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Continuar al Pago</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: PAYMENT GATEWAY */}
        {currentStep === 'payment' && (
          <form onSubmit={handleProcessPayment} className="p-5 sm:p-6 space-y-4">
            
            {/* Method Tabs */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#1A1A1A]">Método de pago:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  id="pay-method-card"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-2.5 rounded-lg border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-[#1A1A1A] border-[#EEEEEE] hover:bg-[#F5F5F5]'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span className="text-xs font-medium">Tarjeta</span>
                </button>

                <button
                  type="button"
                  id="pay-method-bizum"
                  onClick={() => setPaymentMethod('bizum')}
                  className={`p-2.5 rounded-lg border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    paymentMethod === 'bizum'
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-[#1A1A1A] border-[#EEEEEE] hover:bg-[#F5F5F5]'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span className="text-xs font-medium">Bizum</span>
                </button>

                <button
                  type="button"
                  id="pay-method-paypal"
                  onClick={() => setPaymentMethod('paypal')}
                  className={`p-2.5 rounded-lg border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    paymentMethod === 'paypal'
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-[#1A1A1A] border-[#EEEEEE] hover:bg-[#F5F5F5]'
                  }`}
                >
                  <span className="text-sm font-bold italic tracking-tighter">P</span>
                  <span className="text-xs font-medium">PayPal</span>
                </button>
              </div>
            </div>

            {/* Credit Card Interactive Simulator UI */}
            {paymentMethod === 'card' && (
              <div className="space-y-3">
                
                {/* Visual Card Mock */}
                <div className="relative rounded-xl p-4 bg-[#1A1A1A] text-white shadow-md border border-[#333333] overflow-hidden max-w-xs mx-auto">
                  <div className="flex justify-between items-center mb-5">
                    <div className="w-8 h-5 rounded bg-[#444444]" />
                    <span className="text-[11px] font-mono font-medium tracking-wider text-[#999999] uppercase">
                      {getCardType()}
                    </span>
                  </div>

                  <div className="font-mono text-sm tracking-widest text-white mb-3">
                    {cardNumber || '•••• •••• •••• ••••'}
                  </div>

                  <div className="flex justify-between items-end text-[9px] text-[#999999] uppercase tracking-wider">
                    <div>
                      <span className="block text-[7px] text-[#777777]">TITULAR</span>
                      <span className="font-medium text-white truncate max-w-32 block">
                        {cardHolder || 'NOMBRE DEL TITULAR'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[7px] text-[#777777]">CADUCA</span>
                      <span className="font-medium text-white font-mono">
                        {expiryDate || 'MM/AA'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs font-medium text-[#1A1A1A]">Número de Tarjeta</label>
                    <input
                      id="card-number-input"
                      type="text"
                      required
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-[#EEEEEE] bg-[#F5F5F5] focus:bg-white focus:border-black focus:outline-none"
                    />
                  </div>

                  <div className="col-span-2 space-y-1">
                    <label className="text-xs font-medium text-[#1A1A1A]">Nombre en la Tarjeta</label>
                    <input
                      id="card-holder-input"
                      type="text"
                      required
                      placeholder="CARLOS MENDOZA"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#EEEEEE] bg-[#F5F5F5] focus:bg-white focus:border-black focus:outline-none uppercase"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[#1A1A1A]">Fecha Expiración (MM/AA)</label>
                    <input
                      id="card-expiry-input"
                      type="text"
                      required
                      placeholder="MM/AA"
                      value={expiryDate}
                      onChange={handleExpiryChange}
                      className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-[#EEEEEE] bg-[#F5F5F5] focus:bg-white focus:border-black focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[#1A1A1A]">CVV (3 dígitos)</label>
                    <input
                      id="card-cvv-input"
                      type="password"
                      maxLength={4}
                      required
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-[#EEEEEE] bg-[#F5F5F5] focus:bg-white focus:border-black focus:outline-none"
                    />
                  </div>
                </div>

              </div>
            )}

            {/* Bizum Mode */}
            {paymentMethod === 'bizum' && (
              <div className="p-3.5 bg-[#F9F9F9] rounded-lg border border-[#EEEEEE] space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#1A1A1A]">
                  <Smartphone className="w-4 h-4 text-[#777777]" />
                  <span>Pago instantáneo con Bizum</span>
                </div>
                <p className="text-xs text-[#777777]">
                  Introduce tu número de teléfono registrado en Bizum para recibir la notificación de cobro en tu app bancaria.
                </p>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#1A1A1A]">Número de Teléfono</label>
                  <input
                    id="bizum-phone-input"
                    type="tel"
                    value={bizumPhone}
                    onChange={(e) => setBizumPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#EEEEEE] focus:border-black focus:outline-none bg-white"
                  />
                </div>
              </div>
            )}

            {/* PayPal Mode */}
            {paymentMethod === 'paypal' && (
              <div className="p-3.5 bg-[#F9F9F9] rounded-lg border border-[#EEEEEE] space-y-1.5 text-center">
                <p className="text-xs text-[#1A1A1A] font-medium">
                  Serás redirigido a la pasarela de PayPal para autorizar el cargo de <span className="font-semibold">{total.toFixed(2)}€</span> de forma segura.
                </p>
                <div className="text-[11px] text-[#777777]">
                  Protección del comprador PayPal incluida.
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-[#EEEEEE] flex items-center justify-between">
              <button
                type="button"
                id="btn-back-to-shipping"
                onClick={() => setCurrentStep('shipping')}
                className="px-3 py-2 text-xs font-medium text-[#777777] hover:text-[#1A1A1A] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver a entrega</span>
              </button>

              <button
                id="btn-confirm-and-pay"
                type="submit"
                className="px-5 py-2.5 bg-black hover:bg-zinc-800 text-white rounded-lg text-xs font-medium transition-all flex items-center gap-2 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Pagar {total.toFixed(2)}€</span>
              </button>
            </div>

          </form>
        )}

        {/* STEP 3: PROCESSING STATE */}
        {currentStep === 'processing' && (
          <div className="p-10 sm:p-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-[#EEEEEE] border-t-black animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Lock className="w-4 h-4 text-[#1A1A1A]" />
              </div>
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-[#1A1A1A]">Procesando Transacción...</h4>
              <p className="text-xs text-[#777777] max-w-sm">
                Validando inventario en tiempo real y conectando de forma segura con la entidad emisora.
              </p>
            </div>
          </div>
        )}

        {/* STEP 4: SUCCESS RECEIPT */}
        {currentStep === 'success' && completedOrder && (
          <div className="p-5 sm:p-6 space-y-5">
            
            {/* Header Success Badge */}
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#F5F5F5] text-[#1A1A1A] flex items-center justify-center border border-[#EEEEEE]">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-[#1A1A1A]">
                ¡Gracias por tu compra, {completedOrder.shippingDetails.fullName.split(' ')[0]}!
              </h3>
              <p className="text-xs text-[#777777] max-w-md">
                Tu pago ha sido aprobado y el inventario actualizado. Hemos enviado el comprobante a <span className="font-medium text-[#1A1A1A]">{completedOrder.shippingDetails.email}</span>.
              </p>
            </div>

            {/* Receipt Card */}
            <div id="order-receipt-card" className="bg-[#F9F9F9] rounded-xl p-4 border border-[#EEEEEE] space-y-3">
              
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#EEEEEE] text-xs">
                <div>
                  <span className="text-[#777777] block text-[11px]">Nº de Pedido:</span>
                  <span className="font-semibold text-[#1A1A1A] font-mono text-xs">{completedOrder.id}</span>
                </div>
                <div>
                  <span className="text-[#777777] block text-[11px]">Fecha:</span>
                  <span className="font-medium text-[#1A1A1A]">
                    {new Date(completedOrder.date).toLocaleDateString()} &bull; {new Date(completedOrder.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div>
                  <span className="text-[#777777] block text-[11px]">Método:</span>
                  <span className="font-medium text-[#1A1A1A] capitalize">{completedOrder.paymentMethod}</span>
                </div>
              </div>

              {/* Items in receipt */}
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {completedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1">
                    <div className="flex items-center gap-2">
                      <img src={item.productImage} alt={item.productName} className="w-8 h-8 rounded-md object-cover bg-[#F5F5F5] border border-[#EEEEEE]" />
                      <div>
                        <span className="font-medium text-[#1A1A1A] line-clamp-1">{item.productName}</span>
                        <span className="text-[#777777] text-[10px]">Talla: {item.size} &bull; {item.color} &bull; x{item.quantity}</span>
                      </div>
                    </div>
                    <span className="font-semibold text-[#1A1A1A]">{(item.price * item.quantity).toFixed(2)}€</span>
                  </div>
                ))}
              </div>

              {/* Total Calculation breakdown */}
              <div className="pt-2.5 border-t border-[#EEEEEE] space-y-1 text-xs text-[#777777]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{completedOrder.subtotal.toFixed(2)}€</span>
                </div>
                {completedOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Descuento aplicado</span>
                    <span>-{completedOrder.discount.toFixed(2)}€</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Envío</span>
                  <span>{completedOrder.shipping === 0 ? 'Gratis' : `${completedOrder.shipping.toFixed(2)}€`}</span>
                </div>
                <div className="flex justify-between text-xs font-semibold text-[#1A1A1A] pt-2 border-t border-[#EEEEEE]">
                  <span>Total Abonado</span>
                  <span>{completedOrder.total.toFixed(2)}€</span>
                </div>
              </div>

              {/* Shipping Address note */}
              <div className="bg-white p-2.5 rounded-lg border border-[#EEEEEE] text-xs space-y-0.5">
                <span className="font-medium text-[#1A1A1A]">Dirección de Entrega:</span>
                <p className="text-[#777777]">
                  {completedOrder.shippingDetails.address}, {completedOrder.shippingDetails.postalCode} {completedOrder.shippingDetails.city}, {completedOrder.shippingDetails.country}
                </p>
              </div>

            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
              <button
                id="btn-print-receipt"
                onClick={() => window.print()}
                className="px-3.5 py-2 bg-white border border-[#EEEEEE] hover:bg-[#F5F5F5] text-[#1A1A1A] text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Imprimir Recibo</span>
              </button>

              <button
                id="btn-continue-shopping"
                onClick={handleClose}
                className="px-4 py-2 bg-black hover:bg-zinc-800 text-white text-xs font-medium rounded-lg transition-all cursor-pointer"
              >
                Seguir Comprando
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
