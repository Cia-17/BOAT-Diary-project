// simple subtle entrance animation
document.addEventListener('DOMContentLoaded', () => {
  const card = document.querySelector('.card');
  card.style.transform = 'translateY(6px)';
  card.style.transition = 'transform 600ms cubic-bezier(.2,.8,.2,1), opacity 600ms';
  requestAnimationFrame(() => {
    card.style.transform = 'translateY(0)';
    card.style.opacity = '1';
  });

  // sample CTA handlers
  document.querySelectorAll('.btn').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      e.currentTarget.animate([{ transform:'translateY(0)'},{transform:'translateY(-4px)'},{transform:'translateY(0)'}], {duration:220});
    });
  });
});
