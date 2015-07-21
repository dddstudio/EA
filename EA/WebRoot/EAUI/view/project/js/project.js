$(function(){
	//alert("test3");
	obj={
			editRow : undefined,
			add : function (){
				$('#save').show();
				if (this.editRow == undefined) {
					//添加一行 
					$('#myTable').datagrid('insertRow', {
						index : 0,
						row : { },
					});
					
					//将第一行设置为可编辑状态
					$('#myTable').datagrid('beginEdit', 0);
					
					this.editRow = 0;
				}
			},
			
			save : function () {
				//这两句不应该放这里，应该是保存成功后，再执行
				//$('#save').hide();
				//this.editRow = false;
				//将第一行设置为结束编辑状态
				$('#myTable').datagrid('endEdit', this.editRow);
			},
	
			edit : function () {
				var rows = $('#myTable').datagrid('getSelections');
				if (rows.length == 1) {
					if (this.editRow != undefined) {
						$('#myTable').datagrid('endEdit', this.editRow);
					}
				
					if (this.editRow == undefined) {
						var index = $('#myTable').datagrid('getRowIndex', rows[0]);
						$('#save').show();
						$('#myTable').datagrid('beginEdit', index);
						this.editRow = index;
						$('#myTable').datagrid('unselectRow', index);
					}
				} else {
					$.messager.alert('警告', '修改必须或只能选择一行！', 'warning');
				}
			},
			
			remove : function () {
				var rows = $('#myTable').datagrid('getSelections');
				if (rows.length > 0) {
					$.messager.confirm('确定操作', '您正在要删除所选的记录吗？', function (flag) {
						if (flag) {
							var ids = [];
							for (var i = 0; i < rows.length; i ++) {
								ids.push(rows[i].id);
							}
							console.log(ids.join(','));
						}
					});
				} else {
					$.messager.alert('提示', '请选择要删除的记录！', 'info');
				}
			},
			
	};
	
	$('#myTable').datagrid({
		rownumbers:false,
		fitColumns:true,
		pagination:true,
		checkbox:true,
		toolbar:'#tb',
		height:200,
		
		onAfterEdit:function(rowIndex,rowData,changes){
			//alert("保存成功");
			$('#save').hide();
			obj.editRow = undefined;
		//	console.log(rowData);
			alert("保存成功");
		},
		
		onDblClickRow:function(rowIndex,rowData){
			if (obj.editRow != undefined) {
				$('#myTable').datagrid('endEdit', obj.editRow);
			}
		
			if (obj.editRow == undefined) {
				$('#save').show();
				$('#myTable').datagrid('beginEdit', rowIndex);
				obj.editRow = rowIndex;
			}
		},
		
		columns:[[       
			{   field:'projectNam',
				title:'项目名称',
				width:100,
				align:"center",
				editor:{
				type:'text',
				options:{
					required:true
				},
			},
		},          
			{
			   field:'standard',
			    title:'参考标准',
			    width:100, 
			    align:"center",
				editor:{
				type:'text',
				options:{
					required:true
				},
			},
		},          
			
		]],
		
	});
	
	   
         $('#tt').tabs({
             onContextMenu:function(e, title,index){
                 e.preventDefault();
                 if(index==0){
                     $('#mm').menu('show', {
                         left: e.pageX,
                         top: e.pageY
                     });
                 }
             }
         });

				$('.checkallOut','.checkoutIn').bind('click', function() {
					if(!$(this)[0].checked) {
						$('.checkrow').prop('checked', false);
					} else {
						$('.checkrow').prop('checked', true);		
					}
				});

				$('.checkrow').bind('click', function() {
					if($('.checkrow:checked').length === $('.checkrow').length){
						$('.checkall').prop('checked', true);
					} else {
						$('.checkall').prop('checked', false);
					}
				});
				
				$('#mm').menu({
					onClick:function(item){
					if("new"==item.name){
							$('#newMenu').dialog({
								title:'新建评价工程',
								width:800,
								height:500,
								resizable:true,
								closed:false,
							//	href:'project.html'
							});
						}
					else if("open"== item.name){
						$('#openMenu').dialog({
							title:'打开评价工程',
							width:500,
							height:300,
							resizable:true,
							closed:false,
							href:'open.html'
						});
					}
					
					}
				});
				
			/*	$('#edit').onclick(function(){
					 var $table = $('#table1');
			           // var tr = "<tr> <td></td><td></td<td></td> </tr>";
			            $table.append(tr);
				});*/
			
});