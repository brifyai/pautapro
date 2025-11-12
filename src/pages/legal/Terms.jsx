import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../assets/css/legal.css';
import Navbar from '../../components/Navbar';

const Terms = () => {
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
                <span className="badge-icon">⚖️</span>
                <span className="badge-text">Relación transparente y justa</span>
              </div>
              
              <h1 className="legal-title">
                <span className="title-highlight">Términos y Condiciones</span>
              </h1>
              
              <p className="legal-subtitle">
                Lee cuidadosamente nuestros términos de servicio que rigen el uso de la plataforma PautaPro.
              </p>

              <div className="legal-meta">
                <span className="meta-item">
                  <strong>Última actualización:</strong> 12 de noviembre de 2024
                </span>
                <span className="meta-item">
                  <strong>Versión:</strong> 1.0
                </span>
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
                    <li><a href="#aceptacion" onClick={(e) => handleNavClick(e, 'aceptacion')}>Aceptación de Términos</a></li>
                    <li><a href="#descripcion" onClick={(e) => handleNavClick(e, 'descripcion')}>Descripción del Servicio</a></li>
                    <li><a href="#registro" onClick={(e) => handleNavClick(e, 'registro')}>Registro de Cuenta</a></li>
                    <li><a href="#uso-aceptable" onClick={(e) => handleNavClick(e, 'uso-aceptable')}>Uso Aceptable</a></li>
                    <li><a href="#propiedad" onClick={(e) => handleNavClick(e, 'propiedad')}>Propiedad Intelectual</a></li>
                    <li><a href="#facturacion" onClick={(e) => handleNavClick(e, 'facturacion')}>Facturación</a></li>
                    <li><a href="#privacidad" onClick={(e) => handleNavClick(e, 'privacidad')}>Privacidad</a></li>
                    <li><a href="#limitacion" onClick={(e) => handleNavClick(e, 'limitacion')}>Limitación</a></li>
                    <li><a href="#terminacion" onClick={(e) => handleNavClick(e, 'terminacion')}>Terminación</a></li>
                    <li><a href="#modificaciones" onClick={(e) => handleNavClick(e, 'modificaciones')}>Modificaciones</a></li>
                    <li><a href="#ley" onClick={(e) => handleNavClick(e, 'ley')}>Ley Aplicable</a></li>
                    <li><a href="#contacto-terms" onClick={(e) => handleNavClick(e, 'contacto-terms')}>Contacto</a></li>
                  </ul>
                </nav>
              </div>

              <div className="legal-main-content">
                <article id="aceptacion" className="legal-section">
                  <h2>1. Aceptación de Términos</h2>
                  <p>Al acceder y utilizar PautaPro, aceptas estar vinculado por estos Términos y Condiciones. Si no estás de acuerdo con alguno de estos términos, no debes usar nuestra plataforma.</p>
                  <p>Estos términos se aplican a todos los visitantes, usuarios y demás personas que accedan o utilicen el servicio.</p>
                </article>

                <article id="descripcion" className="legal-section">
                  <h2>2. Descripción del Servicio</h2>
                  <p>PautaPro es una plataforma de gestión publicitaria que proporciona herramientas para:</p>
                  
                  <div className="legal-cards">
                    <div className="legal-card">
                      <div className="card-icon">🚀</div>
                      <div className="card-content">
                        <h3>Creación de Campañas</h3>
                        <p>Herramientas avanzadas para crear y gestionar campañas publicitarias.</p>
                      </div>
                    </div>
                    
                    <div className="legal-card">
                      <div className="card-icon">📊</div>
                      <div className="card-content">
                        <h3>Análisis y Optimización</h3>
                        <p>Análisis de rendimiento y optimización inteligente de campañas.</p>
                      </div>
                    </div>
                    
                    <div className="legal-card">
                      <div className="card-icon">💰</div>
                      <div className="card-content">
                        <h3>Gestión de Presupuestos</h3>
                        <p>Control total sobre presupuestos y facturación automatizada.</p>
                      </div>
                    </div>
                    
                    <div className="legal-card">
                      <div className="card-icon">📈</div>
                      <div className="card-content">
                        <h3>Reportes Avanzados</h3>
                        <p>Reportes detallados y análisis de métricas en tiempo real.</p>
                      </div>
                    </div>
                  </div>
                </article>

                <article id="registro" className="legal-section">
                  <h2>3. Registro de Cuenta</h2>
                  <p>Para utilizar nuestros servicios, debes cumplir con los siguientes requisitos:</p>
                  
                  <div className="legal-list">
                    <div className="list-item">
                      <span className="list-icon">✓</span>
                      <span>Tener al menos 18 años de edad</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">✓</span>
                      <span>Proporcionar información precisa y actualizada</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">✓</span>
                      <span>Mantener la seguridad de tu contraseña</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">✓</span>
                      <span>Notificar cualquier uso no autorizado inmediatamente</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">✓</span>
                      <span>Ser responsable de todas las actividades bajo tu cuenta</span>
                    </div>
                  </div>
                </article>

                <article id="uso-aceptable" className="legal-section">
                  <h2>4. Uso Aceptable</h2>
                  <p>Te comprometes a utilizar PautaPro solo para fines lícitos. Está prohibido:</p>
                  
                  <div className="legal-accordion">
                    <div className="accordion-item">
                      <div className="accordion-header" onClick={() => toggleAccordion(0)}>
                        <h4>Actividades Ilegales</h4>
                        <span className={`accordion-icon ${activeAccordion === 0 ? 'active' : ''}`}>
                          {activeAccordion === 0 ? '−' : '+'}
                        </span>
                      </div>
                      <div className={`accordion-content ${activeAccordion === 0 ? 'active' : ''}`}>
                        <p>Violar cualquier ley local, estatal, nacional o internacional.</p>
                      </div>
                    </div>
                    
                    <div className="accordion-item">
                      <div className="accordion-header" onClick={() => toggleAccordion(1)}>
                        <h4>Contenido Prohibido</h4>
                        <span className={`accordion-icon ${activeAccordion === 1 ? 'active' : ''}`}>
                          {activeAccordion === 1 ? '−' : '+'}
                        </span>
                      </div>
                      <div className={`accordion-content ${activeAccordion === 1 ? 'active' : ''}`}>
                        <p>Transmitir contenido ilegal, difamatorio o invasivo de la privacidad.</p>
                      </div>
                    </div>
                    
                    <div className="accordion-item">
                      <div className="accordion-header" onClick={() => toggleAccordion(2)}>
                        <h4>Interferencia Técnica</h4>
                        <span className={`accordion-icon ${activeAccordion === 2 ? 'active' : ''}`}>
                          {activeAccordion === 2 ? '−' : '+'}
                        </span>
                      </div>
                      <div className={`accordion-content ${activeAccordion === 2 ? 'active' : ''}`}>
                        <p>Interferir con el funcionamiento de la plataforma o acceder a sistemas no autorizados.</p>
                      </div>
                    </div>
                    
                    <div className="accordion-item">
                      <div className="accordion-header" onClick={() => toggleAccordion(3)}>
                        <h4>Actividades Fraudulentas</h4>
                        <span className={`accordion-icon ${activeAccordion === 3 ? 'active' : ''}`}>
                          {activeAccordion === 3 ? '−' : '+'}
                        </span>
                      </div>
                      <div className={`accordion-content ${activeAccordion === 3 ? 'active' : ''}`}>
                        <p>Utilizar la plataforma para actividades fraudulentas o distribir malware.</p>
                      </div>
                    </div>
                  </div>
                </article>

                <article id="propiedad" className="legal-section">
                  <h2>5. Propiedad Intelectual</h2>
                  <p>Todo el contenido de PautaPro es propiedad de PautaPro o sus licenciantes y está protegido por leyes de derechos de autor.</p>
                  
                  <div className="rights-grid">
                    <div className="right-item">
                      <div className="right-icon">©️</div>
                      <h4>Derechos de Autor</h4>
                      <p>Protección completa del contenido original.</p>
                    </div>
                    
                    <div className="right-item">
                      <div className="right-icon">🏷️</div>
                      <h4>Marcas Registradas</h4>
                      <p>Logotipos y marcas protegidas legalmente.</p>
                    </div>
                    
                    <div className="right-item">
                      <div className="right-icon">🔒</div>
                      <h4>Licencia Limitada</h4>
                      <p>Uso autorizado solo según estos términos.</p>
                    </div>
                    
                    <div className="right-item">
                      <div className="right-icon">⚠️</div>
                      <h4>Prohibiciones</h4>
                      <p>No modificar, reproducir sin permiso.</p>
                    </div>
                  </div>
                </article>

                <article id="facturacion" className="legal-section">
                  <h2>6. Planes de Servicio y Facturación</h2>
                  <p>Ofrecemos diferentes planes de servicio con diversas características:</p>
                  
                  <div className="legal-cards">
                    <div className="legal-card">
                      <div className="card-icon">🌱</div>
                      <div className="card-content">
                        <h3>Starter</h3>
                        <p>Para pequeñas agencias en crecimiento con funcionalidades esenciales.</p>
                      </div>
                    </div>
                    
                    <div className="legal-card">
                      <div className="card-icon">💼</div>
                      <div className="card-content">
                        <h3>Professional</h3>
                        <p>Para agencias establecidas con herramientas avanzadas.</p>
                      </div>
                    </div>
                    
                    <div className="legal-card">
                      <div className="card-icon">🏢</div>
                      <div className="card-content">
                        <h3>Enterprise</h3>
                        <p>Para grandes organizaciones con personalización completa.</p>
                      </div>
                    </div>
                  </div>
                  
                  <p>La facturación es mensual o anual según el plan elegido. Los precios pueden cambiar con 30 días de aviso previo.</p>
                </article>

                <article id="privacidad" className="legal-section">
                  <h2>7. Privacidad y Protección de Datos</h2>
                  <p>Tu privacidad es importante para nosotros. Nuestro uso de tu información personal está regido por nuestra Política de Privacidad, que forma parte de estos términos.</p>
                  <p>Implementamos medidas de seguridad para proteger tus datos, pero no podemos garantizar seguridad absoluta.</p>
                </article>

                <article id="limitacion" className="legal-section">
                  <h2>8. Limitación de Responsabilidad</h2>
                  <p>PautaPro se proporciona "tal como está" sin garantías de ningún tipo. No somos responsables de:</p>
                  <ul>
                    <li>Daños indirectos, incidentales o consecuentes</li>
                    <li>Pérdida de datos o interrupción del servicio</li>
                    <li>Decisiones basadas en los datos proporcionados</li>
                    <li>Actividades de terceros o plataformas integradas</li>
                  </ul>
                </article>

                <article id="terminacion" className="legal-section">
                  <h2>9. Terminación del Servicio</h2>
                  <p>Puedes terminar tu cuenta en cualquier momento contactándonos. Nosotros podemos suspender o terminar tu cuenta si:</p>
                  <ul>
                    <li>Violas estos términos de servicio</li>
                    <li>No utilizas el servicio durante un período prolongado</li>
                    <li>Incumples con los pagos</li>
                    <li>Hay actividad sospechosa o fraudulenta</li>
                  </ul>
                </article>

                <article id="modificaciones" className="legal-section">
                  <h2>10. Modificaciones</h2>
                  <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Te notificaremos sobre cambios significativos por:</p>
                  <ul>
                    <li>Correo electrónico a tu dirección registrada</li>
                    <li>Notificaciones en la plataforma</li>
                    <li>Publicación en nuestro sitio web</li>
                  </ul>
                </article>

                <article id="ley" className="legal-section">
                  <h2>11. Ley Aplicable y Jurisdicción</h2>
                  <p>Estos términos se rigen por las leyes de Chile. Cualquier disputa será resuelta en los tribunales de Santiago, Chile.</p>
                </article>

                <article id="contacto-terms" className="legal-section">
                  <h2>12. Contacto</h2>
                  <p>Si tienes preguntas sobre estos términos y condiciones, contáctanos:</p>
                  
                  <div className="contact-info">
                    <div className="contact-item">
                      <span className="contact-icon">📧</span>
                      <div>
                        <strong>Correo electrónico:</strong>
                        <a href="mailto:legal@pautapro.com">legal@pautapro.com</a>
                      </div>
                    </div>
                    
                    <div className="contact-item">
                      <span className="contact-icon">📍</span>
                      <div>
                        <strong>Dirección:</strong>
                        <span>Av. Providencia 1234, Santiago, Chile</span>
                      </div>
                    </div>
                    
                    <div className="contact-item">
                      <span className="contact-icon">📞</span>
                      <div>
                        <strong>Teléfono:</strong>
                        <span>+56 2 2345 6789</span>
                      </div>
                    </div>
                    
                    <div className="contact-item">
                      <span className="contact-icon">🕐</span>
                      <div>
                        <strong>Horario:</strong>
                        <span>Lunes a Viernes, 9:00 - 18:00</span>
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
                  <Link to="/privacy" className="footer-link">Política de Privacidad</Link>
                  <Link to="/terms" className="footer-link active">Términos y Condiciones</Link>
                  <Link to="/security" className="footer-link">Seguridad</Link>
                  <Link to="/compliance" className="footer-link">Cumplimiento</Link>
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

export default Terms;