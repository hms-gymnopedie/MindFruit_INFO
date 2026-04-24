document.addEventListener('DOMContentLoaded', () => {
    // ─────────────────────────────────────────────
    // 1. 스크롤 등장 애니메이션 (IntersectionObserver)
    // ─────────────────────────────────────────────
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.fade-in, .slide-up');
    animatedElements.forEach(el => observer.observe(el));

    // 네비게이션 스무스 스크롤
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ─────────────────────────────────────────────
    // 2. 인터랙티브 마인드맵 버블 캔버스
    // ─────────────────────────────────────────────
    const canvas = document.getElementById('mindmap-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width, height;
    let mouse = { x: -9999, y: -9999 };
    const BUBBLE_COUNT = 28;
    const CONNECTION_DIST = 180;
    const MOUSE_RADIUS = 200;
    const bubbles = [];

    // 무채색/자연 팔렛트 (반투명)
    const palette = [
        'rgba(44, 62, 80, 0.12)',    // 딥 네이비
        'rgba(138,154,134, 0.15)',   // 세이지 그린
        'rgba(90, 108, 125, 0.10)',  // 슬레이트
        'rgba(189,195,180, 0.18)',   // 라이트 세이지
        'rgba(160,170,155, 0.14)',   // 모스그린
    ];

    function resize() {
        const hero = canvas.parentElement;
        width = canvas.width = hero.offsetWidth;
        height = canvas.height = hero.offsetHeight;
    }

    class Bubble {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.baseRadius = 6 + Math.random() * 28;
            this.radius = this.baseRadius;
            this.vx = (Math.random() - 0.5) * 0.35;
            this.vy = (Math.random() - 0.5) * 0.35;
            this.color = palette[Math.floor(Math.random() * palette.length)];
            this.phaseOffset = Math.random() * Math.PI * 2;
        }

        update(time) {
            // 부드러운 부유 이동
            this.x += this.vx;
            this.y += this.vy;

            // 미세한 떨림(호흡)
            this.radius = this.baseRadius + Math.sin(time * 0.001 + this.phaseOffset) * 2;

            // 마우스 반응: 부드럽게 밀려남
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < MOUSE_RADIUS && dist > 0) {
                const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS * 0.6;
                this.x += (dx / dist) * force;
                this.y += (dy / dist) * force;
            }

            // 화면 밖에 나가면 반대편에서 등장
            if (this.x < -this.radius) this.x = width + this.radius;
            if (this.x > width + this.radius) this.x = -this.radius;
            if (this.y < -this.radius) this.y = height + this.radius;
            if (this.y > height + this.radius) this.y = -this.radius;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();

            // 안쪽에 작은 하이라이트 원
            ctx.beginPath();
            ctx.arc(this.x - this.radius * 0.25, this.y - this.radius * 0.25, this.radius * 0.35, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.15)';
            ctx.fill();
        }
    }

    function drawConnections() {
        for (let i = 0; i < bubbles.length; i++) {
            for (let j = i + 1; j < bubbles.length; j++) {
                const a = bubbles[i];
                const b = bubbles[j];
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < CONNECTION_DIST) {
                    const opacity = (1 - dist / CONNECTION_DIST) * 0.12;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.strokeStyle = `rgba(44, 62, 80, ${opacity})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }
    }

    function animate(time) {
        ctx.clearRect(0, 0, width, height);
        drawConnections();
        bubbles.forEach(b => {
            b.update(time);
            b.draw();
        });
        requestAnimationFrame(animate);
    }

    // 초기화
    resize();
    for (let i = 0; i < BUBBLE_COUNT; i++) {
        bubbles.push(new Bubble());
    }

    // 마우스 추적 (hero 영역 기준 좌표)
    const hero = canvas.parentElement;
    hero.addEventListener('mousemove', e => {
        const rect = hero.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });
    hero.addEventListener('mouseleave', () => {
        mouse.x = -9999;
        mouse.y = -9999;
    });

    window.addEventListener('resize', () => {
        resize();
    });

    requestAnimationFrame(animate);
});
