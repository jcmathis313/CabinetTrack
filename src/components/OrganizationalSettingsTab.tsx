import React, { useState, useRef } from 'react';
import { Building, Upload, Trash2, Save, Copy } from 'lucide-react';
import { useOrder } from '../contexts/OrderContext';
import { useAuth } from '../contexts/AuthContext';
import { OrganizationalSettings } from '../types';

const OrganizationalSettingsTab: React.FC = () => {
  const { organizationalSettings, updateOrganizationalSettings } = useOrder();
  const { user } = useAuth();
  const [formData, setFormData] = useState<OrganizationalSettings>(organizationalSettings);
  
  console.log('OrganizationalSettingsTab: organizationalSettings from context:', organizationalSettings);
  console.log('OrganizationalSettingsTab: formData state:', formData);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('Uploading logo file:', file.name, 'Size:', file.size, 'bytes');
      
      // Check file size (limit to 1MB)
      if (file.size > 1024 * 1024) {
        alert('Logo file is too large. Please use an image smaller than 1MB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const logoUrl = event.target?.result as string;
          console.log('Logo URL generated, length:', logoUrl.length);
          
          // Compress the image if it's too large
          let finalLogoUrl = logoUrl;
          if (logoUrl.length > 500000) { // If base64 is larger than ~500KB
            console.log('Logo is large, attempting to compress...');
            finalLogoUrl = await compressImage(logoUrl, 800, 600); // Max 800x600
            console.log('Compressed logo length:', finalLogoUrl.length);
          }
          
          const updatedSettings = { ...formData, logoUrl: finalLogoUrl };
          setFormData(updatedSettings);
          
          // Save to Supabase via context
          const success = await updateOrganizationalSettings(updatedSettings);
          console.log('Logo upload save result:', success);
          if (!success) {
            alert('Failed to save logo. Please try again.');
          }
        } catch (error) {
          console.error('Error processing logo:', error);
          alert('Error processing logo. Please try again.');
        }
      };
      reader.onerror = () => {
        console.error('Error reading file');
        alert('Error reading logo file. Please try again.');
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper function to compress images
  const compressImage = (dataUrl: string, maxWidth: number, maxHeight: number): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Calculate new dimensions
        let { width, height } = img;
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8)); // Compress to JPEG with 80% quality
      };
      img.src = dataUrl;
    });
  };

  const handleRemoveLogo = async () => {
    console.log('Removing logo');
    const updatedSettings = { ...formData, logoUrl: undefined };
    setFormData(updatedSettings);
    
    // Save to Supabase via context
    const success = await updateOrganizationalSettings(updatedSettings);
    console.log('Logo remove save result:', success);
    if (!success) {
      alert('Failed to remove logo. Please try again.');
    }
  };

  const handleSave = async () => {
    console.log('Saving organizational settings:', formData);
    
    // Test saving without logo first
    const testSettings = {
      ...formData,
      logoUrl: undefined // Temporarily remove logo for testing
    };
    
    console.log('Testing save without logo:', testSettings);
    const success = await updateOrganizationalSettings(testSettings);
    console.log('Save result (without logo):', success);
    
    if (success) {
      // Now try saving with logo if it exists
      if (formData.logoUrl) {
        console.log('Now trying to save with logo...');
        const logoSuccess = await updateOrganizationalSettings(formData);
        console.log('Save result (with logo):', logoSuccess);
        if (!logoSuccess) {
          alert('Company information saved, but logo failed to save. Please try uploading a smaller image.');
          return;
        }
      }
      
      setIsEditing(false);
    } else {
      alert('Failed to save settings. Please try again.');
    }
  };

  const handleCancel = () => {
    setFormData(organizationalSettings);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCopySlug = async () => {
    if (user?.organization?.slug) {
      try {
        await navigator.clipboard.writeText(user.organization.slug);
        // You could add a toast notification here if you have a toast system
        alert('Organization slug copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy slug:', error);
        alert('Failed to copy slug to clipboard');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-medium text-gray-900">Organizational Settings</h3>
        </div>
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="btn-secondary"
          >
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn-primary flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Information */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900">Company Information</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="input w-full"
              placeholder="Enter company name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Address
            </label>
            <textarea
              name="companyAddress"
              value={formData.companyAddress}
              onChange={handleInputChange}
              disabled={!isEditing}
              rows={3}
              className="input w-full"
              placeholder="Enter company address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Phone
            </label>
            <input
              type="tel"
              name="companyPhone"
              value={formData.companyPhone}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="input w-full"
              placeholder="Enter company phone number"
            />
          </div>
        </div>

        {/* Logo Management */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900">Company Logo</h4>
          
          <div className="space-y-4">
            {formData.logoUrl ? (
              <div className="space-y-3">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <img
                    src={formData.logoUrl}
                    alt="Company Logo"
                    className="max-w-full h-32 object-contain mx-auto"
                  />
                </div>
                {isEditing && (
                  <button
                    onClick={handleRemoveLogo}
                    className="btn-secondary flex items-center gap-2 w-full justify-center"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove Logo
                  </button>
                )}
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-2">No logo uploaded</p>
                {isEditing && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-secondary"
                  >
                    Upload Logo
                  </button>
                )}
              </div>
            )}
            
            {isEditing && !formData.logoUrl && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-primary flex items-center gap-2 w-full justify-center"
              >
                <Upload className="h-4 w-4" />
                Upload Logo
              </button>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {!isEditing && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Current Settings</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Company:</span>
              <p className="text-gray-900">{formData.companyName || 'Not set'}</p>
            </div>
            <div>
              <span className="text-gray-500">Phone:</span>
              <p className="text-gray-900">{formData.companyPhone || 'Not set'}</p>
            </div>
            <div>
              <span className="text-gray-500">Logo:</span>
              <p className="text-gray-900">{formData.logoUrl ? 'Uploaded' : 'Not uploaded'}</p>
            </div>
            <div>
              <span className="text-gray-500">Organization Slug:</span>
              <div className="flex items-center gap-2">
                <p className="text-gray-900 font-mono text-xs bg-white px-2 py-1 rounded border">
                  {user?.organization?.slug || 'Not available'}
                </p>
                {user?.organization?.slug && (
                  <button
                    onClick={handleCopySlug}
                    className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                    title="Copy slug to clipboard"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationalSettingsTab;
