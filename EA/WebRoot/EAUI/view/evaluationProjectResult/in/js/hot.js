function findHotResult(gridId,chatId,hotProjectId){
	clearChatDiv();
	var bodyColumns = [];
	var datas = findHotResultValue(hotProjectId);
	
	var firstColumns = [[{field:'SamplingAreaNam',title:'区域',width:100,sortable:true},
	                    {field:'SamPointNam',title:'采样点',width:100,sortable:true},
	                    {field:'Coordinates',title:'坐标位置',width:100,sortable:true},
	                    {field:'activityDegree',title:'活动程度',width:100,sortable:true},
	                    {field:'L',title:'L',width:100,sortable:true},
	                    {field:'M',title:'M',width:100,sortable:true},
	                    {field:'HotPPD',title:'PPD',width:100,sortable:true},
	                    {field:'HotPMV',title:'PMV',width:100,sortable:true},
	                    {field:'HotRemak',title:'满足情况',width:100,sortable:true}]];
	var groupColumn=null;
	var LastColums=[];
	createDataGrid(gridId,firstColumns,groupColumn,bodyColumns,LastColums,datas);
	createHotChat(chatId,datas);
	
}

function findHotResultValue(hotProjectId){
	
	var selectSql = "select samplingArea.SamplingAreaNam,samplingPoint.SamPointNum,samplingPoint.SamPointNam,samplingArea.Coordinates," +
	"samplingPoint.HotPPD,HotPMV,HotRemak " +	
	"from samplingPoint   " +	
	"left join samplingArea on samplingPoint.SamplingAreaNum = samplingArea.SamplingAreaNum " +
	"where samplingArea.ProjectNum="+hotProjectId+" order by HotPMV";

      var stmt = db.prepare(selectSql);
      
		var results = new Array();
		while(stmt.step()) 
		{  
			var data = stmt.getAsObject();
			var SamPointNumId=data['SamPointNum'];		
			var result = new Object();
			result['L']='';
			result['M']='';
			result['activityDegree']='';
			var selSql="select s.result,s.IndicatorsNam from samPointTestResult s where s.SamPointNum="+SamPointNumId+" and s.result is not null and  s.result !=''";
			var stmtresult = db.prepare(selSql);
			while(stmtresult.step()) {
				 
				var samPointResult = stmtresult.getAsObject();
				if(samPointResult['IndicatorsNam']=='L'){
					result['L']=samPointResult['result'];
				}else if(samPointResult['IndicatorsNam']=='M'){
					result['M']=samPointResult['result'];
				}else{
					result['activityDegree']=samPointResult['result'];
				}
			}
			
			result['SamplingAreaNam'] = data['SamplingAreaNam'];
			result['SamPointNam'] = data['SamPointNam'];
			result['Coordinates'] = data['Coordinates'];
			//result['result'] = data['result'];
			result['HotPPDTemp'] = data['HotPPD'];
			result['HotPPD'] = data['HotPPD']+"%";
			result['HotPMV'] = data['HotPMV'];
			result['HotRemak'] = data['HotRemak'];
			
			results.push(result);
		}
       return results;
	
}

function createHotChat(chatId,datas)
{
	var d1 = []; 
    for (var i = 0; i < datas.length; i ++) 
    {
    	var data = datas[i];
    	var mycars=new Array();
		mycars[0]=data['HotPMV'];
		mycars[1]=data['HotPPDTemp'];
		d1.push(mycars);  
    } 
    
    var d2 = [];
    for(var j=0;j<=24;j++)
	{
    	var mycars1=new Array();
		mycars1[0]=-3+j/4;
		mycars1[1]=getHotPPD(j/4-3);
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
       
    createChat(chatId,pointdata,'PMV','PPD(%)');
}


function catulateHotPPDAndPMA(gridId,chatId,hotProjectId){
	
	var selectSql = "select samplingPoint.SamPointNum " +
	"from samplingPoint  " +
	"left join samplingArea on samplingPoint.SamplingAreaNum = samplingArea.SamplingAreaNum " +
	"where samplingArea.ProjectNum="+hotProjectId;
	var stmt = db.prepare(selectSql);
	
	var results = new Array();
	while(stmt.step()) 
	{ 
		var data = stmt.getAsObject();
		var SamPointNumId=data['SamPointNum'];
		var selSql="select s.result,s.IndicatorsNam from samPointTestResult s where s.SamPointNum="+SamPointNumId+" and s.result is not null and  s.result !=''";
		var stmta = db.prepare(selSql);
		var samPoint=new Object();
		while(stmta.step()) {
			
			var data = stmta.getAsObject();
			if(data['IndicatorsNam']=='L'){
				samPoint['L']=data['result'];
			}else if(data['IndicatorsNam']=='M'){
				samPoint['M']=data['result'];
			}else{
				samPoint['activityDegree']=data['result'];
			}
		}
		
		var result = new Object();
		result['SamPointNum'] = SamPointNumId;
		result['L'] = samPoint['L'];
		result['M'] = samPoint['M'];
		
		var pmv = getHotPMV(result['L'],result['M']);
		
		result['PMV'] = pmv;
		var ppd= getHotPPD(result['PMV']);
		result['PPD'] = ppd;
		if(ppd <= 20)
		{
			result['HotRemak'] = "是";
		}
		else
		{
			result['HotRemak'] = "否";
		}
		results.push(result);
	}
	
	for(var i=0;i<results.length;i++)
	{
		var hotPPDObject = results[i];
		var hotPMV = hotPPDObject['PMV'];
		var hotPPD = hotPPDObject['PPD'];
		var remark = hotPPDObject['HotRemak'];
		var id = hotPPDObject['SamPointNum'];
		
		var updateSql="update samplingPoint set HotPPD="+hotPPD+",HotPMV="+hotPMV+",HotRemak='"+remark+"' " +
				"where SamPointNum ="+id;
		//$.messager.alert('提示:', updateSql, 'info');
		excuSqlToSave(updateSql);
	}
	
	updateProjectCatulateType(hotProjectId);
	
	findHotResult(gridId,chatId,hotProjectId);
		
}

function getHotResult(hotProjectId){
	
	findHotResult("airResultTable","chatDiv",hotProjectId);
	catulateHotPPDAndPMA("airResultTable","chatDiv",hotProjectId);
}