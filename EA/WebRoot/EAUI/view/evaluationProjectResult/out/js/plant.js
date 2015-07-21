function findPlantResult(id,plantProjectId)
{
	clearChatDiv();
	var bodyColumns = returnPlanBodyColumns(plantProjectId);
	var bodyColumnsLen = bodyColumns.length;
	var datas = findPlantResultValue(plantProjectId);
	//alert("dd"+bodyColumnsLen);
	var firstColumns = [{field:'SamplingAreaNam',title:'区域',rowspan:2},
	                    {field:'SamPointNam',title:'采样点',rowspan:2}];
	var groupColumn={title:'单因子污染指数',colspan:bodyColumnsLen};
	var LastColums=[{field:'presults',title:'综合污染指数',rowspan:2,sortable:true},
	                {field:'productid',title:'污染情况',rowspan:2,sortable:true}];
	createDataGrid(id,firstColumns,groupColumn,bodyColumns,LastColums,datas);
}

function returnPlanBodyColumns(plantProjectId)
{
	var selectSql = "select distinct r.IndicatorsNam " +
			"from samPointTestResult r  " +
			"left join samplingPoint on r.SamPointNum = samplingPoint.SamPointNum " +
			"left join samplingArea on samplingPoint.SamplingAreaNum = samplingArea.SamplingAreaNum " +
			"where samplingArea.ProjectNum="+plantProjectId+" and r.result is not null";
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

function findPlantResultValue(plantProjectId)
{
	var selectSql = "select samplingArea.SamplingAreaNam,samplingPoint.SamPointNam," +
			"group_concat(r.IndicatorsNam || ':' || r.SamPointResultPi)  as piresults, " +
			"samplingPoint.SamPointP as presults "+
			"from samPointTestResult r  " +
			"left join samplingPoint on r.SamPointNum = samplingPoint.SamPointNum " +
			"left join samplingArea on samplingPoint.SamplingAreaNum = samplingArea.SamplingAreaNum " +
			"where samplingArea.ProjectNum="+plantProjectId+" and r.result is not null " +
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
		
		result['presults'] = data['presults'];
		results.push(result);
	}
	
	return results;
}

function catulatePlantPiandP(plantProjectId)
{
	//alert("计算__"+waterProjectId)
	var selectSql =  "select cast (result as float) as result ,r.PollutionLimit as PollutionLimit, " +
					 "r.samPointTestResultNum as samPointTestResultNum "+
					 "from samPointTestResult r "+  
					 "left join samplingPoint on r.SamPointNum = samplingPoint.SamPointNum "+ 
					 "left join samplingArea on samplingPoint.SamplingAreaNum = samplingArea.SamplingAreaNum "+ 
					 "where samplingArea.ProjectNum="+plantProjectId+" and r.result is not null ";
	var stmt = db.prepare(selectSql);
	var piArray = new Array();
	//alert(stmt);
	while(stmt.step())
	{
		var data = stmt.getAsObject();
		var dataObject = new Object();
		dataObject['plantPi'] = saveTwoPointNum(data['result'],data['PollutionLimit']);
		dataObject['samPointTestResultNum'] = data['samPointTestResultNum'];
		piArray.push(dataObject);
	}
	//alert("plant"+piArray.length);
	//alert(piArray[0].airPi);
	for(var i = 0; i < piArray.length; i ++)
	{
		var updateSql = "update samPointTestResult set SamPointResultPi = "+piArray[i]['plantPi']+
						" where samPointTestResultNum = "+piArray[i]['samPointTestResultNum'];
		utilSql(updateSql);
	}
	var selectPiSql =  "select "+
					   "r.SamPointNum as SamPointNum ,group_concat(r.SamPointResultPi) as SamPointResultPi "+
					   "from samPointTestResult r "+  
					   "left join samplingPoint on r.SamPointNum = samplingPoint.SamPointNum "+ 
					   "left join samplingArea on samplingPoint.SamplingAreaNum = samplingArea.SamplingAreaNum "+ 
					   "where samplingArea.ProjectNum="+plantProjectId+" and r.result is not null " +
					   "GROUP BY  r.SamPointNum  ";
	var stmt = db.prepare(selectPiSql);
	var piObjectArray = new Array();
	while(stmt.step())
	{
		var data = stmt.getAsObject();
		var piObject = new Object;
		piObject['SamPointNum'] = data['SamPointNum'];
		piObject['PiArray'] = data['SamPointResultPi'];
		piObjectArray.push(piObject);
	}
	
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
		var updateSql = "update samplingPoint set SamPointP = "+SamPointP+
		" where SamPointNum = "+piObjectArray[i]['SamPointNum'];
		utilSql(updateSql);
	}
}

function catulateSoilP()
{
	
}
