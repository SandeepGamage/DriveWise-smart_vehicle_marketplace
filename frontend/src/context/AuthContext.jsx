import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('drivewise_user') || 'null');
        } catch {
            return null;
        }
    });
    const [token, setToken] = useState(() => localStorage.getItem('drivewise_token'));

    const login = (newUser, newToken) => {
        localStorage.setItem('drivewise_token', newToken);
        localStorage.setItem('drivewise_user', JSON.stringify(newUser));
        setUser(newUser);
        setToken(newToken);
    };

    const logout = () => {
        localStorage.removeItem('drivewise_token');
        localStorage.removeItem('drivewise_user');
        setUser(null);
        setToken(null);
    };

    const refreshUser = (nextUser) => {
        localStorage.setItem('drivewise_user', JSON.stringify(nextUser));
        setUser(nextUser);
    };

    useEffect(() => {
        const handleStorageChange = () => {
            try {
                setUser(JSON.parse(localStorage.getItem('drivewise_user') || 'null'));
                setToken(localStorage.getItem('drivewise_token'));
            } catch {
                setUser(null);
                setToken(null);
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
