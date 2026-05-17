const apiBase = '/api/v1';

function getToken(){return localStorage.getItem('token')}
function setToken(t){if(t) localStorage.setItem('token', t); else localStorage.removeItem('token')}

function updateNavigation(){
  const token = getToken();
  const navAuth = document.getElementById('nav-auth');
  const navUser = document.getElementById('nav-user');
  const logoutBtn = document.getElementById('logout-btn');
  if(token && navUser && navAuth){
    navAuth.style.display = 'none';
    navUser.style.display = 'inline';
    if(logoutBtn) logoutBtn.addEventListener('click', (e)=>{
      e.preventDefault();
      setToken(null);
      location.href = '/';
    })
  }
}

async function apiFetch(path, opts={}){
  const headers = Object.assign({}, opts.headers || {}, {'Content-Type':'application/json'});
  const token = getToken();
  if(token) headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch(apiBase + path, Object.assign({}, opts, {headers}));
  if(!res.ok){const text = await res.text(); let msg = text; try{msg = JSON.parse(text).error || text}catch(e){}; const err = new Error(msg); err.status = res.status; throw err}
  return res.json().catch(()=>null);
}

function el(tag, attrs={}, children=[]){const e=document.createElement(tag);Object.entries(attrs).forEach(([k,v])=>{if(k==='cls') e.className=v; else if(k==='html') e.innerHTML=v; else e.setAttribute(k,v)}); (Array.isArray(children)?children:[children]).forEach(c=>{if(!c) return; if(typeof c==='string') e.appendChild(document.createTextNode(c)); else e.appendChild(c)}); return e}

async function loadBooksList(search='', availableOnly=false){
  try{
    let qs = '';
    if(search) qs += '?search=' + encodeURIComponent(search);
    if(availableOnly) qs += (qs ? '&' : '?') + 'available=1';
    const rows = await apiFetch('/books' + qs);
    const grid = document.querySelector('.grid');
    if(!grid) return;
    grid.innerHTML = '';
    if(!Array.isArray(rows) || rows.length === 0) {grid.innerHTML = '<p>No books found</p>'; return}
    rows.forEach(b=>{
      const card = el('div',{cls:'card'},[]);
      card.appendChild(el('h3',{},b.title || 'Untitled'));
      card.appendChild(el('p',{},b.author || 'Unknown'));
      const availStatus = b.available == 1 || b.available === true ? 'Available' : 'Borrowed';
      card.appendChild(el('span',{cls:'badge'},availStatus));
      const a = el('a',{href:'/books/'+b.id,cls:'button'},'View Details');
      card.appendChild(a);
      grid.appendChild(card);
    })
  }catch(err){console.error('Failed to load books:', err);}
}

async function loadBookDetails(){
  try{
    const m = location.pathname.match(/\/books\/(\d+)/);
    if(!m) return;
    const id = m[1];
    const book = await apiFetch('/books/' + id);
    if(!book) {alert('Book not found'); return}
    const main = document.querySelector('main.container');
    if(!main) return;
    main.innerHTML = '';
    const layout = el('div',{style:'display:flex;gap:24px;flex-wrap:wrap'},[]);
    const left = el('div',{cls:'card',style:'flex:1;min-width:240px'},['Cover Placeholder']);
    const rightCard = el('div',{cls:'card'},[]);
    rightCard.appendChild(el('h1',{},book.title || 'Untitled'));
    rightCard.appendChild(el('p',{},book.author || 'Unknown'));
    if(book.description) rightCard.appendChild(el('p',{},book.description));
    const isAvail = book.available == 1 || book.available === true;
    const borrowBtn = el('button',{cls:'button'}, isAvail ? 'Borrow Book' : 'Not Available');
    if(!isAvail) borrowBtn.disabled = true;
    borrowBtn.addEventListener('click', async ()=>{
      try{
        await apiFetch('/loans/' + id, {method:'POST'});
        alert('Borrowed successfully');
        location.reload();
      }catch(e){
        if(e.status===401) return location.href = '/auth/login';
        alert('Error: ' + e.message);
      }
    });
    rightCard.appendChild(borrowBtn);
    rightCard.style = 'flex:2;min-width:240px';
    layout.appendChild(left);
    layout.appendChild(rightCard);
    main.appendChild(layout);
  }catch(err){console.error('Failed to load book:', err);}
}

function wireAuthPages(){
  if(location.pathname.startsWith('/auth/login')){
    const btn = document.querySelector('button.button');
    if(!btn) {console.log('Login button not found'); return}
    btn.addEventListener('click', async (e)=>{
      e.preventDefault();
      const email = document.querySelector('input[type="email"]').value;
      const password = document.querySelector('input[type="password"]').value;
      if(!email || !password) {alert('Email and password required'); return}
      try{
        console.log('Logging in...', email);
        const res = await apiFetch('/auth/login', {method:'POST', body: JSON.stringify({email,password})});
        console.log('Login response:', res);
        if(res && res.token) {
          setToken(res.token);
          alert('Logged in!');
          location.href = '/dashboard';
        } else {
          alert('Login failed: no token in response');
        }
      }catch(e){
        console.error('Login error:', e);
        alert('Login failed: '+e.message)
      }
    })
  }
  if(location.pathname.startsWith('/auth/register')){
    const btn = document.querySelector('button.button');
    if(!btn) {console.log('Register button not found'); return}
    btn.addEventListener('click', async (e)=>{
      e.preventDefault();
      const email = document.querySelector('input[type="email"]').value;
      const passwords = document.querySelectorAll('input[type="password"]');
      const password = passwords[0].value;
      const confirmPassword = passwords[1].value;
      if(!email || !password) {alert('Email and password required'); return}
      if(password !== confirmPassword) {alert('Passwords do not match'); return}
      try{
        console.log('Registering...', email);
        await apiFetch('/auth/register', {method:'POST', body: JSON.stringify({email,password})});
        alert('Registered. Please login.');
        location.href = '/auth/login';
      }catch(e){
        console.error('Register error:', e);
        alert('Register failed: '+e.message)
      }
    })
  }
}

async function loadDashboard(){
  try{
    const result = await apiFetch('/loans/me');
    const tbody = document.querySelector('table.table tbody');
    if(!tbody) return;
    tbody.innerHTML = '';
    const rows = result && result.items ? result.items : (result ? (Array.isArray(result) ? result : []) : []);
    if(rows.length === 0) {tbody.innerHTML = '<tr><td colspan="5">No loans</td></tr>'; return}
    rows.forEach(r=>{
      const tr = el('tr',{},[]);
      tr.appendChild(el('td',{},r.title || ''));
      tr.appendChild(el('td',{},r.borrowed_at || ''));
      tr.appendChild(el('td',{},r.returned_at || '-'));
      const statusText = (r.status || 'active').charAt(0).toUpperCase() + (r.status || 'active').slice(1);
      tr.appendChild(el('td',{}, el('span',{cls:'badge'}, statusText)));
      const actionTd = el('td',{},[]);
      if(!r.returned_at || r.status === 'active'){
        const btn = el('button',{cls:'button'},'Return');
        btn.addEventListener('click', async ()=>{
          try{
            await apiFetch('/loans/' + r.id + '/return', {method:'PUT'});
            alert('Returned'); location.reload();
          }catch(e){alert('Return failed: '+e.message)}
        });
        actionTd.appendChild(btn);
      }
      tr.appendChild(actionTd);
      tbody.appendChild(tr);
    })
  }catch(e){
    if(e.status===401) return location.href='/auth/login';
    const tbody = document.querySelector('table.table tbody');
    if(tbody) tbody.innerHTML = '<tr><td colspan="5">Error loading loans: ' + e.message + '</td></tr>';
  }
}

async function loadAdminDashboard(){
  try{
    const books = await apiFetch('/books');
    const loans = await apiFetch('/loans');
    const bookCount = document.getElementById('total-books');
    const loanCount = document.getElementById('active-loans');
    if(bookCount) bookCount.textContent = Array.isArray(books) ? books.length : 0;
    const loanRows = loans && loans.items ? loans.items : (Array.isArray(loans) ? loans : []);
    if(loanCount) loanCount.textContent = loanRows.length;
  }catch(err){
    if(err.status===401) location.href='/auth/login';
  }
}

async function loadAdminBooks(){
  try{
    const rows = await apiFetch('/books');
    const tbody = document.querySelector('table.table tbody');
    if(!tbody) return;
    tbody.innerHTML = '';
    if(!Array.isArray(rows)) {tbody.innerHTML = '<tr><td colspan="4">Error loading books</td></tr>'; return}
    rows.forEach(b=>{
      const tr = el('tr',{},[]);
      tr.appendChild(el('td',{},b.title || ''));
      tr.appendChild(el('td',{},b.author || ''));
      tr.appendChild(el('td',{},b.available == 1 || b.available === true ? 'Available' : 'Borrowed'));
      const actionTd = el('td',{},[]);
      const editBtn = el('button',{cls:'button'},'Edit');
      editBtn.addEventListener('click', ()=>{ alert('Edit not implemented yet') });
      const delBtn = el('button',{cls:'button'},'Delete');
      delBtn.addEventListener('click', async ()=>{
        if(!confirm('Delete this book?')) return;
        try{
          await apiFetch('/books/' + b.id, {method:'DELETE'});
          alert('Deleted'); location.reload();
        }catch(e){alert('Delete failed: '+e.message)}
      });
      actionTd.appendChild(editBtn);
      actionTd.appendChild(document.createTextNode(' '));
      actionTd.appendChild(delBtn);
      tr.appendChild(actionTd);
      tbody.appendChild(tr);
    })
  }catch(err){
    if(err.status===401) location.href='/auth/login';
  }
}

async function loadAdminLoans(){
  try{
    const result = await apiFetch('/loans');
    const tbody = document.querySelector('table.table tbody');
    if(!tbody) return;
    tbody.innerHTML = '';
    const rows = result && result.items ? result.items : (Array.isArray(result) ? result : []);
    if(rows.length === 0) {tbody.innerHTML = '<tr><td colspan="5">No loans</td></tr>'; return}
    rows.forEach(r=>{
      const tr = el('tr',{},[]);
      tr.appendChild(el('td',{},r.user_email || r.email || 'Unknown'));
      tr.appendChild(el('td',{},r.title || ''));
      tr.appendChild(el('td',{},r.borrowed_at || ''));
      tr.appendChild(el('td',{},r.returned_at || '-'));
      tr.appendChild(el('td',{},r.status || 'active'));
      tbody.appendChild(tr);
    })
  }catch(err){
    if(err.status===401) location.href='/auth/login';
  }
}

// Initialize
document.addEventListener('DOMContentLoaded',()=>{
  updateNavigation();
  const toggles = document.querySelectorAll('[data-toggle]');
  toggles.forEach(t=>t.addEventListener('click',()=>{const target=document.querySelector(t.dataset.toggle);if(target)target.classList.toggle('hidden')}));
  if(location.pathname === '/' || location.pathname === '/index.html') loadBooksList();
  if(location.pathname === '/books'){
    const searchInput = document.querySelector('input.input');
    const availableCheckbox = document.querySelector('input[type="checkbox"]');
    const reloadBooks = ()=>{
      const search = searchInput ? searchInput.value.trim() : '';
      const availableOnly = availableCheckbox ? availableCheckbox.checked : false;
      loadBooksList(search, availableOnly);
    };
    loadBooksList();
    let searchTimeout;
    if(searchInput) searchInput.addEventListener('input', ()=>{ clearTimeout(searchTimeout); searchTimeout = setTimeout(reloadBooks, 300); });
    if(availableCheckbox) availableCheckbox.addEventListener('change', reloadBooks);
  }
  if(location.pathname.match(/^\/books\/\d+/)) loadBookDetails();
  wireAuthPages();
  if(location.pathname === '/dashboard') loadDashboard();
  if(location.pathname === '/admin' || location.pathname === '/admin/') loadAdminDashboard();
  if(location.pathname === '/admin/books') loadAdminBooks();
  if(location.pathname === '/admin/loans') loadAdminLoans();
});
