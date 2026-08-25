const menu=document.querySelector('.menu');
const mainNav=document.querySelector('.legacy-nav, .site-head nav');
menu?.addEventListener('click',()=>{const open=mainNav?.classList.toggle('open');menu.setAttribute('aria-expanded',String(Boolean(open)))});
document.querySelectorAll('.nav-parent').forEach((button)=>button.addEventListener('click',()=>{const group=button.closest('.nav-group');const open=group?.classList.toggle('open');button.setAttribute('aria-expanded',String(Boolean(open)))}));
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in')}),{threshold:.08});document.querySelectorAll('section').forEach(e=>io.observe(e));
const archiveSearch=document.querySelector('#archive-search');
if(archiveSearch){const items=[...document.querySelectorAll('.archive-list a')];const apply=()=>{const query=archiveSearch.value.trim().toLowerCase();items.forEach(item=>{item.hidden=!!query&&!item.dataset.search.includes(query)});document.querySelectorAll('.archive-group').forEach(group=>{group.hidden=!group.querySelector('.archive-list a:not([hidden])')})};archiveSearch.addEventListener('input',apply);const preset=new URLSearchParams(location.search).get('query');if(preset){archiveSearch.value=preset;apply()}}
