import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import './Login.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

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
      case 'name':
        if (!value) {
          error = 'El nombre es requerido';
        } else if (value.length < 3) {
          error = 'El nombre debe tener al menos 3 caracteres';
        }
        break;
        
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) {
          error = 'El correo electrónico es requerido';
        } else if (!emailRegex.test(value)) {
          error = 'Por favor ingresa un correo electrónico válido';
        }
        break;
        
      case 'password':
        if (!value) {
          error = 'La contraseña es requerida';
        } else if (value.length < 6) {
          error = 'La contraseña debe tener al menos 6 caracteres';
        }
        break;
        
      case 'confirmPassword':
        if (!value) {
          error = 'Por favor confirma tu contraseña';
        } else if (value !== formData.password) {
          error = 'Las contraseñas no coinciden';
        }
        break;
        
      case 'acceptTerms':
        if (!value) {
          error = 'Debes aceptar los términos y condiciones';
        }
        break;
        
      default:
        break;
    }
    
    return error;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
      const error = validateField(name, type === 'checkbox' ? checked : value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value, type, checked } = e.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    const error = validateField(name, type === 'checkbox' ? checked : value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched({
        name: true,
        email: true,
        password: true,
        confirmPassword: true,
        acceptTerms: true
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const user = await authService.register(formData.name, formData.email, formData.password);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setErrors({
        submit: error.message || 'Error al crear la cuenta. Por favor intenta nuevamente.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

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
            <span role="img" aria-label="user-plus">✨</span>
            Únete a la revolución publicitaria
          </div>

          {/* Título */}
          <h1 className="hero-title">
            <span className="hero-highlight">Crea tu cuenta</span>
          </h1>

          {/* Descripción */}
          <p className="hero-description">
            Comienza a optimizar tus campañas y hacer crecer tu agencia con PautaPro.
          </p>

          {/* Formulario de Registro */}
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
                  type="text"
                  name="name"
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  placeholder="Nombre completo"
                  value={formData.name}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  disabled={isLoading}
                />
                <i className="fas fa-user input-icon"></i>
                {errors.name && (
                  <div className="error-message">
                    <i className="fas fa-exclamation-circle"></i>
                    {errors.name}
                  </div>
                )}
              </div>

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

              <div className="form-group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="Contraseña"
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  disabled={isLoading}
                />
                <i className="fas fa-lock input-icon"></i>
                <button
                  type="button"
                  className="input-toggle"
                  onClick={togglePasswordVisibility}
                  disabled={isLoading}
                >
                  <i className={`fas fa-${showPassword ? 'eye-slash' : 'eye'}`}></i>
                </button>
                {errors.password && (
                  <div className="error-message">
                    <i className="fas fa-exclamation-circle"></i>
                    {errors.password}
                  </div>
                )}
              </div>

              <div className="form-group">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="Confirmar contraseña"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  disabled={isLoading}
                />
                <i className="fas fa-lock input-icon"></i>
                <button
                  type="button"
                  className="input-toggle"
                  onClick={toggleConfirmPasswordVisibility}
                  disabled={isLoading}
                >
                  <i className={`fas fa-${showConfirmPassword ? 'eye-slash' : 'eye'}`}></i>
                </button>
                {errors.confirmPassword && (
                  <div className="error-message">
                    <i className="fas fa-exclamation-circle"></i>
                    {errors.confirmPassword}
                  </div>
                )}
              </div>

              <div className="form-options">
                <label className="remember-me">
                  <input
                    type="checkbox"
                    name="acceptTerms"
                    className="checkbox-input"
                    checked={formData.acceptTerms}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    disabled={isLoading}
                  />
                  <span className="checkbox-label">
                    Acepto los <Link to="/terms" className="forgot-link">términos y condiciones</Link>
                  </span>
                </label>
              </div>

              {errors.acceptTerms && (
                <div className="error-message">
                  <i className="fas fa-exclamation-circle"></i>
                  {errors.acceptTerms}
                </div>
              )}

              <button
                type="submit"
                className={`submit-btn ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                <span className="btn-text">
                  {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
                </span>
                <div className="spinner"></div>
              </button>
            </form>

            <div className="signup-link">
              <span className="signup-text">
                ¿Ya tienes una cuenta?{' '}
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

export default Register;