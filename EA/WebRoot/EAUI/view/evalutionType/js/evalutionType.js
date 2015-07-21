function evalutionTypeLoad(){
	evalutionTypeObj={
			editRow : undefined,
			evalutionTypeAdd : function (){
				$('#addEvalutionTypeBtn').dialog('open').dialog('setTitle','新增评价类别');
				$('#evalutionTypefm').form('clear');
				$('#evalutionType_save').linkbutton('enable');
			},
			
			evalutionTypeSave : function ()
			    {	
				if($("#evalutionTypeNum").val()==''||$("#evalutionTypeNum").val()==null){
				var evalutionTypeName = $("#evalutionTypeName").val();
				var EnvironmentType = $("#EnvironmentType  option:selected").text();;//这个命名不解释
				var remark = $("#evalutionTypeRemark").val();
				if(evalutionTypeName==""){
					alert('请输入评价类别名');
					return;
				}
				if(EnvironmentType==""){
					alert('请选择环境类型');
					return;
				}
				var sql = "insert into evalutionType (evalutionTypeName,EnvironmentType,remark) " +
				"values('"+evalutionTypeName+"','"+EnvironmentType+"','"+remark+"')";
				
				 db.run(sql);
				 
				 var data = db.export();
				 var buffer = new Buffer(data);
				 fs.writeFileSync(dbPath, buffer);
				}else
				{
			    	var evalutionTypeNum= $("#evalutionTypeNum").val();
			    	
		            var evalutionTypeName= $('#evalutionTypeName').val();
					var EnvironmentType= $('#EnvironmentType').val();
					var remark=$('#evalutionTypeRemark').val();
					var datavalueString="{':evalutionTypeNum':'"+evalutionTypeNum+"',':evalutionTypeName':'"+evalutionTypeName+"', ':EnvironmentType':'"+EnvironmentType+"', ':remark':'"+remark+"'}";
					var datavalue=eval('('+datavalueString+')');
				    db.run("UPDATE evalutionType SET evalutionTypeName=:evalutionTypeName, EnvironmentType=:EnvironmentType,EnvironmentType=:EnvironmentType,remark=:remark WHERE evalutionTypeNum =:evalutionTypeNum",datavalue);
			     	
			     	var data = db.export();
					var buffer = new Buffer(data);
					fs.writeFileSync(dbPath, buffer);
			    		 
				}
				 getevaluationStandardListLength();
				 $('#addEvalutionTypeBtn').dialog('close');
			
			},
	
			evalutionTypeEdit : function ()
			   {
				$('#addEvalutionTypeBtn').dialog('open').dialog('setTitle','修改评价类别');
				
				var row = $('#evalutionTypeTable').datagrid('getSelected');
				if(row==null){
					  $.messager.alert('提示:', '编辑前请选择一行', 'info');
					  $('#addEvalutionTypeBtn').dialog('close');
					  return;
				}
				
				var stmt = db.prepare("SELECT * FROM evalutionType where evalutionTypeNum="+row.evalutionTypeNum+"");
				while(stmt.step()) 
				{ 
					var row = stmt.getAsObject();
					$("#evalutionTypeNum").val(row['evalutionTypeNum']);
					$("#evalutionTypeName").val(row['evalutionTypeName']);
					$("#EnvironmentType").val(row['EnvironmentType']);
					$('#evalutionTypeRemark').val(row['remark']);
					$('#evalutionType_save').linkbutton('enable');
			   }
				
				 stmt.free();
				
			},
				
			evalutionTypeRemove : function () {
				var rows = $('#evalutionTypeTable').datagrid('getSelected');
				
				if(rows==null){
					  $.messager.alert('提示:', '请选择一行', 'info');
					  
					  return;
					 
				}
			
			    $.messager.confirm('', '确定删除吗?', function (flag) {
						if (flag) {
							var sql = "delete from evalutionType where evalutionTypeNum ="+rows.evalutionTypeNum+""
							db.run(sql);
							var data = db.export();
							var buffer = new Buffer(data);
							fs.writeFileSync(dbPath, buffer);
						}else{
							
						}
						getevaluationStandardListLength();
						$('#evalutionTypeTable').datagrid('reload'); 
					});
				
			}
				
	  };
		
		
		$('#evalutionTypeTable').datagrid({
			rownumbers:false,
			fitColumns:true,
			pagination:true,
			pageList : [10,20,50,100,200,500,1000], 
			height:450,
			toolbar:'#evalutionTypetb',
			columns:[[       
			    {field:'ck',checkbox:true},
				{field:'evalutionTypeNum',title:'评价类别编号',width:80,align:"center",hidden:true},          
				{field:'evalutionTypeName',title:'评价类别名称',width:80, align:"center"},          
				{field:'EnvironmentType',title:'环境类型',width:80, align:"center"},      
				{field:'remark',title:'备注',width:80, align:"center",}
			]],
		});
		
		$('#evalutionTypeTable').datagrid('getPager').pagination({   
			   
			displayMsg:'当前显示从 [{from}] 到 [{to}] 共[{total}]条记录',   
		    
			onSelectPage : function(pPageIndex, pPageSize) {   
				getEvalutionTypeListPagination(pPageIndex,pPageSize);
		          
		    }   
		}); 
		
		 //查询数据总条数
		 var sql='select count(*) as count from evalutionType';
		 var stmt = db.prepare(sql);
		
		 while(stmt.step()) 
		{ 
		 var row = stmt.getAsObject();
		
		   rowsize=row['count'];
		 }
		// getEvalutionTypeList();
	 getevaluationStandardListLength();
	 
	 //实现分页查询
	 function getevaluationStandardListLength(){
		 var pager = $("#evalutionTypeTable").datagrid('getPager');
		 $(pager).pagination({total:rowsize});
		 var opts = $("#evalutionTypeTable").datagrid('options');
		 getEvalutionTypeListPagination(opts.pageNumber,opts.pageSize);
	 }

}
function getEvalutionTypeList(){
	var evalutionTypeList = new Array();
	var stmt = db.prepare("SELECT * FROM evalutionType");
	while(stmt.step()) 
	{ 
		var row = stmt.getAsObject();
		var remark = row['remark']==null?'无':row['remark'];
		var evalutionTypeListString="{evalutionTypeNum:"+row['evalutionTypeNum']+",evalutionTypeName:'"+row['evalutionTypeName']+
		"',EnvironmentType:'"+row['EnvironmentType']+"',remark:'"+remark+"'}";
		
		var referenceStandard=eval('('+evalutionTypeListString+')');
	
		evalutionTypeList.push(referenceStandard);
   }
	
	 $('#evalutionTypeTable').datagrid('loadData',evalutionTypeList);
	 
	 stmt.free();

}

//查询数据并展示
function getEvalutionTypeListPagination(pageNumber,pageSize){
		var evalutionTypeList = new Array();
		var sql = "SELECT * FROM evalutionType limit "+ pageSize+" offset "+ pageSize*(pageNumber-1);
		var stmt = db.prepare(sql);
		while(stmt.step()) 
		{ 	
			var row = stmt.getAsObject();
			var remark = row['remark']==null?'无':row['remark'];
			var evalutionTypeListString="{evalutionTypeNum:"+row['evalutionTypeNum']+",evalutionTypeName:'"+row['evalutionTypeName']+
			"',EnvironmentType:'"+row['EnvironmentType']+"',remark:'"+remark+"'}";
			
			var referenceStandard=eval('('+evalutionTypeListString+')');
		
			evalutionTypeList.push(referenceStandard);
	   }
		var evaluationStandardesData = {};
		evaluationStandardesData.total=rowsize;//显示总条数
		evaluationStandardesData.rows = evalutionTypeList;
		
		 $('#evalutionTypeTable').datagrid('loadData',evaluationStandardesData);
		 
		 stmt.free();
	
}