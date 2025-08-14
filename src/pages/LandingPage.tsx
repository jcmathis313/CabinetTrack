import { Link } from 'react-router-dom';
import { Package, Truck, RotateCcw, Users, Shield, Zap, BarChart3, CheckCircle } from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      icon: Package,
      title: 'Order Management',
      description: 'Track and manage cabinet orders from creation to delivery with real-time status updates.'
    },
    {
      icon: Truck,
      title: 'Pickup Coordination',
      description: 'Organize and schedule pickups efficiently with driver assignments and route optimization.'
    },
    {
      icon: RotateCcw,
      title: 'Returns Processing',
      description: 'Handle returns and exchanges with detailed tracking and customer communication.'
    },
    {
      icon: BarChart3,
      title: 'Analytics & Reporting',
      description: 'Get insights into your operations with comprehensive reports and performance metrics.'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Work together seamlessly with role-based access and real-time updates.'
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with data backup and 99.9% uptime guarantee.'
    }
  ];

  const benefits = [
    'Reduce order processing time by 50%',
    'Improve customer satisfaction with real-time tracking',
    'Eliminate manual data entry errors',
    'Streamline communication between teams',
    'Get actionable insights from your data',
    'Scale your operations without complexity'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Package className="h-8 w-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">CabinetTrack</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Streamline Your
              <span className="text-indigo-600"> Cabinet Business</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              CabinetTrack is a simple solution for managing orders, pickups, and returns for your cabintry supply business. 
              Built for cabinet suppliers who want to scale efficiently and stay organized.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors inline-flex items-center justify-center"
              >
                <Zap className="h-5 w-5 mr-2" />
                Start Free Trial
              </Link>
              <Link
                to="/login"
                className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors inline-flex items-center justify-center"
              >
                View Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed specifically for cabinet manufacturers and distributors.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Transform Your Operations
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Join hundreds of cabinet manufacturers who have revolutionized their business with CabinetTrack.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-xl p-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Package className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Order #12345</h3>
                    <p className="text-sm text-gray-600">Kitchen Cabinet Set</p>
                  </div>
                  <div className="ml-auto">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      In Production
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Truck className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Pickup #789</h3>
                    <p className="text-sm text-gray-600">Scheduled for tomorrow</p>
                  </div>
                  <div className="ml-auto">
                    <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium">
                      Assigned
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <RotateCcw className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Return #456</h3>
                    <p className="text-sm text-gray-600">Damaged item</p>
                  </div>
                  <div className="ml-auto">
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                      Processing
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands of cabinet manufacturers who trust CabinetTrack to manage their operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="bg-white text-indigo-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
            >
              Start Your Free Trial
            </Link>
            <Link
              to="/login"
              className="border border-indigo-300 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors inline-flex items-center justify-center"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Package className="h-8 w-8 text-indigo-400" />
                <span className="text-xl font-bold">CabinetTrack</span>
              </div>
              <p className="text-gray-400">
                The complete solution for cabinet manufacturers to manage orders, pickups, and returns efficiently.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CabinetTrack. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
