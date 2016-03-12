var numberOfRows, numberOfColumns;
var pieces = [
				CreatePiece([
					[0,0],[0,1],[0,2]
				]),
				CreatePiece([
					[0,0],[1,0],[2,0]
				])
			];

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

function CreateNode(row, column)
{
	return {R: row, C: column};
}

function CountOneComponent(startNode, arr)
{
	var size = 0;
	arr[startNode.R][startNode.C] = 1;
	var neighbours = GetNeighbours(startNode, arr);	
	
	if (neighbours.length == 0)
	{
		return 0;
	}	
	
	for (var t = 0; t < neighbours.length; t++)
	{
		arr[neighbours[t].R][neighbours[t].C] = 1;
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
	//neighbours.push(CreateNode(node.R - 1, node.C - 1));	
	//neighbours.push(CreateNode(node.R - 1, node.C + 1));
	//neighbours.push(CreateNode(node.R + 1, node.C - 1));	
	//neighbours.push(CreateNode(node.R + 1, node.C + 1));
	
	neighbours.push(CreateNode(node.R - 1, node.C));
	neighbours.push(CreateNode(node.R, node.C - 1));	
	neighbours.push(CreateNode(node.R, node.C + 1));	
	neighbours.push(CreateNode(node.R + 1, node.C));	
	
	for (var i = 0; i < neighbours.length; i++)
	{
		if (neighbours[i].R < 0 || neighbours[i].C < 0 
			|| neighbours[i].R >= arr.length || neighbours[i].C >= arr[0].length
			|| arr[neighbours[i].R][neighbours[i].C] == 1)
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
	return number % 3 == 0;
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
	var header = CreateRootObject();
	
	var columnA = CreateColumnObject(undefined, undefined, undefined, undefined, undefined, 2, 'A');
	var columnB = CreateColumnObject(undefined, undefined, undefined, undefined, undefined, 1, 'B');
	var columnC = CreateColumnObject(undefined, undefined, undefined, undefined, undefined, 1, 'C')
	var columnD = CreateColumnObject(undefined, undefined, undefined, undefined, undefined, 2, 'D')
	
	var itemA1 = CreateDataObject(undefined, undefined, undefined, undefined, columnA);
	var itemA3 = CreateDataObject(undefined, undefined, undefined, undefined, columnA);
	var itemB2 = CreateDataObject(undefined, undefined, undefined, undefined, columnB);
	var itemC1 = CreateDataObject(undefined, undefined, undefined, undefined, columnC);
	var itemD3 = CreateDataObject(undefined, undefined, undefined, undefined, columnD);
	var itemD4 = CreateDataObject(undefined, undefined, undefined, undefined, columnD);
	
	
	header.Left = columnD;
	header.Right = columnA;
	
	columnA.Left = header;
	columnA.Right = columnB;
	columnA.Up = itemA3;
	columnA.Down = itemA1;
	columnA.Column = columnA;
		
	columnB.Left = columnA;
	columnB.Right = columnC;
	columnB.Up = itemB2	;
	columnB.Down = itemB2;
	columnB.Column = columnB;
	
	columnC.Left = columnB;
	columnC.Right = columnD;
	columnC.Up = itemC1;
	columnC.Down = itemC1;
	columnC.Column = columnC;
	
	columnD.Left = columnC;
	columnD.Right = header;
	columnD.Up = itemD4;
	columnD.Down = itemD3;
	columnD.Column = columnD;
	
	itemA1.Left = itemC1;
	itemA1.Right = itemC1;
	itemA1.Up = columnA;
	itemA1.Down = itemA3;
	
	itemA3.Left = itemD3;
	itemA3.Right = itemD3;
	itemA3.Up = itemA1;
	itemA3.Down = columnA;
	
	itemB2.Left = itemB2;
	itemB2.Right = itemB2;
	itemB2.Up = columnB;
	itemB2.Down = columnB;
	
	itemC1.Left = itemA1;
	itemC1.Right = itemA1;
	itemC1.Up = columnC;
	itemC1.Down = columnC;
	
	itemD3.Left = itemA3;
	itemD3.Right = itemA3;
	itemD3.Up = columnD;
	itemD3.Down = itemD4;
	
	itemD4.Left = itemD4;
	itemD4.Right = itemD4;
	itemD4.Up = itemD3;
	itemD4.Down = columnD;
		
	return header;
}


// Prepare for DLX 
function CreatePiece(coordinates)
{
	if(coordinates.length <= 0)
	{
		return;
	}
	var nodes = [];
	var maxrow = coordinates[0][0];
	var maxcol = coordinates[0][1];
	for (var i = 0; i < coordinates.length; i++)
	{
		nodes.push(CreateNode(coordinates[i][0], coordinates[i][1]));
		if(coordinates[i][0] > maxrow)
		{
			maxrow = coordinates[i][0];
		}
		if(coordinates[i][1] > maxcol)
		{
			maxcol = coordinates[i][1];
		}
	}
		
	return {Nodes: nodes, Maxrow: maxrow, Maxcol: maxcol};	
}

function CreateXListForExactCoverProblem(arr)
{	
	//create initial Xlist with header and empty columns
	var header = CreateInitialXList();
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
					if (arr[i + nodes[k].R][j + nodes[k].C] == 1)
					{
						isMatch = false;
						break;
					}
				}
				if (isMatch)
				{
					AddNewRow(header, piece, i, j);
				}
			}
		}
	}
	
	return header;
}

//TODO
function CreateInitialXList()
{
	
}

//TODO
function AddNewRow(header, piece, row, column)
{
	
}


// Constructors for algorithm elements
function CreateDataObject(left, right, up, down, column)
{
	return {Left: left, Right:right, 
		Up: up, Down: down, 
		Column: column};
}

function CreateColumnObject(left, right, up, down, column, size, name)
{
	return {Left: left, Right:right, 
		Up: up, Down: down, 
		Column: column, Size: size,
		Name: name};
}

function CreateRootObject(left, right)
{
	return {Left: left, Right:right};
}


// DLX algorithm
function Search(header, solution, k)
{
	if (header.Right == header)
	{
		Print(solution);
	}
	else
	{
		var current = ChooseColumn(header);
		CoverColumn(current);
		var row = current.Down;
		while(row != current)
		{
			solution[k] = row;
			var j = row.Right;
			while(j != row)
			{
				CoverColumn(j.Column);
				j = j.Right;
			}
			Search(header, solution, k + 1);
			row = solution[k];
			current = row.Column;
			j = row.Left;
			while (j != row)
			{
				UncoverColumn(j.Column);
				j = j.Left;
			}			
			row = row.Down;
		}
		UncoverColumn(current);
	}
}

function Print(solution)
{
	for (var i = 0; i < solution.length; i++)
	{
		var o = solution[i];
		var f = solution[i].Left;
		var str = '';
		while(o != f)
		{
			str += o.Column.Name + '   '
			o = o.Right;
		}
		str += o.Column.Name;
		console.log(str);
	}
}

function ChooseColumn(header)
{	
	var j = header.Right;
	var current = j;
	var size = j.Size;
	
	while(j != header)
	{
		if (j.Size < size)
		{
			current = j;
			size = j.Size;
		}
		j = j.Right;
	}
	
	return current;
}

function CoverColumn(current)
{
	current.Right.Left = current.Left;
	current.Left.Right = current.Right;
	var i = current.Down;
	while(i != current)
	{
		var j = i.Right;
		while(j != i)
		{
			j.Down.Up = j.Up;
			j.Up.Down = j.Down;
			j.Column.Size--;
			
			j = j.Right;
		}
		
		i = i.Down;
	}
	
}

function UncoverColumn(current)
{
	var i = current.Up;
	while(i != current)
	{
		var j = i.Left;
		while(j != i)
		{
			j.Column.Size++;
			j.Down.Up = j;
			j.Up.Down = j;
			
			j = j.Left;
		}
		
		i = i.Up;
	}
	current.Right.Left = current;
	current.Left.Right = current;
}



$(document).ready(
	function()
	{
		SetInitialPolynomioTable();
		CountStatistic();
		
		//var header = Test_GetMatrixForExactCoverProblem();
		//var solution = [];
		//Search(header, solution, 0);
		
		
		/*var arr = TransformTableToMatrix();		
		var header = CreateXListForExactCoverProblem(arr);
		var solution = [];
		Search(header, solution, 0);*/	
		
		
		$(document).on('click', 'td.cell', 
		function()
			{
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
				$(".polytable td").removeClass('border-cell').addClass('empty-cell');
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

