import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function VendorSignup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const [slug, setSlug] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    // Insert vendor profile into separate table
    const user = data.user;
    const profileInsert = await supabase.from("vendor_profiles").insert([
      {
        id: user.id,
        slug,
        business_name: businessName,
        contact_email: email,
      },
    ]);

    if (profileInsert.error) {
      setErrorMsg(profileInsert.error.message);
      setLoading(false);
      return;
    }

    alert("Signup successful! Please check your email to confirm.");
    navigate("/vendor-login");
    setLoading(false);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center" 
         style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-xl-5">
            <div className="card shadow-lg border-0" style={{ borderRadius: '20px' }}>
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                       style={{ 
                         width: '80px', 
                         height: '80px',
                         background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                       }}>
                    <span className="text-white fs-1">🚀</span>
                  </div>
                  <h2 className="fw-bold text-dark mb-2">Start Your Food Truck Journey</h2>
                  <p className="text-muted">Join 500+ successful food truck owners</p>
                </div>

                <form onSubmit={handleSignup}>
                  <div className="mb-4">
                    <label className="form-label fw-semibold text-dark">Business Name</label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      style={{ borderRadius: '12px', border: '2px solid #e9ecef' }}
                      placeholder="e.g. Maria's Tacos"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold text-dark">Business URL Slug</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light text-muted" style={{ borderRadius: '12px 0 0 12px' }}>
                        yoursite.com/menu/
                      </span>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        style={{ borderRadius: '0 12px 12px 0', border: '2px solid #e9ecef', borderLeft: 'none' }}
                        placeholder="marias-tacos"
                        value={slug}
                        onChange={(e) =>
                          setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))
                        }
                        required
                      />
                    </div>
                    <div className="form-text">
                      <small className="text-muted">This will be your unique menu URL for customers</small>
                    </div>
                  </div>

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
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <div className="form-text">
                      <small className="text-muted">Must be at least 6 characters</small>
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="alert alert-danger" style={{ borderRadius: '12px' }}>
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      {errorMsg}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    className="btn btn-warning btn-lg w-100 fw-bold py-3 mb-3 text-dark"
                    style={{ borderRadius: '12px' }}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Creating Your Account...
                      </>
                    ) : (
                      <>
                        🎯 Start Free Trial
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <small className="text-muted">
                      Already have an account? 
                      <a href="/vendor-login" className="text-primary fw-semibold text-decoration-none ms-1">
                        Sign In
                      </a>
                    </small>
                  </div>
                </form>

                <hr className="my-4" />
                
                <div className="text-center">
                  <div className="row text-center">
                    <div className="col-4">
                      <div className="text-primary fw-bold">✅</div>
                      <div className="small text-muted">14-day trial</div>
                    </div>
                    <div className="col-4">
                      <div className="text-success fw-bold">✅</div>
                      <div className="small text-muted">No credit card</div>
                    </div>
                    <div className="col-4">
                      <div className="text-warning fw-bold">✅</div>
                      <div className="small text-muted">Cancel anytime</div>
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
