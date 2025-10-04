import { Link } from "react-router-dom";
import { useState } from "react";

export default function Home() {
  const [language, setLanguage] = useState('es'); // Default to Spanish
  
  const translations = {
    es: {
      badge: "🚀 #1 Solución para Food Trucks",
      heroTitle: "Convierte Tu Food Truck En Un",
      heroTitleHighlight: " Imperio Digital",
      heroSubtitle: "Elimina las filas largas para siempre. Deja que los clientes escaneen, ordenen y paguen al instante.",
      heroBoost: "Aumenta los ingresos un 40%",
      heroBoostText: " con nuestro sistema de pedidos sin contacto.",
      startTrial: "🎯 Prueba Gratis",
      signIn: "Iniciar Sesión",
      customerSat: "Satisfacción del Cliente",
      revenueIncrease: "Aumento de Ingresos",
      setupTime: "Tiempo de Configuración",
      featuresTitle: "Todo Lo Que Necesitas Para",
      featuresTitleHighlight: "Crecer Rápido",
      featuresSubtitle: "Únete a más de 500 food trucks que ya están ganando más dinero",
      qrTitle: "Pedidos por Código QR",
      qrDesc: "Los clientes escanean, navegan y ordenan al instante. Sin descargas de apps, sin complicaciones.",
      paymentsTitle: "Pagos Instantáneos",
      paymentsDesc: "Pagos seguros con tarjeta o efectivo al recoger. Te pagan antes de empezar a cocinar.",
      analyticsTitle: "Análisis Inteligente",
      analyticsDesc: "Rastrea ventas, productos populares y horas pico. Toma decisiones basadas en datos.",
      pricingTitle: "Elige Tu",
      pricingTitleHighlight: "Plan de Crecimiento",
      pricingSubtitle: "Comienza con 30 días gratis, luego elige el plan que se adapte a tu negocio",
      starterTitle: "Inicial",
      starterDesc: "Perfecto para food trucks nuevos que están empezando",
      starterPrice: "$100",
      starterPeriod: "/mes",
      starterYearly: "o $1,000/año (ahorra $200)",
      professionalTitle: "Profesional",
      professionalDesc: "Solución completa con todas las funciones y soporte premium",
      professionalPrice: "$200",
      professionalPeriod: "/mes",
      professionalYearly: "o $1,800/año (ahorra $600)",
      ultimateTitle: "Ultimate",
      ultimateDesc: "Solución empresarial con opciones de marca blanca y soporte dedicado",
      ultimatePrice: "$500",
      ultimatePeriod: "/mes",
      ultimateYearly: "o $4,800/año (ahorra $1,200)",
      mostPopular: "🔥 MÁS POPULAR",
      enterprise: "💎 EMPRESARIAL",
      contactSales: "Contactar Ventas",
      freeTrialTitle: "🎉 Prueba Gratis de 30 Días en Todos los Planes",
      noCreditCard: "Sin Tarjeta de Crédito",
      fullAccess: "Acceso Completo",
      cancelAnytime: "Cancela Cuando Quieras",
      qrCodeOrdering: "Pedidos por Código QR",
      paymentProcessing: "Procesamiento de Pagos",
      basicAnalytics: "Análisis Básico",
      menuManagement: "Gestión de Menú",
      orderManagement: "Gestión de Pedidos",
      emailSupport: "Soporte por Email",
      advancedFeatures: "Funciones Avanzadas",
      prioritySupport: "Soporte Prioritario 24/7",
      everythingInStarter: "Todo en Inicial",
      advancedAnalytics: "Análisis Avanzado e Informes",
      multiLocation: "Gestión Multi-Ubicación",
      customBranding: "Marca y Colores Personalizados",
      marketingTools: "Herramientas de Marketing",
      inventoryManagement: "Gestión de Inventario",
      phoneSupport: "Soporte por Teléfono y Chat",
      everythingInProfessional: "Todo en Profesional",
      whiteLabelSolution: "Solución de Marca Blanca",
      apiAccess: "Acceso API y Webhooks",
      customIntegrations: "Integraciones Personalizadas",
      accountManager: "Gerente de Cuenta Dedicado",
      franchiseManagement: "Gestión de Franquicias",
      enterpriseSla: "SLA Empresarial",
      customDevelopment: "Desarrollo Personalizado",
      testimonial: "\"Las ventas aumentaron 40% en el primer mes. ¡A los clientes les encanta saltarse la fila!\"",
      testimonialName: "María Rodríguez",
      testimonialBusiness: "Propietaria, Tacos de María - Los Ángeles",
      reviews: "4.9/5 de más de 200 reseñas",
      ctaTitle: "¿Listo Para Transformar Tu Food Truck?",
      ctaSubtitle: "Únete a cientos de propietarios exitosos de food trucks",
      ctaButton: "🚀 Comienza Tu Prueba Gratis Ahora",
      ctaFooter: "✅ Sin tarjeta de crédito requerida • ✅ Prueba gratis de 30 días • ✅ Cancela cuando quieras"
    },
    en: {
      badge: "🚀 #1 Food Truck Solution",
      heroTitle: "Turn Your Food Truck Into a",
      heroTitleHighlight: " Digital Empire",
      heroSubtitle: "Eliminate long lines forever. Let customers scan, order, and pay instantly.",
      heroBoost: "Boost revenue by 40%",
      heroBoostText: " with our contactless ordering system.",
      startTrial: "🎯 Start Free Trial",
      signIn: "Sign In",
      customerSat: "Customer Satisfaction",
      revenueIncrease: "Revenue Increase",
      setupTime: "Setup Time",
      featuresTitle: "Everything You Need to",
      featuresTitleHighlight: "Scale Fast",
      featuresSubtitle: "Join 500+ food trucks already making more money",
      qrTitle: "QR Code Ordering",
      qrDesc: "Customers scan, browse, and order instantly. No app downloads, no hassle.",
      paymentsTitle: "Instant Payments",
      paymentsDesc: "Secure card payments or cash at pickup. Get paid before you even start cooking.",
      analyticsTitle: "Smart Analytics",
      analyticsDesc: "Track sales, popular items, and peak hours. Make data-driven decisions.",
      pricingTitle: "Choose Your",
      pricingTitleHighlight: "Growth Plan",
      pricingSubtitle: "Start with 30 days free, then choose the plan that fits your business",
      starterTitle: "Starter",
      starterDesc: "Perfect for new food trucks getting started",
      starterPrice: "$100",
      starterPeriod: "/month",
      starterYearly: "or $1,000/year (save $200)",
      professionalTitle: "Professional",
      professionalDesc: "Complete solution with all features & premium support",
      professionalPrice: "$200",
      professionalPeriod: "/month",
      professionalYearly: "or $1,800/year (save $600)",
      ultimateTitle: "Ultimate",
      ultimateDesc: "Enterprise solution with white-label options & dedicated support",
      ultimatePrice: "$500",
      ultimatePeriod: "/month",
      ultimateYearly: "or $4,800/year (save $1,200)",
      mostPopular: "🔥 MOST POPULAR",
      enterprise: "💎 ENTERPRISE",
      contactSales: "Contact Sales",
      freeTrialTitle: "🎉 30-Day Free Trial on All Plans",
      noCreditCard: "No Credit Card",
      fullAccess: "Full Access",
      cancelAnytime: "Cancel Anytime",
      qrCodeOrdering: "QR Code Ordering",
      paymentProcessing: "Payment Processing",
      basicAnalytics: "Basic Analytics",
      menuManagement: "Menu Management",
      orderManagement: "Order Management",
      emailSupport: "Email Support",
      advancedFeatures: "Advanced Features",
      prioritySupport: "24/7 Priority Support",
      everythingInStarter: "Everything in Starter",
      advancedAnalytics: "Advanced Analytics & Reports",
      multiLocation: "Multi-location Management",
      customBranding: "Custom Branding & Colors",
      marketingTools: "Marketing Tools",
      inventoryManagement: "Inventory Management",
      phoneSupport: "Phone & Chat Support",
      everythingInProfessional: "Everything in Professional",
      whiteLabelSolution: "White-Label Solution",
      apiAccess: "API Access & Webhooks",
      customIntegrations: "Custom Integrations",
      accountManager: "Dedicated Account Manager",
      franchiseManagement: "Franchise Management",
      enterpriseSla: "Enterprise SLA",
      customDevelopment: "Custom Development",
      testimonial: "\"Sales increased 40% in the first month. Customers love skipping the line!\"",
      testimonialName: "Maria Rodriguez",
      testimonialBusiness: "Owner, Maria's Tacos - Los Angeles",
      reviews: "4.9/5 from 200+ reviews",
      ctaTitle: "Ready to Transform Your Food Truck?",
      ctaSubtitle: "Join hundreds of successful food truck owners",
      ctaButton: "🚀 Start Your Free Trial Now",
      ctaFooter: "✅ No credit card required • ✅ 30-day free trial • ✅ Cancel anytime"
    }
  };

  const t = translations[language];
  
  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
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
      
      {/* Hero Section */}
      <div className="container-fluid px-0">
        <div className="row min-vh-100 align-items-center">
          <div className="col-lg-6 px-5">
            <div className="text-white">
              <div className="mb-4">
                <span className="badge bg-light text-primary px-3 py-2 rounded-pill mb-4">
                  {t.badge}
                </span>
              </div>
              <h1 className="display-3 fw-bold mb-4 lh-1">
                {t.heroTitle}
                <span className="text-warning">{t.heroTitleHighlight}</span>
              </h1>
              <p className="fs-5 mb-5 opacity-90 lh-base">
                {t.heroSubtitle}
                <strong> {t.heroBoost}</strong>{t.heroBoostText}
              </p>
              
              <div className="d-flex gap-3 mb-5">
                <Link 
                  to="/vendor-signup" 
                  className="btn btn-warning btn-lg px-4 py-3 fw-bold text-dark shadow-lg"
                  style={{ borderRadius: '12px' }}
                >
                  {t.startTrial}
                </Link>
                <Link 
                  to="/vendor-login" 
                  className="btn btn-outline-light btn-lg px-4 py-3 fw-semibold"
                  style={{ borderRadius: '12px' }}
                >
                  {t.signIn}
                </Link>
              </div>

              <div className="row text-center">
                <div className="col-4">
                  <div className="text-warning fw-bold fs-4">99%</div>
                  <div className="small opacity-75">{t.customerSat}</div>
                </div>
                <div className="col-4">
                  <div className="text-warning fw-bold fs-4">40%</div>
                  <div className="small opacity-75">{t.revenueIncrease}</div>
                </div>
                <div className="col-4">
                  <div className="text-warning fw-bold fs-4">2min</div>
                  <div className="small opacity-75">{t.setupTime}</div>
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
              {t.featuresTitle} <span className="text-primary">{t.featuresTitleHighlight}</span>
            </h2>
            <p className="fs-5 text-muted">{t.featuresSubtitle}</p>
          </div>
          
          <div className="row g-4">
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm h-100 p-4">
                <div className="text-center">
                  <div className="bg-primary bg-gradient rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                       style={{ width: '80px', height: '80px' }}>
                    <span className="fs-1">📱</span>
                  </div>
                  <h4 className="fw-bold">{t.qrTitle}</h4>
                  <p className="text-muted">
                    {t.qrDesc}
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
                  <h4 className="fw-bold">{t.paymentsTitle}</h4>
                  <p className="text-muted">
                    {t.paymentsDesc}
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
                  <h4 className="fw-bold">{t.analyticsTitle}</h4>
                  <p className="text-muted">
                    {t.analyticsDesc}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-5" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold text-dark mb-3">
              {t.pricingTitle} <span className="text-primary">{t.pricingTitleHighlight}</span>
            </h2>
            <p className="fs-5 text-muted">{t.pricingSubtitle}</p>
          </div>
          
          <div className="row g-4 justify-content-center">
            {/* Starter Plan */}
            <div className="col-xl-4 col-lg-6 col-md-6">
              <div className="card border-0 shadow-lg h-100" style={{ borderRadius: '20px' }}>
                <div className="card-body p-5 text-center">
                  <div className="bg-success bg-gradient rounded-circle d-inline-flex align-items-center justify-content-center mb-4" 
                       style={{ width: '80px', height: '80px' }}>
                    <span className="fs-1 text-white">🚀</span>
                  </div>
                  <h3 className="fw-bold mb-3">{t.starterTitle}</h3>
                  <p className="text-muted mb-4">{t.starterDesc}</p>
                  
                  <div className="mb-4">
                    <div className="display-6 fw-bold text-dark">{t.starterPrice}<span className="fs-6 text-muted">{t.starterPeriod}</span></div>
                    <div className="text-success fw-semibold">{t.starterYearly}</div>
                  </div>
                  
                  <ul className="list-unstyled text-start mb-4">
                    <li className="mb-2"><span className="text-success">✅</span> {t.qrCodeOrdering}</li>
                    <li className="mb-2"><span className="text-success">✅</span> {t.paymentProcessing}</li>
                    <li className="mb-2"><span className="text-success">✅</span> {t.basicAnalytics}</li>
                    <li className="mb-2"><span className="text-success">✅</span> {t.menuManagement}</li>
                    <li className="mb-2"><span className="text-success">✅</span> {t.orderManagement}</li>
                    <li className="mb-2"><span className="text-success">✅</span> {t.emailSupport}</li>
                    <li className="mb-2"><span className="text-muted">❌</span> <span className="text-muted">{t.advancedFeatures}</span></li>
                    <li className="mb-2"><span className="text-muted">❌</span> <span className="text-muted">{t.prioritySupport}</span></li>
                  </ul>
                  
                  <Link 
                    to="/vendor-signup" 
                    className="btn btn-outline-primary btn-lg w-100 py-3 fw-bold"
                    style={{ borderRadius: '12px' }}
                  >
                    {t.startTrial}
                  </Link>
                </div>
              </div>
            </div>

            {/* Professional Plan - MOST POPULAR */}
            <div className="col-xl-4 col-lg-6 col-md-6">
              <div className="card border-0 shadow-xl h-100 position-relative" 
                   style={{ borderRadius: '20px', transform: 'scale(1.05)' }}>
                <div className="position-absolute top-0 start-50 translate-middle">
                  <span className="badge bg-warning text-dark px-4 py-2 fw-bold" style={{ borderRadius: '20px' }}>
                    {t.mostPopular}
                  </span>
                </div>
                <div className="card-body p-5 text-center">
                  <div className="bg-primary bg-gradient rounded-circle d-inline-flex align-items-center justify-content-center mb-4" 
                       style={{ width: '80px', height: '80px' }}>
                    <span className="fs-1 text-white">👑</span>
                  </div>
                  <h3 className="fw-bold mb-3">{t.professionalTitle}</h3>
                  <p className="text-muted mb-4">{t.professionalDesc}</p>
                  
                  <div className="mb-4">
                    <div className="display-6 fw-bold text-primary">{t.professionalPrice}<span className="fs-6 text-muted">{t.professionalPeriod}</span></div>
                    <div className="text-success fw-semibold">{t.professionalYearly}</div>
                  </div>
                  
                  <ul className="list-unstyled text-start mb-4">
                    <li className="mb-2"><span className="text-success">✅</span> <strong>{t.everythingInStarter}</strong></li>
                    <li className="mb-2"><span className="text-success">✅</span> {t.advancedAnalytics}</li>
                    <li className="mb-2"><span className="text-success">✅</span> {t.multiLocation}</li>
                    <li className="mb-2"><span className="text-success">✅</span> {t.customBranding}</li>
                    <li className="mb-2"><span className="text-success">✅</span> {t.marketingTools}</li>
                    <li className="mb-2"><span className="text-success">✅</span> {t.inventoryManagement}</li>
                    <li className="mb-2"><span className="text-success">✅</span> <strong>{t.prioritySupport}</strong></li>
                    <li className="mb-2"><span className="text-success">✅</span> <strong>{t.phoneSupport}</strong></li>
                  </ul>
                  
                  <Link 
                    to="/vendor-signup" 
                    className="btn btn-primary btn-lg w-100 py-3 fw-bold text-white"
                    style={{ borderRadius: '12px' }}
                  >
                    {t.startTrial}
                  </Link>
                </div>
              </div>
            </div>

            {/* Ultimate Plan - ENTERPRISE */}
            <div className="col-xl-4 col-lg-6 col-md-6">
              <div className="card border-0 shadow-xxl h-100 position-relative" 
                   style={{ borderRadius: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <div className="position-absolute top-0 start-50 translate-middle">
                  <span className="badge bg-danger text-white px-4 py-2 fw-bold" style={{ borderRadius: '20px' }}>
                    {t.enterprise}
                  </span>
                </div>
                <div className="card-body p-5 text-center text-white">
                  <div className="bg-warning bg-gradient rounded-circle d-inline-flex align-items-center justify-content-center mb-4" 
                       style={{ width: '80px', height: '80px' }}>
                    <span className="fs-1 text-dark">💎</span>
                  </div>
                  <h3 className="fw-bold mb-3 text-white">{t.ultimateTitle}</h3>
                  <p className="text-light opacity-90 mb-4">{t.ultimateDesc}</p>
                  
                  <div className="mb-4">
                    <div className="display-6 fw-bold text-warning">{t.ultimatePrice}<span className="fs-6 text-light opacity-75">{t.ultimatePeriod}</span></div>
                    <div className="text-warning fw-semibold">{t.ultimateYearly}</div>
                  </div>
                  
                  <ul className="list-unstyled text-start mb-4">
                    <li className="mb-2"><span className="text-warning">✅</span> <strong className="text-white">{t.everythingInProfessional}</strong></li>
                    <li className="mb-2"><span className="text-warning">✅</span> <span className="text-white">{t.whiteLabelSolution}</span></li>
                    <li className="mb-2"><span className="text-warning">✅</span> <span className="text-white">{t.apiAccess}</span></li>
                    <li className="mb-2"><span className="text-warning">✅</span> <span className="text-white">{t.customIntegrations}</span></li>
                    <li className="mb-2"><span className="text-warning">✅</span> <span className="text-white">{t.accountManager}</span></li>
                    <li className="mb-2"><span className="text-warning">✅</span> <span className="text-white">{t.franchiseManagement}</span></li>
                    <li className="mb-2"><span className="text-warning">✅</span> <span className="text-white"><strong>{t.enterpriseSla}</strong></span></li>
                    <li className="mb-2"><span className="text-warning">✅</span> <span className="text-white"><strong>{t.customDevelopment}</strong></span></li>
                  </ul>
                  
                  <Link 
                    to="/vendor-signup" 
                    className="btn btn-warning btn-lg w-100 py-3 fw-bold text-dark"
                    style={{ borderRadius: '12px' }}
                  >
                    {t.contactSales}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Free Trial Info */}
          <div className="text-center mt-5">
            <div className="card border-0 shadow-sm d-inline-block px-5 py-4" style={{ borderRadius: '15px' }}>
              <h5 className="fw-bold text-success mb-3">{t.freeTrialTitle}</h5>
              <div className="row text-center">
                <div className="col-4">
                  <div className="text-success fw-bold">✅</div>
                  <small className="text-muted">{t.noCreditCard}</small>
                </div>
                <div className="col-4">
                  <div className="text-success fw-bold">✅</div>
                  <small className="text-muted">{t.fullAccess}</small>
                </div>
                <div className="col-4">
                  <div className="text-success fw-bold">✅</div>
                  <small className="text-muted">{t.cancelAnytime}</small>
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
                {t.testimonial}
              </blockquote>
              <div className="d-flex align-items-center">
                <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white fw-bold me-3" 
                     style={{ width: '50px', height: '50px' }}>
                  MJ
                </div>
                <div>
                  <div className="fw-bold">{t.testimonialName}</div>
                  <div className="text-muted">{t.testimonialBusiness}</div>
                </div>
              </div>
            </div>
            <div className="col-lg-4 text-center">
              <div className="display-6 fw-bold text-warning">⭐⭐⭐⭐⭐</div>
              <div className="text-muted">{t.reviews}</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-dark text-white py-5">
        <div className="container text-center">
          <h2 className="display-5 fw-bold mb-3">{t.ctaTitle}</h2>
          <p className="fs-5 mb-4 text-light opacity-75">{t.ctaSubtitle}</p>
          <Link 
            to="/vendor-signup" 
            className="btn btn-warning btn-lg px-5 py-3 fw-bold text-dark"
            style={{ borderRadius: '12px' }}
          >
            {t.ctaButton}
          </Link>
          <div className="mt-4">
            <div className="text-light opacity-75 fw-medium">{t.ctaFooter}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
