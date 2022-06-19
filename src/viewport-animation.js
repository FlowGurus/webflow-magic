(() => {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('is-in-viewport');
      else entry.target.classList.remove('is-in-viewport');
    });
  });
  window.addEventListener('DOMContentLoaded', (event) => {
    document.querySelectorAll('[class^="text-magic-"]').forEach(el => observer.observe(el));
    document.querySelectorAll('[class^="ani-magic-"]').forEach(el => observer.observe(el));
  });
})();
  