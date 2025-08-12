import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useOrder } from '../contexts/OrderContext';
import { Source } from '../types';

interface EditSourceModalProps {
  source: Source;
  isOpen: boolean;
  onClose: () => void;
}

const EditSourceModal: React.FC<EditSourceModalProps> = ({ source, isOpen, onClose }) => {
  const { updateSource } = useOrder();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phoneNumber: '',
    mainContact: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (source) {
      setFormData({
        name: source.name,
        address: source.address,
        phoneNumber: source.phoneNumber,
        mainContact: source.mainContact
      });
    }
  }, [source]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const result = await updateSource(source.id, formData);
      if (result) {
        onClose();
      }
    } catch (error) {
      console.error('Error updating Source:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Source</h2>
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
              Source Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="input"
              placeholder="Enter Source name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address *
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              rows={3}
              className="input"
              placeholder="Enter address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              className="input"
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Main Contact *
            </label>
            <input
              type="text"
              name="mainContact"
              value={formData.mainContact}
              onChange={handleChange}
              required
              className="input"
              placeholder="Enter main contact name"
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
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Source'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSourceModal;
