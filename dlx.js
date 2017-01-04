let isSolutionFound = false;
const interval = 20;
let stepOfInterval = 0;
let currentPieceTdCoordinates;
let currentCoordinatesAttribute;

function startGame(header) {
    isSolutionFound = false;
    stepOfInterval = 0;
    const solution = [];
    search(header, solution, 0);
    //let previousRow = -10;
    //let previousColumn = -10;

    if (!isSolutionFound) {
        alertIfNoSolutionIsFound();
        solution.splice(0, solution.length);
    }

    const solutionArea = $('div.solutionArea');
    const piecesArea = $('div.solutionPieces');
    piecesArea.empty();

    let solutionPieces = print(solution);
    solutionPieces.forEach(piece => {
        let view = piece.getView();
        piecesArea.append(view);

        view.onmousedown = function(e) {
            const coords = getCoords(view);
            const shiftX = e.pageX - coords.left;
            const shiftY = e.pageY - coords.top;

            let isPieceSet = true;
            currentCoordinatesAttribute = view.getAttribute('data-nodes');
            currentPieceTdCoordinates = currentCoordinatesAttribute.split('-').map(item => Node.fromString(item));
            if (view.parentNode === solutionArea.get(0)) {
                let row,column;
                ({row, column} = getRowAndCol(e));
                currentPieceTdCoordinates.every(item => {
                    let tdRow = parseInt(item.row) + row;
                    let tdCol = parseInt(item.column) + column;
                    $(`#td-${tdRow}-${tdCol}`).removeClass('set');
                    return true;
                });
            }

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
                //$('td.cell').css('backgroundColor', '');
                moveAt(e);
                /*let row,column;
                ({row, column} = getRowAndCol(e));

                let isPieceCovered = true;

                let currentPieceCells = [];
                currentPieceTdCoordinates.every(item => {
                    let tdRow = parseInt(item.row) + row;
                    let tdCol = parseInt(item.column) + column;
                    let cell = $(`#td-${tdRow}-${tdCol}`)
                        .not('.set').not('.border-cell');

                    if (cell.length > 0) {
                        currentPieceCells.push(cell);
                    } else {
                        isPieceCovered = false;
                        return false;
                    }

                    return true;
                });

                if (isPieceCovered) {
                    currentPieceCells.forEach(item => {
                        item.css('backgroundColor', '#dddddd');
                    });
                }*/
            };

            view.onmouseup = function (e) {
                let row,column;
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
                if (isPieceSet) {
                    solutionArea.append(view);
                    currentPieceCells.forEach(item => {
                        item.addClass('set');
                    });
                    view.style.left = `${columnPosition - 4}px`;
                    view.style.top = `${rowPosition - 4}px`;

                } else {
                    piecesArea.append(view);
                    view.style.position = '';
                    view.style.left = '';
                    view.style.top = ''
                }
                document.onmousemove = null;
                view.onmouseup = null;
            };

        };

        view.ondragstart = function() {
            return false;
        };
    });

    return isSolutionFound;

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
            setTimeoutForCoveringPiece(nodes);

            let j = row.right;
            while (j != row) {
                coverColumn(j.column);
                j = j.right;
            }
            search(header, solution, k + 1);
            if (!isSolutionFound) {
                setTimeoutForUncoveringPiece(nodes);
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

function alertIfNoSolutionIsFound() {
    stepOfInterval++;
    setTimeout(() => {
        alert('There is no solution!');
    }, interval * stepOfInterval);
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
    //console.log(o);
    nodes.push(o.column.name);
    return nodes;
}

function setTimeoutForCoveringPiece(nodes) {
    if (!nodes) return;

    stepOfInterval++;
    setTimeout(() => {
        coverPieceInTable(nodes);
    }, interval * stepOfInterval);
}

function setTimeoutForUncoveringPiece(nodes) {
    if (!nodes) return;

    stepOfInterval++;
    setTimeout(() => {
        uncoverPieceInTable(nodes);
    }, interval * stepOfInterval);
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

function coverPieceInTable(nodes) {
    const color = getRandomColor();
    for (let i = 0; i < nodes.length; i++) {
        const row = nodes[i].row;
        const column = nodes[i].column;
        $('#td-' + row + '-' + column).css('backgroundColor', color);
    }
}

function uncoverPieceInTable(nodes) {
    for (let i = 0; i < nodes.length; i++) {
        const row = nodes[i].row;
        const column = nodes[i].column;
        $('#td-' + row + '-' + column).css('backgroundColor', '');
    }
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