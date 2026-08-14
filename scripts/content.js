var wordle_answer = "";
var timerInterval;
var timerStarted = false;
var current_date;
var completion_time;

function init() {

    //establish connection to background script
    console.log("init - WordleVGC");

    const DATE = new Date();
    const YEAR = DATE.getFullYear();
    const MONTH = String(DATE.getMonth() + 1).padStart(2,'0');
    const DAY = String(DATE.getDate()).padStart(2,'0');
    current_date = YEAR+"-"+MONTH+"-"+DAY;
    console.log("date:",current_date);

    getWordleAnswer();
    main(); //uses an observer to keep checking for when the wordle div is populated
}

function getCurrentGuess() {
    const ROWS = document.querySelectorAll(".Row-module_row__pwpBq");

    for (const ROW of [...ROWS].reverse()) {
        const TILES = ROW.querySelectorAll(".Tile-module_tile__UWEHN");

        if (TILES.length !== 5) continue;

        let guess = "";

        TILES.forEach(tile => {
            guess += tile.textContent;
        });

        if (guess.length === 5 && TILES[0].getAttribute("data-state") !== "tbd") {
            if(TILES[0].parentElement.parentElement.ariaLabel== "Row 6") {
                console.log("FINAL GUESS");
                return "FINAL GUESS";
            } else {
                return guess;
            }
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
        
    const WORDS_DIV = document.querySelector('[class*="Toolbar-module_toolbar__DGjo1"]'); //when you're in the actual game
    const BADGE_DIV = document.querySelector('[class*="lire-badge-detail-container"]'); //when you beat the wordle
    const ADMIRE_BUTTON = document.querySelector('[data-testid*="Admire"]'); //when you beat the wordle and load the page back
    const PLAY_BUTTON = document.querySelector('[data-testid*="Play"]'); //when you launch wordle for the first time

    if (WORDS_DIV) {
        console.log("Found div");
        observer.disconnect();

        setTimer(WORDS_DIV);
    }
    else {
        console.log("div not found");
    }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    window.addEventListener("beforeunload", () => {
        console.log("Page is unloading");
        //saveGame();
    });
}

function setTimer(div) {
    const TITLE = document.createElement("h1");
    TITLE.textContent = "WordleVGC";
    TITLE.classList.add("text");

    const TIMER = document.createElement("h2");
    TIMER.textContent = "00:00:00";
    TIMER.classList.add("timer");

    const WORDLE_VGC_DIV = document.createElement("div");
    WORDLE_VGC_DIV.append(TITLE);
    WORDLE_VGC_DIV.append(TIMER);
    WORDLE_VGC_DIV.style.alignContent = "center";

    const firstChild = div.firstElementChild;
    div.insertBefore(WORDLE_VGC_DIV, firstChild.nextSibling);

    checkAnswerObserver(TIMER);
}

async function checkAnswerObserver(timerElement) {
     //start observing tiles for answer checking
    const { times = {} } = await chrome.storage.local.get("times");
    const todayTime = times[current_date];
    var guessCount = 0;
    var lastGuess = "";
    console.log("tester: " + todayTime);
    
    if(todayTime != null) { //if user has completed today already, load their old time
        adjustTimer(timerElement, todayTime);
        return;
    } //otherwise, start timer

    const tiles = document.querySelectorAll("[data-testid='tile']"); //tracks each individual tile so i can construct the word from all the letters
    const observer = new MutationObserver(() => {
        if(!timerStarted) {
            timerInterval = startTimer(timerElement);
        }
        const guess = getCurrentGuess();
        console.log("Current guess:", guess);

        if (guess == wordle_answer) {
            saveGame();
        }
        else if(guess == "FINAL GUESS") {
            console.log("Player failed");
            saveGame(false);
            adjustTimer(timerElement, -1);
        }
        if(guessCount >= 6) {
            console.log("Final Guess made.");

            clearInterval(timerInterval);
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

async function saveGame(success=true) {
    clearInterval(timerInterval);

    const { times = {} } = await chrome.storage.local.get("times");

    if(success==false) {
        times[current_date] = -completion_time;
    } else {
        times[current_date] = completion_time;
    }
    await chrome.storage.local.set({ times });
   
}


function startTimer(timer_element) {
    timerStarted = true;
    const START = Date.now();

    var timerInterval = setInterval(() => {
        var now = Date.now();
        var elapsed = now - START;

        if (elapsed >= 3600000) {  //60 minutes
            clearInterval(timerInterval);
        }
        else {
            adjustTimer(timer_element, elapsed);
            completion_time = elapsed;
        }

    }, 10);

    return timerInterval;
}

function adjustTimer(timer_element, time) {
    var DNF = false;
    if(time < 0) { //convert DNFs back to readable times
        time = -time;
        DNF = true;
    }

    var minutes = Math.floor(time / 60000);
    var seconds = Math.floor((time % 60000) / 1000);
    var milliseconds = time % 1000;

    var msStr = String(Math.floor(milliseconds / 10)).padStart(2, '0');
    var secStr = String(seconds).padStart(2, '0');
    var minStr = String(minutes).padStart(2, '0');

    timer_element.innerHTML = `${minStr}:${secStr}:${msStr}`;
    if(DNF) {timer_element.style.color = "red";}
    else {timer_element.style.color = "green";}
}
//chrome.storage.local.clear();
init();