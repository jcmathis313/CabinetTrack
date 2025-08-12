import React from 'react';
import { OrderStatus, OrderPriority, PickupStatus, PickupPriority } from '../types';

interface StatusBadgeProps {
  type: 'status' | 'priority';
  value: OrderStatus | OrderPriority | PickupStatus | PickupPriority;
  size?: 'sm' | 'md' | 'lg';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value, size = 'md' }) => {
  const getStatusColor = (status: OrderStatus | PickupStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
      case PickupStatus.SCHEDULED:
        return 'bg-gray-100 text-gray-800';
      case OrderStatus.IN_PROGRESS:
      case PickupStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800';
      case OrderStatus.READY_FOR_PICKUP:
        return 'bg-yellow-100 text-yellow-800';
      case OrderStatus.PICKED_UP:
        return 'bg-orange-100 text-orange-800';
      case OrderStatus.IN_TRANSIT:
        return 'bg-purple-100 text-purple-800';
      case OrderStatus.DELIVERED:
      case PickupStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case OrderStatus.CANCELLED:
      case PickupStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      case PickupStatus.ARCHIVED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: OrderPriority | PickupPriority) => {
    switch (priority) {
      case OrderPriority.LOW:
      case PickupPriority.LOW:
        return 'bg-gray-100 text-gray-800';
      case OrderPriority.STANDARD:
      case PickupPriority.STANDARD:
        return 'bg-blue-100 text-blue-800';
      case OrderPriority.HIGH:
      case PickupPriority.HIGH:
        return 'bg-orange-100 text-orange-800';
      case OrderPriority.URGENT:
      case PickupPriority.URGENT:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-3 py-1.5 text-sm';
      default:
        return 'px-2.5 py-1 text-xs';
    }
  };

  const formatValue = (val: string) => {
    return val.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const colorClass = type === 'status' 
    ? getStatusColor(value as OrderStatus | PickupStatus)
    : getPriorityColor(value as OrderPriority | PickupPriority);

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${colorClass} ${getSizeClasses()}`}>
      {formatValue(value)}
    </span>
  );
};

export default StatusBadge;
