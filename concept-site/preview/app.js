document.querySelector('.menu')?.addEventListener('click',()=>document.querySelector('nav')?.classList.toggle('open'));
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in')}),{threshold:.08});document.querySelectorAll('section').forEach(e=>io.observe(e));
