import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../assets/css/legal.css';
import Navbar from '../../components/Navbar';

const ServiceTerms = () => {
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
                <span className="badge-icon">📋</span>
                <span className="badge-text">Acuerdo legal del servicio</span>
              </div>
              
              <h1 className="legal-title">
                Términos y <span className="title-highlight">Condiciones</span> de Servicio
              </h1>
              
              <p className="legal-subtitle">
                Estos términos y condiciones rigen el uso de PautaPro como plataforma de gestión de órdenes publicitarias y servicios de marketing digital.
              </p>

              <div className="legal-meta">
                <span className="meta-item">
                  <strong>Última actualización:</strong> 12 de noviembre de 2024
                </span>
                <span className="meta-item">
                  <strong>Versión:</strong> 2.0
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
                    <li><a href="#servicio" onClick={(e) => handleNavClick(e, 'servicio')}>Descripción del Servicio</a></li>
                    <li><a href="#registro" onClick={(e) => handleNavClick(e, 'registro')}>Registro y Cuenta</a></li>
                    <li><a href="#uso" onClick={(e) => handleNavClick(e, 'uso')}>Uso Aceptable</a></li>
                    <li><a href="#contenido" onClick={(e) => handleNavClick(e, 'contenido')}>Contenido del Usuario</a></li>
                    <li><a href="#pagos" onClick={(e) => handleNavClick(e, 'pagos')}>Pagos y Facturación</a></li>
                    <li><a href="#propiedad" onClick={(e) => handleNavClick(e, 'propiedad')}>Propiedad Intelectual</a></li>
                    <li><a href="#privacidad" onClick={(e) => handleNavClick(e, 'privacidad')}>Privacidad y Datos</a></li>
                    <li><a href="#disponibilidad" onClick={(e) => handleNavClick(e, 'disponibilidad')}>Disponibilidad del Servicio</a></li>
                    <li><a href="#limitacion" onClick={(e) => handleNavClick(e, 'limitacion')}>Limitación de Responsabilidad</a></li>
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
                  <p>Al acceder y utilizar PautaPro, usted acepta estar sujeto a estos términos y condiciones. Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestro servicio.</p>
                  
                  <div className="legal-cards">
                    <div className="legal-card">
                      <div className="card-icon">✅</div>
                      <div className="card-content">
                        <h3>Acuerdo Legal</h3>
                        <p>Estos términos constituyen un acuerdo legalmente vinculante entre usted y PautaPro.</p>
                      </div>
                    </div>
                    
                    <div className="legal-card">
                      <div className="card-icon">📖</div>
                      <div className="card-content">
                        <h3>Lectura Obligatoria</h3>
                        <p>Es su responsabilidad revisar estos términos antes de utilizar la plataforma.</p>
                      </div>
                    </div>
                  </div>
                </article>

                <article id="servicio" className="legal-section">
                  <h2>2. Descripción del Servicio</h2>
                  <p>PautaPro es una plataforma digital que proporciona:</p>
                  
                  <div className="rights-grid">
                    <div className="right-item">
                      <div className="right-icon">📋</div>
                      <h4>Gestión de Órdenes</h4>
                      <p>Creación, seguimiento y gestión de órdenes publicitarias y campañas de marketing.</p>
                    </div>
                    
                    <div className="right-item">
                      <div className="right-icon">📊</div>
                      <h4>Reportes y Analytics</h4>
                      <p>Herramientas de análisis y seguimiento de rendimiento de campañas publicitarias.</p>
                    </div>
                    
                    <div className="right-item">
                      <div className="right-icon">👥</div>
                      <h4>Gestión de Clientes</h4>
                      <p>Herramientas para administrar información de clientes y agencias publicitarias.</p>
                    </div>
                    
                    <div className="right-item">
                      <div className="right-icon">🤖</div>
                      <h4>IA Integrada</h4>
                      <p>Asistente de inteligencia artificial para optimización y sugerencias de campañas.</p>
                    </div>
                  </div>
                </article>

                <article id="registro" className="legal-section">
                  <h2>3. Registro y Cuenta</h2>
                  <p>Para utilizar ciertas funcionalidades de PautaPro, debe crear una cuenta:</p>
                  
                  <div className="legal-list">
                    <div className="list-item">
                      <span className="list-icon">✍️</span>
                      <span>Información precisa y completa durante el registro</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">🔒</span>
                      <span>Mantenimiento de la confidencialidad de sus credenciales</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">⚠️</span>
                      <span>Responsabilidad por todas las actividades bajo su cuenta</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">🚫</span>
                      <span>Prohibición de registro múltiple o uso de cuentas falsas</span>
                    </div>
                  </div>
                </article>

                <article id="uso" className="legal-section">
                  <h2>4. Uso Aceptable</h2>
                  <p>Usted se compromete a utilizar PautaPro de manera合法 y apropiada:</p>
                  
                  <div className="legal-accordion">
                    <div className="accordion-item">
                      <div className="accordion-header" onClick={() => toggleAccordion(0)}>
                        <h4>Contenido Permitido</h4>
                        <span className={`accordion-icon ${activeAccordion === 0 ? 'active' : ''}`}>
                          {activeAccordion === 0 ? '−' : '+'}
                        </span>
                      </div>
                      <div className={`accordion-content ${activeAccordion === 0 ? 'active' : ''}`}>
                        <p>Solo puede cargar contenido que posea, para el cual tenga autorización, o que sea de dominio público.</p>
                      </div>
                    </div>
                    
                    <div className="accordion-item">
                      <div className="accordion-header" onClick={() => toggleAccordion(1)}>
                        <h4>Actividades Prohibidas</h4>
                        <span className={`accordion-icon ${activeAccordion === 1 ? 'active' : ''}`}>
                          {activeAccordion === 1 ? '−' : '+'}
                        </span>
                      </div>
                      <div className={`accordion-content ${activeAccordion === 1 ? 'active' : ''}`}>
                        <p>Queda prohibido el uso del servicio para actividades ilegales, fraudulentas o no autorizadas.</p>
                      </div>
                    </div>
                    
                    <div className="accordion-item">
                      <div className="accordion-header" onClick={() => toggleAccordion(2)}>
                        <h4>Seguridad del Sistema</h4>
                        <span className={`accordion-icon ${activeAccordion === 2 ? 'active' : ''}`}>
                          {activeAccordion === 2 ? '−' : '+'}
                        </span>
                      </div>
                      <div className={`accordion-content ${activeAccordion === 2 ? 'active' : ''}`}>
                        <p>No debe intentar acceder a sistemas, datos o áreas restringidas de la plataforma.</p>
                      </div>
                    </div>
                  </div>
                </article>

                <article id="contenido" className="legal-section">
                  <h2>5. Contenido del Usuario</h2>
                  <p>Usted retiene la propiedad del contenido que sube a PautaPro:</p>
                  
                  <div className="security-features">
                    <div className="security-feature">
                      <div className="feature-icon">👤</div>
                      <div className="feature-content">
                        <h4>Propiedad del Contenido</h4>
                        <p>Usted mantiene todos los derechos sobre su contenido y datos.</p>
                      </div>
                    </div>
                    
                    <div className="security-feature">
                      <div className="feature-icon">📤</div>
                      <div className="feature-content">
                        <h4>Licencia de Uso</h4>
                        <p>Al subir contenido, otorga a PautaPro licencia limitada para operar el servicio.</p>
                      </div>
                    </div>
                    
                    <div className="security-feature">
                      <div className="feature-icon">🗑️</div>
                      <div className="feature-content">
                        <h4>Eliminación de Contenido</h4>
                        <p>Puede eliminar su contenido en cualquier momento a través de la plataforma.</p>
                      </div>
                    </div>
                  </div>
                </article>

                <article id="pagos" className="legal-section">
                  <h2>6. Pagos y Facturación</h2>
                  <p>Los servicios de PautaPro pueden estar sujetos a tarifas y facturación:</p>
                  
                  <div className="legal-list">
                    <div className="list-item">
                      <span className="list-icon">💳</span>
                      <span>Métodos de pago aceptados incluyen tarjetas de crédito y transferencias bancarias</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">📅</span>
                      <span>La facturación se realizará de acuerdo con el plan de suscripción seleccionado</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">💰</span>
                      <span>Los reembolsos están sujetos a la política de reembolsos de PautaPro</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">🔄</span>
                      <span>Las tarifas pueden cambiar con notificación previa de 30 días</span>
                    </div>
                  </div>
                </article>

                <article id="propiedad" className="legal-section">
                  <h2>7. Propiedad Intelectual</h2>
                  <p>Los derechos de propiedad intelectual de PautaPro están protegidos:</p>
                  
                  <div className="legal-cards">
                    <div className="legal-card">
                      <div className="card-icon">🛡️</div>
                      <div className="card-content">
                        <h3>Marca Registrada</h3>
                        <p>Todos los logos, diseños y marcas de PautaPro son propiedad exclusiva.</p>
                      </div>
                    </div>
                    
                    <div className="legal-card">
                      <div className="card-icon">💻</div>
                      <div className="card-content">
                        <h3>Software Propietario</h3>
                        <p>La plataforma y sus componentes son software propietario de PautaPro.</p>
                      </div>
                    </div>
                    
                    <div className="legal-card">
                      <div className="card-icon">📚</div>
                      <div className="card-content">
                        <h3>Documentación</h3>
                        <p>La documentación técnica y manuales son propiedad intelectual protegida.</p>
                      </div>
                    </div>
                  </div>
                </article>

                <article id="privacidad" className="legal-section">
                  <h2>8. Privacidad y Protección de Datos</h2>
                  <p>Su privacidad es fundamental para nosotros. Consulte nuestra <Link to="/privacy">Política de Privacidad</Link> para detalles completos sobre cómo manejamos sus datos.</p>
                  
                  <ul>
                    <li><strong>Recolección de datos:</strong> Solo recopilamos información necesaria para proporcionar el servicio</li>
                    <li><strong>Uso de datos:</strong> Sus datos se utilizan únicamente para operar y mejorar PautaPro</li>
                    <li><strong>Protección:</strong> Implementamos medidas de seguridad de nivel empresarial</li>
                    <li><strong>Derechos del usuario:</strong> Puede solicitar acceso, corrección o eliminación de sus datos</li>
                  </ul>
                </article>

                <article id="disponibilidad" className="legal-section">
                  <h2>9. Disponibilidad del Servicio</h2>
                  <p>PautaPro se compromete a mantener alta disponibilidad del servicio:</p>
                  
                  <div className="rights-grid">
                    <div className="right-item">
                      <div className="right-icon">⚡</div>
                      <h4>Tiempo de Actividad</h4>
                      <p>Nuestro objetivo es mantener el 99.9% de tiempo de actividad mensual.</p>
                    </div>
                    
                    <div className="right-item">
                      <div className="right-icon">🔧</div>
                      <h4>Mantenimiento</h4>
                      <p>El mantenimiento programado se notifica con al menos 24 horas de anticipación.</p>
                    </div>
                    
                    <div className="right-item">
                      <div className="right-icon">🚨</div>
                      <h4>Interrupciones</h4>
                      <p>No somos responsables por interrupciones debidas a factores fuera de nuestro control.</p>
                    </div>
                  </div>
                </article>

                <article id="limitacion" className="legal-section">
                  <h2>10. Limitación de Responsabilidad</h2>
                  <p>En la máxima medida permitida por la ley:</p>
                  
                  <div className="legal-accordion">
                    <div className="accordion-item">
                      <div className="accordion-header" onClick={() => toggleAccordion(3)}>
                        <h4>Exclusión de Garantías</h4>
                        <span className={`accordion-icon ${activeAccordion === 3 ? 'active' : ''}`}>
                          {activeAccordion === 3 ? '−' : '+'}
                        </span>
                      </div>
                      <div className={`accordion-content ${activeAccordion === 3 ? 'active' : ''}`}>
                        <p>PautaPro proporciona el servicio "tal como está" sin garantías de ningún tipo.</p>
                      </div>
                    </div>
                    
                    <div className="accordion-item">
                      <div className="accordion-header" onClick={() => toggleAccordion(4)}>
                        <h4>Daños Indirectos</h4>
                        <span className={`accordion-icon ${activeAccordion === 4 ? 'active' : ''}`}>
                          {activeAccordion === 4 ? '−' : '+'}
                        </span>
                      </div>
                      <div className={`accordion-content ${activeAccordion === 4 ? 'active' : ''}`}>
                        <p>No somos responsables por daños indirectos, incidentales o consecuenciales.</p>
                      </div>
                    </div>
                    
                    <div className="accordion-item">
                      <div className="accordion-header" onClick={() => toggleAccordion(5)}>
                        <h4>Limitación de Indemnización</h4>
                        <span className={`accordion-icon ${activeAccordion === 5 ? 'active' : ''}`}>
                          {activeAccordion === 5 ? '−' : '+'}
                        </span>
                      </div>
                      <div className={`accordion-content ${activeAccordion === 5 ? 'active' : ''}`}>
                        <p>Nuestra responsabilidad total no excederá el monto pagado por el servicio en los 12 meses anteriores.</p>
                      </div>
                    </div>
                  </div>
                </article>

                <article id="terminacion" className="legal-section">
                  <h2>11. Terminación</h2>
                  <p>El servicio puede ser terminado por cualquiera de las partes:</p>
                  
                  <div className="security-features">
                    <div className="security-feature">
                      <div className="feature-icon">🛑</div>
                      <div className="feature-content">
                        <h4>Terminación por el Usuario</h4>
                        <p>Puede cancelar su cuenta en cualquier momento desde la configuración.</p>
                      </div>
                    </div>
                    
                    <div className="security-feature">
                      <div className="feature-icon">⚠️</div>
                      <div className="feature-content">
                        <h4>Terminación por Violación</h4>
                        <p>Podemos suspender o terminar cuentas por violación de estos términos.</p>
                      </div>
                    </div>
                    
                    <div className="security-feature">
                      <div className="feature-icon">📥</div>
                      <div className="feature-content">
                        <h4>Retención de Datos</h4>
                        <p>Sus datos se conservarán por 30 días para facilitar la reactivación.</p>
                      </div>
                    </div>
                  </div>
                </article>

                <article id="modificaciones" className="legal-section">
                  <h2>12. Modificaciones a los Términos</h2>
                  <p>Nos reservamos el derecho de modificar estos términos en cualquier momento:</p>
                  <ul>
                    <li><strong>Notificación:</strong> Los cambios se notificarán por email y dentro de la plataforma</li>
                    <li><strong>Período de gracia:</strong> Tiene 30 días para revisar y objetar cambios significativos</li>
                    <li><strong>Aceptación continua:</strong> El uso continuado constituye aceptación de términos modificados</li>
                    <li><strong>Términos actuales:</strong> Siempre se aplicarán los términos más recientes</li>
                  </ul>
                </article>

                <article id="ley" className="legal-section">
                  <h2>13. Ley Aplicable y Jurisdicción</h2>
                  <p>Estos términos se rigen por las leyes de Chile:</p>
                  
                  <div className="legal-list">
                    <div className="list-item">
                      <span className="list-icon">🇨🇱</span>
                      <span>Jurisdicción: República de Chile</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">⚖️</span>
                      <span>Tribunales competentes: Santiago, Chile</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">📜</span>
                      <span>Leyes aplicables: Legislación chilena sobre comercio electrónico y protección de consumidores</span>
                    </div>
                  </div>
                </article>

                <article id="contacto-terms" className="legal-section">
                  <h2>14. Contacto Legal</h2>
                  <p>Para consultas legales o notificaciones relacionadas con estos términos:</p>
                  
                  <div className="contact-info">
                    <div className="contact-item">
                      <span className="contact-icon">📧</span>
                      <div>
                        <strong>Email Legal:</strong>
                        <a href="mailto:legal@pautapro.com">legal@pautapro.com</a>
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
                      <span className="contact-icon">📍</span>
                      <div>
                        <strong>Dirección:</strong>
                        <span>Av. Providencia 1234, Oficina 1001, Santiago, Chile</span>
                      </div>
                    </div>
                    
                    <div className="contact-item">
                      <span className="contact-icon">📋</span>
                      <div>
                        <strong>Atención a:</strong>
                        <span>Departamento Legal, PautaPro S.A.</span>
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
                  <Link to="/condiciones-servicio" className="footer-link active">Condiciones de Servicio</Link>
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

export default ServiceTerms;