
function openProject()
{
	$('#functionBar').tabs("select", 1);
	$('#functionBar').tabs("select", 0);
	$('#globalDialog').dialog({
			title:"打开工程",
			
			href: 'view/evaluationProject/selectProject.html',
			buttons:[{
			text:'打开',
			handler:function(){
				(function() {
					if($('#selectProjectDg').datagrid('getSelections').length <= 0) {
						alert('请选择一个工程!');
						return ;
					}
					//如果需要工程中的字段信息可以从 $('#selectProjectDg').datagrid('getSelected')中获取
                	 $('#functionBar').tabs("select", 1);
                	 var EngineerNum = $('#selectProjectDg').datagrid('getSelected')['code'];
                	 refreshProject(EngineerNum);
                	
                	 //refreshSelectTab();
                	 $('#globalDialog').dialog('close');
            	 })();
			}
		},{
			text:'删除',
			handler:function()
			{
				if($('#selectProjectDg').datagrid('getSelections').length <= 0) 
				{
					alert('请选择一个工程!');
					return ;
				}
				
				 var EngineerNum = $('#selectProjectDg').datagrid('getSelected')['code'];
				 deleteWholeEngineer(EngineerNum);
				 alert("删除成功！");
				 selectProjectLoad();
			}
		},{
			text:'取消',
			handler:function(){
				$('#globalDialog').dialog('close');
			}
		}
		]}).dialog('open');
}

function createProject()
{
	$('#functionBar').tabs("select", 1);
	window.setTimeout('refreshProject(null)',1000);
}

function createDataGrid(id,firstColumns,groupColumn,bodyColumns,LastColums,data1)
{
	var coloums66 = new Array();
	
	var coloums1 = new Array();
	coloums1 = coloums1.concat(firstColumns,groupColumn,LastColums);
	coloums66.push(coloums1);
	
	var coloums2 = new Array();
	coloums2 = coloums2.concat(bodyColumns);
	coloums66.push(coloums2);
	
	var options = {};
	if(groupColumn == null)
	{
		options.columns = firstColumns;
	}
	else
	{
		options.columns = coloums66;
	}
	options.fitColumns = true;
	//options.width = 1000;
	if(data1 != null)
	{
		options.data = data1;
	}

	 $('#'+id).datagrid(options); 
	 $('#'+id).datagrid('reload');  
}

function createChat(id,data,xtitle,ytitle)
{
	var chatDiv = $("#"+id);
	var chatData = $.plot($("#"+id), data);
	chatDiv.data("plot-data", chatData);
	
	var yaxisLabel = $("<div class='axisLabel yaxisLabel'></div>")
		.text(ytitle)
		.appendTo($("#"+id));
     yaxisLabel.css("margin-top", yaxisLabel.width() / 2 - 20);
	
    var xaxisLabel = $("<div class='xaxisLabel'></div>")
		.text(xtitle)
		.appendTo($("#"+id));
	 xaxisLabel.css("margin-left", xaxisLabel.width() / 2 - 20);
}

//1:2,5:7
function returnBodyResults(objcet,resultString)
{
	var resutlArray = new Array();
	if(resultString == null || resultString == "")
	{
		return "";
	}
	var results = resultString.split(",");
	for(var i=0;i<results.length;i++)
	{
		//1:2
		var result = results[i];
		if(result == null || result == "")
		{
			continue;
		}
		
		var key = result.split(":")[0];
		objcet[key] = result.split(":")[1];
		resutlArray.push(result.split(":")[1]);
	}
	
	return resutlArray;
}

Date.prototype.format = function(format) 
{  
    /* 
     * eg:format="yyyy-MM-dd hh:mm:ss"; 
     */  
    var o = {  
        "M+" : this.getMonth() + 1, // month  
        "d+" : this.getDate(), // day  
        "h+" : this.getHours(), // hour  
        "m+" : this.getMinutes(), // minute  
        "s+" : this.getSeconds(), // second  
        "q+" : Math.floor((this.getMonth() + 3) / 3), // quarter  
        "S" : this.getMilliseconds()  
        // millisecond  
    };
  
    if (/(y+)/.test(format)) {  
        format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4  
                        - RegExp.$1.length));  
    }  
  
    for (var k in o) {  
        if (new RegExp("(" + k + ")").test(format)) {  
            format = format.replace(RegExp.$1, RegExp.$1.length == 1  
                            ? o[k]  
                            : ("00" + o[k]).substr(("" + o[k]).length));  
        }  
    }  
    return format;  
};

function updateProjectCatulateType(projectId)
{
	var updateProjectSql = "update evaluationproject set CatulateType = 1 where ProjectNum="+projectId;
	excuSqlToSave(updateProjectSql);
}