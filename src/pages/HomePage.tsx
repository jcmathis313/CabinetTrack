import { useState, useMemo } from 'react';
import { Plus, Search, Truck, Package } from 'lucide-react';
import { useOrder } from '../contexts/OrderContext';
import { OrderStatus } from '../types';
import OrdersTable from '../components/OrdersTable';
import CreateOrderModal from '../components/CreateOrderModal';
import CreatePickupModal from '../components/CreatePickupModal';
import PickupList from '../components/PickupList';
import ArchivedPickupsTable from '../components/ArchivedPickupsTable';

const HomePage = () => {
  const { orders, pickups, loading, error } = useOrder();
  
  console.log('HomePage: Current state:', { orders: orders.length, pickups: pickups.length, loading, error });
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [showCreatePickup, setShowCreatePickup] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [pickupFilter, setPickupFilter] = useState<string>('all');

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = 
        order.jobName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.jobNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.destinationName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesPickup = pickupFilter === 'all' || 
        (pickupFilter === 'unassigned' ? !order.pickupId : order.pickupId === pickupFilter);

      return matchesSearch && matchesStatus && matchesPickup;
    });
  }, [orders, searchTerm, statusFilter, pickupFilter]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-700">Error: {error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="h-8 w-8 text-primary-600" />
            Orders
          </h1>
          <p className="text-gray-600">Manage and track cabinet orders</p>
        </div>

        <div className="space-y-6">
          {/* Orders Table */}
          <div className="card">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Orders ({filteredOrders.length})
              </h2>
              <button
                onClick={() => {
                  console.log('HomePage: Add Order button clicked');
                  try {
                    setShowCreateOrder(true);
                    console.log('HomePage: showCreateOrder set to true');
                  } catch (error) {
                    console.error('HomePage: Error setting showCreateOrder:', error);
                  }
                }}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Order</span>
              </button>
            </div>
            <OrdersTable 
              orders={filteredOrders}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              pickupFilter={pickupFilter}
              setPickupFilter={setPickupFilter}
            />
          </div>

          {/* Pickups Section */}
          <div className="mb-8 pt-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Truck className="h-8 w-8 text-primary-600" />
              Pickups
            </h1>
            <p className="text-gray-600">Manage and track pickup schedules</p>
          </div>

          <div className="card">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Pickups</h2>
              <button
                onClick={() => setShowCreatePickup(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Truck className="h-4 w-4" />
                <span>Create Pickup</span>
              </button>
            </div>
            <PickupList />
            <ArchivedPickupsTable />
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateOrderModal
        isOpen={showCreateOrder}
        onClose={() => setShowCreateOrder(false)}
      />
      
      <CreatePickupModal
        isOpen={showCreatePickup}
        onClose={() => setShowCreatePickup(false)}
      />
    </div>
  );
};

export default HomePage;
