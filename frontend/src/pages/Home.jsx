import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Hero Section */}
      <div className="container-fluid px-0">
        <div className="row min-vh-100 align-items-center">
          <div className="col-lg-6 px-5">
            <div className="text-white">
              <div className="mb-4">
                <span className="badge bg-light text-primary px-3 py-2 rounded-pill mb-4">
                  🚀 #1 Food Truck Solution
                </span>
              </div>
              <h1 className="display-3 fw-bold mb-4 lh-1">
                Turn Your Food Truck Into a 
                <span className="text-warning"> Digital Empire</span>
              </h1>
              <p className="fs-5 mb-5 opacity-90 lh-base">
                Eliminate long lines forever. Let customers scan, order, and pay instantly. 
                <strong> Boost revenue by 40%</strong> with our contactless ordering system.
              </p>
              
              <div className="d-flex gap-3 mb-5">
                <Link 
                  to="/vendor-signup" 
                  className="btn btn-warning btn-lg px-4 py-3 fw-bold text-dark shadow-lg"
                  style={{ borderRadius: '12px' }}
                >
                  🎯 Start Free Trial
                </Link>
                <Link 
                  to="/vendor-login" 
                  className="btn btn-outline-light btn-lg px-4 py-3 fw-semibold"
                  style={{ borderRadius: '12px' }}
                >
                  Sign In
                </Link>
              </div>

              <div className="row text-center">
                <div className="col-4">
                  <div className="text-warning fw-bold fs-4">99%</div>
                  <div className="small opacity-75">Customer Satisfaction</div>
                </div>
                <div className="col-4">
                  <div className="text-warning fw-bold fs-4">40%</div>
                  <div className="small opacity-75">Revenue Increase</div>
                </div>
                <div className="col-4">
                  <div className="text-warning fw-bold fs-4">2min</div>
                  <div className="small opacity-75">Setup Time</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-lg-6 px-5">
            <div className="text-center position-relative">
              <div 
                className="bg-white rounded-4 shadow-lg p-4 mx-auto"
                style={{ maxWidth: '400px', transform: 'rotate(-2deg)' }}
              >
                <div className="bg-primary text-white p-3 rounded-3 mb-3">
                  <h5 className="mb-0">🌮 Maria's Tacos</h5>
                </div>
                <div className="text-start">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span>Carne Asada Tacos</span>
                    <strong>$12.99</strong>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span>Guac & Chips</span>
                    <strong>$6.99</strong>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span>Horchata</span>
                    <strong>$3.99</strong>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between fw-bold">
                    <span>Total</span>
                    <span>$23.97</span>
                  </div>
                  <button className="btn btn-success w-100 mt-3 py-2">
                    💳 Pay Now
                  </button>
                </div>
              </div>
              
              <div 
                className="position-absolute"
                style={{ top: '20px', right: '10px', transform: 'rotate(8deg)' }}
              >
                <div className="bg-warning text-dark p-3 rounded-3 shadow">
                  <div className="fw-bold">⚡ Order #1247</div>
                  <div className="small">Ready in 8 min</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold text-dark mb-3">
              Everything You Need to <span className="text-primary">Scale Fast</span>
            </h2>
            <p className="fs-5 text-muted">Join 500+ food trucks already making more money</p>
          </div>
          
          <div className="row g-4">
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm h-100 p-4">
                <div className="text-center">
                  <div className="bg-primary bg-gradient rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                       style={{ width: '80px', height: '80px' }}>
                    <span className="fs-1">📱</span>
                  </div>
                  <h4 className="fw-bold">QR Code Ordering</h4>
                  <p className="text-muted">
                    Customers scan, browse, and order instantly. No app downloads, no hassle.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm h-100 p-4">
                <div className="text-center">
                  <div className="bg-success bg-gradient rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                       style={{ width: '80px', height: '80px' }}>
                    <span className="fs-1">💳</span>
                  </div>
                  <h4 className="fw-bold">Instant Payments</h4>
                  <p className="text-muted">
                    Secure card payments or cash at pickup. Get paid before you even start cooking.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm h-100 p-4">
                <div className="text-center">
                  <div className="bg-warning bg-gradient rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                       style={{ width: '80px', height: '80px' }}>
                    <span className="fs-1">📊</span>
                  </div>
                  <h4 className="fw-bold">Smart Analytics</h4>
                  <p className="text-muted">
                    Track sales, popular items, and peak hours. Make data-driven decisions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="bg-light py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <blockquote className="fs-4 fw-semibold text-dark mb-3">
                "Sales increased 40% in the first month. Customers love skipping the line!"
              </blockquote>
              <div className="d-flex align-items-center">
                <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white fw-bold me-3" 
                     style={{ width: '50px', height: '50px' }}>
                  MJ
                </div>
                <div>
                  <div className="fw-bold">Maria Rodriguez</div>
                  <div className="text-muted">Owner, Maria's Tacos - Los Angeles</div>
                </div>
              </div>
            </div>
            <div className="col-lg-4 text-center">
              <div className="display-6 fw-bold text-warning">⭐⭐⭐⭐⭐</div>
              <div className="text-muted">4.9/5 from 200+ reviews</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-dark text-white py-5">
        <div className="container text-center">
          <h2 className="display-5 fw-bold mb-3">Ready to Transform Your Food Truck?</h2>
          <p className="fs-5 mb-4 text-light opacity-75">Join hundreds of successful food truck owners</p>
          <Link 
            to="/vendor-signup" 
            className="btn btn-warning btn-lg px-5 py-3 fw-bold text-dark"
            style={{ borderRadius: '12px' }}
          >
            🚀 Start Your Free Trial Now
          </Link>
          <div className="mt-3">
            <small className="text-muted">✅ No credit card required • ✅ 14-day free trial • ✅ Cancel anytime</small>
          </div>
        </div>
      </div>
    </div>
  );
}
