import React, { useEffect, useState } from 'react';
import { Order, OrderStatus, StockStatus, User } from '../../types';
import { db } from '../../services/mockDatabase';
import { MapPin, Box, ArrowRight, CheckCircle, Navigation } from 'lucide-react';
import { OrderStatusBadge } from '../../components/StatusBadge';

interface Props {
  user: User;
}

const DriverDashboard: React.FC<Props> = ({ user }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    db.getOrders(user).then(data => {
      setOrders(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    await db.updateOrder(orderId, { status });
    fetchOrders();
  };

  if (loading) return <div className="p-8 text-center">Loading route...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <Navigation className="text-blue-600" /> My Deliveries
      </h2>

      {orders.length === 0 ? (
        <div className="bg-white p-8 rounded-xl text-center text-gray-500 shadow-sm">
            No active deliveries assigned.
        </div>
      ) : (
        orders.map(order => (
            <div key={order.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                {/* Header */}
                <div className="bg-gray-50 p-4 border-b flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-lg text-gray-800">{order.title}</h3>
                        <div className="flex items-center gap-1 text-gray-600 mt-1">
                            <MapPin size={16} className="text-red-500" />
                            {order.deliveryAddress}
                        </div>
                    </div>
                    <OrderStatusBadge status={order.status} />
                </div>

                {/* Logistics */}
                <div className="p-4">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Load Manifest</h4>
                    <div className="space-y-3 mb-6">
                        {order.items.map(item => (
                            <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <div>
                                    <span className="font-bold text-gray-800">{item.quantity} x {item.productName}</span>
                                    {item.sellerComment && <p className="text-xs text-orange-600 mt-1">Note: {item.sellerComment}</p>}
                                </div>
                                <div className={`text-xs font-bold px-3 py-1 rounded uppercase ${
                                    item.stockStatus === StockStatus.IN_STOCK 
                                    ? 'bg-blue-100 text-blue-700' 
                                    : 'bg-purple-100 text-purple-700'
                                }`}>
                                    {item.stockStatus === StockStatus.IN_STOCK ? 'Warehouse' : 'Supplier'}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2 border-t">
                        {order.status === OrderStatus.TO_DRIVER && (
                            <button 
                                onClick={() => updateStatus(order.id, OrderStatus.ON_DELIVERY)}
                                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 flex justify-center items-center gap-2"
                            >
                                <ArrowRight /> Start Delivery
                            </button>
                        )}
                        {order.status === OrderStatus.ON_DELIVERY && (
                            <button 
                                onClick={() => updateStatus(order.id, OrderStatus.DELIVERED)}
                                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 flex justify-center items-center gap-2"
                            >
                                <CheckCircle /> Mark Delivered
                            </button>
                        )}
                        {order.status === OrderStatus.DELIVERED && (
                            <div className="w-full text-center text-green-600 font-bold py-2 bg-green-50 rounded-lg">
                                Completed
                            </div>
                        )}
                    </div>
                </div>
            </div>
        ))
      )}
    </div>
  );
};

export default DriverDashboard;