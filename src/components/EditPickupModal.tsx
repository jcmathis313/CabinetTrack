import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { useOrder } from '../contexts/OrderContext';
import { Pickup, PickupStatus, PickupPriority } from '../types';

interface EditPickupModalProps {
  pickup: Pickup;
  isOpen: boolean;
  onClose: () => void;
}

const EditPickupModal: React.FC<EditPickupModalProps> = ({ pickup, isOpen, onClose }) => {
  const { updatePickup, updateOrder, orders, drivers } = useOrder();
  const [formData, setFormData] = useState({
    name: '',
    driverId: '',
    scheduledDate: '',
    status: PickupStatus.SCHEDULED,
    priority: PickupPriority.STANDARD
  });
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  // Get available orders (unassigned + current pickup orders)
  const availableOrders = orders.filter(order => 
    !order.pickupId || order.pickupId === pickup.id
  );

  useEffect(() => {
    if (pickup) {
      setFormData({
        name: pickup.name,
        driverId: pickup.driverId,
        scheduledDate: pickup.scheduledDate.toISOString().slice(0, 16),
        status: pickup.status,
        priority: pickup.priority
      });
      setSelectedOrders([...pickup.orders]);
    }
  }, [pickup]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedOrders.length === 0) {
      alert('Please select at least one order for this pickup.');
      return;
    }

    try {
      const updatedPickup: Pickup = {
        ...pickup,
        ...formData,
        orders: selectedOrders,
        scheduledDate: new Date(formData.scheduledDate),
        updatedAt: new Date()
      };

      // Update the pickup
      const result = await updatePickup(pickup.id, {
        name: formData.name,
        driverId: formData.driverId,
        scheduledDate: new Date(formData.scheduledDate),
        status: formData.status,
        priority: formData.priority,
        orders: selectedOrders
      });

      if (!result) {
        alert('Failed to update pickup. Please try again.');
        return;
      }

      // Remove pickup ID from orders that are no longer in this pickup
      for (const orderId of pickup.orders) {
        if (!selectedOrders.includes(orderId)) {
          const order = orders.find(o => o.id === orderId);
          if (order) {
            await updateOrder(orderId, { pickupId: undefined });
          }
        }
      }

      // Add pickup ID to newly selected orders
      for (const orderId of selectedOrders) {
        if (!pickup.orders.includes(orderId)) {
          const order = orders.find(o => o.id === orderId);
          if (order) {
            await updateOrder(orderId, { pickupId: pickup.id });
          }
        }
      }

      onClose();
    } catch (error) {
      console.error('Error updating pickup:', error);
      alert('Failed to update pickup. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const removeOrderFromSelection = (orderId: string) => {
    setSelectedOrders(prev => prev.filter(id => id !== orderId));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Pickup</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Pickup Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                Driver *
              </label>
              <select
                name="driverId"
                value={formData.driverId}
                onChange={handleChange}
                required
                className="input"
              >
                <option value="">Select a driver</option>
                {drivers.map(driver => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scheduled Date *
              </label>
              <input
                type="datetime-local"
                name="scheduledDate"
                value={formData.scheduledDate}
                onChange={handleChange}
                required
                className="input"
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
                {Object.values(PickupStatus).map(status => (
                  <option key={status} value={status}>
                    {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
                {Object.values(PickupPriority).map(priority => (
                  <option key={priority} value={priority}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Order Management */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Manage Orders for Pickup</h3>
            
            {availableOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No orders available to assign to this pickup.
              </p>
            ) : (
              <div className="space-y-4">
                {/* Selected Orders */}
                {selectedOrders.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Orders ({selectedOrders.length})</h4>
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                      {selectedOrders.map(orderId => {
                        const order = orders.find(o => o.id === orderId);
                        return order ? (
                          <div key={orderId} className="flex items-center justify-between bg-white p-2 rounded border">
                            <span className="text-sm">
                              <strong>{order.jobName}</strong> - {order.jobNumber} ({order.destinationName})
                            </span>
                            <button
                              type="button"
                              onClick={() => removeOrderFromSelection(orderId)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {/* Available Orders */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Available Orders ({availableOrders.length})
                  </h4>
                  <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                    {availableOrders.map(order => (
                      <div
                        key={order.id}
                        className={`p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                          selectedOrders.includes(order.id) ? 'bg-primary-50 border-primary-200' : ''
                        }`}
                        onClick={() => toggleOrderSelection(order.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">{order.jobName}</div>
                            <div className="text-sm text-gray-600">
                              {order.jobNumber} • {order.orderNumber} • {order.destinationName}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            ${order.cost.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
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
              disabled={selectedOrders.length === 0}
            >
              Update Pickup
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPickupModal;
