import { Order, Pickup, Source, Designer, Driver, OrganizationalSettings } from '../types';

const STORAGE_KEYS = {
  ORDERS: 'cabinet_track_orders',
  PICKUPS: 'cabinet_track_pickups',
  SOURCES: 'cabinet_track_sources',
  DESIGNERS: 'cabinet_track_designers',
  DRIVERS: 'cabinet_track_drivers'
};

export class StorageService {
  // Orders
  static getOrders(): Order[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (data) {
        const orders = JSON.parse(data);
        return orders.map((order: any) => ({
          ...order,
          createdAt: new Date(order.createdAt),
          updatedAt: new Date(order.updatedAt)
        }));
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }
    return [];
  }

  static saveOrders(orders: Order[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch (error) {
      console.error('Error saving orders:', error);
    }
  }

  // Pickups
  static getPickups(): Pickup[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PICKUPS);
      if (data) {
        const pickups = JSON.parse(data);
        return pickups.map((pickup: any) => ({
          ...pickup,
          scheduledDate: new Date(pickup.scheduledDate),
          createdAt: new Date(pickup.createdAt),
          updatedAt: new Date(pickup.updatedAt)
        }));
      }
    } catch (error) {
      console.error('Error loading pickups:', error);
    }
    return [];
  }

  static savePickups(pickups: Pickup[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PICKUPS, JSON.stringify(pickups));
    } catch (error) {
      console.error('Error saving pickups:', error);
    }
  }

  // Sources
  static getSources(): Source[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SOURCES);
      if (data) {
        const sources = JSON.parse(data);
        return sources.map((source: any) => ({
          ...source,
          createdAt: new Date(source.createdAt),
          updatedAt: new Date(source.updatedAt)
        }));
      }
    } catch (error) {
      console.error('Error loading sources:', error);
    }
    return [];
  }

  static saveSources(sources: Source[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SOURCES, JSON.stringify(sources));
    } catch (error) {
      console.error('Error saving sources:', error);
    }
  }

  // Designers
  static getDesigners(): Designer[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DESIGNERS);
      if (data) {
        const designers = JSON.parse(data);
        return designers.map((designer: any) => ({
          ...designer,
          createdAt: new Date(designer.createdAt),
          updatedAt: new Date(designer.updatedAt)
        }));
      }
    } catch (error) {
      console.error('Error loading designers:', error);
    }
    return [];
  }

  static saveDesigners(designers: Designer[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DESIGNERS, JSON.stringify(designers));
    } catch (error) {
      console.error('Error saving designers:', error);
    }
  }

  // Drivers
  static getDrivers(): Driver[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DRIVERS);
      if (data) {
        const drivers = JSON.parse(data);
        return drivers.map((driver: any) => ({
          ...driver,
          createdAt: new Date(driver.createdAt),
          updatedAt: new Date(driver.updatedAt)
        }));
      }
    } catch (error) {
      console.error('Error loading drivers:', error);
    }
    return [];
  }

  static saveDrivers(drivers: Driver[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(drivers));
    } catch (error) {
      console.error('Error saving drivers:', error);
    }
  }

  // Organizational Settings
  static getOrganizationalSettings(): OrganizationalSettings {
    try {
      const data = localStorage.getItem('organizationalSettings');
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading organizational settings:', error);
    }
    
    return {
      id: '',
      organizationId: '',
      companyName: '',
      companyAddress: '',
      companyPhone: '',
      logoUrl: undefined,
      mobileIconUrl: undefined
    };
  }

  static saveOrganizationalSettings(settings: OrganizationalSettings): void {
    try {
      localStorage.setItem('organizationalSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving organizational settings:', error);
    }
  }

  // Clear all data
  static clearAll(): void {
    try {
      localStorage.removeItem('orders');
      localStorage.removeItem('pickups');
      localStorage.removeItem('sources');
      localStorage.removeItem('designers');
      localStorage.removeItem('drivers');
      localStorage.removeItem('organizationalSettings');
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
}
