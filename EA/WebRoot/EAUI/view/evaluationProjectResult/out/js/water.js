function findWaterResult(id,waterProjectId)
{
	clearChatDiv();
	var bodyColumns = returnWaterBodyColumns(waterProjectId);
	var bodyColumnsLen = bodyColumns.length;
	var datas = findWaterResultValue(waterProjectId);
	//alert("dd"+bodyColumnsLen);
	var firstColumns = [{field:'SamplingAreaNam',title:'区域',rowspan:2},
	                    {field:'SamPointNam',title:'采样点',rowspan:2}];
	var groupColumn={title:'单因子污染指数',colspan:bodyColumnsLen};
	var LastColums=[{field:'avgPi',title:'污染指数均值',rowspan:2,sortable:true},
	                {field:'presults',title:'内梅罗综合污染指数',rowspan:2,sortable:true},
	                {field:'SamPointPlevel',title:'污染状况',rowspan:2,sortable:true}];
	createDataGrid(id,firstColumns,groupColumn,bodyColumns,LastColums,datas);
}

function returnWaterBodyColumns(waterProjectId)
{
	var selectSql = "select distinct r.IndicatorsNam " +
			"from samPointTestResult r  " +
			"left join samplingPoint on r.SamPointNum = samplingPoint.SamPointNum " +
			"left join samplingArea on samplingPoint.SamplingAreaNum = samplingArea.SamplingAreaNum " +
			"where samplingArea.ProjectNum="+waterProjectId+" and r.result is not null and r.result !=''";
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

function findWaterResultValue(waterProjectId)
{
	var selectSql = "select samplingArea.SamplingAreaNam,samplingPoint.SamPointNam," +
			"group_concat(r.IndicatorsNam || ':' || r.SamPointResultPi)  as piresults, " +
			"samplingPoint.SamPointP as presults, "+
			"samplingPoint.SamPointPlevel as SamPointPlevel "+
			"from samPointTestResult r  " +
			"left join samplingPoint on r.SamPointNum = samplingPoint.SamPointNum " +
			"left join samplingArea on samplingPoint.SamplingAreaNum = samplingArea.SamplingAreaNum " +
			"where samplingArea.ProjectNum="+waterProjectId+" and r.result is not null and r.result != '' " +
			"group by samplingPoint.SamPointNum";
	
	var stmt = db.prepare(selectSql);
	var results = new Array();
	while(stmt.step()) 
	{ 
		var data = stmt.getAsObject();
		
		var result = new Object();
		result['SamplingAreaNam'] = data['SamplingAreaNam'];
		result['SamPointNam'] = data['SamPointNam'];
		result['SamPointPlevel'] = data['SamPointPlevel'];
		var piArray = returnBodyResults(result,data['piresults']);
		result['avgPi'] = returnAve(piArray).toFixed(2);
		result['presults'] = data['presults'];
		results.push(result);
	}
	
	return results;
}

function catulateWaterPiandP(waterProjectId)
{
	var selectSql =  "select cast (result as float) as result ,r.PollutionLimit as PollutionLimit, " +
					 "r.samPointTestResultNum as samPointTestResultNum, "+
					 "r.IndicatorsNam as IndicatorsNam "+
					 "from samPointTestResult r "+  
					 "left join samplingPoint on r.SamPointNum = samplingPoint.SamPointNum "+ 
					 "left join samplingArea on samplingPoint.SamplingAreaNum = samplingArea.SamplingAreaNum "+ 
					 "where samplingArea.ProjectNum="+waterProjectId+" and r.result is not null ";
	var stmt = db.prepare(selectSql);
	var piArray = new Array();
	//alert(stmt);
	while(stmt.step())
	{
		var data = stmt.getAsObject();
		var dataObject = new Object();
		if(data['IndicatorsNam'] == 'pH')
		{
			if(data['result'] <= 7.0)
			{
				dataObject['waterPi'] = returnPHpiless7(data['result']).toFixed(1);
			}
			else
			{
				dataObject['waterPi'] = returnPHpimore7(data['result']).toFixed(1);
			}
		}
		else
		{
			dataObject['waterPi'] = saveTwoPointNum(data['result'],data['PollutionLimit']);
		}
		dataObject['samPointTestResultNum'] = data['samPointTestResultNum'];
		dataObject['IndicatorsNam'] = data['IndicatorsNam'];
		piArray.push(dataObject);
	}
	//alert("water"+piArray.length);
	//alert(piArray[0].airPi);
	var SamPointResultPiLevel = "";
	for(var i = 0; i < piArray.length; i ++)
	{
		if(piArray[i]['IndicatorsNam'] == 'pH')
		{
			SamPointResultPiLevel = returnWaterPHlevel(piArray[i]['waterPi']);
		}
		else
		{
			SamPointResultPiLevel = returnWaterPilevel(piArray[i]['waterPi']);
		}
		
		var updateSql = "update samPointTestResult set SamPointResultPi = "+piArray[i]['waterPi']+","+
						"SamPointResultPilevel = '"+SamPointResultPiLevel+"'"+
						" where samPointTestResultNum = "+piArray[i]['samPointTestResultNum'];
		utilSql(updateSql);
	}
	
	var selectPiSql =  "select "+
					   "r.SamPointNum as SamPointNum ,group_concat(r.SamPointResultPi) as SamPointResultPi "+
					   "from samPointTestResult r "+  
					   "left join samplingPoint on r.SamPointNum = samplingPoint.SamPointNum "+ 
					   "left join samplingArea on samplingPoint.SamplingAreaNum = samplingArea.SamplingAreaNum "+ 
					   "where samplingArea.ProjectNum="+waterProjectId+" and r.result is not null and r.result !='' " +
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
	for(var i = 0; i < piObjectArray.length; i ++)
	{
		var piStrings = piObjectArray[i]['PiArray'].split(",");
		var SamPointP = parseFloat(0);
//		for(var j = 0; j < piStrings.length; j ++)
//		{
//			var piArrayForP = new Array();
//			piArrayForP.push(parseFloat(piStrings[j]));
//		}
		SamPointP = returnP(returnMax(piStrings),returnAve(piStrings));
		var SamPointPLevel = returnWaterPlevel(SamPointP);
		var updateSqls = "update samplingPoint set SamPointP = "+SamPointP+","+
						 "SamPointPlevel = '"+SamPointPLevel+"'"+
						 " where SamPointNum = "+piObjectArray[i]['SamPointNum'];
		utilSql(updateSqls);
	}
	
	updateProjectCatulateType(waterProjectId);
}

function refreshWaterForHtml(projectId)
{
	catulateWaterPiandP(projectId);
	findWaterResult('airResultTable',projectId);
}
