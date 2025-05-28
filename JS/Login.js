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

function togglePassword(inputId, iconSpan) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        iconSpan.innerHTML = '<i class="fa fa-eye-slash"></i>';
    } else {
        input.type = 'password';
        iconSpan.innerHTML = '<i class="fa fa-eye"></i>';
    }
}

function handleRegister(event) {
    event.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value.trim();
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
        if (users.some(function(user) { return user.email === email; })) {
            alert('Email already registered!');
            return;
        }
        const user = { name: name, email: email, password: password, authProvider: 'email' };
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
        const user = users.find(function(u) {
            return u.email === email && u.password === password && u.authProvider === 'email';
        });
        if (user) {
            sessionStorage.setItem('currentUser', JSON.stringify(user));
            alert('Login successful! Redirecting to home page.');
            window.location.href = 'Home.html';
        } else {
            alert('Invalid email or password!');
        }
    }
}

function handleLogout() {
    sessionStorage.removeItem('currentUser');
    alert('Logged out successfully!');
    window.location.href = 'Login.html';
}

window.onload = function() {
    const currentUser = sessionStorage.getItem('currentUser');
    const greeting = document.getElementById('greeting');
    if (currentUser) {
        var user = JSON.parse(currentUser);
        greeting.style.display = 'block';
        greeting.innerHTML = 'Welcome, ' + (user.name || user.email) + '! <br><button onclick="handleLogout()">Logout</button>';
        document.getElementById('registerForm').style.display = 'none';
        document.getElementById('loginForm').style.display = 'none';
        document.querySelector('.form-toggle').style.display = 'none';
    } else {
        greeting.style.display = 'none';
    }
    document.getElementById('registerBtn').onclick = function() { switchForm('register'); };
    document.getElementById('loginBtn').onclick = function() { switchForm('login'); };
};