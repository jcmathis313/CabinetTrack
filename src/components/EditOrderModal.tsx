import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useOrder } from '../contexts/OrderContext';
import { Order, OrderStatus, OrderPriority } from '../types';

interface EditOrderModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}

const EditOrderModal: React.FC<EditOrderModalProps> = ({ order, isOpen, onClose }) => {
  const { sources, designers } = useOrder();
  const [formData, setFormData] = useState({
    jobName: '',
    jobNumber: '',
    orderNumber: '',
    purchaseOrder: '',
    designerId: '',
    cost: '',
    sourceId: '',
    destinationName: '',
    status: OrderStatus.PENDING,
          priority: OrderPriority.STANDARD
  });

  useEffect(() => {
    if (order) {
      setFormData({
        jobName: order.jobName,
        jobNumber: order.jobNumber,
        orderNumber: order.orderNumber,
        purchaseOrder: order.purchaseOrder,
        designerId: order.designerId,
        cost: order.cost.toString(),
        sourceId: order.sourceId,
        destinationName: order.destinationName,
        status: order.status,
        priority: order.priority
      });
    }
  }, [order]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedOrder: Order = {
      ...order,
      ...formData,
      cost: parseFloat(formData.cost),
      updatedAt: new Date()
    };

    // Order is already updated by the context
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Edit Order</h2>
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
                Order Number *
              </label>
              <input
                type="text"
                name="orderNumber"
                value={formData.orderNumber}
                onChange={handleChange}
                required
                className="input"
                placeholder="Enter order number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Order *
              </label>
              <input
                type="text"
                name="purchaseOrder"
                value={formData.purchaseOrder}
                onChange={handleChange}
                required
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
                <option value="">Select a designer</option>
                {designers.map(designer => (
                  <option key={designer.id} value={designer.id}>
                    {designer.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority *
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                required
                className="input"
              >
                {Object.values(OrderPriority).map(priority => (
                  <option key={priority} value={priority}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
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
                min="0"
                step="0.01"
                className="input"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Source *
              </label>
              <select
                name="sourceId"
                value={formData.sourceId}
                onChange={handleChange}
                required
                className="input"
              >
                <option value="">Select a Source</option>
                {sources.map(source => (
                  <option key={source.id} value={source.id}>
                    {source.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destination Name *
              </label>
              <input
                type="text"
                name="destinationName"
                value={formData.destinationName}
                onChange={handleChange}
                required
                className="input"
                placeholder="Enter destination name"
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
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
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
              Update Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditOrderModal;
