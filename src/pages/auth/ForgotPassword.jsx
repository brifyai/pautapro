import React, { useState } from 'react';
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
  
  const navigate = useNavigate();

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
      <div className="login-container">
        <Link to="/login" className="back-to-home">
          <i className="fas fa-arrow-left"></i>
          Volver al login
        </Link>
        
        <div className="login-wrapper">
          {/* Left Side - Branding */}
          <div className="login-left">
            <div className="floating-elements">
              <div className="floating-element element-1"></div>
              <div className="floating-element element-2"></div>
              <div className="floating-element element-3"></div>
              <div className="floating-element element-4"></div>
              <div className="floating-element element-5"></div>
            </div>
            
            <div className="branding-content">
              <div className="brand-logo">
              </div>
              
              <h1 className="brand-title">
                Revisa tu correo
              </h1>
              
              <p className="brand-subtitle">
                Hemos enviado instrucciones para restablecer tu contraseña al correo electrónico proporcionado.
              </p>
              
              <div className="brand-features">
                <div className="brand-feature">
                  <div className="feature-icon">
                    <i className="fas fa-envelope"></i>
                  </div>
                  <div className="feature-text">
                    <h4>Correo Enviado</h4>
                    <p>Revisa tu bandeja de entrada</p>
                  </div>
                </div>
                
                <div className="brand-feature">
                  <div className="feature-icon">
                    <i className="fas fa-clock"></i>
                  </div>
                  <div className="feature-text">
                    <h4>Tiempo de Espera</h4>
                    <p>Puede tardar unos minutos</p>
                  </div>
                </div>
                
                <div className="brand-feature">
                  <div className="feature-icon">
                    <i className="fas fa-spam"></i>
                  </div>
                  <div className="feature-text">
                    <h4>Revisa Spam</h4>
                    <p>También revisa tu carpeta de spam</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Success Message */}
          <div className="login-right">
            <div className="login-form-container">
              <div className="login-header">
                <div className="login-logo">✓</div>
                <h2 className="login-title">Correo Enviado</h2>
                <p className="login-subtitle">
                  Te hemos enviado un enlace para restablecer tu contraseña.
                </p>
              </div>

              <div className="success-message" style={{ 
                background: 'rgba(16, 185, 129, 0.1)', 
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--spacing-md)',
                marginBottom: 'var(--spacing-lg)',
                textAlign: 'center'
              }}>
                <i className="fas fa-check-circle" style={{ 
                  color: 'var(--success-color)', 
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
                      color: 'var(--primary-color)', 
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
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <Link to="/login" className="back-to-home">
        <i className="fas fa-arrow-left"></i>
        Volver al login
      </Link>
      
      <div className="login-wrapper">
        {/* Left Side - Branding */}
        <div className="login-left">
          <div className="floating-elements">
            <div className="floating-element element-1"></div>
            <div className="floating-element element-2"></div>
            <div className="floating-element element-3"></div>
            <div className="floating-element element-4"></div>
            <div className="floating-element element-5"></div>
          </div>
          
          <div className="branding-content">
            <div className="brand-logo">
            </div>
            
            <h1 className="brand-title">
              ¿Olvidaste tu contraseña?
            </h1>
            
            <p className="brand-subtitle">
              No te preocupes, te ayudaremos a recuperarla. Solo ingresa tu correo electrónico y te enviaremos instrucciones para restablecerla.
            </p>
            
            <div className="brand-features">
              <div className="brand-feature">
                <div className="feature-icon">
                  <i className="fas fa-shield-alt"></i>
                </div>
                <div className="feature-text">
                  <h4>Seguro</h4>
                  <p>Proceso de recuperación seguro y encriptado</p>
                </div>
              </div>
              
              <div className="brand-feature">
                <div className="feature-icon">
                  <i className="fas fa-bolt"></i>
                </div>
                <div className="feature-text">
                  <h4>Rápido</h4>
                  <p>Recupera el acceso en minutos</p>
                </div>
              </div>
              
              <div className="brand-feature">
                <div className="feature-icon">
                  <i className="fas fa-life-ring"></i>
                </div>
                <div className="feature-text">
                  <h4>Soporte</h4>
                  <p>Ayuda disponible si lo necesitas</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Forgot Password Form */}
        <div className="login-right">
          <div className="login-form-container">
            <div className="login-header">
              <div className="login-logo">?</div>
              <h2 className="login-title">Restablecer Contraseña</h2>
              <p className="login-subtitle">
                Ingresa tu correo electrónico para recibir las instrucciones.
              </p>
            </div>

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
      </div>
    </div>
  );
};

export default ForgotPassword;