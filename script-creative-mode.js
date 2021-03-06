'use strict';

let numberOfRowsCreative, numberOfColumnsCreative;
const piecesLength = [4];
let isGameFinished;

function startGameCreative(header) {
    isGameFinished = isSolutionFound = false;
    stepOfIntervalCreative = 0;
    solutionCreative = [];
    timeStart = performance.now();

    search(header, solutionCreative, 0);

    if (!isSolutionFound) {
        alertWithInterval('There is no solution!', interval * (stepOfIntervalCreative + 1));
        solutionCreative.splice(0, solutionCreative.length);
        return;
    }

    piecesSetCreative = 0;
    solutionLengthCreative = solutionCreative.length;

    const solutionArea = creative.find('div.solutionArea');
    solutionPiecesCreative = print(solutionCreative);
    solutionPiecesCreative.forEach((piece, index) => {
        let view = piece.getView();
        solutionArea.append(view);
        view.setAttribute('id', `piece${index}`);

        view.onmousedown = function(e) {
            view.style.display = '';
            const coords = getCoordinates(view);
            const shiftX = e.pageX - coords.left;
            const shiftY = e.pageY - coords.top;

            let isPieceSet = true;
            currentCoordinatesAttributeCreative = view.getAttribute('data-nodes');
            currentPieceTdCoordinatesCreative = currentCoordinatesAttributeCreative.split('-').map(item => Node.fromString(item));

            let row, column;
            ({row, column} = getRowAndCol(e));
            let isPieceRemoved = false;
            currentPieceTdCoordinatesCreative.every(item => {
                let tdRow = parseInt(item.row) + row;
                let tdCol = parseInt(item.column) + column;
                let td = creative.find(`#td-${tdRow}-${tdCol}`);
                if (td.hasClass('set') && !isPieceRemoved) {
                    isPieceRemoved = true;
                    piecesSetCreative--;
                }
                td.removeClass('set');
                return true;
            });

            function moveAt(e) {
                view.style.left = (e.pageX - shiftX - 4) + 'px';
                view.style.top = (e.pageY - shiftY - 4) + 'px';
            }

            function getRowAndCol(e) {
                let offset = solutionArea.offset();
                let containerX = e.pageX - offset.left;
                let containerY = e.pageY - offset.top;
                let row = Math.round((containerY - shiftY) / 35);
                let column = Math.round((containerX - shiftX) / 35);
                return {row, column};
            }

            view.style.zIndex = 1000; // над другими элементами
            view.style.position = 'absolute';
            document.body.appendChild(view);
            moveAt(e);

            document.onmousemove = function (e) {
                moveAt(e);
            };

            view.onmouseup = function (e) {
                let row, column;
                ({row, column} = getRowAndCol(e));
                let rowPosition = row * 35;
                let columnPosition = column * 35;
                let currentPieceCells = [];
                currentPieceTdCoordinatesCreative.every(item => {
                    let tdRow = parseInt(item.row) + row;
                    let tdCol = parseInt(item.column) + column;
                    let cell = creative.find(`#td-${tdRow}-${tdCol}`)
                        .not('.set').not('.border-cell');

                    if (cell.length > 0) {
                        currentPieceCells.push(cell);
                    } else {
                        isPieceSet = false;
                        return false;
                    }

                    return true;
                });

                solutionArea.append(view);

                if (isPieceSet) {
                    currentPieceCells.forEach(item => {
                        item.addClass('set');
                    });
                    view.style.left = `${columnPosition - 4}px`;
                    view.style.top = `${rowPosition - 4}px`;
                    view.style.display = 'block';
                    piecesSetCreative++;
                } else {
                    view.style.position = '';
                    view.style.left = '';
                    view.style.top = '';
                    view.style.display = '';
                }

                document.onmousemove = null;
                view.onmouseup = null;
                view.style.zIndex = '';

                console.log(piecesSetCreative);
                if (piecesSetCreative == solutionLengthCreative && !isGameFinished) {
                    isGameFinished = true;
                    creative.find('#give-up-creative').hide();
                    alertWithInterval('Congratulations!', 50);
                }
            };
        };

        view.ondragstart = function() {
            return false;
        };
    });
}


function setTimeoutForCoveringPieceCreative(piece, removedPiece) {
    return new Promise((resolve) => {
        if (!piece)
            return;
        stepOfIntervalCreative++;
        setTimeout(() => {
            coverPieceInTableCreative(piece);
            if (removedPiece) {
                removedPiece.remove();
            }
            resolve();
        }, interval * stepOfIntervalCreative);
    });
}

function coverPieceInTableCreative(piece) {
    const nodes = piece.nodes;
    const backgroundColor = piece.color;
    for (let i = 0; i < nodes.length; i++) {
        const row = nodes[i].row;
        const column = nodes[i].column;
        const td = creative.find(`#td-${row}-${column}`);
        let border = '1px dashed #121212';
        td.css({backgroundColor, border});
        td.addClass('set');
    }
}

function setInitialPolyminoTable() {
    let table = creative.find('table.polytable');
    numberOfRowsCreative = 8;
    numberOfColumnsCreative = 8;
    for (let i = 0; i < 8; i++) {
        const row = $(`<tr class='field-row' id='tr-${i}'></tr>`);
        for (let j = 0; j < 8; j++) {
            row.append($(`<td class='cell empty-cell' id='td-${i}-${j}'></td>`));
        }
        table.append(row);
    }

    table.find('#td-3-3, #td-3-4, #td-4-3, #td-4-4').removeClass('empty-cell').addClass('border-cell');
}

// Counting connected components in a table
function countStatistic() {
    const arr = transformTableToMatrix(creative);
    let startNode, size = [];
    while (!isAllVisited(arr)) {
        startNode = getStartNode(arr);
        size[size.length] = 1 + countOneComponent(startNode, arr);
    }

    for (let s = 0, temp; s < size.length; s++) {
        //TODO: add proper check if number of empty cells can be divided by pieces
        if (checkIfProperNumber(size[s])) {
            temp = `<span class="good">${size[s]}</span>`;
        }
        else {
            temp = `<span class="bad">${size[s]}</span>`;
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
            txt += size[size.length - 1] + ' = ' + creative.find(".empty-cell").length.toString();
        }
    }

    creative.find(".statisticSpan").html(txt);
}

function transformTableToMatrix(container) {
    const arr = [];
    container.find("table.polytable tr.field-row").each(
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
    creative.find('tr.field-row').each(
        function (row) {
            $(this).append($(`<td class='cell empty-cell' id='td-${row}-${numberOfColumnsCreative}'></td>`));
        }
    );
    numberOfColumnsCreative++;
}

function addRow() {
    const row = $(`<tr class="field-row" id="tr-${numberOfRowsCreative}"></tr>`);
    for (let i = 0; i < numberOfColumnsCreative; i++) {
        row.append($(`<td class='cell empty-cell' id='td-${numberOfRowsCreative}-${i}'></td>`));
    }

    creative.find('table.polytable tr.field-row').last().after(row);
    numberOfRowsCreative++;
}

function removeColumn() {
    if (numberOfColumnsCreative < 2) {
        return;
    }
    creative.find('tr.field-row').each(
        function () {
            //noinspection JSValidateTypes
            $(this).children('td.cell').last().remove();
        }
    );
    numberOfColumnsCreative--;
}

function removeRow() {
    if (numberOfRowsCreative < 2) {
        return;
    }
    creative.find('tr.field-row').last().remove();
    numberOfRowsCreative--;
}

function resetFieldCreative() {
    creative
        .find('td.cell')
        .removeClass('set')
        .css('backgroundColor', '')
        .css('border', '');
    creative.find('.piece').remove();
    creative.find('#give-up-creative').hide();
}

$(document).ready(
    function() {
        setInitialPolyminoTable();
        countStatistic();
        let solutionArea = creative.find('div.solutionArea');

        creative.find('#go').click(
            function () {
                resetFieldCreative();
                creative.find('#give-up-creative').show();
                shufflePieces();
                if (creative.find('span.statisticSpan .bad').length > 0) {
                    alert("It's impossible to cover table with such number of empty cells!");
                    return;
                }
                const arr = transformTableToMatrix(creative);
                const header = createXListForExactCoverProblem(arr);
                startGameCreative(header);
            }
        );

        creative.find('#give-up-creative').click(
            function() {
                function placePiece() {
                    let index = parseInt($(this).attr('id').replace('piece', ''));
                    setTimeoutForCoveringPieceCreative(solutionPiecesCreative[index], $(this));
                }

                stepOfIntervalCreative = 0;
                creative.find('.piece[style]').each(placePiece);
                creative.find('.piece').each(placePiece);
                $(this).hide();
            }
        );

        $(document).on('click', '.creative td.cell',
            function () {
                resetFieldCreative();

                if ($(this).hasClass('empty-cell')) {
                    $(this).removeClass('empty-cell').addClass('border-cell');
                    countStatistic();
                }
                else {
                    $(this).removeClass('border-cell').addClass('empty-cell');
                    countStatistic();
                }
            }
        );

        creative.find("#resetBarrierCells").click(
            function () {
                resetFieldCreative();
                creative.find(".polytable td").removeClass('border-cell').addClass('empty-cell').css('backgroundColor', '');
                countStatistic();
            }
        );

        creative.find('div.arrow-div').click(
            function () {
                resetFieldCreative();
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