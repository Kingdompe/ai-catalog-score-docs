/* ===========================================================
   AI Catalog Score — shared editorial JS
   Linked from blog HTML + leaderboard worker output.
   Adds scroll-reveal, counter animations, active TOC tracking,
   and a small mouse-tracked spotlight to match the main landing.
   No dependencies. Runs on DOMContentLoaded.
   =========================================================== */
(function(){
  'use strict';

  // Respect reduced motion globally
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Scroll reveal ---------------------------------------
  if (!reduced && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });

    document.querySelectorAll('.reveal, .reveal-stagger').forEach(function(el){
      io.observe(el);
    });
  } else {
    // Fallback: just make everything visible immediately
    document.querySelectorAll('.reveal, .reveal-stagger').forEach(function(el){
      el.classList.add('is-visible');
    });
  }

  // ---- Counter animation -----------------------------------
  // Targets elements like <b class="count-up" data-target="958598">958,598</b>
  function easeOutCubic(t){ return 1 - Math.pow(1 - t, 3); }

  function animateCount(el, target, duration){
    var start = 0;
    var t0 = performance.now();
    function step(now){
      var elapsed = now - t0;
      var p = Math.min(1, elapsed / duration);
      var v = Math.round(start + (target - start) * easeOutCubic(p));
      el.textContent = v.toLocaleString('en');
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString('en');
    }
    requestAnimationFrame(step);
  }

  if (!reduced && 'IntersectionObserver' in window) {
    var counterIO = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting) {
          var el = e.target;
          var target = parseInt(el.getAttribute('data-target') || el.textContent.replace(/[^\d]/g, ''), 10);
          if (!isNaN(target) && target > 0) {
            animateCount(el, target, 1200);
          }
          counterIO.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('.count-up').forEach(function(el){
      counterIO.observe(el);
    });
  }

  // ---- Active TOC link tracking ----------------------------
  var tocLinks = document.querySelectorAll('.article-toc a[href^="#"]');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var sections = [];
    tocLinks.forEach(function(link){
      var id = link.getAttribute('href').slice(1);
      var section = document.getElementById(id);
      if (section) sections.push({ link: link, section: section });
    });

    var setActive = function(activeLink){
      tocLinks.forEach(function(l){ l.classList.remove('is-active'); });
      if (activeLink) activeLink.classList.add('is-active');
    };

    var tocIO = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting) {
          var match = sections.find(function(s){ return s.section === e.target; });
          if (match) setActive(match.link);
        }
      });
    }, { rootMargin: '-15% 0px -70% 0px', threshold: 0 });

    sections.forEach(function(s){ tocIO.observe(s.section); });

    // Click should smoothly scroll
    tocLinks.forEach(function(link){
      link.addEventListener('click', function(ev){
        var id = link.getAttribute('href').slice(1);
        var target = document.getElementById(id);
        if (target) {
          ev.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          history.pushState(null, '', '#' + id);
        }
      });
    });
  }

  // ---- Subtle mouse-tracked spotlight on cards -------------
  // Only attach if not reduced; uses CSS custom props read in :hover styles
  if (!reduced) {
    document.querySelectorAll('.lift-hover, .post-card, .signal-card, .choice').forEach(function(el){
      el.addEventListener('mousemove', function(e){
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
        el.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
      });
    });
  }
})();
