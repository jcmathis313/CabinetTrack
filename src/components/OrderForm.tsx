import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useOrder } from '../contexts/OrderContext';
import { useAuth } from '../contexts/AuthContext';
import { Order, OrderStatus, OrderPriority } from '../types';

interface OrderFormProps {
  order?: Order;
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
}

const OrderForm: React.FC<OrderFormProps> = ({ order, isOpen, onClose, mode }) => {
  const { addOrder, updateOrder, designers, manufacturers } = useOrder();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    jobName: '',
    jobNumber: '',
    orderNumber: '',
    purchaseOrder: '',
    designerId: '',
    cost: '',
    manufacturerId: '',
    destinationName: '',
    status: OrderStatus.PENDING,
    priority: OrderPriority.STANDARD
  });

  useEffect(() => {
    if (order && mode === 'edit') {
      setFormData({
        jobName: order.jobName,
        jobNumber: order.jobNumber,
        orderNumber: order.orderNumber,
        purchaseOrder: order.purchaseOrder,
        designerId: order.designerId,
        cost: order.cost.toString(),
        manufacturerId: order.manufacturerId,
        destinationName: order.destinationName,
        status: order.status,
        priority: order.priority
      });
    } else {
      // Reset form for create mode
      setFormData({
        jobName: '',
        jobNumber: '',
        orderNumber: '',
        purchaseOrder: '',
        designerId: '',
        cost: '',
        manufacturerId: '',
        destinationName: '',
        status: OrderStatus.PENDING,
        priority: OrderPriority.STANDARD
      });
    }
  }, [order, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (mode === 'create') {
        const newOrder: Order = {
          organizationId: user?.organizationId || '',
          id: Date.now().toString(),
          ...formData,
          cost: parseFloat(formData.cost),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        const result = await addOrder(newOrder);
        if (!result) {
          alert('Failed to create order. Please try again.');
          return;
        }
      } else if (order) {
        const result = await updateOrder(order.id, {
          jobName: formData.jobName,
          jobNumber: formData.jobNumber,
          orderNumber: formData.orderNumber,
          purchaseOrder: formData.purchaseOrder,
          designerId: formData.designerId,
          cost: parseFloat(formData.cost),
          manufacturerId: formData.manufacturerId,
          destinationName: formData.destinationName,
          status: formData.status,
          priority: formData.priority
        });
        if (!result) {
          alert('Failed to update order. Please try again.');
          return;
        }
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving order:', error);
      alert('Failed to save order. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  const title = mode === 'create' ? 'Create New Order' : 'Edit Order';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Name *
              </label>
              <input
                type="text"
                name="jobName"
                value={formData.jobName}
                onChange={handleChange}
                required
                className="input"
                placeholder="Enter job name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Number *
              </label>
              <input
                type="text"
                name="jobNumber"
                value={formData.jobNumber}
                onChange={handleChange}
                required
                className="input"
                placeholder="Enter job number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Number
              </label>
              <input
                type="text"
                name="orderNumber"
                value={formData.orderNumber}
                onChange={handleChange}
                className="input"
                placeholder="Enter order number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Order
              </label>
              <input
                type="text"
                name="purchaseOrder"
                value={formData.purchaseOrder}
                onChange={handleChange}
                className="input"
                placeholder="Enter purchase order"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Designer *
              </label>
              <select
                name="designerId"
                value={formData.designerId}
                onChange={handleChange}
                required
                className="input"
              >
                <option value="">Select designer</option>
                {designers.map(designer => (
                  <option key={designer.id} value={designer.id}>
                    {designer.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cost *
              </label>
              <input
                type="number"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                required
                step="0.01"
                min="0"
                className="input"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Manufacturer *
              </label>
              <select
                name="manufacturerId"
                value={formData.manufacturerId}
                onChange={handleChange}
                required
                className="input"
              >
                <option value="">Select manufacturer</option>
                {manufacturers.map(manufacturer => (
                  <option key={manufacturer.id} value={manufacturer.id}>
                    {manufacturer.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destination
              </label>
              <input
                type="text"
                name="destinationName"
                value={formData.destinationName}
                onChange={handleChange}
                className="input"
                placeholder="Enter destination"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="input"
              >
                {Object.values(OrderStatus).map(status => (
                  <option key={status} value={status}>
                    {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="input"
              >
                {Object.values(OrderPriority).map(priority => (
                  <option key={priority} value={priority}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              {mode === 'create' ? 'Create Order' : 'Update Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderForm;
