var pollutionindesId; 
var pollutionIndicatorsLoad=function() {
	$('#pollutionoutdoorTable').datagrid({
		rownumbers : true,
		fitColumns : true,
		pagination : true,
		pageList : [ 10, 20, 50, 100, 200, 500, 1000 ],
		singleSelect : true,
		toolbar : '#pollutiontb1',
		height : 450,

		columns : [ [ {
			field : 'evalutionTypeNam',
			title : '评价类别',
			width : 100,
			align : "center",

		}, {
			field : 'IndicatorsNam',
			title : '指标名称',
			width : 100,
			align : "center",

		}, {
			field : 'PollutionLimit',
			title : '污染限值',
			width : 100,
			align : "center",

		},{
			field : 'IndicatorsUnit',
			title : '单位',
			width : 100,
			align : "center",

		}, {
			field : 'IndicatorsDes',
			title : '指标描述',
			width : 100,
			align : "center",

		}, {
			field : 'evalutionTypeNum',
			title : '评价类别编号',
			width : 100,
			hidden : true,
			align : "center",

		}, {
			field : 'IndicatorsNum',
			title : '指标编号',
			width : 100,
			hidden : true,
			align : "center",

		} ] ],

	});
	$('#pollutionoutdoorTable').datagrid('getPager').pagination({

		displayMsg : '当前显示从 [{from}] 到 [{to}] 共[{total}]条记录',

		onSelectPage : function(pPageIndex, pPageSize) {
		var wheresql = "where "+$('#pollutionserachbox').searchbox('getName')+" like '%"+$('#pollutionserachbox').searchbox('getValue')+"%' ";

		loadPollutionList(pPageIndex,pPageSize,wheresql,pollutiontotal);
		}
	});

	$('#pollutionserachbox').searchbox({
		
		menu:'#pollutionserachboxmenu',
		width: 400,
		prompt:'请输入查询的值',
		searcher: function(value,name){
			var wheresql = "where "+name+" like '%"+value+"%' ";
			ispollutionSearch='true';
			pollutionCount(wheresql);
		}
	});
	var pollutiontotal;
	var ispollutionSearch='false';
	pollutionCount('');
	
	function pollutionCount(wheresql)
	{
		var sql = 'select count(*) as count from pollutionIndicators  left join evalutionType on pollutionIndicators.evalutionTypeNum=evalutionType.evalutionTypeNum ' +wheresql;
		var stmt = db.prepare(sql);
		var pollutionrowsize = 0;
		while (stmt.step()) {
			var row = stmt.getAsObject();

			pollutionrowsize = row['count'];
		}
		pollutiontotal = pollutionrowsize;
		pollutionindesId = pollutionrowsize;
		getpollutionListLength(pollutionrowsize);
	}
	function getpollutionListLength(pgpollutionrowsize) {
		$('#pollutionoutdoorTable').datagrid('getPager').pagination({
			total : pgpollutionrowsize,
		});
		var opts = $("#pollutionoutdoorTable").datagrid('options');
		loadPollutionList(opts.pageNumber, opts.pageSize,"",pgpollutionrowsize);
	}


	function loadPollutionList(pageNumber, pageSize,wheresql,pgpollutionrowsize) {
		var myPollutionList = new Array();
		var sql = 'select pollutionIndicators.*,evalutionTypeName from pollutionIndicators left join evalutionType on pollutionIndicators.evalutionTypeNum=evalutionType.evalutionTypeNum '+wheresql+' limit '
				+ pageSize + ' offset ' + pageSize * (pageNumber - 1);
		var stmtr = db.prepare(sql);
		while (stmtr.step()) {
			var datas = stmtr.getAsObject();
		
			var pollutionObjStr = {'evalutionTypeNam':datas['evalutionTypeName'],
								'IndicatorsNam':datas['IndicatorsNam'],
								'PollutionLimit':datas['PollutionLimit'],
								'IndicatorsUnit':datas['IndicatorsUnit'],
								'IndicatorsDes':datas['IndicatorsDes'],
								'evalutionTypeNum':datas['evalutionTypeNum'],
								'IndicatorsNum':datas['IndicatorsNum']};
			

			myPollutionList.push(pollutionObjStr);
		}

		var myPollutionData = {};
		myPollutionData.total = pgpollutionrowsize;

		myPollutionData.rows = myPollutionList;
		$('#pollutionoutdoorTable').datagrid('loadData', myPollutionData);
		stmtr.free();
		if(ispollutionSearch.indexOf('true') == 0){
			ispollutionSearch='false';
			$('#pollutionoutdoorTable').datagrid('getPager').pagination('select', 1);


		}

		$.extend($.messager.defaults, {
			ok : "确定",
			cancel : "取消"
		});
	}
};

	
	pollutionobj =
	{
		pollutionadd : function()
		{
			$('#pollutiondlg').dialog('open').dialog('setTitle', '新增指标信息');
			$('#pollutionfm').form('clear');
			$('#pollutiondlg_save').linkbutton('enable');
			$('#pollutiondlg_edit').linkbutton('disable');
			$('#pollutiondlg_edit').hide();
			$('#pollutiondlg_save').show();
			
			pollutionobj.addOptionToEvalutionTypeNam();
		},
		pollutionsave : function()
		{
			
			indicators = {};
			indicators.evalutionTypeNam = $("#pollutionevalutionTypeNam").val();
			var pjname = $("#pollutionevalutionTypeNam").find("option:selected").text();		
			indicators.IndicatorsNam = $("#pollutionIndicatorsNam").val();		
			indicators.PollutionLimit = $("#pollutionPollutionLimit").numberbox('getValue');
			indicators.IndicatorsUnit = $("#pollutionIndicatorsUnit").val();	
			indicators.IndicatorsDes = $("#pollutionIndicatorsDes").textbox('getValue');
			if(indicators.PollutionLimit == null || indicators.PollutionLimit == "" || indicators.PollutionLimit == undefined){
				indicators.PollutionLimit = 0.0;
			}
			$('#pollutionfm').form('submit',
			{
				onSubmit : function()
				{
					return $(this).form('validate');
				},
				success : function()
				{
					var sql = "insert into pollutionIndicators (evalutionTypeNum,IndicatorsNam,PollutionLimit,IndicatorsUnit,IndicatorsDes) VALUES ("+ indicators.evalutionTypeNam+ ", '"+ indicators.IndicatorsNam + "',"+ indicators.PollutionLimit + ",'"+indicators.IndicatorsUnit+ "','"+indicators.IndicatorsDes+ "')";
									
					db.run(sql);
					var data = db.export();
					var buffer = new Buffer(data);
					fs.writeFileSync(dbPath, buffer);
					
					var addsql = "select IndicatorsNum from pollutionIndicators where IndicatorsNum >"+pollutionindesId+" and  IndicatorsNam = '"+indicators.IndicatorsNam+"'";
					var gg = db.prepare(addsql);
					var indNum=111110;
					var datas;
					while (gg.step()) {
						datas = gg.getAsObject();
						indNum = datas['IndicatorsNum'];
					}
					$('#pollutiondlg').dialog('close');

					$('#pollutionoutdoorTable').datagrid('insertRow',
					{
					index : 0,
					row : {
							evalutionTypeNam : pjname,
							IndicatorsNam : indicators.IndicatorsNam,
							PollutionLimit : indicators.PollutionLimit,
							IndicatorsUnit: indicators.IndicatorsUnit,
							IndicatorsDes : indicators.IndicatorsDes,
							IndicatorsNum: indNum
						}
					});
					pollutionindesId++;
					$('#pollutionoutdoorTable').datagrid('reload');
				}
			});
		},

		pollutionedit : function()
		{

			var row = $('#pollutionoutdoorTable').datagrid('getSelected');

			pollutionobj.addOptionToEvalutionTypeNam();

			if (row)
			{
				$('#pollutiondlg').dialog('open').dialog('setTitle', '编辑指标信息');

				$("#pollutionevalutionTypeNam").val(row.evalutionTypeNum);

				$("#pollutionIndicatorsDes").textbox('setValue', row.IndicatorsDes);
				$("#pollutionPollutionLimit").numberbox('setValue', row.PollutionLimit);
				$("#pollutionIndicatorsUnit").textbox('setValue',row.IndicatorsUnit);
				$("#pollutionIndicatorsNam").val(row.IndicatorsNam);

				$('#pollutiondlg_edit').linkbutton('enable');
				$('#pollutiondlg_save').linkbutton('disable');
				$('#pollutiondlg_edit').show();
				$('#pollutiondlg_save').hide();
			}else{
				$.messager.alert('小提示！','请选择一行！');
			}

		},
		pollutioneditsave : function()
		{
			var row = $('#pollutionoutdoorTable').datagrid('getSelected');
			var rowIndex = $('#pollutionoutdoorTable').datagrid('getRowIndex',row);
			var indicators = new Object();
			indicators.evalutionTypeNum = $("#pollutionevalutionTypeNam").val();
			var pjname = $("#pollutionevalutionTypeNam").find("option:selected").text();
			indicators.IndicatorsNam = $("#pollutionIndicatorsNam").val();
			indicators.PollutionLimit = $("#pollutionPollutionLimit").numberbox('getValue');
			indicators.IndicatorsUnit = $("#pollutionIndicatorsUnit").val();
			var itd = $("#pollutionIndicatorsDes").textbox('getValue');
			itd = itd.replace("\n"," ");
			indicators.IndicatorsDes = itd;
			$('#pollutionfm').form('submit',
			{
				onSubmit : function()
				{
					return $(this).form('validate');
				},
				success : function()
				{
					var IndicatorsNum = row.IndicatorsNum;
					var datavalue = {':IndicatorsNam':indicators.IndicatorsNam,
							':PollutionLimit':indicators.PollutionLimit,
							':IndicatorsUnit':indicators.IndicatorsUnit,
							':IndicatorsDes':indicators.IndicatorsDes,
							':evalutionTypeNum':indicators.evalutionTypeNum,
							':IndicatorsNum':IndicatorsNum};
					
					db.run("UPDATE pollutionIndicators SET IndicatorsNam=:IndicatorsNam, " +
							"PollutionLimit=:PollutionLimit,IndicatorsUnit=:IndicatorsUnit,IndicatorsDes=:IndicatorsDes,evalutionTypeNum=:evalutionTypeNum " +
							"WHERE IndicatorsNum=:IndicatorsNum ",datavalue);
	
					var data = db.export();
					var buffer = new Buffer(data);
					fs.writeFileSync(dbPath, buffer);
	
					$('#pollutiondlg').dialog('close');
					$('#pollutionoutdoorTable').datagrid('updateRow',
					{
						index : rowIndex, 
						row : {
								evalutionTypeNam : pjname,
								IndicatorsNam : indicators.IndicatorsNam,
								PollutionLimit : indicators.PollutionLimit,
								IndicatorsUnit:indicators.IndicatorsUnit,
								IndicatorsDes : indicators.IndicatorsDes
							  }
					});

					$('#pollutionoutdoorTable').datagrid('reload');
				}
		});
		},
		addOptionToEvalutionTypeNam :function ()
		{
			var sql = "select * from evalutionType";
			var stmta = db.prepare(sql);
			var str = null;
			while (stmta.step())
			{
				var row = stmta.getAsObject();
				str += '<option style="width:175px" value="'
						+ row['evalutionTypeNum'] + '">'
						+ row['evalutionTypeName'] + '</option>';
			}
			$('#pollutionevalutionTypeNam').html(str);
		}
	,
	pollutiondeleterow : function()
	{
		var rows = $('#pollutionoutdoorTable').datagrid('getSelected');
		if (rows)
		{
			$.messager.confirm('删除数据提示','你这的要删除这行数据吗?',function(r)
			{
				if (r)
				{
					var rowIndex = $('#pollutionoutdoorTable').datagrid('getRowIndex', rows);
					var delsql = "delete from pollutionIndicators where IndicatorsNum="+ rows.IndicatorsNum;
					db.run(delsql);
					var data = db.export();
					var buffer = new Buffer(data);
					fs.writeFileSync(dbPath, buffer);
					pollutionindesId--;
					$('#pollutionoutdoorTable').datagrid('deleteRow', rowIndex);
					$('#pollutionoutdoorTable').datagrid('reload');
				}
			});
		}else{
			$.messager.alert('小提示！','请选择一行！');
		}
	}
}