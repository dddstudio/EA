function findSoilResult(id,soilProjectId)
{
	//alert(soilProjectId);
	clearChatDiv();
	var bodyColumns = returnSoilBodyColumns(soilProjectId);
	var bodyColumnsLen = bodyColumns.length;
	var datas = findSoilResultValue(soilProjectId);
	//alert("dd"+bodyColumnsLen);
	var firstColumns = [{field:'SamplingAreaNam',title:'区域',rowspan:2},
	                    {field:'SamPointNam',title:'采样点',rowspan:2}];
	var groupColumn={title:'单因子污染指数',colspan:bodyColumnsLen};
	var LastColums=[{field:'presults',title:'综合污染指数',rowspan:2,sortable:true},
	                {field:'SamPointPlevel',title:'污染情况',rowspan:2,sortable:true}];
	createDataGrid(id,firstColumns,groupColumn,bodyColumns,LastColums,datas);
}

function returnSoilBodyColumns(soilProjectId)
{
	var selectSql = "select distinct r.IndicatorsNam " +
			"from samPointTestResult r  " +
			"left join samplingPoint on r.SamPointNum = samplingPoint.SamPointNum " +
			"left join samplingArea on samplingPoint.SamplingAreaNum = samplingArea.SamplingAreaNum " +
			"where samplingArea.ProjectNum="+soilProjectId+" and r.result is not null";
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

function findSoilResultValue(soilProjectId)
{
	var selectSql = "select samplingArea.SamplingAreaNam,samplingPoint.SamPointNam," +
			"group_concat(r.IndicatorsNam || ':' || r.SamPointResultPi)  as piresults, " +
			"samplingPoint.SamPointP as presults, "+
			"samplingPoint.SamPointPlevel as SamPointPlevel "+
			"from samPointTestResult r  " +
			"left join samplingPoint on r.SamPointNum = samplingPoint.SamPointNum " +
			"left join samplingArea on samplingPoint.SamplingAreaNum = samplingArea.SamplingAreaNum " +
			"where samplingArea.ProjectNum="+soilProjectId+" and r.result is not null " +
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
		result['presults'] = data['presults'];
		results.push(result);
	}
	
	return results;
}

function catulateSoilPiandP(soilProjectId)
{
	var selectSql =  "select cast (result as float) as result ,r.PollutionLimit as PollutionLimit, " +
					 "r.samPointTestResultNum as samPointTestResultNum ,r.SamPointNum as SamPointNum "+
					 "from samPointTestResult r "+  
					 "left join samplingPoint on r.SamPointNum = samplingPoint.SamPointNum "+ 
					 "left join samplingArea on samplingPoint.SamplingAreaNum = samplingArea.SamplingAreaNum "+ 
					 "where samplingArea.ProjectNum="+soilProjectId+" and r.result is not null ";
	var stmt = db.prepare(selectSql);
	var piArray = new Array();
	//alert(stmt);
	while(stmt.step())
	{
		var data = stmt.getAsObject();
		var dataObject = new Object();
		dataObject['soilPi'] = saveTwoPointNum(data['result'],data['PollutionLimit']);
		dataObject['samPointNum'] = data['SamPointNum'];
		dataObject['samPointTestResultNum'] = data['samPointTestResultNum'];
		piArray.push(dataObject);
	}
	//alert(piArray.length);
	//alert(piArray[0].airPi);
	for(var i = 0; i < piArray.length; i ++)
	{
		var SamPointResultPiLevel = returnSoilPlevel(piArray[i]['soilPi']);
		
		var updateSql = "update samPointTestResult set SamPointResultPi = "+piArray[i]['soilPi']+","+
						"SamPointResultPilevel = '"+SamPointResultPiLevel+"'"+
						" where samPointTestResultNum = "+piArray[i]['samPointTestResultNum'];
		utilSql(updateSql);
	}
	
	var selectPiSql =  "select "+
					   "r.SamPointNum as SamPointNum ,group_concat(r.SamPointResultPi) as SamPointResultPi "+
					   "from samPointTestResult r "+  
					   "left join samplingPoint on r.SamPointNum = samplingPoint.SamPointNum "+ 
					   "left join samplingArea on samplingPoint.SamplingAreaNum = samplingArea.SamplingAreaNum "+ 
					   "where samplingArea.ProjectNum="+soilProjectId+" and r.result is not null " +
					   "GROUP BY  r.SamPointNum  ";
	var stmt1 = db.prepare(selectPiSql);
	var piObjectArray = new Array();
	while(stmt1.step())
	{
		var data = stmt1.getAsObject();
		var piObject = new Object();
		piObject['SamPointNum'] = data['SamPointNum'];
		piObject['PiArray'] = data['SamPointResultPi'];
		piObjectArray.push(piObject);
	}
	//var soilP = returnP(returnMax(piArrayForP),returnAve(piArrayForP));
	//alert(soilP+"__"+returnMax(piArrayForP)+"__"+returnAve(piArrayForP));
	//return soilP.toFixed(2);
	//return piObjectArray;
	for(var i = 0; i < piObjectArray.length; i ++)
	{
		//alert(piObjectArray.length);
		var piStrings = piObjectArray[i]['PiArray'].split(",");
		//alert(piStrings.length);
		var SamPointP = parseFloat(0);
		//alert(SamPointP);
		for(var j = 0; j < piStrings.length; j ++)
		{
			var piArrayForP = new Array();
			//alert(parseFloat(piStrings[j]));
			piArrayForP.push(parseFloat(piStrings[j]));
			SamPointP = returnP(returnMax(piArrayForP),returnAve(piArrayForP));
			//alert(SamPointP);
		}
		//alert(SamPointP);
		var SamPointPLevel = returnSoilPlevel(SamPointP);
		var updateSql = "update samplingPoint set SamPointP = "+SamPointP+","+
						"SamPointPlevel = '"+SamPointPLevel+"'"+
						" where SamPointNum = "+piObjectArray[i]['SamPointNum'];
		utilSql(updateSql);
	}
	
	updateProjectCatulateType(soilProjectId);
}

function refreshSoilForHtml(projectId)
{
	catulateSoilPiandP(projectId);
	findSoilResult('airResultTable',projectId);
}

/*function catulateSoilP(piObjectArray)
{
	//alert(samPointNumArray.length);
	alert(piObjectArray.length);
	for(var i = 0; i < piObjectArray.length; i ++)
	{
		var piStrings = piObjectArray[i]['PiArray'].split(",");
		var SamPointP = parseFloat(0);
		for(var j = 0; j < piStrings.length; j ++)
		{
			var piArrayForP = new Array();
			piArrayForP.push(parseFloat(piStrings[j]));
			SamPointP = returnP(returnMax(piArrayForP),returnAve(piArrayForP)).toFixed(2);
			alert(SamPointP);
		}
		var updateSql = "update samplingPoint set SamPointP = "+SamPointP+
						" where SamPointNum = "+piObjectArray[i]['SamPointNum'];
		utilSql(updateSql);
	}
	
}
*/