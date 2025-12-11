import React from 'react';
import { OrderStatus, StockStatus } from '../types';

export const OrderStatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
  const colors = {
    [OrderStatus.NEW]: 'bg-blue-100 text-blue-800',
    [OrderStatus.UNDER_CHECK]: 'bg-yellow-100 text-yellow-800',
    [OrderStatus.APPROVED]: 'bg-green-100 text-green-800',
    [OrderStatus.ASSEMBLING]: 'bg-purple-100 text-purple-800',
    [OrderStatus.TO_DRIVER]: 'bg-indigo-100 text-indigo-800',
    [OrderStatus.ON_DELIVERY]: 'bg-orange-100 text-orange-800',
    [OrderStatus.DELIVERED]: 'bg-emerald-100 text-emerald-800',
    [OrderStatus.CANCELLED]: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100'}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

export const StockStatusBadge: React.FC<{ status: StockStatus }> = ({ status }) => {
  const colors = {
    [StockStatus.UNKNOWN]: 'bg-gray-100 text-gray-600',
    [StockStatus.IN_STOCK]: 'bg-green-100 text-green-800',
    [StockStatus.NEED_TO_PURCHASE]: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${colors[status]}`}>
      {status === StockStatus.NEED_TO_PURCHASE ? 'BUY' : status.replace('_', ' ')}
    </span>
  );
};