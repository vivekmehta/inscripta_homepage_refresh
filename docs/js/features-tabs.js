document.addEventListener('DOMContentLoaded', function () {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    function activateTab(button) {
        const targetTab = button.getAttribute('data-tab');
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabPanels.forEach(panel => panel.classList.remove('active'));
        button.classList.add('active');
        document.querySelector(`[data-panel="${targetTab}"]`).classList.add('active');
    }

    tabButtons.forEach(button => {
        button.addEventListener('click', () => activateTab(button));
    });

    // Auto cycle every 5 seconds
    let index = 0;
    setInterval(() => {
        index = (index + 1) % tabButtons.length;
        activateTab(tabButtons[index]);
    }, 5000); // 5 seconds
});

