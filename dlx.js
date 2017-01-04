let isSolutionFound = false;
const interval = 20;
let stepOfInterval = 0;
let solutionPieces;
let currentX = 0, currentY = 0;
let currentPieceTdCoordinates;
let currentCoordinatesAttribute;
let draggableElement = null;
let draggableId;
let currentColor;

function findSolution(header) {
    isSolutionFound = false;
    stepOfInterval = 0;
    const solution = [];
    search(header, solution, 0);

    if (!isSolutionFound) {
        stepOfInterval++;
        setTimeout(() => {
            alert('There is no solution!');
        }, interval * stepOfInterval);
        solution.splice(0, solution.length);
    }

    solutionPieces = print(solution);


    const solutionArea = $('div.solutionArea');
    const piecesArea = $('div.solutionPieces');
    piecesArea.empty();

    /*let previousRow = -10;
    let previousCol = -10;
    //let isPieceSet = false;*/

    solutionPieces.forEach((piece, index) => {
        let view = piece.getView();
        piecesArea.append(view);

        view.onmousedown = function(e) {
            /*let offset = $(this).offset();
            let currentX = e.pageX - offset.left;
            let currentY = e.pageY - offset.top;*/

            const coords = getCoords(view);
            const shiftX = e.pageX - coords.left;
            const shiftY = e.pageY - coords.top;

            let isPieceSet = true;
            currentCoordinatesAttribute = view.getAttribute('data-nodes');
            currentPieceTdCoordinates = currentCoordinatesAttribute.split('-').map(item => Node.fromString(item));
            console.log(currentPieceTdCoordinates);
            if (view.parentNode === solutionArea.get(0)) {
                let offset = solutionArea.offset();
                let containerX = e.pageX - offset.left;
                let containerY = e.pageY - offset.top;
                let row = Math.round((containerY - shiftY) / 35);
                let column = Math.round((containerX - shiftX) / 35);
                currentPieceTdCoordinates.every((item) => {
                    /*let cell = document.getElementById(`td-${parseInt(item.row) + row}-${parseInt(item.column) + column}`);
                     cell.style.backgroundColor = currentColor;*/
                    let tdRow = parseInt(item.row) + row;
                    let tdCol = parseInt(item.column) + column;
                    $(`#td-${tdRow}-${tdCol}`).removeClass('set');
                    return true;
                });
            }
            //currentColor = $(this).find('td[style]').css('backgroundColor');
            //draggableElement = this;
            //draggableId = this.getAttribute("id");



            view.style.position = 'absolute';
            document.body.appendChild(view);
            moveAt(e);

            view.style.zIndex = 1000; // над другими элементами

            function moveAt(e) {
                view.style.left = e.pageX - shiftX + 'px';
                view.style.top = e.pageY - shiftY + 'px';
            }

            document.onmousemove = function (e) {
                moveAt(e);
            };

            view.onmouseup = function (e) {
                let offset = solutionArea.offset();
                let containerX = e.pageX - offset.left;
                let containerY = e.pageY - offset.top;
                let row = Math.round((containerY - shiftY) / 35);
                let column = Math.round((containerX - shiftX) / 35);
                let rowPosition = row * 35;
                let columnPosition = column * 35;

                let currentPieceCells = [];

                currentPieceTdCoordinates.every((item) => {
                    /*let cell = document.getElementById(`td-${parseInt(item.row) + row}-${parseInt(item.column) + column}`);
                     cell.style.backgroundColor = currentColor;*/
                    let tdRow = parseInt(item.row) + row;
                    let tdCol = parseInt(item.column) + column;
                    let cell = $(`#td-${tdRow}-${tdCol}`)
                        .not('.set').not('.border-cell');

                    if (cell.length > 0) {
                        currentPieceCells.push(cell);
                    } else {
                        /*$('td.cell')
                            .not('.set')
                            .not('.border-cell')
                            .css('backgroundColor', '');*/
                        isPieceSet = false;
                        return false;
                    }

                    return true;
                });

                console.log(isPieceSet);
                if (isPieceSet) {
                    solutionArea.append(view);
                    currentPieceCells.forEach(item => {
                        item.addClass('set');
                    });
                    /*let offs = $(`#td-${row}-${column}`).offset();
                    view.style.left = offs.left;
                    view.style.top = offs.top;*/
                    view.style.left = `${columnPosition - 4}px`;
                    view.style.top = `${rowPosition - 4}px`;

                } else {
                    piecesArea.append(view);
                    view.style.position = '';
                    view.style.left = '';
                    view.style.top = ''
                }

                /*view.style.position = '';
                 view.style.left = '';
                 view.style.top = '';*/

                document.onmousemove = null;
                view.onmouseup = null;
            };

        };

        view.ondragstart = function() {
            return false;
        };

        /*view.setAttribute("draggable", "true");
        view.setAttribute("id", `piece${index}`);
        view.addEventListener('dragstart', handleDragStart, false);
        /!*view.addEventListener('dragenter', handleDragEnter, false);
        view.addEventListener('dragover', handleDragOver, false);
        view.addEventListener('dragleave', handleDragLeave, false);
        view.addEventListener('drop', handleDrop, false);*!/
        view.addEventListener('dragend', handleDragEnd, false);*/


        /*EventUtil.addHandler(view, 'dragstart', function(e) {

            e.dataTransfer.setData(format, 'Dragme');


            e.dataTransfer.effectAllowed = effect;


            var target = EventUtil.getCurrentTarget(e);
            //target.style.backgroundColor = 'blue';
            this.style.opacity = '0.99';
            target.style.cursor = 'move';

            return true;
        });


        EventUtil.addHandler(view, 'drag', function(e) {
            return true;
        });


        EventUtil.addHandler(view, 'dragend', function(e) {

            var target = EventUtil.getCurrentTarget(e);
            //target.style.backgroundColor = '';
            this.style.opacity = '1';
            target.style.cursor = 'default';
            return true;
        });*/
    });

    //$('.polytable').addEventListener('dragover', handleDragOver, false);
    //$('.polytable').addEventListener('dragenter', handleDragEnter, false);

    //console.log(solution);

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

/*function handleDragStart(e) {
    this.style.opacity = '0.99';  // this / e.target is the source node.

    //dragSrcEl = this;


    let offset = $(this).offset();
    //or $(this).parent().offset(); if you really just want the current element's offset
    currentX = e.pageX - offset.left;
    currentY = e.pageY - offset.top;
    //currentPieceTdCoordinates = this.getAttribute('data-nodes').split('-').map(item => ['td', ...item.split(',')].join('-'));
    currentCoordinatesAttribute = $(this).attr('data-nodes');
    currentPieceTdCoordinates = currentCoordinatesAttribute.split('-').map(item => Node.fromString(item));
    currentColor = $(this).find('td[style]').css('backgroundColor');
    draggableElement = this;
    draggableId = this.getAttribute("id");
    //console.log(currentX, currentY);

    //noinspection JSUnresolvedVariable
    e.dataTransfer.effectAllowed = 'move';
    //noinspection JSUnresolvedVariable
    e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault(); // Necessary. Allows us to drop.
    }

    e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.

    return false;
}

function handleDragEnter(e) {
    // this / e.target is the current hover target.
    //this.classList.add('over');
    return false;
}

function handleDragLeave(e) {
    this.classList.remove('over');  // this / e.target is previous target element.
}

function handleDrop(e) {
    // this / e.target is current target element.

    if (e.stopPropagation) {
        e.stopPropagation(); // stops the browser from redirecting.
    }

    // Don't do anything if dropping the same column we're dragging.
    if (dragSrcEl != this) {
        // Set the source column's HTML to the HTML of the columnwe dropped on.
        dragSrcEl.innerHTML = this.innerHTML;
        this.innerHTML = e.dataTransfer.getData('text/html');
    }

    // See the section on the DataTransfer object.

    return false;
}

function handleDragEnd(/!*e*!/) {
    // this/e.target is the source node.
    this.style.opacity = '1';

    /!*solutionPieces.forEach(function (piece) {
        piece.classList.remove('over');
    });*!/
}*/

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

/*function sleep(ms) {
    ms += new Date().getTime();
    while (new Date() < ms) {

    }
}*/

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
        //setTimeout(function() {
        //    coverPieceInTable(nodes)
        //}, interval*i);
        //coverPieceInTable(nodes);
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