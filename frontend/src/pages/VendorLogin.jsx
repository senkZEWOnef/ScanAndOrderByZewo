import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function VendorLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('es'); // Default to Spanish
  const navigate = useNavigate();

  const translations = {
    es: {
      welcomeBack: "¡Bienvenido de Vuelta!",
      signInText: "Inicia sesión en tu panel de food truck",
      emailLabel: "Dirección de Email",
      emailPlaceholder: "tu@email.com",
      passwordLabel: "Contraseña",
      passwordPlaceholder: "Ingresa tu contraseña",
      signingIn: "Iniciando Sesión...",
      signInButton: "🚀 Iniciar Sesión al Panel",
      noAccount: "¿No tienes cuenta?",
      startTrial: "Comenzar Prueba Gratis",
      quickAccess: "Acceso Rápido a Funciones",
      orders: "Pedidos",
      menu: "Menú",
      analytics: "Análisis"
    },
    en: {
      welcomeBack: "Welcome Back!",
      signInText: "Sign in to your food truck dashboard",
      emailLabel: "Email Address",
      emailPlaceholder: "your@email.com",
      passwordLabel: "Password",
      passwordPlaceholder: "Enter your password",
      signingIn: "Signing In...",
      signInButton: "🚀 Sign In to Dashboard",
      noAccount: "Don't have an account?",
      startTrial: "Start Free Trial",
      quickAccess: "Quick Access Features",
      orders: "Orders",
      menu: "Menu",
      analytics: "Analytics"
    }
  };

  const t = translations[language];

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      console.error("Login error:", error);
      setErrorMsg(error.message);
    } else {
      navigate("/vendor-dashboard");
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center" 
         style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Language Toggle */}
      <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1000 }}>
        <button
          onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
          className="btn btn-light btn-sm shadow-sm"
          style={{ borderRadius: '50%', width: '50px', height: '50px' }}
        >
          <span style={{ fontSize: '20px' }}>{language === 'es' ? '🇺🇸' : '🇵🇷'}</span>
        </button>
      </div>
      
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
                  <h2 className="fw-bold text-dark mb-2">{t.welcomeBack}</h2>
                  <p className="text-muted">{t.signInText}</p>
                </div>

                <form onSubmit={handleLogin}>
                  <div className="mb-4">
                    <label className="form-label fw-semibold text-dark">{t.emailLabel}</label>
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      style={{ borderRadius: '12px', border: '2px solid #e9ecef' }}
                      placeholder={t.emailPlaceholder}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold text-dark">{t.passwordLabel}</label>
                    <input
                      type="password"
                      className="form-control form-control-lg"
                      style={{ borderRadius: '12px', border: '2px solid #e9ecef' }}
                      placeholder={t.passwordPlaceholder}
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
                        {t.signingIn}
                      </>
                    ) : (
                      <>
                        {t.signInButton}
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <small className="text-muted">
                      {t.noAccount}
                      <a href="/vendor-signup" className="text-primary fw-semibold text-decoration-none ms-1">
                        {t.startTrial}
                      </a>
                    </small>
                  </div>
                </form>

                <hr className="my-4" />
                
                <div className="text-center">
                  <p className="text-muted small mb-3">{t.quickAccess}</p>
                  <div className="row text-center">
                    <div className="col-4">
                      <div className="text-primary fw-bold">📋</div>
                      <div className="small text-muted">{t.orders}</div>
                    </div>
                    <div className="col-4">
                      <div className="text-success fw-bold">🍽️</div>
                      <div className="small text-muted">{t.menu}</div>
                    </div>
                    <div className="col-4">
                      <div className="text-warning fw-bold">📊</div>
                      <div className="small text-muted">{t.analytics}</div>
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
