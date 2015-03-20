var width  = 1250;
var height = 850;
var Na=[];
var Nu=[];
var rolernum=14,eventnum=14,scenenum=14;
var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(0,0)");
//from spherical coordinates (in degrees) to Cartesian coordinates (in pixels):	projection()
//from Cartesian coordinates (in pixels) to spherical coordinates (in degrees)	projection.invert()
var projection =  d3.geo.equirectangular()
//var projection=d3.geo.mercator()
    .scale(153)
    .translate([width /2, height /2])
    .precision(.1);

var path = d3.geo.path()
    .projection(projection);

var zoom = d3.behavior.zoom()
    .scaleExtent([0.1, 12])
    .on("zoom", zoomed);
var color = d3.scale.category20();
var displayrolers=[true,true,true,true,true,true,true,true,true,true,true,true,true,true];
var g = svg.append("g");

var scene2event=[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14];
var backgroundColorSet=["#fbb4ae","#f0d3c2","#e2cddd","#c8e7c2","#f8d4a2","#f0d3c2","#f8d4a2","#fbb4ae","#e2cddd","#f8d4a2","#fbb4ae","#bad6d8","#d4d2d6","#c1ded2"];
var reflection=[0,1,2,3,4,5,6,7,8,9,10,11,12,13];
var cnt=0;
var dataMap,dataEvent,dataRoler;	//from json
var dataEventLine,dataRolerLine;
var absEventRolerPos,absEventRolerPos_backup;
var absEventPos;
var rolerOffset=[-10,0];
var picOffset=[-25,-30,-50,-55];

//eventchoose=[event1,event2];
var eventchoose=new Array(2);
var eventchoosenum=0;

var rolerLineColorSet=["green","blue","purple"];	//查询路径时，返回路径的颜色集合
var pos=[width/3,0];	//显示块的信息时，返回的位置


svg.append("rect")
    .attr("class", "overlay")
	//.attr("fill","#0000ff")
	//.attr("stoke","black")
	//.attr("display","block")
    .attr("width", width)
    .attr("height", height);
svg.call(zoom)
    .call(zoom.event);



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
function djstlEventPath(evetnchoose,eventline,scene2event)
{
    var s=scene2event[eventchoose[0]];
    var e=scene2event[eventchoose[1]];

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

function showEventPath(eventchoose,eventline,scene2event){
    var djstleventpath=djstlEventPath(eventchoose,eventline,scene2event);
    var showFlag=new Array(eventline.length);
    var s=scene2event[eventchoose[0]];
    var e=scene2event[eventchoose[1]];
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
    var x=pos[0];
    var y=pos[1];
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
                    console.log("eventchoose is "+eventchoose+" number is "+scene2event[eventchoose[0]]+" "+scene2event[eventchoose[1]]);
                    g.selectAll("#path-background"+i)
                        .attr("stroke","red")
                        .attr("stroke-width",10);

                    //pos=mousePos(e);
                    
                    var SceneNumber=[scene2event[eventchoose[0]],scene2event[eventchoose[1]]];
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

                //showEventPath(eventchoose,dataLine,scene2event)
                //showEventPath(eventchoose);
                eventchoosenum=0;
            }

            if(eventchoosenum!=2){
                d3.select("#scene-tooltip").attr("class","hidden");
            }
        });

	var oldDataEvent = root.Event.geometries;
	dataEvent=updateDataEvent(oldDataEvent);
	
    //绘制事件线
    dataEventLine = root.TimeLine.geometries;
	dataEventLine=updateDataEventLine(dataEventLine,dataEvent);
	/* update ok 
	for(var i=0;i<dataEventLine.length;i++)
	{
		//console.log("old dataEvent"+tmp[i].coordinates);
		console.log("dataEventLine ..."+dataEventLine[i].coordinates);
	}  */
	/*for(var i=0;i<dataEventLine.length;i++)
	{
		console.log("x off is "+dataEventLine[i].coordinates[0]+" "+dataEvent[dataEventLine[i].s-1].coordinates);
		console.log("y off is "+dataEventLine[i].coordinates[1]+" "+dataEvent[dataEventLine[i].e-1].coordinates);
	}*/
    g.selectAll("path.time")
        .data(dataEventLine)
        .enter()
        .append("path")
        //.attr("stroke","black")
		.attr("stroke",function(d){
			//var ran=Math.floor(Math.random() * (10 + 1));
			return color(d.e);
		})
        .attr("stroke-width", function(d){
            return d.len/2+1;
        })
        .attr("fill", "none")
        .attr("class","time")
        //.attr("d", path)
        .attr("d",function(d){
           return curvePath(d,projection);
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
	
	//update ok! 
	/* for(var i=0;i<dataEvent.length;i++)
	{
		//console.log("old dataEvent"+tmp[i].coordinates);
		console.log("dataEvent "+i+" "+projection(dataEvent[i].coordinates));
	}  */
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
        .attr("x", function(d){
			//return d.coordinates[0];
			//console.log("path vs projection"+path(d)+" "+projection(d.coordinates));
			return projection(d.coordinates)[0];
        })
        .attr("y",function(d){
			//return d.coordinates[1];
			return projection(d.coordinates)[1];
        })
        .attr("width", 50)
        .attr("height", 100)
        //.translate([-61.695,-106.195])
        .on("mouseover",function(d){
			//var xPosition=projection(d.coordinates)[0]+50;
			//var yPosition=projection(d.coordinates)[1]-50;
            var xPosition=parseFloat(d3.event.x);
            var yPosition=parseFloat(d3.event.y);
			//var con=d3.select("#container");
			console.log("parse x y "+xPosition+" "+yPosition);
            d3.select("#tooltip")
                .classed("hidden",false)
                .style("left",xPosition+"px")
                .style("top",yPosition+"px")
                .select("#value")

                .text("我是剧情简介，针对不同的事件显示不同的内容: 这是事件 "+d.number);
        })
        .on("mouseout",function(d){
            d3.select("#tooltip")
                .classed("hidden",true)
        })
        .on("click",function(d)
        {
			var x=projection(d.coordinates)[0];
			var y=projection(d.coordinates)[1];
			d3.select("#player")
				.style("left",x+"px")
				.style("top",y+"px");
			
            var str="video/";
            str+= d.number+".mp4";
            clicked(str, d.number);
        });

	
	
    //绘制角色点
	absEventPos=getAbsEventPos(dataEvent,projection);
    dataRoler = root.Points.geometries;
    absEventRolerPos=getAbsEventRolerPos(dataRoler,absEventPos);
   //absEventRolerPos=getRolerPos(dataRoler,rolersPerEvent,eventpos);
	
	absEventRolerPos_backup=[];
	for(var i=0;i<absEventRolerPos.length;i++)
	{
		for(var j=0;j<absEventRolerPos[i].length;j++)
		{
			absEventRolerPos_backup.push(absEventRolerPos[i][j][0]);
			absEventRolerPos_backup.push(absEventRolerPos[i][j][1]);
		}
	}
	
    g.selectAll("image.circle")
        .data(dataRoler)
        .enter()
        .append("svg:image")
        .attr("class", "circle")
        .attr("xlink:href", function(d){
            return "SVG/"+d.name+".svg"}
		)
        .attr("x", function(d){
			//console.log("origin dataRoler x..."+absEventRolerPos[d.number-1][Nam(d.name)][0]+" "+picOffset[0]);
            return absEventRolerPos[d.number-1][Nam(d.name)][0]+picOffset[0];
        })
        .attr("y",function(d){
			//console.log("origin dataRoler y..."+absEventRolerPos[d.number-1][Nam(d.name)][1]+" "+picOffset[1]);
            return absEventRolerPos[d.number-1][Nam(d.name)][1]+picOffset[1];
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

                    return absEventRolerPos[d.number-1][Nam(d.name)][0]+picOffset[2];
                    //return projection(d.coordinates)[0] - 20;
                })
                .attr("y", function (d) {
                    //return this-20;
                    return absEventRolerPos[d.number-1][Nam(d.name)][1]+picOffset[3];
                })
                .attr("width", 80)
                .attr("height", 80)
                //.attr("stroke","red")
                .attr("class", "choose");
            cnt = cnt + 1;

            //console.log(d.name+d.number);
        });

		
	
	//绘制角色联系线
	
    oldDataRolerLine = root.LINES.geometries;
	dataRolerLine=updateDataRolerLine(oldDataRolerLine,absEventRolerPos);
    /*	//始终不显示角色联系线
	g.selectAll("path.spot")
        .data(dataRolerLine)
        .enter()
        .append("path")
        .attr("stroke", function(d){return color(Nam(d.name))})
        .attr("stroke-width", 1)
        .attr("fill", "none")
        .attr("class","spot")
		.attr("display","none")
        .attr("border-style","double")
        .attr("stroke-dasharray",3,3)
        .attr("stroke-dashoffset",0)
        .attr("d",function(d){
			//console.log("dataRolerLine... "+d.coordinates+" s="+d.s+" e="+d.e+" name="+d.name);
			var coor=new Array(4);
			coor[0]=d.coordinates[0][0]+rolerOffset[0];
			coor[1]=d.coordinates[0][1]+rolerOffset[1];
			coor[2]=d.coordinates[1][0]+rolerOffset[0];
			coor[3]=d.coordinates[1][1]+rolerOffset[1];
			return "M"+coor[0]+","+coor[1]+"L"+coor[2]+","+coor[3];
		});
		*/
	/*
	g.selectAll("line")
		.data(absEventPos)
		.enter()
		.append("line")
		.attr("x1",function(d){
			return d[0];
		})
		.attr("y1",function(d)
		{
			return d[1];
		})
		.attr("x2",400)
		.attr("y2",400)
		.attr("stroke","red")
		.attr("stroke-width",2);
		*/
	/* g.append("line").attr("x1",687+25).attr("y1",381+60)
			.attr("x2",0).attr("y2",0)
			.attr("stroke","red").attr("stroke-width",2);
	g.append("line").attr("x1",890+25).attr("y1",376+60)
			.attr("x2",100).attr("y2",0)
			.attr("stroke","red").attr("stroke-width",2);
	g.append("line").attr("x1",947+25).attr("y1",319+60)
			.attr("x2",200).attr("y2",0)
			.attr("stroke","red").attr("stroke-width",2); */
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
        ppl.poster="pic/"+ num+"-01.jpg";
    }
    else if(pp.src!=str) {
        pp.src = str;
        ppl.poster = "pic/" + num + "-01.jpg";
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
		.attr("width", 50)
        .attr("height", 50)
        .attr("x", function(d){
			//console.log("dataRoler x..."+absEventRolerPos[d.number-1][Nam(d.name)][0]+" "+picOffset[0]);
            return absEventRolerPos_backup[((d.number-1)*eventnum+Nam(d.name))*2+0]+picOffset[0];
        })
        .attr("y",function(d){
			//console.log("dataRoler y..."+absEventRolerPos[d.number-1][Nam(d.name)][1]+" "+picOffset[1]);
            return absEventRolerPos_backup[((d.number-1)*eventnum+Nam(d.name))*2+1]+picOffset[1];
        });
    /*    
    g.selectAll("path.spot")
        .data(dataRolerLine)
        .attr("display","block")
        .attr("stroke", function(d){return color(Nam(d.name))});
	*/
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
	
	var player=document.getElementById("player");
	player.style.visibility = "hidden";
	
	//classie.toggle( this, 'active' );
	var     menuLeft = document.getElementById( 'cbp-spmenu-s2' ),
			body = document.body;
    //classie.toggle( body, 'cbp-spmenu-push-toleft' );
	//console.log(window.classie);
    classie.remove( menuLeft, 'cbp-spmenu-open' );
	
	d3.select("#scene-tooltip").attr("class","hidden");
	
	g.selectAll("path.background")
        .data(dataMap)
        .attr("stroke","white")
        .attr("stroke-width",3);
		
	eventchoosenum=0;
}



