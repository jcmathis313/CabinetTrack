import jsPDF from 'jspdf';
import { Pickup, Order, Manufacturer, Designer, Driver } from '../types';

export class PDFService {
  static async exportPickupPDF(pickup: Pickup, orders: Order[], manufacturers: Manufacturer[], designers: Designer[], driver: Driver | undefined) {
    const doc = new jsPDF('landscape');
    
    // Get company settings from localStorage
    const organizationalSettings = this.getOrganizationalSettings();
    
    // Simple header
    this.addSimpleHeader(doc, organizationalSettings);
    
    // Pickup information
    this.addPickupInfo(doc, pickup, driver);
    
    // Orders table
    this.addOrdersTable(doc, orders, manufacturers, designers);
    
    // Simple footer
    this.addSimpleFooter(doc, organizationalSettings);
    
    // Save the PDF
    doc.save(`pickup-${pickup.name}-${pickup.scheduledDate.toLocaleDateString()}.pdf`);
  }

  static async exportAllPickupsPDF(pickups: Pickup[], orders: Order[], manufacturers: Manufacturer[], designers: Designer[], drivers: Driver[]) {
    const doc = new jsPDF('landscape');
    
    // Get company settings from localStorage
    const organizationalSettings = this.getOrganizationalSettings();
    
    // Simple header
    this.addSimpleHeader(doc, organizationalSettings);
    
    // Title
    doc.setFontSize(16);
    doc.text('Pickup Schedule', 20, 60);
    
    // Subtitle
    doc.setFontSize(12);
    doc.text(`Generated on ${new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`, 20, 68);
    
    let yPosition = 80;
    
    pickups.forEach((pickup, index) => {
      if (yPosition > 220) {
        doc.addPage();
        yPosition = 20;
        this.addSimpleHeader(doc, organizationalSettings);
      }
      
      // Pickup summary
      this.addPickupSummary(doc, pickup, orders, manufacturers, designers, drivers, yPosition);
      yPosition += 35;
    });
    
    // Simple footer
    this.addSimpleFooter(doc, organizationalSettings);
    
    // Save the PDF
    doc.save(`pickup-schedule-${new Date().toLocaleDateString()}.pdf`);
  }

  private static getOrganizationalSettings() {
    try {
      const data = localStorage.getItem('organizationalSettings');
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading organizational settings:', error);
    }
    
    return {
      companyName: 'Company Name',
      companyAddress: 'Company Address',
      companyPhone: 'Company Phone',
      logoUrl: undefined
    };
  }

  private static addSimpleHeader(doc: jsPDF, settings: any) {
    const pageWidth = doc.internal.pageSize.width;
    
    // Company name
    doc.setFontSize(16);
    doc.text(settings.companyName || 'Company Name', 20, 12);
    
    // Company address
    doc.setFontSize(10);
    doc.text(settings.companyAddress || 'Company Address', 20, 18);
    
    // Document title
    doc.setFontSize(14);
    doc.text('SHIPPING TICKET', pageWidth - 20, 18, { align: 'right' });
    
    // Date and time
    doc.setFontSize(10);
    doc.text(`Date: ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })}`, pageWidth - 20, 24, { align: 'right' });
    
    doc.text(`Time: ${new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`, pageWidth - 20, 30, { align: 'right' });
    
    // Simple line separator
    doc.line(20, 35, pageWidth - 20, 35);
  }

  private static addPickupInfo(doc: jsPDF, pickup: Pickup, driver: Driver | undefined) {
    // Section title
    doc.setFontSize(14);
    doc.text('PICKUP INFORMATION', 20, 45);
    
    // Pickup details
    doc.setFontSize(10);
    doc.text(`Pickup Name: ${pickup.name}`, 20, 53);
    doc.text(`Scheduled Date: ${pickup.scheduledDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`, 20, 59);
    doc.text(`Priority: ${pickup.priority.charAt(0).toUpperCase() + pickup.priority.slice(1)}`, 20, 65);
    doc.text(`Status: ${pickup.status.charAt(0).toUpperCase() + pickup.status.slice(1)}`, 20, 71);
    
    // Driver information
    if (driver) {
      doc.text(`Driver: ${driver.name}`, 120, 53);
      doc.text(`Phone: ${driver.phone}`, 120, 59);
      doc.text(`Vehicle: ${driver.vehicle}`, 120, 65);
    }
  }

  private static addOrdersTable(doc: jsPDF, orders: Order[], manufacturers: Manufacturer[], designers: Designer[]) {
    // Section title
    doc.setFontSize(14);
    doc.text('ORDERS TO PICKUP', 20, 85);
    
    // Table headers - updated to match requested fields with better spacing for landscape
    const columns = ['Job Name', 'Job Number', 'Order Number', 'Purchase Order', 'Manufacturer', 'Destination'];
    const columnWidths = [60, 35, 35, 40, 45, 50];
    const startX = 20;
    const startY = 93;
    
    // Draw table headers
    let x = startX;
    columns.forEach((column, index) => {
      doc.setFontSize(9);
      doc.text(column, x + 3, startY);
      x += columnWidths[index];
    });
    
    // Draw table rows
    let y = startY + 4;
    orders.forEach((order, index) => {
      if (y > 200) {
        doc.addPage();
        y = 20;
        this.addSimpleHeader(doc, { companyName: 'Company Name' });
      }
      
      const manufacturer = manufacturers.find(m => m.id === order.manufacturerId);
      
      x = startX;
      doc.setFontSize(8);
      
      // Job Name (truncated if too long)
      const jobName = order.jobName.length > 25 ? 
        order.jobName.substring(0, 25) + '...' : order.jobName;
      doc.text(jobName, x + 3, y);
      x += columnWidths[0];
      
      // Job Number
      doc.text(order.jobNumber || 'N/A', x + 3, y);
      x += columnWidths[1];
      
      // Order Number
      doc.text(order.orderNumber || 'N/A', x + 3, y);
      x += columnWidths[2];
      
      // Purchase Order
      doc.text(order.purchaseOrder || 'N/A', x + 3, y);
      x += columnWidths[3];
      
      // Manufacturer
      doc.text(manufacturer?.name || 'N/A', x + 3, y);
      x += columnWidths[4];
      
      // Destination
      doc.text(order.destinationName || 'N/A', x + 3, y);
      
      y += 4;
    });
  }

  private static addPickupSummary(doc: jsPDF, pickup: Pickup, orders: Order[], manufacturers: Manufacturer[], designers: Designer[], drivers: Driver[], yPosition: number) {
    // Pickup name
    doc.setFontSize(12);
    doc.text(pickup.name, 20, yPosition);
    
    // Pickup details
    doc.setFontSize(9);
    doc.text(`Date: ${pickup.scheduledDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })}`, 20, yPosition + 5);
    
    doc.text(`Priority: ${pickup.priority.charAt(0).toUpperCase() + pickup.priority.slice(1)}`, 20, yPosition + 10);
    
    const driver = drivers.find(d => d.id === pickup.driverId);
    if (driver) {
      doc.text(`Driver: ${driver.name}`, 120, yPosition + 5);
      doc.text(`Vehicle: ${driver.vehicle}`, 120, yPosition + 10);
    }
    
    const pickupOrders = orders.filter(order => order.pickupId === pickup.id);
    doc.text(`Orders: ${pickupOrders.length}`, 120, yPosition);
    
    // Total cost
    const totalCost = pickupOrders.reduce((total, order) => {
      return total + (order?.cost || 0);
    }, 0);
    
    doc.text(`Total: $${totalCost.toFixed(2)}`, 120, yPosition + 15);
  }

  private static addSimpleFooter(doc: jsPDF, settings: any) {
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Simple line separator
    doc.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20);
    
    // Footer information
    doc.setFontSize(8);
    doc.text(`Generated by ${settings.companyName || 'Company Name'}`, 20, pageHeight - 15);
    doc.text('This document serves as an official pickup authorization', pageWidth - 20, pageHeight - 15, { align: 'right' });
    
    // Page number
    doc.text(`Page ${doc.getCurrentPageInfo().pageNumber}`, pageWidth / 2, pageHeight - 3, { align: 'center' });
  }
}