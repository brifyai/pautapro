import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../assets/css/legal.css';
import Navbar from '../../components/Navbar';

const Features = () => {
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
                <span className="badge-icon">🚀</span>
                <span className="badge-text">Plataforma completa de gestión publicitaria</span>
              </div>
              
              <h1 className="legal-title">
                Características <span className="title-highlight">Destacadas</span>
              </h1>
              
              <p className="legal-subtitle">
                Descubre todas las funcionalidades que hacen de PautaPro la solución más completa para la gestión de campañas publicitarias.
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
                    <li><a href="#dashboard" onClick={(e) => handleNavClick(e, 'dashboard')}>Dashboard Inteligente</a></li>
                    <li><a href="#gestion-ordenes" onClick={(e) => handleNavClick(e, 'gestion-ordenes')}>Gestión de Órdenes</a></li>
                    <li><a href="#ia-avanzada" onClick={(e) => handleNavClick(e, 'ia-avanzada')}>IA Avanzada</a></li>
                    <li><a href="#clientes-agencias" onClick={(e) => handleNavClick(e, 'clientes-agencias')}>Clientes y Agencias</a></li>
                    <li><a href="#campanas" onClick={(e) => handleNavClick(e, 'campanas')}>Gestión de Campañas</a></li>
                    <li><a href="#reportes" onClick={(e) => handleNavClick(e, 'reportes')}>Reportes Avanzados</a></li>
                    <li><a href="#planificacion" onClick={(e) => handleNavClick(e, 'planificacion')}>Planificación Inteligente</a></li>
                    <li><a href="#proveedores" onClick={(e) => handleNavClick(e, 'proveedores')}>Gestión de Proveedores</a></li>
                    <li><a href="#automatizacion" onClick={(e) => handleNavClick(e, 'automatizacion')}>Automatización</a></li>
                    <li><a href="#integraciones" onClick={(e) => handleNavClick(e, 'integraciones')}>Integraciones</a></li>
                    <li><a href="#seguridad" onClick={(e) => handleNavClick(e, 'seguridad')}>Seguridad</a></li>
                    <li><a href="#soporte" onClick={(e) => handleNavClick(e, 'soporte')}>Soporte</a></li>
                  </ul>
                </nav>
              </div>

              <div className="legal-main-content">
                <article id="dashboard" className="legal-section">
                  <h2>1. Dashboard Inteligente</h2>
                  <p>Un panel de control completo que te da una visión integral de todas tus campañas publicitarias en tiempo real.</p>
                  
                  <div className="legal-cards">
                    <div className="legal-card">
                      <div className="card-icon">📊</div>
                      <div className="card-content">
                        <h3>KPIs en Tiempo Real</h3>
                        <p>Métricas actualizadas automáticamente con visualización intuitiva de rendimiento.</p>
                      </div>
                    </div>
                    
                    <div className="legal-card">
                      <div className="card-icon">🎯</div>
                      <div className="card-content">
                        <h3>Objetivos Personalizables</h3>
                        <p>Establece metas específicas por cliente, campaña o período y realiza seguimiento continuo.</p>
                      </div>
                    </div>
                    
                    <div className="legal-card">
                      <div className="card-icon">⚡</div>
                      <div className="card-content">
                        <h3>Alertas Inteligentes</h3>
                        <p>Notificaciones automáticas cuando los KPIs se desvíen de los objetivos establecidos.</p>
                      </div>
                    </div>
                    
                    <div className="legal-card">
                      <div className="card-icon">📱</div>
                      <div className="card-content">
                        <h3>Responsive Design</h3>
                        <p>Accede desde cualquier dispositivo con la misma funcionalidad completa.</p>
                      </div>
                    </div>
                  </div>
                </article>

                <article id="gestion-ordenes" className="legal-section">
                  <h2>2. Gestión de Órdenes Avanzada</h2>
                  <p>Sistema completo para crear, gestionar y hacer seguimiento de todas las órdenes publicitarias.</p>
                  
                  <div className="rights-grid">
                    <div className="right-item">
                      <div className="right-icon">✍️</div>
                      <h4>Creación Visual</h4>
                      <p>Interface intuitiva para crear órdenes con formularios dinámicos y validaciones automáticas.</p>
                    </div>
                    
                    <div className="right-item">
                      <div className="right-icon">🔄</div>
                      <h4>Workflow Automatizado</h4>
                      <p>Estados y transiciones automáticas que guían el proceso desde creación hasta entrega.</p>
                    </div>
                    
                    <div className="right-item">
                      <div className="right-icon">📝</div>
                      <h4>Historial Completo</h4>
                      <p>Registro detallado de cambios, comentarios y aprobaciones para cada orden.</p>
                    </div>
                    
                    <div className="right-item">
                      <div className="right-icon">🔍</div>
                      <h4>Búsqueda Avanzada</h4>
                      <p>Filtros múltiples y búsqueda por texto para encontrar cualquier orden rápidamente.</p>
                    </div>
                  </div>
                </article>

                <article id="ia-avanzada" className="legal-section">
                  <h2>3. Inteligencia Artificial Avanzada</h2>
                  <p>Nuestro asistente de IA integrado que optimiza automáticamente tus campañas y decisiones.</p>
                  
                  <div className="legal-list">
                    <div className="list-item">
                      <span className="list-icon">🤖</span>
                      <span>Asistente conversacional para consultas y optimización de campañas</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">📈</span>
                      <span>Análisis predictivo para forecasting y recomendaciones</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">⚡</span>
                      <span>Optimización automática de presupuestos y audiencias</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">🎯</span>
                      <span>Detección de oportunidades y alertas proactivas</span>
                    </div>
                  </div>
                </article>

                <article id="clientes-agencias" className="legal-section">
                  <h2>4. Gestión de Clientes y Agencias</h2>
                  <p>Herramientas completas para administrar relaciones con clientes y agencias publicitarias.</p>
                  
                  <div className="security-features">
                    <div className="security-feature">
                      <div className="feature-icon">👥</div>
                      <div className="feature-content">
                        <h4>Perfiles Completos</h4>
                        <p>Información detallada de contacto, facturación, preferencias y historial de campañas.</p>
                      </div>
                    </div>
                    
                    <div className="security-feature">
                      <div className="feature-icon">📊</div>
                      <div className="feature-content">
                        <h4>Métricas por Cliente</h4>
                        <p>Dashboards específicos con el rendimiento histórico y actual de cada cliente.</p>
                      </div>
                    </div>
                    
                    <div className="security-feature">
                      <div className="feature-icon">🏢</div>
                      <div className="feature-content">
                        <h4>Gestión de Agencias</h4>
                        <p>Organización jerárquica con múltiples agencias y sus respectivos equipos.</p>
                      </div>
                    </div>
                  </div>
                </article>

                <article id="campanas" className="legal-section">
                  <h2>5. Gestión de Campañas Completa</h2>
                  <p>Herramientas avanzadas para planificar, ejecutar y optimizar campañas publicitarias.</p>
                  
                  <div className="legal-accordion">
                    <div className="accordion-item">
                      <div className="accordion-header" onClick={() => toggleAccordion(0)}>
                        <h4>Planificación Estratégica</h4>
                        <span className={`accordion-icon ${activeAccordion === 0 ? 'active' : ''}`}>
                          {activeAccordion === 0 ? '−' : '+'}
                        </span>
                      </div>
                      <div className={`accordion-content ${activeAccordion === 0 ? 'active' : ''}`}>
                        <p>Herramientas de planificación que incluyen análisis de audiencia, competencia y selección de medios óptima.</p>
                      </div>
                    </div>
                    
                    <div className="accordion-item">
                      <div className="accordion-header" onClick={() => toggleAccordion(1)}>
                        <h4>Ejecución Controlada</h4>
                        <span className={`accordion-icon ${activeAccordion === 1 ? 'active' : ''}`}>
                          {activeAccordion === 1 ? '−' : '+'}
                        </span>
                      </div>
                      <div className={`accordion-content ${activeAccordion === 1 ? 'active' : ''}`}>
                        <p>Seguimiento en tiempo real con control de presupuestos, horarios y entregables de cada campaña.</p>
                      </div>
                    </div>
                    
                    <div className="accordion-item">
                      <div className="accordion-header" onClick={() => toggleAccordion(2)}>
                        <h4>Optimización Continua</h4>
                        <span className={`accordion-icon ${activeAccordion === 2 ? 'active' : ''}`}>
                          {activeAccordion === 2 ? '−' : '+'}
                        </span>
                      </div>
                      <div className={`accordion-content ${activeAccordion === 2 ? 'active' : ''}`}>
                        <p>Algoritmos de optimización que ajustan automáticamente parámetros basados en resultados históricos.</p>
                      </div>
                    </div>
                  </div>
                </article>

                <article id="reportes" className="legal-section">
                  <h2>6. Reportes Avanzados</h2>
                  <p>Sistema de reportes flexible y personalizable para obtener insights valiosos de tus campañas.</p>
                  
                  <div className="legal-list">
                    <div className="list-item">
                      <span className="list-icon">📊</span>
                      <span>Reportes automáticos programados por email con métricas clave</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">📈</span>
                      <span>Análisis comparativo de rendimiento entre períodos y campañas</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">📉</span>
                      <span>Identificación automática de tendencias y patrones de comportamiento</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">🎯</span>
                      <span>Reportes personalizados con métricas específicas por cliente o agencia</span>
                    </div>
                  </div>
                </article>

                <article id="planificacion" className="legal-section">
                  <h2>7. Planificación Inteligente</h2>
                  <p>Herramientas avanzadas para la planificación estratégica de medios y campañas.</p>
                  
                  <div className="rights-grid">
                    <div className="right-item">
                      <div className="right-icon">🗓️</div>
                      <h4>Calendario Integrado</h4>
                      <p>Vista de calendario con todas las campañas, entregas y hitos importantes.</p>
                    </div>
                    
                    <div className="right-item">
                      <div className="right-icon">🎯</div>
                      <h4>Planificación por Objetivos</h4>
                      <p>Herramientas para planificar campañas basadas en objetivos específicos de negocio.</p>
                    </div>
                    
                    <div className="right-item">
                      <div className="right-icon">📊</div>
                      <h4>Análisis de Competencia</h4>
                      <p>Información sobre el landscape competitivo y oportunidades de mercado.</p>
                    </div>
                  </div>
                </article>

                <article id="proveedores" className="legal-section">
                  <h2>8. Gestión de Proveedores</h2>
                  <p>Base de datos completa de proveedores con evaluaciones y gestión de relaciones.</p>
                  
                  <div className="security-features">
                    <div className="security-feature">
                      <div className="feature-icon">🏢</div>
                      <div className="feature-content">
                        <h4>Catálogo Completo</h4>
                        <p>Base de datos estructurada con información detallada de cada proveedor.</p>
                      </div>
                    </div>
                    
                    <div className="security-feature">
                      <div className="feature-icon">⭐</div>
                      <div className="feature-content">
                        <h4>Sistema de Evaluación</h4>
                        <p>Calificación automática basada en calidad, tiempos de entrega y satisfacción.</p>
                      </div>
                    </div>
                    
                    <div className="security-feature">
                      <div className="feature-icon">🤝</div>
                      <div className="feature-content">
                        <h4>Gestión de Contratos</h4>
                        <p>Seguimiento de términos, renovaciones y condiciones de cada proveedor.</p>
                      </div>
                    </div>
                  </div>
                </article>

                <article id="automatizacion" className="legal-section">
                  <h2>9. Automatización Inteligente</h2>
                  <p>Procesos automatizados que reducen trabajo manual y mejoran la eficiencia operativa.</p>
                  
                  <div className="legal-cards">
                    <div className="legal-card">
                      <div className="card-icon">⚡</div>
                      <div className="card-content">
                        <h3>Workflows Automáticos</h3>
                        <p>Creación de procesos automatizados para aprobaciones, notificaciones y reportes.</p>
                      </div>
                    </div>
                    
                    <div className="legal-card">
                      <div className="card-icon">🔄</div>
                      <div className="card-content">
                        <h3>Sincronización de Datos</h3>
                        <p>Actualización automática desde y hacia sistemas externos de medios y analytics.</p>
                      </div>
                    </div>
                    
                    <div className="legal-card">
                      <div className="card-icon">🤖</div>
                      <div className="card-content">
                        <h3>IA Predictiva</h3>
                        <p>Algoritmos que predicen necesidades futuras y sugieren optimizaciones.</p>
                      </div>
                    </div>
                  </div>
                </article>

                <article id="integraciones" className="legal-section">
                  <h2>10. Integraciones Nativas</h2>
                  <p>Conectores predefinidos con las principales plataformas de medios y analytics.</p>
                  
                  <div className="legal-list">
                    <div className="list-item">
                      <span className="list-icon">📊</span>
                      <span>Google Analytics, Facebook Ads, Instagram, LinkedIn Ads</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">📱</span>
                      <span>TikTok Ads, Twitter Ads, YouTube, Programmatic Advertising</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">📈</span>
                      <span>SEMrush, Ahrefs, Brandwatch, Comscore</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">🔗</span>
                      <span>API RESTful para integraciones personalizadas</span>
                    </div>
                  </div>
                </article>

                <article id="seguridad" className="legal-section">
                  <h2>11. Seguridad y Cumplimiento</h2>
                  <p>Protección de datos y cumplimiento con las más altas normativas de seguridad.</p>
                  
                  <div className="rights-grid">
                    <div className="right-item">
                      <div className="right-icon">🔒</div>
                      <h4>Encriptación End-to-End</h4>
                      <p>Protección de datos con encriptación AES-256 en tránsito y en reposo.</p>
                    </div>
                    
                    <div className="right-item">
                      <div className="right-icon">🛡️</div>
                      <h4>Controles de Acceso</h4>
                      <p>Sistema granular de permisos y autenticación de múltiples factores.</p>
                    </div>
                    
                    <div className="right-item">
                      <div className="right-item">📋</div>
                      <h4>Auditoría Completa</h4>
                      <p>Registro detallado de todas las actividades para cumplimiento regulatorio.</p>
                    </div>
                  </div>
                </article>

                <article id="soporte" className="legal-section">
                  <h2>12. Soporte Dedicado</h2>
                  <p>Equipo especializado disponible para ayudarte a maximizar el valor de la plataforma.</p>
                  
                  <div className="legal-accordion">
                    <div className="accordion-item">
                      <div className="accordion-header" onClick={() => toggleAccordion(3)}>
                        <h4>Soporte 24/7</h4>
                        <span className={`accordion-icon ${activeAccordion === 3 ? 'active' : ''}`}>
                          {activeAccordion === 3 ? '−' : '+'}
                        </span>
                      </div>
                      <div className={`accordion-content ${activeAccordion === 3 ? 'active' : ''}`}>
                        <p>Atención disponible las 24 horas, 7 días a la semana para emergencias críticas.</p>
                      </div>
                    </div>
                    
                    <div className="accordion-item">
                      <div className="accordion-header" onClick={() => toggleAccordion(4)}>
                        <h4>Capacitación Personalizada</h4>
                        <span className={`accordion-icon ${activeAccordion === 4 ? 'active' : ''}`}>
                          {activeAccordion === 4 ? '−' : '+'}
                        </span>
                      </div>
                      <div className={`accordion-content ${activeAccordion === 4 ? 'active' : ''}`}>
                        <p>Sesiones de entrenamiento adaptadas a las necesidades específicas de cada equipo.</p>
                      </div>
                    </div>
                    
                    <div className="accordion-item">
                      <div className="accordion-header" onClick={() => toggleAccordion(5)}>
                        <h4>Consultoría Estratégica</h4>
                        <span className={`accordion-icon ${activeAccordion === 5 ? 'active' : ''}`}>
                          {activeAccordion === 5 ? '−' : '+'}
                        </span>
                      </div>
                      <div className={`accordion-content ${activeAccordion === 5 ? 'active' : ''}`}>
                        <p>Expertos que te ayudan a optimizar tus procesos y maximizar el ROI.</p>
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
                  <Link to="/features" className="footer-link active">Características</Link>
                  <Link to="/pricing" className="footer-link">Precios</Link>
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

export default Features;