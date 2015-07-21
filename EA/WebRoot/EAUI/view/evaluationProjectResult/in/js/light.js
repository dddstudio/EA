function findLightResult(gridId,chatId,lightProjectId){
	clearChatDiv();
	var bodyColumns = [];
   
	var datas = findLightResultValue(lightProjectId);
	
	var firstColumns = [[{field:'SamplingAreaNam',title:'区域',width:100,sortable:true},
	                    {field:'SamPointNam',title:'采样点',width:100,sortable:true},
	                    {field:'Coordinates',title:'坐标位置',width:100,sortable:true},
	                    {field:'result',title:'照度(lx)',width:100,sortable:true},
	                    {field:'LightPDL',title:'PDL',width:100,sortable:true},
	                    {field:'LightPDLRemak',title:'满足情况',width:100,sortable:true}]];
	var groupColumn=null;
	var LastColums=[];
	createDataGrid(gridId,firstColumns,groupColumn,bodyColumns,LastColums,datas);
	createLightChat(chatId,datas);
}

function findLightResultValue(lightProjectId)
{
	var selectSql = "select samplingArea.SamplingAreaNam,samplingPoint.SamPointNam,samplingArea.Coordinates," +
					"samplingPoint.LightPDL,LightPDLRemak," +
					"r.IndicatorsNam,r.result " +
					"from samPointTestResult r  " +
					"left join samplingPoint on r.SamPointNum = samplingPoint.SamPointNum " +
					"left join samplingArea on samplingPoint.SamplingAreaNum = samplingArea.SamplingAreaNum " +
					"where samplingArea.ProjectNum="+lightProjectId+" and r.result is not null and  r.result !='' " +
					"order by r.result";
	
	var stmt = db.prepare(selectSql);
	var results = new Array();
	while(stmt.step()) 
	{ 
		var data = stmt.getAsObject();
		
		var result = new Object();
		result['SamplingAreaNam'] = data['SamplingAreaNam'];
		result['SamPointNam'] = data['SamPointNam'];
		result['Coordinates'] = data['Coordinates'];
		result['result'] = data['result'];
		result['LightPDLTemp'] = data['LightPDL'];
		result['LightPDL'] = data['LightPDL']+"%";
		result['LightPDLRemak'] = data['LightPDLRemak'];
		
		results.push(result);
	}
	return results;
}

function createLightChat(chatId,datas)
{
	var d1 = []; 
    for (var i = 0; i < datas.length; i ++) 
    {
    	var data = datas[i];
    	var mycars=new Array();
		mycars[0]=data['result'];
		mycars[1]=data['LightPDLTemp'];
		d1.push(mycars);  
    } 
    
    var d2 = [];
    for(var j=1;j<101;j++)
	{
    	var mycars1=new Array();
		mycars1[0]=j*100;
		mycars1[1]=guangPDL(j);
		d2.push(mycars1); 
	}
       
    var pointdata =[  
     {  
         data: d1,  
         lines: { show: true}  
     },  
     {  
         data: d2,  
         lines: { show: true}  
     }];
     
    createChat(chatId,pointdata,'Lighting(lx)','PDL(%)');
}

function catulateLightPDL(gridId,chatId,lightProjectId)
{
	var selectSql = "select samplingPoint.SamPointNum,r.result " +
			"from samPointTestResult r  " +
			"left join samplingPoint on r.SamPointNum = samplingPoint.SamPointNum " +
			"left join samplingArea on samplingPoint.SamplingAreaNum = samplingArea.SamplingAreaNum " +
			"where samplingArea.ProjectNum="+lightProjectId+" and r.result is not null and  r.result !=''";
	var stmt = db.prepare(selectSql);
	var results = new Array();
	while(stmt.step()) 
	{ 
		var data = stmt.getAsObject();
		
		var result = new Object();
		result['SamPointNum'] = data['SamPointNum'];
		result['result'] = data['result'];
		
		var pdl = guangPDL(data['result']);
		result['PDL'] = pdl;
		if(pdl <= 35)
		{
			result['LightPDLRemak'] = "是";
		}
		else
		{
			result['LightPDLRemak'] = "否";
		}
		results.push(result);
	}
	
	for(var i=0;i<results.length;i++)
	{
		var lightPDLObject = results[i];
		var lightPDL = lightPDLObject['PDL'];
		var remark = lightPDLObject['LightPDLRemak'];
		var id = lightPDLObject['SamPointNum'];
		
		var updateSql="update samplingPoint set LightPDL="+lightPDL+",LightPDLRemak='"+remark+"' " +
				"where SamPointNum ="+id;
		excuSqlToSave(updateSql);
	}
	
	updateProjectCatulateType(lightProjectId);
	
	findLightResult(gridId,chatId,lightProjectId);
}

function getLightResult(lightProjectId){
	
	findLightResult("airResultTable","chatDiv",lightProjectId);
	catulateLightPDL("airResultTable","chatDiv",lightProjectId);
}