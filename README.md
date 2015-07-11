# Sketch_Map


#目录结构
- SVG,pic： svg格式和其它格式的图片
- css:  项目的css,主要来自网上
- js: 项目的js，重点是ReadFile.js, 读取json文件，定义重要的全局变量。 yzbx.js 主要是进行点击时的路径生成。dollar.js 和 gesture.js 来自网上，是为了进行鼠标手势识别。common.js 定义一些常用函数。
- json: 地图json文件

#程序主要流程
- index.html 中137行，调用ReadFile.js
	
`````<script src="js/ReadFile.js"></script>`````

- ReadFile.js中188行，读取json地图,在这里对地图进行了绘制，并定义了许多操作及对应的响应函数。如点击地图块显示地图块边缘，点击多个地图块显示地图块说明。用鼠标中轮对地图进行缩放，可以看到角色，选择二个角色可以进行查询，这时会弹出侧栏，侧栏再进行选择可以得到路径。而路径的得到即yzbx.js所做的

```js
 d3.json("json//Geo.json", function(error, root){
 	...
 })
```

- index.html 中118行，定义了查询的响应函数find()

```html

 <div>
	<button ... onclick="find()">
		查询
	</button>
</div>

```

- index.html 中154行，定义了find()函数,在这里无非调用yzbx.jsk中一些求路径的简单函数。


```js
var find=function(){
	...
}
```

- 对于鼠标手势操作，参见[http://depts.washington.edu/aimgroup/proj/dollar/index.html](http://depts.washington.edu/aimgroup/proj/dollar/index.html)
在index.html 中55行，设置了鼠标动作监听函数

```html
<body onload="onLoadEvent()" onmousedown="mouseDownEvent(event.clientX, event.clientY)"
					onmousemove="mouseMoveEvent(event.clientX, event.clientY,event)"
					onmouseup="mouseUpEvent(event.clientX, event.clientY)">
```

- 上面这些鼠标动作监听函数在gesture.js中定义，如果希望设置这些鼠标动作的响应函数，则在其中要进行修改。注意一个全局变量 stopDrag, 它的值为真将禁止拖放，从而进行鼠标手势操作。

如在gesture.js 中的 mouseMoveEvent函数中

```js
function mouseMoveEvent(x, y,event)
{
	if (_isDown)
	{
		if(stopDrag)	event.stopPropagation();	//停止其它事件，如拖动
		else return;
		//console.log("stop listen...");
		x -= _rc.x;
		y -= _rc.y - getScrollY();
		//console.log("get a point "+x+","+y);
		_points[_points.length] = new Point(x, y); // append
		drawConnectedPoint(_points.length - 2, _points.length - 1);
	}
}

```
