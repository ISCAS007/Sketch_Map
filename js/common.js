
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

function getEvent_JsonPos(dataEvent)
{
	//得到事件位置的数组
	//dataEvent {"number":1,"type":"Point","coordinates":[86.64466985700005,22.546933554000077]}
	var eventCoordinates=[];
	for(var i=0;i<eventDataJson.length;i++)
	{
		eventCoordinates.push(eventDataJson[i].coordinates);
	}
	
	return eventCoordinates;
}

function getScene2Event(dataMap)
{
	//由选择的场景编号得到相应的事件编号
	//dataMap {"number":1,"type":"Polygon","coordinates":[]}
}
function updateDataEvent(dataEvent)
{
	var newdata=dataEvent;
	for(var i=0;i<newdata.length;i++)
	{
		newdata[i].coordinates[0]=newdata[i].coordinates[0]-7;//-7;
		newdata[i].coordinates[1]=newdata[i].coordinates[1]+18;//+18;
	}
	
	return newdata;
}

function getAbsEventPos(dataEvent,projection)
{
	var newdata=[];
	var set=[];
	for(var i=0;i<dataEvent.length;i++)
	{
		set=new Array(2);
		if(i==1)
		{
			set[0]=projection(dataEvent[i].coordinates)[0]+10;
			set[1]=projection(dataEvent[i].coordinates)[1]+40;
		}
		else
		{	
			set[0]=projection(dataEvent[i].coordinates)[0]+25;
			set[1]=projection(dataEvent[i].coordinates)[1]+60;
		}
		
		newdata.push(set);
	}
	for(var i=0;i<dataEvent.length;i++)
	{
		console.log("absEventPos   "+newdata[i]);
	}
	return newdata;
}
function updateDataEventLine(dataEventLine,dataEvent)
{
	//按事件点的位置更新事件线的位置
	//{"s":1,"e":3,"len":3,"type":"LineString","coordinates":[[86.64466985700005,22.546933554000077],[96.06690781900005,20.561954826000033]]},
	var newdata=dataEventLine;
	var s,e;
	
	for(var i=0;i<newdata.length;i++)
	{
		s=newdata[i].s-1;
		e=newdata[i].e-1;
		
		newdata[i].coordinates[0][0]=dataEvent[s].coordinates[0];
		newdata[i].coordinates[0][1]=dataEvent[s].coordinates[1];
		newdata[i].coordinates[1][0]=dataEvent[e].coordinates[0];
		newdata[i].coordinates[1][1]=dataEvent[e].coordinates[1];
	}
	
	return newdata;
}

function curvePath(d,projection,number)
{
    var s=new Array(2);
	var location=d.coordinates;
	//location[0]=projection(d.coordinates[0]);
	//location[1]=projection(d.coordinates[1]);
    s[0]=location[0][0]*2/3+location[1][0]/3;
    s[1]=location[0][1]*2/3+location[1][1]/3;
    var e=new Array(2);
    e[0]=location[1][0]*2/3+location[0][0]/3;
    e[1]=location[1][1]*2/3+location[0][1]/3;

    s[0]=s[0]-0.5;
    s[1]=s[1]-0;
    e[1]=e[1]+0.5;
    e[1]=e[1]+0;
	/*
	1. 23,45
	2. 6,30
	*/
	
	var from,to;
	var x,y;
	from=projection(location[0]);
	to=projection(location[1]);
	
	
	if(d.s==2){
		x=8;
		y=40;
	}
	else{
		x=25;
		y=60;
	}
	
	from[0]=from[0]+x;
	from[1]=from[1]+y;
	
	if(d.e==2){
		x=8;
		y=40;
	}
	else{
		x=25;
		y=60;
	}
	
	to[0]=to[0]+x;
	to[1]=to[1]+y;
	
    var str="M"+from+" C"+projection(s)+" "+projection(e)+" "+to;
	//var str="M"+location[0]+" L"+location[1];
	//var str="M"+from+" L"+to;
    //console.log("curve ..."+str);
    //svg_path.attr("d","M"+location[0]+" C"+s+" "+e+" "+location[1]);
    return str;
}

function getRolerPos(dataRoler,rolersPerEvent,absEventPos)
{
    var num,theta,x,y;
    var set,matrix;
    var RolerPos=new Array();
    for (var i=0;i<rolersPerEvent.length;i++)
    {
        var matrix=new Array();
        for(var j=0;j<14;j++)
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
		/*
		if(num==1){
			x=dataEvent[num].coordinates[0]+radius*Math.cos(theta)-4;
			y=dataEvent[num].coordinates[1]+radius*Math.sin(theta)-3;
		}
		else {
			x=dataEvent[num].coordinates[0]+radius*Math.cos(theta);
			y=dataEvent[num].coordinates[1]+radius*Math.sin(theta)-10;
		}
		*/
		x=absEventPos[num][0]+radius*Math.cos(theta);
		y=absEventPos[num][1]+radius*Math.sin(theta);
        
        //console.log("x y theta is "+x+" "+y+" "+theta);
        RolerPos[num][Nam(dataRoler[i].name)][0]=x;
        RolerPos[num][Nam(dataRoler[i].name)][1]=y;
        rolersPerEvent[num][1]=rolersPerEvent[num][1]+1;
    }
	//console.log("rolerpos ..."+RolerPos[5][3]+" "+RolerPos[5][8]);
    return RolerPos;
}

function getAbsEventRolerPos(dataRoler,absEventPos){
	//dataRoler:  {"number":4,"name":"Morpheus","type":"Point","coordinates":[96.88113093700008,29.503458048000027]},
	var RolersNumPerEvent=[];
    var a;
    for(var i=0;i<absEventPos.length;i++)
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
        RolersNumPerEvent[num][0]=RolersNumPerEvent[num][0]+1;	//count the rolers in per event;
    }
	/* for(var i=0;i<14;i++)
	{
		console.log("rolersnumperevent "+i+" "+RolersNumPerEvent[i]);
	} */
	
	return getRolerPos(dataRoler,RolersNumPerEvent,absEventPos);
}

function updateDataRolerLine(dataRolerLine,EventRolerPos)
{
	var s,e;
	var x=5,y=0;
	var newdata=dataRolerLine;
	for(var i=0;i<dataRolerLine.length;i++)
	{
		s=EventRolerPos[dataRolerLine[i].s-1][Nam(dataRolerLine[i].name)];
		e=EventRolerPos[dataRolerLine[i].e-1][Nam(dataRolerLine[i].name)];
		s[0]=s[0]+x;
		e[0]=e[0]+x;
		s[1]=s[1]+y;
		e[1]=e[1]+y;
		
		newdata[i].coordinates[0]=s;
		newdata[i].coordinates[1]=e;
		
		//console.log("oldDataRolerLine ..."+dataRolerLine[i].coordinates);
		//console.log("newdata ..."+newdata[i].coordinates);
	}
	
	return newdata;
}