const API_BASE = '/api/admin';
let currentPage = 1;
let currentLimit = 20;

function escHtml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

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
  // Clear existing rows safely
  while (tbody.firstChild) tbody.removeChild(tbody.firstChild);

  if (!borrows || borrows.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.setAttribute('colspan', '8');
    td.textContent = 'No borrows found';
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  borrows.forEach(borrow => {
    const borrowedAt = new Date(borrow.borrowed_at).toLocaleDateString();
    const dueDate = borrow.due_date ? new Date(borrow.due_date).toLocaleDateString() : '-';
    const returnedAt = borrow.returned_at ? new Date(borrow.returned_at).toLocaleDateString() : '-';
    const status = escHtml(borrow.status);

    const tr = document.createElement('tr');

    [borrow.id, borrow.user_email, borrow.book_title, borrowedAt, dueDate, returnedAt].forEach(val => {
      const td = document.createElement('td');
      td.textContent = val == null ? '' : val;
      tr.appendChild(td);
    });

    // Status cell
    const statusTd = document.createElement('td');
    const statusSpan = document.createElement('span');
    statusSpan.className = 'status-badge ' + status;
    statusSpan.textContent = borrow.status || '';
    statusTd.appendChild(statusSpan);
    tr.appendChild(statusTd);

    // Actions cell
    const actionTd = document.createElement('td');

    const viewBtn = document.createElement('button');
    viewBtn.className = 'btn btn-small';
    viewBtn.textContent = 'View';
    viewBtn.addEventListener('click', () => viewBorrowDetails(borrow.id));
    actionTd.appendChild(viewBtn);

    if (borrow.status === 'active') {
      const extendBtn = document.createElement('button');
      extendBtn.className = 'btn btn-small';
      extendBtn.textContent = 'Extend';
      extendBtn.addEventListener('click', () => openUpdateDueDateModal(borrow.id));
      actionTd.appendChild(extendBtn);

      const returnedBtn = document.createElement('button');
      returnedBtn.className = 'btn btn-small';
      returnedBtn.textContent = 'Returned';
      returnedBtn.addEventListener('click', () => markAsReturned(borrow.id));
      actionTd.appendChild(returnedBtn);
    }

    tr.appendChild(actionTd);
    tbody.appendChild(tr);
  });
}

function renderPagination(pagination, callback) {
  const container = document.getElementById('pagination');
  // Clear safely
  while (container.firstChild) container.removeChild(container.firstChild);

  if (pagination.pages <= 1) return;

  for (let i = 1; i <= pagination.pages; i++) {
    const btn = document.createElement('button');
    btn.className = 'page-btn' + (i === pagination.page ? ' active' : '');
    btn.textContent = i;
    btn.addEventListener('click', () => searchBorrows(i));
    container.appendChild(btn);
  }
}

async function viewBorrowDetails(borrowId) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/borrows/${borrowId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Failed to fetch borrow details');

    const borrow = await response.json();
    const content = document.getElementById('borrowDetailsContent');
    // Clear safely
    while (content.firstChild) content.removeChild(content.firstChild);

    const fields = [
      ['ID', borrow.id],
      ['User Email', borrow.user_email],
      ['Book Title', borrow.book_title],
      ['Borrowed At', borrow.borrowed_at ? new Date(borrow.borrowed_at).toLocaleString() : '-'],
      ['Due Date', borrow.due_date ? new Date(borrow.due_date).toLocaleString() : '-'],
      ['Returned At', borrow.returned_at ? new Date(borrow.returned_at).toLocaleString() : '-'],
    ];

    fields.forEach(([label, value]) => {
      const div = document.createElement('div');
      div.className = 'detail-item';
      const strong = document.createElement('strong');
      strong.textContent = label + ': ';
      div.appendChild(strong);
      div.appendChild(document.createTextNode(value == null ? '' : value));
      content.appendChild(div);
    });

    // Status field with badge
    const statusDiv = document.createElement('div');
    statusDiv.className = 'detail-item';
    const statusStrong = document.createElement('strong');
    statusStrong.textContent = 'Status: ';
    statusDiv.appendChild(statusStrong);
    const statusSpan = document.createElement('span');
    statusSpan.className = 'status-badge ' + escHtml(borrow.status);
    statusSpan.textContent = borrow.status || '';
    statusDiv.appendChild(statusSpan);
    content.appendChild(statusDiv);

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

  document.getElementById('search-borrows-btn').addEventListener('click', () => searchBorrows());
  document.getElementById('close-borrow-details-x').addEventListener('click', closeBorrowDetailsModal);
  document.getElementById('close-borrow-details-btn').addEventListener('click', closeBorrowDetailsModal);
  document.getElementById('close-update-due-x').addEventListener('click', closeUpdateDueDateModal);
  document.getElementById('submit-update-due-btn').addEventListener('click', submitUpdateDueDate);
  document.getElementById('cancel-update-due-btn').addEventListener('click', closeUpdateDueDateModal);
});
