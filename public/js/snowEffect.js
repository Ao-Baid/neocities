(function() {
    const canvas = document.getElementById('snowCanvas');
    const btn = document.getElementById('snowToggleBtn');
    let animationId = null;
    let snowflakes = [];
    let isSnowing = false;

    const SNOW_COUNT = 80;
    const BASE_SPEED = 0.8;
    const PIXEL_SIZE =  4;


    let currentWind = 0;
    let targetWind = 0;
    const WIND_STRENGTH = 0.6;
    const WIND_SMOOTHING = 0.05;
    let mouseXPercent = 0.5;

    let mouseInside = true;

    let viewportWidth = 0;
    let viewportHeight = 0;


    function resizeCanvas() {
        const vv = window.visualViewport;
        const width  = vv ? vv.width  : window.innerWidth;
        const height = vv ? vv.height : window.innerHeight;
        const dpr = window.devicePixelRatio || 1;

        viewportWidth  = width;
        viewportHeight = height;

        canvas.style.width  = `${width}px`;
        canvas.style.height = `${height}px`;
        canvas.width  = Math.round(width  * dpr);
        canvas.height = Math.round(height * dpr);

        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.imageSmoothingEnabled = false;
        }

        initSnow(); // called AFTER viewportWidth/Height are set
    }

    function initSnow() {
        snowflakes = [];
        const count = typeof SNOW_COUNT !== 'undefined' ? SNOW_COUNT : 80;
        for (let i = 0; i < count; i++) {
            snowflakes.push({
                x: Math.random() * viewportWidth,   // uses the ACTUAL current viewport
                y: Math.random() * viewportHeight,  
                speed: BASE_SPEED + Math.random() * 1.5,
                size: PIXEL_SIZE,
                driftSpeed: (Math.random() - 0.5) * 0.4,
                windSensitivity: Math.random()
            });
    }
}

    function drawPixelatedSnow() {
        if (!canvas.getContext) return;
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.imageSmoothingEnabled = false;

        for (let s of snowflakes){
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fillRect(s.x, s.y, s.size, s.size);
            ctx.fillStyle = 'rgba(200, 220, 255, 0.6)';
            ctx.fillRect(s.x + 1, s.y + 1, 1, 1);
        }

    }

    function updateSnow() {
        currentWind = currentWind + (targetWind - currentWind) * WIND_SMOOTHING;
        
        for (let s of snowflakes) {
            s.y += s.speed;

            s.x += s.driftSpeed + (currentWind * s.windSensitivity);
            if (s.y > canvas.height) {
                s.y = -s.size;
                s.x = Math.random() * canvas.width;
            }
            if (s.x > canvas.width + s.size){
                s.x = -s.size;
            } else if (s.x < -s.size){
                s.x = canvas.width + s.size;
            }
        }
    }

    function animateSnow(){
        if(!isSnowing) return;
        updateSnow();
        drawPixelatedSnow();
        animationId = requestAnimationFrame(animateSnow);
    }

    function updateWindFromMouse()
    {
        if(!mouseInside){
            targetWind = 0;
            return;
        }
        targetWind = (mouseXPercent - 0.5) * 2 * WIND_STRENGTH;
    }

    function onMouseMove(event){
        mouseXPercent = event.clientX / window.innerWidth;
        mouseInside = true;
        updateWindFromMouse();
    }

    function onMouseLeave(){
        mouseInside = false;
        updateWindFromMouse();
    }

    function onMouseEnter(){
        mouseInside = true;
        updateWindFromMouse();
    }

    function startSnow() {
        if (isSnowing) return;
        resizeCanvas();
        initSnow();
        isSnowing = true;
        canvas.style.display = 'block';
        animateSnow();
        if (btn) btn.textContent = 'Snow Off';

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseleave', onMouseLeave);
        window.addEventListener('mouseenter', onMouseEnter);
        

    }
        
    function stopSnow() {
        isSnowing = false;
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.style.display = 'none';
        if (btn) btn.textContent = '❄️ Snow ON';

        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseleave', onMouseLeave);
        window.removeEventListener('mouseenter', onMouseEnter);

        currentWind = 0;
        targetWind = 0;
    }

    window.toggleSnow = function() {
        if (isSnowing) {
            stopSnow();
        } else {
            startSnow();
        }
    };

    window.addEventListener('resize', () => {
        if (isSnowing) {
            resizeCanvas();
            initSnow();
        }
    });

    function loadSnowPreference() {
        const savedPreference = localStorage.getItem('snowEnabled');
        if (savedPreference === null) {
        return true;  // Default to ON
        }
        return savedPreference === 'true';
    }

    function saveSnowPreference(isActive) {
        localStorage.setItem('snowEnabled', isActive);
    }

    const originalStart = startSnow;
    const originalStop = stopSnow;
    
    window.startSnow = function() {
        originalStart();
        saveSnowPreference(true);
    };
    
    window.stopSnow = function() {
        originalStop();
        saveSnowPreference(false);
    };
    
    window.toggleSnow = function() {
        if (isSnowing) {
        window.stopSnow();
        } else {
        window.startSnow();
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
        if (btn) btn.addEventListener('click', window.toggleSnow);
        if (loadSnowPreference()) {
            window.startSnow();
        }
        });
    } else {
        if (btn) btn.addEventListener('click', window.toggleSnow);
        if (loadSnowPreference()) {
        window.startSnow();
        }
    }

}

)();