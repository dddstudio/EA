//连接sqlite3数据库    
var fs = require('fs');
     var dbPath='';
	 var db='';
   //open the database
	 var filebuffer='';
   
  //读取配置文件
     fs.readFile('need.txt', 'utf8', callback);

  
   
    function callback(err, contents) 
	{
        var str='';
        if (contents !== undefined)
		{
            str += contents;
        }
		
        var urls = str.split(';');
		
		var args='';
		for(var i=0;i<urls.length-1;i++)
		{
		   args=urls[i].split('=');
		  
		   if(args[0].trim()=="DBurl")
		   {
		    dbPath= args[1];
		   }else{
		   //处理其他情况；
		   }
		}
		  //将.sqlite文件转换成数据库
		  filebuffer = fs.readFileSync(dbPath);
          db = new SQL.Database(filebuffer);
       
    }
   