function projectReportGeneration()
{
	var EngineerNum = $("#hiddenEngineerNum").val();
	if (EngineerNum == undefined || EngineerNum == null||EngineerNum=="") {
		return ;
	}
	else{
		$("#templateIdInReport").text($("#engineerCode").val());
		var engiNum = $("#engineerNam").val();
		$("#engineerNamInReport").text(engiNum);
		$("#buildingNumInReport").text(engiNum);
		$("#cityInReport").text($("#engineerCity").val());
		
		var date = new Date();
		var formatdate=date.format("yyyy-MM-dd hh:mm:ss");
		$("#dateForReport").text(formatdate);
		
		var projectNum=getProjectNumByEngineerNum(EngineerNum);
		/*
		 * 室内
		 */
		var isin = false;
		var projectId = projectNum['in_hot'];// 热
		if(projectId!=null)
		{
			isin = true;
			clearChatDivById("chat_div_hot");
			findHotResult("hot_result_table","chat_div_hot",projectId);
//			catulateHotPPDAndPMA("hot_result_table","chat_div_hot",projectId);
		}
		else
		{
			$("#in_hot_result").css("display","none");
		}
		
		projectId = projectNum['in_light'];// 光
		if(projectId!=null)
		{
			isin = true;
			clearChatDivById("chat_div_light");
			findLightResult("light_result_table","chat_div_light",projectId);
//			catulateLightPDL("light_result_table","chat_div_light",projectId);
		}
		else
		{
			$("#in_light_result").css("display","none");
		}
		
		projectId = projectNum['in_sound'];// 声
		if(projectId!=null)
		{
			isin = true;
			clearChatDivById("in_chat_div_sound");
			findSoundResult("in_light_sound_table","in_chat_div_sound",projectId);
//			catulateSoundPDN("in_light_sound_table","in_chat_div_sound",projectId);
		}
		else
		{
			$("#in_sound_result").css("display","none");
		}
		
		projectId = projectNum['in_air'];// 空气
		if(projectId!=null)
		{
			isin = true;
			findInAirResult("light_air_in_table","chat_div_air",projectId);
			//catulateSoundPDN("light_air_in_table","chat_div_air",projectId);
		}
		else
		{
			$("#in_air_result").css("display","none");
		}
		
		if(isin == false)
		{
			$("#in_report").css("display","none");
		}
		
		/*
		 * 室外
		 */
		var isout = false;
		projectId = projectNum['out_air'];// 空气
		
		if(projectId!=null)
		{
			isout = true;
//			catulateAirPiandP(projectId);
			findAirResult('light_air_out_table',projectId);
		}
		else{
			$("#out_air_result").css("display","none");
		}
		
		projectId = projectNum['out_soil'];// 土壤
		if(projectId!=null)
		{
			isout = true;
			catulateSoilPiandP(projectId);
			findSoilResult('light_soil_table',projectId);
		}
		else{
			$("#out_soil_result").css("display","none");
		}
	
		projectId = projectNum['out_water'];//水
		if(projectId!=null)
		{
			isout = true;
			catulateWaterPiandP(projectId);
			findWaterResult('light_water_table',projectId);
		}
		else{
			$("#out_water_result").css("display","none");
		}
		
		if(isout == false)
		{
			$("#out_report").css("display","none");
		}
		
	}
}

function getProjectNumByEngineerNum(EngineerNum)
{
	var stmt =  db.prepare("select ev.projectNum as number,evt.evalutionTypeName as type from "
			+"evaluationproject ev,evalutionType evt where ev.EvalutionTypeNum "
			+"= evt.EvalutionTypeNum and ev.CatulateType=1 and ev.EnvironmentNum in (select EnvironmentNum"
			+" from environment where environment.EngineerNum="+EngineerNum+")");
	var ProjectNum= new Object();
	while (stmt.step()) {
		var row = stmt.getAsObject();
		var number = row['number'];
		var type=getProjectType(row['type']);
		ProjectNum[type]=number;
	}
	
	return ProjectNum;
}

function getProjectType(evalutionType)
{
	var type="";
	//气 土 水 植 光 热 声
	if(evalutionType.indexOf("空气")>=0)
	{
		type="in_air";
	}
	if(evalutionType.indexOf("光")>=0)
	{
		type="in_light";
	}
	if(evalutionType.indexOf("热")>=0)
	{
		type="in_hot";
	}
	if(evalutionType.indexOf("声")>=0)
	{
		type="in_sound";
	}
	if(evalutionType.indexOf("土")>=0)
	{
		type="out_soil";
	}
	if(evalutionType.indexOf("水")>=0)
	{
		type="out_water";
	}
	if(evalutionType.indexOf("大气")>=0)
	{
		type="out_air";
	}

	return type;
}

function createDataGrid1(id,firstColumns,groupColumn,bodyColumns,LastColums,data1)
{
	var coloums66 = new Array();
	
	var coloums1 = new Array();
	coloums1 = coloums1.concat(firstColumns,groupColumn,LastColums);
	coloums66.push(coloums1);
	
	var coloums2 = new Array();
	coloums2 = coloums2.concat(bodyColumns);
	coloums66.push(coloums2);
	
	var options = {};
	options.columns = coloums66;
	options.fitColumns = true;
	options.data = data1;
	alert(data1);
	 $('#'+id).datagrid(options); 
	 $('#'+id).datagrid('reload');  
}

function clearChatDivById(id)
{
	$("#"+id).html("");
}
var act;
function exportReport() {
	act = $("#reportDiv").eq(0);
	act.fileModel = null;
	act.fetchWordFile = function() {
        var e = this;
        return setTimeout(function() {
            return e.$result ? (e.$result.wordExport("评价报告")) : $(window).trigger("convertPreviewFormatForExport", [{type: "dataURL",getNetImage: !0}, function(i, n) {
                    return n.wordExport("评价报告");
                }]);
        }, 1e3);
    };
	act.fetchWordFile();
  }
  
  

//相关代码
//参数说明
$(window).on("convertPreviewFormatForExport", function(e, t, n) {
return $(window).trigger("convertPreview", [t, n])
})

//参数说明
$(window).on("convertPreview", function(e, n, i) {
var r, o;
switch (o = $("body>.preview_pdf_wrapper"), 0 === o.length && (o = $('<div class="preview_export_wrapper"></div>')), o.html(""), r = $('<div class="preview custom_css_preview"></div>').appendTo(o), _previewTarget(r), n.type) {
	case "dataURL":
		return m(r, !!n.getNetImage, function() {
			return i(null, o)
		});
	case "objectURL":
		return _convertImageSrcToObjectURL(r, !!n.getNetImage, function() {
			return i(null, o)
		});
	case "cidAndDataURL":
		return g(r, !!n.getNetImage, function(e, t) {
			return i(null, o, t)
		});
default:
    return i(null, o)
}
})


var m = function(e, t, n) {
        var i, o;
        return i = $("defs"), o = [], e.find("svg").map(function(e, t) {
            var n;
			$(t).removeAttr("xmlns:xlink").removeAttr("xmlns");
            return n = saveSvgAsPng(t, i, "filename.png", 1, function(e) {
                var n;
                return n = "" + CryptoJS.MD5(e) + ".png", $(t).replaceWith($('<img class="svg-image" src="' + e + '" name="' + n + '" />'))
            }), o.push(n)
        }), e.find("#chat_div_hot").map(function(e, t) {
            var n, ri;
			n =  act.find("#"+t.id).data("plot-data");
            return  n ? ri = convertToImage(n) : void 0, $(t).replaceWith(ri)
        })
        , e.find("#chat_div_light").map(function(e, t) {
            var n, ri;
			n = act.find("#"+t.id).data("plot-data");
            return  n ? ri = convertToImage(n) : void 0, $(t).replaceWith(ri)
        })
        , e.find("#in_chat_div_sound").map(function(e, t) {
            var n, ri;
			n = act.find("#"+t.id).data("plot-data");
            return  n ? ri = convertToImage(n) : void 0, $(t).replaceWith(ri)
        })
        , e.find("#chat_div_air").map(function(e, t) {
            var n, ri;
			n = act.find("#"+t.id).data("plot-data");
            return  n ? ri = convertToImage(n) : void 0, $(t).replaceWith(ri)
        })
		, $.when.apply(null, o).done(function() {
            var i;
            return v(e), i = [], e.find("img").map(function(e, n) {
                var o, s, l, c;
				return l = n.src, o = $.Deferred(), 0 === l.indexOf("data:image") ? s = 0 : (/http(s)?:\/\//.test(l)) ? 0 !== l.indexOf(document.location.origin) && t ? (c = setTimeout(function() {
                    return Notifier.showMessage("抓取图片" + l + "超时"), o.resolve()
                }, r.getNetworkResourceTimeout), getCrossOrignDomainResource(n.src, function(e, t) {
                    return clearTimeout(c), c = null, n.src = t, o.resolve()
                }), i.push(o.promise())) : void 0 : (imgToDataURL(l, function(e, t) {
                    return t ? (n.src = t, o.resolve()) : (console.log("pic not found:" + n.src), o.resolve())
                }), i.push(o.promise()))
            }), 
			$.when.apply(null, i).done(function() {
                return e.find("img").map(function(e, t) {
                    var n, i, r, o;
                    return o = t.src, n = $(t), 0 === o.indexOf("data:image") || (r = $.trim(n.attr("name"))) ? void 0 : (i = "" + CryptoJS.MD5(o) + ".png", n.attr("name", i))
                }), "function" == typeof n ? n(e) : void 0
            })
        })
    };
var	v = function(e) {
return e.find("img").map(function(e, t) {
	var n;
	return n = $(t), n.attr("src", n.prop("src"))
})
};
	
function _previewTarget(e, t) {
var n, i, r, o, s, l, u, d, h, f = act;
return null == t && (t = !1), s = 0, 
	r = function(e) {
		var t;
		return t = /^---\n([\s\S]+?)---\n*/.exec(e), t ? (f.meta = a.getMetaData(e), s = $.trim(t[0]).split("\n").length - 1, e.substring($.trim(t[0]).length)) : (f.meta = {}, e)
	},
	n = act.html(), 
//	n = act.mdHtml.render(n, {sourceMap: t,startLine: s}), 
	n = c(this.fileModel, n), act.$tocHtml = $("<div></div>"), i = TOC.generator(n, act.$tocHtml),
//	o = "", act.meta && (h = act.meta.title, h && (o = "<h1>" + h + "</h1>"), act.meta.tags && (u = this.meta.tags.split(","), d = function() {
//	var e, t, n;
//	for (n = [], e = 0, t = u.length; t > e; e++)
//		l = u[e], n.push("<div class='tag blue label'>" + l + "</div>");
//	return n
//	}().join(""), o += "<p>" + d + "</p>")), 
	e.html(i),b(e);
}

b = function(e) {
        return u(e), e.find("code").map(function(e, t) {
            var n, i;
            return n = $(t).text(), i = n.match(/^\s*\${1,2}(.*?)\${1,2}\s*$/), i ? $(t).addClass("language-mathjax inline").text(i[1]).wrap('<span class="inline-mathjax"></span>') : void 0
        }), e.find("pre, .inline-mathjax").map(function(e, t) {
            var n, i, r, o, s, a, l, c, u, h, f, p, g;
            if (s = $(t.childNodes[0]), window.MathJax && s.is(".language-mathjax"))
                return a = s.html(), c = "" + CryptoJS.MD5(a), r = d.get(c), h = s.is(".inline"), u = h ? " style='display:inline-block;margin:0'" : " style='text-align: center;margin: 20px 0;'", g = h ? "span" : "div", l = "", r ? $(t).replaceWith("<" + g + " class='mathjax'" + u + ">" + r + "</" + g + ">") : (l = $("<" + g + " class='mathjax' " + u + ">$#" + a + "#$</" + g + ">")[0], MathJax.Hub.Queue(["Typeset", MathJax.Hub, l]), MathJax.Hub.Queue(function() {
                    var e;
                    return e = $(l).children()[1], $(l).find("script").remove(), d.set(c, l.innerHTML), $(t).replaceWith(l)
                }));
            if (window.flowchart && s.is(".language-flow"))
                try {
                    return a = s.text(), c = "" + CryptoJS.MD5(a), r = d.get(c), n = $('<div class="flow-chart"></div>'), $(t).replaceWith(n), r ? n.html(r) : (o = flowchart.parse(a), o.drawSVG(n[0]), n.find("svg").attr({"xmlns:xlink": "http://www.w3.org/1999/xlink"}), d.set(c, n[0].innerHTML))
                } catch (m) {
                    return console.error(m)
                }
            else if (window.Diagram && s.is(".language-sequence"))
                try {
                    return a = s.text(), c = "" + CryptoJS.MD5(a), r = d.get(c), n = $('<div class="sequence-diagram"></div>'), $(t).replaceWith(n), r ? n.html(r) : (o = Diagram.parse(a), o.drawSVG(n[0], {theme: "simple"}), n.find("svg").attr({"xmlns:xlink": "http://www.w3.org/1999/xlink"}), d.set(c, n[0].innerHTML))
                } catch (m) {
                    return console.error(m)
                }
            else {
                if (!window.$.plot || !s.is(".language-plot"))
                    return hljs.highlightBlock(t);
                try {
                    if (a = s.text(), c = "" + CryptoJS.MD5(a), r = d.get(c), i = $('<div class="plot"></div>'), $(t).replaceWith(i), r)
                        return i.html(r);
                    if (p = JSON.parse(a), p.data && p.options)
                        return f = $.plot(i, p.data, p.options), i.data("plot", f)
                } catch (m) {
                    return console.error(m)
                }
            }
        })
    };

c = function(e, t) {
        var n;
        return n = t.replace(/(<img [^>]*src=['"])([^'"]+)([^>]*>)/gi, function(t, n, i, r) {
            var o, s;
            if (0 === i.indexOf("./")) {
                o = i.substring(2);
                try {
                    o = decodeURI(o)
                } catch (a) {
                    console.error("error fileName" + o)
                }
                s = canonical_uri(o);
				s && (i = "'" === r[0] ? s + "' name='" + o : s + '" name="' + o);
            }
            return n + i + r
        })
    };
	
u = function(e) {
        return e.find("a").map(function(e, t) {
            var n, i, r;
            return n = $(t), r = n.prop("href"), i = document.location.origin + document.location.pathname, 0 !== r.indexOf(i) ? n.attr("target", "_blank") : void 0
        })
    };

getCrossOrignDomainResource = function(e, t) {
var n, i;
return $.get(e,function(n) {
		return n ? t(null, Base64.encode(n)) : t("图片无法抓取", null)
	});
}

function convertToImage(e) {
s = ifunc(e), ri = r(s, "PNG", e.getPlaceholder());
return ri;
}

function ifunc(ep) {
var a = new Object();
a.Canvas = t1;
if (a) {
	n = new a.Canvas("mergedCanvas", ep.getPlaceholder());
	var i = n.context;
	$(e(n)[0]).css({visibility: "hidden","z-index": "-100",position: "absolute"});
	var r = ep.getPlaceholder().find("canvas");
	return r.each(function(e, t) {
		i.drawImage(t, 0, 0)
	}) , n.element;
}
return n;


function t1(t,n){
	var i=n.children("."+t)[0];
	if(null==i&&(i=document.createElement("canvas"),i.className=t,$(e(i)[0]).css({direction:"ltr",position:"absolute",left:0,top:0}).appendTo(n),!i.getContext)){
		if(!window.G_vmlCanvasManager)
			throw Error("Canvas is not available. If you're using IE with a fall-back such as Excanvas, then there's either a mistake in your conditional include, or the page has no DOCTYPE and is rendering in Quirks Mode.");
		i=window.G_vmlCanvasManager.initElement(i) 
	}
	
	this.resize = function(e, t) {
		if (0 >= e || 0 >= t)
			throw Error("Invalid dimensions for plot, width = " + e + ", height = " + t);
		var n = this.element, i = this.context, r = this.pixelRatio;
		this.width != e && (n.width = e * r, n.style.width = e + "px", this.width = e), this.height != t && (n.height = t * r, n.style.height = t + "px", this.height = t), i.restore(), i.save(), i.scale(r, r)
	};
	
	this.element=i;
	var r=this.context=i.getContext("2d"),o=window.devicePixelRatio||1,s=r.webkitBackingStorePixelRatio||r.mozBackingStorePixelRatio||r.msBackingStorePixelRatio||r.oBackingStorePixelRatio||r.backingStorePixelRatio||1;
	this.pixelRatio=o/s;
	this.resize(n.width(),n.height());
	this.textContainer=null;
	this.text={};
	this._textCache={};
}
	
function e(e,t){
	return new rtfninit(e,t)
}
}

function rtfninit(e, t) {
var n, i;
if (!e)
	return this;
if ("string" == typeof e) {
	if (n = "<" === e.charAt(0) && ">" === e.charAt(e.length - 1) && e.length >= 3 ? [null, e, null] : gt.exec(e), !n || !n[1] && t)
		return !t || t.jquery ? (t || ft).find(e) : this.constructor(t).find(e);
	if (n[1]) {
		if (t = t instanceof rt ? t[0] : t, rt.merge(this, rt.parseHTML(n[1], t && t.nodeType ? t.ownerDocument || t : pt, !0)), dt.test(n[1]) && rt.isPlainObject(t))
			for (n in t)
				rt.isFunction(this[n]) ? this[n](t[n]) : this.attr(n, t[n]);
		return this
	}
	if (i = pt.getElementById(n[2]), i && i.parentNode) {
		if (i.id !== n[2])
			return ft.find(e);
		this.length = 1, this[0] = i
	}
	return this.context = pt, this.selector = e, this
}
return e.nodeType ? (this.context = this[0] = e, this.length = 1, this) : isFunction(e) ? (ft.ready !== void 0 ? ft.ready(e) : e(rt)) : (void 0 !== e.selector && (this.selector = e.selector, this.context = e.context), makeArray(e, this))

function isFunction(e) {
	return "function" === typeof e
}

function makeArray(e, t) {
	var i = t || [];
	return null != e && (Object(e) ? merge(i, "string" == typeof e ? [e] : e) : Q.call(i, e)), i
}


function J(e, t) {
	for (var n = 0; mt.length > n; ++n) {
		var i = mt[n];
		if (i.series == e && i.point[0] == t[0] && i.point[1] == t[1])
			return n
	}
	return -1
}

function merge(e, t) {
	for (var n = +t.length, i = 0, r = e.length; n > i; )
		e[r++] = t[i++];
	if (n !== n)
		for (; void 0 !== t[i]; )
			e[r++] = t[i++];
	return e.length = r, e
}
}

function r(n, r, placeholder) {
var s = null;
switch (r.toLowerCase()) {
	case "png":
		s = convertToPNG(n, r);
		break;
	case "bmp":
		s = convertToBMP(n, r);
		break;
	case "jpeg":
		s = convertToJPEG(n, r);
		break;
	default:
}
return s ? ($(s).css({border: placeholder.css("border")}), placeholder.replaceWith($("<div></div>").attr("class", "plot_canvas_image").append($(s)))) : console.log("Oh Sorry, but this browser is not capable of creating image files, please use PRINT SCREEN key instead!"), s;
}

function convertToPNG(e, t, n) {

return h(e, t, n, "png");

function h(n, o, c, d) {
    if ("string" == typeof n && (n = document.getElementById(n)), void 0 == d && (d = "png"), d = r2(d), /bmp/.test(d)) {
		var h = s(e(n, o, c)), f = u(h);
		return i(a(f, "image/bmp"))
	}
	var f = t2(n, d, o, c);
	return i2(f)
}

function r2(e) {
    e = e.toLowerCase().replace(/jpg/i, "jpeg");
    var t = e.match(/png|jpeg|bmp|gif/)[0];
    return "image/" + t
}

function t2(t, n, i, r) {
    return t = e2(t, i, r), t.toDataURL(n)
}

function e2(e) {return e}

function i2(e) {
    var t = document.createElement("img");
    return t.src = e, t
}
}


function canonical_uri(src, base_path) 
{ 
var root_page = /^[^?#]*\//.exec(location.href)[0], 
root_domain = /^\w+\:\/\/\/?[^\/]+/.exec(root_page)[0], 
absolute_regex = /^\w+\:\/\//; 

// is `src` is protocol-relative (begins with // or ///), prepend protocol 
if (/^\/\/\/?/.test(src)) 
{ 
src = location.protocol + src; 
} 
// is `src` page-relative? (not an absolute URL, and not a domain-relative path, beginning with /) 
else if (!absolute_regex.test(src) && src.charAt(0) != "/") 
{ 
// prepend `base_path`, if any 
src = (base_path || "") + src; 
} 

// make sure to return `src` as absolute 
return absolute_regex.test(src) ? src : ((src.charAt(0) == "/" ? root_domain : root_page) + src); 
} 
