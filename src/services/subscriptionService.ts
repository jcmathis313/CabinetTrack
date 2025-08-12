import { supabase } from '../config/supabase'
import { SubscriptionPlan, UsageMetrics, Organization } from '../types'

export class SubscriptionService {
  // Get available subscription plans
  static async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      console.log('SubscriptionService: Fetching subscription plans...');
      
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true })

      console.log('SubscriptionService: Raw data from supabase:', data);
      console.log('SubscriptionService: Error from supabase:', error);

      if (error) throw error

      const mappedPlans = data?.map(plan => ({
        id: plan.id,
        name: plan.name,
        price: plan.price,
        currency: plan.currency,
        interval: plan.interval,
        features: plan.features,
        isActive: plan.is_active
      })) || []
      
      console.log('SubscriptionService: Mapped plans:', mappedPlans);
      
      // If no plans found in database, return default plans
      if (mappedPlans.length === 0) {
        console.log('SubscriptionService: No plans found in database, returning default plans');
        const defaultPlans = [
          {
            id: 'free-plan',
            name: 'free',
            price: 0.00,
            currency: 'USD',
            interval: 'month',
            features: {
              maxUsers: 3,
              maxOrders: 50,
              maxPickups: 20,
              maxManufacturers: 5,
              maxDesigners: 5,
              maxDrivers: 3,
              advancedReporting: false,
              apiAccess: false,
              prioritySupport: false,
              customBranding: false
            },
            isActive: true
          },
          {
            id: 'pro-plan',
            name: 'pro',
            price: 29.99,
            currency: 'USD',
            interval: 'month',
            features: {
              maxUsers: 25,
              maxOrders: 1000,
              maxPickups: 500,
              maxManufacturers: 50,
              maxDesigners: 50,
              maxDrivers: 25,
              advancedReporting: true,
              apiAccess: true,
              prioritySupport: false,
              customBranding: false
            },
            isActive: true
          },
          {
            id: 'enterprise-plan',
            name: 'enterprise',
            price: 99.99,
            currency: 'USD',
            interval: 'month',
            features: {
              maxUsers: -1,
              maxOrders: -1,
              maxPickups: -1,
              maxManufacturers: -1,
              maxDesigners: -1,
              maxDrivers: -1,
              advancedReporting: true,
              apiAccess: true,
              prioritySupport: true,
              customBranding: true
            },
            isActive: true
          }
        ];
        console.log('SubscriptionService: Returning default plans:', defaultPlans);
        return defaultPlans as SubscriptionPlan[];
      }
      
      return mappedPlans;
    } catch (error) {
      console.error('Error loading subscription plans:', error)
      console.log('SubscriptionService: Returning empty array due to error');
      return []
    }
  }

  // Get current organization's usage metrics
  static async getUsageMetrics(): Promise<UsageMetrics | null> {
    try {
      // Use custom authentication system with localStorage
      const userData = localStorage.getItem('authUser')
      if (!userData) return null
      
      const user = JSON.parse(userData)
      const organizationId = user.organizationId
      
      if (!organizationId) return null

      // Get organization details
      const { data: orgData } = await supabase
        .from('organizations')
        .select('plan')
        .eq('id', organizationId)
        .single()

      if (!orgData) return null

      // Get current usage counts
      const [usersCount, ordersCount, pickupsCount] = await Promise.all([
        this.getUsersCount(organizationId),
        this.getOrdersCount(organizationId),
        this.getPickupsCount(organizationId)
      ])

      // Get plan limits
      const planLimits = this.getPlanLimits(orgData.plan)

      // Calculate current period (monthly billing cycle)
      const now = new Date()
      const currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const currentPeriodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

      return {
        organizationId,
        currentPeriod: {
          start: currentPeriodStart,
          end: currentPeriodEnd
        },
        users: {
          total: usersCount,
          active: usersCount, // For now, assume all users are active
          limit: planLimits.maxUsers
        },
        orders: {
          total: ordersCount,
          limit: planLimits.maxOrders
        },
        pickups: {
          total: pickupsCount,
          limit: planLimits.maxPickups
        },
        storage: {
          used: 0, // TODO: Implement storage tracking
          limit: planLimits.maxUsers * 100 // 100MB per user as example
        },
        lastUpdated: now
      }
    } catch (error) {
      console.error('Error getting usage metrics:', error)
      return null
    }
  }

  // Check if organization can perform an action based on their plan
  static async checkUsageLimit(action: 'create_user' | 'create_order' | 'create_pickup'): Promise<{ allowed: boolean; reason?: string }> {
    try {
      const metrics = await this.getUsageMetrics()
      if (!metrics) {
        return { allowed: false, reason: 'Unable to verify usage limits' }
      }

      switch (action) {
        case 'create_user':
          if (metrics.users.total >= metrics.users.limit) {
            return { 
              allowed: false, 
              reason: `User limit reached (${metrics.users.total}/${metrics.users.limit}). Upgrade your plan to add more users.` 
            }
          }
          break

        case 'create_order':
          if (metrics.orders.total >= metrics.orders.limit) {
            return { 
              allowed: false, 
              reason: `Order limit reached (${metrics.orders.total}/${metrics.orders.limit}). Upgrade your plan to create more orders.` 
            }
          }
          break

        case 'create_pickup':
          if (metrics.pickups.total >= metrics.pickups.limit) {
            return { 
              allowed: false, 
              reason: `Pickup limit reached (${metrics.pickups.total}/${metrics.pickups.limit}). Upgrade your plan to create more pickups.` 
            }
          }
          break
      }

      return { allowed: true }
    } catch (error) {
      console.error('Error checking usage limit:', error)
      return { allowed: false, reason: 'Error checking usage limits' }
    }
  }

  // Upgrade organization's subscription plan
  static async upgradePlan(planName: 'pro' | 'enterprise'): Promise<{ success: boolean; error?: string }> {
    try {
      // Use custom authentication system with localStorage
      const userData = localStorage.getItem('authUser')
      if (!userData) {
        return { success: false, error: 'Not authenticated' }
      }
      
      const user = JSON.parse(userData)
      const organizationId = user.organizationId
      
      if (!organizationId) {
        return { success: false, error: 'Organization not found' }
      }

      if (user.role !== 'admin') {
        return { success: false, error: 'Only administrators can upgrade plans' }
      }

      // Update organization plan
      const { error } = await supabase
        .from('organizations')
        .update({ 
          plan: planName,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.organizationId)

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('Error upgrading plan:', error)
      return { success: false, error: 'Failed to upgrade plan' }
    }
  }

  // Get billing history for organization
  static async getBillingHistory(): Promise<any[]> {
    try {
      // Use custom authentication system with localStorage
      const userData = localStorage.getItem('authUser')
      if (!userData) return []
      
      const user = JSON.parse(userData)
      const organizationId = user.organizationId
      
      if (!organizationId) return []

      // TODO: Implement billing history retrieval
      // This would typically integrate with Stripe or another payment processor
      return []
    } catch (error) {
      console.error('Error getting billing history:', error)
      return []
    }
  }

  // Private helper methods
  private static async getUsersCount(organizationId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .eq('is_active', true)

      if (error) throw error
      return count || 0
    } catch (error) {
      console.error('Error counting users:', error)
      return 0
    }
  }

  private static async getOrdersCount(organizationId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)

      if (error) throw error
      return count || 0
    } catch (error) {
      console.error('Error counting orders:', error)
      return 0
    }
  }

  private static async getPickupsCount(organizationId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('pickups')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)

      if (error) throw error
      return count || 0
    } catch (error) {
      console.error('Error counting pickups:', error)
      return 0
    }
  }

  private static getPlanLimits(plan: string) {
    switch (plan) {
      case 'free':
        return {
          maxUsers: 3,
          maxOrders: 50,
          maxPickups: 20,
          maxManufacturers: 5,
          maxDesigners: 5,
          maxDrivers: 3
        }
      case 'pro':
        return {
          maxUsers: 25,
          maxOrders: 1000,
          maxPickups: 500,
          maxManufacturers: 50,
          maxDesigners: 50,
          maxDrivers: 25
        }
      case 'enterprise':
        return {
          maxUsers: -1, // Unlimited
          maxOrders: -1, // Unlimited
          maxPickups: -1, // Unlimited
          maxManufacturers: -1, // Unlimited
          maxDesigners: -1, // Unlimited
          maxDrivers: -1 // Unlimited
        }
      default:
        return {
          maxUsers: 3,
          maxOrders: 50,
          maxPickups: 20,
          maxManufacturers: 5,
          maxDesigners: 5,
          maxDrivers: 3
        }
    }
  }
}
