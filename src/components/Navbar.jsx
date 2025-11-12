import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../pages/Home/Home.css';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    // Cerrar menú automáticamente al cambiar de ruta
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location]);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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

    const scrollToSection = (sectionId) => {
        // Para páginas legales, redirigir a la home con el hash
        window.location.href = `/#${sectionId}`;
        setIsMenuOpen(false);
    };

    return (
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
                    {/* Enlaces para páginas legales: navegar entre páginas legales */}
                    {location.pathname !== '/' && (
                        <>
                            <Link to="/privacy" className="nav-link" onClick={() => setIsMenuOpen(false)}>Privacidad</Link>
                            <Link to="/terms" className="nav-link" onClick={() => setIsMenuOpen(false)}>Términos</Link>
                            <Link to="/security" className="nav-link" onClick={() => setIsMenuOpen(false)}>Seguridad</Link>
                            <Link to="/condiciones-servicio" className="nav-link" onClick={() => setIsMenuOpen(false)}>Condiciones</Link>
                        </>
                    )}
                    
                    {/* Enlaces para la página principal: navegación por scroll */}
                    {location.pathname === '/' && (
                        <>
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
                        </>
                    )}
                    
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
    );
};

export default Navbar;