import React, { useEffect, useState } from 'react';
import { Order, OrderStatus } from '../../types';
import { db } from '../../services/mockDatabase';
import { OrderStatusBadge } from '../../components/StatusBadge';
import { Filter, Eye, AlertCircle } from 'lucide-react';

interface Props {
  onViewOrder: (orderId: string) => void;
}

const SellerDashboard: React.FC<Props> = ({ onViewOrder }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    // Seller role in DB fetches all orders
    db.getOrders({ role: 'SELLER' } as any).then(setOrders);
  }, []);

  const filteredOrders = filter === 'ALL' 
    ? orders 
    : orders.filter(o => o.status === filter);

  const stats = {
    new: orders.filter(o => o.status === OrderStatus.NEW).length,
    active: orders.filter(o => [OrderStatus.UNDER_CHECK, OrderStatus.APPROVED, OrderStatus.ASSEMBLING].includes(o.status)).length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
            <p className="text-gray-500 text-sm">New Requests</p>
            <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-purple-100">
            <p className="text-gray-500 text-sm">Processing</p>
            <p className="text-2xl font-bold text-purple-600">{stats.active}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Filter size={16} className="text-gray-400" />
        {['ALL', OrderStatus.NEW, OrderStatus.APPROVED, OrderStatus.TO_DRIVER].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === status 
                ? 'bg-gray-800 text-white' 
                : 'bg-white border text-gray-600 hover:bg-gray-50'
            }`}
          >
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">Client</th>
                <th className="p-4">Title</th>
                <th className="p-4">Items</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="p-4 text-sm text-gray-600">
                    {new Date(order.requestDate).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-sm font-medium text-gray-900">
                    {order.createdByName}
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-gray-900">{order.title}</p>
                    {order.comment && (
                      <span className="flex items-center gap-1 text-xs text-orange-600 mt-1">
                        <AlertCircle size={10} /> Comment
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {order.items.length} items
                  </td>
                  <td className="p-4">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="p-4">
                    <button 
                      onClick={() => onViewOrder(order.id)}
                      className="px-3 py-1.5 bg-white border border-gray-200 hover:border-blue-500 hover:text-blue-600 rounded-md text-sm font-medium transition-colors"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;