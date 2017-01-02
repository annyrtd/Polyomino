var isSolutionFound = false;
const interval = 20;
let stepOfInterval = 0;

function findSolution(header) {
    isSolutionFound = false;
    stepOfInterval = 0;
    var solution = [];
    search(header, solution, 0);
    return isSolutionFound;
}

// DLX algorithm
function search(header, solution, k) {
    if (header.right == header) {
        if (isSolutionFound) {
            return;
        }
        isSolutionFound = true;
        print(solution);
    }
    else {
        if (isSolutionFound) {
            return;
        }
        var current = chooseColumn(header);
        coverColumn(current);
        var row = current.down;

        while (row != current && !isSolutionFound) {
            solution[k] = row;

            let nodes = tryToGetPiece(row);
            setTimeoutForCoveringPiece(nodes);

            var j = row.right;
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

function sleep(ms) {
    ms += new Date().getTime();
    while (new Date() < ms) {

    }
}

function print(solution) {
    console.log('Solution(' + solution.length + ' pieces):');
    //let interval = 50;
    for (var i = 0; i < solution.length; i++) {
        var o = solution[i];
        var f = solution[i].left;
        var str = '';
        let nodes = [];
        while (o != f) {
            nodes[nodes.length] = o.column.name;
            str += nodeToString(o.column.name) + '   ';
            o = o.right;
        }
        nodes[nodes.length] = o.column.name;
        str += nodeToString(o.column.name);
        //setTimeout(function() {
        //    coverPieceInTable(nodes)
        //}, interval*i);
        //coverPieceInTable(nodes);
        console.log(str);
    }
}

function coverPieceInTable(nodes) {
    var color = getRandomColor();
    for (var i = 0; i < nodes.length; i++) {
        var row = nodes[i].row;
        var column = nodes[i].column;
        $('#td-' + row + '-' + column).css('backgroundColor', color);
    }
}

function uncoverPieceInTable(nodes) {
    for (var i = 0; i < nodes.length; i++) {
        var row = nodes[i].row;
        var column = nodes[i].column;
        $('#td-' + row + '-' + column).css('backgroundColor', '');
    }
}

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 12 + 2)];
    }
    if (color == '#000000' || color == '#FFFFFF') {
        return '#333333';
    }
    return color;
}

function chooseColumn(header) {
    var j = header.right;
    var current = j;
    var size = j.size;

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
    var i = current.down;
    while (i != current) {
        var j = i.right;
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
    var i = current.up;
    while (i != current) {
        var j = i.left;
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