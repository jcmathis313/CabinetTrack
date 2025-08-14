import React, { useState, useEffect } from 'react';
import { SubscriptionService } from '../services/subscriptionService';
import { SubscriptionPlan, UsageMetrics } from '../types';
import { useAuth } from '../contexts/AuthContext';

const SubscriptionPage: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [usageMetrics, setUsageMetrics] = useState<UsageMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      console.log('Loading subscription data...');
      
      const [plansData, metricsData] = await Promise.all([
        SubscriptionService.getSubscriptionPlans(),
        SubscriptionService.getUsageMetrics()
      ]);
      
      console.log('Plans data:', plansData);
      console.log('Metrics data:', metricsData);
      
      setPlans(plansData);
      setUsageMetrics(metricsData);
    } catch (error) {
      console.error('Error loading subscription data:', error);
      setError('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planName: 'pro' | 'enterprise') => {
    try {
      setUpgrading(true);
      setError(null);
      
      const result = await SubscriptionService.upgradePlan(planName);
      if (result.success) {
        // Refresh data to show updated plan
        await loadSubscriptionData();
        alert('Plan upgraded successfully!');
      } else {
        setError(result.error || 'Failed to upgrade plan');
      }
    } catch (error) {
      console.error('Error upgrading plan:', error);
      setError('Failed to upgrade plan');
    } finally {
      setUpgrading(false);
    }
  };

  const formatUsagePercentage = (current: number, limit: number): string => {
    if (limit === -1) return 'Unlimited';
    if (limit === 0) return '0%';
    const percentage = Math.round((current / limit) * 100);
    return `${percentage}%`;
  };

  const getCurrentPlan = () => {
    console.log('getCurrentPlan - user:', user);
    console.log('getCurrentPlan - user.organization:', user?.organization);
    console.log('getCurrentPlan - plans:', plans);
    
    if (!user?.organization) {
      console.log('getCurrentPlan - No organization found');
      return null;
    }
    
    console.log('getCurrentPlan - organization.plan:', user.organization.plan);
    
    // If no plan is set, default to 'free'
    const planName = user.organization.plan || 'free';
    console.log('getCurrentPlan - using plan name:', planName);
    
    const currentPlan = plans.find(plan => plan.name === planName);
    console.log('getCurrentPlan - found plan:', currentPlan);
    return currentPlan;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading subscription information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Subscription & Billing</h1>
          <p className="mt-2 text-gray-600">
            Manage your subscription plan and view usage metrics
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Current Plan Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Plan</h2>
          {getCurrentPlan() ? (
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 capitalize">
                  {getCurrentPlan()?.name} Plan
                </h3>
                <p className="text-gray-600 mt-1">
                  ${getCurrentPlan()?.price}/{getCurrentPlan()?.interval}
                </p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">No active plan found</p>
          )}
        </div>

        {/* Usage Metrics Section */}
        {usageMetrics && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Usage This Month</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Users</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {usageMetrics.users.total}
                  <span className="text-sm font-normal text-gray-500">
                    / {usageMetrics.users.limit === -1 ? 'Unlimited' : usageMetrics.users.limit}
                  </span>
                </p>
                <div className="mt-2">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full" 
                      style={{ 
                        width: usageMetrics.users.limit === -1 ? '100%' : 
                          `${Math.min((usageMetrics.users.total / usageMetrics.users.limit) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Orders</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {usageMetrics.orders.total}
                  <span className="text-sm font-normal text-gray-500">
                    / {usageMetrics.orders.limit === -1 ? 'Unlimited' : usageMetrics.orders.limit}
                  </span>
                </p>
                <div className="mt-2">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ 
                        width: usageMetrics.orders.limit === -1 ? '100%' : 
                          `${Math.min((usageMetrics.orders.total / usageMetrics.orders.limit) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Pickups</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {usageMetrics.pickups.total}
                  <span className="text-sm font-normal text-gray-500">
                    / {usageMetrics.pickups.limit === -1 ? 'Unlimited' : usageMetrics.pickups.limit}
                  </span>
                </p>
                <div className="mt-2">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ 
                        width: usageMetrics.pickups.limit === -1 ? '100%' : 
                          `${Math.min((usageMetrics.pickups.total / usageMetrics.pickups.limit) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Storage</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {usageMetrics.storage.used} MB
                  <span className="text-sm font-normal text-gray-500">
                    / {usageMetrics.storage.limit} MB
                  </span>
                </p>
                <div className="mt-2">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-600 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min((usageMetrics.storage.used / usageMetrics.storage.limit) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Available Plans Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Available Plans</h2>
          <div className="text-sm text-gray-600 mb-4">
            Debug: {plans.length} plans loaded
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isCurrentPlan = user?.organization?.plan === plan.name;
              const isUpgrade = !isCurrentPlan && (
                (plan.name === 'pro' && user?.organization?.plan === 'free') ||
                (plan.name === 'enterprise' && user?.organization?.plan !== 'enterprise')
              );

              return (
                <div 
                  key={plan.id} 
                  className={`relative rounded-lg border-2 p-6 ${
                    isCurrentPlan 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {isCurrentPlan && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-600 text-white">
                        Current Plan
                      </span>
                    </div>
                  )}

                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-900 capitalize mb-2">
                      {plan.name} Plan
                    </h3>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-gray-900">
                        ${plan.price}
                      </span>
                      <span className="text-gray-500">/{plan.interval}</span>
                    </div>

                    <ul className="text-left space-y-3 mb-6">
                      <li className="flex items-center">
                        <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {plan.features.maxUsers === -1 ? 'Unlimited' : plan.features.maxUsers} Users
                      </li>
                      <li className="flex items-center">
                        <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {plan.features.maxOrders === -1 ? 'Unlimited' : plan.features.maxOrders} Orders
                      </li>
                      <li className="flex items-center">
                        <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {plan.features.maxPickups === -1 ? 'Unlimited' : plan.features.maxPickups} Pickups
                      </li>
                      {plan.features.advancedReporting && (
                        <li className="flex items-center">
                          <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Advanced Reporting
                        </li>
                      )}
                      {plan.features.apiAccess && (
                        <li className="flex items-center">
                          <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          API Access
                        </li>
                      )}
                      {plan.features.prioritySupport && (
                        <li className="flex items-center">
                          <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Priority Support
                        </li>
                      )}
                      {plan.features.customBranding && (
                        <li className="flex items-center">
                          <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Custom Branding
                        </li>
                      )}
                    </ul>

                    {isCurrentPlan ? (
                      <button
                        disabled
                        className="w-full bg-gray-300 text-gray-500 px-4 py-2 rounded-md font-medium cursor-not-allowed"
                      >
                        Current Plan
                      </button>
                    ) : isUpgrade ? (
                      <button
                        onClick={() => handleUpgrade(plan.name as 'pro' | 'enterprise')}
                        disabled={upgrading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-4 py-2 rounded-md font-medium transition-colors"
                      >
                        {upgrading ? 'Upgrading...' : 'Upgrade'}
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full bg-gray-300 text-gray-500 px-4 py-2 rounded-md font-medium cursor-not-allowed"
                      >
                        Downgrade Not Available
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
