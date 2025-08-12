import { supabase } from '../config/supabase'
import { Order, Pickup, Manufacturer, Designer, Driver, OrganizationalSettings } from '../types'

export class SupabaseService {
  // Helper method to get current user's organization ID
  private static async getCurrentOrganizationId(): Promise<string | null> {
    try {
      // Use custom authentication system with localStorage
      const userData = localStorage.getItem('authUser')
      console.log('SupabaseService: Raw user data from localStorage:', userData)
      
      if (!userData) {
        console.log('SupabaseService: No user data found in localStorage')
        return null
      }
      
      const user = JSON.parse(userData)
      console.log('SupabaseService: Parsed user object:', user)
      console.log('SupabaseService: User organizationId:', user.organizationId)
      
      return user.organizationId || null
    } catch (error) {
      console.error('Error getting organization ID:', error)
      return null
    }
  }

  // Orders
  static async getOrders(): Promise<Order[]> {
    try {
      const organizationId = await this.getCurrentOrganizationId()
      if (!organizationId) return []

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data?.map(order => ({
        id: order.id,
        organizationId: order.organization_id,
        jobName: order.job_name,
        jobNumber: order.job_number,
        orderNumber: order.order_number,
        purchaseOrder: order.purchase_order,
        designerId: order.designer_id,
        cost: order.cost,
        sourceId: order.manufacturer_id,
        destinationName: order.destination_name,
        status: order.status,
        priority: order.priority,
        pickupId: order.pickup_id,
        createdAt: new Date(order.created_at),
        updatedAt: new Date(order.updated_at)
      })) || []
    } catch (error) {
      console.error('Error loading orders:', error)
      return []
    }
  }

  static async saveOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order | null> {
    try {
      console.log('SupabaseService: Attempting to save order:', order)
      const organizationId = await this.getCurrentOrganizationId()
      console.log('SupabaseService: Organization ID:', organizationId)
      if (!organizationId) {
        console.error('SupabaseService: No organization ID found')
        return null
      }

      const now = new Date().toISOString()
      // Map camelCase fields to snake_case for database
      const dbOrder = {
        organization_id: organizationId,
        job_name: order.jobName,
        job_number: order.jobNumber,
        order_number: order.orderNumber,
        purchase_order: order.purchaseOrder,
        designer_id: order.designerId,
        cost: order.cost,
        manufacturer_id: order.manufacturerId,
        destination_name: order.destinationName,
        status: order.status,
        priority: order.priority,
        pickup_id: order.pickupId,
        created_at: now,
        updated_at: now
      }
      
      console.log('SupabaseService: Inserting order data:', dbOrder)
      const { data, error } = await supabase
        .from('orders')
        .insert([dbOrder])
        .select()
        .single()

      if (error) {
        console.error('SupabaseService: Database error:', error)
        throw error
      }

      console.log('SupabaseService: Order saved successfully:', data)
      return data ? {
        ...data,
        organizationId: data.organization_id,
        jobName: data.job_name,
        jobNumber: data.job_number,
        orderNumber: data.order_number,
        purchaseOrder: data.purchase_order,
        designerId: data.designer_id,
        sourceId: data.manufacturer_id,
        destinationName: data.destination_name,
        pickupId: data.pickup_id,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      } : null
    } catch (error) {
      console.error('SupabaseService: Error saving order:', error)
      return null
    }
  }

  static async updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
    try {
      const organizationId = await this.getCurrentOrganizationId()
      if (!organizationId) return null

      const now = new Date().toISOString()
      // Map camelCase fields to snake_case for database
      const dbUpdates: any = { updated_at: now }
      if (updates.jobName !== undefined) dbUpdates.job_name = updates.jobName
      if (updates.jobNumber !== undefined) dbUpdates.job_number = updates.jobNumber
      if (updates.orderNumber !== undefined) dbUpdates.order_number = updates.orderNumber
      if (updates.purchaseOrder !== undefined) dbUpdates.purchase_order = updates.purchaseOrder
      if (updates.designerId !== undefined) dbUpdates.designer_id = updates.designerId
      if (updates.cost !== undefined) dbUpdates.cost = updates.cost
      if (updates.manufacturerId !== undefined) dbUpdates.manufacturer_id = updates.manufacturerId
      if (updates.destinationName !== undefined) dbUpdates.destination_name = updates.destinationName
      if (updates.status !== undefined) dbUpdates.status = updates.status
      if (updates.priority !== undefined) dbUpdates.priority = updates.priority
      if (updates.pickupId !== undefined) dbUpdates.pickup_id = updates.pickupId
      
      const { data, error } = await supabase
        .from('orders')
        .update(dbUpdates)
        .eq('id', id)
        .eq('organization_id', organizationId)
        .select()
        .single()

      if (error) throw error

      return data ? {
        ...data,
        organizationId: data.organization_id,
        jobName: data.job_name,
        jobNumber: data.job_number,
        orderNumber: data.order_number,
        purchaseOrder: data.purchase_order,
        designerId: data.designer_id,
        sourceId: data.manufacturer_id,
        destinationName: data.destination_name,
        pickupId: data.pickup_id,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      } : null
    } catch (error) {
      console.error('Error updating order:', error)
      return null
    }
  }

  static async deleteOrder(id: string): Promise<boolean> {
    try {
      const organizationId = await this.getCurrentOrganizationId()
      if (!organizationId) return false

      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id)
        .eq('organization_id', organizationId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting order:', error)
      return false
    }
  }

  // Pickups
  static async getPickups(): Promise<Pickup[]> {
    try {
      const organizationId = await this.getCurrentOrganizationId()
      if (!organizationId) return []

      const { data, error } = await supabase
        .from('pickups')
        .select('*')
        .eq('organization_id', organizationId)
        .order('scheduled_date', { ascending: true })

      if (error) throw error

      return data?.map(pickup => ({
        id: pickup.id,
        organizationId: pickup.organization_id,
        name: pickup.name,
        orders: pickup.orders,
        driverId: pickup.driver_id,
        status: pickup.status,
        priority: pickup.priority,
        scheduledDate: new Date(pickup.scheduled_date),
        createdAt: new Date(pickup.created_at),
        updatedAt: new Date(pickup.updated_at)
      })) || []
    } catch (error) {
      console.error('Error loading pickups:', error)
      return []
    }
  }

  static async savePickup(pickup: Omit<Pickup, 'id' | 'createdAt' | 'updatedAt'>): Promise<Pickup | null> {
    try {
      const organizationId = await this.getCurrentOrganizationId()
      if (!organizationId) return null

      const now = new Date().toISOString()
      // Map camelCase fields to snake_case for database
      const dbPickup = {
        organization_id: organizationId,
        name: pickup.name,
        orders: pickup.orders,
        driver_id: pickup.driverId,
        status: pickup.status,
        priority: pickup.priority,
        scheduled_date: pickup.scheduledDate.toISOString(),
        created_at: now,
        updated_at: now
      }
      
      const { data, error } = await supabase
        .from('pickups')
        .insert([dbPickup])
        .select()
        .single()

      if (error) throw error

      return data ? {
        id: data.id,
        organizationId: data.organization_id,
        name: data.name,
        orders: data.orders,
        driverId: data.driver_id,
        status: data.status,
        priority: data.priority,
        scheduledDate: new Date(data.scheduled_date),
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      } : null
    } catch (error) {
      console.error('Error saving pickup:', error)
      return null
    }
  }

  static async updatePickup(id: string, updates: Partial<Pickup>): Promise<Pickup | null> {
    try {
      const organizationId = await this.getCurrentOrganizationId()
      if (!organizationId) return null

      const now = new Date().toISOString()
      // Map camelCase fields to snake_case for database
      const dbUpdates: any = { updated_at: now }
      if (updates.name !== undefined) dbUpdates.name = updates.name
      if (updates.orders !== undefined) dbUpdates.orders = updates.orders
      if (updates.driverId !== undefined) dbUpdates.driver_id = updates.driverId
      if (updates.status !== undefined) dbUpdates.status = updates.status
      if (updates.priority !== undefined) dbUpdates.priority = updates.priority
      if (updates.scheduledDate !== undefined) dbUpdates.scheduled_date = updates.scheduledDate.toISOString()
      
      const { data, error } = await supabase
        .from('pickups')
        .update(dbUpdates)
        .eq('id', id)
        .eq('organization_id', organizationId)
        .select()
        .single()

      if (error) throw error

      return data ? {
        id: data.id,
        organizationId: data.organization_id,
        name: data.name,
        orders: data.orders,
        driverId: data.driver_id,
        status: data.status,
        priority: data.priority,
        scheduledDate: new Date(data.scheduled_date),
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      } : null
    } catch (error) {
      console.error('Error updating pickup:', error)
      return null
    }
  }

  static async deletePickup(id: string): Promise<boolean> {
    try {
      const organizationId = await this.getCurrentOrganizationId()
      if (!organizationId) return false

      const { error } = await supabase
        .from('pickups')
        .delete()
        .eq('id', id)
        .eq('organization_id', organizationId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting pickup:', error)
      return false
    }
  }

  // Manufacturers
  static async getSources(): Promise<Source[]> {
    try {
      const organizationId = await this.getCurrentOrganizationId()
      if (!organizationId) return []

      const { data, error } = await supabase
        .from('sources')
        .select('*')
        .eq('organization_id', organizationId)
        .order('name', { ascending: true })

      if (error) throw error

      return data?.map(manufacturer => ({
        id: source.id,
        organizationId: source.organization_id,
        name: source.name,
        address: source.address,
        phoneNumber: source.phone_number,
        mainContact: source.main_contact,
        createdAt: new Date(source.created_at),
        updatedAt: new Date(source.updated_at)
      })) || []
    } catch (error) {
      console.error('Error loading sources:', error)
      return []
    }
  }

  static async saveSource(manufacturer: Omit<Manufacturer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Manufacturer | null> {
    try {
      console.log('SupabaseService: Attempting to save manufacturer:', manufacturer)
      const organizationId = await this.getCurrentOrganizationId()
      console.log('SupabaseService: Organization ID:', organizationId)
      if (!organizationId) {
        console.error('SupabaseService: No organization ID found')
        return null
      }

      const now = new Date().toISOString()
      // Map camelCase fields to snake_case for database
      const dbManufacturer = {
        organization_id: organizationId,
        name: source.name,
        address: source.address,
        phone_number: source.phoneNumber,
        main_contact: source.mainContact,
        created_at: now,
        updated_at: now
      }
      
      console.log('SupabaseService: Inserting manufacturer data:', dbManufacturer)
      const { data, error } = await supabase
        .from('sources')
        .insert([dbManufacturer])
        .select()
        .single()

      if (error) {
        console.error('SupabaseService: Database error:', error)
        throw error
      }

      console.log('SupabaseService: Source saved successfully:', data)
      return data ? {
        ...data,
        organizationId: data.organization_id,
        phoneNumber: data.phone_number,
        mainContact: data.main_contact,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      } : null
    } catch (error) {
      console.error('Error saving manufacturer:', error)
      return null
    }
  }

  static async updateSource(id: string, updates: Partial<Manufacturer>): Promise<Manufacturer | null> {
    try {
      const organizationId = await this.getCurrentOrganizationId()
      if (!organizationId) return null

      const now = new Date().toISOString()
      // Map camelCase fields to snake_case for database
      const dbUpdates: any = { updated_at: now }
      if (updates.name !== undefined) dbUpdates.name = updates.name
      if (updates.address !== undefined) dbUpdates.address = updates.address
      if (updates.phoneNumber !== undefined) dbUpdates.phone_number = updates.phoneNumber
      if (updates.mainContact !== undefined) dbUpdates.main_contact = updates.mainContact
      
      const { data, error } = await supabase
        .from('sources')
        .update(dbUpdates)
        .eq('id', id)
        .eq('organization_id', organizationId)
        .select()
        .single()

      if (error) throw error

      return data ? {
        ...data,
        organizationId: data.organization_id,
        phoneNumber: data.phone_number,
        mainContact: data.main_contact,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      } : null
    } catch (error) {
      console.error('Error updating manufacturer:', error)
      return null
    }
  }

  static async deleteSource(id: string): Promise<boolean> {
    try {
      const organizationId = await this.getCurrentOrganizationId()
      if (!organizationId) return false

      const { error } = await supabase
        .from('sources')
        .delete()
        .eq('id', id)
        .eq('organization_id', organizationId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting manufacturer:', error)
      return false
    }
  }

  // Designers
  static async getDesigners(): Promise<Designer[]> {
    try {
      const organizationId = await this.getCurrentOrganizationId()
      if (!organizationId) return []

      const { data, error } = await supabase
        .from('designers')
        .select('*')
        .eq('organization_id', organizationId)
        .order('name', { ascending: true })

      if (error) throw error

      return data?.map(designer => ({
        ...designer,
        organizationId: designer.organization_id,
        createdAt: new Date(designer.created_at),
        updatedAt: new Date(designer.updated_at)
      })) || []
    } catch (error) {
      console.error('Error loading designers:', error)
      return []
    }
  }

  static async saveDesigner(designer: Omit<Designer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Designer | null> {
    try {
      console.log('SupabaseService: Attempting to save designer:', designer)
      const organizationId = await this.getCurrentOrganizationId()
      console.log('SupabaseService: Organization ID:', organizationId)
      if (!organizationId) {
        console.error('SupabaseService: No organization ID found')
        return null
      }

      const now = new Date().toISOString()
      // Map camelCase fields to snake_case for database
      const designerData = {
        organization_id: organizationId,
        name: designer.name,
        email: designer.email,
        phone: designer.phone,
        created_at: now,
        updated_at: now
      }
      console.log('SupabaseService: Inserting designer data:', designerData)
      
      const { data, error } = await supabase
        .from('designers')
        .insert([designerData])
        .select()
        .single()

      if (error) {
        console.error('SupabaseService: Database error:', error)
        throw error
      }

      console.log('SupabaseService: Designer saved successfully:', data)
      return data ? {
        ...data,
        organizationId: data.organization_id,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      } : null
    } catch (error) {
      console.error('Error saving designer:', error)
      return null
    }
  }

  static async updateDesigner(id: string, updates: Partial<Designer>): Promise<Designer | null> {
    try {
      const organizationId = await this.getCurrentOrganizationId()
      if (!organizationId) return null

      const now = new Date().toISOString()
      const { data, error } = await supabase
        .from('designers')
        .update({ ...updates, updated_at: now })
        .eq('id', id)
        .eq('organization_id', organizationId)
        .select()
        .single()

      if (error) throw error

      return data ? {
        ...data,
        organizationId: data.organization_id,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      } : null
    } catch (error) {
      console.error('Error updating designer:', error)
      return null
    }
  }

  static async deleteDesigner(id: string): Promise<boolean> {
    try {
      const organizationId = await this.getCurrentOrganizationId()
      if (!organizationId) return false

      const { error } = await supabase
        .from('designers')
        .delete()
        .eq('id', id)
        .eq('organization_id', organizationId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting designer:', error)
      return false
    }
  }

  // Drivers
  static async getDrivers(): Promise<Driver[]> {
    try {
      const organizationId = await this.getCurrentOrganizationId()
      if (!organizationId) return []

      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('organization_id', organizationId)
        .order('name', { ascending: true })

      if (error) throw error

      return data?.map(driver => ({
        ...driver,
        organizationId: driver.organization_id,
        createdAt: new Date(driver.created_at),
        updatedAt: new Date(driver.updated_at)
      })) || []
    } catch (error) {
      console.error('Error loading drivers:', error)
      return []
    }
  }

  static async saveDriver(driver: Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>): Promise<Driver | null> {
    try {
      const organizationId = await this.getCurrentOrganizationId()
      if (!organizationId) return null

      const now = new Date().toISOString()
      // Map camelCase fields to snake_case for database
      const driverData = {
        organization_id: organizationId,
        name: driver.name,
        email: driver.email,
        phone: driver.phone,
        vehicle: driver.vehicle,
        created_at: now,
        updated_at: now
      }
      const { data, error } = await supabase
        .from('drivers')
        .insert([driverData])
        .select()
        .single()

      if (error) throw error

      return data ? {
        ...data,
        organizationId: data.organization_id,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      } : null
    } catch (error) {
      console.error('Error saving driver:', error)
      return null
    }
  }

  static async updateDriver(id: string, updates: Partial<Driver>): Promise<Driver | null> {
    try {
      const organizationId = await this.getCurrentOrganizationId()
      if (!organizationId) return null

      const now = new Date().toISOString()
      const { data, error } = await supabase
        .from('drivers')
        .update({ ...updates, updated_at: now })
        .eq('id', id)
        .eq('organization_id', organizationId)
        .select()
        .single()

      if (error) throw error

      return data ? {
        ...data,
        organizationId: data.organization_id,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      } : null
    } catch (error) {
      console.error('Error updating driver:', error)
      return null
    }
  }

  static async deleteDriver(id: string): Promise<boolean> {
    try {
      const organizationId = await this.getCurrentOrganizationId()
      if (!organizationId) return false

      const { error } = await supabase
        .from('drivers')
        .delete()
        .eq('id', id)
        .eq('organization_id', organizationId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting driver:', error)
      return false
    }
  }

  // Organizational Settings
  static async getOrganizationalSettings(): Promise<OrganizationalSettings> {
    try {
      console.log('SupabaseService: Getting organizational settings...');
      
      const organizationId = await this.getCurrentOrganizationId()
      console.log('SupabaseService: Organization ID for settings:', organizationId);
      
      if (!organizationId) {
        console.log('SupabaseService: No organization ID, returning default settings');
        return {
          id: '',
          organizationId: '',
          companyName: '',
          companyAddress: '',
          companyPhone: '',
          logoUrl: undefined,
          mobileIconUrl: undefined
        }
      }

      console.log('SupabaseService: Querying organizational_settings table...');
      const { data, error } = await supabase
        .from('organizational_settings')
        .select('*')
        .eq('organization_id', organizationId)
        .single()

      console.log('SupabaseService: Query result - data:', data, 'error:', error);

      if (error) {
        console.error('SupabaseService: Database error:', error);
        throw error;
      }

      const result = data ? {
        id: data.id,
        organizationId: data.organization_id,
        companyName: data.company_name,
        companyAddress: data.company_address,
        companyPhone: data.company_phone,
        logoUrl: data.logo_url,
        mobileIconUrl: data.mobile_icon_url
      } : {
        id: '',
        organizationId,
        companyName: '',
        companyAddress: '',
        companyPhone: '',
        logoUrl: undefined,
        mobileIconUrl: undefined
      };
      
      console.log('SupabaseService: Returning settings:', result);
      return result;
    } catch (error) {
      console.error('Error loading organizational settings:', error)
      return {
        id: '',
        organizationId: '',
        companyName: '',
        companyAddress: '',
        companyPhone: '',
        logoUrl: undefined,
        mobileIconUrl: undefined
      }
    }
  }

  static async saveOrganizationalSettings(settings: OrganizationalSettings): Promise<boolean> {
    try {
      console.log('SupabaseService: Saving organizational settings:', settings);
      
      const organizationId = await this.getCurrentOrganizationId()
      console.log('SupabaseService: Organization ID:', organizationId);
      
      if (!organizationId) {
        console.log('SupabaseService: No organization ID found');
        return false;
      }

      const now = new Date().toISOString()
      // Map camelCase fields to snake_case for database
      const dbSettings = {
        organization_id: organizationId,
        company_name: settings.companyName,
        company_address: settings.companyAddress,
        company_phone: settings.companyPhone,
        logo_url: settings.logoUrl,
        mobile_icon_url: settings.mobileIconUrl,
        created_at: now,
        updated_at: now
      }
      
      console.log('SupabaseService: Database settings:', dbSettings);
      
      // Check if logo_url is too long
      if (dbSettings.logo_url && dbSettings.logo_url.length > 1000000) {
        console.error('SupabaseService: Logo URL is too long:', dbSettings.logo_url.length, 'characters');
        throw new Error('Logo URL is too long. Please use a smaller image.');
      }
      
      // Check if mobile_icon_url is too long
      if (dbSettings.mobile_icon_url && dbSettings.mobile_icon_url.length > 500000) {
        console.error('SupabaseService: Mobile icon URL is too long:', dbSettings.mobile_icon_url.length, 'characters');
        throw new Error('Mobile icon URL is too long. Please use a smaller image.');
      }
      
      // First, check if a record already exists
      const { data: existingData, error: checkError } = await supabase
        .from('organizational_settings')
        .select('id')
        .eq('organization_id', organizationId)
        .single();
      
      console.log('SupabaseService: Existing record check - data:', existingData, 'error:', checkError);
      
      let result;
      if (existingData) {
        // Update existing record
        console.log('SupabaseService: Updating existing record with ID:', existingData.id);
        result = await supabase
          .from('organizational_settings')
          .update({
            company_name: dbSettings.company_name,
            company_address: dbSettings.company_address,
            company_phone: dbSettings.company_phone,
            logo_url: dbSettings.logo_url,
            mobile_icon_url: dbSettings.mobile_icon_url,
            updated_at: dbSettings.updated_at
          })
          .eq('id', existingData.id)
          .select();
      } else {
        // Insert new record
        console.log('SupabaseService: Inserting new record');
        result = await supabase
          .from('organizational_settings')
          .insert([dbSettings])
          .select();
      }

      console.log('SupabaseService: Operation result - data:', result.data, 'error:', result.error);

      if (result.error) {
        console.error('SupabaseService: Database error details:', result.error);
        throw result.error;
      }
      
      console.log('SupabaseService: Settings saved successfully');
      return true
    } catch (error) {
      console.error('Error saving organizational settings:', error)
      return false
    }
  }
}
