import React, { useState } from 'react';
import { Edit, Trash2, ChevronUp, ChevronDown, Search } from 'lucide-react';
import { Order, OrderStatus, OrderPriority } from '../types';
import { useOrder } from '../contexts/OrderContext';
import OrderForm from './OrderForm';
import OrderDetailsModal from './OrderDetailsModal';
import StatusBadge from './StatusBadge';

interface OrdersTableProps {
  orders: Order[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  pickupFilter: string;
  setPickupFilter: (pickup: string) => void;
}

type SortField = keyof Order;
type SortDirection = 'asc' | 'desc';

const OrdersTable: React.FC<OrdersTableProps> = ({ 
  orders, 
  searchTerm, 
  setSearchTerm, 
  statusFilter, 
  setStatusFilter, 
  pickupFilter, 
  setPickupFilter 
}) => {
  const { deleteOrder, Sources, designers, pickups } = useOrder();
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('edit');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedOrders = [...orders].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    // Handle undefined values
    if (aValue === undefined && bValue === undefined) return 0;
    if (aValue === undefined) return sortDirection === 'asc' ? -1 : 1;
    if (bValue === undefined) return sortDirection === 'asc' ? 1 : -1;
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleDeleteOrder = async (orderId: string) => {
    if (confirm('Are you sure you want to delete this order?')) {
      try {
        await deleteOrder(orderId);
      } catch (error) {
        console.error('Error deleting order:', error);
        alert('Failed to delete order. Please try again.');
      }
    }
  };



  const getEntityName = (id: string, entityType: 'Source' | 'designer') => {
    switch (entityType) {
      case 'Source':
        return sources.find(m => m.id === id)?.name || 'Unknown';
      case 'designer':
        return designers.find(d => d.id === id)?.name || 'Unknown';
      default:
        return 'Unknown';
    }
  };

  const getPickupName = (pickupId?: string) => {
    if (!pickupId) return 'Unassigned';
    const pickup = pickups.find(p => p.id === pickupId);
    return pickup ? pickup.name : 'Unknown';
  };

  const columns = [
    { key: 'jobName' as SortField, label: 'Job Name', sortable: true },
    { key: 'jobNumber' as SortField, label: 'Job Number', sortable: true },
    { key: 'orderNumber' as SortField, label: 'Order Number', sortable: true },
    { key: 'purchaseOrder' as SortField, label: 'Purchase Order', sortable: true },
    { key: 'priority' as SortField, label: 'Priority', sortable: true },
    { key: 'SourceId' as SortField, label: 'Source', sortable: false },
    { key: 'status' as SortField, label: 'Status', sortable: true },
    { key: 'pickupId' as SortField, label: 'Pickup', sortable: false },
    { key: 'actions' as SortField, label: 'Actions', sortable: false },
  ];

  if (orders.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>No orders found. Create your first order to get started.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="bg-white p-3 rounded-lg border border-gray-200 mb-4">
        <h3 className="text-base font-medium text-gray-900 mb-3">Filter Orders</h3>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Statuses</option>
              {Object.values(OrderStatus).map(status => (
                <option key={status} value={status}>
                  {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pickup</label>
            <select
              value={pickupFilter}
              onChange={(e) => setPickupFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Pickups</option>
              <option value="unassigned">Unassigned</option>
              {pickups.map(pickup => (
                <option key={pickup.id} value={pickup.id}>
                  {pickup.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Results</label>
            <div className="px-3 py-2 text-sm text-gray-600 bg-gray-50 rounded-md">
              {orders.length} order{orders.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                  column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                }`}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center space-x-1">
                  <span>{column.label}</span>
                  {column.sortable && (
                    <span className="text-gray-400">
                      {sortField === column.key ? (
                        sortDirection === 'asc' ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )
                      ) : (
                        <ChevronUp className="h-3 w-3 opacity-0" />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedOrders.map((order) => (
            <tr 
              key={order.id} 
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => setSelectedOrder(order)}
            >
              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                {order.jobName}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                {order.jobNumber}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                {order.orderNumber}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                {order.purchaseOrder}
              </td>
              <td className="px-4 py-2 whitespace-nowrap">
                <StatusBadge type="priority" value={order.priority} size="sm" />
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                {getEntityName(order.SourceId, 'Source')}
              </td>
              <td className="px-4 py-2 whitespace-nowrap">
                <StatusBadge type="status" value={order.status} size="sm" />
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                {getPickupName(order.pickupId)}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingOrder(order);
                      setFormMode('edit');
                      setShowOrderForm(true);
                    }}
                    className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                    title="Edit order"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteOrder(order.id);
                    }}
                    className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                    title="Delete order"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {showOrderForm && editingOrder && (
        <OrderForm
          order={editingOrder}
          isOpen={showOrderForm}
          onClose={() => {
            setShowOrderForm(false);
            setEditingOrder(null);
          }}
          mode={formMode}
        />
      )}

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

export default OrdersTable;
