var origBoard;
const huPlayer = 'X';
const huPlayer2 = 'O';
const aiPlayer = 'O';
const winCombos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [6, 4, 2]
];

var gamemode;
var turnCount;
var firstTurn, secondTurn = -1;

const cells = document.querySelectorAll('.cell');
startGame();

function startGame() {
    gamemode = document.querySelector('input[name="group1"]:checked').value;
    turnCount = 1;
    document.querySelector(".endgame").style.display = "none";
    origBoard = Array.from(new Array(9).keys());
    for (var i = 0; i < cells.length; i++) {
        cells[i].innerText = '';
        cells[i].style.removeProperty('background-color');
        cells[i].addEventListener('click', turnClick, false);
    }

    if (gamemode === "AIvsAI") {
        secondTurn, firstTurn = -1;
        while (document.querySelector(".endgame").style.display === "none") {
            if(turnCount === 1 && firstTurn === -1) {
                firstTurn = Math.floor(Math.random() * 9);
                console.log(firstTurn);
                turn(firstTurn, huPlayer);
                turnCount += 1;
            }
            else if (turnCount === 2 && secondTurn === -1) {
                secondTurn = Math.floor(Math.random() * 9);
                while(firstTurn === secondTurn) {
                    secondTurn = Math.floor(Math.random() * 9);
                }
                console.log(secondTurn);
                turn(secondTurn, huPlayer2);
                turnCount += 1
            }
            else if (turnCount % 2 === 0) {
                if (!checkTie()) turn(bestSpotUnbeatable(), huPlayer2);
                turnCount += 1;
            }
            else if (turnCount % 2 === 1){
                if (!checkTie()) turn(bestSpotUnbeatable(), huPlayer);
                turnCount += 1;
            }
        }
    }
}

function turnClick(square) {
    if (typeof origBoard[square.target.id] == 'number') {
        if (gamemode === "basicAI" ) {
            turn(square.target.id, huPlayer);
            if (!checkTie()) turn(bestSpot(), aiPlayer);
        }
        else if (gamemode === "unbeatableAI") {
            turn(square.target.id, huPlayer);
            if (!checkTie()) turn(bestSpotUnbeatable(), aiPlayer);
        }
        else if(gamemode === "human") {
            if (turnCount % 2 === 0) {
                turn(square.target.id, huPlayer2);
                turnCount += 1;
            }
            else {
                turn(square.target.id, huPlayer);
                turnCount += 1;
            }
        }
    }
}

function turn(squareId, player) {
    origBoard[squareId] = player;
    document.getElementById(squareId).innerText = player;
    let gameWon = checkWin(origBoard, player);
    if (gameWon) gameOver(gameWon);
}

function checkWin(board, player) {
    let plays = board.reduce((a, e, i) =>
        (e === player) ? a.concat(i) : a, []);
    let gameWon = null;
    for (let [index, win] of winCombos.entries()) {
        if (win.every(elem => plays.indexOf(elem) > -1)) {
            gameWon = {index: index, player: player};
            break;
        }
    }

    if (gamemode === "human") {
        checkTie();
    }

    return gameWon;
}

function gameOver(gameWon) {
    for (let index of winCombos[gameWon.index]) {
        document.getElementById(index).style.backgroundColor =
            gameWon.player == huPlayer ? "blue" : "red";
    }
    for (var i = 0; i < cells.length; i++) {
        cells[i].removeEventListener('click', turnClick, false);
    }

    if(gamemode === "human") {
        if (turnCount % 2 === 0) {
            declareWinner("Player 2 Wins");
        } else if (turnCount % 2 === 1) {
            declareWinner("Player 1 Wins");
        }
    } else if (gamemode === "AIvsAI") {
        if (turnCount % 2 === 0) {
            declareWinner("Bot 2 Wins");
        } else if (turnCount % 2 === 1) {
            declareWinner("Bot 1 Wins");
        }

    } else {
        declareWinner(gameWon.player == huPlayer ? "You Win" : "You Lose")
    }

}

function emptySquares() {
    return origBoard.filter(s => typeof s == 'number');
}

function bestSpot() {
    return emptySquares()[0];
}

function bestSpotUnbeatable() {
    console.log(minimax(origBoard, aiPlayer).index);
    return minimax(origBoard, aiPlayer).index;
}

function minimax(newBoard, player) {
    var availSpots = emptySquares();
    var result;
    if (checkWin(newBoard, huPlayer)) {
        return {score: -10};
    } else if (checkWin(newBoard, aiPlayer)) {
        return {score: 10};
    } else if (availSpots.length === 0) {
        return {score: 0};
    }
    var moves = [];
    for (var i = 0; i < availSpots.length; i++) {
        var move = {};
        move.index = newBoard[availSpots[i]];
        newBoard[availSpots[i]] = player;

        if (player == aiPlayer) {
            result = minimax(newBoard, huPlayer);
            move.score = result.score;
        } else {
            result = minimax(newBoard, aiPlayer);
            move.score = result.score;
        }

        newBoard[availSpots[i]] = move.index;

        moves.push(move);
    }

    var bestMove;
    var bestScore;
    if(player === aiPlayer) {
        bestScore = -10000;
        for(var i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        bestScore = 10000;
        for(var i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

    return moves[bestMove];
}

function checkTie() {
    if (emptySquares().length == 0) {
        for(var i = 0; i < cells.length; i++) {
            cells[i].style.backgroundColor = "orange";
            cells[i].removeEventListener('click', turnClick, false);
        }
        declareWinner("Tie Game");
        return true;
    }
    return false;
}

function declareWinner(winner) {
    document.querySelector(".endgame").style.display = "block";
    document.querySelector(".endgame .text").innerText = winner;
}
