function findAirResult(id,airProjectId)
{
	//alert(airProjectId);
	clearChatDiv();
	var bodyColumns = returnAirBodyColumns(airProjectId);
	var bodyColumnsLen = bodyColumns.length;
	var datas = findAirResultValue(airProjectId);
	var firstColumns = [{field:'SamplingAreaNam',title:'区域',rowspan:2},
	                    {field:'SamPointNam',title:'采样点',rowspan:2}];
	var groupColumn={title:'单因子污染指数',colspan:bodyColumnsLen};
	var LastColums=[{field:'OverStandardRateAir',title:'超标率',rowspan:2,hidden:true}];
	createDataGrid(id,firstColumns,groupColumn,bodyColumns,LastColums,datas);
}

function returnAirBodyColumns(airProjectId)
{
	var selectSql = "select distinct r.IndicatorsNam " +
			"from samPointTestResult r  " +
			"left join samplingPoint on r.SamPointNum = samplingPoint.SamPointNum " +
			"left join samplingArea on samplingPoint.SamplingAreaNum = samplingArea.SamplingAreaNum " +
			"where samplingArea.ProjectNum="+airProjectId+" and r.result is not null";
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

function findAirResultValue(airProjectId)
{
	var selectSql = "select samplingArea.SamplingAreaNam,samplingPoint.SamPointNam," +
			"group_concat(r.IndicatorsNam || ':' || r.SamPointResultPi)  as piresults, " +
			"samplingPoint.SamPointP as presults, "+
			"samplingPoint.SamPointPlevel as SamPointPlevel, "+
			"samplingArea.OverStandardRateAir as OverStandardRateAir "+
			"from samPointTestResult r  " +
			"left join samplingPoint on r.SamPointNum = samplingPoint.SamPointNum " +
			"left join samplingArea on samplingPoint.SamplingAreaNum = samplingArea.SamplingAreaNum " +
			"where samplingArea.ProjectNum="+airProjectId+" and r.result is not null " +
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
		results.push(result);
	}
	
	return results;
}

function catulateAirPiandP(airProjectId)
{
	var selectSql =  "select cast (result as float) as result ,r.PollutionLimit as PollutionLimit, " +
					 "r.samPointTestResultNum as samPointTestResultNum ,r.SamPointNum as SamPointNum "+
					 "from samPointTestResult r "+  
					 "left join samplingPoint on r.SamPointNum = samplingPoint.SamPointNum "+ 
					 "left join samplingArea on samplingPoint.SamplingAreaNum = samplingArea.SamplingAreaNum "+ 
					 "where samplingArea.ProjectNum="+airProjectId+" and r.result is not null ";
	var stmt = db.prepare(selectSql);
	var piArray = new Array();
	//alert(stmt);
	while(stmt.step())
	{
		var data = stmt.getAsObject();
		var dataObject = new Object();
		dataObject['airPi'] = saveTwoPointNum(data['result'],data['PollutionLimit']);
		dataObject['samPointNum'] = data['SamPointNum'];
		dataObject['samPointTestResultNum'] = data['samPointTestResultNum'];
		piArray.push(dataObject);
	}
	//alert(piArray.length);
	//alert(piArray[0].airPi);
	for(var i = 0; i < piArray.length; i ++)
	{
		var SamPointResultPiLevel = returnAirPilevel(piArray[i]['airPi']);
		
		var updateSql = "update samPointTestResult set SamPointResultPi = "+piArray[i]['airPi']+","+
						"SamPointResultPilevel = '"+SamPointResultPiLevel+"'"+
						" where samPointTestResultNum = "+piArray[i]['samPointTestResultNum'];
		utilSql(updateSql);
	}
	//catulateAirP(airProjectId);
	
}

function catulateAirP(airProjectId)
{
	var selectAreaNumSql = "select SamplingAreaNum from samplingArea where ProjectNum = "+airProjectId;
	var selectAreaNums = db.prepare(selectAreaNumSql);
	var areaNumArray = new Array();
	while(selectAreaNums.step())
	{
		var data = selectAreaNums.getAsObject();
		areaNumArray.push(data);
	}
	
	for(var i = 0 ; i < areaNumArray.length; i ++)
	{
		var getIndicators = "select distinct samPointTestResult.IndicatorsNum from " +
							"samPointTestResult left join samplingPoint on samPointTestResult.SamPointNum = samplingPoint.SamPointNum " +
							"left join samplingArea on samplingArea.SamplingAreaNum = samplingPoint.SamplingAreaNum " +
							"where samplingArea .SamplingAreaNum = "+areaNumArray[i]['SamplingAreaNum'];
		var indicatorsData = db.prepare(getIndicators);
		var indicatorsDataArray = new Array();
		while(indicatorsData.step())
		{
			var data = indicatorsData.getAsObject();
			indicatorsDataArray.push(data);
		}
		
		var indicatorsCount = indicatorsDataArray.length.toFixed(2);
		
		var overStandardSql = "select distinct samPointTestResult.IndicatorsNum from " +
							  "samPointTestResult left join samplingPoint on samPointTestResult.SamPointNum = samplingPoint.SamPointNum " +
							  "left join samplingArea on samplingArea.SamplingAreaNum = samplingPoint.SamplingAreaNum " +
							  "where samplingArea .SamplingAreaNum = "+areaNumArray[i]['SamplingAreaNum']+
							  " and samPointTestResult.SamPointResultPilevel = '是'";
		var overStandardData = db.prepare(overStandardSql);
		var overStandardDataArray = new Array();
		while(overStandardData.step())
		{
			var data = overStandardData.getAsObject();
			overStandardDataArray.push(data);
		}
		
		var overStandardCount = overStandardDataArray.length.toFixed(2);
		
		var OverStandardRateAirNum = saveTwoPointNum(overStandardCount,indicatorsCount) * 100;
		var OverStandardRateAir = OverStandardRateAirNum.toString()+"%";
		var updateOverStandardRate = "update samplingArea set OverStandardRateAir = '"+OverStandardRateAir+"'";
		utilSql(updateOverStandardRate);
	}
	
	updateProjectCatulateType(airProjectId);
}

function refreshAirForHtml(projectId)
{
	catulateAirPiandP(projectId);
	findAirResult('airResultTable',projectId);
}


function saveTwoPointNum(result,PollutionLimit)
{	
	var finalresult = (parseFloat(result)/parseFloat(PollutionLimit)).toFixed(2);
	return finalresult;
}