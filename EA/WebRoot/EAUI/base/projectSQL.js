$(function(){
	//select * from referencesStandard;
	$('#save').bind('click',function(){
		   var EngineerNum = document.getElementById("EngineerNum").value;
		   alert(EngineerNum);
	       var EngineerNam = document.getElementById("EngineerNam").value;
		   alert(EngineerNam);
	       var EngineerDes =document.getElementById("EngineerDes").value;
		   alert(EngineerDes);
	       var sqlstr = "INSERT INTO evaluationEngineer (EngineerNum, EngineerNam,EngineerDes) values ("+EngineerNum+",'"+EngineerNam+"','"+EngineerDes+"')";
	       db.run(sqlstr);
		   
	       var data = db.export();
		   var buffer = new Buffer(data);
		   fs.writeFileSync(dbPath, buffer);
		   
		   alert("±£´æ³É¹¦");
	});
	
	$('#cancle').bind('click',function(){
		  $('#EngineerNam').val("");
		  $('#EngineerNum').val("");
		  $('#EngineerDes').val("");
	});
});