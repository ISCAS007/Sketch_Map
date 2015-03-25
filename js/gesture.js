
//
// Startup
//
var _isDown, _points, _r, _rc;
function onLoadEvent()
{
	_points = new Array();
	_r = new DollarRecognizer();
	_rc = getBodySize();
	_isDown = false;
}
function getBodySize()
{
	//var g=d3.select("svg g");
	var w = width;
	var h = height;

	var cx = document.body.offsetLeft;
	var cy = document.body.offsetTop;
	
	return {x: cx, y: cy, width: w, height: h};
}
function getScrollY()
{
	var scrollY = document.body.scrollTop;
	//console.log("scrollY is "+scrollY);
	return scrollY;
}
//
// Mouse Events
//
function mouseDownEvent(x, y)
{
	document.onselectstart = function() { return false; } // disable drag-select
	document.onmousedown = function() { return false; } // disable drag-select
	_isDown = true;
	x -= _rc.x;
	y -= _rc.y - getScrollY();
	_points.length = 1; // clear
	_points[0] = new Point(x, y);
	drawText("Recording unistroke...");
}
function mouseMoveEvent(x, y)
{
	if (_isDown)
	{
		x -= _rc.x;
		y -= _rc.y - getScrollY();
		//console.log("get a point "+x+","+y);
		_points[_points.length] = new Point(x, y); // append
		drawConnectedPoint(_points.length - 2, _points.length - 1);
	}
}
function mouseUpEvent(x, y)
{
	
	document.onselectstart = function() { return true; } // enable drag-select
	document.onmousedown = function() { return true; } // enable drag-select
	if (_isDown)
	{
		_isDown = false;
		d3.selectAll("path.gesture").remove();
		if (_points.length >= 10)
		{
			//var result = _r.Recognize(_points,document.getElementById('useProtractor').checked);
			var result = _r.Recognize(_points,false);
			drawText("Result: " + result.Name + " (" + round(result.Score,2) + ").");
		}
		else // fewer than 10 points were inputted
		{
			drawText("Too few points made. Please try again.");
		}
	}
}
function drawText(str)
{
	d3.select("#gesture_tooltip p").text(str);
}
function drawConnectedPoint(from, to)
{
	var f=[],t=[];
	f[0]=_points[from].X+_rc.x;
	f[1]=_points[from].Y+_rc.y;// - getScrollY();
	t[0]=_points[to].X+_rc.x;
	t[1]=_points[to].Y+_rc.y;// - getScrollY();
	var svg=d3.select("svg").select("g").append("path")
				.attr("class","gesture")
				.attr("fill","none")
				.attr("stroke","red")
				.attr("d","M"+f+" L"+t);
}
function round(n, d) // round 'n' to 'd' decimals
{
	d = Math.pow(10, d);
	return Math.round(n * d) / d
}
//
// Unistroke Adding and Clearing
//
function onClickAddExisting()
{
	if (_points.length >= 10)
	{
		var unistrokes = document.getElementById('unistrokes');
		var name = unistrokes[unistrokes.selectedIndex].value;
		var num = _r.AddGesture(name, _points);
		drawText("\"" + name + "\" added. Number of \"" + name + "\"s defined: " + num + ".");
	}
}
function onClickAddCustom()
{
	var name = document.getElementById('custom').value;
	if (_points.length >= 10 && name.length > 0)
	{
		var num = _r.AddGesture(name, _points);
		drawText("\"" + name + "\" added. Number of \"" + name + "\"s defined: " + num + ".");
	}
}
function onClickCustom()
{
	document.getElementById('custom').select();
}
function onClickDelete()
{
	var num = _r.DeleteUserGestures(); // deletes any user-defined unistrokes
	alert("All user-defined gestures have been deleted. Only the 1 predefined gesture remains for each of the " + num + " types.");
}

