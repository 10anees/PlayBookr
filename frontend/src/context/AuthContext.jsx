import { createContext, useContext, useState, useEffect } from 'react';
import { getUser, loginUser, registerUser, logoutUser, refreshToken } from '../utils/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const userData = await getUser(token);
          setUser(userData);
          setRole(userData.role);
        } catch {
          setUser(null);
          setRole(null);
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const login = async (email, password) => {
    const { accessToken, refreshToken: rToken, user: userData } = await loginUser(email, password);
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', rToken);
    setUser(userData);
    setRole(userData.role);
  };

  const register = async (data) => {
    const { accessToken, refreshToken: rToken, user: userData } = await registerUser(data);
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', rToken);
    setUser(userData);
    setRole(userData.role);
  };

  const logout = async () => {
    await logoutUser(localStorage.getItem('accessToken'));
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setRole(null);
  };

  const refresh = async () => {
    const rToken = localStorage.getItem('refreshToken');
    if (!rToken) return;
    const { accessToken } = await refreshToken(rToken);
    localStorage.setItem('accessToken', accessToken);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, login, register, logout, refresh, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 