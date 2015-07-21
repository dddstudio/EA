function clickProjectTreeLoad(gridId,chatId,projectId,returnType)
{
	switch(returnType)
	{
		case '室外气':
			findAirResult(gridId,projectId);
			$("#evalutionTypetbDDD").bind('click',
				function()
				{
					catulateAirPiandP(projectId);
					findAirResult(gridId,projectId);
				});
			$("#refreshButton").bind('click',
				function()
				{
					findAirResult(gridId,projectId);
				});
			break;
		case '室内声':
			findSoundResult(gridId,chatId,projectId);
			$('#evalutionTypetbDDD').bind('click',
				function()
				{
					catulateSoundPDN(gridId,chatId,projectId);
				});
			$('#refreshButton').bind('click',
				function()
				{
					findSoundResult(gridId,chatId,projectId);
				});
			
			break;
		case '室外土':
			findSoilResult(gridId,projectId);
			$("#evalutionTypetbDDD").bind('click',
				function()
				{
					catulateSoilPiandP(projectId);
					findSoilResult(gridId,projectId);
				}
			);
			$("#refreshButton").bind('click',
				function()
				{
					findSoilResult(gridId,projectId);
				});
			break;
		case '室外水':
			findWaterResult(gridId,projectId);
			$("#evalutionTypetbDDD").bind('click',
				function()
				{	
					//alert("test");
					catulateWaterPiandP(projectId);
					findWaterResult(gridId,projectId);
				});
			$("#refreshButton").bind('click',
				function()
				{
					findWaterResult(gridId,projectId);
				});
				break;
		case '室外植':
			findPlantResult(gridId,projectId);
			$("#evalutionTypetbDDD").bind('click',
				function()
				{
					catulatePlantPiandP(projectId);
				});
			$("#refreshButton").bind('click',
				function()
				{
					findPlantResult(gridId,projectId);
				});
				break;
		case '室内光':
			findLightResult(gridId,chatId,projectId);
			$('#evalutionTypetbDDD').bind('click',
					function()
					{
						catulateLightPDL(gridId,chatId,projectId);
					});
				$('#refreshButton').bind('click',
					function()
					{
					    findLightResult(gridId,chatId,projectId);
					});
			break;
		case '室内热':
			findHotResult(gridId,chatId,projectId);
			$('#evalutionTypetbDDD').bind('click',
					function()
					{
						catulateHotPPDAndPMA(gridId,chatId,projectId);
					});
				$('#refreshButton').bind('click',
					function()
					{
					   findHotResult(gridId,chatId,projectId);
					});
			break;
		case '室内气':
			findInAirResult(gridId,chatId,projectId);
			$('#evalutionTypetbDDD').bind('click',
					function()
					{
						catulateInAirPiandP(projectId);
						findInAirResult(gridId,chatId,projectId);
					});
				$('#refreshButton').bind('click',
					function()
					{
						findInAirResult(gridId,chatId,projectId);
					});
			break;		
			
			
	}
}

function clickProjectTreeLoad1(node,EngineerNum)
{
	if($("#airResultTable") == null || $("#airResultTable")== undefined )
	{
		return;
	}
	var id = node.attributes["id"];
	var selectSql = "select evalutionType.EnvironmentType||evalutionType.evalutionTypeName as eType " +
			"from evaluationproject " +
			"left join evalutionType on evaluationproject.EvalutionTypeNum = evalutionType.evalutionTypeNum " +
			"where evaluationproject.ProjectNum = "+id;
	var stmt = db.prepare(selectSql);
	var evalutionType="";
	while(stmt.step()) 
	{ 
		var data = stmt.getAsObject();
		evalutionType = data['eType'];
		//alert(evalutionType);
	}
	var returnType = "";
	if(evalutionType.indexOf("室内")>=0)
	{
		returnType += "室内";
	}
	else
	{
		returnType += "室外";
	}
	
	//气 土 水 植 光 热 声
	if(evalutionType.indexOf("气")>=0)
	{
		returnType += "气";
	}
	else if(evalutionType.indexOf("土")>=0)
	{
		returnType += "土";
	}
	else if(evalutionType.indexOf("水")>=0)
	{
		returnType += "水";
	}
	else if(evalutionType.indexOf("植")>=0)
	{
		returnType += "植";
	}
	else if(evalutionType.indexOf("光")>=0)
	{
		returnType += "光";
	}
	else if(evalutionType.indexOf("热")>=0)
	{
		returnType += "热";
	}
	else if(evalutionType.indexOf("声")>=0)
	{
		returnType += "声";
	}
	
	clickProjectTreeLoad("airResultTable","chatDiv",id,returnType);
}

function returnAirPilevel(pi)
{
	parseFloat(pi);
	if(pi>0&&pi<=1.0)
	{
		return '否';
	}
	else if(pi>1.0)
	{
		return '是';
	}
}

function returnSoilPilevel(pi)
{
	parseFloat(pi);
	if(pi>0&&pi<=1.0)
	{
		return '未受污染';
	}
	else if(pi>1.0&&pi<=2.0)
	{
		return '轻微污染';
	}
	else if(pi>2.0&&pi<=3.0)
	{
		return '轻度污染';
	}
	else if(pi>3.0&&pi<=5.0)
	{
		return '中度污染';
	}
	else if(pi>5.0)
	{
		return '严重污染';
	}
}

function returnSoilPlevel(p)
{
	parseFloat(p);
	if(p<=0.7)
	{
		return '清洁';
	}
	else if(p>0.7&&p<=1.0)
	{
		return '尚清洁';
	}
	else if(p>1.0&&p<=2.0)
	{
		return '轻度污染';
	}
	else if(p>2.0&&p<=3.0)
	{
		return '中度污染';
	}
	else if(p>3.0)
	{
		return '重度污染';
	}
}

function returnWaterPilevel(pi)
{
	parseFloat(pi);
	if(pi>0&&pi<=1.0)
	{
		return '否';
	}
	else if(pi>1.0)
	{
		return '是';
	}
}

function returnWaterPHlevel(pi)
{
	parseFloat(pi);
	if(pi<1)
	{
		return '未受污染';
	}
	else if(pi>1&&pi<=2)
	{
		return '轻度污染';
	}
	else if(pi>2&&pi<=3)
	{
		return '中度污染';
	}
	else if(pi>3)
	{
		return '重度污染';
	}
}

function returnWaterPlevel(p)
{
	parseFloat(p);
	if(p<=1.0)
	{
		return '无污染';
	}
	else if(p>1.0&&p<=2.0)
	{
		return '轻污染';
	}
	else if(p>2.0&&p<=3.0)
	{
		return '污染';
	}
	else if(p>3.0&&p<=5.0)
	{
		return '重污染';
	}
	else if(p>5.0)
	{
		return '严重污染';
	}
}

function clearChatDiv()
{
	$("#chatDiv").html("");
}