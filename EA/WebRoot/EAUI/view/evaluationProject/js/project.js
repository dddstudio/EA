
function refreshProject(EngineerNum) {
	projectLoad(EngineerNum);
	setProjectDatatoProject(EngineerNum);
	showSaveOrEditButton();
	$('#evaluationProjectDDD').tabs("select", 1);
	$('#evaluationProjectDDD').tabs("select", 4);
	$('#evaluationProjectDDD').tabs("select", 3);
	$('#evaluationProjectDDD').tabs("select", 0);
	$('#evaluationProjectDDD').tabs('getTab',1).panel('options').tab.hide();
	$('#evaluationProjectDDD').tabs('getTab',2).panel('options').tab.hide();
	$('#evaluationProjectDDD').tabs('getTab',3).panel('options').tab.hide();
	$('#evaluationProjectDDD').tabs('getTab',4).panel('options').tab.hide();
	$('#projectDetail').html('');
}

function refreshProjectEvent()
{
	var EngineerNum = $("#hiddenEngineerNum").val();
	
	if (EngineerNum == undefined || EngineerNum == null || EngineerNum =="") {
		return;
	}
	else{
		projectLoad(EngineerNum);
	}
}

function projectLoad(EngineerNum) {
	var data = getProjectData(EngineerNum);
	if (data == null) {
		//alert(EngineerNum);
		$("#projectTreeContainer").tree({
			data : {}
		});
		return;
	}
	$("#projectTreeContainer").tree({
		data : data,
		onClick : function(node) {
			if (node.attributes) {
				showprojectTreeDetail(node, EngineerNum);
				if(node.iconCls == "icon-project")
				{
					clickProjectTreeLoad1(node,EngineerNum);
				}
			}
		}
	});
}

function showprojectTreeDetail(node, EngineerNum) {
	$('#projectTreeDetaileTable').html('');
	$('#evaluationProjectDDD').tabs('getTab',2).panel('options').tab.hide();
	$('#evaluationProjectDDD').tabs('getTab',3).panel('options').tab.hide();
	$('#evaluationProjectDDD').tabs('getTab',4).panel('options').tab.hide();
	$('#evaluationProjectDDD').tabs('getTab',1).panel('options').tab.show();
	$('#samPointTestResultDiv').hide(); 

	if (node.attributes['code'] === 1) {
		$('#evaluationProjectDDD').tabs("select", 1);
		showprojectTreeProjectDetail(node, EngineerNum);
	} else if (node.attributes['code'] === 11) {
		$('#evaluationProjectDDD').tabs('getTab',4).panel('options').tab.show();
		$('#evaluationProjectDDD').tabs('getTab',3).panel('options').tab.show();
		$('#evaluationProjectDDD').tabs('getTab',2).panel('options').tab.show();
		$('#evaluationProjectDDD').tabs("select", 2);
		var ProjectNum = node.attributes['id'];
		var Project = node.text;
		//alert("222");
		showprojectTreeSamplingDetail(ProjectNum,Project, EngineerNum);
		//alert("333");
	} else if(node.attributes['code']===111){
		if(node.attributes['hasChild'])
		{
			$('#evaluationProjectDDD').tabs('getTab',2).panel('options').tab.hide();
			$('#evaluationProjectDDD').tabs("select", 1);
			$('#projectTreeDetaileTable').datagrid('loadData',{total:0,rows:[]});
		}
		else
		{
			$('#evaluationProjectDDD').tabs('getTab',2).panel('options').tab.show();
			$('#evaluationProjectDDD').tabs("select", 2);
			$('#samPointTestResultDiv').show();
			var SamplingAreaNam = node.text;
			var SamplingAreaNum = node.attributes['id'];
			showprojectTreeSamPointDetail(SamplingAreaNam, SamplingAreaNum);
		}
	}
}
function showprojectTreeProjectDetail(node, EngineerId) {
	var Environment = node.attributes['type'];
	setTreeProjectEditTable(EngineerId, Environment);
}

function showprojectTreeSamplingDetail(ProjectNum,Project,EngineerNum) {
	var stmt = db.prepare('SELECT a.*,b.ProjectNam as ProjectNam,b.ProjectNum as ProjectNum,'
		+'b.EnvironmentType as EnvironmentType,b.ProjectDes as ProjectDes,'
		+'d.EngineerNam as EngineerNam from samplingArea a,evaluationproject b,'
		+'environment c,evaluationengineer d where a.ProjectNum = b.ProjectNum '
		+'and b.EnvironmentNum=c.EnvironmentNum and c.EngineerNum=d.EngineerNum'
		+' and a.ProjectNum=$ProjectNum');
	//alert("1__"+ProjectNum+"2__"+Project+"3__"+EngineerNum);
	stmt.bind({
		$ProjectNum : ProjectNum
	});

	var data = [];
	while (stmt.step()) {
		var row = stmt.getAsObject();
		data.push({'SamplingAreaNam':row['SamplingAreaNam'],
				'SamplingAreaNum':row['SamplingAreaNum'],
				'SamPointTotal':row['SamPointTotal'],
				'ProjectNam':row['ProjectNam'],
				'ProjectNum':row['ProjectNum'],
				'EnvironmentType':row['EnvironmentType'],
				'ProjectDes':row['ProjectDes'],
				'EngineerNam':row['EngineerNam'],
				'Coordinates':row['Coordinates'],
				'FloorHeight':row['FloorHeight'],
				'RoomCoordinates':row['RoomCoordinates'],
				'ComprePCV':row['ComprePCV'],
				'Area':row['Area'],
				'PersonnelDensity':row['PersonnelDensity'],
				'ComprePR':row['ComprePR'],
				'ComprePS':row['ComprePS'],
				'OverStandardRate':row['OverStandardRate'],
				'parentArea':getSamplingAreaParentArea(row['parentid']),
				'parentAreaId':row['parentid']
		});
	}
	//alert(ProjectNum);
	//alert("teset");
	setProjectEnvironmentEditTable(ProjectNum);
	//alert("ddd");
	chooseSamplingPointPollutionLimit(ProjectNum);
	//alert("rrr");
	$('#projectTreeDetaileTable').datagrid(
		{
			title : Project,fitColumns : true,width:1000,
			//height:500,
			singleSelect:true,
			columns : 
				[[ 
				  {field : 'SamplingAreaNum',title : '采样区域编号'}, 
				  {field : 'SamplingAreaNam',title : '采样区域名称'}, 
				  {field : 'parentArea',title:"上级区域"},
				  {field : 'parentAreaId',title:"上级区域ID",hidden:true},
				  {field : 'SamPointTotal',title : '采样点个数'}, 
				  {field : 'Coordinates',title : '位置坐标'}, 
				  {field : 'FloorHeight',title : '楼层高度'}, 
				  {field : 'Area',title : '房间面积'}, 
				  {field : 'PersonnelDensity',title : '人员密度'}, 
				  {field : 'RoomCoordinates',title : '房间经纬度'}, 
				  {field : 'ComprePCV',title : '综合污染计算值'}, 
				  {field : 'ComprePR',title : '综合污染等级'}, 
				  {field : 'ComprePS',title : '综合污染情况'}, 
				  {field : 'OverStandardRate',title : '超标率'} 
				]],
			toolbar : 
			[{
				iconCls : 'icon-add',
				handler : function() {
					$('#dlg').dialog('open').dialog('setTitle', '增加采样区域');
					$('#fm').html('');
					setProjectProjectNum(ProjectNum);
					$("#addSamplingAreaProject #parentAreaId option[value=null]").attr("selected","selected");
					$('#fm').append($('#addSamplingAreaProjectContent').html());
					$('#fm #editEnvironmentBtnDiv').hide();
					$('#dlg_save').linkbutton('enable');
				}
			},{
				iconCls : 'icon-edit',
				handler : function() {
					var row = $('#projectTreeDetaileTable').datagrid('getSelected');
					if (row == null) 
					{
						$.messager.alert('提示:', '请选择一行','info');
						return;
					}
					$('#dlg').dialog('open').dialog('setTitle', '编辑采样区域');
					$('#fm').html('');
					setProjectProjectNum(ProjectNum);
					$("#addSamplingAreaProject #parentAreaId option[value='"
							+row['SamplingAreaNum']+"']").remove();
					$("#addSamplingAreaProject #parentAreaId option[value="+row['parentAreaId']+"]").attr("selected","selected");
					$('#fm').append($('#addSamplingAreaProjectContent').html());
					$('#fm #editEnvironmentBtnDiv').hide();
					assignmentToFormOptionProjectNum(row);
					$('#dlg_save').linkbutton('enable');
				}
			},{
				iconCls : 'icon-remove',
				handler : function() {
				var row = $('#projectTreeDetaileTable').datagrid('getSelected');
				if (row == null) 
				{
					$.messager.alert('提示:', '请选择一行','info');
					return;
				}
				$.messager.confirm('确认','确认删除?\n同时将删除相关采样点',function(ok) 
						{if (ok) {
							var rowIndex = $('#projectTreeDetaileTable').datagrid(
												'getRowIndex',$('#projectTreeDetaileTable').datagrid(
												'getSelected'));

							$('#projectTreeDetaileTable').datagrid(
								'deleteRow',rowIndex);
							var delSamplingPointSql='delete from samPointTestResult  where SamPointNum =( select b.SamPointNum from samplingPoint as b where b.SamplingAreaNum ='+ row['SamplingAreaNum']+')';
							db.run(delSamplingPointSql);
							
							db.run("delete from samplingPoint where SamplingAreaNum="
								+ row['SamplingAreaNum']);

							var delSql = 'delete from samplingArea where SamplingAreaNum='
								+ row['SamplingAreaNum'];
							db.run(delSql);

							$.messager.alert('提示:','删除成功','info');

							var data = db.export();
							var buffer = new Buffer(data);
							fs.writeFileSync(dbPath,buffer);
						}
					});
				}
			}]
	}).datagrid('loadData', data);

}

function chooseSamplingPointPollutionLimit(ProjectNum){
	$("#hiddenProjectNumber").val(ProjectNum);
	var sql = 'select p.IndicatorsDes as evaluationCriterion,'
		+' p.IndicatorsNam as IndicatorsNam,p.IndicatorsNum as IndicatorsNum '
		+'from pollutionIndicators p, evalutionType t,evaluationproject'
		+' e where p.evalutionTypeNum=t.evalutionTypeNum and t.evalutionTypeNum='
		+'e.EvalutionTypeNum and e.ProjectNum='+ProjectNum;
	//$.messager.alert('提示:', sql, 'info');
	var stmt = db.prepare(sql);
	var data=[];
	while(stmt.step()){
		var row = stmt.getAsObject();
		var chooseColumn = getPollutionLimitChooseColumn(row['evaluationCriterion'],row['IndicatorsNum']);
		data.push({"IndicatorsNam":row['IndicatorsNam'],
			"IndicatorsNum":row['IndicatorsNum'],
			"chooseColumn":chooseColumn});
	}
	
	$("#evalutionCriterionTable").datagrid(
	{
		title : "选择评价标准",fitColumns : true,width:500,singleSelect:true,
		columns : 
			[[ 
			 {field : 'IndicatorsNum',title:'指标ID',hidden:true},
			 {field : 'IndicatorsNam',title : '指标名称'},
			 {field : 'chooseColumn',title:'选择评价标准'},
			 {field : 'pollutionLimit',title:'限值'}
			]],
		toolbar : '#tb'
	}).datagrid('loadData', data);
	
	sql="select e.remark as remark from evalutionType e,evaluationproject ev where"
		+" e.evalutionTypeNum=ev.evalutionTypeNum and ev.ProjectNum="+ProjectNum;
	var stmt = db.prepare(sql);
	var options ="<option value=null>批量选择评价标准</option>";
	while(stmt.step()){
		var row = stmt.getAsObject();
		var pollutionLimit = row['remark'];
		if(pollutionLimit!="" && pollutionLimit!=null){
			var evaluationType = pollutionLimit.split(";");
			for(var i=0;i<evaluationType.length;i++){
				options+="<option value="+(i+1)+">"+evaluationType[i]+"</option>";
			}
		}
	}
	
	$("#allPollutionLimit").empty();
	$("#allPollutionLimit").append(options);
}

function batchChoosePollutionLimit(){
	var pollutionLimit = $("#allPollutionLimit option:selected").val();
	
	if(pollutionLimit!=null){
		var rows = $('#evalutionCriterionTable').datagrid("getData")['rows'];
		var IndicatorsNum;
		var chooseLimit;
		for(var i=0;i< rows.length;i++){
			IndicatorsNum = rows[i]['IndicatorsNum'];
			chooseLimit = rows[i]['chooseColumn'];
			if(chooseLimit!=undefined&&chooseLimit!=null&&chooseLimit!=""){
				$("#choosePollutionLimit"+IndicatorsNum)[0].selectedIndex = pollutionLimit;
				var index = $('#evalutionCriterionTable').datagrid('getRowIndex',rows[i]);
				
				var chooseLimit = $('#choosePollutionLimit'
						+IndicatorsNum+' option:selected').val();
				$("#evalutionCriterionTable").datagrid('updateRow',{
					index: index,
					row: {
						pollutionLimit: chooseLimit=='null'?"":chooseLimit
					}
				});
			}
		}
	}
}

function saveUpdatePollutionLimit(){
	var ProjectNum=$("#hiddenProjectNumber").val();
	var rows = $('#evalutionCriterionTable').datagrid("getData")['rows'];
	var IndicatorsNum;
	var chooseLimit;
	for(var i=0;i< rows.length;i++){
		IndicatorsNum = rows[i]['IndicatorsNum'];
		chooseLimit = rows[i]['pollutionLimit'];
		if(chooseLimit!=undefined&&chooseLimit!=null&&chooseLimit!=""){
			var sql='update samPointTestResult set PollutionLimit = '+Number(chooseLimit)
				+' where IndicatorsNum='+IndicatorsNum
				+' and SamPointNum in(select SamPointNum from samplingPoint where ProjectNum='+ProjectNum+')';
			//$.messager.alert('提示:', sql, 'info');
			excuSqlToSave(sql);
		}
	}
	alert("评价标准设置成功，污染限值更新成功");
}

function getPollutionLimitChooseColumn(pollutionLimitString,indicatorsNum){
	if(''==pollutionLimitString||pollutionLimitString==null)
	{
		return "";
	}
	else{
		// 解析污染限值等级
		var pollutionLimit = pollutionLimitString.split(";");
		var chooseColunm = "<select id='choosePollutionLimit"+indicatorsNum+"' onchange=updateThisPollutionLimit()>"
			+"<option value=null>选择评价标准</option>";
		for(var i=0;i<pollutionLimit.length;i++){
			var l = pollutionLimit[i].split("=");
			chooseColunm+="<option value="+l[1]+">"+l[0]+"</optin>";
		}
		chooseColunm+="</select>";
		return chooseColunm;
	}
}

function updateThisPollutionLimit(){
	var row = $('#evalutionCriterionTable').datagrid('getSelected');
	var index = $('#evalutionCriterionTable').datagrid('getRowIndex',$('#evalutionCriterionTable').datagrid(
	'getSelected'));
	//var chooseLimit = 
	var IndicatorsNum = row['IndicatorsNum'];
	var chooseLimit = $('#choosePollutionLimit'
			+IndicatorsNum+' option:selected').val();
	$("#evalutionCriterionTable").datagrid('updateRow',{
		index: index,
		row: {
			pollutionLimit: chooseLimit
		}
	});

}

function getSamplingAreaParentArea(SamplingAreaId)
{
	var stmt=db.prepare('select SamplingAreaNam from samplingArea where SamplingAreaNum=$SamplingAreaNum');
	stmt.bind({$SamplingAreaNum:SamplingAreaId});
	var SamplingAreaNam='';
	while (stmt.step()) {
		var row = stmt.getAsObject();
		SamplingAreaNam=row['SamplingAreaNam'];
	}
	return SamplingAreaNam;
}

function assignmentToFormOptionProjectNum(row) {
	$('#fm #SamplingAreaNum').val(row['SamplingAreaNum']);

	$('#fm #SamplingAreaNam').val(row['SamplingAreaNam']);

	$('#fm #SamPointTotal').val(row['SamPointTotal']);

	$('#fm #ProjectNum').val(row['ProjectNum']);

	$('#fm #Coordinates').val(row['Coordinates']);

	$('#fm #FloorHeight').val(row['FloorHeight']);

	$('#fm #RoomCoordinates').val(row['RoomCoordinates']);

	$('#fm #ComprePCV').val(row['ComprePCV']);

	$('#fm #Area').val(row['Area']);

	$('#fm #PersonnelDensity').val(row['PersonnelDensity']);

	$('#fm #ComprePR').val(row['ComprePR']);

	$('#fm #ComprePS').val(row['ComprePS']);

	$('#fm #OverStandardRate').val(row['OverStandardRate']);
}

function setProjectProjectNum(ProjectNum) {
	var stmt = db
			.prepare('select * from evaluationproject where EnvironmentNum =(select EnvironmentNum  from evaluationproject  where ProjectNum=$ProjectNum)');

	stmt.bind({
		$ProjectNum : ProjectNum
	});
	$('#addSamplingAreaProject #ProjectNum').html("");
	while (stmt.step()) {
		var row = stmt.getAsObject();
		$(
				"<option value='" + row['ProjectNum'] + "'>"
						+ row['ProjectNam'] + "</option>").appendTo(
				'#addSamplingAreaProject #ProjectNum');
	}
	
	stmt = db.prepare('select * from samplingArea where ProjectNum=$ProjectNum');
	stmt.bind({$ProjectNum:ProjectNum});
	$('#addSamplingAreaProject #parentAreaId').html("");
	
	while (stmt.step()) {
		var row = stmt.getAsObject();
		$("<option value='" + row['SamplingAreaNum'] + "'>"+ row['SamplingAreaNam'] 
		+ "</option>").appendTo('#addSamplingAreaProject #parentAreaId');
	}
	
	$("#addSamplingAreaProject #parentAreaId").prepend("<option value='null'></option>");
}

function showprojectTreeSamPointDetail(SamplingAreaNam, SamplingAreaNum) {
	//hideFirstTab(0, 1);
	setTreeProjectSupPointTable(SamplingAreaNum);
	
	var stmt = db
			.prepare('select * from  samplingPoint a,samplingArea b where a.SamplingAreaNum=b.SamplingAreaNum'
					+ ' and a.SamplingAreaNum=$SamplingAreaNum');
	
	stmt.bind({
		$SamplingAreaNum : SamplingAreaNum
	});

	var data = [];
	while (stmt.step()) {
		var row = stmt.getAsObject();
		data.push({
			'SamPointNum' : row['SamPointNum'],
			'SamplingAreaNum' : row['SamplingAreaNum'],
			'SamPointNam' : row['SamPointNam'],
			'Coordinates':row['Coordinates'],
			'MeasuredValue' : row['MeasuredValue'],
			'CalculatedValue' : row['CalculatedValue'],
			'SinglePS' : row['SinglePS'],
			'SamHeight' : row['SamHeight'],
			'SamTime' : row['SamTime'],
			'SamFlow' : row['SamFlow'],
			'SamWindSpeed' : row['SamWindSpeed'],
			'SamTemperature' : row['SamTemperature'],
			'SamAtmoPressure' : row['SamAtmoPressure']
		});
	}
	
$('#projectTreeDetaileTable').datagrid(
{
	title : SamplingAreaNam,
	fitColumns : true,
	//height : 500,
	//width:670,
	singleSelect : true,
	onClickRow : onClickSamPointRow,
	columns : [ 
		           [ 
		             {field : 'SamPointNum',title : '采样点编号'},
		             {field : 'SamplingAreaNum',title : '采样区域编号',hidden:true},
		             {field : 'SamPointNam',title : '采样点名称'},
		             {field : 'Coordinates',title : '位置坐标'}, 
		             {field : 'SamHeight',title : '采样高度'},
		             {field : 'SamTime',title : '时间'}, 
		             {field : 'SamFlow',title : '流量'},
		             {field : 'SamWindSpeed',title : '风速'}, 
		             {field : 'SamTemperature',title : '温度'},
		             {field : 'SamAtmoPressure',title : '大气压'},
		             {field : 'SamPointP',title : '综合污染指数'},
		             {field : 'SamPointPlevel',title : '综合污染等级'}
		           ]
	           ],
	           
	toolbar : [
	           {
					iconCls : 'icon-add',
					handler : function() 
					{
						$('#dlg').dialog('open').dialog('setTitle', '增加采样点');
						$('#fm').html('');
						setSamplingAreaSamplingAreaNam(SamplingAreaNum);
						$('#fm').append($('#addSamplingPointproject').html());
						$('#dlg_save').linkbutton('enable');
					}
			  },
			  {
					iconCls : 'icon-edit',
					handler : function() 
					{
						var row = $('#projectTreeDetaileTable').datagrid('getSelected');
						if (row == null) 
						{
							$.messager.alert('提示:', '请选择一行','info');
							return;
						}
						$('#dlg').dialog('open').dialog('setTitle', '编辑采样点');
						$('#fm').html('');
						setSamplingAreaSamplingAreaNam(SamplingAreaNum);
						$('#fm').append($('#addSamplingPointproject').html());
						assignmentToFormOption(row);
						$('#dlg_save').linkbutton('enable');
					}
			},
			{
				  iconCls : 'icon-remove',
				  handler : function() 
				  {
					var row = $('#projectTreeDetaileTable').datagrid('getSelected');
					if (row == null) 
					{
						$.messager.alert('提示:', '请选择一行','info');
						return;
					}
					$.messager.confirm('确认','确认删除?',
						function(ok) 
						{
							if (ok) 
							{
							  var rowIndex = $('#projectTreeDetaileTable').datagrid('getRowIndex',
										     $('#projectTreeDetaileTable').datagrid('getSelected'));
											 $('#projectTreeDetaileTable').datagrid('deleteRow',rowIndex);
							  var delSampointResult='delete from samPointTestResult  where SamPointNum ='+ row['SamPointNum'];
							  db.run(delSampointResult);
							  var delSql = 'delete from samplingPoint where SamPointNum='+ row['SamPointNum'];
							  excuSqlToSave("update samplingArea set SamPointTotal=SamPointTotal-1");
							  excuSqlToSave(delSql);

							  $.messager.alert('提示:','删除成功','info');

							  var data = db.export();
							  var buffer = new Buffer(data);
							  fs.writeFileSync(dbPath,buffer);
							  showprojectTreeSamPointDetail(SamplingAreaNam,SamplingAreaNum);
							}
					 });
				  }
			}
			  ]}).datagrid('loadData', data);

	loadSamPointTestResultDatagrid(SamplingAreaNum);
	
}

function loadSamPointTestResultDatagrid(SamplingAreaNum){
// 采样点结果录入
	//$('#samPointTestResultDiv').style.height="100";
	var editIndex = undefined;
	$('#samPointTestResultTable').datagrid({
		title: '采样点结果',
		fitColumns: true,
		width:487,
		//height:650,
		singleSelect:true,
		columns:
		[[
            {field:'samPointTestResultNum',hidden:true,title:'采样结果编号'},
			{field:'SamPointNum',hidden:true,title:'所属采样点编号'},
			{field:'IndicatorsNum',hidden:true,title:'污染指标编号'},
			{field:'IndicatorsNam',width:50,title:'指标'},		
			{field:'SamPointResultPi',width:65,title:'单因子污染指数'},
			{field:'SamPointResultPilevel',width:80,title:'单因子污染指数等级'},
			{field:'PollutionLimit',width:50,title:'污染限值'},
			{field:'result',width:50,required:true,editor:'text',title:'采样点结果'},
			{field:'IndicatorsUnit',width:50,title:'单位'},		
		]],
		toolbar:
		[{
			iconCls: 'icon-redo',
			handler: function()
			{
				loadAllSamPointResult(SamplingAreaNum);
			}
		}],
		onClickRow:onClickSamPointResultRow,
		onAfterEdit:saveSamPointResult
	});
	//alert("total_1");
	$('#samPointTestResultTable').datagrid('loadData',{total:0,rows:[]});
//	alert("total_2");
	function onClickSamPointResultRow(index)
	{
		 
		if (editIndex != index)
		{
			
			 if (endEditing())
			 {
				 $('#samPointTestResultTable').datagrid('selectRow', index)
				 .datagrid('beginEdit', index);
				 $("input.datagrid-editable-input").keyup(function(event) { 
					 if(event.keyCode==13){
						 onClickSamPointResultRow(parseInt(index)+1,"result");
					    }	
					 
				  });
				 $("input.datagrid-editable-input").focus();
				 editIndex = index;
			 } else {
			    $('#samPointTestResultTable').datagrid('selectRow', editIndex);
			 }
	   }
	}
	function endEditing() {
		if (editIndex == undefined) {
			return true;
		}
		if ($('#samPointTestResultTable').datagrid('validateRow', editIndex)) {
			
			$('#samPointTestResultTable').datagrid('endEdit', editIndex);
			editIndex = undefined;
			return true;
		} else {
			return false;
		}
	}
	
	//保存结果
	function saveSamPointResult(index,rowData,results){
		
		var datavalue="{':result':'"+rowData['result']+"',':samPointTestResultNum':"+rowData['samPointTestResultNum']+"}";
		
		var testResult=eval('('+datavalue+')');
		
		var updatesql="UPDATE samPointTestResult  SET result=:result WHERE samPointTestResultNum =:samPointTestResultNum";
	    
		db.run(updatesql,testResult);

		var data = db.export();
		var buffer = new Buffer(data);
		 fs.writeFileSync(dbPath, buffer);
	}


}


function onClickSamPointRow(index){
	//alert("index__"+index);
	$('#projectTreeDetaileTable').datagrid('selectRow',index);// 关键在这里  
    var row = $('#projectTreeDetaileTable').datagrid('getSelected');
    //alert("row__"+row['SamplingAreaNum']);
    loadSamPointTestResultDatagrid(row['SamplingAreaNum']);
    if(row['SamPointNum']==undefined){
 	   return;
    }
    var SamPointNum=row['SamPointNum'];
    var stmtRes=db.prepare('select a.* from samPointTestResult as a where a.SamPointNum='+SamPointNum);
  
    if(stmtRes.step()==true){
    	stmtRes.free();
    	selectTestResult(SamPointNum);
    }else{
    	stmtRes.free();
    	var stmt = db.prepare('select a.* from pollutionIndicators as a where'+
    		    ' a.evalutionTypeNum=(select  b.EvalutionTypeNum from evaluationproject as b  where'+
    		    ' b.ProjectNum=(select c.ProjectNum from samplingArea as c where'+
    		    ' c.SamplingAreaNum=(select d.SamplingAreaNum from samplingPoint as d where d.SamPointNum=$SamPointNum)))');
    		    stmt.bind({$SamPointNum:SamPointNum});
    		   
    		    while(stmt.step()) 
    			{ 
    				var Data = stmt.getAsObject();
    				var SamPointNum=row['SamPointNum'];
    				var IndicatorsNum=Data['IndicatorsNum'];
    				var IndicatorsNam=Data['IndicatorsNam'];
    				var IndicatorsUnit=Data['IndicatorsUnit'];
    				//var result='';
    				//var SingleFacPolluExponent='';
    				var PollutionLimit=Data['PollutionLimit'];
    				if(PollutionLimit == null || PollutionLimit == "" || PollutionLimit == undefined)
					{
    					PollutionLimit=0;
					}
    				if(IndicatorsUnit == null || IndicatorsUnit == "" || IndicatorsUnit == undefined)
					{
    					IndicatorsUnit='';
					}
    				var insertTestResultsql="insert into samPointTestResult(SamPointNum,IndicatorsNum,IndicatorsNam,PollutionLimit,IndicatorsUnit) values("+
					SamPointNum+","+IndicatorsNum+",'"+IndicatorsNam+"',"+PollutionLimit+",'"+IndicatorsUnit+"')";
//    				alert(insertTestResultsql);
    				db.run(insertTestResultsql);
    				
    				
			 		
    		   }
    		    stmt.free();
    		    var data = db.export();
		 		var buffer = new Buffer(data);
		 		fs.writeFileSync(dbPath, buffer);
    		    //alert(row['SamPointNum']);
    		    selectTestResult(row['SamPointNum']);
      }
 
    
}

function saveSamPointResultByPoint(SamPointNum){
    var stmtRes=db.prepare('select a.* from samPointTestResult as a where a.SamPointNum='+SamPointNum);
  //alert(SamPointNum);
    if(stmtRes.step()==true){
    	stmtRes.free();
    	//selectTestResult(SamPointNum);
    }else{
    	
    	stmtRes.free();
    	var stmt = db.prepare('select a.* from pollutionIndicators as a where'+
    		    ' a.evalutionTypeNum=(select  b.EvalutionTypeNum from evaluationproject as b  where'+
    		    ' b.ProjectNum=(select c.ProjectNum from samplingArea as c where'+
    		    ' c.SamplingAreaNum=(select d.SamplingAreaNum from samplingPoint as d where d.SamPointNum=$SamPointNum)))');
    		    stmt.bind({$SamPointNum:SamPointNum});
    		    
    		    while(stmt.step()) 
    			{ 
    		    	
    				var Data = stmt.getAsObject();
    				//var SamPointNum=row['SamPointNum'];
    				var IndicatorsNum=Data['IndicatorsNum'];
    				var IndicatorsNam=Data['IndicatorsNam'];
    				var IndicatorsUnit=Data['IndicatorsUnit'];
    				//var result='';
    				//var SingleFacPolluExponent='';
    				var PollutionLimit=Data['PollutionLimit'];
    				if(PollutionLimit==null||PollutionLimit==''||PollutionLimit==undefined){
    					PollutionLimit=1;
    				}
    				if(IndicatorsUnit == null || IndicatorsUnit == "" || IndicatorsUnit == undefined)
					{
    					IndicatorsUnit='';
					}
    				var insertTestResultsql="insert into samPointTestResult(SamPointNum,IndicatorsNum,IndicatorsNam,PollutionLimit,IndicatorsUnit) values("+
					SamPointNum+","+IndicatorsNum+",'"+IndicatorsNam+"',"+PollutionLimit+",'"+IndicatorsUnit+"')";
    				//alert(insertTestResultsql);
    				db.run(insertTestResultsql);
    				
    				
			 		
    		   }
    		    stmt.free();
    		    var data = db.export();
		 		var buffer = new Buffer(data);
		 		fs.writeFileSync(dbPath, buffer);
    		    //alert(row['SamPointNum']);
    		   // selectTestResult(row['SamPointNum']);
      }
 
    
}

function selectTestResult(SamPointNum){
	 
	var whereSql='where a.SamPointNum=$SamPointNum';
	var condition={$SamPointNum:SamPointNum};
	loadSamPointResult(whereSql,condition);
	

}

function loadAllSamPointResult(SamplingAreaNum){
	
	var whereSql='where a.SamPointNum in( select b.SamPointNum from samplingPoint as b where b.SamplingAreaNum =$SamplingAreaNum)';
	var condition={$SamplingAreaNum:SamplingAreaNum};
	loadSamPointResult(whereSql,condition);
	
}

function loadSamPointResult(whereSql,condition){
	
	var samPointTestResultList=new Array();
	var selectSamPointResultSql='select a.* from samPointTestResult as a '+whereSql;
	//alert(selectSamPointResultSql);
    var stmtshow=db.prepare(selectSamPointResultSql);
    stmtshow.bind(condition);
    while(stmtshow.step()) 
	{ 
    	
		var selectData = stmtshow.getAsObject();
		var samPointTestResultString="{samPointTestResultNum:"+selectData['samPointTestResultNum']+",SamPointNum:"+selectData['SamPointNum']+",IndicatorsNum:"+selectData['IndicatorsNum']+",IndicatorsNam:'"+selectData['IndicatorsNam']+
		"',SamPointResultPi:"+selectData['SamPointResultPi']+",SamPointResultPilevel:'"+(selectData['SamPointResultPilevel']==null?'':selectData['SamPointResultPilevel'])+"',PollutionLimit:"+selectData['PollutionLimit']+",result:'"+(selectData['result']==null?'':selectData['result'])+"',IndicatorsUnit:'"+(selectData['IndicatorsUnit']==null?'':selectData['IndicatorsUnit'])+"'}";

		
		var samPointTestResult = eval('(' + samPointTestResultString + ')');

		
		samPointTestResultList.push(samPointTestResult);

	}
	var evaluationStandardesData = {};
	// evaluationStandardesData.total=rowsize;//显示总条数
	evaluationStandardesData.rows = samPointTestResultList;

	 $('#samPointTestResultTable').datagrid('loadData',evaluationStandardesData);
	 stmtshow.free();
}

function hideFirstTab(hiddenIndex, showIndex) {
	var ctab = $('#evaluationProjectDDD').tabs('tabs'), hiddenTab, showTab;
	hiddenTab = ctab[hiddenIndex].panel('options');
	ctab[hiddenIndex].hide();
	hiddenTab.tab.hide();

	showTab = ctab[showIndex].panel('options');
	ctab[showIndex].show();
	showTab.tab.show();

	$('#evaluationProjectDDD').tabs("select", showIndex);
}

function saveEnvironmentProjectFromTable()
{
	var SamplingAreaNum = $('#projectDetail #SamplingAreaNum').val();
	var SamplingAreaNam = $('#projectDetail #SamplingAreaNam').val();
	if (SamplingAreaNam == "") {
		alert("采样区域名称不能为空");
		return;
	}
	var ProjectNum = $('#projectDetail #ProjectNum').val();
	var parentId = $('#projectDetail #parentAreaId').val();
	var Coordinates = $('#projectDetail #Coordinates').val();
	var FloorHeight = $('#projectDetail #FloorHeight').val() == '' ? '0' : $(
			'#projectDetail #FloorHeight').val();
	var RoomCoordinates = $('#projectDetail #RoomCoordinates').val();
	var ComprePCV = $('#projectDetail #ComprePCV').val() == '' ? '0' : $(
			'#projectDetail #ComprePCV').val();
	var RoomArea = $('#projectDetail #Area').val() == '' ? '0' : $('#projectDetail #Area').val();
	var PersonnelDensity = $('#projectDetail #PersonnelDensity').val() == '' ? '0' : $(
			'#projectDetail #PersonnelDensity').val();
	var ComprePR = $('#projectDetail #ComprePR').val();
	var ComprePS = $('#projectDetail #ComprePS').val();
	var OverStandardRate = $('#projectDetail #OverStandardRate').val() == '' ? '0' : $(
			'#projectDetail #OverStandardRate').val();

	var sql = "update samplingArea set SamplingAreaNam='" + SamplingAreaNam+ "',ProjectNum=" + ProjectNum 
				+ ",Coordinates='" + Coordinates+ "',FloorHeight=" + FloorHeight + ",RoomCoordinates='"
				+ RoomCoordinates + "',ComprePCV=" + ComprePCV + ",Area="+ RoomArea + ",PersonnelDensity=" 
				+ PersonnelDensity+ ",ComprePR='" + ComprePR + "',ComprePS='" + ComprePS+ "',OverStandardRate=" 
				+ OverStandardRate+",parentid="+parentId+ " where SamplingAreaNum=" + SamplingAreaNum;
	
	excuSqlToSave(sql);
	//alert("保存成功！");
}

function setTreeProjectSupPointTable(SamplingAreaNum)
{
	$('#projectDetail').html('');
	var html=$('#addSamplingAreaProject').html();
	$('#projectDetail').append(html);
	
	var stmt = db.prepare('select ProjectNam,ProjectNum from  evaluationproject where'
			+' ProjectNum=(select ProjectNum from samplingArea '
			+'where SamplingAreaNum=$SamplingAreaNum)');
	stmt.bind({$SamplingAreaNum:SamplingAreaNum});
	var row;
	while(stmt.step())
	{
		row = stmt.getAsObject();
		$("<option value='" + row['ProjectNum'] + "'>"+ row['ProjectNam'] 
			+ "</option>").appendTo('#projectDetail #ProjectNum');
	}
	
	stmt=db.prepare('select * from samplingArea where SamplingAreaNum=$SamplingAreaNum');
	stmt.bind({$SamplingAreaNum:SamplingAreaNum});
	var parentId = null;
	while(stmt.step())
	{
		row = stmt.getAsObject();
		$('#projectDetail #SamplingAreaNum').val(row['SamplingAreaNum']);
		$('#projectDetail #ProjectNum').val(row['ProjectNum']);
		$('#projectDetail #parentAreaId').val(row['parentid']);
		parentId=row['parentid'];
		$('#projectDetail #SamplingAreaNam').val(row['SamplingAreaNam']);
		$('#projectDetail #SamPointTotal').val(row['SamPointTotal']);
		$('#projectDetail #Coordinates').val(row['Coordinates']);
		$('#projectDetail #FloorHeight').val(row['FloorHeight']);
		$('#projectDetail #RoomCoordinates').val(row['RoomCoordinates']);
		$('#projectDetail #ComprePCV').val(row['ComprePCV']);
		$('#projectDetail #Area').val(row['Area']);
		$('#projectDetail #PersonnelDensity').val(row['PersonnelDensity']);
		$('#projectDetail #ComprePR').val(row['ComprePR']);
		$('#projectDetail #ComprePS').val(row['ComprePS']);
		$('#projectDetail #OverStandardRate').val(row['OverStandardRate']);
	}
	
	$('#projectDetail #parentAreaId').html('');
	stmt = db.prepare('SELECT * from samplingArea where ProjectNum=( '
					+ 'select ProjectNum from samplingArea where SamplingAreaNum =$SamplingAreaNum)');
	stmt.bind({$SamplingAreaNum : SamplingAreaNum});

	$("<option value='null'></option>").appendTo('#projectDetail #parentAreaId');
	while (stmt.step()) {
		var row = stmt.getAsObject();
		$("<option value='" + row['SamplingAreaNum'] + "'>"+ row['SamplingAreaNam'] 
			+ "</option>").appendTo('#projectDetail #parentAreaId');
	}
	$("#projectDetail #parentAreaId option[value="+parentId+"]").attr("selected","selected");
	$("#projectDetail #parentAreaId option[value='"+SamplingAreaNum+"']").remove();
}


function setTreeProjectEditTable(EngineerId, Environment) {
	$('#projectDetail').html('');
	$('#projectDetail').append($('#projectEnvironmentDetial').html());

	var stmt = db
			.prepare('select * from environment a,evaluationengineer b where a.EnvironmentType=$EnvironmentType'
					+ ' and a.EngineerNum=$EngineerNum and a.EngineerNum = b.EngineerNum');
	stmt.bind({
		$EnvironmentType : Environment,
		$EngineerNum : EngineerId
	});

	while (stmt.step()) {
		var row = stmt.getAsObject();
		$('#EnvironmentNum').val(row['EnvironmentNum']);
		$('#EnvironmentNam').val(row['EnvironmentNam']);
		$('#EnvironmentType').append("<a>"+row['EnvironmentType']+"</a>");
		$('#Position').val(row['Position']);
		$('#Area').val(row['Area']);
		$('#EnvironmentGen').val(row['EnvironmentGen']);
		$('#EngineerNam').append("<a>"+row['EngineerNam']+"</a>");
	}
}

function assignmentToFormOption(row) {

	$('#fm #SamPointNum').val(row['SamPointNum']);
	$('#fm #SamPointNam').val(row['SamPointNam']);
	$('#fm #SamplingAreaNam').val(row['SamplingAreaNam']);
	$('#fm #Coordinates').val(row['Coordinates']);
	$('#fm #SamHeight').val(row['SamHeight']);
	$('#fm #SamTime').val(row['SamTime']);
	$('#fm #SamFlow').val(row['SamFlow']);
	$('#fm #SamWindSpeed').val(row['SamWindSpeed']);
	$('#fm #SamTemperature').val(row['SamTemperature']);
	$('#fm #SamAtmoPressure').val(row['SamAtmoPressure']);
}

function setProjectEnvironmentEditTable(ProjectNum)
{
	$('#projectDetail').html('');
	$('#projectDetail').append($('#evaluationProjectDetail').html());
	var selectSql = "select a.ProjectNam as ProjectNam,a.EnvironmentType as EnvironmentType,a.ProjectDes as ProjectDes,b.EngineerNam as EngineerNam " +
					" from " +
					"evaluationproject a,evaluationengineer b ,environment c where a.EnvironmentNum = c.EnvironmentNum"
		           +" and b.EngineerNum = c.EngineerNum and a.ProjectNum = "+ProjectNum;
	//alert(selectSql);
	var stmt = db.prepare(selectSql);
	//alert(stmt);
	while(stmt.step())
	{
		var row = stmt.getAsObject();
		$("#ProjectNum").val(ProjectNum);
		$("#evaluationProjectNum").append("<a>"+ProjectNum+"</a>");
		$("#evaluationProjectNam").val(row['ProjectNam']);
		$("#evaluationProjectEnvironmentType").append("<a>"+row['EnvironmentType']+"</a>");
		$("#evaluationProjectDes").val(row['ProjectDes']);
		$("#evaluationProjectEnvironmentNam").append("<a>"+row['EngineerNam']+"</a>");
	}
}

function setSamplingAreaSamplingAreaNam(EnvironmentId) {
	$('#addSamplingPointproject #SamplingAreaNam').html('');
	var stmt = db
			.prepare('SELECT * from samplingArea where ProjectNum=( '
					+ 'select ProjectNum from samplingArea where SamplingAreaNum =$SamplingAreaNum)');

	stmt.bind({
		$SamplingAreaNum : EnvironmentId
	});

	while (stmt.step()) {
		var row = stmt.getAsObject();
		$("<option value='" + row['SamplingAreaNum'] + "'>"+ row['SamplingAreaNam'] 
		+ "</option>").appendTo('#addSamplingPointproject #SamplingAreaNam');
	}
}

function saveEnvironmentProjectDDD() {
	if ($('#fm #ordersCode').val()) {
		if ($('#fm #ordersCode').val() == 1)
			saveEvaluationprojectDDD();
		else if ($('#fm #ordersCode').val() == 11)
			saveSamplingAreaProjectDDD();
		else if ($('#fm #ordersCode').val() == 111)
			saveSamPoinProjectDDD();
	} else {
		alert(0);
	}
}

function saveSamplingAreaProjectDDD() {
	var SamplingAreaNum = $('#fm #SamplingAreaNum').val();
	var SamplingAreaNam = $('#fm #SamplingAreaNam').val();
	if (SamplingAreaNam == "") {
		alert("采样区域名称不能为空");
		return;
	}
	var ProjectNum = $('#fm #ProjectNum option:selected').val();
	var parentAreaId = $('#fm #parentAreaId option:selected').val();
	var Coordinates = $('#fm #Coordinates').val();
	var FloorHeight = $('#fm #FloorHeight').val() == '' ? '0' : $(
			'#fm #FloorHeight').val();
	if(isNaN(FloorHeight))
	{
		alert("楼层高度只能为数字");
		return;
	}
	var RoomCoordinates = $('#fm #RoomCoordinates').val();
	var RoomArea = $('#fm #Area').val() == '' ? '0' : $('#fm #Area').val();
	if(isNaN(RoomArea))
	{
		alert("房间面积只能为数字");
		return;
	}
	var PersonnelDensity = $('#fm #PersonnelDensity').val() == '' ? '0' : $(
			'#fm #PersonnelDensity').val();
	if(isNaN(PersonnelDensity))
	{
		alert("人口密度只能为数字");
		return;
	}

	var sql = "";
	if ("" == SamplingAreaNum) {
		sql = "insert into samplingArea(SamplingAreaNam,ProjectNum,Coordinates,FloorHeight,RoomCoordinates"
				+ ",Area,PersonnelDensity,SamPointTotal,parentid) values('"
				+ SamplingAreaNam+ "',"+ ProjectNum+ ",'"+ Coordinates+ "',"
				+ FloorHeight+ ",'"+ RoomCoordinates+ "',"
				+ RoomArea+ ","+ PersonnelDensity+ ",0,"+parentAreaId+")";
	} else {
		sql = "update samplingArea set SamplingAreaNam='" + SamplingAreaNam
				+ "',ProjectNum=" + ProjectNum + ",Coordinates='" + Coordinates
				+ "',FloorHeight=" + FloorHeight + ",RoomCoordinates='"
				+ RoomCoordinates + "',Area="
				+ RoomArea + ",PersonnelDensity=" + PersonnelDensity
				+ ",parentid="+parentAreaId
				+ " where SamplingAreaNum=" + SamplingAreaNum;
		
	}
	//$.messager.alert('提示:', sql, 'info');
	excuSqlToSave(sql);
	//alert("保存成功！");
	showprojectTreeSamplingDetail(ProjectNum,$('#fm #ProjectNum option:selected').text());
	$('#dlg').dialog('close');
}

function saveSamPoinProjectDDD() {
	//alert("saveSamPoinProjectDDD");
	var SamPointNum = $("#fm #SamPointNum").val();

	var SamPointNam = $('#fm #SamPointNam').val();
	if ('' == SamPointNam) {
		alert("采样点名称不能为空");
		return;
	}

	var SamplingAreaNum = $('#fm #SamplingAreaNam option:selected').val();

	var Coordinates = $('#fm #Coordinates').val();

	var SamHeight = $('#fm #SamHeight').val() == '' ? '0' : $(
			'#fm #SamHeight').val();
	if(isNaN(SamHeight))
	{
		alert("采样高度只能为数字");
		return;
	}
	
	var SamTime = $('#fm #SamTime').val() == '' ? '0' : $(
	'#fm #SamTime').val();
	if(isNaN(SamTime))
	{
		alert("时间只能为数字");
		return;
	}

	var SamFlow = $('#fm #SamFlow').val() == '' ? '0' : $(
	'#fm #SamFlow').val();
	if(isNaN(SamFlow))
	{
		alert("流量只能为数字");
		return;
	}
	
	var SamWindSpeed = $('#fm #SamWindSpeed').val() == '' ? '0' : $(
	'#fm #SamWindSpeed').val();
	if(isNaN(SamWindSpeed))
	{
		alert("风速只能为数字");
		return;
	}

	var SamTemperature = $('#fm #SamTemperature').val() == '' ? '0' : $(
	'#fm #SamTemperature').val();
	if(isNaN(SamTemperature))
	{
		alert("温度只能为数字");
		return;
	}
	
	var SamAtmoPressure = $('#fm #SamAtmoPressure').val() == '' ? '0' : $(
	'#fm #SamAtmoPressure').val();
	if(isNaN(SamAtmoPressure))
	{
		alert("大气压只能为数字");
		return;
	}
	
	
	var sql = "";
	if ("" == SamPointNum) {
		var ProjectNum = null;
		var EngineerNum = null;

		var stmt = db
				.prepare('select ProjectNum from samplingArea where SamplingAreaNum=$SamplingAreaNum');
		stmt.bind({
			$SamplingAreaNum : SamplingAreaNum
		});

		while (stmt.step()) {
			var row = stmt.getAsObject();
			ProjectNum = row['ProjectNum'];
		}

		stmt = db
				.prepare('select EngineerNum from environment where EnvironmentNum=('
						+ 'select EnvironmentNum from evaluationproject where ProjectNum=$ProjectNum)');
		stmt.bind({
			$ProjectNum : ProjectNum
		});

		while (stmt.step()) {
			var row = stmt.getAsObject();
			EngineerNum = row['EngineerNum'];
		}

		sql = "insert into samplingPoint(SamPointNam,SamplingAreaNum,Coordinates,"
				+ "SamHeight,ProjectNum,EngineerNum," 
				+ "SamTime,SamFlow,SamWindSpeed,SamTemperature,SamAtmoPressure) values('"
				+ SamPointNam+ "',"+ SamplingAreaNum+ ",'"+ Coordinates
				+ "',"+ SamHeight+ ","+ ProjectNum + "," + EngineerNum 
				+ ","+SamTime+","+SamFlow+","+SamWindSpeed+","+SamTemperature+","+SamAtmoPressure+")";
		excuSqlToSave("update samplingArea set SamPointTotal=SamPointTotal+1 where SamplingAreaNum="+SamplingAreaNum);
	} else {
		sql = "update samplingPoint set SamPointNam='" + SamPointNam
				+ "',SamplingAreaNum=" + SamplingAreaNum + ",Coordinates='"
				+ Coordinates + "',SamHeight="
				+ SamHeight + ",SamTime="+SamTime+",SamFlow="+SamFlow+"," 
				+ "SamWindSpeed="+SamWindSpeed+",SamTemperature="+SamTemperature+",SamAtmoPressure="+SamAtmoPressure
				+ " where SamPointNum=" + SamPointNum;
		
	}

	var SamPointNum= excuSqlToSave(sql);
	saveSamPointResultByPoint(SamPointNum);

	//alert("保存成功！");
	$('#dlg').dialog('close');
	showprojectTreeSamPointDetail($('#fm #SamplingAreaNam option:selected').text(),
			SamplingAreaNum);
}
function excuSqlToSave(sql) {
	db.run(sql);
	var data = db.export();
	var buffer = new Buffer(data);
	fs.writeFileSync(dbPath, buffer);
	var maxID=selectMaxSampointId();
	return maxID;
}

function selectMaxSampointId(){
	//查询数据总条数
	 var sql='select max(SamPointNum) as maxId from samplingPoint';
	 var stmt = db.prepare(sql);
	var samPointId=0;
	 while(stmt.step()) 
	{ 
	 var row = stmt.getAsObject();
	
	 samPointId=row['maxId'];
	 }
	 return samPointId;
}

function saveEvaluationprojectDDD() {
	var stmt = db
			.prepare('insert into evaluationproject("ProjectNam","EnvironmentType",'
					+ '"ProjectDes","EnvironmentNum") values($ProjectNam,$EnvironmentType,$ProjectDes,$EnvironmentNum)');

	stmt.bind({
		$ProjectNam : $('#fm #ProjectNam').val(),
		$EnvironmentType : $('#fm #EnvironmentType').val(),
		$ProjectDes : $('#fm #ProjectDes').val(),
		$EnvironmentNum : $('#fm #EnvironmentNum').val()
	});

	var data = db.export();
	var buffer = new Buffer(data);
	fs.writeFileSync(dbPath, buffer);
}

function getProjectData(EngineerNum) {
	if (EngineerNum == undefined || EngineerNum == null) {
		return null;
	}
	var stmt = db
			.prepare("SELECT * FROM environment where EngineerNum=$EngineerNum");
	stmt.bind({
		$EngineerNum : EngineerNum
	});

	var treeData = [];

	while (stmt.step()) {
		var row = stmt.getAsObject();
		//室内 室外 级
		var rowData = {
			"id" : row['EnvironmentNum'],
			"text" : row['EnvironmentNam'],
			"state" : "closed",
			"iconCls" : "icon-environment",
			"attributes" : {
				'id' : row['EnvironmentNum'],
				'type' : row['EnvironmentType'],
				'code' : 1
			},
			"children" : getEnvironmentChildren(row['EnvironmentNum'])
		};

		treeData.push(rowData);
	}
	return treeData;
}

function getEnvironmentChildren(EnvironmentNum) {
	var sql ="SELECT * FROM evaluationproject where EnvironmentNum="+EnvironmentNum;
	var stmt = db.prepare(sql);
	var treeData = [];

	while (stmt.step()) {
		var row = stmt.getAsObject();
		// 大气环境级
		var rowData = {
			"text" : row['ProjectNam'],
			"state" : "closed",
			"iconCls" : "icon-project",
			"attributes" : {
				'id' : row["ProjectNum"],
				'code' : 11
			},
			"children" : loadSamplingAreaChildDDD(row['ProjectNum'])
		};

		treeData.push(rowData);
	}
	return treeData;
}
function loadSamplingAreaChildDDD(ProjectNum)
{
	var stmt = db.prepare("select * from SamplingArea where ProjectNum="+ProjectNum+" and parentId is null");
	
	var treeData = [];
	while (stmt.step()) {
		var row = stmt.getAsObject();
		var SamplingAreaNum=row['SamplingAreaNum'];
		var rowData = {
				"text" : row['SamplingAreaNam'],
				"state" : "closed",
				"iconCls" : "icon-area",
				"attributes" : {
					'id' : SamplingAreaNum,
					'hasChild':thisSamplingAreaHasChildDDD(SamplingAreaNum),
					'code' : 111
				},
				"children" : getEvaluationprojectChildrenDDD(SamplingAreaNum)
		};

		treeData.push(rowData);
	}
	return treeData;
}

function getEvaluationprojectChildrenDDD(SamplingAreaNum) {	
	var hasChild = thisSamplingAreaHasChildDDD(SamplingAreaNum);
	
	if(!hasChild)
	{
		return [];
	}
	else
	{
		var stmt = db.prepare("SELECT * FROM samplingArea where parentId="+SamplingAreaNum);
		var treeData = [];
		while (stmt.step()) {
			var row = stmt.getAsObject();
			var rowData = {
					"text" : row['SamplingAreaNam'],
					"state" : "closed",
					"iconCls" : "icon-area",
					"attributes" : {
						'id' : row['SamplingAreaNum'],
						'code' : 111,
						'hasChild':thisSamplingAreaHasChildDDD(row['SamplingAreaNum'])
					},
					"children" :getEvaluationprojectChildrenDDD(row['SamplingAreaNum'])
			};
			treeData.push(rowData);
		}
		return treeData;
	}
}

function getSamplingAreaChildBySamplingAreaId(SamplingAreaNum)
{
	var treeData = [];
	if(thisSamplingAreaHasChildDDD(SamplingAreaNum))
	{
		
		treeData = getEvaluationprojectChildrenDDD(sql);
	}
	return treeData;
}

function thisSamplingAreaHasChildDDD(SamplingAreaNum)
{
	var stmt = db.prepare("SELECT * FROM samplingArea where parentId=$SamplingAreaNum");
	stmt.bind({$SamplingAreaNum:SamplingAreaNum});
	while (stmt.step()) {
		stmt.getAsObject();
		return true;
	}
	return false;
}

function setProjectDatatoProject(EngineerNum) {
	if (EngineerNum == null||EngineerNum == undefined)
	{
		$("#engineerCode").val("");
		$("#engineerNam").val("");
		$("#engineerDes").val("");
		$("#engineerCity").val("");
		$("#hiddenEngineerNum").val("");
		var outdoorChecks = $("#outerDoorTable input[type='checkbox'][class='outdoorcheckrow']");
		var indoorChecks = $("#innerDoorTable input[type='checkbox'][class='indoorcheckrow']");
		for (var i = 0; i < outdoorChecks.length; i++) {
			outdoorChecks[i].checked = false;
		}
		for (var i = 0; i < indoorChecks.length; i++) {
			indoorChecks[i].checked = false;
		}
		$(".indoorcheckall").each(function(){
			this.checked=false;
		});
		$(".outdoorcheckall").each(function(){
			this.checked=false;
		});
		return null;
	}
	var sql = "select a.EngineerCode as EngineerCode,a.engineerCity as engineerCity,a.EngineerNam as EngineerNam,a.EngineerDes as EngineerDes," +
			"b.EnvironmentType as EnvironmentType,b.EnvironmentNum as EnvironmentNum, c.ProjectNam as ProjectNam " +
			"from evaluationengineer a,environment b,evaluationproject c " +
			"where a.EngineerNum = b.EngineerNum " +
			"and c.EnvironmentNum = b.EnvironmentNum  " +
			"and a.EngineerNum = "+EngineerNum;
	//alert(EngineerNum);
	var stmt = db.prepare(sql);
	var data = new Object();
	var dataArray = new Array();
	while (stmt.step()) {
		data = stmt.getAsObject();
		dataArray.push(data);
	}
	// alert($('#engineerCode'));
	$("#engineerCode").val(data['EngineerCode']);
	$("#engineerNam").val(data['EngineerNam']);
	$("#engineerDes").val(data['EngineerDes']);
	$("#engineerCity").val(data['engineerCity']);
	$("#hiddenEngineerNum").val(EngineerNum);
	var outdoorChecks = $("#outerDoorTable input[type='checkbox'][class='outdoorcheckrow']");
	var indoorChecks = $("#innerDoorTable input[type='checkbox'][class='indoorcheckrow']");
	var indoorCheckCount = 0;
	var outdoorCheckCount = 0;
	 for(var i = 0; i < dataArray.length;i++)
	 {
		if(dataArray[i]['EnvironmentType'] == '室外')
		{
			$("#hiddenOutdoorEnvironmentNum").val(dataArray[i]['EnvironmentNum']);
			for(var j = 0 ; j < outdoorChecks.length; j ++)
			{
				if(dataArray[i]['ProjectNam'] == outdoorChecks[j].value)
				{
					outdoorChecks[j].checked = true;
					outdoorCheckCount++;
				}
			}
		}
		else if(dataArray[i]['EnvironmentType'] == '室内')
		{
			$("#hiddenIndoorEnvironmentNum").val(dataArray[i]['EnvironmentNum']);
			
			for(var k = 0 ;k < indoorChecks.length; k ++)
			{
				if(dataArray[i]['ProjectNam'] == indoorChecks[k].value)
				{
					indoorChecks[k].checked = true;
					indoorCheckCount++;
				}
			}
		}
	}
	 
	if(indoorCheckCount == indoorChecks.length)
	{
		$(".indoorcheckall").each(function(){
			this.checked = true;
		});
	}
	
	if(outdoorCheckCount == outdoorChecks.length)
	{
		$(".outdoorcheckall").each(function(){
			this.checked = true;
		});
	}
}

function assgininoroutdoorForm(row)
{
	$("#fm #inoroutProjectNum").val(row['ProjectNum']);
	$("#fm #inoroutProjectNam").val(row['ProjectNam']);
	$("#fm #inoroutEnvironmentType").val(row['EnvironmentType']);
	$("#fm #inoroutProjectDes").val(row['ProjectDes']);
	var selectEnvironmentNam = $("#inoroutEnvironmentNam option");
	for(var i = 0 ;i < selectEnvironmentNam.length; i ++)
	{
		if(selectEnvironmentNam[i].text == row['EnvironmentNam'])
		{
			selectEnvironmentNam[i].selected = "selected";
		}
	}
}

function assginEnvironmentNameSelect()
{
	var EngineerNum = $("#hiddenEngineerNum").val();
	var environmentNameSelectArray = new Array();
	var selectStr = "";
	var selectSql = "select EnvironmentNum,EnvironmentNam from environment where EngineerNum = "+EngineerNum;
	var stmt = db.prepare(selectSql);
	while(stmt.step()) 
	{ 
		var data = stmt.getAsObject();
		environmentNameSelectArray.push(data);
    }
	for(var i = 0; i < environmentNameSelectArray.length; i ++)
	{
		selectStr += "<option value='"+environmentNameSelectArray[i]['EnvironmentNum']+"'>"+environmentNameSelectArray[i]['EnvironmentNam']+"</option>";
	}
	
	return selectStr;
}

function updateInorOutdoorEnvironment()
{
	var EnvironmentNum = $("#EnvironmentNum").val();
	var EnvironmentNam = $("#EnvironmentNam").val();
	var Position = $("#Position").val();
	var EnvironmentGen = $("#EnvironmentGen").val();
	//alert(EngineerNum);
	if(EnvironmentNum != null && EnvironmentNum != undefined)
	{
		var updateSql = "update environment set EnvironmentNam = '"+EnvironmentNam+"'," +
						"Position = '"+Position+"',EnvironmentGen = '"+EnvironmentGen+"' " +
						"where EnvironmentNum = "+EnvironmentNum;
		utilSql(updateSql);
		alert("编辑成功！");
	}
}

function updateEvaluationProject()
{
	var ProjectNam = $("#evaluationProjectNam").val();
	var ProjectDes = $("#evaluationProjectDes").val();
	var ProjectNum = $("#ProjectNum").val();
	if(ProjectNum != null && ProjectNum != undefined)
	{
		var updateSql = "update evaluationproject set ProjectNam = '"+ProjectNam+"'," +
						"ProjectDes = '"+ProjectDes+"' where ProjectNum = "+ProjectNum;
		utilSql(updateSql);
		
		if(evaluationCriterion!=null)
		{
			updateAllSamplingPointPollutionLimit(evaluationCriterion,ProjectNum);
		}
		alert("编辑成功！");
	}
}

function showSaveOrEditButton()
{
	var isexist = $("#hiddenEngineerNum").val();
	if (isexist == null || isexist == undefined || isexist == "") {
		$("#addProjectBtn").css('display', 'block');
		$("#editProjectBtn").css('display', 'none');
	} else {
		$("#addProjectBtn").css('display', 'none');
		$("#editProjectBtn").css('display', 'block');
	}

}