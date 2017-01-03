let isSolutionFound = false;
const interval = 20;
let stepOfInterval = 0;
let solutionPieces;
//var dragSrcEl = null;
let currentX = 0, currentY = 0;
let currentPieceTdCoordinates;
let currentCoordinatesAttribute;
let draggableElement = null;
let currentColor;

const EventUtil = {
    addHandler: function(element, type, handler) {
        if (element.addEventListener) {
            element.addEventListener(type, handler, false);
        } else if (element.attachEvent) {
            element.attachEvent("on" + type, handler);
        } else {
            element["on" + type] = handler;
        }
    },
    /*removeHandler: function(element, type, handler) {
        if (element.removeEventListener) {
            element.removeEventListener(type, handler, false);
        } else if (element.detachEvent) {
            element.detachEvent("on" + type, handler);
        } else {
            element["on" + type] = null;
        }
    },
    getCurrentTarget: function(e) {
        if (e.toElement) {
            return e.toElement;
        } else if (e.currentTarget) {
            return e.currentTarget;
        } else if (e.srcElement) {
            return e.srcElement;
        } else {
            return null;
        }
    },*/
    preventDefault: function(e) {
        e.preventDefault ? e.preventDefault() : e.returnValue = false;
    },

    /**
     * @author http://www.quirksmode.org/js/events_properties.html
     * @method getMousePosition
     * @param e
     */
    /*getMousePosition: function(e) {
        let posx = 0,
            posy = 0;
        if (!e) {
            e = window.event;
        }

        if (e.pageX || e.pageY) {
            posx = e.pageX;
            posy = e.pageY;
        }
        else if (e.clientX || e.clientY) {
            posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }

        return {
            x: posx,
            y: posy
        };
    }*/

};

function findSolution(header) {
    isSolutionFound = false;
    stepOfInterval = 0;
    const solution = [];
    search(header, solution, 0);

    solutionPieces = print(solution);
    $('div.solutionPieces').empty();

    solutionPieces.forEach(piece => {
        let view = piece.getView();
        $('div.solutionPieces').append(view);
        view.setAttribute("draggable", "true");
        view.addEventListener('dragstart', handleDragStart, false);
        /*view.addEventListener('dragenter', handleDragEnter, false);
        view.addEventListener('dragover', handleDragOver, false);
        view.addEventListener('dragleave', handleDragLeave, false);
        view.addEventListener('drop', handleDrop, false);*/
        view.addEventListener('dragend', handleDragEnd, false);


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

function handleDragStart(e) {
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
    //console.log(currentX, currentY);

    //noinspection JSUnresolvedVariable
    e.dataTransfer.effectAllowed = 'move';
    //noinspection JSUnresolvedVariable
    e.dataTransfer.setData('text/html', this.innerHTML);
}

/*function handleDragOver(e) {
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
}*/

function handleDragEnd(/*e*/) {
    // this/e.target is the source node.
    this.style.opacity = '1';

    /*solutionPieces.forEach(function (piece) {
        piece.classList.remove('over');
    });*/
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