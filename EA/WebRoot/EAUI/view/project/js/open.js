$(function(){
	//alert("test2");
	$('#engineerList').datagrid({
		rownumbers:false,
		fitColumns:true,
		pagination:true,
		height: 200,
		columns:[[
		  {
			  field:'engineerNum',
			  title:'工程编号',
			  align:"center",
			  width:100
		   }, 
		  
		  {
			  field:'engineerNam',
			  title:'工程名称',
			  align:"center",
			  width:100
		   }   
		 ]]
	});
	
});