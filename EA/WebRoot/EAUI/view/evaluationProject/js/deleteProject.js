function getdeleteNum(EngineerNum)
{
	var getdeleteNumSql = "select evaluationEngineer.EngineerNum as EngineerNum,"+
						  "group_concat(distinct environment.EnvironmentNum) as EnvironmentNum,"+
						  "group_concat(distinct evaluationproject.ProjectNum) as ProjectNum ,"+
						  "group_concat(distinct samplingArea .SamplingAreaNum) as SamplingAreaNum,"+
						  "group_concat(distinct samplingPoint .SamPointNum) as SamPointNum "+
						  "from evaluationEngineer left join environment on evaluationEngineer.EngineerNum = environment .EngineerNum "+
						  "left join evaluationproject on evaluationproject.EnvironmentNum = environment .EnvironmentNum "+
						  "left join samplingArea on samplingArea.ProjectNum = evaluationproject .ProjectNum "+
						  "left join samplingPoint on samplingPoint.SamplingAreaNum = samplingArea .SamplingAreaNum "+
						  "left join samPointTestResult on samPointTestResult.SamPointNum = samplingPoint.SamPointNum "+
						  "where evaluationEngineer.EngineerNum  = "+EngineerNum;
	var stmt = db.prepare(getdeleteNumSql);
	var deleteNumObject = new Object();
	while(stmt.step())
	{
		var data = stmt.getAsObject();
		deleteNumObject['EngineerNum'] = data['EngineerNum'];
		deleteNumObject['EnvironmentNum'] = data['EnvironmentNum'];
		deleteNumObject['ProjectNum'] = data['ProjectNum'];
		deleteNumObject['SamplingAreaNum'] = data['SamplingAreaNum'];
		deleteNumObject['SamPointNum'] = data['SamPointNum'];
	}
	
	return deleteNumObject;
}

function deleteEngineerddd(EngineerNum)
{
	var deleteSql = "delete from evaluationEngineer where EngineerNum = "+EngineerNum;
	utilSql(deleteSql);
}

function deleteEnvironmentddd(EngineerNum)
{
	var deleteSql = "delete from environment where EngineerNum = "+EngineerNum;
	utilSql(deleteSql);
}


function deleteEvaluationprojectddd(EnvironmentNum)
{
	var deleteSql = "delete from evaluationproject where EnvironmentNum = "+EnvironmentNum;
	utilSql(deleteSql);
}


function deleteSamplingAreaddd(ProjectNum)
{
	var deleteSql = "delete from samplingArea where ProjectNum = "+ProjectNum;
	utilSql(deleteSql);
}


function deleteSamplingPointddd(SamplingAreaNum)
{
	var deleteSql = "delete from SamplingPoint where SamplingAreaNum = "+SamplingAreaNum;
	utilSql(deleteSql);
}

function deleteSamPointTestResultddd(SamPointNum)
{
	var deleteSql = "delete from samPointTestResult where SamPointNum = "+SamPointNum;
	utilSql(deleteSql);
}

function deleteWholeEngineer(EngineerNum)
{
	var deleteNumObject = getdeleteNum(EngineerNum);
	var EngineerNum = deleteNumObject['EngineerNum'];
	var EnvironmentNum = deleteNumObject['EnvironmentNum'];
	var ProjectNum = deleteNumObject['ProjectNum'];
	var SamplingAreaNum = deleteNumObject['SamplingAreaNum'];
	var SamPointNum = deleteNumObject['SamPointNum'];
	
	if(EngineerNum == null || EngineerNum == undefined)
	{
		return;
	}
	
	if(EnvironmentNum == null || EnvironmentNum == undefined)
	{
		EnvironmentNum = "";
	}
	else
	{
		EnvironmentNum = deleteNumObject['EnvironmentNum'].split(",");
	}
	
	if(ProjectNum == null || ProjectNum == undefined)
	{
		ProjectNum = "";
	}
	else
	{
		ProjectNum = deleteNumObject['ProjectNum'].split(",");
	}
	
	if(SamplingAreaNum == null || SamplingAreaNum == undefined)
	{
		SamplingAreaNum = "";
	}
	else
	{
		SamplingAreaNum = deleteNumObject['SamplingAreaNum'].split(",");
	}
	
	if(SamPointNum == null || SamPointNum ==undefined)
	{
		SamPointNum = "";
	}
	else
	{
		SamPointNum = deleteNumObject['SamPointNum'].split(",");
	}
	
	for(var i = 0 ; i < SamPointNum.length; i ++)
	{
		deleteSamPointTestResultddd(SamPointNum[i]);
	}
	
	for(var i = 0; i < SamplingAreaNum.length; i ++)
	{
		deleteSamplingPointddd(SamplingAreaNum[i]);
	}
	
	for(var i = 0; i < ProjectNum.length; i ++)
	{
		deleteSamplingAreaddd(ProjectNum[i]);
	}
	
	for(var i = 0 ; i < ProjectNum.length; i ++)
	{
		deleteEvaluationprojectddd(ProjectNum[i]);
	}
	
	for(var i = 0 ; i < EnvironmentNum.length; i ++)
	{
		deleteEnvironmentddd(EnvironmentNum[i]);
	}
	
	deleteEngineerddd(EngineerNum);
}