import { useState } from 'react';
import { Plus, Edit, Trash2, Building, User, Truck } from 'lucide-react';
import { useOrder } from '../contexts/OrderContext';
import { Manufacturer, Designer, Driver } from '../types';
import CreateManufacturerModal from '../components/CreateManufacturerModal';
import CreateDesignerModal from '../components/CreateDesignerModal';
import CreateDriverModal from '../components/CreateDriverModal';
import EditManufacturerModal from '../components/EditManufacturerModal';
import EditDesignerModal from '../components/EditDesignerModal';
import EditDriverModal from '../components/EditDriverModal';
import OrganizationalSettingsTab from '../components/OrganizationalSettingsTab';

type TabType = 'manufacturers' | 'designers' | 'drivers' | 'organizational';

const SettingsPage = () => {
  const { deleteManufacturer, deleteDesigner, deleteDriver, manufacturers, designers, drivers } = useOrder();
  const [activeTab, setActiveTab] = useState<TabType>('manufacturers');
  const [showCreateManufacturer, setShowCreateManufacturer] = useState(false);
  const [showCreateDesigner, setShowCreateDesigner] = useState(false);
  const [showCreateDriver, setShowCreateDriver] = useState(false);
  const [editingManufacturer, setEditingManufacturer] = useState<any>(null);
  const [editingDesigner, setEditingDesigner] = useState<any>(null);
  const [editingDriver, setEditingDriver] = useState<any>(null);

  const handleDelete = async (type: 'manufacturer' | 'designer' | 'driver', id: string) => {
    if (confirm(`Are you sure you want to delete this ${type}?`)) {
      try {
        switch (type) {
          case 'manufacturer':
            await deleteManufacturer(id);
            break;
          case 'designer':
            await deleteDesigner(id);
            break;
          case 'driver':
            await deleteDriver(id);
            break;
        }
      } catch (error) {
        console.error(`Error deleting ${type}:`, error);
        alert(`Failed to delete ${type}. Please try again.`);
      }
    }
  };

  const tabs = [
    { id: 'manufacturers' as TabType, label: 'Manufacturers', icon: Building },
    { id: 'designers' as TabType, label: 'Designers', icon: User },
    { id: 'drivers' as TabType, label: 'Drivers', icon: Truck },
    { id: 'organizational' as TabType, label: 'Organizational Settings', icon: Building }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'manufacturers':
        return (
          <div className="space-y-6">
            {/* Manufacturers content */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Manufacturers</h3>
              <button
                onClick={() => setShowCreateManufacturer(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Manufacturer</span>
              </button>
            </div>
            {manufacturers.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No manufacturers added yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {manufacturers.map(manufacturer => (
                  <div key={manufacturer.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-medium text-gray-900">{manufacturer.name}</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingManufacturer(manufacturer)}
                          className="text-primary-600 hover:text-primary-800"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete('manufacturer', manufacturer.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>{manufacturer.address}</p>
                      <p>{manufacturer.phoneNumber}</p>
                      <p>Contact: {manufacturer.mainContact}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'designers':
        return (
          <div className="space-y-6">
            {/* Designers content */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Designers</h3>
              <button
                onClick={() => setShowCreateDesigner(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Designer</span>
              </button>
            </div>
            {designers.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No designers added yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {designers.map(designer => (
                  <div key={designer.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-medium text-gray-900">{designer.name}</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingDesigner(designer)}
                          className="text-primary-600 hover:text-primary-800"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete('designer', designer.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>{designer.email}</p>
                      <p>{designer.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'drivers':
        return (
          <div className="space-y-6">
            {/* Drivers content */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Drivers</h3>
              <button
                onClick={() => setShowCreateDriver(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Driver</span>
              </button>
            </div>
            {drivers.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No drivers added yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {drivers.map(driver => (
                  <div key={driver.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-medium text-gray-900">{driver.name}</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingDriver(driver)}
                          className="text-primary-600 hover:text-primary-800"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete('driver', driver.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>{driver.email}</p>
                      <p>{driver.phone}</p>
                      <p>Vehicle: {driver.vehicle}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'organizational':
        return <OrganizationalSettingsTab />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage CabinetTrack settings and data</p>
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
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="card">
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateManufacturerModal
        isOpen={showCreateManufacturer}
        onClose={() => setShowCreateManufacturer(false)}
      />
      <CreateDesignerModal
        isOpen={showCreateDesigner}
        onClose={() => setShowCreateDesigner(false)}
      />
      <CreateDriverModal
        isOpen={showCreateDriver}
        onClose={() => setShowCreateDriver(false)}
      />
      <EditManufacturerModal
        manufacturer={editingManufacturer as Manufacturer}
        isOpen={!!editingManufacturer}
        onClose={() => setEditingManufacturer(null)}
      />
      <EditDesignerModal
        designer={editingDesigner as Designer}
        isOpen={!!editingDesigner}
        onClose={() => setEditingDesigner(null)}
      />
      <EditDriverModal
        driver={editingDriver as Driver}
        isOpen={!!editingDriver}
        onClose={() => setEditingDriver(null)}
      />
    </div>
  );
};

export default SettingsPage;
