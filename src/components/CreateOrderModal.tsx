import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useOrder } from '../contexts/OrderContext';
import { useAuth } from '../contexts/AuthContext';
import { OrderStatus, OrderPriority } from '../types';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateOrderModal: React.FC<CreateOrderModalProps> = ({ isOpen, onClose }) => {
  console.log('CreateOrderModal: Rendering with isOpen:', isOpen);
  const { addOrder, Sources, designers } = useOrder();
  const { user } = useAuth();
  console.log('CreateOrderModal: Data from useOrder:', { 
    sources: Sources?.length || 0, 
    designers: designers?.length || 0 
  });
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('CreateOrderModal: Starting order creation...');
    setIsSubmitting(true);
    
    try {
      const orderData = {
        ...formData,
        cost: parseFloat(formData.cost)
      };
      
      console.log('CreateOrderModal: Order data to submit:', orderData);
      const result = await addOrder({
        ...orderData,
        organizationId: user?.organizationId || ''
      });
      console.log('CreateOrderModal: Order creation result:', result);
      
      if (result) {
        onClose();
        setFormData({
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
      }
    } catch (error) {
      console.error('CreateOrderModal: Error creating order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) {
    console.log('CreateOrderModal: Not open, returning null');
    return null;
  }
  
  console.log('CreateOrderModal: About to render modal content');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Create New Order</h2>
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
                {designers && designers.length > 0 ? designers.map(designer => (
                  <option key={designer.id} value={designer.id}>
                    {designer.name}
                  </option>
                )) : (
                  <option value="" disabled>No designers available</option>
                )}
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
                Source *
              </label>
              <select
                name="SourceId"
                value={formData.SourceId}
                onChange={handleChange}
                required
                className="input"
              >
                <option value="">Select a Source</option>
                {Sources && sources.length > 0 ? sources.map(Source => (
                  <option key={source.id} value={source.id}>
                    {source.name}
                  </option>
                )) : (
                  <option value="" disabled>No Sources available</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destination *
              </label>
              <input
                type="text"
                name="destinationName"
                value={formData.destinationName}
                onChange={handleChange}
                required
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

          <div className="flex justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {isSubmitting ? 'Creating...' : 'Create Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOrderModal;
