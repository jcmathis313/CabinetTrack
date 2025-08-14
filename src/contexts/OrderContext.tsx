import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Order, Pickup, Source, Designer, Driver, OrganizationalSettings, Return } from '../types';
import { SupabaseService } from '../services/supabaseService';
import { SubscriptionService } from '../services/subscriptionService';
import { isSupabaseConfigured } from '../config/supabase';

interface OrderState {
  orders: Order[];
  pickups: Pickup[];
  returns: Return[];
  sources: Source[];
  designers: Designer[];
  drivers: Driver[];
  organizationalSettings: OrganizationalSettings;
  loading: boolean;
  error: string | null;
}

type OrderAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ORDERS'; payload: Order[] }
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'UPDATE_ORDER'; payload: Order }
  | { type: 'DELETE_ORDER'; payload: string }
  | { type: 'SET_PICKUPS'; payload: Pickup[] }
  | { type: 'ADD_PICKUP'; payload: Pickup }
  | { type: 'UPDATE_PICKUP'; payload: Pickup }
  | { type: 'DELETE_PICKUP'; payload: string }
  | { type: 'SET_SOURCES'; payload: Source[] }
  | { type: 'ADD_SOURCE'; payload: Source }
  | { type: 'UPDATE_SOURCE'; payload: Source }
  | { type: 'DELETE_SOURCE'; payload: string }
  | { type: 'SET_DESIGNERS'; payload: Designer[] }
  | { type: 'ADD_DESIGNER'; payload: Designer }
  | { type: 'UPDATE_DESIGNER'; payload: Designer }
  | { type: 'DELETE_DESIGNER'; payload: string }
  | { type: 'SET_DRIVERS'; payload: Driver[] }
  | { type: 'ADD_DRIVER'; payload: Driver }
  | { type: 'UPDATE_DRIVER'; payload: Driver }
  | { type: 'DELETE_DRIVER'; payload: string }
  | { type: 'SET_RETURNS'; payload: Return[] }
  | { type: 'ADD_RETURN'; payload: Return }
  | { type: 'UPDATE_RETURN'; payload: Return }
  | { type: 'DELETE_RETURN'; payload: string }
  | { type: 'SET_ORGANIZATIONAL_SETTINGS'; payload: OrganizationalSettings };

const initialState: OrderState = {
  orders: [],
  pickups: [],
  returns: [],
  sources: [],
  designers: [],
  drivers: [],
  organizationalSettings: {
    id: '',
    organizationId: '',
    companyName: '',
    companyAddress: '',
    companyPhone: '',
    logoUrl: undefined,
    mobileIconUrl: undefined
  },
  loading: false,
  error: null
};

const orderReducer = (state: OrderState, action: OrderAction): OrderState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_ORDERS':
      return { ...state, orders: action.payload };
    case 'ADD_ORDER':
      return { ...state, orders: [action.payload, ...state.orders] };
    case 'UPDATE_ORDER':
      return { ...state, orders: state.orders.map(order => order.id === action.payload.id ? action.payload : order) };
    case 'DELETE_ORDER':
      return { ...state, orders: state.orders.filter(order => order.id !== action.payload) };
    case 'SET_PICKUPS':
      return { ...state, pickups: action.payload };
    case 'ADD_PICKUP':
      return { ...state, pickups: [action.payload, ...state.pickups] };
    case 'UPDATE_PICKUP':
      return { ...state, pickups: state.pickups.map(pickup => pickup.id === action.payload.id ? action.payload : pickup) };
    case 'DELETE_PICKUP':
      return { ...state, pickups: state.pickups.filter(pickup => pickup.id !== action.payload) };
    case 'SET_SOURCES':
      return { ...state, sources: action.payload };
    case 'ADD_SOURCE':
      return { ...state, sources: [action.payload, ...state.sources] };
    case 'UPDATE_SOURCE':
      return { ...state, sources: state.sources.map(source => source.id === action.payload.id ? action.payload : source) };
    case 'DELETE_SOURCE':
      return { ...state, sources: state.sources.filter(source => source.id !== action.payload) };
    case 'SET_DESIGNERS':
      return { ...state, designers: action.payload };
    case 'ADD_DESIGNER':
      return { ...state, designers: [action.payload, ...state.designers] };
    case 'UPDATE_DESIGNER':
      return { ...state, designers: state.designers.map(designer => designer.id === action.payload.id ? action.payload : designer) };
    case 'DELETE_DESIGNER':
      return { ...state, designers: state.designers.filter(designer => designer.id !== action.payload) };
    case 'SET_DRIVERS':
      return { ...state, drivers: action.payload };
    case 'ADD_DRIVER':
      return { ...state, drivers: [action.payload, ...state.drivers] };
    case 'UPDATE_DRIVER':
      return { ...state, drivers: state.drivers.map(driver => driver.id === action.payload.id ? action.payload : driver) };
    case 'DELETE_DRIVER':
      return { ...state, drivers: state.drivers.filter(driver => driver.id !== action.payload) };
    case 'SET_RETURNS':
      return { ...state, returns: action.payload };
    case 'ADD_RETURN':
      return { ...state, returns: [action.payload, ...state.returns] };
    case 'UPDATE_RETURN':
      return { ...state, returns: state.returns.map(returnItem => returnItem.id === action.payload.id ? action.payload : returnItem) };
    case 'DELETE_RETURN':
      return { ...state, returns: state.returns.filter(returnItem => returnItem.id !== action.payload) };
    case 'SET_ORGANIZATIONAL_SETTINGS':
      return { ...state, organizationalSettings: action.payload };
    default:
      return state;
  }
};

interface OrderContextType extends OrderState {
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Order | null>;
  updateOrder: (id: string, updates: Partial<Order>) => Promise<Order | null>;
  deleteOrder: (id: string) => Promise<boolean>;
  addPickup: (pickup: Omit<Pickup, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Pickup | null>;
  updatePickup: (id: string, updates: Partial<Pickup>) => Promise<Pickup | null>;
  deletePickup: (id: string) => Promise<boolean>;
  addSource: (Source: Omit<Source, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Source | null>;
  updateSource: (id: string, updates: Partial<Source>) => Promise<Source | null>;
  deleteSource: (id: string) => Promise<boolean>;
  addDesigner: (designer: Omit<Designer, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Designer | null>;
  updateDesigner: (id: string, updates: Partial<Designer>) => Promise<Designer | null>;
  deleteDesigner: (id: string) => Promise<boolean>;
  addDriver: (driver: Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Driver | null>;
  updateDriver: (id: string, updates: Partial<Driver>) => Promise<Driver | null>;
  deleteDriver: (id: string) => Promise<boolean>;
  updateOrganizationalSettings: (settings: OrganizationalSettings) => Promise<boolean>;
  refreshData: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

interface OrderProviderProps {
  children: ReactNode;
}

export const OrderProvider: React.FC<OrderProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(orderReducer, initialState);

  // Load data from Supabase on component mount
  useEffect(() => {
    const loadData = async () => {
      console.log('OrderContext: Starting to load data...');
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      try {
        if (!isSupabaseConfigured) {
          console.log('OrderContext: Using mock data (Supabase not configured)');
          // Set mock data for development when Supabase isn't configured
          const mockOrders: Order[] = [
            {
              id: 'mock-order-1',
              organizationId: 'mock-org-id',
              jobName: 'Kitchen Remodel - Main House',
              jobNumber: 'KR-2024-001',
              orderNumber: 'ORD-001',
              purchaseOrder: 'PO-001',
              designerId: 'mock-designer-1',
              cost: 5000,
              sourceId: 'mock-Source-1',
              destinationName: 'Main House',
              status: 'pending' as any,
              priority: 'high' as any,
              pickupId: undefined,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ];

          const mockPickups: Pickup[] = [
            {
              id: 'mock-pickup-1',
              organizationId: 'mock-org-id',
              name: 'Morning Pickup',
              orders: [],
              driverId: 'mock-driver-1',
              status: 'scheduled' as any,
              priority: 'medium' as any,
              scheduledDate: new Date('2024-01-20'),
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ];

          const mockSources: Source[] = [
            {
              id: 'mock-Source-1',
              organizationId: 'mock-org-id',
              name: 'Sample Cabinet Co.',
              address: '456 Factory St, Industry City, USA',
              phoneNumber: '(555) 123-4567',
              mainContact: 'John Doe',
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ];

          const mockDesigners: Designer[] = [
            {
              id: 'mock-designer-1',
              organizationId: 'mock-org-id',
              name: 'Jane Smith',
              email: 'jane@designstudio.com',
              phone: '(555) 987-6543',
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ];

          const mockDrivers: Driver[] = [
            {
              id: 'mock-driver-1',
              organizationId: 'mock-org-id',
              name: 'Mike Johnson',
              email: 'mike@delivery.com',
              phone: '(555) 456-7890',
              vehicle: '2020 Ford Transit',
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ];

          const mockOrgSettings: OrganizationalSettings = {
            id: 'mock-org-1',
            organizationId: 'mock-org-id',
            companyName: 'Demo Cabinet Company',
            companyAddress: '789 Business Ave, Commerce City, USA',
            companyPhone: '(555) 111-2222',
            logoUrl: undefined,
            mobileIconUrl: undefined
          };

          dispatch({ type: 'SET_ORDERS', payload: mockOrders });
          dispatch({ type: 'SET_PICKUPS', payload: mockPickups });
          dispatch({ type: 'SET_SOURCES', payload: mockSources });
          dispatch({ type: 'SET_DESIGNERS', payload: mockDesigners });
          dispatch({ type: 'SET_DRIVERS', payload: mockDrivers });
          dispatch({ type: 'SET_ORGANIZATIONAL_SETTINGS', payload: mockOrgSettings });
        } else {
          console.log('OrderContext: Loading data from Supabase...');
          const [orders, pickups, sources, designers, drivers, orgSettings] = await Promise.all([
            SupabaseService.getOrders(),
            SupabaseService.getPickups(),
            SupabaseService.getSources(),
            SupabaseService.getDesigners(),
            SupabaseService.getDrivers(),
            SupabaseService.getOrganizationalSettings()
          ]);

          console.log('OrderContext: Data loaded from Supabase:', {
            orders: orders.length,
            pickups: pickups.length,
            sources: sources.length,
            designers: designers.length,
            drivers: drivers.length
          });

          dispatch({ type: 'SET_ORDERS', payload: orders });
          dispatch({ type: 'SET_PICKUPS', payload: pickups });
          dispatch({ type: 'SET_SOURCES', payload: sources });
          dispatch({ type: 'SET_DESIGNERS', payload: designers });
          dispatch({ type: 'SET_DRIVERS', payload: drivers });
          dispatch({ type: 'SET_ORGANIZATIONAL_SETTINGS', payload: orgSettings });
        }
      } catch (error) {
        console.error('OrderContext: Error loading data:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load data' });
      } finally {
        console.log('OrderContext: Finished loading data');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadData();
  }, []);

  // Database operation methods
  const addOrder = async (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order | null> => {
    try {
      console.log('OrderContext: Attempting to add order:', order);
      
      if (!isSupabaseConfigured) {
        // Return mock order for development
        const mockOrder: Order = {
          ...order,
          id: `mock-order-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        dispatch({ type: 'ADD_ORDER', payload: mockOrder });
        return mockOrder;
      }

      // Check usage limits before creating order
      const usageCheck = await SubscriptionService.checkUsageLimit('create_order');
      if (!usageCheck.allowed) {
        dispatch({ type: 'SET_ERROR', payload: usageCheck.reason || 'Usage limit exceeded' });
        return null;
      }

      const result = await SupabaseService.saveOrder(order);
      console.log('OrderContext: Order creation result:', result);
      if (result) {
        dispatch({ type: 'ADD_ORDER', payload: result });
        dispatch({ type: 'SET_ERROR', payload: null });
      }
      return result;
    } catch (error) {
      console.error('OrderContext: Error adding order:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add order' });
      return null;
    }
  };

  const updateOrder = async (id: string, updates: Partial<Order>): Promise<Order | null> => {
    try {
      const result = await SupabaseService.updateOrder(id, updates);
      if (result) {
        dispatch({ type: 'UPDATE_ORDER', payload: result });
        dispatch({ type: 'SET_ERROR', payload: null });
      }
      return result;
    } catch (error) {
      console.error('Error updating order:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update order' });
      return null;
    }
  };

  const deleteOrder = async (id: string): Promise<boolean> => {
    try {
      const success = await SupabaseService.deleteOrder(id);
      if (success) {
        dispatch({ type: 'DELETE_ORDER', payload: id });
        dispatch({ type: 'SET_ERROR', payload: null });
      }
      return success;
    } catch (error) {
      console.error('Error deleting order:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete order' });
      return false;
    }
  };

  const addPickup = async (pickup: Omit<Pickup, 'id' | 'createdAt' | 'updatedAt'>): Promise<Pickup | null> => {
    try {
      // Check usage limits before creating pickup
      const usageCheck = await SubscriptionService.checkUsageLimit('create_pickup');
      if (!usageCheck.allowed) {
        dispatch({ type: 'SET_ERROR', payload: usageCheck.reason || 'Usage limit exceeded' });
        return null;
      }

      const result = await SupabaseService.savePickup(pickup);
      if (result) {
        dispatch({ type: 'ADD_PICKUP', payload: result });
        dispatch({ type: 'SET_ERROR', payload: null });
      }
      return result;
    } catch (error) {
      console.error('Error adding pickup:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add pickup' });
      return null;
    }
  };

  const updatePickup = async (id: string, updates: Partial<Pickup>): Promise<Pickup | null> => {
    try {
      const result = await SupabaseService.updatePickup(id, updates);
      if (result) {
        dispatch({ type: 'UPDATE_PICKUP', payload: result });
        dispatch({ type: 'SET_ERROR', payload: null });
      }
      return result;
    } catch (error) {
      console.error('Error updating pickup:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update pickup' });
      return null;
    }
  };

  const deletePickup = async (id: string): Promise<boolean> => {
    try {
      const success = await SupabaseService.deletePickup(id);
      if (success) {
        dispatch({ type: 'DELETE_PICKUP', payload: id });
        dispatch({ type: 'SET_ERROR', payload: null });
      }
      return success;
    } catch (error) {
      console.error('Error deleting pickup:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete pickup' });
      return false;
    }
  };

  const addSource = async (Source: Omit<Source, 'id' | 'createdAt' | 'updatedAt'>): Promise<Source | null> => {
    try {
      const result = await SupabaseService.saveSource(Source);
      if (result) {
        dispatch({ type: 'ADD_SOURCE', payload: result });
        dispatch({ type: 'SET_ERROR', payload: null });
      }
      return result;
    } catch (error) {
      console.error('Error adding Source:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add Source' });
      return null;
    }
  };

  const updateSource = async (id: string, updates: Partial<Source>): Promise<Source | null> => {
    try {
      const result = await SupabaseService.updateSource(id, updates);
      if (result) {
        dispatch({ type: 'UPDATE_SOURCE', payload: result });
        dispatch({ type: 'SET_ERROR', payload: null });
      }
      return result;
    } catch (error) {
      console.error('Error updating Source:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update Source' });
      return null;
    }
  };

  const deleteSource = async (id: string): Promise<boolean> => {
    try {
      const success = await SupabaseService.deleteSource(id);
      if (success) {
        dispatch({ type: 'DELETE_SOURCE', payload: id });
        dispatch({ type: 'SET_ERROR', payload: null });
      }
      return success;
    } catch (error) {
      console.error('Error deleting Source:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete Source' });
      return false;
    }
  };

  const addDesigner = async (designer: Omit<Designer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Designer | null> => {
    try {
      const result = await SupabaseService.saveDesigner(designer);
      if (result) {
        dispatch({ type: 'ADD_DESIGNER', payload: result });
        dispatch({ type: 'SET_ERROR', payload: null });
      }
      return result;
    } catch (error) {
      console.error('Error adding designer:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add designer' });
      return null;
    }
  };

  const updateDesigner = async (id: string, updates: Partial<Designer>): Promise<Designer | null> => {
    try {
      const result = await SupabaseService.updateDesigner(id, updates);
      if (result) {
        dispatch({ type: 'UPDATE_DESIGNER', payload: result });
        dispatch({ type: 'SET_ERROR', payload: null });
      }
      return result;
    } catch (error) {
      console.error('Error updating designer:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update designer' });
      return null;
    }
  };

  const deleteDesigner = async (id: string): Promise<boolean> => {
    try {
      const success = await SupabaseService.deleteDesigner(id);
      if (success) {
        dispatch({ type: 'DELETE_DESIGNER', payload: id });
        dispatch({ type: 'SET_ERROR', payload: null });
      }
      return success;
    } catch (error) {
      console.error('Error deleting designer:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete designer' });
      return false;
    }
  };

  const addDriver = async (driver: Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>): Promise<Driver | null> => {
    try {
      const result = await SupabaseService.saveDriver(driver);
      if (result) {
        dispatch({ type: 'ADD_DRIVER', payload: result });
        dispatch({ type: 'SET_ERROR', payload: null });
      }
      return result;
    } catch (error) {
      console.error('Error adding driver:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add driver' });
      return null;
    }
  };

  const updateDriver = async (id: string, updates: Partial<Driver>): Promise<Driver | null> => {
    try {
      const result = await SupabaseService.updateDriver(id, updates);
      if (result) {
        dispatch({ type: 'UPDATE_DRIVER', payload: result });
        dispatch({ type: 'SET_ERROR', payload: null });
      }
      return result;
    } catch (error) {
      console.error('Error updating driver:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update driver' });
      return null;
    }
  };

  const deleteDriver = async (id: string): Promise<boolean> => {
    try {
      const success = await SupabaseService.deleteDriver(id);
      if (success) {
        dispatch({ type: 'DELETE_DRIVER', payload: id });
        dispatch({ type: 'SET_ERROR', payload: null });
      }
      return success;
    } catch (error) {
      console.error('Error deleting driver:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete driver' });
      return false;
    }
  };

  const updateOrganizationalSettings = async (settings: OrganizationalSettings): Promise<boolean> => {
    try {
      const success = await SupabaseService.saveOrganizationalSettings(settings);
      if (success) {
        dispatch({ type: 'SET_ORGANIZATIONAL_SETTINGS', payload: settings });
        dispatch({ type: 'SET_ERROR', payload: null });
      }
      return success;
    } catch (error) {
      console.error('Error updating organizational settings:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update organizational settings' });
      return false;
    }
  };

  const refreshData = async (): Promise<void> => {
    const loadData = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      try {
        console.log('OrderContext: Loading data...');
        const [orders, pickups, sources, designers, drivers, orgSettings] = await Promise.all([
          SupabaseService.getOrders(),
          SupabaseService.getPickups(),
          SupabaseService.getSources(),
          SupabaseService.getDesigners(),
          SupabaseService.getDrivers(),
          SupabaseService.getOrganizationalSettings()
        ]);

        console.log('OrderContext: Data loaded - orgSettings:', orgSettings);
        
        dispatch({ type: 'SET_ORDERS', payload: orders });
        dispatch({ type: 'SET_PICKUPS', payload: pickups });
        dispatch({ type: 'SET_SOURCES', payload: sources });
        dispatch({ type: 'SET_DESIGNERS', payload: designers });
        dispatch({ type: 'SET_DRIVERS', payload: drivers });
        dispatch({ type: 'SET_ORGANIZATIONAL_SETTINGS', payload: orgSettings });
      } catch (error) {
        console.error('Error refreshing data:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to refresh data' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    await loadData();
  };

  const value: OrderContextType = {
    ...state,
    addOrder,
    updateOrder,
    deleteOrder,
    addPickup,
    updatePickup,
    deletePickup,
    addSource,
    updateSource,
    deleteSource,
    addDesigner,
    updateDesigner,
    deleteDesigner,
    addDriver,
    updateDriver,
    deleteDriver,
    updateOrganizationalSettings,
    refreshData
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = (): OrderContextType => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};
