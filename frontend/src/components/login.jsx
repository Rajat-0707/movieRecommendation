import React, { useState } from 'react';
import './login.css';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../apiBase';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
  if (email.trim().length < 5) {
    alert("Email must be at least 5 characters long");
    return;
  }

  if (password.length < 6) {
    alert("Password must be at least 6 characters long");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      alert("Invalid credentials");
      return;
    }

    
    const data = await res.json();

    
    localStorage.setItem("token", data.token);

    
    localStorage.setItem("user", JSON.stringify(data.user));

    
    login(data.user);

    navigate("/main");
  } catch (err) {
    console.error(err);
    alert("Server error");
  }
};


  return (
    <div className="parent-container">
      <div className="container">
        <h2 className="title">Login</h2>

        <input
          type="email"
          placeholder="Enter your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Enter your Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleLogin}>Login</button>

        <p className="switch">
          Don’t have an account?{" "}
          <button onClick={() => navigate('/signup')}>Sign Up</button>
        </p>
      </div>
    </div>
  );
}

export default Login;
