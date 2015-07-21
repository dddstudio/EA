function getAllReferenceStandard()
{
	var selectSql = "select *,(select group_concat(standardNam) " +
			"from referenceStandard where evalutionTypeNum = s.evalutionTypeNum ) as standardNam "+ 
			"from evalutionType as s";
	var stmt = db.prepare(selectSql);
	var dataArray = new Array();
	var tableIndoorCount = 1;
	var tableOutdoorCount = 1;
	while(stmt.step()) 
	{ 
		var data = stmt.getAsObject();
		dataArray.push(data);
    }
	var finalIndoorTableData = new Array();
	var finalOutdoorTableData = new Array();
	for(var i = 0 ; i < dataArray.length;i++)
	{
		if(dataArray[i].EnvironmentType == '室内')
		{
			tableIndoorCount++;
			finalIndoorTableData.push(dataArray[i]);
		}
		else if(dataArray[i].EnvironmentType == '室外')
		{
			tableOutdoorCount++;
			finalOutdoorTableData.push(dataArray[i]);
		}
	}
	contractOuterDoorTable(tableOutdoorCount,finalOutdoorTableData);
	contractInnerDoorTable(tableIndoorCount,finalIndoorTableData);
}

function contractOuterDoorTable(standardNamCount,standardNamData)
{
	
	var tableTitle = "<tr><th rowspan="+standardNamCount+" style='width:50px'>室外</th>"+
 					 "<th class='checkbox' style='width:50px'><input type='checkbox' class='outdoorcheckall' onClick='outDoorcheckBoxAll(this)' title='全选'></th>"	+
  					 "<th style='width:100px'>项目名称</th><th>参考标准</th>" +
  					 "</tr>";
	var	 tableData = "";
	for(var i = 0; i < standardNamData.length; i ++)
	{
	 tableData += "<tr>"+
						"<td class='checkbox'><input type='hidden' class='outdoorTypeNum' value='"+standardNamData[i].evalutionTypeNum+"'>"+
						"<input type='checkbox' onClick='outDoorcheckBox()' value='"+isNull(standardNamData[i].evalutionTypeName)+"' class='outdoorcheckrow'></td>"+	
						"<td><span id='row"+i+"'>"+isNull(standardNamData[i].evalutionTypeName)+"</span></td>"+
						"<td>"+isNull(standardNamData[i].standardNam)+"</td>"+
					"</tr>";
	}
	var table = tableTitle + tableData;
	$("#outerDoorTable").html(table);
}

function contractInnerDoorTable(standardNamCount,standardNamData)
{
	
	var tableTitle = "<tr><th rowspan="+standardNamCount+" style='width:50px'>室内</th>"+
 					 "<th class='checkbox' style='width:50px'><input type='checkbox' class='indoorcheckall' onClick='inDoorcheckBoxAll(this)' title='全选'></th>"	+
  					 "<th style='width:100px'>项目名称</th><th>参考标准</th>" +
  					 "</tr>";
	var	 tableData = "";
	for(var i = 0; i < standardNamData.length; i ++)
	{
	 tableData += "<tr>"+
						"<td class='checkbox'><input type='hidden' class='indoorTypeNum' value='"+standardNamData[i].evalutionTypeNum+"'>" +
						"<input type='checkbox' onClick='inDoorcheckBox()' value='"+isNull(standardNamData[i].evalutionTypeName)+"' class='indoorcheckrow'></td>"+	
						"<td>"+isNull(standardNamData[i].evalutionTypeName)+"</td>"+
						"<td>"+isNull(standardNamData[i].standardNam)+"</td>"+
					"</tr>";
	}
	var table = tableTitle + tableData;
	$("#innerDoorTable").html(table);
}

function isNull(standardNamData)
{
	var result = "";
	if(standardNamData == null || standardNamData == undefined)
	{
		result = "无";
	}
	else
	{
		result = standardNamData;
	}
	
	return result;
}

function outDoorcheckBoxAll(checkbox)
{
	var checkAll = checkbox.checked;
	$("#outerDoorTable input[type='checkbox'][class='outdoorcheckrow']").each(function(){
		this.checked = checkAll;
	});
} 

function inDoorcheckBox()
{
	var checkedCount = 0;
	$(".indoorcheckall").each(function(){
		var indoorAllcheckbox = $("#innerDoorTable input[type='checkbox'][class='indoorcheckrow']");
		for(var i = 0; i < indoorAllcheckbox.length; i ++)
		{
			if(indoorAllcheckbox[i].checked == true)
			{
				checkedCount++;
			}
		}
		
		if(checkedCount == indoorAllcheckbox.length)
		{
			this.checked = true;
		}
		else
		{
			this.checked = false;
		}
		
	});
}

function inDoorcheckBoxAll(checkbox)
{
	var checkAll = checkbox.checked;
	$("#innerDoorTable input[type='checkbox'][class='indoorcheckrow']").each(function(){
		this.checked = checkAll;
	});
} 

function outDoorcheckBox(checkbox)
{
	var checkedCount = 0;
	$(".outdoorcheckall").each(function(){
		var outdoorAllcheckbox = $("#outerDoorTable input[type='checkbox'][class='outdoorcheckrow']");
		for(var i = 0; i < outdoorAllcheckbox.length; i ++)
		{
			if(outdoorAllcheckbox[i].checked == true)
			{
				checkedCount++;
			}
		}
		
		if(checkedCount == outdoorAllcheckbox.length)
		{
			this.checked = true;
		}
		else
		{
			this.checked = false;
		}
		
	});
}

function saveEvaluationengineer(engineerCode,engineerNam,engineerDes,engineerCity)
{
	
	 var evaluationengineerSql = "insert into evaluationengineer(EngineerCode,EngineerNam,engineerCity,EngineerDes)" +
	 							 "values('"+engineerCode+"','"+engineerNam+"','"+engineerCity+"','"+engineerDes+"')";
	 if(engineerCode == null||engineerCode=="")
	{
		 alert("工程编码不能为空！");
		 return null;
	}
	 else if(engineerNam == null||engineerNam=="")
	{
		 alert("工程名称不能为空！");
		 return null;
	}
	 else
	{
		 //$.messager.alert('提示:', evaluationengineerSql,'info');
		 utilInsert(evaluationengineerSql);
		 var findSql = "select EngineerNum from evaluationengineer where EngineerCode = '"+engineerCode+"'";
		 var stmt = db.prepare(findSql);
		 var data = {};
		 while(stmt.step()) 
		{ 
			data = stmt.getAsObject();
		}
		// alert(data['EngineerNum']);
		 return data['EngineerNum'];
	}
}

function saveEnvironment(EngineerNum,EnvironmentType)
{
	if(EngineerNum == null)
	{
		return null;
	}
	var sql="insert into environment(EngineerNum,EnvironmentType,EnvironmentNam)values("+EngineerNum+",'"+EnvironmentType+"','"+EnvironmentType+"')";
	utilInsert(sql);
	var findSql = "select EnvironmentNum from environment where EnvironmentNam='"+EnvironmentType+"' " +
				  "and EngineerNum = "+EngineerNum;
	 var stmt = db.prepare(findSql);
	 var data = {};
	 while(stmt.step()) 
	{ 
		data = stmt.getAsObject();
	}
	 return data['EnvironmentNum'];
}

function saveEvaluationprojects(ProjectNam,EnvironmentType,EnvironmentNum,EvalutionTypeNum)
{
	if(EnvironmentNum == null)
	{
		return null;
	}	
	var sql = "insert into evaluationproject(ProjectNam,EnvironmentType,EnvironmentNum,EvalutionTypeNum)values('"+ProjectNam+"','"+EnvironmentType+"',"+EnvironmentNum+","+EvalutionTypeNum+")";
	//alert(sql);
	utilInsert(sql);
}

function getProjectNames()
{
	var outdoorArray = new Array();
	var indoorArray = new Array();
	var indoorArrayObject = new Object();
	var outdoorArrayObject = new Object();
	var allProjectName = new Array();
	var indoorChecks = $("#innerDoorTable input[type='checkbox'][class='indoorcheckrow']");
	var outdoorChecks = $("#outerDoorTable input[type='checkbox'][class='outdoorcheckrow']");
	var indoorTypeNum = $("#innerDoorTable input[type='hidden'][class='indoorTypeNum']");
	var outdoorTypeNum = $("#outerDoorTable input[type='hidden'][class='outdoorTypeNum']");
	for(var i = 0; i < outdoorChecks.length; i ++)
	{
		if(outdoorChecks[i].checked)
		{
			var outdoorObject = new Object();
			outdoorObject['EnvironmentType'] ='室外';
			outdoorObject['EnvironmentTypeNum'] = outdoorTypeNum[i].value;
			outdoorObject['ProjectNam'] = outdoorChecks[i].value;
			outdoorArray.push(outdoorObject);
		}
	}
	
	outdoorArrayObject['outdoorProjectName'] = outdoorArray;
	for(var i = 0 ; i < indoorChecks.length; i ++)
	{
		if(indoorChecks[i].checked)
		{
			var indoorObject = new Object();
			indoorObject['EnvironmentType'] ='室内';
			indoorObject['EnvironmentTypeNum'] = indoorTypeNum[i].value;
			indoorObject['ProjectNam'] = indoorChecks[i].value;
			indoorArray.push(indoorObject);
		}
	}
	indoorArrayObject['indoorProjectName'] = indoorArray;
	allProjectName.push(outdoorArrayObject);
	allProjectName.push(indoorArrayObject);
	
	return allProjectName;
}

function saveWholeProject()
{
	 var engineerCode = $("#engineerCode").val();
	 var engineerNam = $("#engineerNam").val();
	 var engineerDes = $("#engineerDes").val();
	 var engineerCity = $("#engineerCity").val();
	 var projectNameArray = getProjectNames();
	 var outdoorProjectNameObject = projectNameArray[0];
	 var indoorProjectNameObject = projectNameArray[1];
	 var outdoorArray = outdoorProjectNameObject['outdoorProjectName'];
	 var indoorArray = indoorProjectNameObject['indoorProjectName'];
	 var engineerNum = saveEvaluationengineer(engineerCode,engineerNam,engineerDes,engineerCity);
	 $("#hiddenEngineerNum").val(engineerNum);
	 var outdoorenvironmentNum = 0;
	 var indoorenvironmentNum = 0;
	 if(outdoorArray.length != 0)
	{
		 outdoorenvironmentNum = saveEnvironment(engineerNum,'室外');
		 $("#hiddenOutdoorEnvironmentNum").val(outdoorenvironmentNum);
	}
	 
	 if(indoorArray.length != 0)
	{
		 indoorenvironmentNum = saveEnvironment(engineerNum,'室内');
		 $("#hiddenIndoorEnvironmentNum").val(indoorenvironmentNum);
	}
	 
	 for(var i = 0; i < outdoorArray.length;i++)
	{
		 saveEvaluationprojects(outdoorArray[i]['ProjectNam'],outdoorArray[i]['EnvironmentType'],outdoorenvironmentNum,outdoorArray[i]['EnvironmentTypeNum']);
	}
	 
	 for(var i = 0; i < indoorArray.length;i++)
	{
		saveEvaluationprojects(indoorArray[i]['ProjectNam'],indoorArray[i]['EnvironmentType'],indoorenvironmentNum,indoorArray[i]['EnvironmentTypeNum']);
	}
	 alert("保存成功！");
	 refreshProject(engineerNum);
}

function checkEngineerCode()
{
	//var engineerCode = $("#engineerCode").val();
	//var checkSql = "select * from evaluationengineer where EngineerCode = '"+engineerCode+"'";
	/*var stmt = db.prepare(checkSql);
	alert(stmt.getAsObject()['EngineerCode']);*/
	/*if(stmt)
	{
		$("#errorTitle").html("编码重复！");
		$("#engineerNam").attr("disabled","disabled");
		$("#engineerDes").attr("disabled","disabled");
	}*/
}

function utilInsert(sql)
{
	 db.run(sql);
	 var data = db.export();
	 var buffer = new Buffer(data);
	 fs.writeFileSync(dbPath, buffer);
}

