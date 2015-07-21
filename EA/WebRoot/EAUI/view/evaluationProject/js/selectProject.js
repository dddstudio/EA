function selectProjectLoad()
{
	var stmt = db.prepare("select * from evaluationengineer");
	var projects = new Array();
	while(stmt.step()) 
	{ 
		var data = stmt.getAsObject();
		var project = {code:data['EngineerNum'],EngineerCode:data['EngineerCode'],EngineerNam:
			data['EngineerNam'],EngineerDes:data['EngineerDes']};
		projects.push(project);
    }
	
	$('#selectProjectDg').datagrid({
		data:projects,
		columns:[[
		    {field:'code',hidden:true},
	        {field:'EngineerCode',title:'工程编码',width:100},
	        {field:'EngineerNam',title:'工程名称',width:100},
	        {field:'EngineerDes',title:'工程描述',width:298}
	    ]],
	    singleSelect: true
	});
}