import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Package, AlertCircle } from 'lucide-react';
import { useOrder } from '../contexts/OrderContext';
import { useAuth } from '../contexts/AuthContext';
import { Return, ReturnStatus, PickupPriority } from '../types';

interface CreateReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateReturnModal: React.FC<CreateReturnModalProps> = ({ isOpen, onClose }) => {
  console.log('CreateReturnModal: Rendering with isOpen:', isOpen);
  const { addReturn, orders, drivers } = useOrder();
  const { user } = useAuth();
  console.log('CreateReturnModal: Context data - orders:', orders.length, 'drivers:', drivers.length, 'user:', user);
  const [formData, setFormData] = useState({
    name: '',
    orders: [] as string[],
    driverId: '',
    status: ReturnStatus.SCHEDULED as ReturnStatus,
    priority: PickupPriority.STANDARD as PickupPriority,
    scheduledDate: new Date().toISOString().split('T')[0]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        orders: [],
        driverId: '',
        status: ReturnStatus.SCHEDULED,
        priority: PickupPriority.STANDARD,
        scheduledDate: new Date().toISOString().split('T')[0]
      });
      setErrors({});
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('CreateReturnModal: Form submission started');
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    console.log('CreateReturnModal: Form data:', formData);

    // Validation
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Return name is required';
    }
    if (formData.orders.length === 0) {
      newErrors.orders = 'At least one order must be selected';
    }
    if (!formData.scheduledDate) {
      newErrors.scheduledDate = 'Scheduled date is required';
    }

    console.log('CreateReturnModal: Validation errors:', newErrors);

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('CreateReturnModal: Calling addReturn with data:', {
        ...formData,
        organizationId: user?.organizationId || '',
        scheduledDate: new Date(formData.scheduledDate)
      });
      
      const result = await addReturn({
        ...formData,
        organizationId: user?.organizationId || '',
        scheduledDate: new Date(formData.scheduledDate)
      });
      
      console.log('CreateReturnModal: addReturn result:', result);
      
      if (result) {
        console.log('CreateReturnModal: Return created successfully, closing modal');
        onClose();
      } else {
        console.log('CreateReturnModal: addReturn returned null/undefined');
        setErrors({ submit: 'Failed to create return. Please try again.' });
      }
    } catch (error) {
      console.error('CreateReturnModal: Error creating return:', error);
      setErrors({ submit: 'Failed to create return. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleOrderToggle = (orderId: string) => {
    setFormData(prev => ({
      ...prev,
      orders: prev.orders.includes(orderId)
        ? prev.orders.filter(id => id !== orderId)
        : [...prev.orders, orderId]
    }));
    // Clear error when user selects orders
    if (errors.orders) {
      setErrors(prev => ({ ...prev, orders: '' }));
    }
  };

  const availableOrders = orders.filter(order => 
    order.status === 'delivered' || order.status === 'picked_up'
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create Return</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Return Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Return Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`input ${errors.name ? 'border-red-500' : ''}`}
              placeholder="Enter return name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Orders Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Orders *
            </label>
            <div className={`border rounded-md p-3 max-h-48 overflow-y-auto ${errors.orders ? 'border-red-500' : 'border-gray-300'}`}>
              {availableOrders.length === 0 ? (
                <p className="text-gray-500 text-sm">No delivered or picked up orders available for return.</p>
              ) : (
                <div className="space-y-2">
                  {availableOrders.map(order => (
                    <label key={order.id} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.orders.includes(order.id)}
                        onChange={() => handleOrderToggle(order.id)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">
                            {order.jobName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {order.orderNumber}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.destinationName} • {order.status}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            {errors.orders && (
              <p className="mt-1 text-sm text-red-600">{errors.orders}</p>
            )}
            {formData.orders.length > 0 && (
              <p className="mt-2 text-sm text-gray-600">
                Selected {formData.orders.length} order{formData.orders.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Driver Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Driver (Optional)
            </label>
            <select
              name="driverId"
              value={formData.driverId}
              onChange={handleChange}
              className="input"
            >
              <option value="">Select a driver</option>
              {drivers.map(driver => (
                <option key={driver.id} value={driver.id}>
                  {driver.name} - {driver.vehicle}
                </option>
              ))}
            </select>
          </div>

          {/* Scheduled Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Scheduled Date *
            </label>
            <input
              type="date"
              name="scheduledDate"
              value={formData.scheduledDate}
              onChange={handleChange}
              className={`input ${errors.scheduledDate ? 'border-red-500' : ''}`}
            />
            {errors.scheduledDate && (
              <p className="mt-1 text-sm text-red-600">{errors.scheduledDate}</p>
            )}
          </div>

          {/* Priority */}
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
              <option value={PickupPriority.LOW}>Low</option>
              <option value={PickupPriority.STANDARD}>Standard</option>
              <option value={PickupPriority.HIGH}>High</option>
              <option value={PickupPriority.URGENT}>Urgent</option>
            </select>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <p className="ml-2 text-sm text-red-700">{errors.submit}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
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
              disabled={isSubmitting}
              className="btn-primary flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Package className="h-4 w-4" />
                  <span>Create Return</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateReturnModal;
