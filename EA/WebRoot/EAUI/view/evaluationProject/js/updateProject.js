function updateEvaluationengineer(EngineerNum,EngineerCode,EngineerNam,EngineerDes,engineerCity)
{
	var	updateSql="update evaluationengineer set EngineerCode = '"+EngineerCode+"'," +
			"EngineerNam = '"+EngineerNam+"',engineerCity='"+engineerCity+"',EngineerDes = '"+EngineerDes+"' where " +
			"EngineerNum = " + EngineerNum; 
	utilSql(updateSql);
}

function updateEnvironment(EngineerNum)
{
	var indoorChecks = $("#innerDoorTable input[type='checkbox'][class='indoorcheckrow']");
	var indoorChecksCount = 0;
	var outdoorChecks = $("#outerDoorTable input[type='checkbox'][class='outdoorcheckrow']");
	var outdoorChecksCount = 0;
	var environmentNumObject = new Object();
	for(var i = 0 ; i < indoorChecks.length; i ++)
	{
		if(indoorChecks[i].checked)
		{
			indoorChecksCount++;
		}
	}
	for(var i = 0 ; i < outdoorChecks.length; i ++)
	{
		if(outdoorChecks[i].checked)
		{
			outdoorChecksCount++;
		}
	}
	var EnvironmentNamArray = new Array();
	if(EngineerNum != null && EngineerNum != undefined)
	{
		var selectSql = "select EnvironmentNam,EnvironmentType from environment where EngineerNum = "+EngineerNum;
		var stmt = db.prepare(selectSql);
		while(stmt.step())
		{
			var data = stmt.getAsObject();
			EnvironmentNamArray.push(data);
		}
		var deleteAllsql = "delete from environment where EngineerNum = "+EngineerNum;
		utilSql(deleteAllsql);
	}
	
	var indoorEnvironmentNam = "室内";
	var outdoorEnvironmentNam = "室外";
	
	for(var i = 0 ; i < EnvironmentNamArray.length; i++)
	{
		if(EnvironmentNamArray[i]['EnvironmentType'] == "室内")
		{
			indoorEnvironmentNam = EnvironmentNamArray[i]['EnvironmentNam'];
		}
		else if(EnvironmentNamArray[i]['EnvironmentType'] == "室外")
		{
			outdoorEnvironmentNam = EnvironmentNamArray[i]['EnvironmentNam'];
		}
	}

	if(indoorChecksCount != 0)
	{
		
		var insertSql = "insert into environment(EnvironmentNam,EnvironmentType,EngineerNum)values('"+indoorEnvironmentNam+"','室内',"+EngineerNum+")";
		utilSql(insertSql);
		var selectSql = "select EnvironmentNum from environment where EngineerNum = "+EngineerNum+" and EnvironmentType = '室内'";
		var data = utilselectSql(selectSql);
		
		environmentNumObject['indoorEnvironmentNum'] = data['EnvironmentNum'];
	}
	
	if(outdoorChecksCount != 0)
	{
		var insertSql = "insert into environment(EnvironmentNam,EnvironmentType,EngineerNum)values('"+outdoorEnvironmentNam+"','室外',"+EngineerNum+")";
		utilSql(insertSql);
		var selectSql = "select EnvironmentNum from environment where EngineerNum = "+EngineerNum+" and EnvironmentType = '室外'";
		var data = utilselectSql(selectSql);
		
		environmentNumObject['outdoorEnvironmentNum'] = data['EnvironmentNum'];
	}
	
	return environmentNumObject;
}

function updateEvaluationproject(outdoorEnvironmentNum,indoorEnvironmentNum)
{
	if(EnvironmentNum == null)
	{
		return null;
	}	
	var oldoutdoorEnvironmentNum = $("#hiddenOutdoorEnvironmentNum").val();
	//alert(oldoutdoorEnvironmentNum);
	if(oldoutdoorEnvironmentNum != null && oldoutdoorEnvironmentNum != undefined)
	{
		//alert("delete1");
		var deleteSql = "delete from evaluationproject where EnvironmentNum = "+oldoutdoorEnvironmentNum;
		utilSql(deleteSql);
		//alert("delete2");
	}
	
	var oldindoorEnvironmentNum = $("#hiddenIndoorEnvironmentNum").val();
	if(oldindoorEnvironmentNum != null && oldindoorEnvironmentNum != undefined)
	{
		//alert("delete3");
		var deleteSql = "delete from evaluationproject where EnvironmentNum = "+oldindoorEnvironmentNum;
		utilSql(deleteSql);
		//alert("delete4");
	}
	
	 var projectNameArray = getProjectNames();
	 var outdoorProjectNameObject = projectNameArray[0];
	 var indoorProjectNameObject = projectNameArray[1];
	 var outdoorArray = outdoorProjectNameObject['outdoorProjectName'];
	 var indoorArray = indoorProjectNameObject['indoorProjectName'];
	for(var i = 0 ;i < outdoorArray.length; i ++)
	{
		var insertSql = "insert into evaluationproject" +
				"(ProjectNam,EnvironmentType,EnvironmentNum,EvalutionTypeNum)" +
				"values" +
				"('"+outdoorArray[i]['ProjectNam']+"','"+outdoorArray[i]['EnvironmentType']+"',"+outdoorEnvironmentNum+","+outdoorArray[i]['EnvironmentTypeNum']+")";
		//alert(insertSql);
		utilSql(insertSql);
		//alert("insertSql2");
	}
	for(var i = 0 ;i < indoorArray.length; i ++)
	{
		var insertSql = "insert into evaluationproject" +
		"(ProjectNam,EnvironmentType,EnvironmentNum,EvalutionTypeNum)" +
		"values" +
		"('"+indoorArray[i]['ProjectNam']+"','"+indoorArray[i]['EnvironmentType']+"',"+indoorEnvironmentNum+","+indoorArray[i]['EnvironmentTypeNum']+")";
		//alert(insertSql);
		utilSql(insertSql);
		//alert("insertSql3");
	}
}

function updateWholeProject()
{
	 var engineerCode = $("#engineerCode").val();
	 var engineerNam = $("#engineerNam").val();
	 var engineerDes = $("#engineerDes").val();
	 var engineerNum = $("#hiddenEngineerNum").val();
	 var engineerCity = $("#engineerCity").val();
	 updateEvaluationengineer(engineerNum,engineerCode,engineerNam,engineerDes,engineerCity);
	 var environmentNumObject = updateEnvironment(engineerNum);
	 //alert(environmentNumObject['outdoorEnvironmentNum']+"___"+environmentNumObject['indoorEnvironmentNum']);
	 updateEvaluationproject(environmentNumObject['outdoorEnvironmentNum'],environmentNumObject['indoorEnvironmentNum']);
	 alert("编辑成功！");
	 refreshProject(engineerNum);
}

function utilSql(sql)
{
	 db.run(sql);
	 var data = db.export();
	 var buffer = new Buffer(data);
	 fs.writeFileSync(dbPath, buffer);
}

function utilselectSql(sql)
{
	var stmt = db.prepare(sql);
	var data = {};
	while(stmt.step()) 
	{ 
		data = stmt.getAsObject();
	}
	return data;
}