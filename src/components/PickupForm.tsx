import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useOrder } from '../contexts/OrderContext';
import { useAuth } from '../contexts/AuthContext';
import { Pickup, PickupStatus, PickupPriority } from '../types';

interface PickupFormProps {
  pickup?: Pickup;
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
}

const PickupForm: React.FC<PickupFormProps> = ({ pickup, isOpen, onClose, mode }) => {
  const { drivers, orders } = useOrder();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    scheduledDate: '',
    priority: PickupPriority.STANDARD,
    status: PickupStatus.SCHEDULED,
    driverId: '',
    orders: [] as string[],
    notes: ''
  });

  useEffect(() => {
    if (pickup && mode === 'edit') {
      setFormData({
        name: pickup.name,
        scheduledDate: pickup.scheduledDate.toISOString().split('T')[0],
        priority: pickup.priority,
        status: pickup.status,
        driverId: pickup.driverId || '',
        orders: pickup.orders || [],
        notes: 'notes' in pickup ? (pickup.notes as string) || '' : ''
      });
    } else {
      // Reset form for create mode
      setFormData({
        name: '',
        scheduledDate: new Date().toISOString().split('T')[0],
        priority: PickupPriority.STANDARD,
        status: PickupStatus.SCHEDULED,
        driverId: '',
        orders: [],
        notes: ''
      });
    }
  }, [pickup, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'create') {
      const newPickup: Pickup = {
        organizationId: user?.organizationId || '',
        id: Date.now().toString(),
        ...formData,
        scheduledDate: new Date(formData.scheduledDate),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      // Pickup is already added by the context
    } else if (pickup) {
      const updatedPickup: Pickup = {
        ...pickup,
        ...formData,
        scheduledDate: new Date(formData.scheduledDate),
        updatedAt: new Date()
      };
      // Pickup is already updated by the context
    }
    
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOrderChange = (orderId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      orders: checked 
        ? [...prev.orders, orderId]
        : prev.orders.filter(id => id !== orderId)
    }));
  };

  if (!isOpen) return null;

  const title = mode === 'create' ? 'Create New Pickup' : 'Edit Pickup';

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
                Pickup Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input"
                placeholder="Enter pickup name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scheduled Date *
              </label>
              <input
                type="date"
                name="scheduledDate"
                value={formData.scheduledDate}
                onChange={handleChange}
                required
                className="input"
              />
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
                {Object.values(PickupPriority).map(priority => (
                  <option key={priority} value={priority}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </option>
                ))}
              </select>
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
                {Object.values(PickupStatus).map(status => (
                  <option key={status} value={status}>
                    {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Driver
              </label>
              <select
                name="driverId"
                value={formData.driverId}
                onChange={handleChange}
                className="input"
              >
                <option value="">Select driver</option>
                {drivers.map(driver => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Orders to Pickup
            </label>
            <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2">
              {orders.map(order => (
                <label key={order.id} className="flex items-center space-x-2 py-1">
                  <input
                    type="checkbox"
                    checked={formData.orders.includes(order.id)}
                    onChange={(e) => handleOrderChange(order.id, e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">
                    {order.jobName} - {order.jobNumber || 'No Job #'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="input"
              placeholder="Enter any additional notes..."
            />
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
              {mode === 'create' ? 'Create Pickup' : 'Update Pickup'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PickupForm;
