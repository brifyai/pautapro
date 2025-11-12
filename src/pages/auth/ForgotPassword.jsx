import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import './Login.css';

const ForgotPassword = () => {
  const [formData, setFormData] = useState({
    email: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [touched, setTouched] = useState({});
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) {
          error = 'El correo electrónico es requerido';
        } else if (!emailRegex.test(value)) {
          error = 'Por favor ingresa un correo electrónico válido';
        }
        break;
        
      default:
        break;
    }
    
    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Validate field if it has been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate email
    const emailError = validateField('email', formData.email);
    if (emailError) {
      setErrors({ email: emailError });
      setTouched({ email: true });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await authService.resetPassword(formData.email);
      setIsSubmitted(true);
    } catch (error) {
      setErrors({
        submit: error.message || 'Error al enviar el correo de recuperación. Por favor intenta nuevamente.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="login-page">
        {/* Header siguiendo el estilo de la página principal */}
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
            <nav className={`nav-links ${isMenuOpen ? 'mobile-open' : ''}`} style={{ display: 'flex !important' }}>
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
            <div className="nav-actions" style={{ display: 'flex !important' }}>
              <Link to="/login" className="nav-btn nav-btn-secondary">Iniciar Sesión</Link>
              <a href="http://localhost:5173/register" className="nav-btn nav-btn-primary">
                <span>Registrarse</span>
              </a>
            </div>
          </div>
        </header>

        {/* Sección principal centrada */}
        <main className="login-hero-section section-container">
          <div className="login-content">
            {/* Badge */}
            <div className="hero-badge">
              <span role="img" aria-label="check">✅</span>
              Correo enviado correctamente
            </div>

            {/* Título */}
            <h1 className="hero-title">
              <span className="hero-highlight">Revisa tu correo</span>
            </h1>

            {/* Descripción */}
            <p className="hero-description">
              Hemos enviado instrucciones para restablecer tu contraseña al correo electrónico proporcionado.
            </p>

            {/* Formulario de éxito */}
            <div className="login-form-container">
              <div className="success-message" style={{ 
                background: 'rgba(16, 185, 129, 0.1)', 
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--spacing-md)',
                marginBottom: 'var(--spacing-lg)',
                textAlign: 'center'
              }}>
                <i className="fas fa-check-circle" style={{ 
                  color: '#10b981', 
                  fontSize: 'var(--font-size-xl)',
                  marginBottom: 'var(--spacing-sm)'
                }}></i>
                <p style={{ 
                  color: '#ffffff !important',
                  margin: 0,
                  fontWeight: 500
                }}>
                  Enviamos las instrucciones a:<br/>
                  <strong>{formData.email}</strong>
                </p>
              </div>

              <div className="signup-link">
                <span className="signup-text">
                  ¿No recibiste el correo?{' '}
                  <button 
                    className="forgot-link" 
                    onClick={() => setIsSubmitted(false)}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: '#00D4FF', 
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    Reenviar
                  </button>
                </span>
              </div>

              <div className="signup-link">
                <span className="signup-text">
                  ¿Recordaste tu contraseña?{' '}
                  <Link to="/login">
                    Inicia sesión
                  </Link>
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="login-page">
      {/* Header siguiendo el estilo de la página principal */}
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
          <nav className={`nav-links ${isMenuOpen ? 'mobile-open' : ''}`} style={{ display: 'flex !important' }}>
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
          <div className="nav-actions" style={{ display: 'flex !important' }}>
            <Link to="/login" className="nav-btn nav-btn-secondary">Iniciar Sesión</Link>
            <a href="http://localhost:5173/register" className="nav-btn nav-btn-primary">
              <span>Registrarse</span>
            </a>
          </div>
        </div>
      </header>

      {/* Sección principal centrada */}
      <main className="login-hero-section section-container">
        <div className="login-content">
          {/* Badge */}
          <div className="hero-badge">
            <span role="img" aria-label="lock">🔒</span>
            Recuperación de contraseña segura
          </div>

          {/* Título */}
          <h1 className="hero-title">
            <span className="hero-highlight">¿Olvidaste tu contraseña?</span>
          </h1>

          {/* Descripción */}
          <p className="hero-description">
            No te preocupes, te ayudaremos a recuperarla. Solo ingresa tu correo electrónico y te enviaremos instrucciones para restablecerla.
          </p>

          {/* Formulario de recuperación */}
          <div className="login-form-container">
            <form className="login-form" onSubmit={handleSubmit}>
              {errors.submit && (
                <div className="error-message">
                  <i className="fas fa-exclamation-circle"></i>
                  {errors.submit}
                </div>
              )}

              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="Correo electrónico"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  disabled={isLoading}
                />
                <i className="fas fa-envelope input-icon"></i>
                {errors.email && (
                  <div className="error-message">
                    <i className="fas fa-exclamation-circle"></i>
                    {errors.email}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className={`submit-btn ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                <span className="btn-text">
                  {isLoading ? 'Enviando...' : 'Enviar Instrucciones'}
                </span>
                <div className="spinner"></div>
              </button>
            </form>

            <div className="signup-link">
              <span className="signup-text">
                ¿Recordaste tu contraseña?{' '}
                <Link to="/login">
                  Inicia sesión
                </Link>
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ForgotPassword;