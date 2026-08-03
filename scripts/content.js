var wordle_answer = "";
var timer_interval;
var timer_started = false;
var current_date;
var completion_time;

function init() {

    //establish connection to background script
    console.log("init - WordleVGC");

    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2,'0');
    const day = String(date.getDate()).padStart(2,'0');
    current_date = year+"-"+month+"-"+day;
    console.log("date:",current_date);

    getWordleAnswer();
    main(); //uses an observer to keep checking for when the wordle div is populated
}

function getCurrentGuess() {
    const rows = document.querySelectorAll(".Row-module_row__pwpBq");

    for (const row of [...rows].reverse()) {
        const tiles = row.querySelectorAll(".Tile-module_tile__UWEHN");

        if (tiles.length !== 5) continue;

        let guess = "";

        tiles.forEach(tile => {
            guess += tile.textContent;
        });

        if (guess.length === 5 && tiles[0].getAttribute("data-state") !== "tbd") {
            return guess;
        }
    }

    return "";
}

function getWordleAnswer() {
    //fetch json file with wordle answer
    fetch("https://www.nytimes.com/svc/wordle/v2/" + current_date + ".json", {
    "headers": {
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.9",
        "baggage": "sentry-environment=prod,sentry-release=bb4f1902fe73619a1e317aab5cfe3aad48bf7d05,sentry-public_key=3a4216094411b75b5c881c6291f4029e,sentry-trace_id=2f0f10a64acc4d5ca67828cb85588850,sentry-sample_rate=1,sentry-sampled=true",
        "content-type": "application/x-www-form-urlencoded",
        "priority": "u=1, i",
        "sec-ch-ua": "\"Not;A=Brand\";v=\"8\", \"Chromium\";v=\"150\", \"Google Chrome\";v=\"150\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "sentry-trace": "2f0f10a64acc4d5ca67828cb85588850-98387c9c24829799-1"
    },
    "referrer": "https://www.nytimes.com/games/wordle/index.html",
    "body": null,
    "method": "GET",
    "mode": "cors",
    "credentials": "include"
    })
    .then(r => r.json())
    .then(data => {
        wordle_answer = data.solution; 
        console.log(wordle_answer);
    });
    //save wordle answer and print it to console
}

function main() {
    console.log("timer");
    const observer = new MutationObserver(() => {
        
    const words_div = document.querySelector('[class*="Toolbar-module_toolbar__DGjo1"]'); //when you're in the actual game
    const badge_div = document.querySelector('[class*="lire-badge-detail-container"]'); //when you beat the wordle
    const admire_button = document.querySelector('[data-testid*="Admire"]'); //when you beat the wordle and load the page back
    const play_button = document.querySelector('[data-testid*="Play"]'); //when you launch wordle for the first time

    if (words_div) {
        console.log("Found div");
        observer.disconnect();

        editPage(words_div);
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

    checkAnswer(timer);
}

async function checkAnswer(timer_element) {
     //start observing tiles for answer checking
    const { times = {} } = await chrome.storage.local.get("times");
    const todayTime = times[current_date];
    console.log("tester: " + todayTime);
    
    if(todayTime != null) { //if user has completed today already, load their old time
        adjustTimer(timer_element, todayTime);
        return;
    } //otherwise, start timer

    const tiles = document.querySelectorAll("[data-testid='tile']");
    const observer = new MutationObserver(() => {
        if(!timer_started) {
            timer_interval = startTimer(timer_element);
        }
        const guess = getCurrentGuess();
        console.log("Current guess:", guess);

        if (guess === wordle_answer) {
            foundWordle();
        }
    });

    tiles.forEach(tile => {
        observer.observe(tile, {
            attributes: true,
            characterData: true,
            childList: true
        });
    });
}

async function foundWordle() {
    clearInterval(timer_interval);

    const { times = {} } = await chrome.storage.local.get("times");
    times[current_date] = completion_time;
    await chrome.storage.local.set({ times });
}


function startTimer(timer_element) {
    timer_started = true;
    const start = Date.now();

    const timer_interval = setInterval(() => {
        const now = Date.now();
        const elapsed = now - start;

        if (elapsed >= 3600000) {  //60 minutes
            clearInterval(timer_interval);
        }
        else {
            adjustTimer(timer_element, elapsed);
            completion_time = elapsed;
        }

    }, 10);

    return timer_interval;
}

function adjustTimer(timer_element, time) {
        const minutes = Math.floor(time / 60000);
        const seconds = Math.floor((time % 60000) / 1000);
        const milliseconds = time % 1000;

        const msStr = String(Math.floor(milliseconds / 10)).padStart(2, '0');
        const secStr = String(seconds).padStart(2, '0');
        const minStr = String(minutes).padStart(2, '0');

        timer_element.innerHTML = `${minStr}:${secStr}:${msStr}`;
}
init();