import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { authServiceSimple } from '../../services/authServiceSimple';
import { supabase } from '../../config/supabase';
import Loading from '../../components/Loading/Loading';
import 'react-toastify/dist/ReactToastify.css';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [registerData, setRegisterData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: ''
  });

  const handleError = (error) => {
    let message = 'Error al iniciar sesión';
    
    if (error.message.includes('JSON object')) {
      message = 'Usuario o contraseña incorrectos';
    } else if (error.message.includes('network')) {
      message = 'Error de conexión. Por favor, verifica tu internet';
    } else if (error.message.includes('timeout')) {
      message = 'La conexión tardó demasiado. Intenta de nuevo';
    }

    toast.error(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setIsSubmitting(true);

    try {
      const user = await authServiceSimple.login(email, password);
      localStorage.setItem('user', JSON.stringify(user));
      window.dispatchEvent(new Event('auth-change'));
      // No mantener loading en true para evitar que se quede atascado
      navigate('/dashboard', { replace: true });
    } catch (err) {
      handleError(err);
      setLoading(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const userData = {
        nombre: registerData.nombre,
        apellido: registerData.apellido,
        email: registerData.email,
        password: registerData.password,
        id_perfil: 3, // Planificador por defecto
        id_grupo: 5   // Planificación por defecto
      };

      await authServiceSimple.register(userData);
      
      toast.success('Usuario creado exitosamente', {
        position: "top-right",
        autoClose: 3000
      });
      
      setShowRegister(false);
      setRegisterData({ nombre: '', apellido: '', email: '', password: '' });
      
    } catch (err) {
      toast.error('Error al crear usuario: ' + err.message, {
        position: "top-right",
        autoClose: 5000
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="login-container">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      {loading && <Loading />}
      <div className="login-box">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px'
        }}>
          <div style={{
            fontSize: '22px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, rgb(30, 64, 175) 0%, rgb(37, 99, 235) 50%, rgb(59, 130, 246) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: '1'
          }}>PautaPro</div>
          <div style={{
            fontSize: '10px',
            color: 'rgb(100, 116, 139)',
            marginTop: '1px',
            letterSpacing: '0.5px',
            fontWeight: '500'
          }}>Gestión Publicitaria</div>
        </div>
        
        <div className="login-form">
          <h2>BIENVENIDO A PAUTAPRO</h2>
          

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

        <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="form-group checkbox">
              <label>
                <input 
                  type="checkbox" 
                  disabled={isSubmitting}
                /> Recuérdame
              </label>
            </div>

            <button 
              type="submit" 
              className={`login-button ${isSubmitting ? 'submitting' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="button-content">
                  <img src="/loading-white.gif" alt="" className="button-spinner" />
                  INGRESANDO...
                </span>
              ) : (
                'INGRESAR'
              )}
            </button>
          </form>

          {/* Botón de registro */}
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => setShowRegister(true)}
              className="register-button"
              style={{
                background: 'transparent',
                color: '#007bff',
                border: '1px solid #007bff',
                padding: '8px 16px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ¿No tienes cuenta? Regístrate aquí
            </button>
          </div>
        </div>
      </div>

      {/* Modal de registro */}
      {showRegister && (
        <div className="register-modal" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="register-modal-content" style={{
            background: 'white',
            padding: '30px',
            borderRadius: '10px',
            width: '90%',
            maxWidth: '400px'
          }}>
            <h3>Crear Nuevo Usuario</h3>
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label>Nombre</label>
                <input
                  type="text"
                  value={registerData.nombre}
                  onChange={(e) => setRegisterData({...registerData, nombre: e.target.value})}
                  required
                  style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                />
              </div>
              <div className="form-group">
                <label>Apellido</label>
                <input
                  type="text"
                  value={registerData.apellido}
                  onChange={(e) => setRegisterData({...registerData, apellido: e.target.value})}
                  required
                  style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                  required
                  style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                />
              </div>
              <div className="form-group">
                <label>Contraseña</label>
                <input
                  type="password"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                  required
                  style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowRegister(false)}
                  style={{
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  {isSubmitting ? 'Creando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;