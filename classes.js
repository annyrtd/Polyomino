'use strict';

class RootObject {
    constructor({left, right}) {
        this.left = left;
        this.right = right;
    }
}

class DataObject extends RootObject{
    constructor({left, right, up, down, column}) {
        super({left, right});
        this.up = up;
        this.down = down;
        this.column = column;
    }
}

class ColumnObject extends DataObject{
    constructor({left, right, up, down, column, size = 0, name}) {
        super({left, right, up, down, column});
        this.size = size;
        this.name = name;
    }
}

class Node {
    constructor(row, column) {
        this.row =  row;
        this.column = column;
    }
    //example: "1,1"
    static fromString(str) {
        var position = str.indexOf(',');
        var row = str.substr(0, position);
        var column = str.substr(position + 1);
        return new Node(row, column);
    }
    toString() {
        return this.row + ',' + this.column;
    }
    equalsTo(node) {
        return (this.row == node.row) && (this.column == node.column);
    }
}

class Piece {
    constructor(coordinates) {
        let nodes = [];
        let maxrow = coordinates[0][0];
        let maxcol = coordinates[0][1];
        for (let i = 0; i < coordinates.length; i++) {
            nodes.push(new Node(coordinates[i][0], coordinates[i][1]));
            if (coordinates[i][0] > maxrow) {
                maxrow = coordinates[i][0];
            }
            if (coordinates[i][1] > maxcol) {
                maxcol = coordinates[i][1];
            }
        }

        this.nodes = nodes;
        this.maxrow = maxrow;
        this.maxcol = maxcol;
    }
}

/*
module.exports.RootObject = RootObject;
module.exports.DataObject = DataObject;
module.exports.ColumnObject = ColumnObject;
module.exports.Node = Node;
module.exports.Piece = Piece;
*/