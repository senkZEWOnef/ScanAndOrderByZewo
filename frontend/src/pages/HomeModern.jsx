import { Link } from "react-router-dom";

export default function HomeModern() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-purple-700">
      {/* Hero Section */}
      <div className="container mx-auto px-4">
        <div className="min-h-screen flex items-center">
          <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
            <div className="text-white space-y-6">
              <div>
                <span className="inline-block bg-white text-blue-600 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                  🚀 #1 Food Truck Solution
                </span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Turn Your Food Truck Into a 
                <span className="text-yellow-400"> Digital Empire</span>
              </h1>
              <p className="text-xl lg:text-2xl leading-relaxed opacity-90">
                Eliminate long lines forever. Let customers scan, order, and pay instantly. 
                <strong> Boost revenue by 40%</strong> with our contactless ordering system.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link 
                  to="/vendor-signup" 
                  className="inline-block bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-8 py-4 rounded-xl text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  🎯 Start Free Trial
                </Link>
                <Link 
                  to="/vendor-login" 
                  className="inline-block border-2 border-white text-white hover:bg-white hover:text-gray-900 font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-200"
                >
                  Sign In
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-8">
                <div className="text-center">
                  <div className="text-yellow-400 font-bold text-2xl">99%</div>
                  <div className="text-sm opacity-75">Customer Satisfaction</div>
                </div>
                <div className="text-center">
                  <div className="text-yellow-400 font-bold text-2xl">40%</div>
                  <div className="text-sm opacity-75">Revenue Increase</div>
                </div>
                <div className="text-center">
                  <div className="text-yellow-400 font-bold text-2xl">2min</div>
                  <div className="text-sm opacity-75">Setup Time</div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <div 
                  className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm transform -rotate-2 hover:rotate-0 transition-transform duration-300"
                >
                  <div className="bg-blue-600 text-white p-4 rounded-xl mb-4">
                    <h5 className="font-bold text-lg">🌮 Maria's Tacos</h5>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Carne Asada Tacos</span>
                      <strong>$12.99</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Guac & Chips</span>
                      <strong>$6.99</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Horchata</span>
                      <strong>$3.99</strong>
                    </div>
                    <hr className="my-4" />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>$23.97</span>
                    </div>
                    <button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition-colors duration-200">
                      💳 Pay Now
                    </button>
                  </div>
                </div>
                
                <div 
                  className="absolute top-4 -right-4 transform rotate-8"
                >
                  <div className="bg-yellow-400 text-gray-900 p-3 rounded-xl shadow-lg">
                    <div className="font-bold">⚡ Order #1247</div>
                    <div className="text-sm">Ready in 8 min</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need to <span className="text-blue-600">Scale Fast</span>
            </h2>
            <p className="text-xl text-gray-600">Join 500+ food trucks already making more money</p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 p-8">
              <div className="text-center">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">📱</span>
                </div>
                <h4 className="text-xl font-bold mb-4">QR Code Ordering</h4>
                <p className="text-gray-600">
                  Customers scan, browse, and order instantly. No app downloads, no hassle.
                </p>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 p-8">
              <div className="text-center">
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">💳</span>
                </div>
                <h4 className="text-xl font-bold mb-4">Instant Payments</h4>
                <p className="text-gray-600">
                  Secure card payments or cash at pickup. Get paid before you even start cooking.
                </p>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 p-8">
              <div className="text-center">
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">📊</span>
                </div>
                <h4 className="text-xl font-bold mb-4">Smart Analytics</h4>
                <p className="text-gray-600">
                  Track sales, popular items, and peak hours. Make data-driven decisions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Choose Your <span className="text-blue-600">Growth Plan</span>
            </h2>
            <p className="text-xl text-gray-600">Start with 30 days free, then choose the plan that fits your business</p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Starter Plan */}
            <div className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8">
              <div className="text-center">
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl text-white">🚀</span>
                </div>
                <h3 className="text-2xl font-bold mb-3">Starter</h3>
                <p className="text-gray-600 mb-6">Perfect for new food trucks getting started</p>
                
                <div className="mb-6">
                  <div className="text-4xl font-bold text-gray-900">$100<span className="text-lg text-gray-500">/month</span></div>
                  <div className="text-green-600 font-semibold">or $1,000/year (save $200)</div>
                </div>
                
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center"><span className="text-green-500 mr-3">✅</span> QR Code Ordering</li>
                  <li className="flex items-center"><span className="text-green-500 mr-3">✅</span> Payment Processing</li>
                  <li className="flex items-center"><span className="text-green-500 mr-3">✅</span> Basic Analytics</li>
                  <li className="flex items-center"><span className="text-green-500 mr-3">✅</span> Menu Management</li>
                  <li className="flex items-center"><span className="text-green-500 mr-3">✅</span> Order Management</li>
                  <li className="flex items-center"><span className="text-green-500 mr-3">✅</span> Email Support</li>
                  <li className="flex items-center"><span className="text-gray-400 mr-3">❌</span> <span className="text-gray-400">Advanced Features</span></li>
                  <li className="flex items-center"><span className="text-gray-400 mr-3">❌</span> <span className="text-gray-400">24/7 Priority Support</span></li>
                </ul>
                
                <Link 
                  to="/vendor-signup" 
                  className="block w-full bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-bold py-4 rounded-xl text-lg transition-all duration-200"
                >
                  Start Free Trial
                </Link>
              </div>
            </div>

            {/* Professional Plan - MOST POPULAR */}
            <div className="bg-white rounded-3xl shadow-2xl hover:shadow-3xl transition-shadow duration-300 p-8 relative transform lg:scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-yellow-400 text-gray-900 px-6 py-2 rounded-full font-bold text-sm">
                  🔥 MOST POPULAR
                </span>
              </div>
              <div className="text-center pt-4">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl text-white">👑</span>
                </div>
                <h3 className="text-2xl font-bold mb-3">Professional</h3>
                <p className="text-gray-600 mb-6">Complete solution with all features & premium support</p>
                
                <div className="mb-6">
                  <div className="text-4xl font-bold text-blue-600">$200<span className="text-lg text-gray-500">/month</span></div>
                  <div className="text-green-600 font-semibold">or $1,800/year (save $600)</div>
                </div>
                
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center"><span className="text-green-500 mr-3">✅</span> <strong>Everything in Starter</strong></li>
                  <li className="flex items-center"><span className="text-green-500 mr-3">✅</span> Advanced Analytics & Reports</li>
                  <li className="flex items-center"><span className="text-green-500 mr-3">✅</span> Multi-location Management</li>
                  <li className="flex items-center"><span className="text-green-500 mr-3">✅</span> Custom Branding & Colors</li>
                  <li className="flex items-center"><span className="text-green-500 mr-3">✅</span> Marketing Tools</li>
                  <li className="flex items-center"><span className="text-green-500 mr-3">✅</span> Inventory Management</li>
                  <li className="flex items-center"><span className="text-green-500 mr-3">✅</span> <strong>24/7 Priority Support</strong></li>
                  <li className="flex items-center"><span className="text-green-500 mr-3">✅</span> <strong>Phone & Chat Support</strong></li>
                </ul>
                
                <Link 
                  to="/vendor-signup" 
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl text-lg transition-all duration-200"
                >
                  Start Free Trial
                </Link>
              </div>
            </div>
          </div>

          {/* Free Trial Info */}
          <div className="text-center mt-12">
            <div className="inline-block bg-white border border-gray-200 rounded-2xl px-8 py-6 shadow-sm">
              <h5 className="text-lg font-bold text-green-600 mb-4">🎉 30-Day Free Trial on All Plans</h5>
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-green-500 text-2xl font-bold">✅</div>
                  <div className="text-sm text-gray-600">No Credit Card</div>
                </div>
                <div>
                  <div className="text-green-500 text-2xl font-bold">✅</div>
                  <div className="text-sm text-gray-600">Full Access</div>
                </div>
                <div>
                  <div className="text-green-500 text-2xl font-bold">✅</div>
                  <div className="text-sm text-gray-600">Cancel Anytime</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2">
              <blockquote className="text-2xl lg:text-3xl font-semibold text-gray-900 mb-4">
                "Sales increased 40% in the first month. Customers love skipping the line!"
              </blockquote>
              <div className="flex items-center">
                <div className="bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center text-white font-bold mr-4">
                  MJ
                </div>
                <div>
                  <div className="font-bold">Maria Rodriguez</div>
                  <div className="text-gray-600">Owner, Maria's Tacos - Los Angeles</div>
                </div>
              </div>
            </div>
            <div className="text-center lg:text-right">
              <div className="text-4xl font-bold text-yellow-500 mb-2">⭐⭐⭐⭐⭐</div>
              <div className="text-gray-600">4.9/5 from 200+ reviews</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">Ready to Transform Your Food Truck?</h2>
          <p className="text-xl mb-8 text-gray-300">Join hundreds of successful food truck owners</p>
          <Link 
            to="/vendor-signup" 
            className="inline-block bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-10 py-4 rounded-xl text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            🚀 Start Your Free Trial Now
          </Link>
          <div className="mt-6">
            <div className="text-sm text-gray-400">✅ No credit card required • ✅ 30-day free trial • ✅ Cancel anytime</div>
          </div>
        </div>
      </div>
    </div>
  );
}