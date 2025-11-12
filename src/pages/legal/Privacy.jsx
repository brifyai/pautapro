import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../assets/css/legal.css';
import Navbar from '../../components/Navbar';

const Privacy = () => {
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
                <span className="badge-icon">🛡️</span>
                <span className="badge-text">Protección de datos garantizada</span>
              </div>
              
              <h1 className="legal-title">
                Política de <span className="title-highlight">Privacidad</span>
              </h1>
              
              <p className="legal-subtitle">
                Tu privacidad es nuestra prioridad. Conoce cómo recopilamos, usamos y protegemos tu información personal en PautaPro.
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
                    <li><a href="#info-recopilada" onClick={(e) => handleNavClick(e, 'info-recopilada')}>Información Recopilada</a></li>
                    <li><a href="#uso-informacion" onClick={(e) => handleNavClick(e, 'uso-informacion')}>Uso de Información</a></li>
                    <li><a href="#compartir-informacion" onClick={(e) => handleNavClick(e, 'compartir-informacion')}>Compartir Información</a></li>
                    <li><a href="#seguridad-datos" onClick={(e) => handleNavClick(e, 'seguridad-datos')}>Seguridad de Datos</a></li>
                    <li><a href="#derechos-usuario" onClick={(e) => handleNavClick(e, 'derechos-usuario')}>Derechos del Usuario</a></li>
                    <li><a href="#retencion-datos" onClick={(e) => handleNavClick(e, 'retencion-datos')}>Retención de Datos</a></li>
                    <li><a href="#cookies" onClick={(e) => handleNavClick(e, 'cookies')}>Cookies</a></li>
                    <li><a href="#transferencias" onClick={(e) => handleNavClick(e, 'transferencias')}>Transferencias</a></li>
                    <li><a href="#menores" onClick={(e) => handleNavClick(e, 'menores')}>Menores de Edad</a></li>
                    <li><a href="#cambios" onClick={(e) => handleNavClick(e, 'cambios')}>Cambios</a></li>
                    <li><a href="#contacto" onClick={(e) => handleNavClick(e, 'contacto')}>Contacto</a></li>
                  </ul>
                </nav>
              </div>

              <div className="legal-main-content">
                <article id="info-recopilada" className="legal-section">
                  <h2>1. Información que Recopilamos</h2>
                  <p>En PautaPro recopilamos información que nos ayuda a ofrecerte el mejor servicio:</p>
                  
                  <div className="legal-cards">
                    <div className="legal-card">
                      <div className="card-icon">👤</div>
                      <div className="card-content">
                        <h3>Información de Cuenta</h3>
                        <p>Nombre, correo electrónico, empresa, datos de contacto y información de perfil.</p>
                      </div>
                    </div>
                    
                    <div className="legal-card">
                      <div className="card-icon">📊</div>
                      <div className="card-content">
                        <h3>Información de Uso</h3>
                        <p>Cómo interactúas con nuestra plataforma, páginas visitadas, funciones utilizadas y preferencias.</p>
                      </div>
                    </div>
                    
                    <div className="legal-card">
                      <div className="card-icon">💻</div>
                      <div className="card-content">
                        <h3>Información Técnica</h3>
                        <p>Dirección IP, tipo de navegador, dispositivo, sistema operativo y datos de conexión.</p>
                      </div>
                    </div>
                    
                    <div className="legal-card">
                      <div className="card-icon">📈</div>
                      <div className="card-content">
                        <h3>Datos de Campañas</h3>
                        <p>Información sobre tus campañas publicitarias para proporcionarte mejores servicios.</p>
                      </div>
                    </div>
                  </div>
                </article>

                <article id="uso-informacion" className="legal-section">
                  <h2>2. Cómo Usamos tu Información</h2>
                  <p>Utilizamos la información recopilada para:</p>
                  
                  <div className="legal-list">
                    <div className="list-item">
                      <span className="list-icon">✓</span>
                      <span>Proporcionar y mejorar nuestros servicios</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">✓</span>
                      <span>Personalizar tu experiencia en la plataforma</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">✓</span>
                      <span>Enviar comunicaciones importantes sobre tu cuenta</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">✓</span>
                      <span>Analizar el uso para optimizar la plataforma</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">✓</span>
                      <span>Cumplir con obligaciones legales y de compliance</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">✓</span>
                      <span>Proteger nuestros sistemas y prevenir fraudes</span>
                    </div>
                  </div>
                </article>

                <article id="compartir-informacion" className="legal-section">
                  <h2>3. Compartir Información</h2>
                  <p>No vendemos tu información personal. Podemos compartir información únicamente en los siguientes casos:</p>
                  
                  <div className="legal-accordion">
                    <div className="accordion-item">
                      <div className="accordion-header" onClick={() => toggleAccordion(0)}>
                        <h4>Proveedores de Servicios</h4>
                        <span className={`accordion-icon ${activeAccordion === 0 ? 'active' : ''}`}>
                          {activeAccordion === 0 ? '−' : '+'}
                        </span>
                      </div>
                      <div className={`accordion-content ${activeAccordion === 0 ? 'active' : ''}`}>
                        <p>Terceros que nos ayudan a operar la plataforma bajo acuerdos estrictos de confidencialidad.</p>
                      </div>
                    </div>
                    
                    <div className="accordion-item">
                      <div className="accordion-header" onClick={() => toggleAccordion(1)}>
                        <h4>Requisitos Legales</h4>
                        <span className={`accordion-icon ${activeAccordion === 1 ? 'active' : ''}`}>
                          {activeAccordion === 1 ? '−' : '+'}
                        </span>
                      </div>
                      <div className={`accordion-content ${activeAccordion === 1 ? 'active' : ''}`}>
                        <p>Cuando sea requerido por ley o autoridades competentes.</p>
                      </div>
                    </div>
                    
                    <div className="accordion-item">
                      <div className="accordion-header" onClick={() => toggleAccordion(2)}>
                        <h4>Protección de Derechos</h4>
                        <span className={`accordion-icon ${activeAccordion === 2 ? 'active' : ''}`}>
                          {activeAccordion === 2 ? '−' : '+'}
                        </span>
                      </div>
                      <div className={`accordion-content ${activeAccordion === 2 ? 'active' : ''}`}>
                        <p>Para proteger nuestros derechos legales o los de nuestros usuarios.</p>
                      </div>
                    </div>
                    
                    <div className="accordion-item">
                      <div className="accordion-header" onClick={() => toggleAccordion(3)}>
                        <h4>Consentimiento</h4>
                        <span className={`accordion-icon ${activeAccordion === 3 ? 'active' : ''}`}>
                          {activeAccordion === 3 ? '−' : '+'}
                        </span>
                      </div>
                      <div className={`accordion-content ${activeAccordion === 3 ? 'active' : ''}`}>
                        <p>Con tu consentimiento expreso.</p>
                      </div>
                    </div>
                  </div>
                </article>

                <article id="seguridad-datos" className="legal-section">
                  <h2>4. Seguridad de Datos</h2>
                  <p>Implementamos múltiples capas de seguridad:</p>
                  
                  <div className="security-features">
                    <div className="security-feature">
                      <div className="feature-icon">🔐</div>
                      <div className="feature-content">
                        <h4>Encriptación AES-256</h4>
                        <p>Datos en tránsito y en reposo con encriptación militar.</p>
                      </div>
                    </div>
                    
                    <div className="security-feature">
                      <div className="feature-icon">🔑</div>
                      <div className="feature-content">
                        <h4>Autenticación 2FA</h4>
                        <p>Autenticación de dos factores obligatoria para todos los usuarios.</p>
                      </div>
                    </div>
                    
                    <div className="security-feature">
                      <div className="feature-icon">🛡️</div>
                      <div className="feature-content">
                        <h4>Acceso Controlado</h4>
                        <p>Acceso mínimo necesario para empleados autorizados.</p>
                      </div>
                    </div>
                    
                    <div className="security-feature">
                      <div className="feature-icon">👁️</div>
                      <div className="feature-content">
                        <h4>Monitoreo 24/7</h4>
                        <p>Vigilancia continua de intentos de acceso no autorizado.</p>
                      </div>
                    </div>
                  </div>
                </article>

                <article id="derechos-usuario" className="legal-section">
                  <h2>5. Tus Derechos</h2>
                  <p>Tienes derecho a:</p>
                  
                  <div className="rights-grid">
                    <div className="right-item">
                      <div className="right-icon">📋</div>
                      <h4>Acceso</h4>
                      <p>Solicitar una copia de la información que tenemos sobre ti.</p>
                    </div>
                    
                    <div className="right-item">
                      <div className="right-icon">✏️</div>
                      <h4>Rectificación</h4>
                      <p>Corregir información incorrecta o desactualizada.</p>
                    </div>
                    
                    <div className="right-item">
                      <div className="right-icon">🗑️</div>
                      <h4>Eliminación</h4>
                      <p>Solicitar la eliminación de tu información personal.</p>
                    </div>
                    
                    <div className="right-item">
                      <div className="right-icon">📤</div>
                      <h4>Portabilidad</h4>
                      <p>Recibir tus datos en un formato estructurado.</p>
                    </div>
                    
                    <div className="right-item">
                      <div className="right-icon">🚫</div>
                      <h4>Oposición</h4>
                      <p>Oponerte al procesamiento de tu información para ciertos fines.</p>
                    </div>
                    
                    <div className="right-item">
                      <div className="right-icon">⏸️</div>
                      <h4>Limitación</h4>
                      <p>Solicitar que limitemos el procesamiento de tu información.</p>
                    </div>
                  </div>
                </article>

                <article id="retencion-datos" className="legal-section">
                  <h2>6. Retención de Datos</h2>
                  <p>Mantenemos tu información durante el tiempo necesario para:</p>
                  <ul>
                    <li>Proporcionar nuestros servicios</li>
                    <li>Cumplir con obligaciones legales</li>
                    <li>Resolver disputas y hacer cumplir acuerdos</li>
                    <li>Mejorar nuestros servicios y desarrollar nuevos</li>
                  </ul>
                  <p>Cuando elimines tu cuenta, eliminaremos tu información personal, excepto cuando la ley requiera su retención.</p>
                </article>

                <article id="cookies" className="legal-section">
                  <h2>7. Cookies y Tecnologías Similares</h2>
                  <p>Utilizamos cookies y tecnologías similares para:</p>
                  <ul>
                    <li>Mantener tu sesión activa</li>
                    <li>Recordar tus preferencias</li>
                    <li>Analizar el uso de la plataforma</li>
                    <li>Mejorar nuestros servicios</li>
                    <li>Proporcionar contenido personalizado</li>
                  </ul>
                  <p>Puedes controlar las cookies a través de la configuración de tu navegador.</p>
                </article>

                <article id="transferencias" className="legal-section">
                  <h2>8. Transferencias Internacionales</h2>
                  <p>En ciertos casos, tu información puede ser transferida y procesada en países fuera de tu jurisdicción. Garantizamos que todas las transferencias cumplen con:</p>
                  <ul>
                    <li>Estándares de protección de datos de la UE (GDPR)</li>
                    <li>Cláusulas contractuales estándar de la Comisión Europea</li>
                    <li>Certificaciones internacionales de seguridad</li>
                  </ul>
                </article>

                <article id="menores" className="legal-section">
                  <h2>9. Menores de Edad</h2>
                  <p>Nuestra plataforma está diseñada para personas mayores de 18 años. No recopilamos intencionalmente información de menores de 18 años. Si descubrimos que hemos recopilado información de un menor, la eliminaremos inmediatamente.</p>
                </article>

                <article id="cambios" className="legal-section">
                  <h2>10. Cambios en esta Política</h2>
                  <p>Podemos actualizar esta política ocasionalmente. Te notificaremos sobre cambios significativos por:</p>
                  <ul>
                    <li>Correo electrónico a tu dirección registrada</li>
                    <li>Notificaciones en la plataforma</li>
                    <li>Actualización de la fecha de "última modificación"</li>
                  </ul>
                </article>

                <article id="contacto" className="legal-section">
                  <h2>11. Contacto</h2>
                  <p>Si tienes preguntas sobre esta política de privacidad, contáctanos:</p>
                  
                  <div className="contact-info">
                    <div className="contact-item">
                      <span className="contact-icon">📧</span>
                      <div>
                        <strong>Correo electrónico:</strong>
                        <a href="mailto:privacy@pautapro.com">privacy@pautapro.com</a>
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
                  <Link to="/privacy" className="footer-link active">Política de Privacidad</Link>
                  <Link to="/terms" className="footer-link">Términos y Condiciones</Link>
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

export default Privacy;