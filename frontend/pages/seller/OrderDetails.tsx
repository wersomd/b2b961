import React, { useEffect, useState } from 'react';
import { Order, OrderItem, OrderStatus, StockStatus } from '../../types';
import { db } from '../../services/mockDatabase';
import { OrderStatusBadge, StockStatusBadge } from '../../components/StatusBadge';
import { ArrowLeft, Save, Truck, CheckCircle } from 'lucide-react';

interface Props {
  orderId: string;
  onBack: () => void;
}

const OrderDetails: React.FC<Props> = ({ orderId, onBack }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    db.getOrderById(orderId).then(data => {
      setOrder(data || null);
      setLoading(false);
    });
  }, [orderId]);

  const handleStatusChange = (newStatus: OrderStatus) => {
    if (order) setOrder({ ...order, status: newStatus });
  };

  const handleItemChange = (itemId: string, field: keyof OrderItem, value: any) => {
    if (!order) return;
    const newItems = order.items.map(item => 
      item.id === itemId ? { ...item, [field]: value } : item
    );
    setOrder({ ...order, items: newItems });
  };

  const handleSave = async () => {
    if (!order) return;
    setSaving(true);
    await db.updateOrder(order.id, {
      status: order.status,
      items: order.items
    });
    setSaving(false);
    onBack();
  };

  if (loading || !order) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <button onClick={onBack} className="flex items-center text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft size={18} className="mr-2" /> Back to Orders
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            {order.title}
            <OrderStatusBadge status={order.status} />
          </h1>
          <p className="text-gray-500 mt-1">
            Created by {order.createdByName} on {new Date(order.requestDate).toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-500 mt-1">Delivery: {order.deliveryAddress} ({new Date(order.deliveryDate).toLocaleDateString()})</p>
        </div>

        <div className="flex items-center gap-3">
            <select 
                value={order.status}
                onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                className="p-2 border rounded-lg bg-gray-50 font-medium"
            >
                {Object.values(OrderStatus).map(s => (
                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
            </select>
            <button 
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
                <Save size={18} />
                {saving ? 'Saving...' : 'Save Changes'}
            </button>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 border-b">
                <tr>
                    <th className="p-4 w-1/3">Product</th>
                    <th className="p-4 w-24">Qty</th>
                    <th className="p-4 w-40">Stock Status</th>
                    <th className="p-4">Seller Comment</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {order.items.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-900">{item.productName}</td>
                        <td className="p-4 text-gray-600">{item.quantity}</td>
                        <td className="p-4">
                            <select
                                value={item.stockStatus}
                                onChange={(e) => handleItemChange(item.id, 'stockStatus', e.target.value)}
                                className={`w-full p-2 rounded border text-sm font-medium ${
                                    item.stockStatus === StockStatus.IN_STOCK ? 'bg-green-50 border-green-200 text-green-800' :
                                    item.stockStatus === StockStatus.NEED_TO_PURCHASE ? 'bg-red-50 border-red-200 text-red-800' :
                                    'bg-gray-50 text-gray-600'
                                }`}
                            >
                                <option value={StockStatus.UNKNOWN}>Unknown</option>
                                <option value={StockStatus.IN_STOCK}>In Stock</option>
                                <option value={StockStatus.NEED_TO_PURCHASE}>Need Purchase</option>
                            </select>
                        </td>
                        <td className="p-4">
                            <input 
                                type="text" 
                                value={item.sellerComment || ''}
                                onChange={(e) => handleItemChange(item.id, 'sellerComment', e.target.value)}
                                placeholder="Add note (e.g. from Supplier X)"
                                className="w-full p-2 border rounded-md text-sm"
                            />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderDetails;