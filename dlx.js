'use strict';

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

function startGame(header) {
    isSolutionFound = false;
    stepOfInterval = 0;
    solution = [];
    timeStart = performance.now();

    search(header, solution, 0);

    if (!isSolutionFound) {
        generatePolyminoTable();
        console.log('no solution');
        //alertWithInterval('There is no solution!', interval * (stepOfInterval + 1));
        //solution.splice(0, solution.length);
        return;
    }

    piecesSet = 0;
    solutionLength = solution.length;

    const solutionArea = $('div.solutionArea');
    solutionPieces = print(solution);

    let numberOfRows = solutionPieces[0].maxrow - solutionPieces[0].minrow;
    let numberOfCols = solutionPieces[0].maxcol - solutionPieces[0].mincol;
    if (solutionPieces.every(piece =>
        (piece.maxcol - piece.mincol) == numberOfCols && (piece.maxrow - piece.minrow) == numberOfRows
    )) {
        console.log('all pieces are the same');
        generatePolyminoTable();
        return;
    }

    shufflePieces(solutionPieces);

    solutionPieces.forEach((piece, index) => {
        let view = piece.getView();
        solutionArea.append(view);
        view.setAttribute('id', `piece${index}`);

        $(view).find('td.pieceCell').each(function() {
            let cell = this;
            cell.onmousedown = function(e) {
                view.style.display = '';
                const coords = getCoordinates(view);
                const shiftX = e.pageX - coords.left;
                const shiftY = e.pageY - coords.top;

                let isPieceSet = true;
                currentCoordinatesAttribute = view.getAttribute('data-nodes');
                currentPieceTdCoordinates = currentCoordinatesAttribute.split('-').map(item => Node.fromString(item));

                let row, column;
                ({row, column} = getRowAndCol(e));
                let isPieceRemoved = false;
                currentPieceTdCoordinates.every(item => {
                    let tdRow = parseInt(item.row) + row;
                    let tdCol = parseInt(item.column) + column;
                    let td = $(`#td-${tdRow}-${tdCol}`);
                    if (td.hasClass('set') && !isPieceRemoved) {
                        isPieceRemoved = true;
                        piecesSet--;
                    }
                    td.removeClass('set');
                    return true;
                });

                function moveAt(e) {
                    view.style.left = (e.pageX - shiftX - 8) + 'px';
                    view.style.top = (e.pageY - shiftY) + 'px';
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

                cell.onmouseup = function (e) {
                    let row, column;
                    ({row, column} = getRowAndCol(e));
                    let rowPosition = row * 35;
                    let columnPosition = column * 35;
                    let currentPieceCells = [];
                    currentPieceTdCoordinates.every(item => {
                        let tdRow = parseInt(item.row) + row;
                        let tdCol = parseInt(item.column) + column;
                        let cell = $(`#td-${tdRow}-${tdCol}`)
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
                        view.style.left = `${columnPosition - 8}px`;
                        view.style.top = `${rowPosition}px`;
                        view.style.display = 'block';
                        piecesSet++;
                    } else {
                        view.style.position = '';
                        view.style.left = '';
                        view.style.top = '';
                        view.style.display = '';
                    }

                    document.onmousemove = null;
                    cell.onmouseup = null;
                    view.style.zIndex = '';

                    console.log(piecesSet);
                    if (piecesSet == solutionLength) {
                        alertWithInterval('Congratulations!', 50);
                        $('.piece').each(placePieceNoInterval);
                        level++;
                        score = parseInt(score + scoreForLevel);
                        $('#give-up, #add-piece').prop('disabled', true);
                        $('#next').prop('disabled', false);
                    }
                };
            };

            cell.ondragstart = function() {
                return false;
            };
        });

        view.ondragstart = function() {
            return false;
        };
    });
}

function placePiece() {
    let index = parseInt($(this).attr('id').replace('piece', ''));
    setTimeoutForCoveringPiece(solutionPieces[index], $(this));
}

function placePieceNoInterval() {
    let index = parseInt($(this).attr('id').replace('piece', ''));
    coverPieceInTable(solutionPieces[index]);
    $(this).remove();
}

function getCoordinates(elem) {
    // (1)
    const box = elem.getBoundingClientRect();

    const body = document.body;
    const docEl = document.documentElement;

    // (2)
    const scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    const scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

    // (3)
    const clientTop = docEl.clientTop || body.clientTop || 0;
    const clientLeft = docEl.clientLeft || body.clientLeft || 0;

    // (4)
    const top = box.top + scrollTop - clientTop;
    const left = box.left + scrollLeft - clientLeft;

    // (5)
    return {top: Math.round(top), left: Math.round(left)};
}

// DLX algorithm
function search(header, solution, k) {
    if (performance.now() - timeStart > 5000) {
        console.log("Too long");
        return;
    }
    if (header.right == header) {
        if (isSolutionFound) {
            return;
        }
        isSolutionFound = true;
        //print(solution);
    }
    else {
        if (isSolutionFound) {
            return;
        }
        let current = chooseColumn(header);
        coverColumn(current);
        let row = current.down;

        while (row != current && !isSolutionFound) {
            solution[k] = row;

            let j = row.right;
            while (j != row) {
                coverColumn(j.column);
                j = j.right;
            }
            search(header, solution, k + 1);
            row = solution[k];
            current = row.column;
            j = row.left;
            while (j != row) {
                uncoverColumn(j.column);
                j = j.left;
            }
            row = row.down;
        }

        uncoverColumn(current);
    }
}

function setTimeoutForCoveringPiece(piece, removedPiece) {
    if (!piece) return;

    stepOfInterval++;
    setTimeout(() => {
        coverPieceInTable(piece);
        if (removedPiece) {
            removedPiece.remove();
        }
    }, interval * stepOfInterval);
}

function coverPieceInTable(piece) {
    const nodes = piece.nodes;
    const color = piece.color;
    for (let i = 0; i < nodes.length; i++) {
        const row = nodes[i].row;
        const column = nodes[i].column;
        $('#td-' + row + '-' + column).css('backgroundColor', color).addClass('set');
    }
}

function alertWithInterval(message, interval = 50) {
    setTimeout(() => {
        alert(message);
    }, interval);
}

function print(solution) {
    let pieces = [];
    console.log('Solution(' + solution.length + ' pieces):');
    //let interval = 50;
    for (let i = 0; i < solution.length; i++) {
        let o = solution[i];
        let f = solution[i].left;
        let str = '';
        let nodes = [];
        while (o != f) {
            nodes.push(o.column.name.toArray());
            str += o.column.name.toString() + '   ';
            o = o.right;
        }
        nodes.push(o.column.name.toArray());
        str += o.column.name.toString();
        pieces.push(new Piece(nodes));
        console.log(str);
    }
    return pieces;
}

function getRandomColor() {
    const letters = '0123456789ABCDEF'.split('');
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 12 + 2)];
    }
    if (color == '#000000' || color == '#FFFFFF') {
        return '#333333';
    }
    return color;
}

function chooseColumn(header) {
    let j = header.right;
    let current = j;
    let size = j.size;

    while (j != header) {
        if (j.size < size) {
            current = j;
            size = j.size;
        }
        j = j.right;
    }

    return current;
}

function coverColumn(current) {
    current.right.left = current.left;
    current.left.right = current.right;
    let i = current.down;
    while (i != current) {
        let j = i.right;
        while (j != i) {
            j.down.up = j.up;
            j.up.down = j.down;
            j.column.size--;

            j = j.right;
        }

        i = i.down;
    }
}

function uncoverColumn(current) {
    let i = current.up;
    while (i != current) {
        let j = i.left;
        while (j != i) {
            j.column.size++;
            j.down.up = j;
            j.up.down = j;

            j = j.left;
        }

        i = i.up;
    }
    current.right.left = current;
    current.left.right = current;
}