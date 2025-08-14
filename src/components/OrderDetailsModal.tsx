import React, { useState, useEffect } from 'react';
import { X, Plus, Calendar, Clock, MapPin, User, Building, DollarSign, FileText, Truck, Download } from 'lucide-react';
import { Order, OrderStatus, OrderPriority, Source, Designer, Pickup } from '../types';
import { useOrder } from '../contexts/OrderContext';
import jsPDF from 'jspdf';

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

interface OrderNote {
  id: string;
  text: string;
  timestamp: Date;
  author: string;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, isOpen, onClose }) => {
  const { sources, designers, pickups } = useOrder();
  const [notes, setNotes] = useState<OrderNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Get related entities
  const source = order ? sources.find(s => s.id === order.sourceId) : null;
  const designer = order ? designers.find(d => d.id === order.designerId) : null;
  const pickup = order?.pickupId ? pickups.find(p => p.id === order.pickupId) : null;

  // Load notes from localStorage when order changes
  useEffect(() => {
    if (order) {
      const savedNotes = localStorage.getItem(`order-notes-${order.id}`);
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes).map((note: any) => ({
          ...note,
          timestamp: new Date(note.timestamp)
        })));
      } else {
        setNotes([]);
      }
    }
  }, [order]);

  // Save notes to localStorage
  const saveNotes = (newNotes: OrderNote[]) => {
    if (order) {
      localStorage.setItem(`order-notes-${order.id}`, JSON.stringify(newNotes));
    }
  };

  const handleAddNote = () => {
    if (newNote.trim() && order) {
      const note: OrderNote = {
        id: Date.now().toString(),
        text: newNote.trim(),
        timestamp: new Date(),
        author: 'User' // In a real app, this would come from user authentication
      };
      
      const updatedNotes = [note, ...notes];
      setNotes(updatedNotes);
      saveNotes(updatedNotes);
      setNewNote('');
      setIsAddingNote(false);
    }
  };

  const handleDeleteNote = (noteId: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      const updatedNotes = notes.filter(note => note.id !== noteId);
      setNotes(updatedNotes);
      saveNotes(updatedNotes);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'bg-gray-100 text-gray-800';
      case OrderStatus.IN_PROGRESS:
        return 'bg-indigo-100 text-indigo-800';
      case OrderStatus.READY_FOR_PICKUP:
        return 'bg-yellow-100 text-yellow-800';
      case OrderStatus.PICKED_UP:
        return 'bg-orange-100 text-orange-800';
      case OrderStatus.IN_TRANSIT:
        return 'bg-purple-100 text-purple-800';
      case OrderStatus.DELIVERED:
        return 'bg-green-100 text-green-800';
      case OrderStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: OrderPriority) => {
    switch (priority) {
      case OrderPriority.LOW:
        return 'bg-gray-100 text-gray-800';
      case OrderPriority.STANDARD:
        return 'bg-indigo-100 text-indigo-800';
      case OrderPriority.HIGH:
        return 'bg-orange-100 text-orange-800';
      case OrderPriority.URGENT:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const generateOrderPDF = () => {
    if (!order) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('ORDER DETAILS', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Order Information Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Order Information', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Job Name: ${order.jobName}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Job Number: ${order.jobNumber}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Order Number: ${order.orderNumber}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Purchase Order: ${order.purchaseOrder}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Cost: $${order.cost.toLocaleString()}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Status: ${order.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Priority: ${order.priority.charAt(0).toUpperCase() + order.priority.slice(1)}`, 20, yPosition);
    yPosition += 15;

    // Related Entities Section
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Related Entities', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    // Designer
    if (designer) {
      doc.text(`Designer: ${designer.name}`, 20, yPosition);
      yPosition += 7;
      if (designer.email) {
        doc.text(`Email: ${designer.email}`, 20, yPosition);
        yPosition += 7;
      }
      if (designer.phone) {
        doc.text(`Phone: ${designer.phone}`, 20, yPosition);
        yPosition += 7;
      }
      yPosition += 5;
    }

    // Source
    if (source) {
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(`Source: ${source.name}`, 20, yPosition);
      yPosition += 7;
      if (source.address) {
        doc.text(`Address: ${source.address}`, 20, yPosition);
        yPosition += 7;
      }
      if (source.phoneNumber) {
        doc.text(`Phone: ${source.phoneNumber}`, 20, yPosition);
        yPosition += 7;
      }
      yPosition += 5;
    }

    // Destination
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 20;
    }
    doc.text(`Destination: ${order.destinationName}`, 20, yPosition);
    yPosition += 7;

    // Pickup
    if (pickup) {
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(`Pickup: ${pickup.name}`, 20, yPosition);
      yPosition += 7;
      doc.text(`Scheduled Date: ${new Date(pickup.scheduledDate).toLocaleDateString()}`, 20, yPosition);
      yPosition += 15;
    }

    // Notes Section
    if (yPosition > pageHeight - 80) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Notes', 20, yPosition);
    yPosition += 10;

    if (notes.length === 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('No notes available.', 20, yPosition);
    } else {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      notes.forEach((note, index) => {
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.text(`Note ${index + 1}:`, 20, yPosition);
        yPosition += 7;
        doc.text(`Date: ${note.timestamp.toLocaleString()}`, 20, yPosition);
        yPosition += 7;
        doc.text(`Author: ${note.author}`, 20, yPosition);
        yPosition += 7;
        doc.text(`Content: ${note.text}`, 20, yPosition);
        yPosition += 10;
      });
    }

    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, pageHeight - 10);
    doc.text(`Page ${doc.getCurrentPageInfo().pageNumber}`, pageWidth - 20, pageHeight - 10, { align: 'right' });

    // Save the PDF
    doc.save(`order-${order.orderNumber}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full mx-4 max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Order Details - {order.orderNumber}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={generateOrderPDF}
              className="flex items-center px-3 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              <Download className="h-4 w-4 mr-1.5" />
              Download PDF
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(85vh-80px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Column - Order Information & Status */}
            <div className="space-y-4">
              {/* Basic Order Info */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Order Information
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Job Name:</span>
                    <span className="font-medium text-sm">{order.jobName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Job Number:</span>
                    <span className="font-medium text-sm">{order.jobNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Order Number:</span>
                    <span className="font-medium text-sm">{order.orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Purchase Order:</span>
                    <span className="font-medium text-sm">{order.purchaseOrder}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Cost:</span>
                    <span className="font-medium text-sm text-green-600">${order.cost.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Status & Priority */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="text-base font-semibold text-gray-900 mb-3">Status & Priority</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Status:</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Priority:</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(order.priority)}`}>
                      {order.priority.charAt(0).toUpperCase() + order.priority.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Related Entities */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="text-base font-semibold text-gray-900 mb-3">Related Entities</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center text-gray-600 mb-1">
                      <User className="h-4 w-4 mr-2" />
                      <span className="text-sm">Designer</span>
                    </div>
                    <div className="ml-6">
                      <p className="font-medium text-sm">{designer?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{designer?.email || 'No email'}</p>
                      <p className="text-xs text-gray-500">{designer?.phone || 'No phone'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center text-gray-600 mb-1">
                      <Building className="h-4 w-4 mr-2" />
                      <span className="text-sm">Source</span>
                    </div>
                    <div className="ml-6">
                      <p className="font-medium text-sm">{source?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{source?.address || 'No address'}</p>
                      <p className="text-xs text-gray-500">{source?.phoneNumber || 'No phone'}</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center text-gray-600 mb-1">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="text-sm">Destination</span>
                    </div>
                    <div className="ml-6">
                      <p className="font-medium text-sm">{order.destinationName}</p>
                    </div>
                  </div>

                  {pickup && (
                    <div>
                      <div className="flex items-center text-gray-600 mb-1">
                        <Truck className="h-4 w-4 mr-2" />
                        <span className="text-sm">Pickup</span>
                      </div>
                      <div className="ml-6">
                        <p className="font-medium text-sm">{pickup.name}</p>
                        <p className="text-xs text-gray-500">
                          Scheduled: {new Date(pickup.scheduledDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section - Full Width Below */}
          <div className="mt-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
                <button
                  onClick={() => setIsAddingNote(!isAddingNote)}
                  className="flex items-center px-3 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add Note
                </button>
              </div>

              {/* Add Note Form */}
              {isAddingNote && (
                <div className="mb-4 p-3 bg-white rounded border">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Enter your note here..."
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={3}
                  />
                  <div className="flex justify-end space-x-2 mt-2">
                    <button
                      onClick={() => {
                        setIsAddingNote(false);
                        setNewNote('');
                      }}
                      className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddNote}
                      disabled={!newNote.trim()}
                      className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Add Note
                    </button>
                  </div>
                </div>
              )}

              {/* Notes List */}
              <div className="space-y-3">
                {notes.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-500 text-base">No notes yet. Add your first note above.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notes.map((note) => (
                      <div key={note.id} className="bg-white p-3 rounded border w-full">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-3 w-3 mr-1.5" />
                            {note.timestamp.toLocaleString()}
                          </div>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="text-red-500 hover:text-red-700 text-sm hover:bg-red-50 p-1 rounded"
                          >
                            ×
                          </button>
                        </div>
                        <p className="text-gray-900 mb-1 text-sm">{note.text}</p>
                        <p className="text-xs text-gray-500">By: {note.author}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
