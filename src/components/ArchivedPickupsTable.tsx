import React from 'react';
import { Download, RotateCcw } from 'lucide-react';
import { useOrder } from '../contexts/OrderContext';
import { PickupStatus, PickupPriority } from '../types';
import { PDFService } from '../services/pdfService';

const ArchivedPickupsTable: React.FC = () => {
  const { pickups, drivers, orders, Sources, designers, updatePickup } = useOrder();

  const archivedPickups = pickups.filter(pickup => pickup.status === PickupStatus.ARCHIVED);

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

  const handleExportPickup = async (pickup: any) => {
    const driver = drivers.find(d => d.id === pickup.driverId);
    const pickupOrders = orders.filter(o => pickup.orders.includes(o.id));
    
    if (driver) {
      await PDFService.exportPickupPDF(pickup, pickupOrders, Sources, designers, driver);
    }
  };

  const handleReactivatePickup = async (pickupId: string) => {
    if (confirm('Are you sure you want to reactivate this pickup?')) {
      try {
        await updatePickup(pickupId, { status: PickupStatus.SCHEDULED });
      } catch (error) {
        console.error('Error reactivating pickup:', error);
        alert('Failed to reactivate pickup. Please try again.');
      }
    }
  };

  if (archivedPickups.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-4 px-6">
        <h3 className="text-lg font-semibold text-gray-900">Archived Pickups</h3>
        <span className="text-sm text-gray-500">({archivedPickups.length})</span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pickup Name
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Driver
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Scheduled Date
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Orders
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Cost
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {archivedPickups.map((pickup) => (
              <tr key={pickup.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  {pickup.name}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                  {getDriverName(pickup.driverId)}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(pickup.priority)}`}>
                    {pickup.priority.charAt(0).toUpperCase() + pickup.priority.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                  {new Date(pickup.scheduledDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                  {pickup.orders.length} order{pickup.orders.length !== 1 ? 's' : ''}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                  ${pickup.orders.reduce((total, orderId) => {
                    const order = orders.find(o => o.id === orderId);
                    return total + (order?.cost || 0);
                  }, 0).toLocaleString()}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleExportPickup(pickup)}
                      className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50"
                      title="Export PDF"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleReactivatePickup(pickup.id)}
                      className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                      title="Reactivate pickup"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ArchivedPickupsTable;
