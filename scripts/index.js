let h1Node = document.querySelector("h1");

h1Node.addEventListener("mouseenter", function(e) {
    let a = Math.random() * 10 - 5;
    h1Node.style.transform = "rotate(" + a + "deg) scale(1.1)";
    h1Node.innerText = "Welcome to Meowboard ^_^"
});

h1Node.addEventListener("mouseleave", function(e) {
    h1Node.style.transform = "rotate(0deg) scale(1)";
    h1Node.innerText = "Welcome to Meowboard :3"
});

const main = document.querySelector("main");
const cards = document.querySelectorAll(".card");

const linksLayer = document.createElementNS("http://www.w3.org/2000/svg", "svg");

linksLayer.classList.add("links-layer");
main.prepend(linksLayer);

const activeLinks = [];


let maxZIndex = 1;

function random(min, max) {
    return Math.random() * (max - min) + min;
}

function randomCardSetup(card) {
    const size = random(140, 260);

    card.style.width = `${size}px`;

    const mainRect = main.getBoundingClientRect();

    const maxX = mainRect.width - size;
    const maxY = mainRect.height - size - 70;

    const x = random(0, Math.max(0, maxX));
    const y = random(0, Math.max(0, maxY));

    card.style.left = `${x}px`;
    card.style.top = `${y}px`;

    card.style.setProperty("--float-x-1", `${random(-8, 8)}px`);
    card.style.setProperty("--float-y-1", `${random(-8, 8)}px`);
    card.style.setProperty("--float-x-2", `${random(-8, 8)}px`);
    card.style.setProperty("--float-y-2", `${random(-8, 8)}px`);

    card.style.setProperty("--rotate-1", `${random(-4, 4)}deg`);
    card.style.setProperty("--rotate-2", `${random(-4, 4)}deg`);

    card.style.animationDuration = `${random(2.5, 5)}s`;
    card.style.animationDelay = `${random(0, 2)}s`;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
}

function startInertia(card, velocityX, velocityY) {
    card.classList.add("inertia");

    let x = parseFloat(card.style.left) || 0;
    let y = parseFloat(card.style.top) || 0;

    let lastTime = performance.now();

    const friction = 0.94;
    const bounce = 0.35;
    const minSpeed = 0.02;
    const maxSpeed = 1.8;

    const speed = Math.hypot(velocityX, velocityY);

    if (speed > maxSpeed) {
        const scale = maxSpeed / speed;

        velocityX *= scale;
        velocityY *= scale;
    }

    function animate(now) {
        const deltaTime = now - lastTime;
        lastTime = now;

        const mainRect = main.getBoundingClientRect();

        const maxX = mainRect.width - card.offsetWidth;
        const maxY = mainRect.height - card.offsetHeight;

        x += velocityX * deltaTime;
        y += velocityY * deltaTime;

        if (x < 0) {
            x = 0;
            velocityX *= -bounce;
        }

        if (x > maxX) {
            x = maxX;
            velocityX *= -bounce;
        }

        if (y < 0) {
            y = 0;
            velocityY *= -bounce;
        }

        if (y > maxY) {
            y = maxY;
            velocityY *= -bounce;
        }

        const normalizedFriction = Math.pow(friction, deltaTime / 16.67);

        velocityX *= normalizedFriction;
        velocityY *= normalizedFriction;

        card.style.left = `${x}px`;
        card.style.top = `${y}px`;

        if (Math.abs(velocityX) < minSpeed && Math.abs(velocityY) < minSpeed) {
            card.classList.remove("inertia");
            card.inertiaAnimationId = null;
            return;
        }

        card.inertiaAnimationId = requestAnimationFrame(animate);
    }

    card.inertiaAnimationId = requestAnimationFrame(animate);
}
cards.forEach((card) => {
    randomCardSetup(card);

    let shiftX = 0;
    let shiftY = 0;

    let velocityX = 0;
    let velocityY = 0;

    let lastPointerX = 0;
    let lastPointerY = 0;
    let lastPointerTime = 0;

    card.addEventListener("pointerdown", function (e) {
        const interactiveMedia = e.target.closest(
            "video, audio, button, input, textarea, select, a"
        );

        if (interactiveMedia) {
            return;
        }

        if (card.inertiaAnimationId) {
            cancelAnimationFrame(card.inertiaAnimationId);
            card.inertiaAnimationId = null;
        }

        card.classList.remove("inertia");

        const cardRect = card.getBoundingClientRect();

        shiftX = e.clientX - cardRect.left;
        shiftY = e.clientY - cardRect.top;

        velocityX = 0;
        velocityY = 0;

        lastPointerX = e.clientX;
        lastPointerY = e.clientY;
        lastPointerTime = performance.now();

        card.classList.add("dragging");
        card.style.zIndex = ++maxZIndex;

        card.setPointerCapture(e.pointerId);
    });

    card.addEventListener("pointermove", function (e) {
        if (!card.classList.contains("dragging")) return;

        const now = performance.now();
        const deltaTime = Math.max(1, now - lastPointerTime);

        velocityX = (e.clientX - lastPointerX) / deltaTime;
        velocityY = (e.clientY - lastPointerY) / deltaTime;

        lastPointerX = e.clientX;
        lastPointerY = e.clientY;
        lastPointerTime = now;

        const mainRect = main.getBoundingClientRect();

        let x = e.clientX - mainRect.left - shiftX;
        let y = e.clientY - mainRect.top - shiftY;

        const maxX = mainRect.width - card.offsetWidth;
        const maxY = mainRect.height - card.offsetHeight;

        x = clamp(x, 0, maxX);
        y = clamp(y, 0, maxY);

        card.style.left = `${x}px`;
        card.style.top = `${y}px`;
    });

    card.addEventListener("pointerup", function (e) {
        if (!card.classList.contains("dragging")) return;

        card.classList.remove("dragging");

        if (card.hasPointerCapture(e.pointerId)) {
            card.releasePointerCapture(e.pointerId);
        }

        startInertia(card, velocityX, velocityY);
    });

    card.addEventListener("pointercancel", function (e) {
        if (!card.classList.contains("dragging")) return;

        card.classList.remove("dragging");

        if (card.hasPointerCapture(e.pointerId)) {
            card.releasePointerCapture(e.pointerId);
        }

        startInertia(card, velocityX, velocityY);
    });
});


function getCardCenter(card) {
    const mainRect = main.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();

    return {
        x: cardRect.left - mainRect.left + cardRect.width / 2,
        y: cardRect.top - mainRect.top + cardRect.height / 2
    };
}

function createLinkBetween(cardA, cardB) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");

    line.classList.add("link-line");

    linksLayer.appendChild(line);

    const link = {
        line,
        cardA,
        cardB
    };

    activeLinks.push(link);

    updateSingleLink(link);

    const visibleTime = random(300, 1400);
    const fadeTime = 1200;

    setTimeout(() => {
        line.classList.add("fading");

        setTimeout(() => {
            line.remove();

            const index = activeLinks.indexOf(link);

            if (index !== -1) {
                activeLinks.splice(index, 1);
            }
        }, fadeTime);
    }, visibleTime);
}

function updateSingleLink(link) {
    const pointA = getCardCenter(link.cardA);
    const pointB = getCardCenter(link.cardB);

    link.line.setAttribute("x1", pointA.x);
    link.line.setAttribute("y1", pointA.y);
    link.line.setAttribute("x2", pointB.x);
    link.line.setAttribute("y2", pointB.y);
}

function updateLinks() {
    activeLinks.forEach(updateSingleLink);

    requestAnimationFrame(updateLinks);
}

function createRandomLink() {
    if (cards.length < 2) return;

    const firstIndex = Math.floor(random(0, cards.length));

    let secondIndex = Math.floor(random(0, cards.length));

    while (secondIndex === firstIndex) {
        secondIndex = Math.floor(random(0, cards.length));
    }

    createLinkBetween(cards[firstIndex], cards[secondIndex]);
}

function scheduleRandomLinks() {
    const delay = random(500, 2500);

    setTimeout(() => {
        createRandomLink();
        scheduleRandomLinks();
    }, delay);
}

updateLinks();
scheduleRandomLinks();