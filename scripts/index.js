let h1Node = document.querySelector("h1");
h1Node.dataset.text = h1Node.innerText;

h1Node.addEventListener("mouseenter", function (e) {
    let a = 1;

    h1Node.style.transform = "rotate(" + a + "deg) scale(1.1)";
    h1Node.innerText = "Welcome to Meowboard ^_^";
    h1Node.dataset.text = h1Node.innerText;
});

h1Node.addEventListener("mouseleave", function (e) {
    h1Node.style.transform = "rotate(0deg) scale(1)";
    h1Node.innerText = "Welcome to Meowboard :3";
    h1Node.dataset.text = h1Node.innerText;
});

const main = document.querySelector("main");
const cards = document.querySelectorAll(".card");

function createEntryGate() {
    const gate = document.createElement("div");

    gate.classList.add("entry-gate");

    gate.innerHTML = `
        <div class="entry-box">
            <h2 class="entry-title">Meowboard is locked</h2>
            <p class="entry-text">Move the key to wake the board.</p>

            <div class="key-track">
                <div class="key-handle">⌁</div>
            </div>
        </div>
    `;

    document.body.append(gate);

    const track = gate.querySelector(".key-track");
    const handle = gate.querySelector(".key-handle");

    let isDraggingKey = false;
    let startPointerX = 0;
    let startHandleX = 0;
    let currentX = 0;

    function getMaxHandleX() {
        return track.offsetWidth - handle.offsetWidth - 12;
    }

    function setHandleX(x) {
        currentX = clamp(x, 0, getMaxHandleX());
        handle.style.transform = `translateX(${currentX}px)`;
    }

    function unlockBoard() {
        gate.classList.add("hidden");

        playRandomBoardAudio();

        setTimeout(() => {
            gate.remove();
        }, 500);
    }

    handle.addEventListener("pointerdown", function (e) {
        isDraggingKey = true;

        startPointerX = e.clientX;
        startHandleX = currentX;

        handle.setPointerCapture(e.pointerId);
    });

    handle.addEventListener("pointermove", function (e) {
        if (!isDraggingKey) return;

        const deltaX = e.clientX - startPointerX;

        setHandleX(startHandleX + deltaX);
    });

    handle.addEventListener("pointerup", function (e) {
        if (!isDraggingKey) return;

        isDraggingKey = false;

        if (handle.hasPointerCapture(e.pointerId)) {
            handle.releasePointerCapture(e.pointerId);
        }

        const unlockProgress = currentX / getMaxHandleX();

        if (unlockProgress >= 0.85) {
            setHandleX(getMaxHandleX());
            unlockBoard();
        } else {
            handle.style.transition = "transform 0.25s ease";
            setHandleX(0);

            setTimeout(() => {
                handle.style.transition = "";
            }, 250);
        }
    });

    handle.addEventListener("pointercancel", function (e) {
        isDraggingKey = false;

        if (handle.hasPointerCapture(e.pointerId)) {
            handle.releasePointerCapture(e.pointerId);
        }

        handle.style.transition = "transform 0.25s ease";
        setHandleX(0);

        setTimeout(() => {
            handle.style.transition = "";
        }, 250);
    });
}

function playRandomBoardAudio() {
    const audios = Array.from(document.querySelectorAll(".audio-placeholder audio"));

    if (audios.length === 0) {
        return;
    }

    audios.forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
    });

    const randomAudio = audios[Math.floor(random(0, audios.length))];

    randomAudio.volume = 0.45;

    const playPromise = randomAudio.play();

    if (playPromise) {
        playPromise.catch((error) => {
            console.warn("Audio play was blocked or failed:", error);
        });
    }
}

document.documentElement.style.overflowY = "auto";
document.body.style.overflowY = "auto";
document.body.style.overflowX = "hidden";

main.style.position = "relative";
main.style.overflow = "hidden";

const linksLayer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
linksLayer.classList.add("links-layer");
main.prepend(linksLayer);

const starLinksLayer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
starLinksLayer.classList.add("star-links-layer");
main.append(starLinksLayer);

const activeLinks = [];

let maxZIndex = 1;
let starAnimationToken = 0;
let resizeTimer = null;

function random(min, max) {
    return Math.random() * (max - min) + min;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(random(0, i + 1));

        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
}

function getCardSizeRange(card, maxAvailableWidth) {
    const isQuoteCard = card.querySelector(".quote-placeholder");

    const baseMinSize = isQuoteCard ? 240 : 250;
    const baseMaxSize = isQuoteCard ? 360 : 400;

    const cappedMaxSize = Math.max(120, Math.min(baseMaxSize, maxAvailableWidth));
    const cappedMinSize = Math.min(baseMinSize, cappedMaxSize);

    return {
        min: cappedMinSize,
        max: cappedMaxSize
    };
}

function setupCardVisuals(card, maxAvailableWidth) {
    const sizeRange = getCardSizeRange(card, maxAvailableWidth);
    const size = random(sizeRange.min, sizeRange.max);

    card.style.width = `${size}px`;

    card.style.setProperty("--float-x-1", `${random(-8, 8)}px`);
    card.style.setProperty("--float-y-1", `${random(-8, 8)}px`);
    card.style.setProperty("--float-x-2", `${random(-8, 8)}px`);
    card.style.setProperty("--float-y-2", `${random(-8, 8)}px`);

    card.style.setProperty("--rotate-1", `${random(-4, 4)}deg`);
    card.style.setProperty("--rotate-2", `${random(-4, 4)}deg`);

    card.style.animationDuration = `${random(2.5, 5)}s`;
    card.style.animationDelay = `${random(0, 2)}s`;
}


function setupInitialCardsLayout() {
    const cardsArray = shuffleArray(Array.from(cards));

    const mainRect = main.getBoundingClientRect();

    const boardWidth = mainRect.width || window.innerWidth;

    const padding = clamp(boardWidth * 0.04, 18, 56);

    const minGap = clamp(boardWidth * 0.025, 22, 40);
    const maxGap = clamp(boardWidth * 0.095, 70, 150);

    const maxOverlapRatio = 0.35;

    const usableWidth = Math.max(120, boardWidth - padding * 2);

    cardsArray.forEach((card) => {
        if (card.inertiaAnimationId) {
            cancelAnimationFrame(card.inertiaAnimationId);
            card.inertiaAnimationId = null;
        }

        card.style.transition = "none";
        card.style.transform = "";
        card.style.animationPlayState = "";
        card.classList.remove("dragging");
        card.classList.remove("inertia");
        card.classList.remove("forming-star");

        setupCardVisuals(card, usableWidth);
    });

    const rows = [];

    let currentRow = {
        cards: [],
        width: 0,
        height: 0
    };

    cardsArray.forEach((card) => {
        const cardWidth = card.offsetWidth;
        const cardHeight = card.offsetHeight;

        const nextWidth = currentRow.cards.length === 0
            ? cardWidth
            : currentRow.width + minGap + cardWidth;

        if (currentRow.cards.length > 0 && nextWidth > usableWidth) {
            rows.push(currentRow);

            currentRow = {
                cards: [],
                width: 0,
                height: 0
            };
        }

        currentRow.cards.push(card);

        currentRow.width = currentRow.cards.length === 1
            ? cardWidth
            : currentRow.width + minGap + cardWidth;

        currentRow.height = Math.max(currentRow.height, cardHeight);
    });

    if (currentRow.cards.length > 0) {
        rows.push(currentRow);
    }

    let y = padding;

    rows.forEach((row) => {
        const rowExtraHeight = random(60, 150);
        const rowBandHeight = row.height + rowExtraHeight;

        const totalCardsWidth = row.cards.reduce((sum, card) => {
            return sum + card.offsetWidth;
        }, 0);

        const gaps = [];

        for (let i = 0; i < row.cards.length - 1; i++) {
            gaps.push(random(minGap, maxGap));
        }

        let totalGapsWidth = gaps.reduce((sum, gap) => {
            return sum + gap;
        }, 0);

        let rowWidth = totalCardsWidth + totalGapsWidth;

        if (rowWidth > usableWidth && gaps.length > 0) {
            const overflow = rowWidth - usableWidth;
            const compressionPerGap = overflow / gaps.length;

            const smallestCardWidth = Math.min(...row.cards.map((card) => {
                return card.offsetWidth;
            }));

            const maxNegativeGap = -smallestCardWidth * maxOverlapRatio;

            for (let i = 0; i < gaps.length; i++) {
                gaps[i] = Math.max(gaps[i] - compressionPerGap, maxNegativeGap);
            }

            totalGapsWidth = gaps.reduce((sum, gap) => {
                return sum + gap;
            }, 0);

            rowWidth = totalCardsWidth + totalGapsWidth;
        }

        if (rowWidth > usableWidth && gaps.length > 0) {
            const overflow = rowWidth - usableWidth;
            const extraCompressionPerGap = overflow / gaps.length;

            for (let i = 0; i < gaps.length; i++) {
                gaps[i] -= extraCompressionPerGap;
            }

            totalGapsWidth = gaps.reduce((sum, gap) => {
                return sum + gap;
            }, 0);

            rowWidth = totalCardsWidth + totalGapsWidth;
        }

        const freeSpace = Math.max(0, usableWidth - rowWidth);

        let x = padding + random(0, freeSpace);

        row.cards.forEach((card, index) => {
            const availableVerticalJitter = Math.max(0, rowBandHeight - card.offsetHeight);

            const verticalBias = random(-0.15, 0.15) * rowBandHeight;

            let cardY = y + random(0, availableVerticalJitter) + verticalBias;

            cardY = clamp(
                cardY,
                y,
                y + rowBandHeight - card.offsetHeight
            );

            const maxCardX = Math.max(padding, boardWidth - padding - card.offsetWidth);

            const cardX = clamp(
                x,
                padding,
                maxCardX
            );

            card.style.left = `${cardX}px`;
            card.style.top = `${cardY}px`;

            const isLastCard = index === row.cards.length - 1;

            if (!isLastCard) {
                x += card.offsetWidth + gaps[index];
            }
        });

        y += rowBandHeight + random(minGap * 0.4, maxGap * 0.8);
    });

    const contentHeight = y + padding;
    const minMainHeight = Math.max(300, window.innerHeight - main.getBoundingClientRect().top);

    main.style.height = `${Math.max(contentHeight, minMainHeight)}px`;

    cardsArray.forEach((card) => {
        card.offsetHeight;
        card.style.transition = "";
    });
}
function getCardCenter(card) {
    const mainRect = main.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();

    return {
        x: cardRect.left - mainRect.left + cardRect.width / 2,
        y: cardRect.top - mainRect.top + cardRect.height / 2
    };
}

function getAdaptiveStarPoints(selectedCards) {
    const mainRect = main.getBoundingClientRect();

    const padding = Math.max(16, Math.min(mainRect.width, mainRect.height) * 0.04);

    const maxCardWidth = Math.max(...selectedCards.map((card) => card.offsetWidth));
    const maxCardHeight = Math.max(...selectedCards.map((card) => card.offsetHeight));

    const centerX = mainRect.width / 2;
    const centerY = window.scrollY + window.innerHeight / 2 - mainRect.top;

    const radiusX = mainRect.width / 2 - maxCardWidth / 2 - padding;
    const radiusY = window.innerHeight / 2 - maxCardHeight / 2 - padding;

    const radius = Math.max(40, Math.min(radiusX, radiusY));

    const points = [];

    for (let i = 0; i < 5; i++) {
        const angle = -Math.PI / 2 + i * Math.PI * 2 / 5;

        points.push({
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius
        });
    }

    return points;
}

function prepareCardForStarFlight(card) {
    if (card.inertiaAnimationId) {
        cancelAnimationFrame(card.inertiaAnimationId);
        card.inertiaAnimationId = null;
    }

    const mainRect = main.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();

    const currentX = cardRect.left - mainRect.left;
    const currentY = cardRect.top - mainRect.top;

    card.style.transition = "none";
    card.style.left = `${currentX}px`;
    card.style.top = `${currentY}px`;
    card.style.transform = "none";
    card.style.animationPlayState = "paused";

    card.classList.remove("dragging");
    card.classList.remove("inertia");
    card.classList.add("forming-star");

    card.style.zIndex = ++maxZIndex;

    card.offsetHeight;
}

function flyCardToStarPoint(card, centerX, centerY, moveTime) {
    prepareCardForStarFlight(card);

    const mainRect = main.getBoundingClientRect();

    const currentCenter = getCardCenter(card);

    let directionX = centerX - currentCenter.x;
    let directionY = centerY - currentCenter.y;

    let distance = Math.hypot(directionX, directionY);

    if (distance < 1) {
        directionX = centerX - mainRect.width / 2;
        directionY = centerY - mainRect.height / 2;
        distance = Math.hypot(directionX, directionY);
    }

    if (distance < 1) {
        const angle = random(0, Math.PI * 2);

        directionX = Math.cos(angle);
        directionY = Math.sin(angle);
        distance = 1;
    }

    const normalizedX = directionX / distance;
    const normalizedY = directionY / distance;

    const targetX = centerX - card.offsetWidth / 2;
    const targetY = centerY - card.offsetHeight / 2;

    const inertiaSpeed = 1.25;

    const velocityX = normalizedX * inertiaSpeed;
    const velocityY = normalizedY * inertiaSpeed;

    card.style.transition = `
        left ${moveTime}ms linear,
        top ${moveTime}ms linear,
        scale 0.25s ease,
        box-shadow 0.25s ease
    `;

    requestAnimationFrame(() => {
        card.style.left = `${targetX}px`;
        card.style.top = `${targetY}px`;
    });

    return {
        card,
        velocityX,
        velocityY
    };
}

function startInertia(card, velocityX, velocityY, options = {}) {
    card.style.transition = "";

    card.classList.remove("forming-star");
    card.classList.add("inertia");

    let x = parseFloat(card.style.left) || 0;
    let y = parseFloat(card.style.top) || 0;

    let lastTime = performance.now();

    const friction = 0.94;
    const bounce = 0.35;
    const minSpeed = 0.02;
    const maxSpeed = 0.3;

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

            if (options.restoreFloat) {
                card.style.transform = "";
                card.style.animationPlayState = "";
            }

            return;
        }

        card.inertiaAnimationId = requestAnimationFrame(animate);
    }

    card.inertiaAnimationId = requestAnimationFrame(animate);
}

setupInitialCardsLayout();

cards.forEach((card) => {
    let shiftX = 0;
    let shiftY = 0;

    let velocityX = 0;
    let velocityY = 0;

    let lastPointerX = 0;
    let lastPointerY = 0;
    let lastPointerTime = 0;

    card.addEventListener("pointerdown", function (e) {
        const interactiveMedia = e.target.closest(
            "video, iframe, audio, button, input, textarea, select, a"
        );

        if (interactiveMedia) {
            return;
        }

        if (card.inertiaAnimationId) {
            cancelAnimationFrame(card.inertiaAnimationId);
            card.inertiaAnimationId = null;
        }

        const mainRect = main.getBoundingClientRect();
        const cardRect = card.getBoundingClientRect();

        card.style.transition = "none";
        card.style.left = `${cardRect.left - mainRect.left}px`;
        card.style.top = `${cardRect.top - mainRect.top}px`;
        card.style.transform = "";
        card.style.animationPlayState = "";

        card.classList.remove("inertia");
        card.classList.remove("forming-star");

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

function createCustomLinkBetween(cardA, cardB, options = {}) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");

    line.classList.add("link-line");

    if (options.className) {
        line.classList.add(options.className);
    }

    if (options.fadeTime) {
        line.style.transitionDuration = `${options.fadeTime}ms`;
    }

    const layer = options.layer ?? linksLayer;

    layer.appendChild(line);

    const link = {
        line,
        cardA,
        cardB
    };

    activeLinks.push(link);

    updateSingleLink(link);

    const visibleTime = options.visibleTime ?? 1800;
    const fadeTime = options.fadeTime ?? 1200;

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

function createLinkBetween(cardA, cardB) {
    createCustomLinkBetween(cardA, cardB, {
        visibleTime: random(300, 1400),
        fadeTime: 1200,
        layer: linksLayer
    });
}

function getRandomCards(count) {
    const cardsArray = Array.from(cards);

    for (let i = cardsArray.length - 1; i > 0; i--) {
        const j = Math.floor(random(0, i + 1));

        [cardsArray[i], cardsArray[j]] = [cardsArray[j], cardsArray[i]];
    }

    return cardsArray.slice(0, count);
}

function createStarBetweenCards() {
    if (cards.length < 5) {
        return;
    }

    const currentToken = ++starAnimationToken;

    const selectedCards = getRandomCards(5);
    const starPoints = getAdaptiveStarPoints(selectedCards);

    const starOrder = [0, 2, 4, 1, 3, 0];

    const visibleTime = 2600;
    const fadeTime = 1400;
    const moveTime = 750;

    const starFlights = selectedCards.map((card, index) => {
        return flyCardToStarPoint(
            card,
            starPoints[index].x,
            starPoints[index].y,
            moveTime
        );
    });

    setTimeout(() => {
        if (currentToken !== starAnimationToken) {
            return;
        }

        for (let i = 0; i < starOrder.length - 1; i++) {
            const cardA = selectedCards[starOrder[i]];
            const cardB = selectedCards[starOrder[i + 1]];

            createCustomLinkBetween(cardA, cardB, {
                className: "star-line",
                visibleTime,
                fadeTime,
                layer: starLinksLayer
            });
        }

        starFlights.forEach((flight) => {
            startInertia(flight.card, flight.velocityX, flight.velocityY, {
                restoreFloat: true
            });
        });
    }, moveTime);
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
    const delay = random(100, 200);

    setTimeout(() => {
        createRandomLink();
        scheduleRandomLinks();
    }, delay);
}


function initPsyBackground() {
    if (window.__psyBgStop) {
        window.__psyBgStop();
    }

    const oldCanvas = document.querySelector("#psy-bg");

    if (oldCanvas) {
        oldCanvas.remove();
    }

    const canvas = document.createElement("canvas");
    canvas.id = "psy-bg";
    document.body.prepend(canvas);

    const ctx = canvas.getContext("2d", {
        alpha: true
    });

    let width = 0;
    let height = 0;
    let animationId = null;
    let isRunning = true;

    const fps = 30;
    const frameDelay = 1000 / fps;
    let lastFrameTime = 0;

    const veins = [];
    const blobs = [];
    const sparks = [];

    let heartbeat = 0;
    let nextFlashTime = 0;
    let flashAlpha = 0;

    function randomBetween(min, max) {
        return Math.random() * (max - min) + min;
    }

    function resizeCanvas() {
        width = window.innerWidth;
        height = window.innerHeight;

        const dpr = 1;

        canvas.width = width * dpr;
        canvas.height = height * dpr;

        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
    }

    function createVein() {
        const x = randomBetween(-40, width + 40);
        const y = randomBetween(-40, height + 40);

        return {
            x,
            y,
            angle: randomBetween(0, Math.PI * 2),
            speed: randomBetween(0.35, 1.15),
            turnSpeed: randomBetween(0.015, 0.05),
            life: randomBetween(120, 240),
            width: randomBetween(0.8, 2.4),
            alpha: randomBetween(0.18, 0.42),
            points: [{ x, y }],
            maxPoints: Math.floor(randomBetween(16, 34))
        };
    }

    function createBlob() {
        return {
            x: randomBetween(0, width),
            y: randomBetween(0, height),
            radius: randomBetween(110, 260),
            phase: randomBetween(0, Math.PI * 2),
            speed: randomBetween(0.0008, 0.002),
            driftX: randomBetween(-0.12, 0.12),
            driftY: randomBetween(-0.12, 0.12),
            alpha: randomBetween(0.035, 0.09)
        };
    }

    function createSpark(x = randomBetween(0, width), y = randomBetween(0, height)) {
        return {
            x,
            y,
            vx: randomBetween(-0.25, 0.25),
            vy: randomBetween(-0.25, 0.25),
            radius: randomBetween(1, 2.2),
            alpha: randomBetween(0.12, 0.42),
            life: randomBetween(18, 55)
        };
    }

    function resetScene() {
        veins.length = 0;
        blobs.length = 0;
        sparks.length = 0;

        for (let i = 0; i < 18; i++) {
            veins.push(createVein());
        }

        for (let i = 0; i < 7; i++) {
            blobs.push(createBlob());
        }

        for (let i = 0; i < 14; i++) {
            sparks.push(createSpark());
        }

        nextFlashTime = performance.now() + randomBetween(1800, 5200);
    }

    function updateHeartbeat(time) {
        const beatLength = 1400;
        const beatPosition = time % beatLength;

        const beatA = Math.exp(-Math.pow((beatPosition - 90) / 70, 2));
        const beatB = Math.exp(-Math.pow((beatPosition - 300) / 100, 2)) * 0.45;

        heartbeat = beatA + beatB;
    }

    function drawBlobs(time) {
        blobs.forEach((blob) => {
            blob.x += blob.driftX;
            blob.y += blob.driftY;

            if (blob.x < -250) blob.x = width + 250;
            if (blob.x > width + 250) blob.x = -250;
            if (blob.y < -250) blob.y = height + 250;
            if (blob.y > height + 250) blob.y = -250;

            const radius = blob.radius + Math.sin(time * blob.speed + blob.phase) * 26 + heartbeat * 18;

            const gradient = ctx.createRadialGradient(
                blob.x,
                blob.y,
                0,
                blob.x,
                blob.y,
                radius
            );

            gradient.addColorStop(0, `rgba(180, 0, 52, ${blob.alpha + heartbeat * 0.025})`);
            gradient.addColorStop(0.45, `rgba(80, 0, 28, ${blob.alpha * 0.65})`);
            gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(blob.x, blob.y, radius, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    function updateAndDrawVeins() {
        ctx.save();

        veins.forEach((vein, index) => {
            vein.life -= 1;

            vein.angle += randomBetween(-vein.turnSpeed, vein.turnSpeed) * (1 + heartbeat);
            vein.x += Math.cos(vein.angle) * vein.speed * (1 + heartbeat * 0.5);
            vein.y += Math.sin(vein.angle) * vein.speed * (1 + heartbeat * 0.5);

            if (
                vein.life <= 0 ||
                vein.x < -80 ||
                vein.x > width + 80 ||
                vein.y < -80 ||
                vein.y > height + 80
            ) {
                veins[index] = createVein();
                return;
            }

            vein.points.push({
                x: vein.x,
                y: vein.y
            });

            if (vein.points.length > vein.maxPoints) {
                vein.points.shift();
            }

            if (vein.points.length < 2) return;

            ctx.beginPath();
            ctx.moveTo(vein.points[0].x, vein.points[0].y);

            for (let i = 1; i < vein.points.length; i++) {
                ctx.lineTo(vein.points[i].x, vein.points[i].y);
            }

            ctx.strokeStyle = `rgba(255, 30, 82, ${vein.alpha + heartbeat * 0.08})`;
            ctx.lineWidth = vein.width + heartbeat * 0.45;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.stroke();

            if (Math.random() < 0.018 + heartbeat * 0.035) {
                sparks.push(createSpark(vein.x, vein.y));
            }
        });

        ctx.restore();
    }

    function updateAndDrawSparks() {
        for (let i = sparks.length - 1; i >= 0; i--) {
            const spark = sparks[i];

            spark.life -= 1;
            spark.alpha *= 0.95;
            spark.x += spark.vx;
            spark.y += spark.vy;

            if (spark.life <= 0 || spark.alpha < 0.02) {
                sparks.splice(i, 1);
                continue;
            }

            ctx.fillStyle = `rgba(255, 150, 170, ${spark.alpha})`;
            ctx.beginPath();
            ctx.arc(spark.x, spark.y, spark.radius, 0, Math.PI * 2);
            ctx.fill();
        }

        if (sparks.length < 18 && Math.random() < 0.08) {
            sparks.push(createSpark());
        }
    }

    function drawBrainPulse(time) {
        const cx = width * 0.5 + Math.sin(time * 0.001) * width * 0.035;
        const cy = height * 0.5 + Math.cos(time * 0.0012) * height * 0.025;

        const radius = Math.min(width, height) * (0.22 + heartbeat * 0.04);

        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);

        gradient.addColorStop(0, `rgba(255, 40, 90, ${0.1 + heartbeat * 0.09})`);
        gradient.addColorStop(0.4, `rgba(130, 0, 42, ${0.055 + heartbeat * 0.05})`);
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    function drawOrganicLines(time) {
        ctx.save();

        ctx.globalAlpha = 0.1 + heartbeat * 0.08;
        ctx.lineWidth = 1;

        for (let i = 0; i < 12; i++) {
            const y = (height / 12) * i + Math.sin(time * 0.001 + i) * 18;

            ctx.beginPath();

            for (let x = -40; x <= width + 40; x += 48) {
                const waveY =
                    y +
                    Math.sin(x * 0.018 + time * 0.0012 + i) * 14 +
                    Math.sin(x * 0.045 - time * 0.0007) * 5;

                if (x === -40) {
                    ctx.moveTo(x, waveY);
                } else {
                    ctx.lineTo(x, waveY);
                }
            }

            ctx.strokeStyle = i % 2 === 0
                ? "rgba(140, 0, 45, 0.35)"
                : "rgba(255, 70, 110, 0.18)";

            ctx.stroke();
        }

        ctx.restore();
    }

    function drawFlash(time) {
        if (time > nextFlashTime) {
            flashAlpha = randomBetween(0.08, 0.18);
            nextFlashTime = time + randomBetween(2200, 6500);
        }

        if (flashAlpha <= 0.002) return;

        ctx.fillStyle = `rgba(255, 35, 90, ${flashAlpha})`;
        ctx.fillRect(0, 0, width, height);

        flashAlpha *= 0.82;
    }

    function animate(time = 0) {
        if (!isRunning) return;

        animationId = requestAnimationFrame(animate);

        if (document.hidden) {
            return;
        }

        if (time - lastFrameTime < frameDelay) {
            return;
        }

        lastFrameTime = time;

        updateHeartbeat(time);

        ctx.fillStyle = "rgba(4, 0, 3, 0.32)";
        ctx.fillRect(0, 0, width, height);

        drawOrganicLines(time);
        drawBrainPulse(time);
        drawBlobs(time);
        updateAndDrawVeins();
        updateAndDrawSparks();
        drawFlash(time);
    }

    function handleResize() {
        resizeCanvas();
        resetScene();
    }

    resizeCanvas();
    resetScene();

    window.addEventListener("resize", handleResize);

    animationId = requestAnimationFrame(animate);

    window.__psyBgStop = function () {
        isRunning = false;

        if (animationId) {
            cancelAnimationFrame(animationId);
        }

        window.removeEventListener("resize", handleResize);

        if (canvas.parentNode) {
            canvas.remove();
        }

        window.__psyBgStop = null;
    };
}


window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(() => {
        setupInitialCardsLayout();
    }, 250);
});


initPsyBackground();
updateLinks();
scheduleRandomLinks();
createEntryGate();

h1Node.addEventListener("click", function () {
    createStarBetweenCards();
});