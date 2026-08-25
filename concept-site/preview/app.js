document.querySelector('.menu')?.addEventListener('click',()=>document.querySelector('nav')?.classList.toggle('open'));
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in')}),{threshold:.08});document.querySelectorAll('section').forEach(e=>io.observe(e));
const archiveSearch=document.querySelector('#archive-search');
if(archiveSearch){const items=[...document.querySelectorAll('.archive-list a')];archiveSearch.addEventListener('input',()=>{const query=archiveSearch.value.trim().toLowerCase();items.forEach(item=>{item.hidden=!!query&&!item.dataset.search.includes(query)});document.querySelectorAll('.archive-group').forEach(group=>{group.hidden=!group.querySelector('.archive-list a:not([hidden])')})})}
