(function() {
    // 1. Автоматическое добавление стилей
    const styles = document.createElement('style');
    styles.innerHTML = `
        #octopus-canvas { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 9998; pointer-events: none; }
        #ai-bubble { position: fixed; background: #ffffff; border: 1px solid #e5e7eb; padding: 12px 16px; border-radius: 12px; font-family: 'Outfit', sans-serif; font-size: 14px; color: #1f2937; box-shadow: 0 10px 25px rgba(79, 70, 229, 0.15); opacity: 0; transform: translateY(10px); transition: opacity 0.3s, transform 0.3s; pointer-events: auto; z-index: 10000; max-width: 220px; font-weight: 500; text-align: center; }
        #ai-bubble.visible { opacity: 1; transform: translateY(0); }
        .ai-btn { display: inline-block; margin-top: 10px; padding: 8px 14px; background: #10B981; color: #fff; text-decoration: none; border-radius: 6px; font-size: 12px; font-weight: bold; transition: background 0.2s; }
        .ai-btn:hover { background: #059669; }
        #chaos-ui { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #1f2937; color: #10B981; padding: 8px 20px; border-radius: 20px; font-family: monospace; font-size: 16px; font-weight: bold; z-index: 9999; display: none; box-shadow: 0 4px 15px rgba(0,0,0,0.3); }
    `;
    document.head.appendChild(styles);

    // 2. Создание DOM-элементов
    const canvas = document.createElement('canvas');
    canvas.id = 'octopus-canvas';
    document.body.appendChild(canvas);

    const bubble = document.createElement('div');
    bubble.id = 'ai-bubble';
    document.body.appendChild(bubble);

    const chaosUI = document.createElement('div');
    chaosUI.id = 'chaos-ui';
    document.body.appendChild(chaosUI);

    // 3. Основная логика движка
    const ctx = canvas.getContext('2d');
    let width, height;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    // Настройки
    const COLOR = '#4f46e5'; 
    const EYE_COLOR = '#10B981';
    let mouse = { x: width / 2, y: height / 2 };
    let octo = { x: width / 2, y: height / 2, scale: 1 };
    let time = 0;
    
    // Состояния
    let isIdle = false;
    let idleTimer = null;
    let gameMode = false;
    let score = 0;
    let gameTime = 0;
    let clickCount = 0;
    let clickTimer = null;
    let chaosParticles = [];

    // Щупальца
    const tentacles = Array.from({length: 5}, (_, i) => ({
        points: Array.from({length: 12}, () => ({x: octo.x, y: octo.y})),
        offset: (Math.PI * 2 / 5) * i
    }));

    // Отслеживание курсора
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        
        if (!gameMode) {
            isIdle = false;
            bubble.classList.remove('visible');
            clearTimeout(idleTimer);
            idleTimer = setTimeout(() => {
                isIdle = true;
                showBubble("Анализирую ваши процессы.<br>Начнем аудит?", true);
            }, 10000);
        }
    });

    // Триггер игры (3 клика)
    window.addEventListener('click', (e) => {
        // Проверка клика по осьминогу
        const dist = Math.hypot(e.clientX - octo.x, e.clientY - octo.y);
        if (dist < 40 && !gameMode) {
            clickCount++;
            clearTimeout(clickTimer);
            clickTimer = setTimeout(() => clickCount = 0, 1000);
            
            if (clickCount >= 3) {
                startGame();
            }
        }
    });

    function showBubble(text, showBtn = false) {
        let html = text;
        if (showBtn) {
            html += `<br><a href="#contact" class="ai-btn">ЗАПИСАТЬСЯ</a>`;
        }
        bubble.innerHTML = html;
        bubble.classList.add('visible');
    }

    function startGame() {
        gameMode = true;
        score = 0;
        gameTime = 60 * 60; // 60 секунд (при 60 FPS)
        chaosParticles = [];
        chaosUI.style.display = 'block';
        chaosUI.innerText = `CHAOS HUNTER | Ошибок: ${score}`;
        bubble.classList.remove('visible');
        octo.scale = 1.2; // Эффект старта
        setTimeout(() => octo.scale = 1, 300);
    }

    function spawnChaos() {
        if (Math.random() < 0.03 && chaosParticles.length < 10) {
            chaosParticles.push({
                x: Math.random() > 0.5 ? 0 : width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                radius: 8 + Math.random() * 6
            });
        }
    }

    // Главный цикл
    function render() {
        ctx.clearRect(0, 0, width, height);
        time += 0.05;

        let targetX = mouse.x;
        let targetY = mouse.y;

        if (isIdle && !gameMode) {
            targetX += Math.sin(time * 0.5) * 20;
            targetY += Math.cos(time * 0.3) * 20;
        }

        // Движение
        octo.x += (targetX - octo.x) * 0.06;
        octo.y += (targetY - octo.y) * 0.06;
        let angle = Math.atan2(targetY - octo.y, targetX - octo.x);

        // Отрисовка щупалец
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = COLOR;

        tentacles.forEach((tentacle, index) => {
            let pts = tentacle.points;
            pts[0].x = octo.x + Math.cos(angle + Math.PI + tentacle.offset * 0.5) * 12;
            pts[0].y = octo.y + Math.sin(angle + Math.PI + tentacle.offset * 0.5) * 12;

            ctx.beginPath();
            ctx.moveTo(pts[0].x, pts[0].y);

            for (let i = 1; i < pts.length; i++) {
                let wave = Math.sin(time + i * 0.2 + tentacle.offset) * (isIdle ? 4 : 2);
                let tx = pts[i-1].x - Math.cos(angle) * 8 + Math.cos(angle + Math.PI/2) * wave;
                let ty = pts[i-1].y - Math.sin(angle) * 8 + Math.sin(angle + Math.PI/2) * wave;

                pts[i].x += (tx - pts[i].x) * 0.4;
                pts[i].y += (ty - pts[i].y) * 0.4;
                ctx.lineTo(pts[i].x, pts[i].y);
            }
            ctx.lineWidth = 12 - index; 
            ctx.stroke();
        });

        // Тело
        ctx.beginPath();
        ctx.arc(octo.x, octo.y, 20 * octo.scale, 0, Math.PI * 2);
        ctx.fillStyle = COLOR;
        ctx.fill();

        // Глаза
        let eyeOffX = Math.cos(angle) * 6;
        let eyeOffY = Math.sin(angle) * 6;
        ctx.beginPath();
        ctx.arc(octo.x + eyeOffX - 6, octo.y + eyeOffY - 2, 3, 0, Math.PI * 2);
        ctx.arc(octo.x + eyeOffX + 6, octo.y + eyeOffY - 2, 3, 0, Math.PI * 2);
        ctx.fillStyle = EYE_COLOR;
        ctx.shadowColor = EYE_COLOR;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Логика игры
        if (gameMode) {
            gameTime--;
            spawnChaos();

            for (let i = chaosParticles.length - 1; i >= 0; i--) {
                let p = chaosParticles[i];
                p.x += p.vx;
                p.y += p.vy;

                // Отрисовка хаоса
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = '#ef4444'; // Красный хаос
                ctx.shadowColor = '#ef4444';
                ctx.shadowBlur = 10;
                ctx.fill();
                ctx.shadowBlur = 0;

                // Коллизия (поедание)
                if (Math.hypot(p.x - octo.x, p.y - octo.y) < 30) {
                    chaosParticles.splice(i, 1);
                    score++;
                    chaosUI.innerText = `CHAOS HUNTER | Ошибок: ${score}`;
                    octo.scale = 1.3; // Эффект поедания
                    setTimeout(() => octo.scale = 1, 150);
                }
            }

            if (gameTime <= 0) {
                gameMode = false;
                chaosUI.style.display = 'none';
                chaosParticles = [];
                if (score >= 10) {
                    showBubble(`Хаос уничтожен! (${score})<br>Наведем такой же порядок в вашем бизнесе?`, true);
                } else {
                    showBubble("Хаос сопротивляется...<br>Обсудим, как это исправить?", true);
                }
            }
        }

        // Обновление позиции баббла
        if (bubble.classList.contains('visible')) {
            bubble.style.left = Math.min(width - 220, octo.x + 30) + 'px';
            bubble.style.top = Math.max(20, octo.y - 60) + 'px';
        }

        requestAnimationFrame(render);
    }

    render();
})();
