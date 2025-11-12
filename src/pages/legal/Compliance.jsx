import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../assets/css/legal.css';
import Navbar from '../../components/Navbar';

const Compliance = () => {
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
                <span className="badge-text">Cumplimiento regulatorio integral</span>
              </div>
              
              <h1 className="legal-title">
                Marco de <span className="title-highlight">Cumplimiento</span>
              </h1>
              
              <p className="legal-subtitle">
                PautaPro cumple con las más estrictas regulaciones internacionales para garantizar la protección y transparencia en el manejo de datos.
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
                    <li><a href="#gdpr" onClick={(e) => handleNavClick(e, 'gdpr')}>GDPR</a></li>
                    <li><a href="#ccpa" onClick={(e) => handleNavClick(e, 'ccpa')}>CCPA</a></li>
                    <li><a href="#lgpd" onClick={(e) => handleNavClick(e, 'lgpd')}>LGPD</a></li>
                    <li><a href="#sox" onClick={(e) => handleNavClick(e, 'sox')}>SOX</a></li>
                    <li><a href="#pci" onClick={(e) => handleNavClick(e, 'pci')}>PCI DSS</a></li>
                    <li><a href="#coppa" onClick={(e) => handleNavClick(e, 'coppa')}>COPPA</a></li>
                    <li><a href="#soc2" onClick={(e) => handleNavClick(e, 'soc2')}>SOC 2</a></li>
                    <li><a href="#iso" onClick={(e) => handleNavClick(e, 'iso')}>ISO 27001</a></li>
                    <li><a href="#aml" onClick={(e) => handleNavClick(e, 'aml')}>AML y KYC</a></li>
                    <li><a href="#regionales" onClick={(e) => handleNavClick(e, 'regionales')}>Regulaciones Locales</a></li>
                    <li><a href="#programas" onClick={(e) => handleNavClick(e, 'programas')}>Programas</a></li>
                    <li><a href="#auditorias" onClick={(e) => handleNavClick(e, 'auditorias')}>Auditorías</a></li>
                    <li><a href="#reportes" onClick={(e) => handleNavClick(e, 'reportes')}>Reportes</a></li>
                    <li><a href="#contacto-compliance" onClick={(e) => handleNavClick(e, 'contacto-compliance')}>Contacto</a></li>
                  </ul>
                </nav>
              </div>

              <div className="legal-main-content">
                <article id="gdpr" className="legal-section">
                  <h2>1. GDPR (General Data Protection Regulation)</h2>
                  <p>PautaPro cumple completamente con el GDPR europeo, proporcionando:</p>
                  
                  <div className="legal-cards">
                    <div className="legal-card">
                      <div className="card-icon">✅</div>
                      <div className="card-content">
                        <h3>Consentimiento Explícito</h3>
                        <p>Base legal clara para el procesamiento de datos con gestión granular.</p>
                      </div>
                    </div>
                    
                    <div className="legal-card">
                      <div className="card-icon">🗑️</div>
                      <div className="card-content">
                        <h3>Derecho al Olvido</h3>
                        <p>Eliminación completa de datos personales bajo solicitud.</p>
                      </div>
                    </div>
                    
                    <div className="legal-card">
                      <div className="card-icon">📤</div>
                      <div className="card-content">
                        <h3>Portabilidad de Datos</h3>
                        <p>Exportación fácil de información personal en formatos estándar.</p>
                      </div>
                    </div>
                    
                    <div className="legal-card">
                      <div className="card-icon">🚨</div>
                      <div className="card-content">
                        <h3>Notificación de Brechas</h3>
                        <p>Reporte dentro de 72 horas a autoridades y afectados.</p>
                      </div>
                    </div>
                  </div>
                </article>

                <article id="ccpa" className="legal-section">
                  <h2>2. CCPA (California Consumer Privacy Act)</h2>
                  <p>Cumplimiento total con las regulaciones de privacidad de California:</p>
                  
                  <div className="rights-grid">
                    <div className="right-item">
                      <div className="right-icon">🔍</div>
                      <h4>Transparencia</h4>
                      <p>Información clara sobre recolección y uso de datos.</p>
                    </div>
                    
                    <div className="right-item">
                      <div className="right-icon">🚫</div>
                      <h4>Derecho de Opt-out</h4>
                      <p>Control total sobre venta de datos personales.</p>
                    </div>
                    
                    <div className="right-item">
                      <div className="right-icon">✏️</div>
                      <h4>Acceso y Eliminación</h4>
                      <p>Derechos de acceso, corrección y eliminación de datos.</p>
                    </div>
                    
                    <div className="right-item">
                      <div className="right-icon">⚖️</div>
                      <h4>No Discriminación</h4>
                      <p>Servicios iguales independientemente de decisiones de privacidad.</p>
                    </div>
                  </div>
                </article>

                <article id="lgpd" className="legal-section">
                  <h2>3. LGPD (Lei Geral de Proteção de Dados)</h2>
                  <p>Conformidad con la ley de protección de datos de Brasil:</p>
                  
                  <div className="legal-list">
                    <div className="list-item">
                      <span className="list-icon">⚖️</span>
                      <span>Tratamiento lícito con bases legales válidas según la LGPD</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">🔍</span>
                      <span>Transparencia con información clara sobre propósitos del tratamiento</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">🛡️</span>
                      <span>Seguridad con medidas técnicas y organizativas apropiadas</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">📞</span>
                      <span>Cooperación activa con ANPD (Autoridade Nacional de Proteção)</span>
                    </div>
                  </div>
                </article>

                <article id="sox" className="legal-section">
                  <h2>4. SOX (Sarbanes-Oxley Act)</h2>
                  <p>Controles financieros y de información para empresas públicas:</p>
                  
                  <div className="security-features">
                    <div className="security-feature">
                      <div className="feature-icon">📋</div>
                      <div className="feature-content">
                        <h4>Controles Internos</h4>
                        <p>Procesos robustos de control financiero y de información.</p>
                      </div>
                    </div>
                    
                    <div className="security-feature">
                      <div className="feature-icon">🔍</div>
                      <div className="feature-content">
                        <h4>Auditorías</h4>
                        <p>Revisiones periódicas independientes de controles internos.</p>
                      </div>
                    </div>
                    
                    <div className="security-feature">
                      <div className="feature-icon">📝</div>
                      <div className="feature-content">
                        <h4>Documentación</h4>
                        <p>Registros detallados de procesos financieros y de información.</p>
                      </div>
                    </div>
                    
                    <div className="security-feature">
                      <div className="feature-icon">✍️</div>
                      <div className="feature-content">
                        <h4>Certificación Ejecutiva</h4>
                        <p>Declaración de responsabilidad por directivos y ejecutivos.</p>
                      </div>
                    </div>
                  </div>
                </article>

                <article id="pci" className="legal-section">
                  <h2>5. PCI DSS (Payment Card Industry Data Security Standard)</h2>
                  <p>Seguridad en el procesamiento de pagos con tarjeta:</p>
                  
                  <div className="legal-accordion">
                    <div className="accordion-item">
                      <div className="accordion-header" onClick={() => toggleAccordion(0)}>
                        <h4>Red Segura</h4>
                        <span className={`accordion-icon ${activeAccordion === 0 ? 'active' : ''}`}>
                          {activeAccordion === 0 ? '−' : '+'}
                        </span>
                      </div>
                      <div className={`accordion-content ${activeAccordion === 0 ? 'active' : ''}`}>
                        <p>Firewall y sistemas de encriptación robustos para proteger la red.</p>
                      </div>
                    </div>
                    
                    <div className="accordion-item">
                      <div className="accordion-header" onClick={() => toggleAccordion(1)}>
                        <h4>Protección de Datos</h4>
                        <span className={`accordion-icon ${activeAccordion === 1 ? 'active' : ''}`}>
                          {activeAccordion === 1 ? '−' : '+'}
                        </span>
                      </div>
                      <div className={`accordion-content ${activeAccordion === 1 ? 'active' : ''}`}>
                        <p>Encriptación de datos de titulares de tarjetas durante transmisión y almacenamiento.</p>
                      </div>
                    </div>
                    
                    <div className="accordion-item">
                      <div className="accordion-header" onClick={() => toggleAccordion(2)}>
                        <h4>Gestión de Vulnerabilidades</h4>
                        <span className={`accordion-icon ${activeAccordion === 2 ? 'active' : ''}`}>
                          {activeAccordion === 2 ? '−' : '+'}
                        </span>
                      </div>
                      <div className={`accordion-content ${activeAccordion === 2 ? 'active' : ''}`}>
                        <p>Anti-virus y sistemas actualizados regularmente para prevenir vulnerabilidades.</p>
                      </div>
                    </div>
                    
                    <div className="accordion-item">
                      <div className="accordion-header" onClick={() => toggleAccordion(3)}>
                        <h4>Control de Acceso</h4>
                        <span className={`accordion-icon ${activeAccordion === 3 ? 'active' : ''}`}>
                          {activeAccordion === 3 ? '−' : '+'}
                        </span>
                      </div>
                      <div className={`accordion-content ${activeAccordion === 3 ? 'active' : ''}`}>
                        <p>Acceso restringido basado en necesidad de saber para proteger datos.</p>
                      </div>
                    </div>
                  </div>
                </article>

                <article id="coppa" className="legal-section">
                  <h2>6. COPPA (Children's Online Privacy Protection Act)</h2>
                  <p>Protección especial para menores de 13 años:</p>
                  
                  <div className="legal-list">
                    <div className="list-item">
                      <span className="list-icon">🎂</span>
                      <span>Verificación de edad con medidas para identificar usuarios menores</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">👨‍👩‍👧‍👦</span>
                      <span>Consentimiento parental obligatorio antes de recopilar datos de menores</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">🛡️</span>
                      <span>Protección reforzada con medidas adicionales para proteger a menores</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">📋</span>
                      <span>Reportes especiales con procedimientos específicos para casos de menores</span>
                    </div>
                  </div>
                </article>

                <article id="soc2" className="legal-section">
                  <h2>7. SOC 2 (Service Organization Control 2)</h2>
                  <p>Controles de seguridad, disponibilidad y confidencialidad:</p>
                  
                  <div className="legal-cards">
                    <div className="legal-card">
                      <div className="card-icon">🔒</div>
                      <div className="card-content">
                        <h3>Controles de Seguridad</h3>
                        <p>Protección contra acceso no autorizado y amenazas cibernéticas.</p>
                      </div>
                    </div>
                    
                    <div className="legal-card">
                      <div className="card-icon">⚡</div>
                      <div className="card-content">
                        <h3>Disponibilidad</h3>
                        <p>Sistemas operativos y disponibles según acuerdos de nivel de servicio.</p>
                      </div>
                    </div>
                    
                    <div className="legal-card">
                      <div className="card-icon">🤐</div>
                      <div className="card-content">
                        <h3>Confidencialidad</h3>
                        <p>Protección robusta de información confidencial de clientes.</p>
                      </div>
                    </div>
                    
                    <div className="legal-card">
                      <div className="card-icon">🔍</div>
                      <div className="card-content">
                        <h3>Auditorías Anuales</h3>
                        <p>Verificación independiente por terceros certificados.</p>
                      </div>
                    </div>
                  </div>
                </article>

                <article id="iso" className="legal-section">
                  <h2>8. ISO 27001 (Information Security Management)</h2>
                  <p>Sistema de gestión de seguridad de la información:</p>
                  <ul>
                    <li><strong>Política de seguridad:</strong> Documentación y comunicación clara de políticas</li>
                    <li><strong>Análisis de riesgos:</strong> Evaluación regular de amenazas y vulnerabilidades</li>
                    <li><strong>Controles técnicos:</strong> Implementación de controles de seguridad apropiados</li>
                    <li><strong>Mejora continua:</strong> Revisión y actualización constante del sistema</li>
                  </ul>
                </article>

                <article id="aml" className="legal-section">
                  <h2>9. AML (Anti-Money Laundering) y KYC (Know Your Customer)</h2>
                  <p>Prevención de lavado de dinero y conocimiento del cliente:</p>
                  
                  <div className="rights-grid">
                    <div className="right-item">
                      <div className="right-icon">🆔</div>
                      <h4>Verificación de Identidad</h4>
                      <p>Procesos robustos de KYC con documentación verificada.</p>
                    </div>
                    
                    <div className="right-item">
                      <div className="right-icon">👁️</div>
                      <h4>Monitoreo de Transacciones</h4>
                      <p>Detección automática de patrones sospechosos de actividad.</p>
                    </div>
                    
                    <div className="right-item">
                      <div className="right-icon">📋</div>
                      <h4>Reportes Regulatorios</h4>
                      <p>Comunicación proactiva con autoridades cuando corresponda.</p>
                    </div>
                    
                    <div className="right-item">
                      <div className="right-icon">🎓</div>
                      <h4>Capacitación de Personal</h4>
                      <p>Entrenamiento especializado en identificación de actividades sospechosas.</p>
                    </div>
                  </div>
                </article>

                <article id="regionales" className="legal-section">
                  <h2>10. Regulaciones Específicas por País</h2>
                  <p>Cumplimiento con regulaciones locales:</p>
                  
                  <div className="legal-list">
                    <div className="list-item">
                      <span className="list-icon">🇨🇱</span>
                      <span>Chile - Ley 19.628: Protección de la vida privada y datos personales</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">🇲🇽</span>
                      <span>México - LFPDPPP: Ley Federal de Protección de Datos Personales</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">🇦🇷</span>
                      <span>Argentina - Ley 25.326: Protección de Datos Personales</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">🇨🇴</span>
                      <span>Colombia - Ley 1581: Protección de Datos Personales</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">🇵🇪</span>
                      <span>Perú - Ley 29733: Protección de Datos Personales</span>
                    </div>
                  </div>
                </article>

                <article id="programas" className="legal-section">
                  <h2>11. Programas de Compliance</h2>
                  <p>Iniciativas proactivas de cumplimiento:</p>
                  <ul>
                    <li><strong>Compliance Officer:</strong> Oficial de cumplimiento dedicado y certificado</li>
                    <li><strong>Training Program:</strong> Capacitación regular y actualizada de empleados</li>
                    <li><strong>Risk Assessment:</strong> Evaluación periódica de riesgos regulatorios</li>
                    <li><strong>Policy Updates:</strong> Actualización constante de políticas y procedimientos</li>
                    <li><strong>Vendor Management:</strong> Evaluación rigurosa de cumplimiento de proveedores</li>
                  </ul>
                </article>

                <article id="auditorias" className="legal-section">
                  <h2>12. Auditorías y Verificaciones</h2>
                  <p>Verificación independiente del cumplimiento:</p>
                  
                  <div className="security-features">
                    <div className="security-feature">
                      <div className="feature-icon">🔍</div>
                      <div className="feature-content">
                        <h4>Auditorías Internas</h4>
                        <p>Revisiones trimestrales de cumplimiento y controles internos.</p>
                      </div>
                    </div>
                    
                    <div className="security-feature">
                      <div className="feature-icon">🏢</div>
                      <div className="feature-content">
                        <h4>Auditorías Externas</h4>
                        <p>Verificación anual por firmas independientes y certificadas.</p>
                      </div>
                    </div>
                    
                    <div className="security-feature">
                      <div className="feature-icon">📜</div>
                      <div className="feature-content">
                        <h4>Certificaciones</h4>
                        <p>Mantenimiento activo de certificaciones vigentes y actualizadas.</p>
                      </div>
                    </div>
                    
                    <div className="security-feature">
                      <div className="feature-icon">🔧</div>
                      <div className="feature-content">
                        <h4>Remediación</h4>
                        <p>Planes de acción detallados para hallazgos de auditoría.</p>
                      </div>
                    </div>
                  </div>
                </article>

                <article id="reportes" className="legal-section">
                  <h2>13. Reportes Regulatorios</h2>
                  <p>Comunicación proactiva con autoridades:</p>
                  <ul>
                    <li><strong>Notificación de brechas:</strong> Reporte inmediato según regulaciones aplicables</li>
                    <li><strong>Reportes periódicos:</strong> Informes regulares a autoridades competentes</li>
                    <li><strong>Transparencia:</strong> Publicación de reportes de transparencia anuales</li>
                    <li><strong>Cooperación:</strong> Colaboración activa con investigaciones regulatorias</li>
                  </ul>
                </article>

                <article id="contacto-compliance" className="legal-section">
                  <h2>14. Contacto de Compliance</h2>
                  <p>Para consultas sobre cumplimiento regulatorio:</p>
                  
                  <div className="contact-info">
                    <div className="contact-item">
                      <span className="contact-icon">📧</span>
                      <div>
                        <strong>Email de Compliance:</strong>
                        <a href="mailto:compliance@pautapro.com">compliance@pautapro.com</a>
                      </div>
                    </div>
                    
                    <div className="contact-item">
                      <span className="contact-icon">📞</span>
                      <div>
                        <strong>Teléfono:</strong>
                        <span>+56 2 2345 6789 ext. 201</span>
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
                      <span className="contact-icon">👨‍💼</span>
                      <div>
                        <strong>DPO (Data Protection Officer):</strong>
                        <a href="mailto:dpo@pautapro.com">dpo@pautapro.com</a>
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
                  <Link to="/security" className="footer-link">Seguridad</Link>
                  <Link to="/compliance" className="footer-link active">Cumplimiento</Link>
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

export default Compliance;