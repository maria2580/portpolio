document.addEventListener('DOMContentLoaded', function() {
const techCards = document.querySelectorAll('.tech-skills-visual .tech-card');

techCards.forEach(card => {
    card.addEventListener('click', () => {
        // 다른 모든 카드에서 active 클래스 제거 (선택적: 하나만 열리게 하려면)
        // techCards.forEach(c => {
        //     if (c !== card) c.classList.remove('active');
        // });
        card.classList.toggle('active');
    }
)});
}
);