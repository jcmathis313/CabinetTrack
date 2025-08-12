import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useOrder } from '../contexts/OrderContext';
import { Source, Designer, Driver } from '../types';

type EntityType = 'Source' | 'designer' | 'driver';
type Entity = Source | Designer | Driver;

interface EntityFormProps {
  entity?: Entity;
  entityType: EntityType;
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
}

const EntityForm: React.FC<EntityFormProps> = ({ entity, entityType, isOpen, onClose, mode }) => {
  const { addSource, addDesigner, addDriver, updateSource, updateDesigner, updateDriver } = useOrder();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    vehicle: '',
    licenseNumber: ''
  });

  useEffect(() => {
    if (entity && mode === 'edit') {
      setFormData({
        name: entity.name,
        phone: 'phone' in entity ? entity.phone || '' : '',
        email: 'email' in entity ? entity.email || '' : '',
        address: 'address' in entity ? entity.address || '' : '',
        vehicle: 'vehicle' in entity ? entity.vehicle || '' : '',
        licenseNumber: 'licenseNumber' in entity ? (entity.licenseNumber as string) || '' : ''
      });
    } else {
      // Reset form for create mode
      setFormData({
        name: '',
        phone: '',
        email: '',
        address: '',
        vehicle: '',
        licenseNumber: ''
      });
    }
  }, [entity, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'create') {
      const newEntity = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      switch (entityType) {
        case 'Source':
          await addSource(newEntity as unknown as Omit<Source, 'id' | 'createdAt' | 'updatedAt'>);
          break;
        case 'designer':
          await addDesigner(newEntity as unknown as Omit<Designer, 'id' | 'createdAt' | 'updatedAt'>);
          break;
        case 'driver':
          await addDriver(newEntity as unknown as Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>);
          break;
      }
    } else if (entity) {
      const updatedEntity = {
        ...entity,
        ...formData,
        updatedAt: new Date()
      };

      switch (entityType) {
        case 'Source':
          await updateSource(entity.id, updatedEntity as Partial<Source>);
          break;
        case 'designer':
          await updateDesigner(entity.id, updatedEntity as Partial<Designer>);
          break;
        case 'driver':
          await updateDriver(entity.id, updatedEntity as Partial<Driver>);
          break;
      }
    }
    
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  const getTitle = () => {
    const action = mode === 'create' ? 'Create' : 'Edit';
    const entityName = entityType.charAt(0).toUpperCase() + entityType.slice(1);
    return `${action} ${entityName}`;
  };

  const getRequiredFields = () => {
    switch (entityType) {
      case 'Source':
      case 'designer':
        return ['name', 'phone', 'email'];
      case 'driver':
        return ['name', 'phone', 'vehicle', 'licenseNumber'];
      default:
        return ['name'];
    }
  };

  const isFieldRequired = (fieldName: string) => {
    return getRequiredFields().includes(fieldName);
  };

  const shouldShowField = (fieldName: string) => {
    switch (fieldName) {
      case 'vehicle':
      case 'licenseNumber':
        return entityType === 'driver';
      default:
        return true;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{getTitle()}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="input"
              placeholder={`Enter ${entityType} name`}
            />
          </div>

          {shouldShowField('phone') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone {isFieldRequired('phone') ? '*' : ''}
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required={isFieldRequired('phone')}
                className="input"
                placeholder="Enter phone number"
              />
            </div>
          )}

          {shouldShowField('email') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email {isFieldRequired('email') ? '*' : ''}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required={isFieldRequired('email')}
                className="input"
                placeholder="Enter email address"
              />
            </div>
          )}

          {shouldShowField('address') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="input"
                placeholder="Enter address"
              />
            </div>
          )}

          {shouldShowField('vehicle') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle *
              </label>
              <input
                type="text"
                name="vehicle"
                value={formData.vehicle}
                onChange={handleChange}
                required
                className="input"
                placeholder="Enter vehicle information"
              />
            </div>
          )}

          {shouldShowField('licenseNumber') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                License Number *
              </label>
              <input
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                required
                className="input"
                placeholder="Enter license number"
              />
            </div>
          )}

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
              {mode === 'create' ? `Create ${entityType.charAt(0).toUpperCase() + entityType.slice(1)}` : `Update ${entityType.charAt(0).toUpperCase() + entityType.slice(1)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EntityForm;
