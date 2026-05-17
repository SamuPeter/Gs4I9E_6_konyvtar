const API_BASE = '/api/admin';
let currentPage = 1;
let currentLimit = 20;

function checkAdminAccess() {
  const token = localStorage.getItem('token');
  if (!token) { window.location.href = '/auth/login'; return; }
  try {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid token');
    const payload = parts[1];
    const padded = payload + '=='.substring(0, (4 - payload.length % 4) % 4);
    const decoded = JSON.parse(atob(padded));
    if (decoded.role !== 'admin') window.location.href = '/';
  } catch {
    window.location.href = '/auth/login';
  }
}

async function searchUsers(page = 1) {
  currentPage = page;
  const query = document.getElementById('searchQuery').value || '';
  const role = document.getElementById('roleFilter').value || '';
  const isActive = document.getElementById('statusFilter').value;

  showLoading(true);
  hideError();

  try {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams({
      query,
      page,
      limit: currentLimit
    });
    if (role) params.append('role', role);
    if (isActive !== '') params.append('is_active', isActive);

    const response = await fetch(`${API_BASE}/users?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Failed to fetch users');

    const data = await response.json();
    renderUsersTable(data.data);
    renderPagination(data.pagination, searchUsers);
  } catch (err) {
    showError(err.message);
  } finally {
    showLoading(false);
  }
}

function renderUsersTable(users) {
  const tbody = document.getElementById('usersTableBody');
  tbody.innerHTML = users.length ? users.map(user => `
    <tr>
      <td>${user.id}</td>
      <td>${user.email}</td>
      <td>${user.role}</td>
      <td>${user.is_active ? 'Active' : 'Inactive'}</td>
      <td>${new Date(user.created_at).toLocaleDateString()}</td>
      <td>
        <button onclick="openEditModal(${user.id})" class="btn btn-small">Edit</button>
        <button onclick="openResetPasswordModal(${user.id})" class="btn btn-small">Reset Pwd</button>
        <button onclick="deactivateUser(${user.id})" class="btn btn-small btn-danger">Deactivate</button>
      </td>
    </tr>
  `).join('') : '<tr><td colspan="6">No users found</td></tr>';
}

function renderPagination(pagination, callback) {
  const container = document.getElementById('pagination');
  if (pagination.pages <= 1) {
    container.innerHTML = '';
    return;
  }

  let html = '';
  for (let i = 1; i <= pagination.pages; i++) {
    const active = i === pagination.page ? 'active' : '';
    html += `<button class="page-btn ${active}" onclick="searchUsers(${i})">${i}</button>`;
  }
  container.innerHTML = html;
}

async function openEditModal(userId) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/users/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Failed to fetch user');

    const user = await response.json();
    document.getElementById('editUserId').value = user.id;
    document.getElementById('editEmail').value = user.email;
    document.getElementById('editRole').value = user.role;
    document.getElementById('editActive').checked = user.is_active;

    document.getElementById('editUserModal').style.display = 'block';
  } catch (err) {
    showError(err.message);
  }
}

function closeEditModal() {
  document.getElementById('editUserModal').style.display = 'none';
}

async function saveUserChanges() {
  const userId = document.getElementById('editUserId').value;
  const updates = {
    email: document.getElementById('editEmail').value,
    role: document.getElementById('editRole').value,
    is_active: document.getElementById('editActive').checked
  };

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) throw new Error('Failed to update user');

    alert('User updated successfully');
    closeEditModal();
    searchUsers(currentPage);
  } catch (err) {
    showError(err.message);
  }
}

async function openResetPasswordModal(userId) {
  document.getElementById('resetUserId').value = userId;
  document.getElementById('newPassword').value = '';
  document.getElementById('resetPasswordModal').style.display = 'block';
}

function closeResetModal() {
  document.getElementById('resetPasswordModal').style.display = 'none';
}

async function submitResetPassword() {
  const userId = document.getElementById('resetUserId').value;
  const newPassword = document.getElementById('newPassword').value;

  if (newPassword.length < 6) {
    alert('Password must be at least 6 characters');
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/users/${userId}/reset-password`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ new_password: newPassword })
    });

    if (!response.ok) throw new Error('Failed to reset password');

    alert('Password reset successfully');
    closeResetModal();
  } catch (err) {
    showError(err.message);
  }
}

async function deactivateUser(userId) {
  if (!confirm('Are you sure you want to deactivate this user?')) return;

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/users/${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Failed to deactivate user');

    alert('User deactivated successfully');
    searchUsers(currentPage);
  } catch (err) {
    showError(err.message);
  }
}

function showLoading(show) {
  document.getElementById('loading').style.display = show ? 'block' : 'none';
}

function showError(message) {
  const errorDiv = document.getElementById('error');
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
}

function hideError() {
  document.getElementById('error').style.display = 'none';
}

function logout() {
  localStorage.removeItem('token');
  window.location.href = '/auth/login';
}

// Load users on page load
document.addEventListener('DOMContentLoaded', () => {
  checkAdminAccess();
  searchUsers();
});
