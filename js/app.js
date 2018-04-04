
//// VARIABLES

/// Card Deck

// Icon collections for each level (font awesome v5) 
const iconCollections = [
    [
        'gem', 'paper-plane', 'anchor', 'bolt', 'cube', 'leaf', 'bicycle', 'bomb'],
    [
        'dollar-sign', 'euro-sign', 'lira-sign', 'pound-sign', 'yen-sign', 'ruble-sign', 'rupee-sign', 'won-sign'],
    [
        'arrow-alt-circle-down', 'arrow-alt-circle-left', 'arrow-alt-circle-up', 'arrow-alt-circle-right', 'caret-square-up', 'caret-square-left', 'caret-square-right', 'caret-square-down']
];

// total number of levels is total number of icon collections
const totalLevels = iconCollections.length;

// track current level
let currentLevel = 1;

// card deck variables
const deck = document.querySelector('.deck');

// deck status variables
let open = [];
let matchedPairs = 0;

// game play sound variables (noiseforfun.com)
const glue = document.getElementById('glue'); // restart
const select = document.getElementById('select'); // first card open
const tinyWhip = document.getElementById('tinyWhip'); // no match
const doubleWhip = document.getElementById('doubleWhip'); // matching cards


/// Header

// Level
const level = document.querySelector('.level');

/// Score Panel

// star variables
const customStars = 3; // set custom number of stars to start
const starsNeeded = 2; // set custom number of stars needed to advance to next level
let totalStars = customStars; // track score during game play
const stars = document.querySelector('.stars');
let starsChildren = []; // hold new set of stars created for each level

// move variables
let moveCount = 0; // track move count during game play
let moveMax = 11; // set the max number of moves before score decreases by one star
const moves = document.querySelector('.moves');

// timer variables
const minElements = document.querySelectorAll('.min');
const secElements = document.querySelectorAll('.sec');
let seconds = 0; // track total seconds
let minutesToDisplay = Math.floor(seconds / 60); // display one minute for every 60 seconds
let secondsToDisplay = seconds % 60; // display up to 59 seconds
let interval = 0; // track timer interval

// restart variables
const restart = document.querySelector('.redo');

// skip level variables
const skipLevel = document.querySelector('.skip-level');

/// Congrats Popup

// DOM variables
const congrats = document.getElementById('congrats');
const starScore = document.getElementById('starScore');
const moveScore = document.getElementById('moveScore');
const playAgain = document.getElementById('playAgain');

// message variables
const lock = document.getElementById('lock');
const congratsMsg = document.getElementById('congratsMsg');

// sound variables (noiseforfun.com)
const lose = document.getElementById('lose'); // low score
const glockenGood = document.getElementById('glockenGood'); // high score
const fruit = document.getElementById('fruit'); // wins game


//// EVENT HANDLERS

/// Card Deck click

// single event listener for entire deck that targets the card clicked
deck.addEventListener('click', function(event) {
    // if an unopened list item (card element) has been clicked...
    if (event.target.nodeName === 'LI' && !(event.target.classList.contains('open'))) {
        openCard(event.target); // open card
        if (open.length === 1) {
            playAudio(select);
        }
        // if there are 2 cards open, check for matching card icons
        if (open.length === 2) {
            if (open[0].cardIcon == open[1].cardIcon) {
                ifMatching();
            } else {
                // delay 0.5 seconds before hiding card icons if not matching
                setTimeout(ifNotMatching, 500);
            }
            incrementMoveCounter();
        }
    }
});

/// Play Again click
playAgain.addEventListener('click', function() {
    startGame(currentLevel);
    congrats.close();
});

/// Restart click
restart.addEventListener('click', function() {
    window.clearInterval(interval); // stop timer
    startGame(currentLevel);
});

/// Skip level click
skipLevel.addEventListener('click', function() {
    window.clearInterval(interval); // stop timer
    updateLevel();
    startGame(currentLevel);
});


//// FUNCTIONS 

/// Start game
function startGame(currentLevel) {
    // assign icons according to current level
    let iconList = iconCollections[currentLevel - 1];
    // add duplicate of each icon to creating a complete deck of matching pairs
    let cards = iconList.concat(iconList);
    // update current level displayed in header
    level.innerHTML = currentLevel;
    // Reset game status variables
    open = [];
    matchedPairs = 0;
    // Reset timer variables
    seconds = 0;
    minElements[1].innerHTML = `0 : `;
    secElements[1].innerHTML = '00';
    interval = window.setInterval(timer, 1000); // call timer function every 1 second
    // Create deck
    createDeck(cards, deck);
    // Create and reset stars
    createStars(customStars, stars);
    totalStars = customStars;
    // Reset moves
    moveCount = 0;
    moves.innerHTML = `${moveCount} Moves`;
    // Play restart sound
    playAudio(glue);
    // Reset popup icon
    lock.classList.remove('fa-lock', 'fa-lock-open', 'fa-trophy');
}

/// Update level
function updateLevel() {
    // advance to next level and start back at first level if at the end
    if (currentLevel < totalLevels) {
        currentLevel++;
    } else {
        currentLevel = 1;
    }
}

/// Play audio
function playAudio(sound) {
    sound.play();
}

/// Create deck of shuffled cards
function createDeck(cards, deck) {
    shuffle(cards); // shuffle card list
    deck.innerHTML = ''; // reset deck in DOM
    
    // create document fragment to more efficiently add new card elements to the deck
    const deckFrag = document.createDocumentFragment();
    // loop through each card and create its HTML
    for (card of cards) {
        const newCard = document.createElement('li'); // create a new list item
        newCard.classList.add('card'); // make list item a card

        const faClass = 'fa-' + card; // create class matching card's font awesome icon
        const fa = document.createElement('i'); // create element for fa icon
        fa.classList.add('fa', faClass); // add font awesome classes to element

        newCard.appendChild(fa); // append fa element to new card
        deckFrag.appendChild(newCard); // append new card to fragment
    }
    deck.appendChild(deckFrag); // append fragment of new cards to the deck one time

}

/// Shuffle (function from http://stackoverflow.com/a/2450976)
function shuffle(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

/// Create Stars
function createStars(customStars, stars) {
    // reset stars in DOM
    stars.innerHTML = '';
    
    // create document fragment to more efficiently add new stars
    const starsFrag = document.createDocumentFragment();
    // loop through each star and create its HTML
    for (let i = 1; i <= customStars; i++) {
        const newStarItem = document.createElement('li'); // create new list item to contain star icon
        const newStar = document.createElement('i'); // create new element for star icon
        newStar.classList.add('fa', 'fa-star', `level${currentLevel}`); // add star icon
        newStarItem.appendChild(newStar); // append star icon to star container
        starsFrag.appendChild(newStarItem); // append each new element to fragment
    }
    stars.appendChild(starsFrag); // append fragment to stars

    starsChildren = stars.children; // store new stars
}

/// Timer
function timer() {
    seconds += 1;
    // reset minutes and seconds to display
    minutesToDisplay = Math.floor(seconds / 60);
    secondsToDisplay = seconds % 60;
    // show minutes in score panel
    minElements[1].innerHTML = `${minutesToDisplay} : `;
    // maintain double digit seconds in score panel
    if (secondsToDisplay < 10) {
        secElements[1].innerHTML = `0${secondsToDisplay}`;
    } else {
        secElements[1].innerHTML = `${secondsToDisplay}`;
    }
}

/// Open card
function openCard(card) {
    card.classList.add('open', `level${currentLevel}`); // flip card up
    addToOpen(card);
}

/// Add card to list of open cards
function addToOpen(card) {
    const child = card.firstElementChild; // store the child element of the card selected
    const cardIcon = child.classList[1]; // store the icon for the card, which is the second class of child
    const thisCard = { card, cardIcon }; // create a card object with the card and its icon
    open.push(thisCard); // add card object to list of open cards
}

/// Reset open list of cards
function resetOpen() {
    open = [];
}

/// If cards are matching...
function ifMatching() {
    playAudio(doubleWhip);
    // add match class to both cards
    for (c of open) {
        c.card.classList.add('match', `level${currentLevel}`); // keep cards face up
    }
    matchedPairs += 1;
    // if all pairs are matched, end level with popup
    if (matchedPairs === iconCollections[currentLevel - 1].length) {
        window.clearInterval(interval); // stop timer
        setTimeout(congratsPopup, 700); // delay 0.7 seconds before popup
    }
    resetOpen();
}

/// If cards are not matching...
function ifNotMatching() {
    playAudio(tinyWhip);
    // hide cards that are open
    for (c of open) {
        c.card.classList.remove('open', `level${currentLevel}`); // flip cards back over
    }
    resetOpen();
}

/// Increment move counter
function incrementMoveCounter() {
    moveCount += 1;
    if (moveCount === 1) {
        moves.innerHTML = `${moveCount} Move`;
    } else {
        moves.innerHTML = `${moveCount} Moves`;
    }
    // decrease star rating according to max number of moves set
    if (moveCount % moveMax === 0) {
        decreaseScore();
    }
}

/// Decrease star score
function decreaseScore() {
    // user will always score at least one star
    if (totalStars > 1) {
        let targetStar = starsChildren[totalStars - 1].childNodes[0]; // store the last star icon element
        targetStar.classList.remove(`level${currentLevel}`); // remove color from star icon
        totalStars -= 1; // update score
    }
}

/// Congrats popup
function congratsPopup() {
    
    // message and audio for low and high scores
    if (totalStars < starsNeeded) { // low score
        starScore.innerHTML = `${totalStars} Star`;
        lock.classList.add('fa-lock');
        congratsMsg.innerHTML = `Uh oh,<br>you must score higher to unlock the next level!`;
        playAgain.innerHTML = 'Try again';
        playAudio(lose);
    } else {
        if (currentLevel === totalLevels) { // high score at the last level
            lock.classList.add('fa-trophy');
            congratsMsg.innerHTML = `You win the game!`;
            playAgain.innerHTML = 'Play again';
            playAudio(fruit);
        } else {
            lock.classList.add('fa-lock-open'); // high score
            congratsMsg.innerHTML = `Congrats,<br>you unlocked the next level!`;
            playAgain.innerHTML = 'Play next level';
            playAudio(glockenGood);
        }
        starScore.innerHTML = `${totalStars} Stars`;
        updateLevel();
    }

    // moves to display
    moveScore.innerHTML = moves.innerHTML;
    // minutes to display
    if (minutesToDisplay === 1) {
        minElements[0].innerHTML = `${minutesToDisplay} minute and `;
    } else if (minutesToDisplay > 1) {
        minElements[0].innerHTML = `${minutesToDisplay} minutes and `;
    } else {
        minElements[0].innerHTML = '';
    }
    // seconds to display
    if (secondsToDisplay === 1) {
        secElements[0].innerHTML = `${secondsToDisplay} second`;
    } else {
        secElements[0].innerHTML = `${secondsToDisplay} seconds`;
    }

    // polyfill registering dialog element (congrats popup)
    dialogPolyfill.registerDialog(congrats);

    // show popup
    congrats.showModal();
}

/* START GAME */
startGame(currentLevel);

