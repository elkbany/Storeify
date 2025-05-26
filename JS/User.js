function updateProfile() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('Please log in to update your profile!');
        window.location.href = 'Login.html';
        return;
    }

    const firstName = document.getElementById('first-name').value;
    const lastName = document.getElementById('last-name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const company = document.getElementById('company').value;
    const jobTitle = document.getElementById('job-title').value;
    const bio = document.getElementById('bio').value;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.email === currentUser.email);
    if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], name: `${firstName} ${lastName}`, email, phone, company, jobTitle, bio };
        localStorage.setItem('users', JSON.stringify(users));
        sessionStorage.setItem('currentUser', JSON.stringify(users[userIndex]));
        alert('Profile updated successfully!');
        initializeProfile();
    }
}

function updatePassword() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('Please log in to update your password!');
        window.location.href = 'Login.html';
        return;
    }

    const oldPassword = document.getElementById('old-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (oldPassword !== currentUser.password) {
        alert('Old password is incorrect!');
        return;
    }

    if (newPassword !== confirmPassword) {
        alert('New passwords do not match!');
        return;
    }

    const passwordRegex = /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*()_+\-=\[\]{};:|\\,.<>\/?]).{6,}$/;
    if (!passwordRegex.test(newPassword)) {
        alert('New password must be at least 6 characters long and include a number, uppercase letter, lowercase letter, and special character!');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.email === currentUser.email);
    if (userIndex !== -1) {
        users[userIndex].password = newPassword;
        localStorage.setItem('users', JSON.stringify(users));
        sessionStorage.setItem('currentUser', JSON.stringify(users[userIndex]));
        alert('Password updated successfully!');
    }
}

function initializeProfile() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const authLink = document.getElementById('auth-link');
    const profileName = document.getElementById('profile-name');
    const firstNameInput = document.getElementById('first-name');
    const lastNameInput = document.getElementById('last-name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const companyInput = document.getElementById('company');
    const jobTitleInput = document.getElementById('job-title');
    const bioInput = document.getElementById('bio');

    if (currentUser) {
        authLink.textContent = 'Logout';
        authLink.href = '#';
        authLink.onclick = function() {
            const cartKey = `cart_${currentUser.email}`;
            localStorage.removeItem(cartKey); // Clear user-specific cart
            sessionStorage.removeItem('currentUser');
            alert('Logged out successfully!');
            window.location.href = 'Login.html';
        };

        const nameParts = currentUser.name ? currentUser.name.split(' ') : ['User', ''];
        profileName.textContent = currentUser.name || currentUser.email;
        firstNameInput.value = nameParts[0] || 'First Name';
        lastNameInput.value = nameParts[1] || 'Last Name';
        emailInput.value = currentUser.email || 'first.last@gmail.com';
        phoneInput.value = currentUser.phone || '+20123456789';
        companyInput.value = currentUser.company || 'South Valley University';
        jobTitleInput.value = currentUser.jobTitle || 'Full Stack Developer';
        bioInput.value = currentUser.bio || 'Hi my name is DR/Emad';
    } else {
        authLink.textContent = 'Login';
        authLink.href = 'Login.html';
        authLink.onclick = null;
        profileName.textContent = 'Guest';
        firstNameInput.disabled = true;
        lastNameInput.disabled = true;
        emailInput.disabled = true;
        phoneInput.disabled = true;
        companyInput.disabled = true;
        jobTitleInput.disabled = true;
        bioInput.disabled = true;
    }
}

window.onload = function() {
    initializeProfile();
};