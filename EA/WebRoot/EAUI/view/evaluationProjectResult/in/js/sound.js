function findSoundResult(gridId,chatId,soundProjectId)
{
	clearChatDiv();
	var bodyColumns = [];
	var datas = findSoundResultValue(soundProjectId);
	var firstColumns = [[{field:'SamplingAreaNam',title:'区域',width:100,sortable:true},
	                    {field:'SamPointNam',title:'采样点',width:100,sortable:true},
	                    {field:'Coordinates',title:'坐标位置',width:100,sortable:true},
	                    {field:'result',title:'噪声级(dB)',width:100,sortable:true},
	                    {field:'soundPDN',title:'PDN(%)',width:100,sortable:true},
	                    {field:'soundPDNRemak',title:'满足情况',width:100,sortable:true}]];
	var groupColumn=null;
	var LastColums=[];
	createDataGrid(gridId,firstColumns,groupColumn,bodyColumns,LastColums,datas);
	createSoundChat(chatId,datas);
}


function findSoundResultValue(soundProjectId)
{
	var selectSql = "select samplingArea.SamplingAreaNam,samplingPoint.SamPointNam,samplingArea.Coordinates," +
					"samplingPoint.soundPDN,soundPDNRemak," +
					"r.IndicatorsNam,r.result " +
					"from samPointTestResult r  " +
					"left join samplingPoint on r.SamPointNum = samplingPoint.SamPointNum " +
					"left join samplingArea on samplingPoint.SamplingAreaNum = samplingArea.SamplingAreaNum " +
					"where samplingArea.ProjectNum="+soundProjectId+" and r.result is not null and  r.result !='' " +
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
		result['soundPDNTemp'] = data['soundPDN'];
		result['soundPDN'] = data['soundPDN']+"%";
		result['soundPDNRemak'] = data['soundPDNRemak'];
		
		results.push(result);
	}
	return results;
}

function createSoundChat(chatId,datas)
{
	var d1 = []; 
    for (var i = 0; i < datas.length; i ++) 
    {
    	var data = datas[i];
    	var mycars=new Array();
		mycars[0]=data['result'];
		mycars[1]=data['soundPDNTemp'];
		d1.push(mycars);  
    } 
      
    var d2 = [];
    for(var j=35;j<=80;j+=5)
	{
    	var mycars1=new Array();
		mycars1[0]=j;
		mycars1[1]=jifen(j);
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
    
    createChat(chatId,pointdata,'Noise Level(dB)','PDN(%)');
}


function catulateSoundPDN(gridId,chatId,soundProjectId)
{
	var selectSql = "select samplingPoint.SamPointNum,r.result " +
			"from samPointTestResult r  " +
			"left join samplingPoint on r.SamPointNum = samplingPoint.SamPointNum " +
			"left join samplingArea on samplingPoint.SamplingAreaNum = samplingArea.SamplingAreaNum " +
			"where samplingArea.ProjectNum="+soundProjectId+" and r.result is not null and  r.result !=''";
	var stmt = db.prepare(selectSql);
	var results = new Array();
	while(stmt.step()) 
	{ 
		var data = stmt.getAsObject();
		
		var result = new Object();
		result['SamPointNum'] = data['SamPointNum'];
		result['result'] = data['result'];
		
		var pnd = jifen(data['result']);
		result['PDN'] = pnd;
		if(pnd <= 20)
		{
			result['soundPDNRemak'] = "是";
		}
		else
		{
			result['soundPDNRemak'] = "否";
		}
		results.push(result);
	}
	
	for(var i=0;i<results.length;i++)
	{
		var soundPndObject = results[i];
		var soundPnd = soundPndObject['PDN'];
		var remark = soundPndObject['soundPDNRemak'];
		var id = soundPndObject['SamPointNum'];
		
		var updateSql="update samplingPoint set soundPDN="+soundPnd+",soundPDNRemak='"+remark+"' " +
				"where SamPointNum ="+id;
		excuSqlToSave(updateSql);
	}
	
	updateProjectCatulateType(soundProjectId);
	
	findSoundResult(gridId,chatId,soundProjectId);
}

function getSoundResult(soundProjectId){
	findSoundResult("airResultTable","chatDiv",soundProjectId);
	catulateSoundPDN("airResultTable","chatDiv",soundProjectId);
}