"use strict";

var isSolutionFound = false;
var interval = 200;
var stepOfInterval = 0;
var currentPieceTdCoordinates;
var currentCoordinatesAttribute;
var piecesSet = 0;
var solutionLength;
var solution = [];
var solutionPieces = [];
var timeStart;
var scoreForLevel = 500;

var repeats = 2;
var level;
var score;
var pieceCost = 400;
var giveUpCost;

var tableCellWidth = 35;

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