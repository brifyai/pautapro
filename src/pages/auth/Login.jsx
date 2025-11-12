import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const [scrolled, setScrolled] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      navigate(from, { replace: true });
    }
  }, [navigate, from]);

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
          error = 'Email is required';
        } else if (!emailRegex.test(value)) {
          error = 'Please enter a valid email';
        }
        break;
        
      case 'password':
        if (!value) {
          error = 'Password is required';
        } else if (value.length < 6) {
          error = 'Password must be at least 6 characters';
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
      if (key !== 'rememberMe') {
        const error = validateField(key, formData[key]);
        if (error) {
          newErrors[key] = error;
        }
      }
    });
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched({
        email: true,
        password: true
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const user = await authService.login(formData.email, formData.password);
      localStorage.setItem('user', JSON.stringify(user));
      if (formData.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
      navigate(from, { replace: true });
    } catch (error) {
      setErrors({
        submit: error.message || 'Login failed. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    // Implement social login logic here
    console.log(`Login with ${provider}`);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-page">
      {/* Header siguiendo el estilo de la página principal */}
      <header className={`startup-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <Link to="/" className="brand-link">
            <div className="navbar-brand">
              <span className="brand-text">PautaPro</span>
            </div>
          </Link>
          <nav className="nav-links">
            <Link to="/" className="nav-link">Inicio</Link>
            <Link to="/register" className="nav-btn nav-btn-secondary">Registrarse</Link>
            <a href="http://localhost:5173/register" className="nav-btn nav-btn-primary">
              <span>Iniciar Sesión</span>
            </a>
          </nav>
        </div>
      </header>

      {/* Sección principal centrada */}
      <main className="login-hero-section section-container">
        <div className="login-content">
          {/* Badge */}
          <div className="hero-badge">
            <span role="img" aria-label="lock">🔒</span>
            Acceso seguro a tu cuenta
          </div>

          {/* Título */}
          <h1 className="hero-title">
            <span className="hero-highlight">Bienvenido de vuelta</span>
          </h1>

          {/* Descripción */}
          <p className="hero-description">
            Ingresa tus credenciales para acceder a tu dashboard y continuar optimizando tus campañas publicitarias.
          </p>

          {/* Formulario de Login */}
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

              <div className="form-options">
                <label className="remember-me">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    className="checkbox-input"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                  <span className="checkbox-label">Recordar sesión</span>
                </label>
                
                <Link to="/forgot-password" className="forgot-link">
                  ¿No recuerdas tu contraseña?
                </Link>
              </div>

              <button
                type="submit"
                className={`submit-btn ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                <span className="btn-text">
                  {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                </span>
                <div className="spinner"></div>
              </button>
            </form>

            <div className="signup-link">
              <span className="signup-text">
                ¿Nuevo en PautaPro?{' '}
                <Link to="/register">
                  Crear Cuenta
                </Link>
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;