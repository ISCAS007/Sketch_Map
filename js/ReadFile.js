var width  = 1250;
var height = 850;
var Na=[];
var Nu=[];
var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(0,0)");
//from spherical coordinates (in degrees) to Cartesian coordinates (in pixels):	projection()
//from Cartesian coordinates (in pixels) to spherical coordinates (in degrees)	projection.invert()
var projection =  d3.geo.equirectangular()
    .scale(153)
    .translate([width / 2, height / 2])
    .precision(.1);

var path = d3.geo.path()
    .projection(projection);

var zoom = d3.behavior.zoom()
    .scaleExtent([0.1, 12])
    .on("zoom", zoomed);
var color = d3.scale.category20();
var displayrolers=[true,true,true,true,true,true,true,true,true,true,true,true,true,true];
var g = svg.append("g");
svg.append("rect")
    .attr("class", "overlay")
    .attr("width", width)
    .attr("height", height);
svg.call(zoom)
    .call(zoom.event);

var Nam=function(d){
    switch (d)
    {
        case "Apoc": return 0;
        case "Neo": return 1;
        case "Trinity": return 2;
        case "Morpheus": return 3;
        case "Dozer": return 4;
        case "Cypher": return 5;
        case "Oracle": return 6;
        case "Robots": return 7;
        case "Mouse": return 8;
        case "Switch": return 9;
        case "Tank": return 10;
        case "Smith": return 11;
        case "Brown": return 12;
        case "Jones": return 13;


    }
};

function num2roler(num)
{
	switch (num)
    {
        case 0: return "Apoc";	//: return 0;
        case 1: return "Neo";//: return 1;
        case 2: return "Trinity";//: return 2;
        case 3: return "Morpheus";//: return 3;
        case 4: return "Dozer";//: return 4;
        case 5: return "Cypher";//: return 5;
        case 6: return "Oracle";//: return 6;
        case 7: return "Robots";//: return 7;
        case 8: return "Mouse";//: return 8;
        case 9: return "Switch";//: return 9;
        case 10: return "Tank";//: return 10;
        case 11: return "Smith";//: return 11;
        case 12: return "Brown";//: return 12;
        case 13: return "Jones";//: return 13;
    }
}
function getRolersNumPerEvent(dataRoler,dataEvent){
	var RolersNumPerEvent=[];
	var a;
	for(var i=0;i<dataEvent.length;i++)
	{
		a=new Array(2);
		a[0]=0;
		a[1]=0;
		RolersNumPerEvent.push(a);
	}
	
	var num;
	for(var i=0;i<dataRoler.length;i++)
	{
		num=dataRoler[i].number-1;
		RolersNumPerEvent[num][0]=RolersNumPerEvent[num][0]+1;
	}
	
	return RolersNumPerEvent;
}
var rolernum=14;
function getRolerPos(dataRoler,rolersPerEvent,eventpos)
{
	var num,theta,x,y;
	var set,matrix;
	var RolerPos=new Array();
	for (var i=0;i<rolersPerEvent.length;i++)
	{
		var matrix=new Array();
		for(var j=0;j<rolernum;j++)
		{
			set=new Array(2);
			set[0]=0;
			set[1]=0;
			matrix.push(set);
		}
		RolerPos.push(matrix);
	}
	var radius=20;
	for(var i=0;i<dataRoler.length;i++)
	{
		num=dataRoler[i].number-1;
		
		theta=2*Math.PI*rolersPerEvent[num][1]/rolersPerEvent[num][0];
		//x=eventpos[2*num]+radius*Math.cos(theta)+15;
		//y=eventpos[2*num+1]+radius*Math.sin(theta)+45;
		x=eventpos[2*num]+radius*Math.cos(theta);
		y=eventpos[2*num+1]+radius*Math.sin(theta)+25;
		//console.log("x y theta is "+x+" "+y+" "+theta);
		RolerPos[num][Nam(dataRoler[i].name)][0]=x;
		RolerPos[num][Nam(dataRoler[i].name)][1]=y;
		rolersPerEvent[num][1]=rolersPerEvent[num][1]+1;
	}
	/*
	console.log("RolerPos is ......");
	for(var i=0;i<RolerPos.length;i++)
	{
		for(var j=0;j<rolernum;j++)
		{
			console.log(i+" "+j+" "+num2roler(j)+" "+RolerPos[i][j]);
		}
	}
	*/
	return RolerPos;
}

function getEventAdjMatrix(eventline,eventnum)
{
	var adjmat=[];
	var set=[];
	for(var i=0;i<eventnum;i++)
	{
		set=new Array();
		for(var j=0;j<eventnum;j++)
		{
			set.push(0);
		}
		adjmat.push(set);
	}
	
	var s,e;
	for(var i=0;i<eventline.length;i++)
	{
		s=eventline[i].s;
		e=eventline[i].e;
		adjmat[s][e]=1;
	}
	
	console.log("adjmat .......");
	for(var i=0;i<eventnum;i++)
	{
		console.log(i+" "+adjmat[i]);
	}
	
	return adjmat;
}


function reverseEventPath(pathrecord,x,s)
{
	if(x!=s){
		var set=new Array(2);
		set[0]=pathrecord[x];
		set[1]=x;
		var djstleventpath=reverseEventPath(pathrecord,pathrecord[x],s);
		djstleventpath.push(set);
		return djstleventpath;
	}
	else{
		return [];
	}
}
function djstlEventPath(evetnchoose,eventline,eventId2Num)
{
	var s=eventId2Num[eventchoose[0]];
	var e=eventId2Num[eventchoose[1]];
	
	var adjmat=getEventAdjMatrix(eventline,15);
	
	var distance=new Array(15)
	var flag=new Array(15);
	var record=new Array(15);
	var minNum=s;
	for(var i=0;i<15;i++)
	{
		distance[i]=-1;
		flag[i]=0;
	}
	distance[s]=0;
	flag[s]=1;
	
	var min;
	while(minNum!=e)
	{
		console.log("minNum flag distance ");
		console.log(minNum);
		console.log(flag);
		console.log(distance);
		for(var i=minNum+1;i<15;i++)
		{
			//console.log("adjmat.length "+adjmat.length);
			if(adjmat[minNum][i]!=0&&distance[minNum]!=-1&&flag[i]==0)
			{
				if(distance[i]==-1||distance[minNum]+adjmat[minNum][i]<distance[i])
				{
					distance[i]=distance[minNum]+adjmat[minNum][i];
					record[i]=minNum;
				}
			}
		}
		flag[minNum]=1;
		
		min=-1;
		for(var i=1;i<15;i++)
		{
			if(flag[i]==0&&distance[i]!=-1&&(distance[i]<min||min==-1))
			{
				min=distance[i];
				minNum=i;
			}
		}
		
		if(min==-1) return [];
	}
	
	djstleventpath=reverseEventPath(record,e,s);
	//
	return djstleventpath;
}

function showEventPath(eventchoose,eventline,eventId2Num){
	var djstleventpath=djstlEventPath(eventchoose,eventline,eventId2Num);
	var showFlag=new Array(eventline.length);
	var s=eventId2Num[eventchoose[0]];
	var e=eventId2Num[eventchoose[1]];
	for(var i=0;i<eventline.length;i++)
	{
		showFlag[i]=0;
		for(var j=0;j<djstleventpath.length;j++)
		{
			if(eventline[i].s==djstleventpath[j][0]&&eventline[i].e==djstleventpath[j][1]) showFlag[i]=1;
		}
	}
	g.selectAll("path.time")
        .data(showFlag)
        .attr("display",function(d){
			if(d==1)	return "block";
			else return "none"
		})
}




//var backgroundColorSet=["#0000ff","#00ff00","#ff0000","#ffff00"];//青，绿，
//var backgroundColors=[3,1,0,2,1,2,2,0,2,1,1,0,3,2,3,1,0,2,1,2,2,0,2,1,1,0,3,2];
var backgroundColorSet=["#fbb4ae","#f0d3c2","#e2cddd","#c8e7c2","#f8d4a2","#f0d3c2","#f8d4a2","#fbb4ae","#e2cddd","#f8d4a2","#fbb4ae","#bad6d8","#d4d2d6","#c1ded2"];
var reflection=[0,1,2,3,4,5,6,7,8,9,10,11,12,13];
//var backgroundColors=[4,1,4,4,1,  4,4,1,4,4,  4,1,4,4,1,  1,1,1,1,1,  1,1,1,1];
//event=[1:13]  <==>   index=[+14,+1,+16,+15,+4,  +17,+19,+20,+11,+23,  +18,+21,+22,+7]
var cnt=0;
var dataMap,dataRoler,dataLine,datalines,dataEvent;

/*
eventpos event所在迪卡尔坐标 event=array[eventnum*2];
rolerPos roler所在迪卡尔坐标 rolerpos=array[eventnum][rolernum][2];
rolersPerEvent=array[eventnum][2]
eventlocation event所在经纬度 eventlocation=array[eventnum][2];
rolerlocation roler所在经纬度 rolerlocation=array[eventnum][rolernum][2];
*/
var eventpos,rolerPos,rolersPerEvent,eventlocation,rolerlocation;
//绘制地图
//eventchoose=[event1,event2];
var eventchoose=new Array(2);
var eventchoosenum=0;

//对应相应块的id

var eventId2Num=[0, 2,0,0,5,0,  0,14,0,0,0,  9,0,0,1,4,  3,6,11,7,8,  12,13,10,0];

function mousePos(e){ 
        var x,y; 
        var e = e||window.event; 
        return [e.clientX+document.body.scrollLeft+document.documentElement.scrollLeft,e.clientY+document.body.scrollTop+document.documentElement.scrollTop]; 
}
function getCommonRolers(SceneNumber,SceneData,RolerNum,roler2num,num2roler)
{
	//SceneNumber=[num1,num2]; num1!=num2
	//SceneData=Geo.json{Points}=dataRoler={number:4,name:neo}
	var num1=SceneNumber[0];
	var num2=SceneNumber[1];
	var rolers1=new Array(RolerNum),rolers2=new Array(RolerNum);
	
	for(var i=0;i<RolerNum;i++)
	{
		rolers1[i]=0;
		rolers2[i]=0;
	}
	
	var rolersName1="";
	var rolersName2="";
	for(var i=0;i<SceneData.length;i++)
	{
		//console.log("SceneData "+i+" "+SceneData[i].number+" "+SceneData[i].name);
		if(SceneData[i].number==num1){
			rolers1[roler2num(SceneData[i].name)]=1;
			if(rolersName1=="")	rolersName1=SceneData[i].name;
			else rolersName1=rolersName1+","+SceneData[i].name;
		}
		else if(SceneData[i].number==num2)
		{
			rolers2[roler2num(SceneData[i].name)]=1;
			if(rolersName2=="")	rolersName2=SceneData[i].name;
			else rolersName2=rolersName2+","+SceneData[i].name;
		}
	}
	
	console.log("rolers 1 "+rolers1);
	d3.select("#scene-number1").text(num1);
	d3.select("#scene-people1").text(rolersName1);
	console.log("rolers 2 "+rolers2);
	d3.select("#scene-number2").text(num2);
	d3.select("#scene-people2").text(rolersName2);
	var commonRolers="";
	for(var i=0;i<RolerNum;i++)
	{
		if(rolers1[i]==1&&rolers2[i]==1)
		{
			if(commonRolers=="")
			{
				commonRolers=num2roler(i);
			}
			else
			{
				commonRolers=commonRolers+","+num2roler(i);
			}
		}
	}
	
	return commonRolers;
}
function showSceneTooltip(SceneNumber,pos,str)
{
	console.log("showSceneTooltip ..."+SceneNumber+" "+str);
	//console.log(d3.mouse(d3.select("body").select("svg")));
	//x=document.documentElement.scrollLeft;//+event.clientX;
	//y=document.documentElement.scrollTop;//+event.clientY;
	//console.log("x is "+x+" y is "+y);
	var x=pos[0]+10;
	var y=pos[0]+10;
	var tooltip=d3.select("#scene-tooltip");
	//tooltip.select("#scene-number").text(SceneNumber[0]+","+SceneNumber[1]);
	tooltip.select("#scene-people").text(str);
	tooltip.attr("class","show")
			.style("left",x+"px")
			.style("top",y+"px");
	/* tooltip.on("mouseout",function(d){
		d3.select(this).attr("class","hidden");
	}); */
}

function curvePath(location,projection)
{
	var s=new Array(2);
	s[0]=location[0][0]*2/3+location[1][0]/3;
	s[1]=location[0][1]*2/3+location[1][1]/3;
	var e=new Array(2);
	e[0]=location[1][0]*2/3+location[0][0]/3;
	e[1]=location[1][1]*2/3+location[0][1]/3;
	
	s[0]=s[0]-2;
	s[1]=s[1]-0;
	e[1]=e[1]+2;
	e[1]=e[1]+0;
	var str="M"+projection(location[0])+" C"+projection(s)+" "+projection(e)+" "+projection(location[1]);
	console.log(str);
	//svg_path.attr("d","M"+location[0]+" C"+s+" "+e+" "+location[1]);
	return str;
}

d3.json("json//Geo.json", function(error, root) {
    if (error)
        return console.error(error);
    dataMap = root.Ma.geometries;
    g.selectAll("path.background")
        .data(dataMap)
        .enter()
        .append("path")
        .attr("stroke",function(d,i){
			return "white";
        })
        .attr("stroke-width",3)
        .attr("class","background")
		.attr("id",function(d,i){
			return "path-background"+i;
		})
        .attr("fill", function(d){
            //return color(i);
			return backgroundColorSet[reflection[d.number-1]];
        })
		.attr("opacity",1)
		.attr("full-opacity",1)
		//.attr("fill-rule","evenodd")
		//.attr("stroke-width",1)
		.attr("stroke-dasharray",0.986192,0.591715,0.197238,0.591715)
        .attr("d", path )
        .on("mouseover",function(d){
            var xPosition=parseFloat(d3.event.x);
            var yPosition=parseFloat(d3.event.y);

            d3.select("#tooltip")
                .style("left",xPosition+"px")
                .style("top",yPosition+"px")
                .select("#value")
                .text(d.number);
        })
        .on("mouseout",function(d){
            d3.select("#tooltip")
                .select("#value")
                .text(100);
        })
		.on("click",function(d,i){
			
			if(eventchoosenum==0){
				eventchoose[0]=i;
				eventchoosenum=1;
				g.selectAll("#path-background"+i)
				.attr("stroke","red")
				.attr("stroke-width",10);
			}
			else if(eventchoosenum==1) {
				if(eventchoose[0]==i)
				{
					eventchoosenum=0;
					g.selectAll("#path-background"+eventchoose[0])
						.attr("stroke","white")
						.attr("stroke-width",1);
				}
				else{
					eventchoose[1]=i;
					eventchoosenum=2;
					console.log("eventchoose is "+eventchoose+" number is "+eventId2Num[eventchoose[0]]+" "+eventId2Num[eventchoose[1]]);
					g.selectAll("#path-background"+i)
					.attr("stroke","red")
					.attr("stroke-width",10);
					
					//pos=mousePos(e);
					pos=[400,400];
					var SceneNumber=[eventId2Num[eventchoose[0]],eventId2Num[eventchoose[1]]];
					var CommonRolers=getCommonRolers(SceneNumber,dataRoler,14,Nam,num2roler);
					showSceneTooltip(SceneNumber,pos,CommonRolers);
				}
			}
			else if(eventchoosenum==2){		
				g.selectAll("#path-background"+eventchoose[0])
						.attr("stroke","white")
						.attr("stroke-width",1);
				g.selectAll("#path-background"+eventchoose[1])
					.attr("stroke","white")
					.attr("stroke-width",1);
					
				//showEventPath(eventchoose,dataLine,eventId2Num)
					//showEventPath(eventchoose);
				eventchoosenum=0;
			}
			
			if(eventchoosenum!=2){
				d3.select("#scene-tooltip").attr("class","hidden");
			}
		});

    //绘制情节线
	//style="fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:10;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1;stroke-miterlimit:4;stroke-dasharray:30,30;stroke-dashoffset:0"
    dataLines = root.LINES.geometries;
    g.selectAll("path.spot")
        .data(dataLines)
        .enter()
        .append("path")
        .attr("stroke", function(d){return color(Nam(d.name))})
        .attr("stroke-width", 1)
        .attr("fill", "none")
        .attr("class","spot")
		.attr("border-style","double")
		.attr("stroke-dasharray",3,3)
		.attr("stroke-dashoffset",0)
        .attr("d", path);

    //绘制时间线
    dataLine = root.TimeLine.geometries;
    g.selectAll("path.time")
        .data(dataLine)
        .enter()
        .append("path")
        .attr("stroke", "black")
        .attr("stroke-width", function(d){
            return d.len+2;
        })
        .attr("fill", "none")
        .attr("class","time")
        //.attr("d", path)
		.attr("d",function(d){
			//var location=[d.coordinates[0],d.coordinates[d.coordinates.length-1]];
			var location=d.coordinates;
			console.log("projection ... "+projection(d.coordinates[0])+" "+projection(d.coordinates[1]));
			console.log("path ... "+path(d));
			return curvePath(location,projection);
		})
        .on("mousedown", function (d, i, e) {
            d3.select(this)
                .attr("display", "none")
        })
        .on("mouseout", function (d, i) {
            d3.select(this)
                .attr("display","block")
        });

    //绘制事件点
	
    dataEvent = root.Event.geometries;
	eventpos=new Array(2*dataEvent.length);
    g.selectAll("image.event")
        .data(dataEvent)
        .enter()
        .append("svg:image")
        .attr("class", "event")
        .attr("xlink:href", function(d,i){
			if(i==0)	return "SVG\\Event"+14+".svg";
			//console.log("image.event i is "+i);
			return "SVG\\Event"+i+".svg";
			//return "pic\\EVENT.png"
		})
        .attr("x", function(d,i){
			var num=d.number-1;
			//console.log("dataEvent.number "+num);
			if(i==1) {
				eventpos[2*num]=projection (d.coordinates)[0]-10-15+15;
			}
			else eventpos[2*num]=projection (d.coordinates)[0]-10-15;
			return eventpos[2*num];
			})
        .attr("y",function(d,i){
			var num=d.number-1;
			if(i==1) eventpos[2*num+1]= projection (d.coordinates)[1]-10-53+25;
			else eventpos[2*num+1]=projection (d.coordinates)[1]-10-53;
			return eventpos[2*num+1];
		})
        .attr("width", 50)
        .attr("height", 100)
		//.translate([-61.695,-106.195])
        .on("mouseover", function (d, i, e) {

        })
        .on("click",function(d)
        {
            var str="http://localhost:63342/Sketch_Map/video/";
            str+= d.number+".mp4";
            clicked(str, d.number);
        });

	
	
    //绘制角色点
    dataRoler = root.Points.geometries;
	rolersPerEvent=getRolersNumPerEvent(dataRoler,dataEvent);
	rolerPos=getRolerPos(dataRoler,rolersPerEvent,eventpos);

    g.selectAll("image.circle")
        .data(dataRoler)
        .enter()
        .append("svg:image")
        .attr("class", "circle")
        .attr("xlink:href", function(d){
			return "SVG\\"+d.name+".svg"}
		)
        .attr("x", function(d){
		     //console.log("x is ...");
			 //console.log(d.number+d.name);
			 return rolerPos[d.number-1][Nam(d.name)][0];
			})
        .attr("y",function(d){
			return rolerPos[d.number-1][Nam(d.name)][1];
			//return eventpos[2*d.number-1]+rolerPos[i][1]+25;
			})
        .attr("width", 50)
        .attr("height", 50)
        .attr("display","none")
        .on("click",function(d,i){
            Na[cnt]= d.name;
            Nu[cnt]= d.number;
			var index=i;
            d3.select(this)
                .attr("x", function (d) {
		
					return rolerPos[d.number-1][Nam(d.name)][0]-15;
                    //return projection(d.coordinates)[0] - 20;
                })
                .attr("y", function (d) {
					//return this-20;
					return rolerPos[d.number-1][Nam(d.name)][1]-15;
                })
                .attr("width", 80)
                .attr("height", 80)
				//.attr("stroke","red")
                .attr("class", "choose");
            cnt = cnt + 1;
			
			//console.log(d.name+d.number);
		});
});

//放大缩小
var maxSize=200;
function zoomSize(size,scale)
{
	if(size*scale>=maxSize)	return maxSize/scale;
	else return size;
}
function zoomed() {
    g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    if(zoom.scale()<2)
        g.selectAll("path.time").attr("display","block");
    else
        g.selectAll("path.time").attr("display","none");
    if(zoom.scale()<2)
    {
        g.selectAll("image.circle").attr("display","none");
        g.selectAll("image.choose").attr("display", "none");
    }
    else {
		//var size=zoomSize(50,zoom.scale());
        g.selectAll("image.circle")
			.attr("display", function (d) {
				var result=checkdis(d);
				return result;
				})
			//.attr("width",50)
			//.attr("height",50)
			;
			
        g.selectAll("image.choose")
			.attr("display", "block");
			//.attr("width",zoomSize(80,zoom.scale()/1.6))
			//.attr("height",zoomSize(80,zoom.scale()/1.6));
    }
}
//查询路径函数
function process(d) {
    g.selectAll("path.spot")
        .attr("display",function(d){
            if(d.name==Na[0]&& d.s>Nu[0]&& d.e<Na[1])
                return "block";
        })


}
function clicked(str,num) {
    var player=document.getElementById("player");
    var ppl=document.getElementById("pp");
    if (player.style.visibility == "hidden") {
        player.style.visibility="visible";
        d3.selectAll("video").attr("src", str);
        ppl.poster="http://localhost:63342/Sketch_Map/pic/"+ num+"-01.jpg";
    }
    else if(pp.src!=str) {
        pp.src = str;
        ppl.poster = "http://localhost:63342/Sketch_Map/pic/" + num + "-01.jpg";
    }
    else {
        player.style.visibility = "hidden";
        d3.selectAll("video").attr("src", "");
    }

}
function setvalue()
{
    if(cnt==0)
    return;
    displayrolers=[false,false,false,false,false,false,false,false,false,false,false,false,false,false];
    for(var i=0;i<cnt;i++)
    {
        displayrolers[Nam(Na[i])]=true;
    }
}
function checkdis(d) {
    if (displayrolers[Nam(d.name)])
    return "block";

    else

        return "none";

}
function resets()
{
    Na=[];
    Nu=[]
    cnt=0;
    g.selectAll("image.choose")
        .attr("class","circle");
    g.selectAll("image.circle")
        .data(dataRoler)
        /*.attr("class", "circle")
        .attr("xlink:href", function(d){return "pic\\"+d.name+".png"})
        .attr("x", function(d){return projection (d.coordinates)[0]-10})
        .attr("y",function(d){return projection (d.coordinates)[1]-10})*/
		.attr("x", function(d,i){
			 return rolerPos[d.number-1][Nam(d.name)][0];
			})
        .attr("y",function(d,i){
			return rolerPos[d.number-1][Nam(d.name)][1];
			})
        .attr("width", 50)
        .attr("height", 50);
	g.selectAll("path.spot")
        .data(dataLines)
		.attr("display","block")
        .attr("stroke", function(d){return color(Nam(d.name))});
		
	g.selectAll("path.timeMan").remove();
		
    displayrolers=[true,true,true,true,true,true,true,true,true,true,true,true,true,true];
    if(zoom.scale()<2)
        g.selectAll("path.time").attr("display","block");
    else
        g.selectAll("path.time").attr("display","none");
    if(zoom.scale()<2)
    {
        g.selectAll("image.circle").attr("display","none");
        //g.selectAll("image.choose").attr("display", "none");
    }
    else {
		var scale=zoom.scale();
        g.selectAll("image.circle")
			.attr("width",50)
			.attr("height",50)
			.attr("display", function (d) {
				var result=checkdis(d);
				return result;
			});
        //g.selectAll("image.choose").attr("display", "block");
    }
}



