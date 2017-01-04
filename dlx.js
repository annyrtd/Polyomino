'use strict';

let isSolutionFound = false;
const interval = 200;
let stepOfInterval = 0;
let currentPieceTdCoordinates;
let currentCoordinatesAttribute;
let piecesSet = 0;
let solutionLength;
let isGameFinished = false;
let solution = [];
let solutionPieces = [];
let timeStart;

function startGame(header) {
    isGameFinished = isSolutionFound = false;
    stepOfInterval = 0;
    solution = [];
    timeStart = performance.now();

    search(header, solution, 0);

    if (!isSolutionFound) {
        alertWithInterval('There is no solution!', interval * (stepOfInterval + 1));
        solution.splice(0, solution.length);
        return;
    }

    piecesSet = 0;
    solutionLength = solution.length;

    const solutionArea = $('div.solutionArea');
    solutionPieces = print(solution);
    solutionPieces.forEach((piece, index) => {
        let view = piece.getView();
        solutionArea.append(view);
        view.setAttribute('id', `piece${index}`);

        view.onmousedown = function(e) {
            view.style.display = '';
            const coords = getCoords(view);
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
                    view.style.left = `${columnPosition - 4}px`;
                    view.style.top = `${rowPosition - 4}px`;
                    view.style.display = 'block';
                    piecesSet++;
                } else {
                    view.style.position = '';
                    view.style.left = '';
                    view.style.top = '';
                    view.style.display = '';
                }

                document.onmousemove = null;
                view.onmouseup = null;

                console.log(piecesSet);
                if (piecesSet == solutionLength && !isGameFinished) {
                    isGameFinished = true;
                    $('#give-up').hide();
                    alertWithInterval('Congratulations!', 50);
                }
            };
        };

        view.ondragstart = function() {
            return false;
        };
    });
}

function getCoords(elem) {
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


function searchAndColor(header, solution, k) {
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

            let nodes = tryToGetPiece(row);
            let piece = nodes ? new Piece(nodes) : undefined;
            setTimeoutForCoveringPiece(piece);

            let j = row.right;
            while (j != row) {
                coverColumn(j.column);
                j = j.right;
            }
            search(header, solution, k + 1);
            if (!isSolutionFound) {
                setTimeoutForUncoveringPiece(piece);
            }
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

function tryToGetPiece(o) {
    if (o instanceof ColumnObject) {
        return;
    }
    let f = o.left;
    let nodes = [];
    while (o != f) {
        nodes.push(o.column.name);
        o = o.right;
    }
    nodes.push(o.column.name);
    return nodes;
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

function setTimeoutForUncoveringPiece(piece) {
    if (!piece) return;

    stepOfInterval++;
    setTimeout(() => {
        uncoverPieceInTable(piece);
    }, interval * stepOfInterval);
}

function coverPieceInTable(piece) {
    const nodes = piece.nodes;
    const color = piece.color;
    for (let i = 0; i < nodes.length; i++) {
        const row = nodes[i].row;
        const column = nodes[i].column;
        $('#td-' + row + '-' + column).css('backgroundColor', color);
    }
}

function uncoverPieceInTable(piece) {
    const nodes = piece.nodes;
    for (let i = 0; i < nodes.length; i++) {
        const row = nodes[i].row;
        const column = nodes[i].column;
        $('#td-' + row + '-' + column).css('backgroundColor', '');
    }
}


function alertWithInterval(message, interval) {
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