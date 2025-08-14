export interface Organization {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  plan: 'free' | 'pro' | 'enterprise';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Add subscription details
  subscriptionId?: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
  trialEnd?: Date;
}

export interface SubscriptionPlan {
  id: string;
  name: 'free' | 'pro' | 'enterprise';
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: {
    maxUsers: number;
    maxOrders: number;
    maxPickups: number;
    maxSources: number;
    maxDesigners: number;
    maxDrivers: number;
    advancedReporting: boolean;
    apiAccess: boolean;
    prioritySupport: boolean;
    customBranding: boolean;
  };
  isActive: boolean;
}

export interface UsageMetrics {
  organizationId: string;
  currentPeriod: {
    start: Date;
    end: Date;
  };
  users: {
    total: number;
    active: number;
    limit: number;
  };
  orders: {
    total: number;
    limit: number;
  };
  pickups: {
    total: number;
    limit: number;
  };
  storage: {
    used: number; // in MB
    limit: number; // in MB
  };
  lastUpdated: Date;
}

export interface User {
  id: string;
  organizationId: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'user';
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  // Add user limits based on plan
  permissions: {
    canManageUsers: boolean;
    canManageBilling: boolean;
    canViewReports: boolean;
    canManageSettings: boolean;
  };
}

export interface AuthUser {
  id: string;
  organizationId: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'user';
  organization: Organization;
  permissions: {
    canManageUsers: boolean;
    canManageBilling: boolean;
    canViewReports: boolean;
    canManageSettings: boolean;
  };
}

export interface Order {
  id: string;
  organizationId: string;
  jobName: string;
  jobNumber: string;
  orderNumber: string;
  purchaseOrder: string;
  designerId: string;
  cost: number;
  sourceId: string;
  destinationName: string;
  status: OrderStatus;
  priority: OrderPriority;
  pickupId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Pickup {
  id: string;
  organizationId: string;
  name: string;
  orders: string[]; // Order IDs
  driverId: string;
  status: PickupStatus;
  priority: PickupPriority;
  scheduledDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Source {
  id: string;
  organizationId: string;
  name: string;
  address: string;
  phoneNumber: string;
  mainContact: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Designer {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Driver {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  phone: string;
  vehicle: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum OrderStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  READY_FOR_PICKUP = 'ready_for_pickup',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export enum PickupStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ARCHIVED = 'archived'
}

export enum ReturnStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ARCHIVED = 'archived'
}

export enum PickupPriority {
  LOW = 'low',
  STANDARD = 'standard',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum OrderPriority {
  LOW = 'low',
  STANDARD = 'standard',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface TableColumn {
  key: keyof Order;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, order: Order) => React.ReactNode;
}

export interface FilterOption {
  key: keyof Order;
  value: string;
  label: string;
}

export interface PickupFilter {
  status?: PickupStatus;
  driverId?: string;
  priority?: PickupPriority;
  dateRange?: {
    start: Date;
    end: Date;
  };
  showArchived?: boolean;
}

export interface Return {
  id: string;
  organizationId: string;
  name: string;
  orders: string[]; // Array of order IDs
  driverId?: string;
  status: ReturnStatus;
  priority: PickupPriority;
  scheduledDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReturnFilter {
  status?: ReturnStatus;
  driverId?: string;
  priority?: PickupPriority;
  dateRange?: {
    start: Date;
    end: Date;
  };
  showArchived?: boolean;
}

export interface OrganizationalSettings {
  id: string;
  organizationId: string;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  logoUrl?: string;
  mobileIconUrl?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  organizationSlug: string;
}

export interface SignupCredentials {
  organizationName: string;
  organizationSlug: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
}

export interface PasswordResetRequest {
  email: string;
  organizationSlug: string;
}

export interface PasswordReset {
  token: string;
  password: string;
}
