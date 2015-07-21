function findInAirResult(gridId,chatId,InAirProjectId)
{
	clearChatDiv();
	var bodyColumns = returnInAirBodyColumns(InAirProjectId);
	var bodyColumnsLen = bodyColumns.length;
	var datas = findInAirResultValue(InAirProjectId);
	if(datas.length == 0)
	{
		datas = null;
	}
	var firstColumns = [{field:'SamplingAreaNam',title:'区域',rowspan:2},
	                    {field:'SamPointNam',title:'采样点',rowspan:2}];
	var groupColumn={title:'单因子污染指数',colspan:bodyColumnsLen};
	var LastColums=[{field:'InAirC',title:'C',rowspan:2,sortable:true},
	                {field:'InAirPDA',title:'PDA',rowspan:2,sortable:true}];
	createDataGrid(gridId,firstColumns,groupColumn,bodyColumns,LastColums,datas);
	createInAirChat(chatId,datas);
}

function returnInAirBodyColumns(InAirProjectId)
{
	var selectSql = "select distinct r.IndicatorsNam " +
			"from samPointTestResult r  " +
			"left join samplingPoint on r.SamPointNum = samplingPoint.SamPointNum " +
			"left join samplingArea on samplingPoint.SamplingAreaNum = samplingArea.SamplingAreaNum " +
			"left join pollutionIndicators on r.IndicatorsNum = pollutionIndicators.IndicatorsNum " +
			"where samplingArea.ProjectNum="+InAirProjectId+" and  pollutionIndicators.NoCatulate !=1 and " +
			"r.result is not null";
	var stmt = db.prepare(selectSql);
	var bodyColumns = new Array();
	while(stmt.step()) 
	{ 
		var data = stmt.getAsObject();
		var IndicatorsNam = data["IndicatorsNam"];
		var column = {field:IndicatorsNam,title:IndicatorsNam};
		bodyColumns.push(column);
	}
	
	return bodyColumns;
}

function findInAirResultValue(InAirProjectId)
{
	var selectSql = "select samplingArea.SamplingAreaNam,samplingPoint.SamPointNam," +
			"group_concat(r.IndicatorsNam || ':' || r.SamPointResultPi)  as piresults, " +
			"samplingPoint.SamPointP as presults, "+
			"samplingPoint.InAirC as InAirC, "+
			"samplingPoint.InAirPDA as InAirPDA, "+
			"samplingArea.OverStandardRateAir as OverStandardRateAir "+
			"from samPointTestResult r  " +
			"left join samplingPoint on r.SamPointNum = samplingPoint.SamPointNum " +
			"left join samplingArea on samplingPoint.SamplingAreaNum = samplingArea.SamplingAreaNum " +
			"left join pollutionIndicators on r.IndicatorsNum = pollutionIndicators.IndicatorsNum " +
			"where samplingArea.ProjectNum="+InAirProjectId+" and pollutionIndicators.NoCatulate !=1 and r.result is not null " +
			"group by samplingPoint.SamPointNum";
	
	var stmt = db.prepare(selectSql);
	var results = new Array();
	while(stmt.step()) 
	{ 
		var data = stmt.getAsObject();
		
		var result = new Object();
		result['SamplingAreaNam'] = data['SamplingAreaNam'];
		result['SamPointNam'] = data['SamPointNam'];
		returnBodyResults(result,data['piresults']);
		result['SamPointPlevel'] = data['SamPointPlevel'];
		result['OverStandardRateAir'] = data['OverStandardRateAir'];
		result['presults'] = data['presults'];
		result['InAirC'] = data['InAirC'];
		result['InAirPDA'] = data['InAirPDA'];
		results.push(result);
	}
	
	return results;
}

function createInAirChat(chatId,datas)
{
	if(datas == null)
	{
		return;
	}
	var d1 = []; 
    for (var i = 0; i < datas.length; i ++) 
    {
    	var data = datas[i];
    	var mycars=new Array();
		mycars[0]=data['InAirC'];
		mycars[1]=data['InAirPDA'];
		d1.push(mycars);  
    } 
    
    var d2 = [];
    for(var j=0;j<=30;j++)
	{
    	var mycars1=new Array();
		mycars1[0]=j;
		mycars1[1]=airPDA(j);
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
    createChat(chatId,pointdata,'IAQ(decipol)','PDA(%)');
}

function catulateInAirPiandP(InAirProjectId)
{
	var selectSql =  "select cast (result as float) as result ,r.PollutionLimit as PollutionLimit, " +
					 "r.samPointTestResultNum as samPointTestResultNum ,r.SamPointNum as SamPointNum "+
					 "from samPointTestResult r "+  
					 "left join samplingPoint on r.SamPointNum = samplingPoint.SamPointNum "+ 
					 "left join samplingArea on samplingPoint.SamplingAreaNum = samplingArea.SamplingAreaNum "+ 
					 "left join pollutionIndicators on r.IndicatorsNum = pollutionIndicators.IndicatorsNum " +
					 "where samplingArea.ProjectNum="+InAirProjectId+" and pollutionIndicators.NoCatulate !=1 and r.result is not null ";
	var stmt = db.prepare(selectSql);
	var piArray = new Array();
	while(stmt.step())
	{
		var data = stmt.getAsObject();
		var dataObject = new Object();
		dataObject['InAirPi'] = saveTwoPointNum(data['result'],data['PollutionLimit']);
		dataObject['samPointNum'] = data['SamPointNum'];
		dataObject['samPointTestResultNum'] = data['samPointTestResultNum'];
		piArray.push(dataObject);
	}
	for(var i = 0; i < piArray.length; i ++)
	{
		var SamPointResultPiLevel = returnAirPilevel(piArray[i]['InAirPi']);
		var updateSql = "update samPointTestResult set SamPointResultPi = "+piArray[i]['InAirPi']+","+
						"SamPointResultPilevel = '"+SamPointResultPiLevel+"'"+
						" where samPointTestResultNum = "+piArray[i]['samPointTestResultNum'];
		utilSql(updateSql);
	}
	catulateInAirCandPDA(InAirProjectId);
}

function catulateInAirP(InAirProjectId)
{
	var selectAreaNumSql = "select SamplingAreaNum from samplingArea where ProjectNum = "+InAirProjectId;
	var selectAreaNums = db.prepare(selectAreaNumSql);
	var areaNumArray = new Array();
	while(selectAreaNums.step())
	{
		var data = selectAreaNums.getAsObject();
		areaNumArray.push(data);
	}
	
	for(var i = 0 ; i < areaNumArray.length; i ++)
	{
		var getIndicators = "select distinct samPointTestResult.IndicatorsNum " +
							"from samPointTestResult " +
							"left join samplingPoint on samPointTestResult.SamPointNum = samplingPoint.SamPointNum " +
							"left join samplingArea on samplingArea.SamplingAreaNum = samplingPoint.SamplingAreaNum " +
							"left join pollutionIndicators on samPointTestResult.IndicatorsNum = pollutionIndicators.IndicatorsNum " +
							"where pollutionIndicators.NoCatulate !=1 and samplingArea .SamplingAreaNum = "+areaNumArray[i]['SamplingAreaNum'];
		var indicatorsData = db.prepare(getIndicators);
		var indicatorsDataArray = new Array();
		while(indicatorsData.step())
		{
			var data = indicatorsData.getAsObject();
			indicatorsDataArray.push(data);
		}
		
		var indicatorsCount = indicatorsDataArray.length.toFixed(2);
		
		var overStandardSql = "select distinct samPointTestResult.IndicatorsNum " +
							  "from samPointTestResult " +
							  "left join samplingPoint on samPointTestResult.SamPointNum = samplingPoint.SamPointNum " +
							  "left join samplingArea on samplingArea.SamplingAreaNum = samplingPoint.SamplingAreaNum " +
							  "left join pollutionIndicators on samPointTestResult.IndicatorsNum = pollutionIndicators.IndicatorsNum " +
							  "where pollutionIndicators.NoCatulate !=1 and samplingArea .SamplingAreaNum = "+areaNumArray[i]['SamplingAreaNum']+
							  " and samPointTestResult.SamPointResultPilevel = '是'";
		var overStandardData = db.prepare(overStandardSql);
		var overStandardDataArray = new Array();
		while(overStandardData.step())
		{
			var data = overStandardData.getAsObject();
			overStandardDataArray.push(data);
		}
		
		var overStandardCount = overStandardDataArray.length.toFixed(2);
		
		var OverStandardRateInAirNum = saveTwoPointNum(overStandardCount,indicatorsCount) * 100;
		var OverStandardRateInAir = OverStandardRateInAirNum.toString()+"%";
		var updateOverStandardRate = "update samplingArea set OverStandardRateAir = '"+OverStandardRateInAir+"'";
		utilSql(updateOverStandardRate);
	}
	
	updateProjectCatulateType(InAirProjectId);
}

function catulateInAirCandPDA(InAirProjectId)
{
	
	var selectPoint = "select group_concat(r.IndicatorsNam || ':' || cast (result as float) )as result ," +
						 "r.SamPointNum as SamPointNum "+
						 "from samPointTestResult r "+  
						 "left join samplingPoint on r.SamPointNum = samplingPoint.SamPointNum "+ 
						 "left join samplingArea on samplingPoint.SamplingAreaNum = samplingArea.SamplingAreaNum "+ 
						 "left join pollutionIndicators on r.IndicatorsNum = pollutionIndicators.IndicatorsNum " +
						 "where samplingArea.ProjectNum="+InAirProjectId+" and r.result is not null ";
	
	var stmt = db.prepare(selectPoint);
	var SamPointArray = new Array();
	while(stmt.step())
	{
		var data = stmt.getAsObject();
		var QandGandCO = new Object();
		returnBodyResults(QandGandCO,data['result']);
		QandGandCO['SamPointNum'] = data['SamPointNum'];
		SamPointArray.push(QandGandCO);
	}
	
	for(var i = 0; i < SamPointArray.length; i++)
	{
		var InAirC = airC(SamPointArray[i]['新风量Q'],SamPointArray[i]['室外空气品质的感知值Co'],SamPointArray[i]['室内个空气品质的污染物强G']);
		var InAirPDA = airPDA(InAirC);
		if(SamPointArray[i]['SamPointNum'] != null)
		{
			var updateInAirSql = "update samplingPoint set InAirC = "+InAirC+",InAirPDA = "+InAirPDA+
							" where SamPointNum = "+SamPointArray[i]['SamPointNum'];
			utilSql(updateInAirSql);
		}
	}
	
	
}

function refreshInAirForHtml(projectId)
{
	catulateInAirPiandP(projectId);
	findInAirResult('InAirResultTable',projectId);
}
