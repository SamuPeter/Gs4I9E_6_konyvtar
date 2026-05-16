document.addEventListener('DOMContentLoaded',()=>{
  const toggles = document.querySelectorAll('[data-toggle]');
  toggles.forEach(t=>t.addEventListener('click',()=>{const target=document.querySelector(t.dataset.toggle);target.classList.toggle('hidden')}))
})
