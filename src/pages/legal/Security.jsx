import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../assets/css/legal.css';
import Navbar from '../../components/Navbar';

const Security = () => {
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
                <span className="badge-icon">🔒</span>
                <span className="badge-text">Seguridad de nivel enterprise</span>
              </div>
              
              <h1 className="legal-title">
                Centro de <span className="title-highlight">Seguridad</span>
              </h1>
              
              <p className="legal-subtitle">
                Descubre las medidas de seguridad avanzadas que protegen tus datos y campañas publicitarias en PautaPro.
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
                    <li><a href="#encriptacion" onClick={(e) => handleNavClick(e, 'encriptacion')}>Encriptación de Datos</a></li>
                    <li><a href="#autenticacion" onClick={(e) => handleNavClick(e, 'autenticacion')}>Autenticación</a></li>
                    <li><a href="#infraestructura" onClick={(e) => handleNavClick(e, 'infraestructura')}>Infraestructura</a></li>
                    <li><a href="#monitoreo" onClick={(e) => handleNavClick(e, 'monitoreo')}>Monitoreo</a></li>
                    <li><a href="#datos-personales" onClick={(e) => handleNavClick(e, 'datos-personales')}>Protección Datos</a></li>
                    <li><a href="#backup" onClick={(e) => handleNavClick(e, 'backup')}>Backup y Recuperación</a></li>
                    <li><a href="#aplicaciones" onClick={(e) => handleNavClick(e, 'aplicaciones')}>Seguridad Apps</a></li>
                    <li><a href="#certificaciones" onClick={(e) => handleNavClick(e, 'certificaciones')}>Certificaciones</a></li>
                    <li><a href="#vulnerabilidades" onClick={(e) => handleNavClick(e, 'vulnerabilidades')}>Vulnerabilidades</a></li>
                    <li><a href="#capacitacion" onClick={(e) => handleNavClick(e, 'capacitacion')}>Capacitación</a></li>
                    <li><a href="#planes" onClick={(e) => handleNavClick(e, 'planes')}>Planes de Seguridad</a></li>
                    <li><a href="#contacto-security" onClick={(e) => handleNavClick(e, 'contacto-security')}>Contacto</a></li>
                  </ul>
                </nav>
              </div>

              <div className="legal-main-content">
                <article id="encriptacion" className="legal-section">
                  <h2>1. Encriptación de Datos</h2>
                  <p>Implementamos encriptación de clase militar para proteger tu información:</p>
                  
                  <div className="security-features">
                    <div className="security-feature">
                      <div className="feature-icon">🔐</div>
                      <div className="feature-content">
                        <h4>Encriptación en Tránsito</h4>
                        <p>TLS 1.3 para todas las comunicaciones con certificados SSL/TLS actualizados.</p>
                      </div>
                    </div>
                    
                    <div className="security-feature">
                      <div className="feature-icon">💾</div>
                      <div className="feature-content">
                        <h4>Encriptación en Reposo</h4>
                        <p>AES-256 para datos almacenados con rotación automática de claves cada 90 días.</p>
                      </div>
                    </div>
                    
                    <div className="security-feature">
                      <div className="feature-icon">🔑</div>
                      <div className="feature-content">
                        <h4>Gestión de Claves</h4>
                        <p>AWS KMS (Key Management Service) certificado y FIPS 140-2 Level 3.</p>
                      </div>
                    </div>
                    
                    <div className="security-feature">
                      <div className="feature-icon">🔄</div>
                      <div className="feature-content">
                        <h4>Rotación Automática</h4>
                        <p>Renovación automática de claves de encriptación sin intervención manual.</p>
                      </div>
                    </div>
                  </div>
                </article>

                <article id="autenticacion" className="legal-section">
                  <h2>2. Autenticación y Autorización</h2>
                  <p>Sistemas robustos de autenticación y control de acceso:</p>
                  
                  <div className="legal-cards">
                    <div className="legal-card">
                      <div className="card-icon">🛡️</div>
                      <div className="card-content">
                        <h3>Autenticación Multifactor</h3>
                        <p>Obligatoria para todos los usuarios con soporte para múltiples métodos.</p>
                      </div>
                    </div>
                    
                    <div className="legal-card">
                      <div className="card-icon">👁️</div>
                      <div className="card-content">
                        <h3>Biometría</h3>
                        <p>Soporte para fingerprint, reconocimiento facial y hardware tokens.</p>
                      </div>
                    </div>
                    
                    <div className="legal-card">
                      <div className="card-icon">🔐</div>
                      <div className="card-content">
                        <h3>Control de Acceso</h3>
                        <p>Permisos granulares por funcionalidad con roles personalizados.</p>
                      </div>
                    </div>
                    
                    <div className="legal-card">
                      <div className="card-icon">🔗</div>
                      <div className="card-content">
                        <h3>Single Sign-On</h3>
                        <p>Integración con proveedores empresariales como SAML y OAuth 2.0.</p>
                      </div>
                    </div>
                  </div>
                </article>

                <article id="infraestructura" className="legal-section">
                  <h2>3. Infraestructura y Seguridad</h2>
                  <p>Infraestructura de seguridad de nivel enterprise:</p>
                  
                  <div className="legal-list">
                    <div className="list-item">
                      <span className="list-icon">🏢</span>
                      <span>Data centers certificados ISO 27001, SOC 2 Type II, PCI DSS</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">🌐</span>
                      <span>Redes segmentadas con aislamiento por zonas de confianza</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">🔥</span>
                      <span>Firewall avanzado WAF con detección de amenazas en tiempo real</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">⚡</span>
                      <span>DDoS Protection contra ataques de denegación de servicio</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">👁️</span>
                      <span>Intrusion Detection con monitoreo 24/7 y respuesta automatizada</span>
                    </div>
                  </div>
                </article>

                <article id="monitoreo" className="legal-section">
                  <h2>4. Monitoreo y Respuesta a Incidentes</h2>
                  <p>Vigilancia continua y respuesta rápida ante amenazas:</p>
                  
                  <div className="legal-accordion">
                    <div className="accordion-item">
                      <div className="accordion-header" onClick={() => toggleAccordion(0)}>
                        <h4>SIEM (Security Information and Event Management)</h4>
                        <span className={`accordion-icon ${activeAccordion === 0 ? 'active' : ''}`}>
                          {activeAccordion === 0 ? '−' : '+'}
                        </span>
                      </div>
                      <div className={`accordion-content ${activeAccordion === 0 ? 'active' : ''}`}>
                        <p>Recolección y análisis de logs en tiempo real con correlación de eventos de seguridad.</p>
                      </div>
                    </div>
                    
                    <div className="accordion-item">
                      <div className="accordion-header" onClick={() => toggleAccordion(1)}>
                        <h4>Anomaly Detection</h4>
                        <span className={`accordion-icon ${activeAccordion === 1 ? 'active' : ''}`}>
                          {activeAccordion === 1 ? '−' : '+'}
                        </span>
                      </div>
                      <div className={`accordion-content ${activeAccordion === 1 ? 'active' : ''}`}>
                        <p>Inteligencia artificial para detectar patrones anómalos de acceso y comportamiento.</p>
                      </div>
                    </div>
                    
                    <div className="accordion-item">
                      <div className="accordion-header" onClick={() => toggleAccordion(2)}>
                        <h4>Incident Response Team</h4>
                        <span className={`accordion-icon ${activeAccordion === 2 ? 'active' : ''}`}>
                          {activeAccordion === 2 ? '−' : '+'}
                        </span>
                      </div>
                      <div className={`accordion-content ${activeAccordion === 2 ? 'active' : ''}`}>
                        <p>Equipo especializado disponible 24/7 con protocolos de respuesta certificados.</p>
                      </div>
                    </div>
                    
                    <div className="accordion-item">
                      <div className="accordion-header" onClick={() => toggleAccordion(3)}>
                        <h4>Penetration Testing</h4>
                        <span className={`accordion-icon ${activeAccordion === 3 ? 'active' : ''}`}>
                          {activeAccordion === 3 ? '−' : '+'}
                        </span>
                      </div>
                      <div className={`accordion-content ${activeAccordion === 3 ? 'active' : ''}`}>
                        <p>Pruebas de penetración trimestrales por terceros independientes certificados.</p>
                      </div>
                    </div>
                  </div>
                </article>

                <article id="datos-personales" className="legal-section">
                  <h2>5. Protección de Datos Personales</h2>
                  <p>Cumplimiento con regulaciones internacionales de privacidad:</p>
                  
                  <div className="rights-grid">
                    <div className="right-item">
                      <div className="right-icon">🇪🇺</div>
                      <h4>GDPR Compliance</h4>
                      <p>Cumplimiento total con regulaciones europeas de protección de datos.</p>
                    </div>
                    
                    <div className="right-item">
                      <div className="right-icon">🇺🇸</div>
                      <h4>CCPA Compliance</h4>
                      <p>Conformidad con la ley de privacidad de California.</p>
                    </div>
                    
                    <div className="right-item">
                      <div className="right-icon">🇧🇷</div>
                      <h4>LGPD Compliance</h4>
                      <p>Adaptación a la ley general de protección de datos de Brasil.</p>
                    </div>
                    
                    <div className="right-item">
                      <div className="right-icon">🌍</div>
                      <h4>Data Residency</h4>
                      <p>Opciones de almacenamiento en regiones específicas según preferencias.</p>
                    </div>
                    
                    <div className="right-item">
                      <div className="right-icon">📊</div>
                      <h4>Data Minimization</h4>
                      <p>Recopilación mínima necesaria de datos personales.</p>
                    </div>
                    
                    <div className="right-item">
                      <div className="right-icon">✅</div>
                      <h4>Consentimiento</h4>
                      <p>Gestión granular de consentimientos y preferencias de privacidad.</p>
                    </div>
                  </div>
                </article>

                <article id="backup" className="legal-section">
                  <h2>6. Backup y Recuperación</h2>
                  <p>Estrategias completas de backup y disaster recovery:</p>
                  <ul>
                    <li><strong>Backup automático:</strong> Respaldos encriptados cada 6 horas con retención de 30 días</li>
                    <li><strong>Geo-redundancia:</strong> Almacenamiento en múltiples ubicaciones geográficas</li>
                    <li><strong>RTO/RPO:</strong> Tiempo de recuperación objetivo de 4 horas, punto de recuperación de 1 hora</li>
                    <li><strong>Business Continuity:</strong> Plan de continuidad de negocio probado y certificado</li>
                    <li><strong>Data Retention:</strong> Políticas claras de retención y eliminación segura</li>
                  </ul>
                </article>

                <article id="aplicaciones" className="legal-section">
                  <h2>7. Seguridad de Aplicaciones</h2>
                  <p>Desarrollo seguro y testing continuo:</p>
                  <ul>
                    <li><strong>Secure Development:</strong> Metodología DevSecOps con seguridad integrada en CI/CD</li>
                    <li><strong>Code Reviews:</strong> Revisiones de código obligatorias para todos los cambios</li>
                    <li><strong>Static Analysis:</strong> Análisis estático automático del código con herramientas enterprise</li>
                    <li><strong>Dynamic Testing:</strong> Testing dinámico de aplicaciones en producción</li>
                    <li><strong>Dependency Scanning:</strong> Monitoreo continuo de vulnerabilidades en dependencias</li>
                  </ul>
                </article>

                <article id="certificaciones" className="legal-section">
                  <h2>8. Certificaciones y Cumplimiento</h2>
                  <p>Certificaciones de seguridad reconocidas internacionalmente:</p>
                  
                  <div className="legal-cards">
                    <div className="legal-card">
                      <div className="card-icon">📋</div>
                      <div className="card-content">
                        <h3>ISO 27001</h3>
                        <p>Sistema de gestión de seguridad de la información certificado.</p>
                      </div>
                    </div>
                    
                    <div className="legal-card">
                      <div className="card-icon">🔒</div>
                      <div className="card-content">
                        <h3>SOC 2 Type II</h3>
                        <p>Controles de seguridad, disponibilidad y confidencialidad auditados.</p>
                      </div>
                    </div>
                    
                    <div className="legal-card">
                      <div className="card-icon">💳</div>
                      <div className="card-content">
                        <h3>PCI DSS</h3>
                        <p>Estándar de seguridad de datos para procesamiento de pagos.</p>
                      </div>
                    </div>
                    
                    <div className="legal-card">
                      <div className="card-icon">🏥</div>
                      <div className="card-content">
                        <h3>HIPAA</h3>
                        <p>Ley de portabilidad y responsabilidad de seguros de salud.</p>
                      </div>
                    </div>
                  </div>
                </article>

                <article id="vulnerabilidades" className="legal-section">
                  <h2>9. Reporte de Vulnerabilidades</h2>
                  <p>Programa responsable de divulgación de vulnerabilidades:</p>
                  
                  <div className="legal-list">
                    <div className="list-item">
                      <span className="list-icon">💰</span>
                      <span>Bug Bounty Program con recompensas por reportar vulnerabilidades</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">🔍</span>
                      <span>Security Researcher Portal dedicado para investigadores</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">⚡</span>
                      <span>Response Time de 48 horas para reportes de vulnerabilidades</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">📢</span>
                      <span>Transparent Communication sobre vulnerabilidades corregidas</span>
                    </div>
                  </div>
                </article>

                <article id="capacitacion" className="legal-section">
                  <h2>10. Educación y Capacitación</h2>
                  <p>Compromiso con la educación en ciberseguridad:</p>
                  <ul>
                    <li><strong>Security Awareness Training:</strong> Capacitación obligatoria para empleados</li>
                    <li><strong>Phishing Simulations:</strong> Simulaciones mensuales de phishing</li>
                    <li><strong>Security Champions:</strong> Programa de embajadores de seguridad</li>
                    <li><strong>Industry Conferences:</strong> Participación activa en conferencias de seguridad</li>
                    <li><strong>Best Practices:</strong> Guías y mejores prácticas para usuarios</li>
                  </ul>
                </article>

                <article id="planes" className="legal-section">
                  <h2>11. Planes de Seguridad del Cliente</h2>
                  <p>Opciones adicionales de seguridad según tu plan:</p>
                  
                  <div className="security-features">
                    <div className="security-feature">
                      <div className="feature-icon">🌱</div>
                      <div className="feature-content">
                        <h4>Starter</h4>
                        <p>Seguridad básica con autenticación multifactor y encriptación estándar.</p>
                      </div>
                    </div>
                    
                    <div className="security-feature">
                      <div className="feature-icon">💼</div>
                      <div className="feature-content">
                        <h4>Professional</h4>
                        <p>Incluye SSO, audit logs avanzados, alertas de seguridad en tiempo real.</p>
                      </div>
                    </div>
                    
                    <div className="security-feature">
                      <div className="feature-icon">🏢</div>
                      <div className="feature-content">
                        <h4>Enterprise</h4>
                        <p>Features avanzadas como SIEM, reportes de compliance y SOC 2 completo.</p>
                      </div>
                    </div>
                  </div>
                </article>

                <article id="contacto-security" className="legal-section">
                  <h2>12. Contacto de Seguridad</h2>
                  <p>Para reportar vulnerabilidades o incidentes de seguridad:</p>
                  
                  <div className="contact-info">
                    <div className="contact-item">
                      <span className="contact-icon">🚨</span>
                      <div>
                        <strong>Email de emergencia:</strong>
                        <a href="mailto:security@pautapro.com">security@pautapro.com</a>
                      </div>
                    </div>
                    
                    <div className="contact-item">
                      <span className="contact-icon">📞</span>
                      <div>
                        <strong>Teléfono 24/7:</strong>
                        <span>+56 2 2345 6900</span>
                      </div>
                    </div>
                    
                    <div className="contact-item">
                      <span className="contact-icon">🔐</span>
                      <div>
                        <strong>PGP Key:</strong>
                        <span>Disponible para comunicaciones encriptadas</span>
                      </div>
                    </div>
                    
                    <div className="contact-item">
                      <span className="contact-icon">📝</span>
                      <div>
                        <strong>Security Blog:</strong>
                        <a href="https://blog.pautapro.com/security" target="_blank" rel="noopener noreferrer">blog.pautapro.com/security</a>
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
                  <Link to="/terms" className="footer-link">Términos y Condiciones</Link>
                  <Link to="/security" className="footer-link active">Seguridad</Link>
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

export default Security;