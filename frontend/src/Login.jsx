import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login({ setToken }) {
  const [usuario, setUsuario] = useState(''); // <-- CAMBIADO
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navegar = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const respuesta = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, password }) // <-- CAMBIADO
      });

      const datos = await respuesta.json();

      if (respuesta.ok) {
        localStorage.setItem('token', datos.token);
        setToken(datos.token);
        navegar('/');
      } else {
        setError(datos.mensaje);
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw', background: '#0D1117', position: 'absolute', top: 0, left: 0, zIndex: 1000, fontFamily: 'sans-serif' }}>
      <div style={{ background: '#1A202C', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', width: '100%', maxWidth: '400px', border: '1px solid #2D3748' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔐</div>
          <h2 style={{ color: 'white', margin: 0, fontSize: '28px' }}>Panel de Gestión</h2>
          <p style={{ color: '#A0AEC0', marginTop: '10px', fontSize: '15px' }}>Inicia sesión para continuar:</p>
        </div>
        
        {error && (
          <div style={{ background: 'rgba(229, 62, 62, 0.2)', color: '#FC8181', padding: '12px', borderRadius: '6px', marginBottom: '20px', textAlign: 'center', border: '1px solid #E53E3E' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            {/* CAMBIADO: Etiqueta y Placeholder */}
            <label style={{ display: 'block', marginBottom: '8px', color: '#E2E8F0', fontWeight: '500', fontSize: '14px' }}>Nombre de Usuario</label>
            <input 
              type="text" 
              value={usuario} 
              onChange={(e) => setUsuario(e.target.value)} 
              required 
              style={{ width: '100%', padding: '14px', borderRadius: '6px', border: '1px solid #4A5568', background: '#0D1117', color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#E2E8F0', fontWeight: '500', fontSize: '14px' }}>Contraseña</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={{ width: '100%', padding: '14px', borderRadius: '6px', border: '1px solid #4A5568', background: '#0D1117', color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          
          <button type="submit" style={{ background: '#00D1A0', color: '#0D1117', padding: '14px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', marginTop: '10px', boxShadow: '0 4px 6px rgba(0, 209, 160, 0.2)' }}>
            Acceder al Sistema
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;