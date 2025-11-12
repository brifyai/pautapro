import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../assets/css/legal.css';
import Navbar from '../../components/Navbar';

const Api = () => {
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
                <span className="badge-icon">🔧</span>
                <span className="badge-text">API RESTful completa y documentada</span>
              </div>
              
              <h1 className="legal-title">
                API <span className="title-highlight">Developer</span>
              </h1>
              
              <p className="legal-subtitle">
                Integra PautaPro con tus aplicaciones personalizadas. API RESTful robusta, segura y completamente documentada para desarrolladores.
              </p>

              <div className="legal-meta">
                <span className="meta-item">
                  <strong>Versión API:</strong> v1.0
                </span>
                <span className="meta-item">
                  <strong>Endpoint Base:</strong> https://api.pautapro.com/v1
                </span>
              </div>
            </div>
          </section>

          {/* API Overview */}
          <section className="api-overview">
            <div className="api-grid">
              <div className="api-card">
                <div className="api-icon">🔑</div>
                <h3>Autenticación</h3>
                <p>OAuth 2.0 con API Keys y scopes granulares para seguridad máxima.</p>
              </div>
              
              <div className="api-card">
                <div className="api-icon">📊</div>
                <h3>Endpoints RESTful</h3>
                <p>Más de 50 endpoints organizados por recursos: clientes, campañas, reportes.</p>
              </div>
              
              <div className="api-card">
                <div className="api-icon">⚡</div>
                <h3>Tiempo Real</h3>
                <p>Webhooks y streaming para recibir actualizaciones instantáneas.</p>
              </div>
              
              <div className="api-card">
                <div className="api-icon">📚</div>
                <h3>Documentación</h3>
                <p>Documentación interactiva con ejemplos en múltiples lenguajes.</p>
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
                    <li><a href="#autenticacion" onClick={(e) => handleNavClick(e, 'autenticacion')}>Autenticación</a></li>
                    <li><a href="#endpoints" onClick={(e) => handleNavClick(e, 'endpoints')}>Endpoints Principales</a></li>
                    <li><a href="#ejemplos-codigo" onClick={(e) => handleNavClick(e, 'ejemplos-codigo')}>Ejemplos de Código</a></li>
                    <li><a href="#webhooks" onClick={(e) => handleNavClick(e, 'webhooks')}>Webhooks</a></li>
                    <li><a href="#limitaciones" onClick={(e) => handleNavClick(e, 'limitaciones')}>Rate Limits</a></li>
                    <li><a href="#sdks" onClick={(e) => handleNavClick(e, 'sdks')}>SDKs Disponibles</a></li>
                    <li><a href="#errores" onClick={(e) => handleNavClick(e, 'errores')}>Códigos de Error</a></li>
                    <li><a href="#sandbox" onClick={(e) => handleNavClick(e, 'sandbox')}>Entorno de Pruebas</a></li>
                    <li><a href="#changelog" onClick={(e) => handleNavClick(e, 'changelog')}>Historial de Cambios</a></li>
                  </ul>
                </nav>
              </div>

              <div className="legal-main-content">
                <article id="autenticacion" className="legal-section">
                  <h2>1. Autenticación</h2>
                  <p>Nuestra API utiliza OAuth 2.0 para autenticación segura y permisos granulares.</p>
                  
                  <div className="legal-cards">
                    <div className="legal-card">
                      <div className="card-icon">🔑</div>
                      <div className="card-content">
                        <h3>API Keys</h3>
                        <p>Genera claves de API desde tu dashboard con scopes específicos para cada integración.</p>
                      </div>
                    </div>
                    
                    <div className="legal-card">
                      <div className="card-icon">🔒</div>
                      <div className="card-content">
                        <h3>Scopes de Permiso</h3>
                        <p>Controla qué operaciones puede realizar cada API key: solo lectura, escritura, administración.</p>
                      </div>
                    </div>
                    
                    <div className="legal-card">
                      <div className="card-icon">🔄</div>
                      <div className="card-content">
                        <h3>Token Refresh</h3>
                        <p>Renovación automática de tokens con refresh tokens seguros y rotation de claves.</p>
                      </div>
                    </div>
                    
                    <div className="legal-card">
                      <div className="card-icon">🛡️</div>
                      <div className="card-content">
                        <h3>IP Whitelisting</h3>
                        <p>Restringe el acceso a la API solo desde IPs autorizadas por seguridad adicional.</p>
                      </div>
                    </div>
                  </div>
                </article>

                <article id="endpoints" className="legal-section">
                  <h2>2. Endpoints Principales</h2>
                  <p>API RESTful organizada por recursos principales de la plataforma.</p>
                  
                  <div className="endpoints-table">
                    <div className="table-header">
                      <div className="header-item">Endpoint</div>
                      <div className="header-item">Método</div>
                      <div className="header-item">Descripción</div>
                    </div>
                    
                    <div className="table-row">
                      <div className="row-item code">/v1/clients</div>
                      <div className="row-item method">GET</div>
                      <div className="row-item">Obtener lista de clientes</div>
                    </div>
                    
                    <div className="table-row">
                      <div className="row-item code">/v1/clients</div>
                      <div className="row-item method">POST</div>
                      <div className="row-item">Crear nuevo cliente</div>
                    </div>
                    
                    <div className="table-row">
                      <div className="row-item code">/v1/campaigns</div>
                      <div className="row-item method">GET</div>
                      <div className="row-item">Listar campañas</div>
                    </div>
                    
                    <div className="table-row">
                      <div className="row-item code">/v1/campaigns</div>
                      <div className="row-item method">POST</div>
                      <div className="row-item">Crear nueva campaña</div>
                    </div>
                    
                    <div className="table-row">
                      <div className="row-item code">/v1/orders</div>
                      <div className="row-item method">GET</div>
                      <div className="row-item">Obtener órdenes</div>
                    </div>
                    
                    <div className="table-row">
                      <div className="row-item code">/v1/reports</div>
                      <div className="row-item method">GET</div>
                      <div className="row-item">Generar reportes</div>
                    </div>
                    
                    <div className="table-row">
                      <div className="row-item code">/v1/users</div>
                      <div className="row-item method">GET</div>
                      <div className="row-item">Gestión de usuarios</div>
                    </div>
                    
                    <div className="table-row">
                      <div className="row-item code">/v1/integrations</div>
                      <div className="row-item method">GET</div>
                      <div className="row-item">Gestionar integraciones</div>
                    </div>
                  </div>
                </article>

                <article id="ejemplos-codigo" className="legal-section">
                  <h2>3. Ejemplo de Código JavaScript</h2>
                  <p>Implementación básica para comenzar con la API.</p>
                  
                  <div className="code-examples">
                    <div className="code-block active" id="javascript-example">
                      <pre><code>{`// JavaScript - Obtener campañas
const apiKey = 'tu_api_key_aqui';
const url = 'https://api.pautapro.com/v1/campaigns';

fetch(url, {
  method: 'GET',
  headers: {
    'Authorization': \`Bearer \${apiKey}\`,
    'Content-Type': 'application/json',
    'X-API-Version': '1.0'
  }
})
.then(response => response.json())
.then(data => {
  console.log('Campañas:', data.campaigns);
});

// Crear nueva campaña
const campaignData = {
  name: 'Mi Campaña Test',
  client_id: 123,
  budget: 5000,
  start_date: '2024-12-01',
  end_date: '2024-12-31'
};

fetch(url, {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${apiKey}\`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(campaignData)
});`}</code></pre>
                    </div>
                    
                    <div className="code-note">
                      <p><strong>Nota:</strong> También disponible SDKs para Python, PHP, C# y Ruby. Consulta la documentación completa en nuestro repositorio.</p>
                    </div>
                  </div>
                </article>

                <article id="webhooks" className="legal-section">
                  <h2>4. Webhooks para Eventos en Tiempo Real</h2>
                  <p>Recibe notificaciones automáticas cuando ocurran eventos importantes en tu cuenta.</p>
                  
                  <div className="rights-grid">
                    <div className="right-item">
                      <div className="right-icon">📨</div>
                      <h4>Eventos Disponibles</h4>
                      <p>campaign.created, campaign.updated, order.completed, client.added, report.generated</p>
                    </div>
                    
                    <div className="right-item">
                      <div className="right-icon">🔒</div>
                      <h4>Firma de Seguridad</h4>
                      <p>Cada webhook incluye firma HMAC-SHA256 para verificar la autenticidad.</p>
                    </div>
                    
                    <div className="right-item">
                      <div className="right-icon">🔄</div>
                      <h4>Reintentos Automáticos</h4>
                      <p>El sistema reintenta el envío automáticamente en caso de falla temporal.</p>
                    </div>
                    
                    <div className="right-item">
                      <div className="right-icon">📊</div>
                      <h4>Monitoreo</h4>
                      <p>Panel de control para ver el estado de todos tus webhooks y métricas.</p>
                    </div>
                  </div>
                </article>

                <article id="limitaciones" className="legal-section">
                  <h2>5. Rate Limits y Limitaciones</h2>
                  <p>Nuestro API tiene límites justos y escalables según tu plan de suscripción.</p>
                  
                  <div className="limits-table">
                    <div className="table-header">
                      <div className="header-item">Plan</div>
                      <div className="header-item">Requests/min</div>
                      <div className="header-item">Requests/día</div>
                      <div className="header-item">Concurrentes</div>
                    </div>
                    
                    <div className="table-row">
                      <div className="row-item plan">Starter</div>
                      <div className="row-item">100</div>
                      <div className="row-item">10,000</div>
                      <div className="row-item">5</div>
                    </div>
                    
                    <div className="table-row">
                      <div className="row-item plan">Professional</div>
                      <div className="row-item">500</div>
                      <div className="row-item">100,000</div>
                      <div className="row-item">20</div>
                    </div>
                    
                    <div className="table-row">
                      <div className="row-item plan">Enterprise</div>
                      <div className="row-item">1000</div>
                      <div className="row-item">Ilimitado</div>
                      <div className="row-item">50</div>
                    </div>
                  </div>
                </article>

                <article id="sdks" className="legal-section">
                  <h2>6. SDKs Oficiales Disponibles</h2>
                  <p>Bibliotecas oficiales para facilitar la integración en tu lenguaje favorito.</p>
                  
                  <div className="legal-list">
                    <div className="list-item">
                      <span className="list-icon">📦</span>
                      <span><strong>JavaScript/Node.js:</strong> npm install pautapro-js</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">📦</span>
                      <span><strong>Python:</strong> pip install pautapro-python</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">📦</span>
                      <span><strong>PHP:</strong> composer require pautapro/php-sdk</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">📦</span>
                      <span><strong>C#/.NET:</strong> Install-Package PautaProSDK</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">📦</span>
                      <span><strong>Ruby:</strong> gem install pautapro-ruby</span>
                    </div>
                  </div>
                </article>

                <article id="errores" className="legal-section">
                  <h2>7. Códigos de Error y Respuestas</h2>
                  <p>Manejo estándar de errores HTTP con códigos descriptivos y mensajes detallados.</p>
                  
                  <div className="security-features">
                    <div className="security-feature">
                      <div className="feature-icon">✅</div>
                      <div className="feature-content">
                        <h4>200 - OK</h4>
                        <p>Operación exitosa. Respuesta JSON con los datos solicitados.</p>
                      </div>
                    </div>
                    
                    <div className="security-feature">
                      <div className="feature-icon">🔍</div>
                      <div className="feature-content">
                        <h4>400 - Bad Request</h4>
                        <p>Parámetros inválidos o estructura de datos incorrecta.</p>
                      </div>
                    </div>
                    
                    <div className="security-feature">
                      <div className="feature-icon">🔒</div>
                      <div className="feature-content">
                        <h4>401 - Unauthorized</h4>
                        <p>API key inválida o expirada. Verifica tu autenticación.</p>
                      </div>
                    </div>
                    
                    <div className="security-feature">
                      <div className="feature-icon">📋</div>
                      <div className="feature-content">
                        <h4>429 - Too Many Requests</h4>
                        <p>Límite de rate limit excedido. Espera antes de intentar nuevamente.</p>
                      </div>
                    </div>
                  </div>
                </article>

                <article id="sandbox" className="legal-section">
                  <h2>8. Entorno de Pruebas (Sandbox)</h2>
                  <p>Desarrolla y prueba tus integraciones en un entorno seguro sin afectar datos reales.</p>
                  
                  <div className="legal-accordion">
                    <div className="accordion-item">
                      <div className="accordion-header" onClick={() => toggleAccordion(0)}>
                        <h4>Acceso al Sandbox</h4>
                        <span className={`accordion-icon ${activeAccordion === 0 ? 'active' : ''}`}>
                          {activeAccordion === 0 ? '−' : '+'}
                        </span>
                      </div>
                      <div className={`accordion-content ${activeAccordion === 0 ? 'active' : ''}`}>
                        <p>El entorno sandbox usa el endpoint: https://sandbox-api.pautapro.com/v1 - API keys separadas para desarrollo y producción.</p>
                      </div>
                    </div>
                    
                    <div className="accordion-item">
                      <div className="accordion-header" onClick={() => toggleAccordion(1)}>
                        <h4>Datos de Prueba</h4>
                        <span className={`accordion-icon ${activeAccordion === 1 ? 'active' : ''}`}>
                          {activeAccordion === 1 ? '−' : '+'}
                        </span>
                      </div>
                      <div className={`accordion-content ${activeAccordion === 1 ? 'active' : ''}`}>
                        <p>Base de datos poblada con datos ficticios pero realistas para pruebas completas.</p>
                      </div>
                    </div>
                    
                    <div className="accordion-item">
                      <div className="accordion-header" onClick={() => toggleAccordion(2)}>
                        <h4>Simulación de Webhooks</h4>
                        <span className={`accordion-icon ${activeAccordion === 2 ? 'active' : ''}`}>
                          {activeAccordion === 2 ? '−' : '+'}
                        </span>
                      </div>
                      <div className={`accordion-content ${activeAccordion === 2 ? 'active' : ''}`}>
                        <p>Simula eventos en tiempo real para probar tus webhooks sin afectar datos reales.</p>
                      </div>
                    </div>
                  </div>
                </article>

                <article id="changelog" className="legal-section">
                  <h2>9. Historial de Cambios (Changelog)</h2>
                  <p>Mantenemos nuestra API actualizada con nuevas funcionalidades y mejoras.</p>
                  
                  <div className="changelog">
                    <div className="changelog-item">
                      <div className="changelog-version">v1.0</div>
                      <div className="changelog-date">12 Nov 2024</div>
                      <div className="changelog-content">
                        <strong>Lanzamiento inicial de la API</strong>
                        <ul>
                          <li>Autenticación OAuth 2.0 completa</li>
                          <li>50+ endpoints principales</li>
                          <li>Webhooks para eventos en tiempo real</li>
                          <li>SDKs oficiales en 5 lenguajes</li>
                          <li>Documentación interactiva</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="changelog-item">
                      <div className="changelog-version">v0.9</div>
                      <div className="changelog-date">1 Nov 2024</div>
                      <div className="changelog-content">
                        <strong>Beta privada</strong>
                        <ul>
                          <li>Testing con usuarios seleccionados</li>
                          <li>Refinamiento de endpoints</li>
                          <li>Optimización de performance</li>
                        </ul>
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
                  <Link to="/pricing" className="footer-link">Precios</Link>
                  <Link to="/integrations" className="footer-link">Integraciones</Link>
                  <Link to="/api" className="footer-link active">API</Link>
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

export default Api;