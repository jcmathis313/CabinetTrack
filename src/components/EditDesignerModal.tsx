import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useOrder } from '../contexts/OrderContext';
import { Designer } from '../types';

interface EditDesignerModalProps {
  designer: Designer;
  isOpen: boolean;
  onClose: () => void;
}

const EditDesignerModal: React.FC<EditDesignerModalProps> = ({ designer, isOpen, onClose }) => {
  const { updateDesigner } = useOrder();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    if (designer) {
      setFormData({
        name: designer.name,
        email: designer.email,
        phone: designer.phone
      });
    }
  }, [designer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const success = await updateDesigner(designer.id, formData);
      if (success) {
        onClose();
      } else {
        alert('Failed to update designer. Please try again.');
      }
    } catch (error) {
      console.error('Error updating designer:', error);
      alert('Failed to update designer. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Designer</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Designer Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="input"
              placeholder="Enter designer name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="input"
              placeholder="Enter email address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="input"
              placeholder="Enter phone number"
            />
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
            >
              Update Designer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDesignerModal;
