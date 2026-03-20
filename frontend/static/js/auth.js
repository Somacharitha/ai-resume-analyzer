const API_URL = 'http://localhost:5000/api';

async function handleSignup(name, email, password) {
    try {
        const response = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json();
        
        if (response.ok) {
            return { success: true };
        } else {
            console.error('Signup error:', data.message);
            return { success: false, message: data.message };
        }
    } catch (error) {
        console.error('Error during signup:', error);
        return { success: false, message: 'Network or server error' };
    }
}

async function handleLogin(email, password) {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        
        if (response.ok) {
            // Store JWT token and user info in localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            return true;
        } else {
            console.error('Login error:', data.message);
            return false;
        }
    } catch (error) {
        console.error('Error during login:', error);
        return false;
    }
}

function getToken() {
    return localStorage.getItem('token');
}

function isAuthenticated() {
    return !!getToken();
}

// Redirect if not authenticated (use on protected pages)
function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
    }
}
