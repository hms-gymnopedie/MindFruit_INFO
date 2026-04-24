document.addEventListener('DOMContentLoaded', () => {
    // 요소가 화면에 나타날 때 애니메이션 처리를 위한 Observer
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15  // 15% 이상 보일 때 트리거
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // 한 번 애니메이션 후에는 감지 해제
            }
        });
    }, observerOptions);

    // .fade-in, .slide-up 클래스를 가진 모든 요소를 감시
    const animatedElements = document.querySelectorAll('.fade-in, .slide-up');
    animatedElements.forEach(el => observer.observe(el));
    
    // 네비게이션 스무스 스크롤
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            
            if(targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});
