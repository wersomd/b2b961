import React, { useEffect, useState } from 'react';
import { Order, User } from '../../types';
import { db } from '../../services/mockDatabase';
import { OrderStatusBadge } from '../../components/StatusBadge';
import { Calendar, MapPin, ChevronRight, Eye } from 'lucide-react';

interface Props {
  user: User;
  onViewOrder: (orderId: string) => void;
}

const MyOrders: React.FC<Props> = ({ user, onViewOrder }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.getOrders(user).then(data => {
      setOrders(data);
      setLoading(false);
    });
  }, [user]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading orders...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">My Orders</h2>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No orders found. Create your first order!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-600 text-sm">
                <tr>
                  <th className="p-4 font-medium">Order Details</th>
                  <th className="p-4 font-medium">Delivery</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <p className="font-semibold text-gray-900">{order.title}</p>
                      <p className="text-xs text-gray-500 mt-1">ID: {order.id.toUpperCase()}</p>
                      {order.projectName && (
                        <p className="text-xs text-blue-700 font-semibold mt-1">{order.projectName}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                        <Calendar size={14} />
                        {new Date(order.requestDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <MapPin size={14} className="mt-1 flex-shrink-0" />
                        <span className="truncate max-w-xs">{order.deliveryAddress}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 ml-6">
                        Due: {new Date(order.deliveryDate).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="p-4">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => onViewOrder(order.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;