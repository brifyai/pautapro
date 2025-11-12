import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeDemoTab, setActiveDemoTab] = useState('dashboard');
    const [activeSection, setActiveSection] = useState('dashboard');

    // No bloquear el scroll del body para que el menú se comporte como overlay normal
    useEffect(() => {
        // El menú móvil debe aparecer como overlay sin afectar el scroll de la página
        return () => {
            // Cleanup
        };
    }, [isMenuOpen]);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // SEO: metatags, OpenGraph, Twitter Cards, JSON-LD, canonical, idioma
    useEffect(() => {
        const origin = window.location.origin;
        const url = origin + window.location.pathname;

        // Idioma del documento
        document.documentElement.lang = 'es';
        document.documentElement.dir = 'ltr';

        // Utilidades para insertar/actualizar tags en <head>
        const upsertLink = (rel, href) => {
            let el = document.querySelector(`head link[rel="${rel}"]`);
            if (!el) {
                el = document.createElement('link');
                el.setAttribute('rel', rel);
                document.head.appendChild(el);
            }
            el.setAttribute('href', href);
        };
        const upsertMeta = (attr, key, content) => {
            let el = document.querySelector(`head meta[${attr}="${key}"]`);
            if (!el) {
                el = document.createElement('meta');
                el.setAttribute(attr, key);
                document.head.appendChild(el);
            }
            el.setAttribute('content', content);
        };
        const upsertTitle = (title) => {
            document.title = title;
        };

        // Título y descripción
        const title = 'PautaPro | Software para Agencias de Publicidad | Gestión de Campañas, Clientes y Analytics';
        const description =
            'PautaPro es la plataforma todo‑en‑uno para agencias de publicidad. Automatiza la gestión de clientes, campañas, órdenes, reportes y analytics. Planes desde $9.990/mes. Prueba gratuita.';
        upsertTitle(title);
        upsertMeta('name', 'description', description);
        upsertMeta('name', 'robots', 'index,follow');
        upsertMeta('name', 'keywords', 'software agencias publicidad, gestión de campañas, analytics publicitario, automatización marketing, plataforma publicidad, reportes clientes, PautaPro');

        // Canonical
        upsertLink('canonical', url);

        // Open Graph
        const ogImage = `${origin}/src/assets/img/logo-pautapro-blue-high-quality.png`;
        upsertMeta('property', 'og:title', title);
        upsertMeta('property', 'og:description', description);
        upsertMeta('property', 'og:type', 'website');
        upsertMeta('property', 'og:url', url);
        upsertMeta('property', 'og:image', ogImage);
        upsertMeta('property', 'og:image:width', '1200');
        upsertMeta('property', 'og:image:height', '630');
        upsertMeta('property', 'og:locale', 'es_CL');
        upsertMeta('property', 'og:site_name', 'PautaPro');

        // Twitter Cards
        upsertMeta('name', 'twitter:card', 'summary_large_image');
        upsertMeta('name', 'twitter:title', title);
        upsertMeta('name', 'twitter:description', description);
        upsertMeta('name', 'twitter:image', ogImage);
        upsertMeta('name', 'twitter:site', '@pautapro');
        upsertMeta('name', 'twitter:creator', '@pautapro');

        // Hreflang (es-CL como principal)
        const hreflang = document.querySelector('head link[rel="alternate"][hreflang="es-CL"]');
        if (!hreflang) {
            const l = document.createElement('link');
            l.setAttribute('rel', 'alternate');
            l.setAttribute('hreflang', 'es-CL');
            l.setAttribute('href', url);
            document.head.appendChild(l);
        }

        // JSON-LD (WebSite + Organization + SoftwareApplication)
        const ldId = 'ld-json-pautapro';
        const existing = document.getElementById(ldId);
        if (existing) existing.remove();
        const ld = [
            {
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                name: 'PautaPro',
                alternateName: 'PautaPro - Software para Agencias de Publicidad',
                url,
                inLanguage: 'es-CL',
                potentialAction: {
                    '@type': 'SearchAction',
                    target: `${url}?q={search_term_string}`,
                    'query-input': 'required name=search_term_string'
                }
            },
            {
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: 'PautaPro',
                alternateName: 'PautaPro - Plataforma para Agencias',
                url,
                logo: ogImage,
                description: 'Software todo‑en‑uno para agencias de publicidad: gestión de clientes, campañas, analytics y automatización con IA.',
                contactPoint: {
                    '@type': 'ContactPoint',
                    telephone: '+56-2-12345678',
                    contactType: 'customer service',
                    availableLanguage: ['Spanish']
                },
                sameAs: [
                    'https://www.linkedin.com/company/pautapro',
                    'https://twitter.com/pautapro',
                    'https://www.facebook.com/pautapro'
                ],
                address: {
                    '@type': 'PostalAddress',
                    addressCountry: 'CL',
                    addressLocality: 'Santiago'
                }
            },
            {
                '@context': 'https://schema.org',
                '@type': 'SoftwareApplication',
                name: 'PautaPro',
                applicationCategory: 'BusinessApplication',
                operatingSystem: 'Web',
                offers: [
                    {
                        '@type': 'Offer',
                        name: 'Plan Freelancer',
                        price: '9990',
                        priceCurrency: 'CLP',
                        billingDuration: 'P1M',
                        description: 'Hasta 3 clientes, 1 usuario, reportes básicos y soporte por email'
                    },
                    {
                        '@type': 'Offer',
                        name: 'Plan Agencia',
                        price: '49990',
                        priceCurrency: 'CLP',
                        billingDuration: 'P1M',
                        description: 'Clientes ilimitados, IA avanzada, analytics en tiempo real y soporte prioritario 24/7'
                    }
                ],
                aggregateRating: {
                    '@type': 'AggregateRating',
                    ratingValue: '4.8',
                    ratingCount: '156',
                    bestRating: '5',
                    worstRating: '1'
                }
            }
        ];
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = ldId;
        script.textContent = JSON.stringify(ld);
        document.head.appendChild(script);
        // Favicon principal (SVG)
        const favicon = document.createElement('link');
        favicon.rel = 'icon';
        favicon.href = `${origin}/favicon.svg`;
        favicon.type = 'image/svg+xml';
        document.head.appendChild(favicon);

        // Favicons y PWA meta
        const faviconSizes = [16, 32, 96, 192, 512];
        faviconSizes.forEach(size => {
            const link = document.createElement('link');
            link.rel = 'icon';
            link.type = 'image/png';
            link.sizes = `${size}x${size}`;
            link.href = `${origin}/favicon-${size}x${size}.png`;
            document.head.appendChild(link);
        });
        const appleTouchIcon = document.createElement('link');
        appleTouchIcon.rel = 'apple-touch-icon';
        appleTouchIcon.href = `${origin}/apple-touch-icon.png`;
        document.head.appendChild(appleTouchIcon);
        upsertMeta('name', 'theme-color', '#000000');
        upsertMeta('name', 'apple-mobile-web-app-capable', 'yes');
        upsertMeta('name', 'apple-mobile-web-app-status-bar-style', 'black-translucent');
        upsertMeta('name', 'apple-mobile-web-app-title', 'PautaPro');
        upsertMeta('name', 'application-name', 'PautaPro');
        upsertMeta('name', 'msapplication-TileColor', '#000000');
        upsertMeta('name', 'msapplication-config', `${origin}/browserconfig.xml`);

        // Preconnect a dominios externos para rendimiento
        ['https://fonts.googleapis.com', 'https://fonts.gstatic.com', 'https://www.googletagmanager.com'].forEach(domain => {
            const preconnect = document.createElement('link');
            preconnect.rel = 'preconnect';
            preconnect.href = domain;
            preconnect.crossOrigin = 'anonymous';
            document.head.appendChild(preconnect);
        });

        // DNS prefetch para recursos críticos
        ['//www.google-analytics.com', '//connect.facebook.net', '//www.linkedin.com'].forEach(domain => {
            const dnsPrefetch = document.createElement('link');
            dnsPrefetch.rel = 'dns-prefetch';
            dnsPrefetch.href = domain;
            document.head.appendChild(dnsPrefetch);
        });
    }, []);

    const handleDemoTabChange = (module) => {
        setActiveDemoTab(module);
        
        // Update tab buttons
        document.querySelectorAll('.showcase-nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-module="${module}"]`).classList.add('active');
        
        // Update panels
        document.querySelectorAll('.showcase-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(`${module}-panel`).classList.add('active');
    };

    const features = [
        {
            title: 'Gestión Centralizada',
            description: 'Administra clientes, campañas y medios desde un solo lugar, optimizando tu flujo de trabajo.',
        },
        {
            title: 'Analytics en Tiempo Real',
            description: 'Toma decisiones basadas en datos con dashboards interactivos y reportes al instante.',
        },
        {
            icon: '🤖',
            title: 'Automatización con IA',
            description: 'Deja que la inteligencia artificial optimice la planificación y ejecución de tus campañas.',
        },
        {
            icon: '💰',
            title: 'Control de Rentabilidad',
            description: 'Analiza el rendimiento y maximiza el ROI de cada cliente y campaña publicitaria.',
        },
        {
            title: 'Colaboración Eficiente',
            description: 'Gestiona proveedores, contratos y órdenes de compra sin fricciones.',
        },
        {
            title: 'Reportes Profesionales',
            description: 'Genera informes de inversión y rendimiento listos para presentar a tus clientes.',
        },
    ];

    // Cerrar menú al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isMenuOpen && !event.target.closest('.nav-links') && !event.target.closest('.mobile-menu-toggle')) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen]);

    return (
        <div className="pautapro-home">
            <header className={`startup-nav ${scrolled ? 'scrolled' : ''}`}>
                <div className="nav-container">
                    <button className="mobile-menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        <div className="hamburger-line"></div>
                        <div className="hamburger-line"></div>
                        <div className="hamburger-line"></div>
                    </button>
                    <Link to="/" className="brand-link">
                        <div className="navbar-brand">
                            <span className="brand-text">PautaPro</span>
                        </div>
                    </Link>
                    <nav className={`nav-links ${isMenuOpen ? 'mobile-open' : ''}`}>
                        <a href="#about" className="nav-link" onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const element = document.getElementById('about');
                            setIsMenuOpen(false);
                            if (element) {
                                setTimeout(() => {
                                    element.scrollIntoView({ behavior: 'smooth' });
                                }, 300);
                            }
                        }}>Somos</a>
                        <a href="#features" className="nav-link" onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const element = document.getElementById('features');
                            setIsMenuOpen(false);
                            if (element) {
                                setTimeout(() => {
                                    element.scrollIntoView({ behavior: 'smooth' });
                                }, 300);
                            }
                        }}>Funcionalidades</a>
                        <a href="#pricing" className="nav-link" onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const element = document.getElementById('pricing');
                            setIsMenuOpen(false);
                            if (element) {
                                setTimeout(() => {
                                    element.scrollIntoView({ behavior: 'smooth' });
                                }, 300);
                            }
                        }}>Precios</a>
                        <a href="#final-cta" className="nav-link" onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const element = document.getElementById('final-cta');
                            setIsMenuOpen(false);
                            if (element) {
                                setTimeout(() => {
                                    element.scrollIntoView({ behavior: 'smooth' });
                                }, 300);
                            }
                        }}>Contacto</a>
                        {isMenuOpen && (
                            <>
                                <Link to="/login" className="nav-btn-mobile nav-btn-mobile-secondary" onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsMenuOpen(false);
                                    setTimeout(() => {
                                        window.location.href = '/login';
                                    }, 100);
                                }}>
                                    Iniciar Sesión
                                </Link>
                                <a href="http://localhost:5173/register" className="nav-btn-mobile nav-btn-mobile-primary" onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsMenuOpen(false);
                                    setTimeout(() => {
                                        window.location.href = 'http://localhost:5173/register';
                                    }, 100);
                                }}>
                                    Registrarse
                                </a>
                            </>
                        )}
                    </nav>
                    <div className="nav-actions">
                        <Link to="/login" className="nav-btn nav-btn-secondary">Iniciar Sesión</Link>
                        <a href="http://localhost:5173/register" className="nav-btn nav-btn-primary">
                            <span style={{color: '#ffffff !important'}}>Registrarse</span>
                        </a>
                    </div>
                </div>
            </header>

            <main>
                <section className="hero-section section-container">
                    <div className="hero-content">
                        <div className="hero-badge">
                            <span role="img" aria-label="star">✨</span>
                            La plataforma todo-en-uno para agencias de publicidad
                        </div>
                        <h1 className="hero-title">
                            <span className="hero-highlight">Automatiza, Analiza y Escala tu Agencia</span>
                        </h1>
                        <p className="hero-description" style={{ color: '#ffffff !important' }}>
                            PautaPro centraliza la gestión de campañas, clientes y medios para que puedas enfocarte en lo más importante: hacer crecer tu negocio.
                        </p>
                    </div>
                    <div className="hero-visual">
                        <div className="pautapro-iframe">
                            <div className="iframe-header">
                                <div className="iframe-controls">
                                    <span className="control-dot red"></span>
                                    <span className="control-dot yellow"></span>
                                    <span className="control-dot green"></span>
                                </div>
                                <div className="iframe-url">
                                    <span className="url-icon">🔒</span>
                                    <span className="url-text">pautapro.cl/dashboard</span>
                                </div>
                                <div className="iframe-actions">
                                    <button className="iframe-btn">−</button>
                                    <button className="iframe-btn">□</button>
                                    <button className="iframe-btn">✕</button>
                                </div>
                            </div>
                            
                            <div className="iframe-navbar">
                                <div className="navbar-brand">
                                    <span className="brand-text">PautaPro</span>
                                </div>
                                <div className="navbar-menu">
                                    <span
                                        className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
                                        onClick={() => setActiveSection('dashboard')}
                                    >
                                        Dashboard
                                    </span>
                                    <span
                                        className={`nav-item ${activeSection === 'clientes' ? 'active' : ''}`}
                                        onClick={() => setActiveSection('clientes')}
                                    >
                                        Clientes
                                    </span>
                                    <span
                                        className={`nav-item ${activeSection === 'ordenes' ? 'active' : ''}`}
                                        onClick={() => setActiveSection('ordenes')}
                                    >
                                        Órdenes
                                    </span>
                                    <span
                                        className={`nav-item ${activeSection === 'campañas' ? 'active' : ''}`}
                                        onClick={() => setActiveSection('campañas')}
                                    >
                                        Campañas
                                    </span>
                                    <span
                                        className={`nav-item ${activeSection === 'reportes' ? 'active' : ''}`}
                                        onClick={() => setActiveSection('reportes')}
                                    >
                                        Reportes
                                    </span>
                                </div>
                                <div className="navbar-user">
                                    <div className="user-avatar">A</div>
                                </div>
                            </div>
                            
                            <div className="iframe-content">
                                {activeSection === 'dashboard' && (
                                    <div className="dashboard-grid-three">
                                        <div className="dashboard-card">
                                            <div className="card-header">
                                                <span className="card-title" style={{fontWeight: 'bold'}}>Resumen del Mes</span>
                                            </div>
                                            <div className="card-metrics">
                                                <div className="metric">
                                                    <span className="metric-value">$4.8M</span>
                                                    <span className="metric-label">Inversión</span>
                                                    <span className="metric-change positive">+12.5%</span>
                                                </div>
                                                <div className="metric">
                                                    <span className="metric-value">156</span>
                                                    <span className="metric-label">Clientes Activos</span>
                                                    <span className="metric-change positive">+8.2%</span>
                                                </div>
                                                <div className="metric">
                                                    <span className="metric-value">342</span>
                                                    <span className="metric-label">Campañas Activas</span>
                                                    <span className="metric-change positive">+15.3%</span>
                                                </div>
                                            </div>
                                        </div>
                                         
                                        <div className="dashboard-card">
                                            <div className="card-header">
                                                <span className="card-title">Clientes Principales</span>
                                            </div>
                                            <div className="client-list">
                                                <div className="client-item">
                                                    <div className="client-avatar-small">RC</div>
                                                    <div className="client-info">
                                                        <span className="client-name">Retail Corporation</span>
                                                        <span className="client-status">Premium</span>
                                                    </div>
                                                    <div className="client-metric">$850K/mes</div>
                                                </div>
                                                <div className="client-item">
                                                    <div className="client-avatar-small">TS</div>
                                                    <div className="client-info">
                                                        <span className="client-name">TechStart Solutions</span>
                                                        <span className="client-status">Premium</span>
                                                    </div>
                                                    <div className="client-metric">$620K/mes</div>
                                                </div>
                                                <div className="client-item">
                                                    <div className="client-avatar-small">FC</div>
                                                    <div className="client-info">
                                                        <span className="client-name">Fashion Co.</span>
                                                        <span className="client-status">Standard</span>
                                                    </div>
                                                    <div className="client-metric">$380K/mes</div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="dashboard-card">
                                            <div className="card-header">
                                                <span className="card-title">Campañas Principales</span>
                                            </div>
                                            <div className="campaign-list">
                                                <div className="campaign-item">
                                                    <div className="campaign-icon">📱</div>
                                                    <div className="campaign-info">
                                                        <span className="campaign-name">Verano 2024</span>
                                                        <span className="campaign-client">Retail Corporation</span>
                                                    </div>
                                                    <div className="campaign-metric">
                                                        <span className="campaign-status active">Activa</span>
                                                        <span className="campaign-budget">$125K</span>
                                                    </div>
                                                </div>
                                                <div className="campaign-item">
                                                    <div className="campaign-icon">💻</div>
                                                    <div className="campaign-info">
                                                        <span className="campaign-name">Launch Digital</span>
                                                        <span className="campaign-client">TechStart Solutions</span>
                                                    </div>
                                                    <div className="campaign-metric">
                                                        <span className="campaign-status active">Activa</span>
                                                        <span className="campaign-budget">$89K</span>
                                                    </div>
                                                </div>
                                                <div className="campaign-item">
                                                    <div className="campaign-icon">👗</div>
                                                    <div className="campaign-info">
                                                        <span className="campaign-name">Brand Awareness</span>
                                                        <span className="campaign-client">Fashion Co.</span>
                                                    </div>
                                                    <div className="campaign-metric">
                                                        <span className="campaign-status paused">Pausada</span>
                                                        <span className="campaign-budget">$68K</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="dashboard-card full-width">
                                            <div className="card-header">
                                                <span className="card-title">Órdenes Recientes</span>
                                            </div>
                                            <div className="orders-table">
                                                <div className="table-header">
                                                    <span>ID</span>
                                                    <span>Cliente</span>
                                                    <span>Campaña</span>
                                                    <span>Monto</span>
                                                    <span>Estado</span>
                                                </div>
                                                <div className="table-row">
                                                    <span>#ORD-2024-001</span>
                                                    <span>Retail Corp</span>
                                                    <span>Verano 2024</span>
                                                    <span>$125,000</span>
                                                    <span className="status-active">Activa</span>
                                                </div>
                                                <div className="table-row">
                                                    <span>#ORD-2024-002</span>
                                                    <span>TechStart</span>
                                                    <span>Launch Digital</span>
                                                    <span>$89,500</span>
                                                    <span className="status-review">Revisión</span>
                                                </div>
                                                <div className="table-row">
                                                    <span>#ORD-2024-003</span>
                                                    <span>Fashion Co</span>
                                                    <span>Brand Awareness</span>
                                                    <span>$67,800</span>
                                                    <span className="status-completed">Completada</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {activeSection === 'clientes' && (
                                    <div className="clientes-section">
                                        <div className="section-header">
                                            <h2>Gestión de Clientes</h2>
                                            <button className="btn-primary">+ Nuevo Cliente</button>
                                        </div>
                                        <div className="clientes-grid">
                                            <div className="cliente-card">
                                                <div className="cliente-avatar">RC</div>
                                                <div className="cliente-detalles">
                                                    <h3>Retail Corporation</h3>
                                                    <p>contacto@retailcorp.com</p>
                                                    <span className="cliente-estado activo">Premium</span>
                                                </div>
                                                <div className="cliente-metricas">
                                                    <span>$850K/mes</span>
                                                    <span>24 campañas</span>
                                                </div>
                                            </div>
                                            <div className="cliente-card">
                                                <div className="cliente-avatar">TS</div>
                                                <div className="cliente-detalles">
                                                    <h3>TechStart Solutions</h3>
                                                    <p>info@techstart.io</p>
                                                    <span className="cliente-estado activo">Premium</span>
                                                </div>
                                                <div className="cliente-metricas">
                                                    <span>$620K/mes</span>
                                                    <span>18 campañas</span>
                                                </div>
                                            </div>
                                            <div className="cliente-card">
                                                <div className="cliente-avatar">FC</div>
                                                <div className="cliente-detalles">
                                                    <h3>Fashion Company</h3>
                                                    <p>marketing@fashionco.com</p>
                                                    <span className="cliente-estado activo">Standard</span>
                                                </div>
                                                <div className="cliente-metricas">
                                                    <span>$380K/mes</span>
                                                    <span>12 campañas</span>
                                                </div>
                                            </div>
                                            <div className="cliente-card">
                                                <div className="cliente-avatar">AM</div>
                                                <div className="cliente-detalles">
                                                    <h3>Auto Motors</h3>
                                                    <p>publicidad@automotors.cl</p>
                                                    <span className="cliente-estado activo">Standard</span>
                                                </div>
                                                <div className="cliente-metricas">
                                                    <span>$290K/mes</span>
                                                    <span>8 campañas</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {activeSection === 'ordenes' && (
                                    <div className="ordenes-section">
                                        <div className="section-header">
                                            <h2>Gestión de Órdenes</h2>
                                            <button className="btn-primary">+ Nueva Orden</button>
                                        </div>
                                        <div className="ordenes-table-full">
                                            <div className="table-header-full">
                                                <span>ID</span>
                                                <span>Cliente</span>
                                                <span>Campaña</span>
                                                <span>Monto</span>
                                                <span>Fecha Inicio</span>
                                                <span>Estado</span>
                                                <span>Acciones</span>
                                            </div>
                                            <div className="table-row-full">
                                                <span>#ORD-2024-001</span>
                                                <span>Retail Corporation</span>
                                                <span>Verano 2024</span>
                                                <span>$125,000</span>
                                                <span>01/11/2024</span>
                                                <span className="status-active">Activa</span>
                                                <span className="acciones">✏️</span>
                                            </div>
                                            <div className="table-row-full">
                                                <span>#ORD-2024-002</span>
                                                <span>TechStart Solutions</span>
                                                <span>Launch Digital</span>
                                                <span>$89,500</span>
                                                <span>31/10/2024</span>
                                                <span className="status-review">Revisión</span>
                                                <span className="acciones">✏️</span>
                                            </div>
                                            <div className="table-row-full">
                                                <span>#ORD-2024-003</span>
                                                <span>Fashion Company</span>
                                                <span>Brand Awareness</span>
                                                <span>$67,800</span>
                                                <span>15/10/2024</span>
                                                <span className="status-completed">Completada</span>
                                                <span className="acciones"></span>
                                            </div>
                                            <div className="table-row-full">
                                                <span>#ORD-2024-004</span>
                                                <span>Auto Motors</span>
                                                <span>Nuevo Modelo</span>
                                                <span>$45,200</span>
                                                <span>28/09/2024</span>
                                                <span className="status-completed">Completada</span>
                                                <span className="acciones"></span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {activeSection === 'campañas' && (
                                    <div className="campañas-section">
                                        <div className="section-header">
                                            <h2>Gestión de Campañas</h2>
                                            <button className="btn-primary">+ Nueva Campaña</button>
                                        </div>
                                        <div className="campañas-grid">
                                            <div className="campaña-card">
                                                <div className="campaña-header">
                                                    <h3>Verano 2024 - Retail</h3>
                                                    <span className="campaña-estado activa">Activa</span>
                                                </div>
                                                <div className="campaña-cliente">Retail Corporation</div>
                                                <div className="campaña-metricas">
                                                    <div className="metrica-campaña">
                                                        <span>Presupuesto</span>
                                                        <strong>$125,000</strong>
                                                    </div>
                                                    <div className="metrica-campaña">
                                                        <span>CTR</span>
                                                        <strong>4.2%</strong>
                                                    </div>
                                                    <div className="metrica-campaña">
                                                        <span>CPC</span>
                                                        <strong>$1.25</strong>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="campaña-card">
                                                <div className="campaña-header">
                                                    <h3>Launch Digital Q4</h3>
                                                    <span className="campaña-estado activa">Activa</span>
                                                </div>
                                                <div className="campaña-cliente">TechStart Solutions</div>
                                                <div className="campaña-metricas">
                                                    <div className="metrica-campaña">
                                                        <span>Presupuesto</span>
                                                        <strong>$89,500</strong>
                                                    </div>
                                                    <div className="metrica-campaña">
                                                        <span>CTR</span>
                                                        <strong>3.8%</strong>
                                                    </div>
                                                    <div className="metrica-campaña">
                                                        <span>CPC</span>
                                                        <strong>$1.45</strong>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="campaña-card">
                                                <div className="campaña-header">
                                                    <h3>Brand Awareness</h3>
                                                    <span className="campaña-estado pausada">Pausada</span>
                                                </div>
                                                <div className="campaña-cliente">Fashion Company</div>
                                                <div className="campaña-metricas">
                                                    <div className="metrica-campaña">
                                                        <span>Presupuesto</span>
                                                        <strong>$67,800</strong>
                                                    </div>
                                                    <div className="metrica-campaña">
                                                        <span>CTR</span>
                                                        <strong>2.9%</strong>
                                                    </div>
                                                    <div className="metrica-campaña">
                                                        <span>CPC</span>
                                                        <strong>$0.95</strong>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {activeSection === 'reportes' && (
                                    <div className="reportes-section">
                                        <div className="section-header">
                                            <h2>Reportes y Analytics</h2>
                                            <button className="btn-primary">+ Generar Reporte</button>
                                        </div>
                                        <div className="reportes-grid">
                                            <div className="reporte-card">
                                                <div className="reporte-header">
                                                    <h3>Reporte Mensual - Noviembre</h3>
                                                    <span className="reporte-fecha">Período: Nov 1-30, 2024</span>
                                                </div>
                                                <div className="reporte-metricas">
                                                    <div className="metrica-reporte">
                                                        <span>Inversión</span>
                                                        <strong>$4.8M</strong>
                                                    </div>
                                                    <div className="metrica-reporte">
                                                        <span>ROI Promedio</span>
                                                        <strong>4.2x</strong>
                                                    </div>
                                                    <div className="metrica-reporte">
                                                        <span>Leads Generados</span>
                                                        <strong>8,456</strong>
                                                    </div>
                                                </div>
                                                <button className="btn-secondary">Ver Detalles</button>
                                            </div>
                                            <div className="reporte-card">
                                                <div className="reporte-header">
                                                    <h3>Rendimiento por Canal</h3>
                                                    <span className="reporte-fecha">Últimos 30 días</span>
                                                </div>
                                                <button className="btn-secondary">Ver Detalles</button>
                                            </div>
                                            <div className="reporte-card">
                                                <div className="reporte-header">
                                                    <h3>Top Clientes</h3>
                                                    <span className="reporte-fecha">Por inversión</span>
                                                </div>
                                                <div className="top-clientes-list">
                                                    <div className="top-cliente-item">
                                                        <span className="cliente-rank">1</span>
                                                        <span className="cliente-nombre">Retail Corporation</span>
                                                        <span className="cliente-inversion">$850K</span>
                                                    </div>
                                                    <div className="top-cliente-item">
                                                        <span className="cliente-rank">2</span>
                                                        <span className="cliente-nombre">TechStart Solutions</span>
                                                        <span className="cliente-inversion">$620K</span>
                                                    </div>
                                                    <div className="top-cliente-item">
                                                        <span className="cliente-rank">3</span>
                                                        <span className="cliente-nombre">Fashion Company</span>
                                                        <span className="cliente-inversion">$380K</span>
                                                    </div>
                                                </div>
                                                <button className="btn-secondary">Ver Detalles</button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <section id="about" className="somos-section">
                    <div className="somos-container">
                        {/* Hero Section Somos */}
                        <div className="somos-hero">
                            <div className="somos-hero-content">
                                <div className="somos-badge">
                                    <span style={{ color: '#ffffff !important' }}>Líderes en Tecnología Publicitaria</span>
                                </div>
                                <h2 className="somos-main-title">
                                    <span className="title-gradient">Somos PautaPro</span>
                                </h2>
                                <p className="somos-main-subtitle" style={{ color: '#ffffff !important' }}>
                                    Expertos en transformar la gestión publicitaria con tecnología de vanguardia
                                </p>
                            </div>
                        </div>

                        {/* Story & Mission Grid */}
                        <div className="somos-content-grid">
                            <div className="somos-story-card">
                                <div className="card-accent"></div>
                                <h3 className="card-title" style={{ color: '#ffffff !important' }}>Nuestra Historia</h3>
                                <div className="card-content">
                                    <p style={{ color: '#ffffff !important' }}>
                                        Fundada en 2020, PautaPro nació de una visión revolucionaria: transformar
                                        la manera en que las agencias de publicidad gestionan sus campañas.
                                        Identificamos un dolor real en el mercado - agencias talentosas perdiendo
                                        tiempo valioso en tareas administrativas.
                                    </p>
                                    <p style={{ color: '#ffffff !important' }}>
                                        Hoy somos la plataforma líder que empodera a más de 150 agencias,
                                        gestionando millones en inversión publicitaria con tecnología de punta.
                                    </p>
                                </div>
                                <div className="card-timeline">
                                    <div className="timeline-item">
                                        <span className="timeline-year" style={{ color: '#ffffff !important' }}>2020</span>
                                        <span className="timeline-event" style={{ color: '#ffffff !important' }}>Fundación</span>
                                    </div>
                                    <div className="timeline-item">
                                        <span className="timeline-year" style={{ color: '#ffffff !important' }}>2022</span>
                                        <span className="timeline-event" style={{ color: '#ffffff !important' }}>Expansión Nacional</span>
                                    </div>
                                    <div className="timeline-item">
                                        <span className="timeline-year" style={{ color: '#ffffff !important' }}>2024</span>
                                        <span className="timeline-event" style={{ color: '#ffffff !important' }}>Líder del Mercado</span>
                                    </div>
                                </div>
                            </div>

                            <div className="somos-mission-card">
                                <div className="card-accent"></div>
                                <h3 className="card-title" style={{ color: '#ffffff !important' }}>Nuestra Misión</h3>
                                <div className="card-content">
                                    <p style={{ color: '#ffffff !important' }}>
                                        Empoderar a las agencias de publicidad con herramientas inteligentes que
                                        automaticen lo complejo y liberen el potencial creativo. Creemos que la
                                        tecnología debe ser un catalizador para la innovación publicitaria.
                                    </p>
                                    <div className="mission-pillars">
                                        <div className="pillar-item">
                                            <div className="pillar-text">
                                                <strong style={{ color: '#ffffff !important' }}>Automatización</strong>
                                                <span style={{ color: '#ffffff !important' }}>Eliminamos tareas repetitivas</span>
                                            </div>
                                        </div>
                                        <div className="pillar-item">
                                            <div className="pillar-text">
                                                <strong style={{ color: '#ffffff !important' }}>Inteligencia Artificial</strong>
                                                <span style={{ color: '#ffffff !important' }}>Optimización predictiva</span>
                                            </div>
                                        </div>
                                        <div className="pillar-item">
                                            <div className="pillar-text">
                                                <strong style={{ color: '#ffffff !important' }}>Resultados</strong>
                                                <span style={{ color: '#ffffff !important' }}>ROI maximizado</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </section>

                <section id="features" className="features-section section-container">
                    <h2 className="section-title"><span className="title-gradient">Todo lo que necesitas, en un solo lugar</span></h2>
                    <p className="section-subtitle">
                        Potencia tu agencia con herramientas profesionales diseñadas para maximizar tu eficiencia y resultados
                    </p>
                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div key={index} className="feature-card">
                                <span className="feature-number">0{index + 1}</span>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="demo-section-original section-container">
                    <div className="demo-header-original">
                        <h3 className="section-title">Conoce el sistema en acción</h3>
                        <p className="section-subtitle">
                            Explora las principales funcionalidades de PautaPro
                        </p>
                    </div>
                    
                    <div className="constellation-container">
                        {/* Central Dashboard */}
                        <div className="central-dashboard">
                            <div className="dashboard-glow"></div>
                            <div className="dashboard-content">
                                <div className="main-metric">
                                    <div className="metric-value">$4.8M</div>
                                    <div className="metric-label">Inversión</div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Connection Lines */}
                        <svg className="connection-lines" viewBox="0 0 800 600">
                            <line x1="400" y1="300" x2="200" y2="150" stroke="url(#gradient1)" stroke-width="2" opacity="0.3"/>
                            <line x1="400" y1="300" x2="600" y2="150" stroke="url(#gradient2)" stroke-width="2" opacity="0.3"/>
                            <line x1="400" y1="300" x2="200" y2="450" stroke="url(#gradient3)" stroke-width="2" opacity="0.3"/>
                            <line x1="400" y1="300" x2="600" y2="450" stroke="url(#gradient4)" stroke-width="2" opacity="0.3"/>
                            <defs>
                                <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" style={{stopColor: '#00D4FF', stopOpacity: 0.8}} />
                                    <stop offset="100%" style={{stopColor: '#7C3AED', stopOpacity: 0.3}} />
                                </linearGradient>
                                <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" style={{stopColor: '#00D4FF', stopOpacity: 0.8}} />
                                    <stop offset="100%" style={{stopColor: '#EC4899', stopOpacity: 0.3}} />
                                </linearGradient>
                                <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" style={{stopColor: '#00D4FF', stopOpacity: 0.8}} />
                                    <stop offset="100%" style={{stopColor: '#10B981', stopOpacity: 0.3}} />
                                </linearGradient>
                                <linearGradient id="gradient4" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" style={{stopColor: '#00D4FF', stopOpacity: 0.8}} />
                                    <stop offset="100%" style={{stopColor: '#F59E0B', stopOpacity: 0.3}} />
                                </linearGradient>
                            </defs>
                        </svg>
                        
                        {/* Feature Modules */}
                        <div className="feature-module analytics-module">
                            <h4>Analytics Avanzado</h4>
                            <p>Métricas en tiempo real con dashboards interactivos y reportes automáticos</p>
                            <div className="module-glow"></div>
                        </div>
                        
                        <div className="feature-module clients-module">
                            <h4>Gestión de Clientes</h4>
                            <p>Base de datos centralizada con seguimiento completo de campañas</p>
                            <div className="module-glow"></div>
                        </div>
                        
                        <div className="feature-module orders-module">
                            <h4>Órdenes Automatizadas</h4>
                            <p>Flujo completo desde la creación hasta la ejecución de campañas</p>
                            <div className="module-glow"></div>
                        </div>
                        
                        <div className="feature-module reports-module">
                            <h4>Reportes Profesionales</h4>
                            <p>Informes detallados listos para presentar a tus clientes</p>
                            <div className="module-glow"></div>
                        </div>
                    </div>
                    
                </section>

                <section id="pricing" className="pricing-section section-container">
                    <div className="pricing-header">
                        <h2 className="section-title">Planes adaptados a tu agencia</h2>
                        <p className="section-subtitle">
                            Elige el plan perfecto para llevar tu agencia al siguiente nivel
                        </p>
                    </div>
                    
                    <div className="pricing-grid">
                        <div className="pricing-card starter-plan">
                            <div className="pricing-header-card">
                                <h3 className="plan-title">Plan Freelancer</h3>
                                <div className="plan-price">
                                    <span className="price-symbol">$</span>
                                    <span className="price-amount">9.990</span>
                                    <span className="price-period">/mes</span>
                                </div>
                                <p className="price-description">Valor + IVA</p>
                            </div>
                            <div className="plan-features">
                                <ul className="features-list">
                                    <li className="feature-item">
                                        <span className="check-icon">✓</span>
                                        <span>Hasta 3 clientes</span>
                                    </li>
                                    <li className="feature-item">
                                        <span className="check-icon">✓</span>
                                        <span>1 usuario</span>
                                    </li>
                                    <li className="feature-item">
                                        <span className="check-icon">✓</span>
                                        <span>Reportes</span>
                                    </li>
                                    <li className="feature-item">
                                        <span className="check-icon">✓</span>
                                        <span>Soporte por mail</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="plan-action">
                                <a href="http://localhost:5173/register" className="btn-pricing btn-secondary">Comenzar</a>
                            </div>
                        </div>

                        <div className="pricing-card pro-plan">
                            <div className="popular-badge">
                                <span>Más Popular</span>
                            </div>
                            <div className="pricing-header-card">
                                <h3 className="plan-title">Plan Agencia</h3>
                                <div className="plan-price">
                                    <span className="price-symbol">$</span>
                                    <span className="price-amount">49.990</span>
                                    <span className="price-period">/mes</span>
                                </div>
                                <p className="price-description">Valor + IVA</p>
                            </div>
                            <div className="plan-features">
                                <ul className="features-list">
                                    <li className="feature-item">
                                        <span className="check-icon">✓</span>
                                        <span>Clientes ilimitados</span>
                                    </li>
                                    <li className="feature-item">
                                        <span className="check-icon">✓</span>
                                        <span>IA avanzada</span>
                                    </li>
                                    <li className="feature-item">
                                        <span className="check-icon">✓</span>
                                        <span>Analytics en tiempo real</span>
                                    </li>
                                    <li className="feature-item">
                                        <span className="check-icon">✓</span>
                                        <span>Soporte prioritario 24/7</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="plan-action">
                                <a href="http://localhost:5173/register" className="btn-pricing btn-primary">Comenzar</a>
                            </div>
                        </div>

                        <div className="pricing-card enterprise-plan">
                            <div className="pricing-header-card">
                                <h3 className="plan-title">Plan Empresa</h3>
                                <div className="plan-price">
                                    <span className="price-symbol">Personalizado</span>
                                </div>
                                <p className="price-description">Para grandes agencias</p>
                            </div>
                            <div className="plan-features">
                                <ul className="features-list">
                                    <li className="feature-item">
                                        <span className="check-icon">✓</span>
                                        <span>Usuarios ilimitados</span>
                                    </li>
                                    <li className="feature-item">
                                        <span className="check-icon">✓</span>
                                        <span>IA avanzada</span>
                                    </li>
                                    <li className="feature-item">
                                        <span className="check-icon">✓</span>
                                        <span>Integración completa</span>
                                    </li>
                                    <li className="feature-item">
                                        <span className="check-icon">✓</span>
                                        <span>API dedicada</span>
                                    </li>
                                    <li className="feature-item">
                                        <span className="check-icon">✓</span>
                                        <span>Gerente de cuenta</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="plan-action">
                                <a
                                    href="#final-cta"
                                    className="btn-pricing btn-outline"
                                    onClick={(e) => { e.preventDefault(); document.getElementById('final-cta')?.scrollIntoView({ behavior: 'smooth' }); }}
                                >
                                    Contactar
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
                
                <section id="final-cta" className="final-cta-section">
                    <div className="final-cta-container">
                        <div className="final-cta-content">
                            <div className="cta-badge">
                                <span style={{ color: '#ffffff' }}>Únete a la Revolución Publicitaria</span>
                            </div>
                            <h2 className="final-cta-title">
                                Transforma tu Agencia en <span className="highlight">24 Horas</span>
                            </h2>
                            <p className="final-cta-subtitle">
                                Más de 500 agencias ya confían en PautaPro para automatizar sus procesos,
                                optimizar campañas y maximizar resultados. ¿Estás listo para ser el siguiente?
                            </p>
                            <div className="cta-stats">
                                <div className="stat-item">
                                    <span className="stat-number">500+</span>
                                    <span className="stat-label">Agencias Activas</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-number">$2.5B</span>
                                    <span className="stat-label">Inversión Gestionada</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-number">98%</span>
                                    <span className="stat-label">Satisfacción</span>
                                </div>
                            </div>
                            <div className="cta-trust">
                                <span className="trust-text">Sin tarjeta de crédito • Configuración en 5 minutos • Soporte 24/7</span>
                            </div>
                        </div>
                        <div className="final-cta-visual">
                            <div
                                className="contact-form-card"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '16px',
                                    padding: '22px',
                                    backdropFilter: 'blur(10px)',
                                    width: '100%',
                                    maxWidth: '460px'
                                }}
                            >
                                <h3
                                    className="contact-form-title"
                                    style={{ color: '#ffffff', fontSize: '1.5rem', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.02em' }}
                                >
                                    Contáctanos
                                </h3>

                                <form
                                    className="contact-form"
                                    onSubmit={(e) => { e.preventDefault(); alert('Gracias, te contactaremos en breve.'); }}
                                    style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
                                >
                                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <div className="form-group">
                                            <label style={{ color: '#ffffff', fontSize: '0.9rem', marginBottom: '6px', display: 'block' }}>Nombre</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Tu nombre"
                                                style={{
                                                    width: '100%',
                                                    padding: '12px 14px',
                                                    borderRadius: '10px',
                                                    background: 'rgba(255,255,255,0.08)',
                                                    border: '1px solid rgba(255,255,255,0.2)',
                                                    color: '#ffffff',
                                                    outline: 'none'
                                                }}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label style={{ color: '#ffffff', fontSize: '0.9rem', marginBottom: '6px', display: 'block' }}>Email</label>
                                            <input
                                                type="email"
                                                required
                                                placeholder="tu@correo.com"
                                                style={{
                                                    width: '100%',
                                                    padding: '12px 14px',
                                                    borderRadius: '10px',
                                                    background: 'rgba(255,255,255,0.08)',
                                                    border: '1px solid rgba(255,255,255,0.2)',
                                                    color: '#ffffff',
                                                    outline: 'none'
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <div className="form-group">
                                            <label style={{ color: '#ffffff', fontSize: '0.9rem', marginBottom: '6px', display: 'block' }}>Teléfono (opcional)</label>
                                            <input
                                                type="tel"
                                                placeholder="+56 9 1234 5678"
                                                style={{
                                                    width: '100%',
                                                    padding: '12px 14px',
                                                    borderRadius: '10px',
                                                    background: 'rgba(255,255,255,0.08)',
                                                    border: '1px solid rgba(255,255,255,0.2)',
                                                    color: '#ffffff',
                                                    outline: 'none'
                                                }}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label style={{ color: '#ffffff', fontSize: '0.9rem', marginBottom: '6px', display: 'block' }}>Empresa (opcional)</label>
                                            <input
                                                type="text"
                                                placeholder="Nombre de la empresa"
                                                style={{
                                                    width: '100%',
                                                    padding: '12px 14px',
                                                    borderRadius: '10px',
                                                    background: 'rgba(255,255,255,0.08)',
                                                    border: '1px solid rgba(255,255,255,0.2)',
                                                    color: '#ffffff',
                                                    outline: 'none'
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label style={{ color: '#ffffff', fontSize: '0.9rem', marginBottom: '6px', display: 'block' }}>Mensaje</label>
                                        <textarea
                                            rows="4"
                                            required
                                            placeholder="Cuéntanos brevemente qué necesitas…"
                                            style={{
                                                width: '100%',
                                                padding: '12px 14px',
                                                borderRadius: '10px',
                                                background: 'rgba(255,255,255,0.08)',
                                                border: '1px solid rgba(255,255,255,0.2)',
                                                color: '#ffffff',
                                                outline: 'none',
                                                resize: 'vertical'
                                            }}
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        className="cta-primary-btn"
                                        style={{ width: '100%', justifyContent: 'center' }}
                                    >
                                        Enviar
                                    </button>

                                    <div className="form-legal" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', textAlign: 'center' }}>
                                        Sin spam. Respuesta en menos de 24 horas.
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div className="cta-background-pattern"></div>
                </section>
            </main>

            <footer className="enhanced-footer">
                <div className="footer-container">
                    <div className="footer-main">
                        <div className="footer-brand">
                            <div className="footer-logo">
                                <span className="brand-text">PautaPro</span>
                            </div>
                            <p className="footer-tagline" style={{ color: '#ffffff' }}>
                                La plataforma todo-en-uno para agencias de publicidad modernas.
                                Automatiza, analiza y escala tu negocio.
                            </p>
                        </div>

                        <div className="footer-links-grid">
                            <div className="footer-section">
                                <h4>Producto</h4>
                                <ul>
                                    <li><Link to="/features">Características</Link></li>
                                    <li><a href="#pricing" onClick={(e) => { e.preventDefault(); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); }}>Precios</a></li>
                                    <li><Link to="/integrations">Integraciones</Link></li>
                                    <li><Link to="/api">API</Link></li>
                                </ul>
                            </div>

                            <div className="footer-section">
                                <h4>Empresa</h4>
                                <ul>
                                    <li><Link to="/about">Nosotros</Link></li>
                                    <li><Link to="/careers">Carreras</Link></li>
                                    <li><Link to="/press">Prensa</Link></li>
                                    <li><a href="#final-cta" onClick={(e) => { e.preventDefault(); document.getElementById('final-cta')?.scrollIntoView({ behavior: 'smooth' }); }}>Contacto</a></li>
                                </ul>
                            </div>

                            <div className="footer-section">
                                <h4>Recursos</h4>
                                <ul>
                                    <li><Link to="/blog">Blog</Link></li>
                                    <li><Link to="/help">Centro de Ayuda</Link></li>
                                    <li><Link to="/guides">Guías</Link></li>
                                    <li><Link to="/webinars">Webinars</Link></li>
                                </ul>
                            </div>

                            <div className="footer-section">
                                <h4>Legal</h4>
                                <ul>
                                    <li><Link to="/privacy">Privacidad</Link></li>
                                    <li><Link to="/terms">Términos</Link></li>
                                    <li><Link to="/security">Seguridad</Link></li>
                                    <li><Link to="/compliance">Cumplimiento</Link></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="footer-bottom">
                        <div className="footer-bottom-content">
                            <p className="copyright">
                                © {new Date().getFullYear()} PautaPro. Todos los derechos reservados.
                            </p>
                            <div className="footer-badges">
                                <span className="badge">🔒 SOC 2 Compliant</span>
                                <span className="badge">🇨🇱 Hecho en Chile</span>
                                <span className="badge">🌎 Disponible Global</span>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;