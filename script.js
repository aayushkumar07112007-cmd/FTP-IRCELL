        /* ---------- NAV ---------- */
        const navMenu = document.getElementById('navMenu');
        const navToggle = document.getElementById('navToggle');
        function toggleNav() {
            const open = navMenu.classList.toggle('open');
            navToggle.classList.toggle('open', open);
            navToggle.setAttribute('aria-expanded', open);
        }
        function closeNav() {
            navMenu.classList.remove('open');
            navToggle.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
        }

        /* ---------- SCROLL: progress bar, sticky shrink, back-to-top ---------- */
        const header = document.getElementById('header');
        const progress = document.getElementById('scrollProgress');
        const toTop = document.getElementById('toTop');
        function onScroll() {
            const y = window.scrollY;
            const max = document.documentElement.scrollHeight - window.innerHeight;
            progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
            header.classList.toggle('scrolled', y > 40);
            toTop.classList.toggle('show', y > 600);
        }
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

        /* ---------- SCROLL REVEAL ---------- */
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
        document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

        /* ---------- COUNT-UP STATS ---------- */
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        function countUp(el) {
            const target = parseFloat(el.dataset.count);
            const decimals = parseInt(el.dataset.decimals || '0', 10);
            const suffix = el.dataset.suffix || '';
            if (reduceMotion) { el.textContent = target.toFixed(decimals) + suffix; return; }
            const duration = 4500; /* slower count-up (ms) */
            const start = performance.now();
            function tick(now) {
                const t = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - t, 2); /* gentle ease-out so it stays slow */
                el.textContent = (target * eased).toFixed(decimals) + suffix;
                if (t < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
        }
        const statObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    countUp(entry.target);
                    statObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.6 });
        document.querySelectorAll('[data-count]').forEach(el => statObserver.observe(el));

        /* ---------- SCROLLSPY (active nav link) ---------- */
        const spyLinks = document.querySelectorAll('.nav-menu ul a');
        const spyTargets = [...spyLinks].map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
        const spyObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    spyLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
                }
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        spyTargets.forEach(t => spyObserver.observe(t));

        /* ---------- TESTIMONIAL CAROUSEL ---------- */
        const track = document.getElementById('carouselTrack');
        const slides = track.querySelectorAll('.carousel-slide');
        const dots = document.querySelectorAll('.carousel-dot');
        const carouselSection = document.getElementById('testimonials');
        const container = document.getElementById('carouselContainer');
        /* time each testimonial stays (milliseconds): every testimonial 4s */
        function slideTime(n) { return 4000; }
        let index = 0;
        let timer = null;

        function showSlide(i) {
            index = (i + slides.length) % slides.length;
            carouselSection.style.setProperty('--slide-time', slideTime(index) + 'ms');
            track.style.transform = 'translateX(' + (-index * 100) + '%)';
            slides.forEach((s, n) => s.classList.toggle('is-active', n === index));
            dots.forEach((d, n) => {
                d.classList.remove('active');
                if (n === index) { void d.offsetWidth; d.classList.add('active'); }
            });
            startAuto();
        }
        function moveSlide(step) { showSlide(index + step); }
        function currentSlide(i) { showSlide(i); }
        function startAuto() { stopAuto(); timer = setTimeout(() => showSlide(index + 1), slideTime(index)); }
        function stopAuto() { clearTimeout(timer); }

                        
        /* Swipe support */
        let touchX = null;
        container.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
        container.addEventListener('touchend', e => {
            if (touchX === null) return;
            const dx = e.changedTouches[0].clientX - touchX;
            if (Math.abs(dx) > 50) moveSlide(dx < 0 ? 1 : -1);
            touchX = null;
        });
        /* Keyboard arrows */
        carouselSection.addEventListener('keydown', e => {
            if (e.key === 'ArrowLeft') moveSlide(-1);
            if (e.key === 'ArrowRight') moveSlide(1);
        });
        showSlide(0);


        /* ---------- FTP BLOGS CAROUSEL ---------- */
        const blogTrack = document.getElementById('blogTrack');
        const blogCards = blogTrack.querySelectorAll('.blog-card');
        const blogDotsBox = document.getElementById('blogDots');
        const blogWrap = document.getElementById('blogCarousel');
        let blogIndex = 0;
        let perView = 2;
        let blogPositions = 1;

        function calcBlog() {
            perView = window.innerWidth <= 900 ? 1 : 2;
            blogTrack.style.setProperty('--per-view', perView);
            blogPositions = Math.max(1, Math.ceil(blogCards.length / perView));
            blogDotsBox.innerHTML = '';
            for (let i = 0; i < blogPositions; i++) {
                const d = document.createElement('button');
                d.className = 'blog-dot';
                d.setAttribute('aria-label', 'Show blogs page ' + (i + 1));
                d.onclick = () => showBlog(i);
                blogDotsBox.appendChild(d);
            }
            showBlog(Math.min(blogIndex, blogPositions - 1));
        }
        function showBlog(i) {
            blogIndex = (i + blogPositions) % blogPositions;
            const step = blogCards[0].offsetWidth + 30;
            const firstCard = Math.min(blogIndex * perView, Math.max(0, blogCards.length - perView));
            blogTrack.style.transform = 'translateX(' + (-firstCard * step) + 'px)';
            blogDotsBox.querySelectorAll('.blog-dot').forEach((d, n) => d.classList.toggle('active', n === blogIndex));
            blogCards.forEach(c => c.classList.remove('swap'));
            void blogTrack.offsetWidth;
            for (let k = 0; k < perView; k++) {
                const c = blogCards[firstCard + k];
                if (c) { c.style.setProperty('--k', k); c.classList.add('swap'); }
            }
        }
        function moveBlog(step) { showBlog(blogIndex + step); }
        window.addEventListener('resize', calcBlog);
        let blogTouchX = null;
        blogWrap.addEventListener('touchstart', e => { blogTouchX = e.touches[0].clientX; }, { passive: true });
        blogWrap.addEventListener('touchend', e => {
            if (blogTouchX === null) return;
            const dx = e.changedTouches[0].clientX - blogTouchX;
            if (Math.abs(dx) > 50) moveBlog(dx < 0 ? 1 : -1);
            blogTouchX = null;
        });
        calcBlog();
        new IntersectionObserver((en, ob) => { if (en[0].isIntersecting) { showBlog(blogIndex); ob.disconnect(); } }, { threshold: 0.3 }).observe(blogWrap);

        /* ---------- NEWSLETTER ---------- */
        document.getElementById('newsletterForm').addEventListener('submit', function (e) {
            e.preventDefault();
            document.getElementById('formNote').textContent = 'Thank you for subscribing.';
            this.reset();
        });

        /* ---------- FOOTER YEAR ---------- */
        document.getElementById('year').textContent = new Date().getFullYear();
    
        /* ---------- ROTATING GLOBE (self-contained, no libraries) ---------- */
        (function () {
            const canvas = document.getElementById('globeCanvas');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            const D2R = Math.PI / 180, TAU = Math.PI * 2;
            const MAROON = [0, 0, 0], DEEP = [0, 0, 0], GOLD = '#b8924a';
            const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            /* land: rough built-in outlines, upgraded to detailed data if it can be downloaded */
            let LAND = {"land":[[-168,65.5,-166,68.5,-156.5,71.3,-141,69.6,-128,70.2,-115,68.8,-108,68.2,-98,68,-95,71.5,-90,69,-85,69.8,-82,67.5,-86,66,-88,64,-93.5,61.5,-94.5,59,-92.5,57,-89,56.5,-85,55.3,-82.2,53,-79.5,51.5,-79,54.5,-77,56.5,-78,59,-77.5,62.3,-73,62,-69.5,61,-65,60.5,-64.5,58.5,-61.5,56.5,-60,54,-56,52,-59,48,-64.5,49,-65,47.5,-61,45.7,-66,44.3,-70,43.7,-70.5,41.8,-74,40.5,-75.8,37.5,-76,35,-81,31.5,-80,27,-80.3,25.2,-82,26.5,-83,29.5,-85.5,29.8,-89,30.2,-90,29,-94,29.5,-97.3,27.5,-97.5,24,-97.8,22,-96,19,-94.5,18.2,-91,18.8,-90.5,21,-87,21.5,-87.5,18,-88.5,16,-84,15.8,-83.3,12,-83.7,10.5,-81.5,8.8,-79,9.5,-77.5,8.5,-78,7.2,-80,7.3,-81.5,8,-83.5,8.5,-85.7,10,-87.5,13,-91.5,14,-94,16,-97,15.8,-101,17.5,-105.5,20,-105.5,22.5,-109.5,26,-112,29,-114.7,31.5,-114.2,30,-112.8,27.5,-110.5,24.5,-109.5,23,-112,25,-114,28,-115.5,30,-117,32.5,-117,32.5,-120.5,34.5,-122.5,37.5,-124.3,40.5,-124,46,-124.7,48.3,-123,49,-127,51,-130,54.5,-134,58,-138,59.5,-144,60,-148,60.5,-152,59.5,-158,57,-163,55,-158.5,58.5,-162,60,-165,62,-166,64],[-73,78.5,-60,82,-35,83.5,-20,82,-18,76,-20,70,-25,68,-33,66.5,-41,63.5,-43.5,60,-48,61,-52,65,-54,69.5,-58,75,-68,76.5],[-80,73.5,-72,71.5,-67,69.5,-62,66.5,-65,63,-72,64.5,-78,64.5,-74,67.5,-82,69.5,-90,73],[-118,72,-105,73,-101,69.5,-110,68.5,-117,69.5],[-90,76.5,-78,76.5,-62,82,-75,83,-90,81,-95,78],[-59,47.7,-53,46.7,-52.7,48.5,-55.5,51.5,-59,48.5],[-85,22,-80,23.2,-74.2,20.2,-77.5,19.8,-82,22.5],[-74.5,18.3,-72,19.8,-68.4,18.8,-71,17.8],[-77.5,8.5,-76,9.5,-74,11,-71.5,12,-71,11,-71.5,9.5,-69,10.8,-65,10.2,-62,10.7,-60,8.5,-57,6,-54,5.8,-51.5,4.2,-50,1.8,-50,-0.5,-47,-1,-44,-2.5,-40,-3,-37,-4.8,-35,-6,-34.8,-8,-37,-11.5,-39,-14,-39.2,-17.5,-41,-22,-44,-23,-48.5,-26,-48.5,-28.5,-52,-32,-54,-34.8,-57,-34.5,-58.5,-35,-57,-37.5,-62,-39,-65,-41,-64,-42.5,-65.5,-45,-67.5,-46.5,-65.5,-48,-68.5,-50.5,-69,-52.5,-68.5,-54.5,-65.5,-55,-71,-55,-74,-52,-75.5,-48,-74,-43,-73.5,-39,-71.7,-33,-71.5,-30,-70.3,-24,-70.2,-18.5,-75,-15,-76.5,-13,-79,-8,-81,-5.5,-80,-2.5,-80.8,-1,-80,1,-78.5,2.5,-77.5,4,-77.4,7],[-5.8,35.8,-2,35.2,3,36.8,10,37.2,11,35,10,33.5,15,32.3,20,32.8,20,31,25,31.7,32.3,31.2,32.5,30,33.8,27.3,35.5,24,37.2,21,38.5,18,40,15.5,42.8,13,43.3,11.8,44.5,10.5,48,11.2,51.2,11.8,50.5,9,48,5,45,2,41.5,-2,40,-4.5,39,-6.8,40.5,-10.5,40.7,-15,37,-18,35,-20,35.5,-24,32.8,-26,32.5,-28.5,30,-31.5,27,-33.5,22,-34.2,19,-34.5,18.2,-32.5,16.5,-28.5,14.5,-23,12,-17.5,13.5,-12,12.2,-6,9,-1,9.5,3.5,8.7,4.5,6,4.3,4,6.3,1,6,-2,4.8,-5,5.2,-8,4.4,-11.5,6.8,-13.5,9.5,-15,11.5,-17,14.7,-16.5,16.5,-16.2,20,-17,21,-15.5,23.5,-13,27.5,-10,29.5,-9.7,31.2,-8.5,33.2,-6.8,34.2],[32.3,31.2,34.2,31.3,34.9,29.5,34,27.8,33.5,28.5,32.6,30],[49.3,-12,50.5,-15.5,47.5,-25,44,-25,43.3,-22,44.5,-16,47,-15],[-9,43,-8.8,42,-9.5,39,-8.8,37.2,-6.3,36.5,-5.5,36,-2,36.8,-0.5,38.5,0,39.5,-0.5,40.5,3,41.8,3.2,43.2,6,43.1,8.5,44.3,10,44,11,42.5,12.5,41.5,14.5,40.6,15.7,39.8,16,38.2,15.7,38,16.6,38.5,17.2,39,16.5,39.7,17.2,40.3,18.5,40.1,17,41,15.8,41.9,14.5,42.4,13.5,43.5,12.4,44.3,12.3,45.3,13.7,45.6,14,44.5,16,43.3,18.5,42.4,19.4,41.8,19.5,40.3,20.5,39,21.7,37,23,36.5,24,38,23,40,26,40.8,26.3,39.5,27,37.5,29,36.5,32,36.2,36,36.5,36,35,35.8,34.5,35,33,34.5,31.8,34,31,34.8,29.5,35,28,37,25,39,21.5,41,18,42.7,15,43.3,12.7,45,12.8,48,14,52,16,55,17.8,57,19,59.8,22.5,58,23.7,57,23.9,56.3,25.5,56.3,26.3,55,25.2,54,24.2,52,24,51.5,25.2,51,26.1,50,26.7,49.5,28,48,29.5,48.5,30,49.5,30,50.8,29,51.5,27.8,53.5,26.8,55,26.7,56.3,27,57.3,25.7,61.5,25.2,66.5,25.4,67.2,24.8,68.2,23.7,70,21,72.8,19.5,73.5,16,74.8,12.5,76.2,9.5,77.5,8.1,78.2,8.8,79.8,10.3,80.2,13,80.3,15.5,82,17,85,19.5,87,21.5,89,21.8,91,22.5,92,21,94,18.5,94.5,16,97.5,16.5,98,13.5,98.5,10,99.5,8,100.4,6.5,101.5,3,103.5,1.4,103.5,4,102.2,6.2,100.5,8.5,99.2,10.5,100,13,101,12.7,102.5,12,103.5,10.7,105,8.7,106.5,10,105.2,12.5,107.5,15,108.5,16.2,107,19.5,106.5,20.8,108.2,21.5,110,20.8,110.5,21.4,112,22,114,22.3,117,23.2,119.5,25.5,121.5,28.5,121.8,30.8,120.5,32.5,119.5,34.5,121,36.8,122.5,37,119,37.2,118,38.3,117.7,39.2,121.5,40.5,121.8,39,123,39.8,124.5,39.8,125.2,38,126.5,37,126.5,34.8,128.5,34.8,129.4,35.5,129.3,37,128,38.5,129.7,41,130.7,42.5,132,43,135,43.8,138,46,140.5,48.5,140.5,51.5,138,54,135,54.7,137,54.6,140.5,56,143,59.2,150,59.5,155.5,59.3,156,57,155.8,54,156.5,51.2,158.5,53,160.5,54.8,162.5,56.5,163.5,59.5,166,61,170,60.2,173.5,61.7,177,62.5,180,65,180,69,176,69.7,170,70,160,69.5,150,71.5,140,72.5,130,71,128,73,113,73.7,110,76.5,104,77.7,100,76.5,95,76,88,75.5,86,74,80,73,73,72.5,68,69,66,70,60,69.5,55,68.5,48,68,44,66.5,40,66.2,36,66,34,64.5,32,67.5,30,70,25,71,20,70,15,68.5,12,66,8,63.5,5,62,5,59.5,7,58,8.5,58.2,10.5,59.5,11.5,58.8,12.5,56.5,14,55.5,16,56.2,16.6,57.8,18.5,60,17.5,62,21,64,24,65.8,25.5,65.5,25,64,21.5,62.5,21.5,61,23,60,27,60.5,30,60.2,28,59.5,24,59.5,23.5,58,24.3,57.3,21,57,21,56,20.5,54.8,19,54.4,17,54.8,14.2,54,11,54,10,54.8,10.5,57.7,8.2,57,8.1,55.5,8.6,54.9,8.7,54,8.5,53.5,7,53.5,5,53.2,4.5,52.8,4,51.5,2.5,51.1,1.6,50.9,0.5,49.8,-1.5,49.7,-1.5,48.7,-3,48.8,-4.7,48.4,-4.5,47.8,-2.5,47.3,-1.2,46,-1.8,43.4,-4,43.4,-8,43.7],[-180,69,-175,67.5,-170,66.2,-172,64.5,-180,65],[95.3,5.5,98,4,100.5,2,103.5,-1,106,-3,105.8,-5.8,104.5,-5.8,102,-4,100,-1.5,98.5,1.5,96,3.5],[105.2,-6.8,108,-6.3,111,-6.5,114.5,-7.8,114.4,-8.7,110,-8.2,106,-7.4],[109,1.5,110,1.7,111.5,2.5,113,3.2,115.5,5,117,7,119,5.2,118,4.2,117.8,1.5,116,-2,116.2,-3.8,114.5,-4,112,-3.5,110.2,-2.9,109.2,-0.5],[119.5,-5,120.3,-3,121,-1,120,0.8,124.5,1.3,125,1,123.5,0,121.5,-1,122.5,-3,123.2,-4.8,121.5,-4.5,120.5,-5.5],[131,-0.8,134,-0.8,138,-1.8,141,-2.6,145,-4.5,147.5,-6,147.8,-7.5,150.5,-10.5,147,-10,144,-7.8,141,-9,138,-8.2,137.5,-5.5,133.5,-4,132.5,-2.8],[120.5,18.5,122.3,18.4,122,16,121.5,14,124,13,122,13.6,120.5,14.5,120,16.5],[122,7,123.8,8.7,126.5,9,126.2,6.5,125.5,5.8,124,6.5,122.3,6.8],[120.2,23,121.5,25.2,122,24.5,120.9,22],[130.9,34,132.5,35.5,135.5,35.6,137,37,139.5,38,140,40.5,141.5,41.3,142,39.5,141,37,140.8,35.7,139.8,35,137,34.6,135.8,33.5,134.5,34,132.5,34,131,33.9],[140,41.5,141,45.4,145.5,43.3,143.3,42,141.5,42.5],[129.8,33.2,131.8,33.7,131.5,31.4,130.2,31.2],[132.6,33.8,134.5,34.2,134.2,33.2,132.8,32.8],[142,46,143.2,49.5,143.5,52.5,142.3,54,142,50],[79.8,9.5,81.8,7.5,81.2,6,80,6,79.7,8],[108.7,19.5,110.5,20.1,111,19.5,109.5,18.2],[-5.7,50,-3,50.5,1.4,51.2,1.7,52.7,0.2,53.5,-1.5,55,-2,56.2,-1.8,57.6,-3.5,58.6,-5,58.5,-6.2,56.5,-5,55,-3.2,54.8,-3,53.4,-4.6,52.7,-4.2,51.6],[-10,51.7,-6,52.2,-6,54.2,-5.5,55,-8,55.2,-10,54,-9.8,52.5],[-24,65.5,-22,66.4,-16,66.5,-13.5,65,-18,63.4,-22.5,63.8],[52,71,56,73.5,68,77,67,76,58,75,55,72,53,70.5],[12.4,38,15.6,38.3,15.1,36.7,12.5,37.6],[8.2,41,9.7,41,9.6,39.2,8.4,39],[172.7,-34.4,175.5,-37,178.5,-37.6,177,-39.3,175.2,-41.5,174.7,-39.8,173.8,-39.3,174.7,-37],[172.7,-40.5,174.3,-41.6,173,-43.8,171,-44.5,169,-46.5,166.5,-46,168,-44,171,-42],[113.5,-22,114,-26,115,-30,115.5,-33.5,118,-35,123,-34,126,-32.2,131,-31.5,134,-32.8,137,-35.2,138,-34.5,138.5,-33,140,-37.7,143.5,-38.8,146.3,-39,148,-37.8,150,-37,151.3,-33.8,153.2,-30,153.5,-27,152.5,-24.5,150.5,-22.5,148.5,-20,146,-18.5,145.4,-15,143.5,-14,142.5,-10.7,141.6,-13,141.5,-17,139.5,-17.5,136.8,-15.7,136,-12.2,132.5,-11.5,130,-12.5,129.5,-15,127,-14,125,-15,122.2,-17.5,121,-19.5,117,-20.7,114.5,-21.8],[144.7,-40.7,148.3,-40.9,148,-43.2,146,-43.6,145.2,-42.3],[-180,-90,-180,-77.8,-165,-78,-155,-78,-150,-76.5,-135,-74.5,-120,-73.7,-105,-74.5,-100,-72,-90,-73.5,-78,-73,-72,-70,-68,-67,-65,-65,-60,-63.5,-57,-63.2,-62,-65,-60,-68,-62,-71,-65,-74,-60,-75.5,-48,-77.5,-40,-78,-30,-77.5,-20,-74,-10,-71.5,0,-70.2,15,-70,30,-69.8,40,-68.5,50,-66.5,60,-67.5,70,-69.5,75,-68,85,-66.5,95,-66,105,-66.5,115,-66.2,125,-66.5,135,-66,145,-67.8,155,-69,165,-70.5,170,-71.5,180,-71.5,180,-90]],"water":[[28,41.2,29,41.3,31.5,41.2,35,42,38,41,41.5,41.5,41.5,42.5,40,43.5,37.5,44.8,38,46,35,45.2,33,44.4,33.5,46,31,46.5,30,45.5,28.7,44,28,42],[47,45,50,46.5,53,46.8,53.2,45,51,44.5,51,43,52.5,41.8,54,40.8,53.5,39,53,37,50.5,37,49,38.5,49.5,40.5,47.5,42.2,47,44]]};
            const FALLBACK_POLYS = () => {
                const polys = LAND.land.map(r => [Float32Array.from(r)]);
                const eur = polys[LAND._eurasia];
                LAND.water.forEach(w => eur.push(Float32Array.from(w)));
                return polys;
            };

            /* ---- view state ---- */
            let size = 0, R = 0, cx = 0, cy = 0, dpr = 1;
            let lon0 = 62, lat0 = 20;            /* centre of the view; India first */
            let vLon = 0, dragging = false, lastX = 0, lastY = 0, resumeAt = 0;
            const home = { name: 'IIT Kharagpur', lon: 87.32, lat: 22.34 };
            const cities = [
                { name: 'London',        lon: -0.12,  lat: 51.5,  side: 'l' },
                { name: 'Zurich',        lon: 8.54,   lat: 47.37, side: 'r' },
                { name: 'New York',      lon: -74.0,  lat: 40.7,  side: 'l' },
                { name: 'San Francisco', lon: -122.4, lat: 37.8,  side: 'l' },
                { name: 'Tokyo',         lon: 139.7,  lat: 35.7,  side: 'r' },
                { name: 'Singapore',     lon: 103.8,  lat: 1.35,  side: 'r' },
                { name: 'Sydney',        lon: 151.2,  lat: -33.9, side: 'r' },
                { name: 'Dubai',         lon: 55.3,   lat: 25.2,  side: 'l' }
            ];

            const vec = (lon, lat) => { const p = lat * D2R, l = lon * D2R; return [Math.cos(p) * Math.sin(l), Math.sin(p), Math.cos(p) * Math.cos(l)]; };
            let c0, s0, c1, s1;
            function setView() { c0 = Math.cos(lon0 * D2R); s0 = Math.sin(lon0 * D2R); c1 = Math.cos(lat0 * D2R); s1 = Math.sin(lat0 * D2R); }
            /* rotate a world vector into the screen frame: returns [x, y, z] (z toward viewer) */
            function rot(w, k) {
                k = k || 1;
                const x = (w[0] * c0 - w[2] * s0) * k, z1 = (w[2] * c0 + w[0] * s0) * k, y1 = w[1] * k;
                return [x, y1 * c1 - z1 * s1, y1 * s1 + z1 * c1];
            }
            const sx = p => cx + p[0] * R, sy = p => cy - p[1] * R;
            const hidden = p => p[2] < 0 && (p[0] * p[0] + p[1] * p[1]) < 1;

            /* ---- land dots ---- */
            let dots = null;
            function inRing(r, x, y) {
                let inside = false;
                for (let i = 0, j = r.length - 2; i < r.length; j = i, i += 2) {
                    const xi = r[i], yi = r[i + 1], xj = r[j], yj = r[j + 1];
                    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
                }
                return inside;
            }
            function buildDots(polys) {
                const info = polys.map(p => {
                    const o = p[0]; let a = 1e9, b = -1e9, c = 1e9, d = -1e9;
                    for (let i = 0; i < o.length; i += 2) { a = Math.min(a, o[i]); b = Math.max(b, o[i]); c = Math.min(c, o[i + 1]); d = Math.max(d, o[i + 1]); }
                    return { p, a, b, c, d };
                });
                const out = [], step = 1.75;
                let row = 0;
                for (let lat = -88; lat <= 86; lat += step, row++) {
                    const dl = step / Math.max(Math.cos(lat * D2R), 0.12);
                    for (let lon = -180 + (row % 2) * dl / 2; lon < 180; lon += dl) {
                        let hit = false;
                        for (const q of info) {
                            if (lon < q.a || lon > q.b || lat < q.c || lat > q.d) continue;
                            if (!inRing(q.p[0], lon, lat)) continue;
                            let hole = false;
                            for (let h = 1; h < q.p.length; h++) if (inRing(q.p[h], lon, lat)) { hole = true; break; }
                            if (!hole) { hit = true; break; }
                        }
                        if (hit) out.push([lon, lat]);
                    }
                }
                const n = out.length, W = new Float32Array(n * 3), G = new Uint8Array(n);
                const hv = vec(home.lon, home.lat);
                out.forEach((d, i) => {
                    const v = vec(d[0], d[1]); W[i * 3] = v[0]; W[i * 3 + 1] = v[1]; W[i * 3 + 2] = v[2];
                    const dot = v[0] * hv[0] + v[1] * hv[1] + v[2] * hv[2];
                    G[i] = dot > Math.cos(11 * D2R) ? 1 : 0;      /* highlight the region around Kharagpur */
                });
                dots = { n, W, G, X: new Float32Array(n), Y: new Float32Array(n), Z: new Float32Array(n) };
            }
            LAND._eurasia = LAND.land.length; /* placeholder, fixed below */
            (function () {
                /* eurasia is the polygon with the most points */
                let best = 0, bi = 0; LAND.land.forEach((r, i) => { if (r.length > best) { best = r.length; bi = i; } });
                LAND._eurasia = bi;
            })();
            buildDots(FALLBACK_POLYS());

            /* try to upgrade to detailed coastlines (TopoJSON world-atlas) */
            function decodeTopo(t) {
                const sc = t.transform.scale, tr = t.transform.translate;
                const arcs = t.arcs.map(a => { let x = 0, y = 0; return a.map(p => { x += p[0]; y += p[1]; return [x * sc[0] + tr[0], y * sc[1] + tr[1]]; }); });
                const ring = idx => {
                    let out = [];
                    idx.forEach((i, k) => { const a = i < 0 ? arcs[~i].slice().reverse() : arcs[i]; out = out.concat(k ? a.slice(1) : a); });
                    const f = new Float32Array(out.length * 2); out.forEach((p, i) => { f[i * 2] = p[0]; f[i * 2 + 1] = p[1]; });
                    return f;
                };
                const polys = [], obj = t.objects.land || t.objects[Object.keys(t.objects)[0]];
                (obj.type === 'GeometryCollection' ? obj.geometries : [obj]).forEach(g => {
                    if (g.type === 'Polygon') polys.push(g.arcs.map(ring));
                    else if (g.type === 'MultiPolygon') g.arcs.forEach(p => polys.push(p.map(ring)));
                });
                return polys;
            }
            const sources = [
                'https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json',
                'https://unpkg.com/world-atlas@2/land-110m.json'
            ];
            (function tryLoad(i) {
                if (i >= sources.length) return;
                fetch(sources[i]).then(r => { if (!r.ok) throw 0; return r.json(); })
                    .then(t => { const polys = decodeTopo(t); if (polys.length) buildDots(polys); })
                    .catch(() => tryLoad(i + 1));
            })(0);

            /* ---- sizing ---- */
            function resize() {
                const r = canvas.getBoundingClientRect();
                if (!r.width) return;
                dpr = Math.min(window.devicePixelRatio || 1, 2);
                size = r.width; cx = cy = size / 2; R = size * 0.36;
                canvas.width = Math.round(size * dpr); canvas.height = Math.round(size * dpr);
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            }
            new ResizeObserver(resize).observe(canvas);
            resize();

            /* ---- interaction ---- */
            canvas.addEventListener('pointerdown', e => { dragging = true; vLon = 0; lastX = e.clientX; lastY = e.clientY; canvas.setPointerCapture(e.pointerId); });
            canvas.addEventListener('pointermove', e => {
                if (!dragging) return;
                const dx = e.clientX - lastX, dy = e.clientY - lastY; lastX = e.clientX; lastY = e.clientY;
                lon0 -= dx * 0.4; vLon = -dx * 0.4; lat0 = Math.max(-55, Math.min(55, lat0 + dy * 0.3));
            });
            const release = () => { dragging = false; resumeAt = performance.now() + 1400; };
            canvas.addEventListener('pointerup', release);
            canvas.addEventListener('pointercancel', release);

            /* ---- drawing helpers ---- */
            const rgba = (c, a) => 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')';
            const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t].map(Math.round);

            function polyline(pts, style, width) {
                ctx.beginPath(); let pen = false;
                for (const p of pts) {
                    if (hidden(p)) { pen = false; continue; }
                    if (!pen) { ctx.moveTo(sx(p), sy(p)); pen = true; } else ctx.lineTo(sx(p), sy(p));
                }
                ctx.strokeStyle = style; ctx.lineWidth = width; ctx.stroke();
            }
            function graticule() {
                const pts = [];
                ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.clip();
                for (let lat = -60; lat <= 60; lat += 30) { const a = []; for (let lon = -180; lon <= 180; lon += 6) a.push(rot(vec(lon, lat))); polyline(a, 'rgba(184,146,74,0.28)', 0.8); }
                for (let lon = -180; lon < 180; lon += 30) { const a = []; for (let lat = -90; lat <= 90; lat += 6) a.push(rot(vec(lon, lat))); polyline(a, 'rgba(184,146,74,0.28)', 0.8); }
                ctx.restore();
            }

            /* orbit rings (fixed in space, independent of globe spin) */
            const rings = [
                { rho: 1.24, tilt: 72 * D2R, roll: -24 * D2R, speed: 0.00042, col: GOLD,      w: 1.4, dash: [] },
                { rho: 1.34, tilt: 64 * D2R, roll: 30 * D2R,  speed: -0.0003, col: '#000000', w: 1.1, dash: [3, 7] }
            ];
            function ringPoint(r, th) {
                let x = Math.cos(th) * r.rho, y = 0, z = Math.sin(th) * r.rho;
                let y2 = y * Math.cos(r.tilt) - z * Math.sin(r.tilt), z2 = y * Math.sin(r.tilt) + z * Math.cos(r.tilt);
                return [x * Math.cos(r.roll) - y2 * Math.sin(r.roll), x * Math.sin(r.roll) + y2 * Math.cos(r.roll), z2];
            }
            function drawRings(front, now) {
                rings.forEach((r, ri) => {
                    ctx.save(); ctx.setLineDash(r.dash);
                    for (let side = 0; side < 2; side++) {
                        let on = false; ctx.beginPath();
                        for (let i = 0; i <= 120; i++) {
                            const p = ringPoint(r, i / 120 * TAU), vis = (p[2] >= 0) === front;
                            if (vis) { if (!on) { ctx.moveTo(sx(p), sy(p)); on = true; } else ctx.lineTo(sx(p), sy(p)); } else on = false;
                        }
                        ctx.strokeStyle = r.col; ctx.globalAlpha = front ? 0.75 : 0.28; ctx.lineWidth = r.w; ctx.stroke();
                        break;
                    }
                    ctx.restore();
                    const th = now * r.speed + ri * 2.1, p = ringPoint(r, th);
                    if ((p[2] >= 0) === front) {
                        ctx.beginPath(); ctx.arc(sx(p), sy(p), ri ? 3.2 : 4.4, 0, TAU);
                        ctx.fillStyle = r.col; ctx.globalAlpha = front ? 1 : 0.45; ctx.fill();
                        if (!ri) { ctx.beginPath(); ctx.arc(sx(p), sy(p), 9, 0, TAU); ctx.fillStyle = 'rgba(184,146,74,0.22)'; ctx.fill(); }
                        ctx.globalAlpha = 1;
                    }
                });
            }

            /* arcs from Kharagpur */
            const hv = vec(home.lon, home.lat);
            cities.forEach(c => {
                c.v = vec(c.lon, c.lat);
                c.om = Math.acos(Math.max(-1, Math.min(1, hv[0] * c.v[0] + hv[1] * c.v[1] + hv[2] * c.v[2])));
                c.pts = [];
                for (let i = 0; i <= 56; i++) {
                    const t = i / 56, so = Math.sin(c.om);
                    const a = Math.sin((1 - t) * c.om) / so, b = Math.sin(t * c.om) / so;
                    const w = [hv[0] * a + c.v[0] * b, hv[1] * a + c.v[1] * b, hv[2] * a + c.v[2] * b];
                    c.pts.push({ w, k: 1.004 + Math.min(0.11, c.om * 0.035) * Math.sin(Math.PI * t) });
                }
            });
            function drawArcs(now) {
                cities.forEach((c, i) => {
                    const pts = c.pts.map(q => rot(q.w, q.k));
                    polyline(pts, 'rgba(184,146,74,0.85)', 1.4);
                    /* travelling spark */
                    const ph = ((now * 0.00028 + i * 0.137) % 1.25);
                    for (let k = 0; k < 7; k++) {
                        const t = ph - k * 0.018; if (t < 0 || t > 1) continue;
                        const q = pts[Math.round(t * 56)]; if (!q || hidden(q)) continue;
                        ctx.beginPath(); ctx.arc(sx(q), sy(q), 3.1 - k * 0.38, 0, TAU);
                        ctx.fillStyle = 'rgba(0,0,0,' + (0.95 - k * 0.12) + ')'; ctx.fill();
                    }
                });
            }

            function label(text, x, y, side, strong) {
                ctx.font = (strong ? '500 13px ' : '400 11.5px ') + "'Open Sans','Segoe UI',sans-serif";
                const w = ctx.measureText(text).width + 16, h = strong ? 24 : 20, gap = strong ? 12 : 9;
                const x0 = side === 'l' ? x - gap - w : x + gap, y0 = y - h / 2;
                ctx.beginPath();
                if (ctx.roundRect) ctx.roundRect(x0, y0, w, h, h / 2); else ctx.rect(x0, y0, w, h);
                ctx.fillStyle = strong ? '#000000' : 'rgba(255,255,255,0.94)'; ctx.shadowColor = 'rgba(0,0,0,0.22)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 2; ctx.fill();
                ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
                if (!strong) { ctx.strokeStyle = 'rgba(184,146,74,0.7)'; ctx.lineWidth = 1; ctx.stroke(); }
                ctx.fillStyle = strong ? '#ffffff' : '#000000'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
                ctx.fillText(text, x0 + 8, y0 + h / 2 + 0.5);
            }

            /* ---- main frame ---- */
            let last = performance.now(), running = false;
            function frame(now) {
                if (!running) return;
                const dt = Math.min(now - last, 50); last = now;
                if (!dragging) {
                    if (Math.abs(vLon) > 0.01) { lon0 += vLon; vLon *= 0.94; }
                    else if (!reduceMotion && now > resumeAt) lon0 += dt * 0.011;
                }
                if (lon0 > 180) lon0 -= 360; if (lon0 < -180) lon0 += 360;
                setView();
                ctx.clearRect(0, 0, size, size);

                /* soft ground shadow */
                const sh = ctx.createRadialGradient(cx, cy + R * 1.27, 2, cx, cy + R * 1.27, R * 0.9);
                sh.addColorStop(0, 'rgba(0,0,0,0.20)'); sh.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.save(); ctx.translate(0, 0); ctx.scale(1, 1);
                ctx.beginPath(); ctx.ellipse(cx, cy + R * 1.27, R * 0.85, R * 0.09, 0, 0, TAU); ctx.fillStyle = sh; ctx.fill(); ctx.restore();

                /* atmosphere glow */
                const ag = ctx.createRadialGradient(cx, cy, R * 0.98, cx, cy, R * 1.22);
                ag.addColorStop(0, 'rgba(184,146,74,0.40)'); ag.addColorStop(0.45, 'rgba(184,146,74,0.12)'); ag.addColorStop(1, 'rgba(184,146,74,0)');
                ctx.beginPath(); ctx.arc(cx, cy, R * 1.22, 0, TAU); ctx.fillStyle = ag; ctx.fill();

                drawRings(false, now);

                /* ocean sphere */
                const og = ctx.createRadialGradient(cx - R * 0.38, cy - R * 0.42, R * 0.06, cx, cy, R * 1.05);
                og.addColorStop(0, '#ffffff'); og.addColorStop(0.5, '#fcf6ec'); og.addColorStop(1, '#ecdcc2');
                ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fillStyle = og; ctx.fill();
                graticule();

                /* land dots, shaded by facing + light */
                if (dots) {
                    const { n, W, G, X, Y, Z } = dots;
                    for (let i = 0; i < n; i++) {
                        const wx = W[i * 3], wy = W[i * 3 + 1], wz = W[i * 3 + 2];
                        const x = wx * c0 - wz * s0, z1 = wz * c0 + wx * s0;
                        X[i] = x; Y[i] = wy * c1 - z1 * s1; Z[i] = wy * s1 + z1 * c1;
                    }
                    const B = 7, base = R * 0.0078;
                    for (let pass = 0; pass < 2; pass++) {
                        for (let b = 0; b < B; b++) {
                            const lo = b / B, hi = (b + 1) / B, zc = (lo + hi) / 2;
                            const tone = pass ? [184, 146, 74] : mix(DEEP, MAROON, Math.min(1, 0.35 + zc * 0.9));
                            ctx.beginPath();
                            for (let i = 0; i < n; i++) {
                                if (G[i] !== pass) continue;
                                const z = Z[i]; if (z <= 0.03 || z < lo || z >= hi) continue;
                                const px = cx + X[i] * R, py = cy - Y[i] * R, r = base * (0.5 + 0.55 * z);
                                ctx.moveTo(px + r, py); ctx.arc(px, py, r, 0, TAU);
                            }
                            ctx.fillStyle = rgba(tone, 0.28 + 0.72 * Math.pow(zc, 0.55)); ctx.fill();
                        }
                    }
                }

                /* shading: lit top-left, soft shadow bottom-right */
                const sg = ctx.createRadialGradient(cx - R * 0.45, cy - R * 0.5, R * 0.25, cx - R * 0.1, cy - R * 0.1, R * 1.25);
                sg.addColorStop(0, 'rgba(255,255,255,0.0)'); sg.addColorStop(0.65, 'rgba(0,0,0,0.05)'); sg.addColorStop(1, 'rgba(0,0,0,0.20)');
                ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fillStyle = sg; ctx.fill();
                const hl = ctx.createRadialGradient(cx - R * 0.5, cy - R * 0.55, 0, cx - R * 0.5, cy - R * 0.55, R * 0.55);
                hl.addColorStop(0, 'rgba(255,255,255,0.55)'); hl.addColorStop(1, 'rgba(255,255,255,0)');
                ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.clip(); ctx.fillStyle = hl; ctx.fillRect(0, 0, size, size); ctx.restore();
                ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.strokeStyle = 'rgba(184,146,74,0.75)'; ctx.lineWidth = 1.4; ctx.stroke();

                drawArcs(now);

                /* markers */
                const marks = [];
                cities.forEach(c => { const p = rot(c.v, 1.004); if (p[2] > 0.12) marks.push({ c, p }); });
                marks.forEach(({ p }) => {
                    ctx.beginPath(); ctx.arc(sx(p), sy(p), 3.8, 0, TAU); ctx.fillStyle = '#fff'; ctx.fill();
                    ctx.lineWidth = 2; ctx.strokeStyle = '#000000'; ctx.stroke();
                });
                const hp = rot(hv, 1.004);
                if (hp[2] > 0.05) {
                    const k = (now % 2000) / 2000;
                    for (let j = 0; j < 2; j++) {
                        const kk = (k + j * 0.5) % 1;
                        ctx.beginPath(); ctx.arc(sx(hp), sy(hp), 6 + kk * 24, 0, TAU);
                        ctx.strokeStyle = 'rgba(0,0,0,' + (0.55 * (1 - kk)) + ')'; ctx.lineWidth = 2; ctx.stroke();
                    }
                    ctx.beginPath(); ctx.arc(sx(hp), sy(hp), 6.5, 0, TAU); ctx.fillStyle = '#000000'; ctx.fill();
                    ctx.lineWidth = 2.5; ctx.strokeStyle = '#fff'; ctx.stroke();
                    ctx.beginPath(); ctx.arc(sx(hp), sy(hp), 2.2, 0, TAU); ctx.fillStyle = '#e9d29c'; ctx.fill();
                }
                marks.forEach(({ c, p }) => { if (p[2] > 0.35) label(c.name, sx(p), sy(p), c.side, false); });
                if (hp[2] > 0.3) label(home.name, sx(hp), sy(hp) - 22, 'r', true);

                drawRings(true, now);
                requestAnimationFrame(frame);
            }
            function start() { if (!running) { running = true; last = performance.now(); requestAnimationFrame(frame); } }
            function stop() { running = false; }
            new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? start() : stop()), { threshold: 0.02 }).observe(canvas);
            document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
        })();
    

/* ---------- TOP FIELDS: tap to flip on touch screens ---------- */
document.querySelectorAll('.field-card').forEach(card => {
    card.addEventListener('click', () => card.classList.toggle('flipped'));
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.classList.toggle('flipped'); } });
});
