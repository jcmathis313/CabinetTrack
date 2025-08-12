import React, { useState, useMemo } from 'react';
import { Truck, Calendar, User, Package, Edit, Filter, Download, Archive } from 'lucide-react';
import { useOrder } from '../contexts/OrderContext';
import { PickupStatus, PickupPriority, PickupFilter } from '../types';
import PickupForm from './PickupForm';
import { PDFService } from '../services/pdfService';
import StatusBadge from './StatusBadge';
import ActionButton from './ActionButton';
import EditPickupModal from './EditPickupModal';

const PickupList: React.FC = () => {
  const { pickups, drivers, orders, Sources, designers, updatePickup } = useOrder();
  const [editingPickup, setEditingPickup] = useState<any>(null);
  const [showPickupForm, setShowPickupForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('edit');
  const [filters, setFilters] = useState<PickupFilter>({});

  const getStatusColor = (status: PickupStatus) => {
    switch (status) {
      case PickupStatus.SCHEDULED:
        return 'bg-blue-100 text-blue-800';
      case PickupStatus.IN_PROGRESS:
        return 'bg-yellow-100 text-yellow-800';
      case PickupStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case PickupStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      case PickupStatus.ARCHIVED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: PickupPriority) => {
    switch (priority) {
      case PickupPriority.LOW:
        return 'bg-gray-100 text-gray-800';
      case PickupPriority.STANDARD:
        return 'bg-blue-100 text-blue-800';
      case PickupPriority.HIGH:
        return 'bg-orange-100 text-orange-800';
      case PickupPriority.URGENT:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDriverName = (driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    return driver ? driver.name : 'Unknown Driver';
  };

  const getOrderDetails = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    return order ? {
      jobName: order.jobName,
      jobNumber: order.jobNumber,
      destination: order.destinationName,
      cost: order.cost
    } : null;
  };

  // Filter pickups based on selected filters
  const filteredPickups = useMemo(() => {
    return pickups.filter(pickup => {
      // By default, exclude archived pickups unless specifically requested
      if (!filters.showArchived && pickup.status === PickupStatus.ARCHIVED) return false;
      
      if (filters.status && pickup.status !== filters.status) return false;
      if (filters.driverId && pickup.driverId !== filters.driverId) return false;
      if (filters.priority && pickup.priority !== filters.priority) return false;
      return true;
    });
  }, [pickups, filters]);

  const handleExportPickup = async (pickup: any) => {
    const driver = drivers.find(d => d.id === pickup.driverId);
    const pickupOrders = orders.filter(o => pickup.orders.includes(o.id));
    
    if (driver) {
      await PDFService.exportPickupPDF(pickup, pickupOrders, Sources, designers, driver);
    }
  };



  const handleArchivePickup = async (pickupId: string) => {
    if (confirm('Are you sure you want to archive this pickup?')) {
      try {
        await updatePickup(pickupId, { status: PickupStatus.ARCHIVED });
      } catch (error) {
        console.error('Error archiving pickup:', error);
        alert('Failed to archive pickup. Please try again.');
      }
    }
  };

  const clearFilters = () => {
    setFilters({});
  };

      if (pickups.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <Truck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>No pickups created yet. Create your first pickup to get started.</p>
      </div>
    );
  }

  return (
    <div className="p-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <div className="flex items-center gap-2">
          {Object.keys(filters).length > 0 && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-3 rounded-lg border border-gray-200 mb-4">
        <h3 className="text-base font-medium text-gray-900 mb-3">Filter Pickups</h3>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as PickupStatus || undefined }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Statuses</option>
              {Object.values(PickupStatus).map(status => (
                <option key={status} value={status}>
                  {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Driver</label>
            <select
              value={filters.driverId || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, driverId: e.target.value || undefined }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Drivers</option>
              {drivers.map(driver => (
                <option key={driver.id} value={driver.id}>
                  {driver.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={filters.priority || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value as PickupPriority || undefined }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Priorities</option>
              {Object.values(PickupPriority).map(priority => (
                <option key={priority} value={priority}>
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Show Archived</label>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showArchived"
                checked={filters.showArchived || false}
                onChange={(e) => setFilters(prev => ({ ...prev, showArchived: e.target.checked }))}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="showArchived" className="ml-2 text-sm text-gray-700">
                Include archived pickups
              </label>
            </div>
          </div>


        </div>
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-gray-600">
                        Showing {filteredPickups.length} of {pickups.length} pickups
      </div>

      {/* Pickups grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredPickups.map(pickup => (
          <div key={pickup.id} className="card p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{pickup.name}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(pickup.status)}`}>
                    {pickup.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(pickup.priority)}`}>
                    {pickup.priority.charAt(0).toUpperCase() + pickup.priority.slice(1)}
                  </span>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleExportPickup(pickup)}
                  className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50"
                  title="Export PDF"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setEditingPickup(pickup)}
                  className="text-primary-600 hover:text-primary-800 p-1 rounded hover:bg-primary-50"
                  title="Edit pickup"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleArchivePickup(pickup.id)}
                  className="text-gray-600 hover:text-gray-800 p-1 rounded hover:bg-gray-50"
                  title="Archive pickup"
                >
                  <Archive className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <User className="h-4 w-4 mr-2" />
                <span>{getDriverName(pickup.driverId)}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{new Date(pickup.scheduledDate).toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Package className="h-4 w-4 mr-2" />
                <span>{pickup.orders.length} order{pickup.orders.length !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {/* Orders in this pickup */}
            <div className="border-t border-gray-200 pt-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Orders:</h4>
              <div className="space-y-2">
                {pickup.orders.map(orderId => {
                  const orderDetails = getOrderDetails(orderId);
                  return orderDetails ? (
                    <div key={orderId} className="bg-gray-50 p-2 rounded text-sm">
                      <div className="font-medium text-gray-900">{orderDetails.jobName}</div>
                      <div className="text-gray-600">
                        {orderDetails.jobNumber} • {orderDetails.destination}
                      </div>
                      <div className="text-gray-500">${orderDetails.cost.toLocaleString()}</div>
                    </div>
                  ) : null;
                })}
              </div>
            </div>

            {/* Total cost */}
            <div className="border-t border-gray-200 pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Total Cost:</span>
                <span className="text-lg font-semibold text-gray-900">
                  ${pickup.orders.reduce((total, orderId) => {
                    const order = orders.find(o => o.id === orderId);
                    return total + (order?.cost || 0);
                  }, 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Pickup Modal */}
      {editingPickup && (
        <EditPickupModal
          pickup={editingPickup}
          isOpen={!!editingPickup}
          onClose={() => setEditingPickup(null)}
        />
      )}
    </div>
  );
};

export default PickupList;
