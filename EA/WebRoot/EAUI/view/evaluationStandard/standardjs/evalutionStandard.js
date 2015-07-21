//仅供evalutionStandard.html

function evaluationStandardLoad(){
	
	$('#evaluationStandardTable').datagrid({
		rownumbers:false,
		fitColumns:true,
		pagination:true,
		pageList : [10,20,50,100,200,500,1000], 
		toolbar:'#evaluationStandardtb1',
		height:450,
		singleSelect:true,
		
		
		columns:[[
		    {   field:'ck',checkbox:true},
		    {   field:'evalutionTypeName',title:'评价类型',width:100,align:"center"},
			{   field:'StandardNum',title:'标准编号',width:100,hidden:true,align:"center"},
			{   field:'StandardNam',title:'标准名称',width:100,align:"center"},           
			{   field:'FileURL',title:'文件链接',width:100, align:"center"},          
			{   field:'EnvironmentType',title:'环境类型',width:100, align:"center"}, 
			{   field:'evalutionTypeNum',title:'评价类型编号',width:100,hidden:true,align:"center"},     
			{   field:'remark',title:'备注', width:100,  align:"center"} ,
			{   field:'operateCode',title:'操作',width:80,align:'center',formatter:formatOperate},
		
		]],
		
	});
	$('#evaluationStandardTable').datagrid('getPager').pagination({   
		   
		displayMsg:'当前显示从 [{from}] 到 [{to}] 共[{total}]条记录',   
	    
		onSelectPage : function(pPageIndex, pPageSize) {   
				       
	    	getevaluationStandardList(pPageIndex,pPageSize);
	          
	    }   
	});  
	
	 function formatOperate(val,row,index){
			 return '<a href="'+ row['FileURL']+'" target="_blank""">打开</a>';  
			}
	 
	    //查询数据总条数
		 var sql='select count(*) as count from referenceStandard';
		 var stmt = db.prepare(sql);
		
		 while(stmt.step()) 
		{ 
		 var row = stmt.getAsObject();
		
		   rowsize=row['count'];
		 }
		 
	 getevaluationStandardListLength();
	 
	 //实现分页查询
	 function getevaluationStandardListLength(){
		 var pager = $("#evaluationStandardTable").datagrid('getPager');
		 $(pager).pagination({total:rowsize});
		 var opts = $("#evaluationStandardTable").datagrid('options');
		 getevaluationStandardList(opts.pageNumber,opts.pageSize);
		
	 }
	 function getevaluationStandardList(pageNumber,pageSize){
			var evaluationStandardList=new Array();
			var selectSql = "SELECT referenceStandard.*,evalutionTypeName FROM referenceStandard " +
					"left join evalutionType on referenceStandard .evalutionTypenum=evalutionType.evalutionTypenum limit "+ pageSize+" offset "+ pageSize*(pageNumber-1);
			 
			var stmt = db.prepare(selectSql);
			while(stmt.step()) 
			{ 
				var row = stmt.getAsObject();
				var standardString="{evalutionTypeName:'"+row['evalutionTypeName']+"',StandardNum:"+row['StandardNum']+",StandardNam:'"+row['StandardNam']+
				"',FileURL:'"+row['FileURL']+"',EnvironmentType:'"+row['EnvironmentType']+"',evalutionTypeNum:"+row['evalutionTypeNum']+",remark:'"+row['remark']+"'}";
				//alert(standardString);
				
				var referenceStandard=eval('('+standardString+')');
				evaluationStandardList.push(referenceStandard);
				
				
		   }
			var evaluationStandardesData = {};
			evaluationStandardesData.total=rowsize;//显示总条数
			evaluationStandardesData.rows = evaluationStandardList;
			 $('#evaluationStandardTable').datagrid('loadData',evaluationStandardesData);
		    stmt.free();
	 }
	 evaluationStandardObj={
			
    		evaluationStandardAdd : function (){
				
				$('#evaluationStandarddlg').dialog('open').dialog('setTitle','参考标准信息');
				$('#evaluationStandardfm').form('clear');
				$("#evalutionType").empty();
				selectEvalutionTypeList();
				$('#evaluationStandard_save').linkbutton('enable');
				
			},
			evaluationStandardDel : function (){
				
            	
				var row = $('#evaluationStandardTable').datagrid('getSelected');
				if(row==null){
					  $.messager.alert('提示:', '请选择一行', 'info');
					  
					  return;
					 
				}
				 $.messager.confirm('确认','确认删除?',function(ok){  
		                if(ok){  
		                	var rowIndex=$('#evaluationStandardTable').datagrid('getRowIndex',$('#evaluationStandardTable').datagrid('getSelected')); 
			    		  
		                   $('#evaluationStandardTable').datagrid('deleteRow',rowIndex); 
		                   var delSql='delete from referenceStandard where StandardNum='+row['StandardNum'];
			               db.run(delSql);
			              
			               $.messager.alert('提示:', '删除成功', 'info');
			               
			               var data = db.export();
					 	   var buffer = new Buffer(data);
					 	   fs.writeFileSync(dbPath, buffer);
					 	  getevaluationStandardListLength();
		                }  
		            });
				
			},
			evaluationStandardEdit : function (){
				
				$('#evaluationStandarddlg').dialog('open').dialog('setTitle','编辑参考标准信息');
				var row = $('#evaluationStandardTable').datagrid('getSelected');
				if(row==null){
					  $.messager.alert('提示:', '编辑前请选择一行', 'info');
					  $('#evaluationStandarddlg').dialog('close');
					  return;
					 
				}
				$('#StandardNum').val(row['StandardNum']);
				$('#StandardNam').val(row['StandardNam']);
				$('#fileURL').val(row['FileURL']);
				$('#EnvironmentType').val(row['EnvironmentType']);
				$('#remark').val(row['remark']);
				$("#evalutionType").empty();
				selectEvalutionTypeList();
				$('#evalutionType').val(row['evalutionTypeNum']);
				$('#evaluationStandard_save').linkbutton('enable');
				
			},
			evaluationStandardSave : function () {
				if($('#StandardNum').val()==''||$('#StandardNum').val()==null)
				{
					
					 var insertSql="insert into referenceStandard(StandardNam,fileURL,EnvironmentType,remark,evalutionTypeNum) values('"+ $('#StandardNam').val()+"','"+
				      $('#fileURL').val()+"','"+$('#EnvironmentType').val()+"','"+
				      $('#remark').val()+"',"+
				      $('#evalutionType').val()+")";
			  
			         db.run(insertSql);
			         $.messager.alert('提示:', '添加成功', 'info');
			         var data = db.export();
			 		 var buffer = new Buffer(data);
			 		 fs.writeFileSync(dbPath, buffer);
			    }else
			    {
			    	
			    	var StandardNum= $('#StandardNum').val();
		            var StandardNam= $('#StandardNam').val();
					var FileURL= $('#fileURL').val();
					var EnvironmentType=$('#EnvironmentType').val();
					var remark=$('#remark').val();
					var evalutionTypeNum=$('#evalutionType').val();
					
					var datavalueString="{':StandardNam':'"+StandardNam+"', ':FileURL':'"+FileURL+"',':EnvironmentType':'"+EnvironmentType+"', ':remark':'"+remark+"',':evalutionTypeNum':"+evalutionTypeNum+",':StandardNum':"+StandardNum+"}";
					
					var datavalue=eval('('+datavalueString+')');
				    db.run("UPDATE referenceStandard SET StandardNam=:StandardNam, FileURL=:FileURL,EnvironmentType=:EnvironmentType,remark=:remark,evalutionTypeNum=:evalutionTypeNum WHERE StandardNum =:StandardNum",datavalue);
		           
			     	var data = db.export();
					var buffer = new Buffer(data);
					 fs.writeFileSync(dbPath, buffer);
			    }		 
				
				 $('#evaluationStandarddlg').dialog('close');
				 getevaluationStandardListLength();
            }
		}
   
    
	function selectEvalutionTypeList(){
    	
    	var evaluationTypeHtml='';
    	var stmt = db.prepare("SELECT * FROM evalutionType");
    	while(stmt.step()) 
    	{ 
    		var row = stmt.getAsObject(); 
    		evaluationTypeHtml+='<option style="width:200px" value="'+row['evalutionTypeNum']+'">'+row['evalutionTypeName']+'\t'+row['EnvironmentType']+'</option>';
    	
       }
    	$('#evalutionType').append(evaluationTypeHtml);
    }
}