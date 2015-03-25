//author: yzbx

/*
pointNum: dataEvent.length
Points: dataRoler
srcName: Na[0]
desName: Na[1]
函数用途：将每个事件点对应到二进制数 00(No src,No des),01(no src,des),10(src,no des),11(src,des)
函数结果：返回所有事件点对应的二进制数
//已弃用，因为lines并不能由点的信息推断出来
function point2value(pointNum,Points,srcName,desName)
{
	console.log("pointNum is "+pointNum);
	var pointValue=new Array(pointNum);
	for(var i=0;i<pointNum;i++)
	{
		pointValue[i]=0;
	}
	var number;
	for(var i=0;i<Points.length;i++)
	{
		number=Points[i].number-1;		//json 中从1开始，这里从0开始
		if(Points[i].name==srcName)
		{
			pointValue[number]=pointValue[number]|1;
		}
		
		//srcName 可能即 desName
		if(Points[i].name==desName)
		{
			pointValue[number]=pointValue[number]|2;
		}
	}
	return pointValue; 
}

*/

/*
pointValue: 每个事件点对应的二进制数组
path: 不考虑人物对应时的路径
这个函数用来检查路径是否合法，并不打算用,因为先检查边可以加快计算速度
function checkPath(path,pointValue)
{
	var a=10;
	var b=0;
	for(var i=0;i<path.length;i++)
	{
		b=path[i];
		if(a&b)	a=b;
		else return false;
	}
	
	return true;
}

*/

/*
pointNum: dataEvent.length
Points: dataRoler
Nu:	Event number
Na: roler name
timeManEdgeArray: 	dataLines 时间人物线的数组
timeManPathArray: 时间人物路径数组
使用条件：des>src， （des<src 则解为空，des=src 则解为Nu[0]）
返回结果：人物在事件中的所有合法路径
*/
function getTimeLinePath(Nu,Na,timeManEdgeArray,pointNum,Points)
{
	var m=Nu[1]-Nu[0]+1;
	if(m<2){	
		console.log("请确保调用前满足 Nu[1]>Nu[0]");
		return ;
	}
	
	var edgeMatrix=new Array();		//the edge for dfs, [src,des,length]
	//console.log("init edgeMatrix ");
	for(var i=0;i<m;i++)
	{
		edgeMatrix[i]=new Array();
		for(var j=0;j<m;j++)
		{
			edgeMatrix[i][j]=0;
		}
		//console.log(edgeMatrix[i]);
	}
	
	var pathSet=new Array(); 	//save the path of timeManPath
	var tmpPath=[];	//tmp path for dfs;
	var stack=[];	//stack for dfs
	var src=Nu[0];
	var des=Nu[1];
	var s,e,i,sp,bsp,tmpPoint,oldsp;
	var branchNum=[];
	//des > src
	//var pointValue=point2value(pointNum,Points,Na[0],Na[1]);
	//console.log("pointValue is "+pointValue);
	
	for(i=0;i<timeManEdgeArray.length;i++)
	{
		s=timeManEdgeArray[i].s;
		e=timeManEdgeArray[i].e;
		
		//if(s>=src&&e<=des)
		if(s>=src &&s<e&& e<=des){
			if(timeManEdgeArray[i].name==Na[0])//pointValue[s]&pointValue[e]
			{
				/*
				edge.push(s);
				edge.push(e);
				
				if(timeManEdgeArray[i].name==Na[0])	edge.push(1);
				else edge.push(2);
				edge.push(timeManEdgeArray[i].name);
				*/
				edgeMatrix[s-src][e-src]=edgeMatrix[s-src][e-src]|1;
			}
			else if(timeManEdgeArray[i].name==Na[1]&&Na[0]!=Na[1]){
				edgeMatrix[s-src][e-src]=edgeMatrix[s-src][e-src]|2;
			}
		}	
	}
	
	
	console.log("src: "+src+" des: "+des);
	console.log("srcName: "+Na[0]+"desName: "+Na[1]);
	//console.log("pointValue: "+pointValue);
	console.log("set edgeMatrix: ");
	for(var i=0;i<m;i++)
	{
		console.log(edgeMatrix[i]);
	}
	
	
	sp=0;
	stack.push(src);
	sp=sp+1;

	bsp=0;
	while(sp!=0)
	{
		oldsp=sp;
		sp=sp-1;
		tmpPoint=stack[sp];
		stack.pop();
		
		if(bsp >0 ){
			branchNum[bsp-1]=branchNum[bsp-1]-1;
		}
		
		tmpPath.push(tmpPoint);

		for(var j=tmpPoint-src+1;j<m;j++)
		{
			if(edgeMatrix[tmpPoint-src][j]>0)
			{
				if(j<m-1)
				{
					stack.push(src+j);
					sp=sp+1;
				}
				else if(j==m-1)
				{
					var path=new Array();
					
					for(var k=0;k<tmpPath.length;k++)
					{
						var edge=new Array(3);
						edge[0]=tmpPath[k];
						if(k+1<tmpPath.length) edge[1]=tmpPath[k+1];
						else edge[1]=des;
						
						if(Na[0]==Na[1])	edge[2]=1;	//如果是同一人，则只有一种情况
						else {
							//edge[2]=(pointValue[edge[0]]&pointValue[edge[1]]);
							edge[2]=edgeMatrix[edge[0]-src][edge[1]-src];
						}
						//edge[2]=pointValue[edge[0]]&pointValue[edge[1]];
						path.push(edge);
						
					
					}
					
					pathSet.push(path);
				}
			}
		}
		
		
		if(sp<oldsp)
		{
			tmpPath.pop();
			
			while(branchNum[bsp-1]==0)
			{
				tmpPath.pop();
				branchNum.pop();
				bsp=bsp-1;
			}
		}
		else{
			
			branchNum.push(sp-oldsp+1);
			bsp=bsp+1;
		}
	}
	
	//console.log("pathSet "+pathSet);
	//将时间联系路径细化为时间人物联系路径
	//当路径中出线连续的边时，将产生新的路径
	var a,b;
	var flag=true;		//记录路径转换是否全部完成
	var timeManPathArray=pathSet;	//时间人物联系路径, 格式[src number,des number,type(0=出错,1=src-src,2=des-des,3=src-src+des-des)]
	
	while(flag){
		flag=false;
		
		for(var i=0;i<timeManPathArray.length;i++)
		{
			//var timeManPath=timeManPathArray[i];
			for(var j=0;j<timeManPathArray[i].length;j++)
			{
				if(timeManPathArray[i][j][2]==3){
					var tmpPath=new Array();
					for(var k=0;k<timeManPathArray[i].length;k++)
					{
						var tmpEdge=new Array(3);
						tmpEdge[0]=timeManPathArray[i][k][0];
						tmpEdge[1]=timeManPathArray[i][k][1];
						tmpEdge[2]=timeManPathArray[i][k][2];
						
						tmpPath.push(tmpEdge);
					}
					
					timeManPathArray[i][j][2]=1;
					
					//timeManPathArray[i][j][2]=1;
					tmpPath[j][2]=2;
					
					timeManPathArray.push(tmpPath);
					
					flag=true;
				}
			}
		}
	}
	
	
	console.log("timeManPathArray is ........");
	for(var i=0;i<timeManPathArray.length;i++)
	{
		console.log("the path "+i+" is :");
		for(var j=0;j<timeManPathArray[i].length;j++)
		{
			console.log(timeManPathArray[i][j]);
		}
	}
	return timeManPathArray;
}

/*
timeline: 所有的时间线
timepath: 选中的某条时间路径（注意，不是所有时间路径timeLinePath）
timevalue: 是否显示路径的标志
//已停用

function getTimeLineValue(timeline,timepath)
{
	var timevalue=[];
	
	for(var i=0;i<timeline.length;i++){
		timevalue.push(0);
		for(var j=0;j<timepath.length-1;j++)
		{
			if(timeline[i].s==timepath[j]&&timeline[i].e==timepath[j+1])	timevalue[i]=1;
		}
	}
	
	return timevalue;
}
*/

/*
eventNum: 事件编号
rolerName: 角色名称
eventManPointArray: 对应Geo.json 中的Points 属性，对应ReadFill.js中的dataRoler
返回相应角色在事件中的位置
*/
function getCoordinates(eventNum,rolerName,eventManPointArray)
{
	return eventManPointArray[eventNum-1][Nam(rolerName)];
}

/*
eventManPointArray: dataRoler,事件人物点数组
timeManPath: d,时间人物联系路径
nameArray: Na, Na[0]为src name, Na[1]为des name
timeManValueArray: 是否显示时间人物线的标志

return 0 表示不显示
return 1 表示显示并令颜色为srcname 对应的color(Nam(srcname))
return 2 表示显示并令颜色为desname 对应的color(Nam(desname))
return 3 表示显示并令其颜色为混合颜色

*/
function getInvertLocation(from,to)
{
	var location=[];
	var xoff=0,yoff=0;
	location.push([from[0]+xoff,from[1]+yoff]);
	location.push([to[0]+xoff,to[1]+yoff]);
	
	return location;
}
function getTimeManValueArray(eventManPointArray,timeManPath,nameArray)
{
	//   {"s":1,"e":3,"len":3,"type":"LineString","coordinates":[[86.64466985700005,22.546933554000077],[96.06690781900005,20.561954826000033]]},
	var timeManValueArray=new Array();
	var colorArray=[];
	var line;
	var from,to;
	
	if(timeManPath[0][2]!=1)
	{
		line=new Object();
		line.type="LineString";
		from=getCoordinates(timeManPath[0][0],nameArray[0],eventManPointArray);
		to=getCoordinates(timeManPath[0][0],nameArray[1],eventManPointArray);
		line.coordinates=getInvertLocation(from,to);
		//console("line->invert "+line+" -> "+line)
		timeManValueArray.push(line);
		colorArray.push(3);
	}
	
	for(var j=0;j+1<timeManPath.length;j++)
	{
		line=new Object();
		line.type="LineString";
		from=getCoordinates(timeManPath[j][0],nameArray[timeManPath[j][2]-1],eventManPointArray);
		to=getCoordinates(timeManPath[j][1],nameArray[timeManPath[j][2]-1],eventManPointArray);
		line.coordinates=getInvertLocation(from,to);
		timeManValueArray.push(line);
		colorArray.push(timeManPath[j][2]);
		
		if(timeManPath[j][2]!=timeManPath[j+1][2])
		{
			line=new Object();
			line.type="LineString";
			from=getCoordinates(timeManPath[j][1],nameArray[2-timeManPath[j][2]],eventManPointArray);
			to=getCoordinates(timeManPath[j][1],nameArray[timeManPath[j][2]-1],eventManPointArray);
			line.coordinates=getInvertLocation(from,to);
			timeManValueArray.push(line);
			colorArray.push(3);
		}
	}
	
	line=new Object();
	line.type="LineString";
	from=getCoordinates(timeManPath[j][0],nameArray[timeManPath[j][2]-1],eventManPointArray);
	to=getCoordinates(timeManPath[j][1],nameArray[timeManPath[j][2]-1],eventManPointArray);
	line.coordinates=getInvertLocation(from,to);
	timeManValueArray.push(line);
	colorArray.push(timeManPath[j][2]);
		
	if(timeManPath[j][2]!=2)
	{	
		line=new Object();
		line.type="LineString";
		from=getCoordinates(timeManPath[j][1],nameArray[0],eventManPointArray);
		to=getCoordinates(timeManPath[j][1],nameArray[1],eventManPointArray);
		line.coordinates=getInvertLocation(from,to);
		timeManValueArray.push(line);
		colorArray.push(3);
	}
	
	console.log("timeManValueArray is ........");
	for(var i=0;i<timeManValueArray.length;i++)
	{
		console.log("timeManValueArray "+i+" is :"+timeManValueArray[i].type+" "+timeManValueArray[i].coordinates+" colorArray is "+colorArray[i]);
	}
	
	timeManLineArray=[];
	timeManLineArray.push(timeManValueArray);
	timeManLineArray.push(colorArray);
	return timeManLineArray;
}

var lineFunction=d3.svg.line()
					.x(function(d){return d.coordinates[0]})
					.y(function(d){return d.coordinates[1]})
					.interpolate("linear");

function createAbsLine(g,timeManLineArray)
{
	var col;
	for(var i=0;i<timeManLineArray[0].length;i++)
	{
		if(timeManLineArray[1][i]==1){
			col=color(Nam(Na[0]));
		}
		else if(timeManLineArray[1][i]==2)
		{
			col=color(Nam(Na[1]));
		}
		else{	//d.rolerNum==3
			col=color(19);	//最后一种颜色
			//return "red";
		}
		g.append("line")
			.attr("class","timeMan")
			.attr("x1",timeManLineArray[0][i].coordinates[0][0])
			.attr("y1",timeManLineArray[0][i].coordinates[0][1])
			.attr("x2",timeManLineArray[0][i].coordinates[1][0])
			.attr("y2",timeManLineArray[0][i].coordinates[1][1])
			.attr("stroke",col)
			.attr("stroke-width", 1)
			.attr("fill", "none")
			.attr("display","block");
	}
}		

function createAPath(g,points)
{	
	var att;
	for(var i=0;i<points.length;i++)
	{	
		if(i==0)	att="M"+points[i][0]+" "+points[i][1];
		else att=att+" L"+points[i][0]+" "+points[i][1];
	}
	att=att+" Z";
	console.log(att);
	
	g.selectAll("path.test").remove();
	g.selectAll("path.test")
		.append("path")
		.attr("class","test")
		.attr("stroke-width",10)
		.attr("fill", "none")
		.attr("stroke","red")
		//.attr("d", path);
		.attr("d",att)
		.attr("display","block");
		
		
}

function getEventLocation(eventpos)
{
	var eventlocation=[];
	var set;
	for(var i=0;i<eventpos.length;i=i+2)
	{
		set=new Array(2);
		set=projection.invert([eventpos[i],eventpos[i+1]]);
		eventlocation.push(set);
	}
	
	return eventlocation;
}

function getRolerLocation(rolerpos)
{
	var rolerlocation=[];
	var seti,setj;
	for(var i=0;i<rolerpos.length;i++)
	{
		seti=new Array();
		for(var j=0;j<rolerpos[i].length;j++)
		{
			setj=new Array(2);
			setj=projection.invert(rolerpos[i][j]);
			seti.push(setj);
		}
		
		rolerlocation.push(seti);
	}
	
	return rolerlocation;
}
/* failed!!!!
function showCanvas()
{
	var map=d3.select("svg");
	if(map.attr("display")=="none"){
		map.attr("display","block");
	}
	else
	{
		map.attr("display","none");
	}
	console.log(map.attr("display"));
	//d3.select("svg").attr("display","none");
}
*/
function gestureHelp()
{
	if(stopDrag) {
		stopDrag=false;
		d3.select("#gesture_pic").attr("class","hidden");
		d3.select("#button_gesture").text("拖动");
	}
	else {
		stopDrag=true;
		d3.select("#gesture_pic").attr("class","show");//.text("手势优先");
		d3.select("#button_gesture").text("手势");
	}
	/*
	if(d3.select("#gesture_pic").attr("class")=="hidden")
	{
		d3.select("#gesture_pic").attr("class","show");
	}
	else
	{
		d3.select("#gesture_pic").attr("class","hidden");
	}
	
	for(var i=0;i<_r.Unistrokes.length;i++)
	{
		console.log(_r.Unistrokes[i].Name);
	}
	*/
}

function result2action(result,from,to,center)
{
	console.log(result.Name);
	switch(result.Name){
	case "triangle":
	{
		//shows();
		//break;
	}
	case "rectangle":
	{
	/*
		var player=document.getElementById("player");
		if (player.style.visibility == "hidden") {
			player.style.visibility="visible";
		}
		else{
			player.style.visibility="hidden";
		}
		break;
		*/
	}
	case "circle":
	{
		//resets();
		var index=0;
		var min=+Infinity;
		for(var i=0;i<absEventPos.length;i++)
		{	
			var p=new Point(absEventPos[i][0],absEventPos[i][1]);
			var dis=Distance(p,center);
			if(dis<min)
			{
				min=dis;
				index=i;
			}
		}
		var num=index+1;
		var str="video/";
            str+= num+".mp4";
            clicked(str, num);
		
		console.log("choose event center "+index);
		break;
	}
	case "x":
	{
		//gestureHelp();
		//break;
	}
	case "check":{
		//find();
		//break;
	}
	case "caret":
	case "zig-zag":
	case "arrow":
	case "left square bracket":
	case "right square bracket":
	case "v":
	case "delete":
	case "left curly brace":
	case "right curly brace":
	case "star":
	case "pigtail":
	{
		var index=0;
		var min=+Infinity;
		
		if(d3.select("image.circle").attr("display")=="none"){
			console.log("display==none");
			for(var i=0;i<absEventPos.length;i++)
			{	
				var p=new Point(absEventPos[i][0],absEventPos[i][1]);
				var dis=Distance(p,from);
				if(dis<min)
				{
					min=dis;
					index=i;
				}
			}
			eventchoose[0]=index+1;
			console.log("choose event from "+index);
			
			min=+Infinity;
			for(var i=0;i<absEventPos.length;i++)
			{	
				var p=new Point(absEventPos[i][0],absEventPos[i][1]);
				var dis=Distance(p,to);
				if(dis<min)
				{
					min=dis;
					index=i;
				}
			}
			
			console.log("choose event to "+index);
			
			eventchoose[1]=index+1;
			eventchoosenum=2;
			g.selectAll("#path-background"+eventchoose[0])
						.attr("stroke","red")
						.attr("stroke-width",10);
			g.selectAll("#path-background"+eventchoose[1])
						.attr("stroke","red")
						.attr("stroke-width",10);
	
			var CommonRolers=getCommonRolers(eventchoose,dataRoler,14,Nam,num2roler);
				
			showSceneTooltip(eventchoose,pos,CommonRolers);
		}
		else
		{
			console.log("display==block");
			min=+Infinity;
			var eventIndex=0;
			var rolerIndex=0;
			var p_from;
			for(var i=0;i<absEventRolerPos.length;i++)
			{
				for(var j=0;j<absEventRolerPos[0].length;j++)
				{
					var p=new Point(absEventRolerPos[i][j][0]+picOffset[0],absEventRolerPos[i][j][1]+picOffset[1]);
					var dis=Distance(p,from);
					if(dis<min)
					{
						p_from=p;
						min=dis;
						eventIndex=i;
						rolerIndex=j;
					}
				}
			}
			
			Na[0]=num2roler(rolerIndex);
			Nu[0]=eventIndex+1;
			
			min=+Infinity;
			var p_to;
			for(var i=0;i<absEventRolerPos.length;i++)
			{
				for(var j=0;j<absEventRolerPos[0].length;j++)
				{
					var p=new Point(absEventRolerPos[i][j][0]+picOffset[0],absEventRolerPos[i][j][1]+picOffset[1]);
					var dis=Distance(p,to);
					if(dis<min)
					{
						p_to=p;
						min=dis;
						eventIndex=i;
						rolerIndex=j;
					}
				}
			}
			
			cnt=2;
			Na[1]=num2roler(rolerIndex);
			Nu[1]=eventIndex+1;
			console.log("from is "+from.X+","+from.Y+" to is "+to.X+","+to.Y);
			console.log("absEventRolerPos is from "+p_from.X+","+p_from.Y+" to "+p_to.X+","+p_to.Y);
			console.log("Na is "+Na+" Nu is "+Nu);
			find();
		}
		
		
		break;
	}
	default:
		return;
	}
}