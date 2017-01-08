const localStorage = window.localStorage || {};

let isSolutionFound = false;
const interval = 200;
let stepOfInterval = 0;
let currentPieceTdCoordinates;
let currentCoordinatesAttribute;
let piecesSet = 0;
let solutionLength;
let solution = [];
let solutionPieces = [];
let timeStart;
const scoreForLevel = 500;

const repeats = 2;
let level;
let score;
let pieceCost = 400;
let giveUpCost;

const tableCellWidth = 35;

function saveToLocalStorage() {
    if (localStorage) {
        localStorage['level'] = parseInt(level);
        localStorage['score'] = parseInt(score);
    }
}

function restoreFromLocalStorage() {
    if (localStorage) {
        level = parseInt(localStorage['level']);
        score = parseInt(localStorage['score']);
    }
}