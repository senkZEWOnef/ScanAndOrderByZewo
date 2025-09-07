import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function VendorLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      navigate("/vendor-dashboard");
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center" 
         style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-xl-4">
            <div className="card shadow-lg border-0" style={{ borderRadius: '20px' }}>
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                       style={{ 
                         width: '80px', 
                         height: '80px',
                         background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                       }}>
                    <span className="text-white fs-1">👋</span>
                  </div>
                  <h2 className="fw-bold text-dark mb-2">Welcome Back!</h2>
                  <p className="text-muted">Sign in to your food truck dashboard</p>
                </div>

                <form onSubmit={handleLogin}>
                  <div className="mb-4">
                    <label className="form-label fw-semibold text-dark">Email Address</label>
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      style={{ borderRadius: '12px', border: '2px solid #e9ecef' }}
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold text-dark">Password</label>
                    <input
                      type="password"
                      className="form-control form-control-lg"
                      style={{ borderRadius: '12px', border: '2px solid #e9ecef' }}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  {errorMsg && (
                    <div className="alert alert-danger" style={{ borderRadius: '12px' }}>
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      {errorMsg}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg w-100 fw-bold py-3 mb-3"
                    style={{ borderRadius: '12px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Signing In...
                      </>
                    ) : (
                      <>
                        🚀 Sign In to Dashboard
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <small className="text-muted">
                      Don't have an account? 
                      <a href="/vendor-signup" className="text-primary fw-semibold text-decoration-none ms-1">
                        Start Free Trial
                      </a>
                    </small>
                  </div>
                </form>

                <hr className="my-4" />
                
                <div className="text-center">
                  <p className="text-muted small mb-3">Quick Access Features</p>
                  <div className="row text-center">
                    <div className="col-4">
                      <div className="text-primary fw-bold">📋</div>
                      <div className="small text-muted">Orders</div>
                    </div>
                    <div className="col-4">
                      <div className="text-success fw-bold">🍽️</div>
                      <div className="small text-muted">Menu</div>
                    </div>
                    <div className="col-4">
                      <div className="text-warning fw-bold">📊</div>
                      <div className="small text-muted">Analytics</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
