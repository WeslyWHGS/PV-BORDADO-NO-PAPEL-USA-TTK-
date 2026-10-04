// The Paper Atelier — page interactions
// FAQ accordion, "who it's for" tabs, catalog carousel,
// and the scroll-reveal animation.

document.addEventListener('DOMContentLoaded', function () {

  // FAQ accordion
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var btn = item.querySelector('.faq-q');
    btn.addEventListener('click', function () {
      var open = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(function (i) { i.classList.remove('open'); });
      if (!open) item.classList.add('open');
    });
  });

  // Who it's for — tabs
  document.querySelectorAll('.who-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      var target = tab.dataset.target;

      document.querySelectorAll('.who-tab').forEach(function (t) {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');

      document.querySelectorAll('.who-panel').forEach(function (p) { p.classList.remove('is-active'); });
      var panel = document.getElementById(target);
      if (panel) panel.classList.add('is-active');
    });
  });

  // Catalog carousel — horizontal scroll with arrow controls
  (function () {
    var track = document.querySelector('.catalog-track');
    var prev = document.querySelector('.catalog-prev');
    var next = document.querySelector('.catalog-next');
    if (!track || !prev || !next) return;

    function scrollByCard(dir) {
      var card = track.querySelector('.catalog-card');
      if (!card) return;
      var cardWidth = card.getBoundingClientRect().width;
      var gap = parseFloat(getComputedStyle(track).gap) || 24;
      track.scrollBy({ left: dir * (cardWidth + gap), behavior: 'smooth' });
    }
    prev.addEventListener('click', function () { scrollByCard(-1); });
    next.addEventListener('click', function () { scrollByCard(1); });

    function updateArrows() {
      var maxScroll = track.scrollWidth - track.clientWidth - 4;
      prev.toggleAttribute('disabled', track.scrollLeft <= 4);
      next.toggleAttribute('disabled', track.scrollLeft >= maxScroll);
    }
    track.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    updateArrows();
  })();

  // Reveal on scroll (IntersectionObserver)
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

});
