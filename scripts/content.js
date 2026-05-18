/* ---------- Run on page load ---------- */
function init() {
    console.log("init - WordleVGC");
    findWordle(); //uses an observer to keep checking for when the wordle div is populated
}

function findWordle() {
    console.log("timer");
    const observer = new MutationObserver(() => {
        
    const words_div = document.querySelector('[class*="Toolbar-module_toolbar__DGjo1"]'); //when you're in the actual game
    const badge_div = document.querySelector('[class*="lire-badge-detail-container"]'); //when you beat the wordle
    const admire_button = document.querySelector('[data-testid*="Admire"]'); //when you beat the wordle and load the page back
    const play_button = document.querySelector('[data-testid*="Play"]'); //when you launch wordle for the first time

    if (words_div) {
        console.log("Found div");
        editPage(div);
    }
    else {
        console.log("div not found");
    }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

function editPage(div) {
    const title = document.createElement("h1");
    title.textContent = "WordleVGC";
    title.classList.add("text");

    const timer = document.createElement("h2");
    timer.textContent = "00:00:00";
    timer.classList.add("timer");

    const wordle_vgc_div = document.createElement("div");
    wordle_vgc_div.append(title);
    wordle_vgc_div.append(timer);
    wordle_vgc_div.style.alignContent = "center";

    

    const firstChild = div.firstElementChild;
    div.insertBefore(wordle_vgc_div, firstChild.nextSibling);

    startTimer(timer);
}

function startTimer(timer) {
    const start = Date.now();

    const timerInterval = setInterval(() => {
        const now = Date.now();
        const elapsed = now - start;

        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        const milliseconds = elapsed % 1000;

        const msStr = String(Math.floor(milliseconds / 10)).padStart(2, '0');
        const secStr = String(seconds).padStart(2, '0');
        const minStr = String(minutes).padStart(2, '0');

        timer.innerHTML = `${minStr}:${secStr}:${msStr}`;

        if (minutes >= 59 && seconds >= 59 && miliseconds >= 99) { 
            clearInterval(timerInterval);
        }
    }, 10);
}

init();
console.log(Object.getOwnPropertyNames(window));