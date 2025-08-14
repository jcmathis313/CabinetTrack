import { useState, useMemo } from 'react';
import { Plus, Search, Truck, Package, RotateCcw } from 'lucide-react';
import { useOrder } from '../contexts/OrderContext';
import { OrderStatus } from '../types';
import OrdersTable from '../components/OrdersTable';
import CreateOrderModal from '../components/CreateOrderModal';
import CreatePickupModal from '../components/CreatePickupModal';
import CreateReturnModal from '../components/CreateReturnModal';
import PickupList from '../components/PickupList';
import ReturnList from '../components/ReturnList';
import ArchivedPickupsTable from '../components/ArchivedPickupsTable';

type TabType = 'orders' | 'pickups' | 'returns';

const HomePage = () => {
  const { orders, pickups, returns, loading, error } = useOrder();
  
  console.log('HomePage: Current state:', { 
    orders: orders.length, 
    pickups: pickups.length, 
    returns: returns.length,
    loading, 
    error 
  });
  
  const [activeTab, setActiveTab] = useState<TabType>('orders');
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [showCreatePickup, setShowCreatePickup] = useState(false);
  const [showCreateReturn, setShowCreateReturn] = useState(false);
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

  const tabs = [
    { id: 'orders' as TabType, label: 'Orders', icon: Package, count: orders.length },
    { id: 'pickups' as TabType, label: 'Pickups', icon: Truck, count: pickups.length },
    { id: 'returns' as TabType, label: 'Returns', icon: RotateCcw, count: returns.length }
  ];

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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'orders':
        return (
          <div className="space-y-6">
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
          </div>
        );

      case 'pickups':
        return (
          <div className="space-y-6">
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
        );

      case 'returns':
        return (
          <div className="space-y-6">
            <div className="card">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Returns</h2>
                <button
                  onClick={() => setShowCreateReturn(true)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Create Return</span>
                </button>
              </div>
              <ReturnList />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="h-8 w-8 text-primary-600" />
            CabinetTrack Dashboard
          </h1>
          <p className="text-gray-600">Manage orders, pickups, and returns</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {renderTabContent()}
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

      <CreateReturnModal
        isOpen={showCreateReturn}
        onClose={() => setShowCreateReturn(false)}
      />
    </div>
  );
};

export default HomePage;
