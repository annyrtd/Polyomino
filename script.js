'use strict';

let numberOfRows, numberOfColumns;
/*const oldPieces = [
    new Piece([
        [0, 0], [0, 1], [0, 2]
    ]),
    new Piece([
        [0, 0], [1, 0], [2, 0]
    ]),
    new Piece([
        [0, 0], [0, 1], [1, 0]
    ]),
    new Piece([
        [0, 0], [0, 1], [1, 1]
    ]),
    new Piece([
        [0, 0], [1, 0], [1, 1]
    ]),
    new Piece([
        [0, 1], [1, 0], [1, 1]
    ])
];*/
const pieces = [
    new Piece([
        [0, 0], [1, 0], [1, 1], [2, 0]
    ]),
    new Piece([
        [0, 0], [0, 1], [0, 2], [1, 1]
    ]),
    new Piece([
        [0, 1], [1, 0], [1, 1], [1, 2]
    ]),
    new Piece([
        [0, 1], [1, 0], [1, 1], [2, 1]
    ]),


    new Piece([
        [0, 0], [0, 1], [1, 0], [2, 0]
    ]),
    new Piece([
        [0, 1], [0, 2], [1, 0], [1, 1]
    ]),


    new Piece([
        [0, 0], [0, 1], [0, 2], [1, 2]
    ]),
    new Piece([
        [0, 0], [1, 0], [1, 1], [2, 1]
    ]),


    new Piece([
        [0, 0], [1, 0], [1, 1], [1, 2]
    ]),
    new Piece([
        [0, 0], [0, 1], [1, 1], [1, 2]
    ]),


    new Piece([
        [0, 1], [1, 1], [2, 0], [2, 1]
    ]),
    new Piece([
        [0, 1], [1, 0], [1, 1], [2, 0]
    ]),


    new Piece([
        [0, 0], [0, 1], [0, 2], [0, 3]
    ]),
    new Piece([
        [0, 0], [1, 0], [2, 0], [3, 0]
    ]),
];
const piecesLength = [4];
let level = 0;

// algo: https://en.wikipedia.org/wiki/Fisher-Yates_shuffle
function shufflePieces(arrayOfPieces = pieces) {
    let currentIndex = arrayOfPieces.length, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        [arrayOfPieces[currentIndex], arrayOfPieces[randomIndex]] = [arrayOfPieces[randomIndex], arrayOfPieces[currentIndex]];
    }
}

function setInitialPolyminoTable() {
    numberOfRows = 8;
    numberOfColumns = 8;
    for (let i = 0; i < 8; i++) {
        const row = $(`<tr class='field-row' id='tr-${i}'></tr>`);
        for (let j = 0; j < 8; j++) {
            row.append($(`<td class='cell empty-cell' id='td-${i}-${j}'></td>`));
        }
        $('table.polytable').append(row);
    }

    $('#td-3-3, #td-3-4, #td-4-3, #td-4-4').removeClass('empty-cell').addClass('border-cell');
}

function generatePolyminoTable() {
    localStorage['level'] = level;
    printLevel();
    resetField();
    const table = $('table.polytable');
    //const numberOfPieces = level + 3;
    //const possibilityOfBarriers = 1/(1 - numberOfBarriers/numberOfPieces);
    const repeats = 3;
    const numberOfPieces = Math.floor(level/repeats) + 3;
    const numberOfBarriers = (level % repeats);
    const area = (numberOfPieces + numberOfBarriers) * 4;
    const numberOfRows = 4;
    const numberOfColumns = numberOfPieces + numberOfBarriers;

    table.empty();
    //numberOfRows = 8;
    //numberOfColumns = 8;
    //let barriersSet = 0;
    for (let i = 0; i < numberOfRows; i++) {
        const row = $(`<tr class='field-row' id='tr-${i}'></tr>`);
        for (let j = 0; j < numberOfColumns; j++) {
            let td = $(`<td class='cell empty-cell' id='td-${i}-${j}'></td>`);
            row.append(td);
            /*if (Math.floor(Math.random()*possibilityOfBarriers) && barriersSet < numberOfBarriers * 4) {
                td.addClass('border-cell');
                barriersSet++;
            } else {
                td.addClass('empty-cell');
            }*/
        }
        table.append(row);
    }
    /*if (barriersSet < numberOfBarriers * 4) {
        for (let i = barriersSet; i < numberOfBarriers * 4) {

        }
    }*/
    for (let i = 0; i < numberOfBarriers * 4; i++) {
        let allCells = $('td.empty-cell');
        $(allCells[Math.floor(Math.random() * (area - i))])
            .removeClass('empty-cell')
            .addClass('border-cell');
    }

    /*resetField();
    $('#give-up').show();*/
    shufflePieces();
    /*if ($('span.statisticSpan').children('.bad').length > 0) {
        alert("It's impossible to cover table with such number of empty cells!");
        return;
    }*/
    const arr = transformTableToMatrix();
    const header = createXListForExactCoverProblem(arr);
    startGame(header);
}

// Counting connected components in a table
function countStatistic() {
    const arr = transformTableToMatrix();
    let startNode, size = [];
    while (!isAllVisited(arr)) {
        startNode = getStartNode(arr);
        size[size.length] = 1 + countOneComponent(startNode, arr);
    }

    for (let s = 0, temp; s < size.length; s++) {
        //TODO: add proper check if number of empty cells can be divided by pieces
        if (checkIfProperNumber(size[s])) {
            temp = '<span class="good">' + size[s] + '</span>';
        }
        else {
            temp = '<span class="bad">' + size[s] + '</span>';
        }
        size[s] = temp;
    }


    let txt = '';
    if (size.length <= 0) {
        txt = '0';
    }
    else {
        if (size.length == 1) {
            txt = size[0];
        }
        else {
            for (let i = 0; i < size.length - 1; i++) {
                txt += size[i] + ' + ';
            }
            txt += size[size.length - 1] + ' = ' + $(".empty-cell").length.toString();
        }
    }

    $(".statisticSpan").html(txt);
}

function printLevel() {
    $(".statisticSpan").html(level);
}

function transformTableToMatrix() {
    const arr = [];
    $("table.polytable tr.field-row").each(
        function (row) {
            arr[arr.length] = [];
            //noinspection JSValidateTypes
            $(this).children('td.cell').each(
                function () {
                    let item = 0;
                    if ($(this).hasClass('border-cell')) {
                        item = 1;
                    }
                    arr[row][arr[row].length] = item;
                }
            );
        }
    );
    return arr;
}

function isAllVisited(arr) {
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr[i].length; j++) {
            if (arr[i][j] == 0) {
                return false;
            }
        }
    }
    return true;
}

function getStartNode(arr) {
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr[i].length; j++) {
            if (arr[i][j] == 0) {
                return new Node(i, j);
            }
        }
    }
}

function countOneComponent(startNode, arr) {
    let size = 0;
    arr[startNode.row][startNode.column] = 1;
    const neighbours = getNeighbours(startNode, arr);

    if (neighbours.length == 0) {
        return 0;
    }

    for (let t = 0; t < neighbours.length; t++) {
        arr[neighbours[t].row][neighbours[t].column] = 1;
        size++;
    }

    for (let i = 0; i < neighbours.length; i++) {
        size += countOneComponent(neighbours[i], arr);
    }

    return size;
}

function getNeighbours(node, arr) {
    const neighbours = [];
    // connect diagonal cells
    //neighbours[neighbours.length] = new Node(node.row - 1, node.column - 1);
    //neighbours[neighbours.length] = new Node(node.row - 1, node.column + 1);
    //neighbours[neighbours.length] = new Node(node.row + 1, node.column - 1);
    //neighbours[neighbours.length] = new Node(node.row + 1, node.column + 1);

    neighbours[neighbours.length] = new Node(node.row - 1, node.column);
    neighbours[neighbours.length] = new Node(node.row, node.column - 1);
    neighbours[neighbours.length] = new Node(node.row, node.column + 1);
    neighbours[neighbours.length] = new Node(node.row + 1, node.column);

    for (let i = 0; i < neighbours.length; i++) {
        if (neighbours[i].row < 0 || neighbours[i].column < 0
            || neighbours[i].row >= arr.length || neighbours[i].column >= arr[0].length
            || arr[neighbours[i].row][neighbours[i].column] == 1) {
            neighbours[i] = undefined;
        }
    }
    let position = neighbours.indexOf(undefined);
    while (position > -1) {
        neighbours.splice(position, 1);
        position = neighbours.indexOf(undefined);
    }

    return neighbours;
}

//TODO
function checkIfProperNumber(number) {
    for (let i = 0; i < piecesLength.length; i++) {
        if (number % piecesLength[i] == 0) {
            return true;
        }
    }
    return false;
}

// Transform table
function addColumn() {
    $('tr.field-row').each(
        function (row) {
            $(this).append($("<td class='cell empty-cell' id='td-"
                + row + "-"
                + numberOfColumns + "'></td>"));
        }
    );
    numberOfColumns++;
}

function addRow() {
    const row = $('<tr class="field-row" id="tr-' + numberOfRows + '"></tr>');
    for (let i = 0; i < numberOfColumns; i++) {
        row.append($("<td class='cell empty-cell' id='td-"
            + numberOfRows + "-"
            + i + "'></td>"));
    }

    $('table.polytable tr.field-row').last().after(row);
    numberOfRows++;
}

function removeColumn() {
    if (numberOfColumns < 2) {
        return;
    }
    $('tr.field-row').each(
        function () {
            //noinspection JSValidateTypes
            $(this).children('td.cell').last().remove();
        }
    );
    numberOfColumns--;
}

function removeRow() {
    if (numberOfRows < 2) {
        return;
    }
    $('tr.field-row').last().remove();
    numberOfRows--;
}

// Prepare for DLX
function createXListForExactCoverProblem(arr) {
    const header = createInitialXList(arr);
    for (let p = 0, piece, nodes; p < pieces.length; p++) {
        piece = pieces[p];
        nodes = piece.nodes;
        for (let i = 0; i + piece.maxrow < arr.length; i++) {
            for (let j = 0; j + piece.maxcol < arr[i].length; j++) {
                if (isMatch(arr, nodes, i, j)) {
                    addNewRow(header, nodes, i, j);
                }
            }
        }
    }

    return header;
}

//create initial Xlist with header and empty columns
function createInitialXList(arr) {
    const header = new RootObject({});
    let previousColumn = header;
    let currentColumn, node;
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr[i].length; j++) {
            if (arr[i][j] == 0) {
                // do I need nodeToString and stringToNode???
                node = new Node(i, j);
                currentColumn = new ColumnObject({left: previousColumn, name: node});
                currentColumn.up = currentColumn;
                currentColumn.down = currentColumn;
                currentColumn.column = currentColumn;
                previousColumn.right = currentColumn;
                previousColumn = currentColumn;
            }
        }
    }
    currentColumn.right = header;
    header.left = currentColumn;
    return header;
}

function isMatch(arr, nodes, i, j) {
    for (let k = 0; k < nodes.length; k++) {
        if (arr[i + nodes[k].row][j + nodes[k].column] == 1) {
            return false;
        }
    }
    return true;
}

//TODO nodes should be sorted in a right order
function addNewRow(header, nodes, row, column) {
    let node = nodes[0];
    let currentNode = new Node(node.row + row, node.column + column);

    let data, startRowData = addNewDataObject(header, currentNode);
    let previousData = startRowData;

    for (let n = 1; n < nodes.length; n++) {
        node = nodes[n];
        currentNode = new Node(node.row + row, node.column + column);
        data = addNewDataObject(header, currentNode, previousData);
        previousData.right = data;
        previousData = data;
    }

    startRowData.left = data;
    data.right = startRowData;
}

function addNewDataObject(header, currentNode, previousData) {
    const current = findColumnForNode(header, currentNode);
    if (current === undefined) {
        return;
    }

    const data = new DataObject({column: current, down: current, up: current.up, left: previousData});

    data.up.down = data;
    data.down.up = data;
    current.size++;

    return data;
}

function findColumnForNode(header, node) {
    let current = header.right;
    while (current != header) {
        if (current.name.equalsTo(node)) {
            return current;
        }
        current = current.right;
    }
    return undefined;
}

function resetField() {
    $('td.cell').removeClass('set').css('backgroundColor', '');
    //solutionArea.find('.piece').remove();
    $('.piece').remove();
    $('#give-up').hide();
}

$(document).ready(
    function() {
        //setInitialPolyminoTable();
        //countStatistic();
        level = localStorage && localStorage.getItem('level') ? localStorage['level'] : 0;
        printLevel();
        generatePolyminoTable();
        let solutionArea = $('div.solutionArea');

        $('#go').click(
            function () {
                resetField();
                $('#give-up').show();
                shufflePieces();
                //noinspection JSValidateTypes
                if ($('span.statisticSpan').children('.bad').length > 0) {
                    alert("It's impossible to cover table with such number of empty cells!");
                    return;
                }
                const arr = transformTableToMatrix();
                const header = createXListForExactCoverProblem(arr);
                startGame(header);
            }
        );

        $('#give-up').click(
            function() {
                function placePiece() {
                    let index = parseInt($(this).attr('id').replace('piece', ''));
                    setTimeoutForCoveringPiece(solutionPieces[index], $(this));
                }

                stepOfInterval = 0;
                $('.piece[style]').each(placePiece);
                $('.piece').each(placePiece);
                $(this).hide();
            }
        );

        /*$(document).on('click', 'td.cell',
            function () {
                resetField();

                if ($(this).hasClass('empty-cell')) {
                    $(this).removeClass('empty-cell').addClass('border-cell');
                    countStatistic();
                }
                else {
                    $(this).removeClass('border-cell').addClass('empty-cell');
                    countStatistic();
                }
            }
        );*/

        $("#resetBarrierCells").click(
            function () {
                resetField();
                $(".polytable td").removeClass('border-cell').addClass('empty-cell').css('backgroundColor', '');
                countStatistic();
            }
        );

        $('div.arrow-div').click(
            function () {
                resetField();
                const direction = $(this).removeClass('arrow-div').attr('class').replace('arrow-', '');

                switch (direction) {
                    case 'left':
                        removeColumn();
                        break;
                    case 'right':
                        addColumn();
                        break;
                    case 'top':
                        removeRow();
                        break;
                    case 'bottom':
                        addRow();
                        break;
                }

                $(this).addClass('arrow-div');
                countStatistic();
            }
        );
    }
);