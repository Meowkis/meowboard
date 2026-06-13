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

cards.forEach((card) => {
    randomCardSetup(card);

    let shiftX = 0;
    let shiftY = 0;

    card.addEventListener("pointerdown", function (e) {
       const interactiveMedia = e.target.closest(
            "video, audio, button, input, textarea, select, a"
        );

        if (interactiveMedia) {
            return;
        }
        const cardRect = card.getBoundingClientRect();

        shiftX = e.clientX - cardRect.left;
        shiftY = e.clientY - cardRect.top;

        card.classList.add("dragging");
        card.style.zIndex = ++maxZIndex;

        card.setPointerCapture(e.pointerId);
    });

    card.addEventListener("pointermove", function (e) {
        if (!card.classList.contains("dragging")) return;

        const mainRect = main.getBoundingClientRect();
        const cardRect = card.getBoundingClientRect();

        let x = e.clientX - mainRect.left - shiftX;
        let y = e.clientY - mainRect.top - shiftY;

        const maxX = mainRect.width - cardRect.width;
        const maxY = mainRect.height - cardRect.height;

        x = Math.max(0, Math.min(x, maxX));
        y = Math.max(0, Math.min(y, maxY));

        card.style.left = `${x}px`;
        card.style.top = `${y}px`;
    });

    card.addEventListener("pointerup", function () {
        card.classList.remove("dragging");
    });

    card.addEventListener("pointercancel", function () {
        card.classList.remove("dragging");
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