import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../assets/css/legal.css';
import Navbar from '../../components/Navbar';

const Integrations = () => {
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

  const integrations = {
    advertising: [
      { name: 'Google Ads', icon: '🔍', description: 'Gestión completa de campañas de búsqueda y display' },
      { name: 'Facebook Ads', icon: '📘', description: 'Automatización de campañas en Facebook e Instagram' },
      { name: 'LinkedIn Ads', icon: '💼', description: 'Campañas B2B y profesionales dirigidas' },
      { name: 'TikTok Ads', icon: '🎵', description: 'Gestión de campañas en la plataforma de video cortos' },
      { name: 'Twitter Ads', icon: '🐦', description: 'Promociones y alcance en redes sociales' },
      { name: 'YouTube Ads', icon: '📹', description: 'Gestión de video marketing y anuncios pre-roll' }
    ],
    analytics: [
      { name: 'Google Analytics', icon: '📊', description: 'Análisis de tráfico y conversiones detallado' },
      { name: 'Google Tag Manager', icon: '🏷️', description: 'Gestión centralizada de etiquetas de tracking' },
      { name: 'Facebook Pixel', icon: '📍', description: 'Seguimiento de conversiones y audiencias' },
      { name: 'Hotjar', icon: '🔥', description: 'Mapas de calor y grabaciones de usuarios' },
      { name: 'Mixpanel', icon: '📈', description: 'Análisis de eventos y cohortes de usuarios' }
    ],
    crm: [
      { name: 'Salesforce', icon: '☁️', description: 'CRM empresarial con sincronización bidireccional' },
      { name: 'HubSpot', icon: '🧲', description: 'Gestión de leads y automatización de marketing' },
      { name: 'Pipedrive', icon: '💼', description: 'Pipeline de ventas y seguimiento de oportunidades' },
      { name: 'Zoho CRM', icon: '📝', description: 'CRM completo con gestión de contactos' }
    ],
    automation: [
      { name: 'Zapier', icon: '⚡', description: 'Automatización de workflows entre aplicaciones' },
      { name: 'Make (Integromat)', icon: '🔧', description: 'Automatización avanzada de procesos' },
      { name: 'IFTTT', icon: '🔄', description: 'Automatización simple basada en condiciones' },
      { name: 'Microsoft Power Automate', icon: '🚀', description: 'Flujos de trabajo empresariales automatizados' }
    ]
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
                <span className="badge-icon">🔗</span>
                <span className="badge-text">Conectores nativos con las mejores plataformas</span>
              </div>
              
              <h1 className="legal-title">
                Integraciones <span className="title-highlight">Nativas</span>
              </h1>
              
              <p className="legal-subtitle">
                Conecta PautaPro con todas tus herramientas favoritas. Más de 50 integraciones nativas y API completa para conexiones personalizadas.
              </p>

              <div className="legal-meta">
                <span className="meta-item">
                  <strong>Última actualización:</strong> 12 de noviembre de 2024
                </span>
                <span className="meta-item">
                  <strong>Integraciones:</strong> 50+ Conectores Activos
                </span>
              </div>
            </div>
          </section>

          {/* Integration Categories */}
          <section className="legal-content">
            <div className="legal-grid">
              <div className="legal-sidebar">
                <nav className="legal-sidebar-nav">
                  <h3>Contenido</h3>
                  <ul>
                    <li><a href="#plataformas-publicitarias" onClick={(e) => handleNavClick(e, 'plataformas-publicitarias')}>Plataformas Publicitarias</a></li>
                    <li><a href="#analiticas" onClick={(e) => handleNavClick(e, 'analiticas')}>Analytics y Medición</a></li>
                    <li><a href="#crm-ventas" onClick={(e) => handleNavClick(e, 'crm-ventas')}>CRM y Ventas</a></li>
                    <li><a href="#automatizacion" onClick={(e) => handleNavClick(e, 'automatizacion')}>Automatización</a></li>
                    <li><a href="#configuracion" onClick={(e) => handleNavClick(e, 'configuracion')}>Cómo Configurar</a></li>
                    <li><a href="#api-personalizada" onClick={(e) => handleNavClick(e, 'api-personalizada')}>API Personalizada</a></li>
                    <li><a href="#soporte-integraciones" onClick={(e) => handleNavClick(e, 'soporte-integraciones')}>Soporte Técnico</a></li>
                  </ul>
                </nav>
              </div>

              <div className="legal-main-content">
                <article id="plataformas-publicitarias" className="legal-section">
                  <h2>1. Plataformas Publicitarias</h2>
                  <p>Conecta tus campañas en las principales plataformas publicitarias para una gestión centralizada y automatizada.</p>
                  
                  <div className="integrations-grid">
                    {integrations.advertising.map((integration, index) => (
                      <div key={index} className="integration-card">
                        <div className="integration-icon">{integration.icon}</div>
                        <h4>{integration.name}</h4>
                        <p>{integration.description}</p>
                        <div className="integration-status">
                          <span className="status-badge active">Activo</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>

                <article id="analiticas" className="legal-section">
                  <h2>2. Analytics y Medición</h2>
                  <p>Sincroniza tus datos de analytics para obtener una visión completa del rendimiento de tus campañas.</p>
                  
                  <div className="integrations-grid">
                    {integrations.analytics.map((integration, index) => (
                      <div key={index} className="integration-card">
                        <div className="integration-icon">{integration.icon}</div>
                        <h4>{integration.name}</h4>
                        <p>{integration.description}</p>
                        <div className="integration-status">
                          <span className="status-badge active">Activo</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>

                <article id="crm-ventas" className="legal-section">
                  <h2>3. CRM y Gestión de Ventas</h2>
                  <p>Integra con tus herramientas de CRM para rastrear el customer journey completo desde la campaña hasta la conversión.</p>
                  
                  <div className="integrations-grid">
                    {integrations.crm.map((integration, index) => (
                      <div key={index} className="integration-card">
                        <div className="integration-icon">{integration.icon}</div>
                        <h4>{integration.name}</h4>
                        <p>{integration.description}</p>
                        <div className="integration-status">
                          <span className="status-badge active">Activo</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>

                <article id="automatizacion" className="legal-section">
                  <h2>4. Automatización y Workflows</h2>
                  <p>Conecta PautaPro con herramientas de automatización para crear procesos eficientes y libres de errores.</p>
                  
                  <div className="integrations-grid">
                    {integrations.automation.map((integration, index) => (
                      <div key={index} className="integration-card">
                        <div className="integration-icon">{integration.icon}</div>
                        <h4>{integration.name}</h4>
                        <p>{integration.description}</p>
                        <div className="integration-status">
                          <span className="status-badge active">Activo</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>

                <article id="configuracion" className="legal-section">
                  <h2>5. Cómo Configurar las Integraciones</h2>
                  <p>Proceso paso a paso para conectar tus herramientas favoritas con PautaPro.</p>
                  
                  <div className="legal-cards">
                    <div className="legal-card">
                      <div className="card-icon">1️⃣</div>
                      <div className="card-content">
                        <h3>Seleccionar Integración</h3>
                        <p>Ve a la sección de Integraciones en tu dashboard y selecciona la plataforma que deseas conectar.</p>
                      </div>
                    </div>
                    
                    <div className="legal-card">
                      <div className="card-icon">2️⃣</div>
                      <div className="card-content">
                        <h3>Autorizar Conexión</h3>
                        <p>Autoriza el acceso a tu cuenta de la plataforma externa de forma segura mediante OAuth 2.0.</p>
                      </div>
                    </div>
                    
                    <div className="legal-card">
                      <div className="card-icon">3️⃣</div>
                      <div className="card-content">
                        <h3>Configurar Sincronización</h3>
                        <p>Define qué datos sincronizar y con qué frecuencia. Personaliza los campos según tus necesidades.</p>
                      </div>
                    </div>
                    
                    <div className="legal-card">
                      <div className="card-icon">4️⃣</div>
                      <div className="card-content">
                        <h3>Verificar Funcionamiento</h3>
                        <p>Prueba la integración y verifica que los datos se estén sincronizando correctamente.</p>
                      </div>
                    </div>
                  </div>
                </article>

                <article id="api-personalizada" className="legal-section">
                  <h2>6. API Personalizada para Integraciones</h2>
                  <p>Necesitas una integración específica? Nuestra API RESTful te permite conectar cualquier aplicación o sistema.</p>
                  
                  <div className="rights-grid">
                    <div className="right-item">
                      <div className="right-icon">🔑</div>
                      <h4>API Keys Seguras</h4>
                      <p>Genera claves de API personalizadas con permisos granulares para cada integración.</p>
                    </div>
                    
                    <div className="right-item">
                      <div className="right-icon">📚</div>
                      <h4>Documentación Completa</h4>
                      <p>Documentación interactiva con ejemplos de código en múltiples lenguajes de programación.</p>
                    </div>
                    
                    <div className="right-item">
                      <div className="right-icon">🔄</div>
                      <h4>Webhooks</h4>
                      <p>Recibe notificaciones en tiempo real sobre eventos importantes en tu cuenta.</p>
                    </div>
                    
                    <div className="right-item">
                      <div className="right-icon">⚡</div>
                      <h4>SDKs Oficiales</h4>
                      <p>Bibliotecas oficiales para JavaScript, Python, PHP, Ruby y .NET.</p>
                    </div>
                  </div>
                </article>

                <article id="soporte-integraciones" className="legal-section">
                  <h2>7. Soporte Técnico Especializado</h2>
                  <p>Nuestro equipo de integraciones está disponible para ayudarte a configurar y optimizar tus conexiones.</p>
                  
                  <div className="security-features">
                    <div className="security-feature">
                      <div className="feature-icon">👨‍💻</div>
                      <div className="feature-content">
                        <h4>Configuración Asistida</h4>
                        <p>Soporte técnico personalizado para configurar integraciones complejas o personalizadas.</p>
                      </div>
                    </div>
                    
                    <div className="security-feature">
                      <div className="feature-icon">🔍</div>
                      <div className="feature-content">
                        <h4>Diagnóstico de Problemas</h4>
                        <p>Herramientas de diagnóstico para identificar y resolver problemas de integración rápidamente.</p>
                      </div>
                    </div>
                    
                    <div className="security-feature">
                      <div className="feature-icon">📋</div>
                      <div className="feature-content">
                        <h4>Monitoreo Continuo</h4>
                        <p>Alertas automáticas cuando una integración deja de funcionar o requiere atención.</p>
                      </div>
                    </div>
                  </div>
                </article>

                <div className="api-example-section">
                  <h2>Ejemplo de Uso de API</h2>
                  <p>A continuación te mostramos un ejemplo básico de cómo usar nuestra API RESTful:</p>
                  
                  <div className="code-example">
                    <pre><code>{`// Obtener campañas activas
fetch('https://api.pautapro.com/v1/campaigns', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data));

// Crear una nueva campaña
fetch('https://api.pautapro.com/v1/campaigns', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Mi Campaña de Test',
    budget: 1000,
    client_id: 123
  })
})
.then(response => response.json())
.then(data => console.log(data));`}</code></pre>
                  </div>
                </div>

                <div className="integration-benefits">
                  <h2>Beneficios de las Integraciones</h2>
                  <div className="legal-list">
                    <div className="list-item">
                      <span className="list-icon">⚡</span>
                      <span><strong>Eficiencia:</strong> Reduce el trabajo manual en un 80% al automatizar la sincronización de datos.</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">🎯</span>
                      <span><strong>Precisión:</strong> Elimina errores humanos al centralizar todos los datos en una sola plataforma.</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">📈</span>
                      <span><strong>Insights:</strong> Obtén una visión 360° de tus campañas al unificar datos de múltiples fuentes.</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">🚀</span>
                      <span><strong>Escalabilidad:</strong> Crece sin límites técnicos gracias a nuestra infraestructura cloud.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <section className="legal-footer">
            <div className="legal-container">
              <div className="legal-footer-content">
                <div className="legal-footer-links">
                  <Link to="/features" className="footer-link">Características</Link>
                  <Link to="/pricing" className="footer-link">Precios</Link>
                  <Link to="/integrations" className="footer-link active">Integraciones</Link>
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

export default Integrations;