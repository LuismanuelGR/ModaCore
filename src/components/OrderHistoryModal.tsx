import React from 'react';
import { X, PackageCheck, Download, Calendar, MapPin, CreditCard, ChevronRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const OrderHistoryModal: React.FC = () => {
  const { isOrderHistoryOpen, setIsOrderHistoryOpen, orders } = useStore();

  if (!isOrderHistoryOpen) return null;

  return (
    <div 
      id="orders-history-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={() => setIsOrderHistoryOpen(false)}
    >
      <div 
        id="orders-history-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-3xl max-h-[85vh] rounded-xl overflow-hidden shadow-2xl border border-[#EEEEEE] flex flex-col my-4"
      >
        {/* Header */}
        <div className="p-4 bg-white text-[#1A1A1A] flex items-center justify-between border-b border-[#EEEEEE] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#F5F5F5] text-[#1A1A1A] border border-[#EEEEEE]">
              <PackageCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[#1A1A1A]">Historial de Pedidos</h3>
              <p className="text-xs text-[#777777]">{orders.length} pedidos registrados</p>
            </div>
          </div>
          <button
            onClick={() => setIsOrderHistoryOpen(false)}
            className="p-1.5 rounded-lg text-[#777777] hover:text-[#1A1A1A] hover:bg-[#F5F5F5] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3 bg-[#F9F9F9]">
          {orders.length === 0 ? (
            <div className="text-center py-12 space-y-3 bg-white rounded-lg border border-[#EEEEEE] p-6">
              <div className="w-10 h-10 rounded-full bg-[#F5F5F5] text-[#777777] flex items-center justify-center mx-auto">
                <PackageCheck className="w-5 h-5" />
              </div>
              <p className="text-xs font-medium text-[#1A1A1A]">No tienes pedidos realizados todavía.</p>
              <p className="text-[11px] text-[#777777]">Cuando realices compras mediante la pasarela de pagos, se guardarán aquí con su comprobante.</p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg p-4 border border-[#EEEEEE] space-y-3 shadow-xs"
              >
                {/* Order Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#EEEEEE] text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium text-[#1A1A1A] text-xs">{order.id}</span>
                    <span className="bg-[#F5F5F5] text-[#1A1A1A] border border-[#EEEEEE] font-medium px-2 py-0.5 rounded text-[10px] uppercase">
                      {order.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-[#777777] text-xs">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Calendar className="w-3 h-3" />
                      {new Date(order.date).toLocaleDateString()} {new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="font-semibold text-[#1A1A1A] text-xs">
                      {order.total.toFixed(2)}€
                    </span>
                  </div>
                </div>

                {/* Items in order */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 p-2 bg-[#F9F9F9] rounded-lg border border-[#EEEEEE]">
                      <img src={item.productImage} alt={item.productName} className="w-9 h-9 rounded object-cover bg-white border border-[#EEEEEE]" />
                      <div className="text-xs flex-1 min-w-0">
                        <span className="font-medium text-[#1A1A1A] block truncate text-[11px]">{item.productName}</span>
                        <span className="text-[#777777] text-[10px]">Talla {item.size} &bull; {item.color} &bull; x{item.quantity}</span>
                      </div>
                      <span className="font-medium text-[#1A1A1A] text-xs">{(item.price * item.quantity).toFixed(2)}€</span>
                    </div>
                  ))}
                </div>

                {/* Shipping & Payment summary */}
                <div className="flex flex-wrap items-center justify-between text-[11px] text-[#777777] pt-2 border-t border-[#EEEEEE]">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#999999]" />
                    <span>{order.shippingDetails.city}, {order.shippingDetails.country}</span>
                  </div>
                  <div className="flex items-center gap-1 font-normal capitalize">
                    <CreditCard className="w-3 h-3 text-[#999999]" />
                    <span>Pago con {order.paymentMethod}</span>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="text-[#1A1A1A] hover:underline font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3 h-3" /> Imprimir Recibo
                  </button>
                </div>

              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
