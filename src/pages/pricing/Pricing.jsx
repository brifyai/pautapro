import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../assets/css/legal.css';
import Navbar from '../../components/Navbar';

const Pricing = () => {
  const [activeAccordion, setActiveAccordion] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      // Funcionalidad básica de scroll si es necesaria
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  const handleNavClick = (e, elementId) => {
    e.preventDefault();
    const element = document.getElementById(elementId);
    if (element) {
      setTimeout(() => {
        element.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  };

  return (
    <div className="legal-page">
      {/* Navbar usando el componente reutilizable */}
      <Navbar />
      
      {/* Main Content */}
      <main className="legal-main">
        <div className="legal-container">
          {/* Hero Section */}
          <section className="legal-hero">
            <div className="legal-hero-content">
              <div className="legal-badge">
                <span className="badge-icon">💎</span>
                <span className="badge-text">Planes flexibles para cada necesidad</span>
              </div>
              
              <h1 className="legal-title">
                Precios <span className="title-highlight">Transparentes</span>
              </h1>
              
              <p className="legal-subtitle">
                Elige el plan perfecto para tu agencia. Sin costos ocultos, sin sorpresas. Cancelación en cualquier momento.
              </p>

              <div className="legal-meta">
                <span className="meta-item">
                  <strong>Última actualización:</strong> 12 de noviembre de 2024
                </span>
                <span className="meta-item">
                  <strong>Moneda:</strong> USD (Dólares Americanos)
                </span>
              </div>
            </div>
          </section>

          {/* Pricing Cards */}
          <section className="pricing-section-hero">
            <div className="pricing-grid">
              <div className="pricing-card starter-plan">
                <div className="pricing-header-card">
                  <h3 className="plan-title">Starter</h3>
                  <div className="plan-price">
                    <span className="price-symbol">$</span>
                    <span className="price-amount">29</span>
                    <span className="price-period">/mes</span>
                  </div>
                  <p className="price-description">Perfecto para agencias pequeñas</p>
                  <div className="plan-subtitle">Hasta 5 clientes activos</div>
                </div>
                
                <div className="plan-features">
                  <ul className="features-list">
                    <li className="feature-item">
                      <span className="check-icon">✓</span>
                      <span>Dashboard básico con KPIs esenciales</span>
                    </li>
                    <li className="feature-item">
                      <span className="check-icon">✓</span>
                      <span>Gestión de hasta 50 órdenes por mes</span>
                    </li>
                    <li className="feature-item">
                      <span className="check-icon">✓</span>
                      <span>Reportes automáticos básicos</span>
                    </li>
                    <li className="feature-item">
                      <span className="check-icon">✓</span>
                      <span>Gestión de clientes y agencias</span>
                    </li>
                    <li className="feature-item">
                      <span className="check-icon">✓</span>
                      <span>Chat con soporte técnico</span>
                    </li>
                    <li className="feature-item">
                      <span className="check-icon">✓</span>
                      <span>Integraciones básicas (Google Analytics, Facebook)</span>
                    </li>
                  </ul>
                </div>
                
                <div className="plan-action">
                  <button className="btn-pricing">Comenzar Gratis</button>
                </div>
              </div>

              <div className="pricing-card pro-plan">
                <div className="popular-badge">Más Popular</div>
                <div className="pricing-header-card">
                  <h3 className="plan-title">Professional</h3>
                  <div className="plan-price">
                    <span className="price-symbol">$</span>
                    <span className="price-amount">79</span>
                    <span className="price-period">/mes</span>
                  </div>
                  <p className="price-description">Ideal para agencias en crecimiento</p>
                  <div className="plan-subtitle">Hasta 25 clientes activos</div>
                </div>
                
                <div className="plan-features">
                  <ul className="features-list">
                    <li className="feature-item">
                      <span className="check-icon">✓</span>
                      <span>Dashboard avanzado con IA integrada</span>
                    </li>
                    <li className="feature-item">
                      <span className="check-icon">✓</span>
                      <span>Gestión de hasta 200 órdenes por mes</span>
                    </li>
                    <li className="feature-item">
                      <span className="check-icon">✓</span>
                      <span>Reportes personalizados y exportables</span>
                    </li>
                    <li className="feature-item">
                      <span className="check-icon">✓</span>
                      <span>Asistente IA para optimización</span>
                    </li>
                    <li className="feature-item">
                      <span className="check-icon">✓</span>
                      <span>Automatización de workflows</span>
                    </li>
                    <li className="feature-item">
                      <span className="check-icon">✓</span>
                      <span>Integraciones premium (TikTok, LinkedIn, Twitter)</span>
                    </li>
                    <li className="feature-item">
                      <span className="check-icon">✓</span>
                      <span>Soporte prioritario 24/7</span>
                    </li>
                    <li className="feature-item">
                      <span className="check-icon">✓</span>
                      <span>Capacitación personalizada</span>
                    </li>
                  </ul>
                </div>
                
                <div className="plan-action">
                  <button className="btn-pricing btn-primary">Prueba Gratuita 14 días</button>
                </div>
              </div>

              <div className="pricing-card enterprise-plan">
                <div className="pricing-header-card">
                  <h3 className="plan-title">Enterprise</h3>
                  <div className="plan-price">
                    <span className="price-symbol">$</span>
                    <span className="price-amount">199</span>
                    <span className="price-period">/mes</span>
                  </div>
                  <p className="price-description">Para grandes agencias y corporaciones</p>
                  <div className="plan-subtitle">Clientes ilimitados</div>
                </div>
                
                <div className="plan-features">
                  <ul className="features-list">
                    <li className="feature-item">
                      <span className="check-icon">✓</span>
                      <span>Plataforma completamente personalizada</span>
                    </li>
                    <li className="feature-item">
                      <span className="check-icon">✓</span>
                      <span>Órdenes y campañas ilimitadas</span>
                    </li>
                    <li className="feature-item">
                      <span className="check-icon">✓</span>
                      <span>IA avanzada con modelos personalizados</span>
                    </li>
                    <li className="feature-item">
                      <span className="check-icon">✓</span>
                      <span>API completa con documentación</span>
                    </li>
                    <li className="feature-item">
                      <span className="check-icon">✓</span>
                      <span>Integraciones customizadas</span>
                    </li>
                    <li className="feature-item">
                      <span className="check-icon">✓</span>
                      <span>SSO y controles de seguridad avanzados</span>
                    </li>
                    <li className="feature-item">
                      <span className="check-icon">✓</span>
                      <span>Account Manager dedicado</span>
                    </li>
                    <li className="feature-item">
                      <span className="check-icon">✓</span>
                      <span>SLA garantizado del 99.9%</span>
                    </li>
                    <li className="feature-item">
                      <span className="check-icon">✓</span>
                      <span>Consultoría estratégica mensual</span>
                    </li>
                  </ul>
                </div>
                
                <div className="plan-action">
                  <button className="btn-pricing btn-secondary">Contactar Ventas</button>
                </div>
              </div>
            </div>
          </section>

          {/* Content Sections */}
          <section className="legal-content">
            <div className="legal-grid">
              <div className="legal-sidebar">
                <nav className="legal-sidebar-nav">
                  <h3>Contenido</h3>
                  <ul>
                    <li><a href="#comparacion" onClick={(e) => handleNavClick(e, 'comparacion')}>Comparación Detallada</a></li>
                    <li><a href="#addons" onClick={(e) => handleNavClick(e, 'addons')}>Complementos Adicionales</a></li>
                    <li><a href="#descuentos" onClick={(e) => handleNavClick(e, 'descuentos')}>Descuentos Disponibles</a></li>
                    <li><a href="#facturacion" onClick={(e) => handleNavClick(e, 'facturacion')}>Opciones de Facturación</a></li>
                    <li><a href="#garantia" onClick={(e) => handleNavClick(e, 'garantia')}>Garantía de Satisfacción</a></li>
                    <li><a href="#faq-precios" onClick={(e) => handleNavClick(e, 'faq-precios')}>Preguntas Frecuentes</a></li>
                    <li><a href="#contacto-ventas" onClick={(e) => handleNavClick(e, 'contacto-ventas')}>Contacto Comercial</a></li>
                  </ul>
                </nav>
              </div>

              <div className="legal-main-content">
                <article id="comparacion" className="legal-section">
                  <h2>Comparación Detallada de Características</h2>
                  <p>Análisis completo de lo que incluye cada plan para ayudarte a tomar la mejor decisión.</p>
                  
                  <div className="legal-cards">
                    <div className="legal-card">
                      <div className="card-icon">👥</div>
                      <div className="card-content">
                        <h3>Gestión de Clientes</h3>
                        <p><strong>Starter:</strong> 5 clientes activos<br/>
                        <strong>Professional:</strong> 25 clientes activos<br/>
                        <strong>Enterprise:</strong> Ilimitados</p>
                      </div>
                    </div>
                    
                    <div className="legal-card">
                      <div className="card-icon">📊</div>
                      <div className="card-content">
                        <h3>Capacidad de Datos</h3>
                        <p><strong>Starter:</strong> 10GB de almacenamiento<br/>
                        <strong>Professional:</strong> 100GB de almacenamiento<br/>
                        <strong>Enterprise:</strong> Almacenamiento ilimitado</p>
                      </div>
                    </div>
                    
                    <div className="legal-card">
                      <div className="card-icon">🤖</div>
                      <div className="card-content">
                        <h3>Inteligencia Artificial</h3>
                        <p><strong>Starter:</strong> No incluye IA<br/>
                        <strong>Professional:</strong> IA básica incluida<br/>
                        <strong>Enterprise:</strong> IA avanzada con modelos customizados</p>
                      </div>
                    </div>
                    
                    <div className="legal-card">
                      <div className="card-icon">🔗</div>
                      <div className="card-content">
                        <h3>Integraciones</h3>
                        <p><strong>Starter:</strong> 5 integraciones básicas<br/>
                        <strong>Professional:</strong> 15+ integraciones<br/>
                        <strong>Enterprise:</strong> Integraciones ilimitadas + custom</p>
                      </div>
                    </div>
                  </div>
                </article>

                <article id="addons" className="legal-section">
                  <h2>Complementos Adicionales</h2>
                  <p>Expande las capacidades de tu plan con estos complementos especializados.</p>
                  
                  <div className="rights-grid">
                    <div className="right-item">
                      <div className="right-icon">📈</div>
                      <h4>Analytics Premium</h4>
                      <p>$15/mes - Análisis avanzado con data science y machine learning para insights predictivos.</p>
                    </div>
                    
                    <div className="right-item">
                      <div className="right-icon">🏆</div>
                      <h4>Competencia Intelligence</h4>
                      <p>$25/mes - Monitoreo automático de competencia con alertas y benchmarking.</p>
                    </div>
                    
                    <div className="right-item">
                      <div className="right-icon">🌐</div>
                      <h4>Multi-idioma</h4>
                      <p>$10/mes - Soporte para interfaces y reportes en múltiples idiomas.</p>
                    </div>
                    
                    <div className="right-item">
                      <div className="right-icon">🔐</div>
                      <h4>Seguridad Avanzada</h4>
                      <p>$20/mes - Encriptación adicional, audit logs y compliance internacional.</p>
                    </div>
                  </div>
                </article>

                <article id="descuentos" className="legal-section">
                  <h2>Descuentos Disponibles</h2>
                  <p>Ahorra en tu suscripción con nuestros programas de descuento especiales.</p>
                  
                  <div className="legal-list">
                    <div className="list-item">
                      <span className="list-icon">🎓</span>
                      <span><strong>Estudiantes:</strong> 50% de descuento con credencial estudiantil válida</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">🚀</span>
                      <span><strong>Startups:</strong> 30% de descuento por el primer año (startups menores de 2 años)</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">📅</span>
                      <span><strong>Annual Billing:</strong> 20% de descuento pagando por año completo</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">🏢</span>
                      <span><strong>Agencias con +50 empleados:</strong> 15% de descuento corporativo</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">🤝</span>
                      <span><strong>Migración desde competidores:</strong> 3 meses gratis al migrar</span>
                    </div>
                  </div>
                </article>

                <article id="facturacion" className="legal-section">
                  <h2>Opciones de Facturación</h2>
                  <p>Flexibilidad total en cómo y cuándo pagas tu suscripción.</p>
                  
                  <div className="security-features">
                    <div className="security-feature">
                      <div className="feature-icon">💳</div>
                      <div className="feature-content">
                        <h4>Métodos de Pago</h4>
                        <p>Aceptamos tarjetas de crédito, débito, PayPal, transferencias bancarias y criptomonedas.</p>
                      </div>
                    </div>
                    
                    <div className="security-feature">
                      <div className="feature-icon">📅</div>
                      <div className="feature-content">
                        <h4>Ciclos de Facturación</h4>
                        <p>Mensual, trimestral, semestral o anual. Cambia tu ciclo en cualquier momento.</p>
                      </div>
                    </div>
                    
                    <div className="security-feature">
                      <div className="feature-icon">🔄</div>
                      <div className="feature-content">
                        <h4>Upgrade/Downgrade</h4>
                        <p>Cambia tu plan en cualquier momento. Los cambios se reflejan al siguiente ciclo de facturación.</p>
                      </div>
                    </div>
                  </div>
                </article>

                <article id="garantia" className="legal-section">
                  <h2>Garantía de Satisfacción</h2>
                  <p>Tu satisfacción es nuestra prioridad. Ofrecemos garantía de devolución de dinero sin preguntas.</p>
                  
                  <div className="legal-accordion">
                    <div className="accordion-item">
                      <div className="accordion-header" onClick={() => toggleAccordion(0)}>
                        <h4>Garantía de 30 Días</h4>
                        <span className={`accordion-icon ${activeAccordion === 0 ? 'active' : ''}`}>
                          {activeAccordion === 0 ? '−' : '+'}
                        </span>
                      </div>
                      <div className={`accordion-content ${activeAccordion === 0 ? 'active' : ''}`}>
                        <p>Si no estás completamente satisfecho, te devolvemos tu dinero dentro de los primeros 30 días, sin preguntas.</p>
                      </div>
                    </div>
                    
                    <div className="accordion-item">
                      <div className="accordion-header" onClick={() => toggleAccordion(1)}>
                        <h4>Cancelación Inmediata</h4>
                        <span className={`accordion-icon ${activeAccordion === 1 ? 'active' : ''}`}>
                          {activeAccordion === 1 ? '−' : '+'}
                        </span>
                      </div>
                      <div className={`accordion-content ${activeAccordion === 1 ? 'active' : ''}`}>
                        <p>Cancela tu suscripción en cualquier momento desde tu panel de control. Sin penalizaciones ni tarifas de cancelación.</p>
                      </div>
                    </div>
                    
                    <div className="accordion-item">
                      <div className="accordion-header" onClick={() => toggleAccordion(2)}>
                        <h4>Acceso Completo</h4>
                        <span className={`accordion-icon ${activeAccordion === 2 ? 'active' : ''}`}>
                          {activeAccordion === 2 ? '−' : '+'}
                        </span>
                      </div>
                      <div className={`accordion-content ${activeAccordion === 2 ? 'active' : ''}`}>
                        <p>Mantienes acceso completo a todas las características hasta el final de tu período de facturación actual.</p>
                      </div>
                    </div>
                  </div>
                </article>

                <article id="faq-precios" className="legal-section">
                  <h2>Preguntas Frecuentes sobre Precios</h2>
                  <p>Respuestas a las consultas más comunes sobre nuestros precios y planes.</p>
                  
                  <div className="legal-list">
                    <div className="list-item">
                      <span className="list-icon">❓</span>
                      <span><strong>¿Hay tarifas ocultas?</strong> No, nuestros precios son 100% transparentes. No hay costos ocultos ni tarifas adicionales.</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">❓</span>
                      <span><strong>¿Puedo cambiar de plan?</strong> Sí, puedes upgrade o downgrade tu plan en cualquier momento desde tu dashboard.</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">❓</span>
                      <span><strong>¿Qué incluye el soporte?</strong> Desde chat básico (Starter) hasta soporte dedicado 24/7 (Enterprise).</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">❓</span>
                      <span><strong>¿Hay descuentos por volumen?</strong> Sí, para agencias grandes ofrecemos descuentos corporativos personalizados.</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">❓</span>
                      <span><strong>¿Cómo funciona la prueba gratuita?</strong> 14 días completos de acceso a todas las características del plan Professional.</span>
                    </div>
                  </div>
                </article>

                <article id="contacto-ventas" className="legal-section">
                  <h2>Contacto Comercial</h2>
                  <p>¿Necesitas una cotización personalizada o tienes preguntas sobre nuestros planes?</p>
                  
                  <div className="contact-info">
                    <div className="contact-item">
                      <span className="contact-icon">📧</span>
                      <div>
                        <strong>Email Comercial:</strong>
                        <a href="mailto:sales@pautapro.com">sales@pautapro.com</a>
                      </div>
                    </div>
                    
                    <div className="contact-item">
                      <span className="contact-icon">📞</span>
                      <div>
                        <strong>Teléfono Ventas:</strong>
                        <span>+1 (555) 123-4567</span>
                      </div>
                    </div>
                    
                    <div className="contact-item">
                      <span className="contact-icon">💬</span>
                      <div>
                        <strong>Chat en Vivo:</strong>
                        <span>Disponible en el sitio web 24/7</span>
                      </div>
                    </div>
                    
                    <div className="contact-item">
                      <span className="contact-icon">🗓️</span>
                      <div>
                        <strong>Demo Personalizada:</strong>
                        <a href="https://calendly.com/pautapro" target="_blank">Agendar demo de 30 minutos</a>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </section>

          {/* Footer */}
          <section className="legal-footer">
            <div className="legal-container">
              <div className="legal-footer-content">
                <div className="legal-footer-links">
                  <Link to="/features" className="footer-link">Características</Link>
                  <Link to="/pricing" className="footer-link active">Precios</Link>
                  <Link to="/integrations" className="footer-link">Integraciones</Link>
                  <Link to="/api" className="footer-link">API</Link>
                </div>
                
                <div className="legal-footer-copyright">
                  <p>&copy; 2024 PautaPro. Todos los derechos reservados.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Pricing;