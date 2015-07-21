    //声环境
   function jifen(b){
	  
	   var i, 
			n,
			a,
			b,
			h,
			t,
			Tn;

		n = 1000000;
		//下限值（无穷小）
		a = Number.MIN_VALUE;
		//上限值（录入的参数值）
		b = Number(b);
		 
		  //b = 60;
		h = (b - a) / n;
		T = (f(a) + f(b))/2;
		for(var i = 1;i < n;i ++) {
			T = T + f(a + i*h);
		}
		Tn = T * h;
		return Tn.toFixed(3);
		
		function  f(x) {
			return 4.3*Math.exp(-((x-58.6)*(x-58.6))/(13*13));
		}
		
}

   //热环境
   function  getHotPMV(L,M)
   {
		var PMV = ((0.303*(Math.exp(-0.036*M))+0.0275)*L).toFixed(3);
		return PMV;
   }
   
   function  getHotPPD(PMV)
   {
		var PPD = (100-95*Math.exp(-(0.03353*PMV*PMV*PMV*PMV+0.2179*PMV*PMV))).toFixed(3);
		return PPD;
  }
   
   //光环境  
   function guangPDL(x)
   {
	     //x为照度值（录入值）
		var PDL = (98.97 - 75.48*Math.exp(-5.02*(Math.log(x)-3.27)*(Math.log(x)-3.27))).toFixed(3);
		return PDL;
   }
   
   //空气环境 
   function airPDA(C)
   {
		var PDA = (Math.exp(5.98-Math.sqrt(112/C))).toFixed(3);
		return PDA;
   }
 
   function airC(Q,C0,G)
   {

		//C0室外空气品质的感知值(录入值)
		//G室内个空气品质的污染物（录入值）
	   var C = C0 +10*G/Q;
	   return C;
   }
   
   //返回P值
   function returnP(max,ave)
   {
		var p = (Math.sqrt((max*max+ave*ave)/2)).toFixed(3);
		return p;
   }
   
   //返回最大值
   function returnMax(Pi)
   {
	   var max = 0;
	   for(var k = 0;k<Pi.length;k++)
	   {
		   if(max<Pi[k])
		   {
			   max = Pi[k];
		   };
	   }
	   return max;
   };
   
   //返回平均值
   function returnAve(Pi)
   {
	   var sum = parseFloat(0);
	   for(var k = 0;k<Pi.length;k++)
	   {
		   sum += parseFloat(Pi[k]);
	   }
	   /*alert(sum);*/
	   return sum/Pi.length;
   };
   

   function returnPHpiless7(ph)
   {
	    parseFloat(ph);
   		var result = (7.0-ph)/(7.0-6.0);
   		return result;
   }
   
   function returnPHpimore7(ph)
   {
	    parseFloat(ph);
  		var result = (ph-7.0)/(9.0-7.0);
  		return result;
   }

   