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
//var isSolutionFound = false;

// algo: https://en.wikipedia.org/wiki/Fisher-Yates_shuffle
function shufflePieces() {
    let currentIndex = pieces.length, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        [pieces[currentIndex], pieces[randomIndex]] = [pieces[randomIndex], pieces[currentIndex]];
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

/*function areNodesEqual(node1, node2) {
    return (node1.row == node2.row) && (node1.column == node2.column);
}

function nodeToString(node) {
    return node.row + ',' + node.column;
}

//example: "1,1"
function stringToNode(str) {
    var position = str.indexOf(',');
    var row = str.substr(0, position);
    var column = str.substr(position + 1);
    return new Node(row, column);

}
*/
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

// test
/*function test_getMatrixForExactCoverProblem() {
    var header = new RootObject({});

    var columnA = new ColumnObject({size: 2, name: 'A'});
    var columnB = new ColumnObject({size: 1, name: 'B'});
    var columnC = new ColumnObject({size: 1, name: 'C'});
    var columnD = new ColumnObject({size: 2, name: 'D'});

    var itemA1 = new DataObject({column: columnA});
    var itemA3 = new DataObject({column: columnA});
    var itemB2 = new DataObject({column: columnB});
    var itemC1 = new DataObject({column: columnC});
    var itemD3 = new DataObject({column: columnD});
    var itemD4 = new DataObject({column: columnD});


    header.left = columnD;
    header.right = columnA;

    columnA.left = header;
    columnA.right = columnB;
    columnA.up = itemA3;
    columnA.down = itemA1;
    columnA.column = columnA;

    columnB.left = columnA;
    columnB.right = columnC;
    columnB.up = itemB2;
    columnB.down = itemB2;
    columnB.column = columnB;

    columnC.left = columnB;
    columnC.right = columnD;
    columnC.up = itemC1;
    columnC.down = itemC1;
    columnC.column = columnC;

    columnD.left = columnC;
    columnD.right = header;
    columnD.up = itemD4;
    columnD.down = itemD3;
    columnD.column = columnD;

    itemA1.left = itemC1;
    itemA1.right = itemC1;
    itemA1.up = columnA;
    itemA1.down = itemA3;

    itemA3.left = itemD3;
    itemA3.right = itemD3;
    itemA3.up = itemA1;
    itemA3.down = columnA;

    itemB2.left = itemB2;
    itemB2.right = itemB2;
    itemB2.up = columnB;
    itemB2.down = columnB;

    itemC1.left = itemA1;
    itemC1.right = itemA1;
    itemC1.up = columnC;
    itemC1.down = columnC;

    itemD3.left = itemA3;
    itemD3.right = itemA3;
    itemD3.up = columnD;
    itemD3.down = itemD4;

    itemD4.left = itemD4;
    itemD4.right = itemD4;
    itemD4.up = itemD3;
    itemD4.down = columnD;

    return header;
}*/

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

// DLX algorithm
/*

function search(header, solution, k) {
    if (header.right == header) {
        if (isSolutionFound) {
            return;
        }
        isSolutionFound = true;
        print(solution);
    }
    else {
        var current = chooseColumn(header);
        //TODO
        /!*
         var o = current.down;
         var f = o.left;
         var nodes = [];
         while(o != f)
         {
         nodes[nodes.length] = o.column.name;
         o = o.right;
         }
         nodes[nodes.length] = o.column.name;
         coverPieceInTable(nodes);
         *!/
        //for row

        coverColumn(current);
        var row = current.down;
        while (row != current) {
            solution[k] = row;
            /!*
             uncoverColumn(current);
             var o = row;
             var f = o.left;
             var nodes = [];
             while(o != f)
             {
             nodes[nodes.length] = o.column.name;
             o = o.right;
             }
             nodes[nodes.length] = o.column.name;

             sleep(500);
             coverPieceInTable(nodes);
             coverColumn(current);
             *!/

            var j = row.right;
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
            /!*if (!isSolutionFound)
             {
             sleep(500);
             uncoverPieceInTable(nodes);
             }*!/
        }
        uncoverColumn(current);
        //uncoverPieceInTable(nodes);
    }
}

function sleep(ms) {
    ms += new Date().getTime();
    while (new Date() < ms) {

    }
}

function print(solution) {
    console.log('Solution(' + solution.length + ' pieces):');
    for (var i = 0; i < solution.length; i++) {
        var o = solution[i];
        var f = solution[i].left;
        var str = '';
        var nodes = [];
        while (o != f) {
            nodes[nodes.length] = o.column.name;
            str += nodeToString(o.column.name) + '   '
            o = o.right;
        }
        nodes[nodes.length] = o.column.name;
        str += nodeToString(o.column.name);
        coverPieceInTable(nodes);
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
        color += letters[Math.floor(Math.random() * 16)];
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
*/

$(document).ready(
    function() {
        setInitialPolyminoTable();
        countStatistic();

        /*var header = test_getMatrixForExactCoverProblem();
        var solution = [];
        search(header, solution, 0);*/

        $('#go').click(
            function () {
                shufflePieces();
                //noinspection JSValidateTypes
                if ($('span.statisticSpan').children('.bad').length > 0) {
                    alert("It's impossible to cover table with such number of empty cells!");
                    return;
                }
                const arr = transformTableToMatrix();
                const header = createXListForExactCoverProblem(arr);
                let isFound = findSolution(header);
                if (!isFound) {
                    alert('There is no solution!');
                }
            }
        );


        $(document).on('click', 'td.cell',
            function () {
                $('td.cell').css('backgroundColor', '');
                //$(this).css('backgroundColor', '');
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

        $("#resetBarrierCells").click(
            function () {
                $(".polytable td").removeClass('border-cell').addClass('empty-cell').css('backgroundColor', '');
                countStatistic();
            }
        );

        $('div.arrow-div').click(
            function () {
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


        let effect = 'move',
//            format = 'Text',
            dz = document.querySelector('.polytable');
        //var dz = document.querySelector('.game');

        EventUtil.addHandler(dz, 'dragenter', function(/*e*/) {

            //let target = EventUtil.getCurrentTarget(e);
            //target.style.backgroundColor = 'orange';
            return false;
        });

        let previousRow = -10;
        let previousCol = -10;
        let isPieceSet = false;

        EventUtil.addHandler(dz, 'dragover', function(e) {
            let offset = $(this).offset();
            let containerX = e.pageX - offset.left;
            let containerY = e.pageY - offset.top;
            let row = Math.round((containerY - currentY) / 35);
            let column = Math.round((containerX - currentX) / 35);

            if (previousCol != column || previousRow != row || !isPieceSet) {
                isPieceSet = true;
                previousRow = row;
                previousCol = column;
                $('td.cell')
                    .not('.set')
                    .not('.border-cell')
                    .css('backgroundColor', '');

                currentPieceTdCoordinates.every((item) => {
                    /*let cell = document.getElementById(`td-${parseInt(item.row) + row}-${parseInt(item.column) + column}`);
                     cell.style.backgroundColor = currentColor;*/

                    let tdRow = parseInt(item.row) + row;
                    let tdCol = parseInt(item.column) + column;
                    let cell = $(`#td-${tdRow}-${tdCol}`)
                        .not('.set').not('.border-cell');

                    if (cell.length > 0) {
                        cell.css('backgroundColor', currentColor);
                    } else {
                        $('td.cell')
                            .not('.set')
                            .not('.border-cell')
                            .css('backgroundColor', '');
                        isPieceSet = false;
                        return false;
                    }

                    return true;
                });
            }


            console.log(row, column);

            EventUtil.preventDefault(e);

            //noinspection JSUnresolvedVariable
            e.dataTransfer.dropEffect = effect;

            return false;
        });

        EventUtil.addHandler(dz, 'dragleave', function(/*e*/) {
            //const target = EventUtil.getCurrentTarget(e);
            $('td.cell').not('.set').css('backgroundColor', '');
            isPieceSet = false;
            //target.style.backgroundColor = '';
            return false;
        });

        EventUtil.addHandler(dz, 'drop', function(e) {
            EventUtil.preventDefault(e);
            /*var currentTarget = EventUtil.getCurrentTarget(e),
                DragMeId = e.dataTransfer.getData(format),
                DragMe = document.getElementById(DragMeId);

            currentTarget.appendChild(DragMe);*/
            /*var target = EventUtil.getCurrentTarget(e);
            target.style.backgroundColor = '';*/
            /*let offset = $(this).offset();
            //or $(this).parent().offset(); if you really just want the current element's offset
            let containerX = e.pageX - offset.left;
            let containerY = e.pageY - offset.top;
            let row = Math.round((containerY - currentY) / 35);
            let column = Math.round((containerX - currentX) / 35);*/

            if (isPieceSet) {
                draggableElement.parentNode.removeChild(draggableElement);
                currentPieceTdCoordinates.forEach((item) => {
                    /*let cell = document.getElementById(`td-${parseInt(item.row) + row}-${parseInt(item.column) + column}`);
                     cell.style.backgroundColor = currentColor;*/
                    let tdRow = parseInt(item.row) + previousRow;
                    let tdCol = parseInt(item.column) + previousCol;

                    let cell = $(`#td-${tdRow}-${tdCol}`);
                    cell.addClass('set');
                    //cell.attr('data-nodes', currentCoordinatesAttribute);
                });
            }
            return false;
        });
    }
);