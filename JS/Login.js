function switchForm(formType) {
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    const registerBtn = document.getElementById('registerBtn');
    const loginBtn = document.getElementById('loginBtn');

    if (formType === 'register') {
        registerForm.style.display = 'block';
        loginForm.style.display = 'none';
        registerBtn.classList.add('active');
        loginBtn.classList.remove('active');
    } else {
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
        registerBtn.classList.remove('active');
        loginBtn.classList.add('active');
    }
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function handleRegister(event) {
    event.preventDefault();

    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value.trim();

    // Reset error messages
    document.getElementById('regNameError').style.display = 'none';
    document.getElementById('regEmailError').style.display = 'none';
    document.getElementById('regPasswordError').style.display = 'none';

    let isValid = true;

    if (!name) {
        document.getElementById('regNameError').style.display = 'block';
        isValid = false;
    }
    if (!validateEmail(email)) {
        document.getElementById('regEmailError').style.display = 'block';
        isValid = false;
    }
    const passwordRegex = /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*()_+\-=\[\]{};:|\\,.<>\/?]).{6,}$/;
    if (!passwordRegex.test(password)) {
        document.getElementById('regPasswordError').style.display = 'block';
        isValid = false;
    }

    if (isValid) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        if (users.some(user => user.email === email)) {
            alert('Email already registered!');
            return;
        }

        const user = { name, email, password, authProvider: 'email' };
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
        sessionStorage.setItem('currentUser', JSON.stringify(user));

        alert('Registration successful! Redirecting to home page.');
        window.location.href = 'Home.html';
    }
}

function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('logEmail').value.trim();
    const password = document.getElementById('logPassword').value.trim();

    // Reset error messages
    document.getElementById('logEmailError').style.display = 'none';
    document.getElementById('logPasswordError').style.display = 'none';

    let isValid = true;

    if (!validateEmail(email)) {
        document.getElementById('logEmailError').style.display = 'block';
        isValid = false;
    }
    if (!password) {
        document.getElementById('logPasswordError').style.display = 'block';
        isValid = false;
    }

    if (isValid) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email && u.password === password && u.authProvider === 'email');

        if (user) {
            sessionStorage.setItem('currentUser', JSON.stringify(user));
            alert('Login successful! Redirecting to home page.');
            window.location.href = 'Home.html';
        } else {
            alert('Invalid email or password!');
        }
    }
}

function handleCredentialResponse(response) {
    const userInfo = parseJwt(response.credential);
    const email = userInfo.email;
    const name = userInfo.name || userInfo.given_name || 'Google User';

    const users = JSON.parse(localStorage.getItem('users')) || [];
    let user = users.find(u => u.email === email);

    if (!user) {
        user = { name, email, authProvider: 'google' };
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
        alert('Google Sign-Up successful! Redirecting to home page.');
    } else {
        alert('Google Sign-In successful! Redirecting to home page.');
    }

    sessionStorage.setItem('currentUser', JSON.stringify(user));
    window.location.href = 'Home.html';
}

function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

function handleLogout() {
    sessionStorage.removeItem('currentUser');
    alert('Logged out successfully!');
    window.location.href = 'index.html';
}

window.onload = function() {
    const currentUser = sessionStorage.getItem('currentUser');
    if (currentUser) {
        window.location.href = 'Home.html';
    }
};