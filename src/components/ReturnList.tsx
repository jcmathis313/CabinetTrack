import React, { useState } from 'react';
import { Plus, Edit, Trash2, FileText, Calendar, User, AlertCircle, CheckCircle, XCircle, Archive, Package } from 'lucide-react';
import { useOrder } from '../contexts/OrderContext';
import { Return, ReturnStatus, Order, Driver } from '../types';
import { PDFService } from '../services/pdfService';
import StatusBadge from './StatusBadge';

const ReturnList: React.FC = () => {
  const { returns, drivers, orders, sources, designers, updateReturn } = useOrder();
  const [editingReturn, setEditingReturn] = useState<any>(null);
  const [showReturnForm, setShowReturnForm] = useState(false);

  const getStatusIcon = (status: ReturnStatus) => {
    switch (status) {
      case ReturnStatus.SCHEDULED:
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case ReturnStatus.IN_PROGRESS:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case ReturnStatus.COMPLETED:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case ReturnStatus.CANCELLED:
        return <XCircle className="h-4 w-4 text-red-500" />;
      case ReturnStatus.ARCHIVED:
        return <Archive className="h-4 w-4 text-gray-500" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'standard':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleExportPDF = async (returnItem: Return) => {
    try {
      const returnOrders = orders.filter(order => returnItem.orders.includes(order.id));
      const driver = drivers.find(d => d.id === returnItem.driverId);

      if (driver) {
        await PDFService.exportReturnPDF(returnItem, returnOrders, sources, designers, driver);
      }
    } catch (error) {
      console.error('Error exporting return PDF:', error);
    }
  };

  const handleStatusChange = async (returnItem: Return, newStatus: ReturnStatus) => {
    try {
      await updateReturn(returnItem.id, { status: newStatus });
    } catch (error) {
      console.error('Error updating return status:', error);
    }
  };

  const activeReturns = returns.filter(returnItem => returnItem.status !== ReturnStatus.ARCHIVED);
  const archivedReturns = returns.filter(returnItem => returnItem.status === ReturnStatus.ARCHIVED);

  return (
    <div className="space-y-6">
      {/* Active Returns */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Active Returns</h3>
        {activeReturns.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No active returns. Create your first return above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeReturns.map(returnItem => {
              const returnOrders = orders.filter(order => returnItem.orders.includes(order.id));
              const driver = drivers.find(d => d.id === returnItem.driverId);
              
              return (
                <div key={returnItem.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(returnItem.status)}
                      <h4 className="font-medium text-gray-900">{returnItem.name}</h4>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingReturn(returnItem)}
                        className="text-primary-600 hover:text-primary-800"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleExportPDF(returnItem)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(returnItem.scheduledDate).toLocaleDateString()}</span>
                    </div>
                    
                    {driver && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{driver.name}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      <span>{returnOrders.length} orders</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(returnItem.priority)}`}>
                        {returnItem.priority}
                      </span>
                      <StatusBadge status={returnItem.status} />
                    </div>
                  </div>

                  {/* Status Update Buttons */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex flex-wrap gap-2">
                      {returnItem.status === ReturnStatus.SCHEDULED && (
                        <button
                          onClick={() => handleStatusChange(returnItem, ReturnStatus.IN_PROGRESS)}
                          className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                        >
                          Start
                        </button>
                      )}
                      {returnItem.status === ReturnStatus.IN_PROGRESS && (
                        <button
                          onClick={() => handleStatusChange(returnItem, ReturnStatus.COMPLETED)}
                          className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                        >
                          Complete
                        </button>
                      )}
                      {returnItem.status !== ReturnStatus.COMPLETED && returnItem.status !== ReturnStatus.CANCELLED && (
                        <button
                          onClick={() => handleStatusChange(returnItem, ReturnStatus.CANCELLED)}
                          className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Archived Returns */}
      {archivedReturns.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Archived Returns</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {archivedReturns.map(returnItem => {
              const returnOrders = orders.filter(order => returnItem.orders.includes(order.id));
              const driver = drivers.find(d => d.id === returnItem.driverId);
              
              return (
                <div key={returnItem.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(returnItem.status)}
                      <h4 className="font-medium text-gray-900">{returnItem.name}</h4>
                    </div>
                    <button
                      onClick={() => handleExportPDF(returnItem)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <FileText className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(returnItem.scheduledDate).toLocaleDateString()}</span>
                    </div>
                    
                    {driver && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{driver.name}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      <span>{returnOrders.length} orders</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(returnItem.priority)}`}>
                        {returnItem.priority}
                      </span>
                      <StatusBadge status={returnItem.status} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReturnList;
