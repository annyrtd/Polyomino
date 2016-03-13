var numberOfRows, numberOfColumns;
/*var pieces = [
				CreatePiece([
					[0,0],[0,1],[0,2]
				]),
				CreatePiece([
					[0,0],[1,0],[2,0]
				]),
				CreatePiece([
					[0,0],[0,1],[1,0]
				]),
				CreatePiece([
					[0,0],[0,1],[1,1]
				]),
				CreatePiece([
					[0,0],[1,0],[1,1]
				]),
				CreatePiece([
					[0,1],[1,0],[1,1]
				])
			];
*/		
var pieces = [
				CreatePiece([
					[0,0],[0,1],[0,2],[0,3]
				]),
				CreatePiece([
					[0,0],[1,0],[2,0],[3,0]
				]),
				CreatePiece([
					[0,0],[0,1],[1,0],[2,0]
				]),
				CreatePiece([
					[0,0],[0,1],[0,2],[1,2]
				]),
				CreatePiece([
					[0,0],[1,0],[1,1],[1,2]
				]),
				CreatePiece([
					[0,1],[1,1],[2,0],[2,1]
				])
			];	
var piecesLength = [4]; 
var isSolutionFound = false;


function SetInitialPolynomioTable()
{
	numberOfRows = 8;
	numberOfColumns = 8;
	for (var i = 0; i < 8; i++)
	{
		var row = $("<tr class='field-row' id='tr-" + i + "'></tr>")
		for (var j = 0; j < 8; j++)
		{
			row.append($("<td class='cell empty-cell' id='td-" 
				+ i + "-" 
				+ j + "'></td>"));					
		}
		$("table.polytable").append(row);
	}
		
	$("#td-3-3, #td-3-4, #td-4-3, #td-4-4").removeClass('empty-cell').addClass('border-cell');
}


// Counting connected components in a table
function CountStatistic()
{
	var arr = TransformTableToMatrix();
	var startNode, size = [];
	while(!isAllVisited(arr))
	{
		startNode = GetStartNode(arr);
		size.push(1 + CountOneComponent(startNode, arr));
	}
	
	for (var s = 0, temp; s < size.length; s++)
	{
		//TODO: add proper check if number of empty cells can be divided by pieces
		if (CheckIfProperNumber(size[s]))
		{
			temp = '<span class="good">' + size[s] + '</span>';
		}
		else
		{
			temp = '<span class="bad">' + size[s] + '</span>';
		}
		size[s] = temp;
	}
	
	
	var txt = "";
	if (size.length <= 0)
	{
		txt = '0';
	}
	else
	{
		if (size.length == 1)
		{
			txt = size[0];
		}
		else
		{
			for (var i = 0; i < size.length - 1; i++)
			{
				txt += size[i] + ' + ';
			}
			txt += size[size.length - 1] + ' = ' + $(".empty-cell").length.toString();
		}
	}
	
	$(".statisticSpan").html(txt);	
}

function TransformTableToMatrix()
{
	var arr = [];
	$("table.polytable tr.field-row").each(
		function(row)
		{
			arr.push([]);
			$(this).children('td.cell').each(
				function()
				{
					var item = 0;
					if ($(this).hasClass('border-cell'))
					{
						item = 1;
					}
					arr[row].push(item);
				}
			);
		}
	);
	return arr;	
}

function isAllVisited(arr)
{
	for (var i = 0; i < arr.length; i++)
	{
		for (var j = 0; j < arr[i].length; j++)
		{
			if(arr[i][j] == 0)
			{
				return false;
			}
		}
	}		
	return true;
}

function GetStartNode(arr)
{
	for (var i = 0; i < arr.length; i++)
	{
		for (var j = 0; j < arr[i].length; j++)
		{
			if(arr[i][j] == 0)
			{
				return CreateNode(i, j);
			}
		}
	}		
}

function CreateNode(r, c)
{
	return {row: r, column: c};
}

function AreNodesEqual(node1, node2)
{
	return (node1.row == node2.row) && (node1.column == node2.column);	
}

function NodeToString(node)
{
	return node.row + ',' + node.column;
}

//example: 1,1
function StringToNode(str)
{
	var position = str.indexOf(',');
	var row = str.substr(0, position);
	var column = str.substr(position + 1);
	return CreateNode(row, column);
	
}

function CountOneComponent(startNode, arr)
{
	var size = 0;
	arr[startNode.row][startNode.column] = 1;
	var neighbours = GetNeighbours(startNode, arr);	
	
	if (neighbours.length == 0)
	{
		return 0;
	}	
	
	for (var t = 0; t < neighbours.length; t++)
	{
		arr[neighbours[t].row][neighbours[t].column] = 1;
		size++;
	}	
	
	for (var i = 0; i < neighbours.length; i++)
	{	
		size += CountOneComponent(neighbours[i], arr);
	}
	
	return size;
}

function GetNeighbours(node, arr)
{
	var neighbours = [];
	// connect diagonal cells
	//neighbours.push(CreateNode(node.row - 1, node.column - 1));	
	//neighbours.push(CreateNode(node.row - 1, node.column + 1));
	//neighbours.push(CreateNode(node.row + 1, node.column - 1));	
	//neighbours.push(CreateNode(node.row + 1, node.column + 1));
	
	neighbours.push(CreateNode(node.row - 1, node.column));
	neighbours.push(CreateNode(node.row, node.column - 1));	
	neighbours.push(CreateNode(node.row, node.column + 1));	
	neighbours.push(CreateNode(node.row + 1, node.column));	
	
	for (var i = 0; i < neighbours.length; i++)
	{
		if (neighbours[i].row < 0 || neighbours[i].column < 0 
			|| neighbours[i].row >= arr.length || neighbours[i].column >= arr[0].length
			|| arr[neighbours[i].row][neighbours[i].column] == 1)
		{
			neighbours[i] = undefined;	
		}
	}
	var position = neighbours.indexOf(undefined);
	while(position > -1)
	{
		neighbours.splice(position, 1);
		position = neighbours.indexOf(undefined);
	}
	
	return neighbours;	
}

//TODO
function CheckIfProperNumber(number)
{
	for (var i = 0; i < piecesLength.length; i++)
	{
		if (number % piecesLength[i] != 0)
		{
			return false;
		}
	}
	return true;
}

// Transform table
function AddColumn()
{
	$('tr.field-row').each(
		function(row)
		{
			$(this).append($("<td class='cell empty-cell' id='td-" 
				+ row + "-" 
				+ numberOfColumns + "'></td>"));				
		}
	);
	numberOfColumns++;	
}

function AddRow()
{
	var row = $('<tr class="field-row" id="tr-' + numberOfRows + '"></tr>');
	for (var i = 0; i < numberOfColumns; i++)
	{
		row.append($("<td class='cell empty-cell' id='td-" 
			+ numberOfRows + "-" 
			+ i + "'></td>"));
	}
	
	$('table.polytable tr.field-row').last().after(row);
	numberOfRows++;
}

function RemoveColumn()
{
	if (numberOfColumns < 2)
	{
		return;
	}	
	$('tr.field-row').each(
		function(row)
		{
			$(this).children('td.cell').last().remove();		
		}
	);
	numberOfColumns--;	
}

function RemoveRow()
{
	if (numberOfRows < 2)
	{
		return;
	}	
	$('tr.field-row').last().remove();
	numberOfRows--;	
}


// test
function Test_GetMatrixForExactCoverProblem()
{
	var header = CreateRootObject({});
	
	var columnA = CreateColumnObject({size: 2, name: 'A'});
	var columnB = CreateColumnObject({size: 1, name: 'B'});
	var columnC = CreateColumnObject({size: 1, name: 'C'});
	var columnD = CreateColumnObject({size: 2, name: 'D'});
	
	var itemA1 = CreateDataObject({column: columnA});
	var itemA3 = CreateDataObject({column: columnA});
	var itemB2 = CreateDataObject({column: columnB});
	var itemC1 = CreateDataObject({column: columnC});
	var itemD3 = CreateDataObject({column: columnD});
	var itemD4 = CreateDataObject({column: columnD});
	
	
	header.left = columnD;
	header.right = columnA;
	
	columnA.left = header;
	columnA.right = columnB;
	columnA.up = itemA3;
	columnA.down = itemA1;
	columnA.column = columnA;
		
	columnB.left = columnA;
	columnB.right = columnC;
	columnB.up = itemB2	;
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
}


// Prepare for DLX 
function CreatePiece(coordinates)
{
	if(coordinates.length <= 0)
	{
		return;
	}
	var _nodes = [];
	var _maxrow = coordinates[0][0];
	var _maxcol = coordinates[0][1];
	for (var i = 0; i < coordinates.length; i++)
	{
		_nodes.push(CreateNode(coordinates[i][0], coordinates[i][1]));
		if(coordinates[i][0] > _maxrow)
		{
			_maxrow = coordinates[i][0];
		}
		if(coordinates[i][1] > _maxcol)
		{
			_maxcol = coordinates[i][1];
		}
	}
		
	return {nodes: _nodes, maxrow: _maxrow, maxcol: _maxcol};	
}

function CreateXListForExactCoverProblem(arr)
{	
	//create initial Xlist with header and empty columns
	var header = CreateInitialXList(arr);
	for(var p = 0, piece, nodes; p < pieces.length; p++)
	{
		piece = pieces[p];
		nodes = piece.nodes;
		for (var i = 0; i + piece.maxrow < arr.length; i++)
		{
			for (var j = 0; j + piece.maxcol < arr[i].length; j++)
			{
				var isMatch = true;
				for (var k = 0; k < nodes.length; k++)
				{
					if (arr[i + nodes[k].row][j + nodes[k].column] == 1)
					{
						isMatch = false;
						break;
					}
				}
				if (isMatch)
				{
					AddNewRow(header, nodes, i, j);
				}
			}
		}
	}
	
	return header;
}

//TODO
//create initial Xlist with header and empty columns
function CreateInitialXList(arr)
{
	var header = CreateRootObject({});
	var previousColumn = header;
	var currentColumn, node;
	for (var i = 0; i < arr.length; i++)
	{
		for (var j = 0; j < arr[i].length; j++)
		{
			if (arr[i][j] == 0)
			{
				// do I need NodeToString and StringToNode???
				node = CreateNode(i,j);
				currentColumn = CreateColumnObject({left: previousColumn, name: node});
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

//TODO nodes should be sorted in a right order
function AddNewRow(header, nodes, row, column)
{
	var node = nodes[0];
	var currentNode = CreateNode(node.row + row, node.column + column);	
	
	// current - текушая колонка, в которую надо вставить узел
	var current = FindColumnForNode(header, currentNode);
	if (current === undefined)
	{
		return;
	}
	
	var data, startRowData = CreateDataObject({column: current, down: current, up: current.up});
	var previousData = startRowData;
	
	//insert happens here
	startRowData.up.down = startRowData;
	startRowData.down.up = startRowData;
	current.size++;	
	
	for (var n = 1; n < nodes.length; n++)
	{
		node = nodes[n];
		currentNode = CreateNode(node.row + row, node.column + column);		
		current = FindColumnForNode(header, currentNode);
		if (current === undefined)
		{
			return;
		}
		
		data = CreateDataObject({column: current, down: current, up: current.up, left: previousData});
		previousData.right = data;
		previousData = data;
		
		//insert happens here
		data.up.down = data;
		data.down.up = data;
		current.size++;
	}
	
	startRowData.left = data;
	data.right = startRowData;
	
}

function FindColumnForNode(header, node)
{	
	var current = header.right;
	while(current != header)
	{
		if (AreNodesEqual(current.name, node))
		{
			return current;
		}
		current = current.right;
	}
	return undefined;	
}


// Constructors for algorithm elements
function CreateDataObject(obj)
{
	return {left: obj.left, right: obj.right, 
		up: obj.up, down: obj.down, 
		column: obj.column};
}

function CreateColumnObject(obj)
{
	var s = (obj.size === undefined) ? 0 : obj.size; 
	return {left: obj.left, right: obj.right, 
		up: obj.up, down: obj.down, 
		column: obj.column, size: s,
		name: obj.name};
}

function CreateRootObject(obj)
{
	return {left: obj.left, right: obj.right};
}


// DLX algorithm
function Search(header, solution, k)
{
	if (header.right == header)
	{
		if (isSolutionFound)
		{
			return;
		}
		isSolutionFound = true;
		Print(solution);
	}
	else
	{
		var current = ChooseColumn(header);
		//TODO
		/*
		var o = current.down;
		var f = o.left;
		var nodes = [];
		while(o != f)
		{
			nodes.push(o.column.name);
			o = o.right;
		}
		nodes.push(o.column.name);
		CoverPieceInTable(nodes); 
		*/
		//for row
	
		CoverColumn(current);
		var row = current.down;
		while(row != current)
		{
			solution[k] = row;
			/*
			UncoverColumn(current);
			var o = row;
			var f = o.left;
			var nodes = [];
			while(o != f)
			{
				nodes.push(o.column.name);
				o = o.right;
			}
			nodes.push(o.column.name);
			
			sleep(500);
			CoverPieceInTable(nodes);			
			CoverColumn(current);
			*/
			
			var j = row.right;
			while(j != row)
			{
				CoverColumn(j.column);
				j = j.right;
			}
			
			
			Search(header, solution, k + 1);
			row = solution[k];
			current = row.column;
			j = row.left;
			while (j != row)
			{
				UncoverColumn(j.column);
				j = j.left;
			}			
			row = row.down;
			/*if (!isSolutionFound)
			{
				sleep(500);
				UncoverPieceInTable(nodes);			
			}*/
		}
		UncoverColumn(current);
		//UncoverPieceInTable(nodes);
	}
}

function sleep(ms) 
{
	ms += new Date().getTime();
	while (new Date() < ms)
	{
		
	}
} 

function Print(solution)
{
	console.log('Solution(' + solution.length + ' pieces):');
	for (var i = 0; i < solution.length; i++)
	{
		var o = solution[i];
		var f = solution[i].left;
		var str = '';
		var nodes = [];
		while(o != f)
		{
			nodes.push(o.column.name);
			str += NodeToString(o.column.name) + '   '
			o = o.right;
		}
		nodes.push(o.column.name);
		str += NodeToString(o.column.name);
		CoverPieceInTable(nodes); 
		console.log(str);
	}
}

function CoverPieceInTable(nodes)
{
	var color = getRandomColor(); 
	for (var i = 0; i < nodes.length; i++)
	{
		var row = nodes[i].row;
		var column = nodes[i].column;
		$('#td-' + row + '-' + column).css('backgroundColor', color);
	}
}

function UncoverPieceInTable(nodes)
{
	for (var i = 0; i < nodes.length; i++)
	{
		var row = nodes[i].row;
		var column = nodes[i].column;
		$('#td-' + row + '-' + column).css('backgroundColor', '');
	}
}

function getRandomColor()
{
	var letters = '0123456789ABCDEF'.split('');
	var color = '#';
	for (var i = 0; i < 6; i++)
	{
		color += letters[Math.floor(Math.random() * 16)];
	}
	if (color == '#000000' || color == '#FFFFFF')
	{
		return '#333333';
	}
	return color;
}

function ChooseColumn(header)
{	
	var j = header.right;
	var current = j;
	var size = j.size;
	
	while(j != header)
	{
		if (j.size < size)
		{
			current = j;
			size = j.size;
		}
		j = j.right;
	}
	
	return current;
}

function CoverColumn(current)
{
	current.right.left = current.left;
	current.left.right = current.right;
	var i = current.down;
	while(i != current)
	{
		var j = i.right;
		while(j != i)
		{
			j.down.up = j.up;
			j.up.down = j.down;
			j.column.size--;
			
			j = j.right;
		}
		
		i = i.down;
	}
	
}

function UncoverColumn(current)
{
	var i = current.up;
	while(i != current)
	{
		var j = i.left;
		while(j != i)
		{
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



$(document).ready(
	function()
	{
		SetInitialPolynomioTable();
		CountStatistic();
		
		//var header = Test_GetMatrixForExactCoverProblem();
		//var solution = [];
		//Search(header, solution, 0);
		
		$('#go').click(
			function()
			{
				if ($('span.statisticSpan').children('.bad').length > 0)
				{
					alert("It's impossible to cover table with such number of empty cells!");
					return;
				}
				isSolutionFound = false;
				var arr = TransformTableToMatrix();		
				var header = CreateXListForExactCoverProblem(arr);
				var solution = [];
				Search(header, solution, 0);
				if (!isSolutionFound)
				{
					alert('There is no solution!');
				}
			}
		);		
		
		
		
		$(document).on('click', 'td.cell', 
		function()
			{
				$(this).css('backgroundColor', '');
				if ($(this).hasClass('empty-cell'))
				{
					$(this).removeClass('empty-cell').addClass('border-cell');
					CountStatistic();
				}
				else
				{					
					$(this).removeClass('border-cell').addClass('empty-cell');					
					CountStatistic();
				}
			}
		);
		
		$("#resetBarrierCells").click(
			function()
			{
				$(".polytable td").removeClass('border-cell').addClass('empty-cell').css('backgroundColor', '');;
				CountStatistic();
			}
		);	

		$('div.arrow-div').click(
			function()
			{
				var direction = $(this).removeClass('arrow-div').attr('class').replace('arrow-', '');
				
				switch(direction)
				{
					case 'left':
						RemoveColumn();
						break;
					case 'right':
						AddColumn();
						break;
					case 'top':
						RemoveRow();
						break;
					case 'bottom':
						AddRow();
						break;
				}
				
				$(this).addClass('arrow-div');
				CountStatistic();
			}
		);
	}
);

