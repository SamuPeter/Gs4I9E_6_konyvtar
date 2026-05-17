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

async function searchBorrows(page = 1) {
  currentPage = page;
  const userQuery = document.getElementById('userQuery').value || '';
  const itemQuery = document.getElementById('itemQuery').value || '';
  const status = document.getElementById('statusFilter').value || '';
  const fromDate = document.getElementById('fromDate').value || '';
  const toDate = document.getElementById('toDate').value || '';

  showLoading(true);
  hideError();

  try {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams({
      page,
      limit: currentLimit
    });
    if (userQuery) params.append('user_query', userQuery);
    if (itemQuery) params.append('item_query', itemQuery);
    if (status) params.append('status', status);
    if (fromDate) params.append('from_date', new Date(fromDate).toISOString());
    if (toDate) params.append('to_date', new Date(toDate).toISOString());

    const response = await fetch(`${API_BASE}/borrows?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Failed to fetch borrows');

    const data = await response.json();
    renderBorrowsTable(data.data);
    renderPagination(data.pagination, searchBorrows);
  } catch (err) {
    showError(err.message);
  } finally {
    showLoading(false);
  }
}

function renderBorrowsTable(borrows) {
  const tbody = document.getElementById('borrowsTableBody');
  tbody.innerHTML = borrows.length ? borrows.map(borrow => {
    const borrowedAt = new Date(borrow.borrowed_at).toLocaleDateString();
    const dueDate = borrow.due_date ? new Date(borrow.due_date).toLocaleDateString() : '-';
    const returnedAt = borrow.returned_at ? new Date(borrow.returned_at).toLocaleDateString() : '-';
    return `
      <tr>
        <td>${borrow.id}</td>
        <td>${borrow.user_email}</td>
        <td>${borrow.book_title}</td>
        <td>${borrowedAt}</td>
        <td>${dueDate}</td>
        <td>${returnedAt}</td>
        <td><span class="status-badge ${borrow.status}">${borrow.status}</span></td>
        <td>
          <button onclick="viewBorrowDetails(${borrow.id})" class="btn btn-small">View</button>
          ${borrow.status === 'active' ? `
            <button onclick="openUpdateDueDateModal(${borrow.id})" class="btn btn-small">Extend</button>
            <button onclick="markAsReturned(${borrow.id})" class="btn btn-small">Returned</button>
          ` : ''}
        </td>
      </tr>
    `;
  }).join('') : '<tr><td colspan="8">No borrows found</td></tr>';
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
    html += `<button class="page-btn ${active}" onclick="searchBorrows(${i})">${i}</button>`;
  }
  container.innerHTML = html;
}

async function viewBorrowDetails(borrowId) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/borrows/${borrowId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Failed to fetch borrow details');

    const borrow = await response.json();
    const content = `
      <div class="detail-item">
        <strong>ID:</strong> ${borrow.id}
      </div>
      <div class="detail-item">
        <strong>User Email:</strong> ${borrow.user_email}
      </div>
      <div class="detail-item">
        <strong>Book Title:</strong> ${borrow.book_title}
      </div>
      <div class="detail-item">
        <strong>Borrowed At:</strong> ${new Date(borrow.borrowed_at).toLocaleString()}
      </div>
      <div class="detail-item">
        <strong>Due Date:</strong> ${borrow.due_date ? new Date(borrow.due_date).toLocaleString() : '-'}
      </div>
      <div class="detail-item">
        <strong>Returned At:</strong> ${borrow.returned_at ? new Date(borrow.returned_at).toLocaleString() : '-'}
      </div>
      <div class="detail-item">
        <strong>Status:</strong> <span class="status-badge ${borrow.status}">${borrow.status}</span>
      </div>
    `;
    document.getElementById('borrowDetailsContent').innerHTML = content;
    document.getElementById('borrowDetailsModal').style.display = 'block';
  } catch (err) {
    showError(err.message);
  }
}

function closeBorrowDetailsModal() {
  document.getElementById('borrowDetailsModal').style.display = 'none';
}

async function openUpdateDueDateModal(borrowId) {
  document.getElementById('updateBorrowId').value = borrowId;
  document.getElementById('newDueDate').value = '';
  document.getElementById('updateDueDateModal').style.display = 'block';
}

function closeUpdateDueDateModal() {
  document.getElementById('updateDueDateModal').style.display = 'none';
}

async function submitUpdateDueDate() {
  const borrowId = document.getElementById('updateBorrowId').value;
  const newDueDate = document.getElementById('newDueDate').value;

  if (!newDueDate) {
    alert('Please select a due date');
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/borrows/${borrowId}/due-date`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ due_date: new Date(newDueDate).toISOString() })
    });

    if (!response.ok) throw new Error('Failed to update due date');

    alert('Due date updated successfully');
    closeUpdateDueDateModal();
    searchBorrows(currentPage);
  } catch (err) {
    showError(err.message);
  }
}

async function markAsReturned(borrowId) {
  if (!confirm('Mark this borrow as returned?')) return;

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/borrows/${borrowId}/mark-returned`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Failed to mark as returned');

    alert('Borrow marked as returned');
    searchBorrows(currentPage);
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

// Load borrows on page load
document.addEventListener('DOMContentLoaded', () => {
  checkAdminAccess();
  searchBorrows();
});
