document.querySelectorAll('code').forEach(function(el) {
  el.style.cursor = 'pointer';
  el.title = 'Click to copy';
  el.addEventListener('click', function() {
    navigator.clipboard.writeText(el.textContent);
    var orig = el.style.color;
    el.style.color = '#4caf50';
    setTimeout(function() { el.style.color = orig; }, 800);
  });
});
