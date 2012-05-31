package  
{
	import BaseAssets.BaseMain;
	import cepa.graph.DataStyle;
	import cepa.graph.GraphFunction;
	import cepa.graph.rectangular.SimpleGraph;
	import com.eclecticdesignstudio.motion.Actuate;
	import fl.transitions.easing.None;
	import fl.transitions.Tween;
	import flash.display.MovieClip;
	import flash.display.Sprite;
	import flash.events.Event;
	import flash.events.MouseEvent;
	import flash.events.TimerEvent;
	import flash.external.ExternalInterface;
	import flash.geom.Point;
	import flash.geom.Rectangle;
	import flash.utils.Dictionary;
	import flash.utils.Timer;
	/**
	 * ...
	 * @author Alexandre
	 */
	public class Main extends BaseMain
	{
		
		private const A:String = 					"A";
		private const B:String = 					"B";
		private const N:String = 					"N";
		private const M:String = 					"M";
		private const FUNCTION_HTML:String = 		"FUNCTION_HTML";
		private const UPPER_SUM:String = 			"UPPER_SUM";
		private const LOWER_SUM:String = 			"LOWER_SUM";
		private const PARALLELOGRAM_SUM:String = 	"PARALLELOGRAM_SUM";
		private const AREA:String = 				"AREA";
		private const MEAN_VALUE:String = 			"MEAN_VALUE";
		private const FUNCTION_VALUE:String = 		"FUNCTION_VALUE";
		private const MONTE_CARLO:String = 			"MONTE_CARLO";
		private const MONTE_CARLO_COUNT:String = 	"MONTE_CARLO_COUNT";
		private const FUNCTION_INVERSE:String = 	"FUNCTION_INVERSE";
		
		private var camadaGraph:Sprite;
		private var camadaUpperSum:Sprite;
		private var camadaLowerSum:Sprite;
		private var camadaParallelogramSum:Sprite;
		private var camadaArea:Sprite;
		private var camadaMonteCarlo:MonteCarlo;
		private var camadaMean:Sprite;
		private var camadaPontos:Sprite;
		private var camadaLockClicks:Sprite;
		
		private var dictionarySet:Dictionary;
		private var dictionaryGet:Dictionary;
		private var dictionaryVisible:Dictionary;
		private var dictionaryFunctions:Dictionary;
		
		private var graph:SimpleGraph;
		private var dataStyle:DataStyle;
		private var graphFunction:GraphFunction;
		private var funcoes:Array;
		private var funcaoAtual:int;
		
		private var areasMaximas:Array;
		private var areasMinimas:Array;
		
		private var pontoA:MovieClip;
		private var pontoB:MovieClip;
		private var pontoM:MovieClip;
		private var pontoArraste:MovieClip;
		
		private var somaTotalMaxima:Number;
		private var somaTotalMinima:Number;
		private var somaTotalParalelogramo:Number;
		private var areaTotal:Number;
		
		private var timeToShow:Timer = new Timer(400, 1);
		
		public function Main() 
		{
			if (stage) init();
			else addEventListener(Event.ADDED_TO_STAGE, init);
		}
		
		/**
		 * Restaura a CONFIGURAÇÃO inicial (padrão).
		 */
		override public function reset(e:MouseEvent = null):void 
		{
			
		}
		
		private function init(e:Event = null):void 
		{
			removeEventListener(Event.ADDED_TO_STAGE, init);
			
			configDictionary();
			configCamadas();
			configGraph();
			configFuncoes();
			configPontos();
			configAreas();
			
			funcaoAtual = -1;
			
			setFunction("1/x");
			setN("5");
			
			setChildIndex(mouseCoord, numChildren - 1);
			setChildIndex(botoes, numChildren - 1);
			setChildIndex(bordaAtividade, numChildren - 1);
			stage.addEventListener(MouseEvent.MOUSE_MOVE, updateMouseCoord);
			mouseCoord.alpha = 0;
			updateMouseCoord(null);
			
			timeToShow.addEventListener(TimerEvent.TIMER_COMPLETE, showMouseCoords);
			
			//if(ExternalInterface.available) ExternalInterface.call("getAi");
			configExternalInterface();
		}
		
		private function showMouseCoords(e:TimerEvent):void 
		{
			if (stage.mouseX > botoes.x - 5) return;
			Actuate.tween(mouseCoord, 1, { alpha:1 } );
		}
		
		private function updateMouseCoord(e:MouseEvent):void 
		{
			if (mouseCoord.alpha != 0) Actuate.tween(mouseCoord, 0.8, { alpha:0 }, false );
			
			mouseCoord.text = "(" + graph.pixel2x(stage.mouseX - graph.x).toFixed(2) + " ," + graph.pixel2y(stage.mouseY - graph.y).toFixed(2) + ")";
			
			if (stage.mouseX + mouseCoord.textWidth > stage.stageWidth - 5) mouseCoord.x = stage.mouseX - mouseCoord.textWidth - 5;
			else mouseCoord.x = stage.mouseX;
			if (stage.mouseY - 20 < 5) mouseCoord.y = stage.mouseY + 20;
			else mouseCoord.y = stage.mouseY - 20;
			
			if (timeToShow.running) {
				timeToShow.stop();
				timeToShow.reset();
			}
			
			timeToShow.start();
		}
		
		private function configAreas():void
		{
			areasMaximas = new Array();
			areasMinimas = new Array();
		}
		
		/**
		 * Configurao dicionário, relacionando as propriedades as funções.
		 */
		private function configDictionary():void
		{
			dictionarySet = new Dictionary();
			
			dictionarySet[A] = 					setA;
			dictionarySet[B] = 					setB;
			dictionarySet[N] = 					setN;
			dictionarySet[M] = 					setM;
			dictionarySet[FUNCTION_HTML] = 		setFunction;
			dictionarySet[MONTE_CARLO_COUNT] = 	setMonteCarloCount;
			
			dictionaryGet = new Dictionary();
			
			dictionaryGet[A] = 						getA;
			dictionaryGet[B] = 						getB;
			dictionaryGet[N] = 						getN;
			dictionaryGet[M] = 						getM;
			dictionaryGet[FUNCTION_VALUE] = 		getFunctionValue;
			dictionaryGet[UPPER_SUM] = 				getUpperSum;
			dictionaryGet[LOWER_SUM] = 				getLowerSum;
			dictionaryGet[PARALLELOGRAM_SUM] = 		getParallelogramSum;
			dictionaryGet[AREA] = 					getArea;
			dictionaryGet[MEAN_VALUE] = 			getMeanValue;
			dictionaryGet[FUNCTION_INVERSE] = 		getFunctionInverse;
			
			dictionaryVisible = new Dictionary();
			
			dictionaryVisible[UPPER_SUM] = 			setUpperSumVisible;
			dictionaryVisible[LOWER_SUM] = 			setLowerSumVisible;
			dictionaryVisible[PARALLELOGRAM_SUM] = 	setParallelogramVisible;
			dictionaryVisible[AREA] = 				setAreaVisible;
			dictionaryVisible[MEAN_VALUE] = 		setMeanVisible;
			dictionaryVisible[MONTE_CARLO] = 		setMonteCarloVisible;
			dictionaryVisible[M] = 					setMVisible;
			
			dictionaryFunctions = new Dictionary();
			
			dictionaryFunctions["e <SUP> x </SUP>"] = 0;
			dictionaryFunctions["1/x"] = 1;
			dictionaryFunctions["x <SUP> 3 </SUP> - 4x <SUP> 2 </SUP> - 11x + 30"] = 2;
			dictionaryFunctions["x<SUP>3</SUP> - x<SUP>2</SUP> + 5"] = 3;
			dictionaryFunctions["cos(x) + 2"] = 4;
			dictionaryFunctions["x <SUP>2</SUP> + 1"] = 5;
			dictionaryFunctions["sen(x) + 2"] = 6;
			
		}
		
		private function setMVisible(value:Boolean):void 
		{
			pontoM.visible = value;
		}
		
		/**
		 * Configuração das camadas da atividade.
		 */
		private function configCamadas():void
		{
			camadaArea = new Sprite();
			camadaGraph = new Sprite();
			camadaLowerSum = new Sprite();
			camadaMean = new Sprite();
			camadaMonteCarlo = new MonteCarlo();
			camadaParallelogramSum = new Sprite();
			camadaUpperSum = new Sprite();
			camadaPontos = new Sprite();
			camadaLockClicks = new Sprite();
			
			addChild(camadaArea);
			addChild(camadaUpperSum);
			addChild(camadaParallelogramSum);
			addChild(camadaLowerSum);
			addChild(camadaMean);
			addChild(camadaGraph);
			addChild(camadaPontos);
			addChild(camadaMonteCarlo);
			addChild(camadaLockClicks);
			camadaLockClicks.graphics.beginFill(0xFF8080, 0);
			camadaLockClicks.graphics.drawRect(0, 0, 700, 500);
			
			camadaLockClicks.visible = false;
			//camadaArea.visible = false;
			//camadaLowerSum.visible = false;
			//camadaUpperSum.visible = false;
			//camadaParallelogramSum.visible = false;
			//camadaMean.visible = false;
			camadaMonteCarlo.visible = false;
		}
		
		/**
		 * Configuração inicial do gráfico, apenas para a criação do mesmo, ja adiciona uma função ao gráfico, que será modificada conforme necessário.
		 */
		private function configGraph():void
		{
			var xMin:Number = 0;
			var xMax:Number = 10;
			var largura:Number = 600;
			var yMin:Number = 0;
			var yMax:Number = 10;
			var altura:Number = 425;
			
			graph = new SimpleGraph(xMin, xMax, largura, yMin, yMax, altura);
			//graph.setTicksDistance(SimpleGraph.AXIS_X, 1);
			//graph.setSubticksDistance(SimpleGraph.AXIS_X, 1);
			//graph.setTicksDistance(SimpleGraph.AXIS_Y, 0.5);
			//graph.setSubticksDistance(SimpleGraph.AXIS_Y, 1);
			graph.grid = false;
			
			graph.x = 30;
			graph.y = 20;
			
			graph.resolution = 1;
			
			camadaGraph.addChild(graph);
			
			dataStyle = new DataStyle();
			dataStyle.color = 0x000000;
			dataStyle.stroke = 2;
			dataStyle.alpha = 1;
			
			graphFunction = new GraphFunction(0, 20, function ():Number {return 0 } );
			
			graph.addFunction(graphFunction, dataStyle);
		}
		
		/**
		 * Configura o array de funções.
		 */
		private function configFuncoes():void
		{
			funcoes = new Array();
			/*
			funcoes.push(new FunctionInfo(função que retorna algo, new Point(xMin eixo X, xMax eixo X), new Point(yMin eixo Y, yMax eixo Y), 
			Number(posicao do ponto A no gráfico), Number(posição do ponto B no gráfico), Number(posição do ponto médio no gráfico, String(String da funçã em HTML))));
			*/
			funcoes.push(new FunctionInfo(
				function(x:Number):Number { return Math.exp(x); }, 
				function(x:Number):Number { return Math.exp(x); }, 
				new Point(0, 4), 
				new Point(0, 60), 
				1, 3, 2, 
				"e <SUP> x </SUP>", 
				"e <SUP> x </SUP>"));
			funcoes.push(new FunctionInfo(
				function(x:Number):Number { return 1 / x; }, 
				function(x:Number):Number { return Math.log(x); }, 
				new Point(0, 5), 
				new Point(0, 5), 
				1, 3, 2, 
				"1/x", 
				"ln |x|"));
			funcoes.push(new FunctionInfo(
				function(x:Number):Number { return Math.pow(x, 3) - 4 * Math.pow(x, 2) - 11 * x + 30; }, 
				function(x:Number):Number { return Math.pow(x, 4) / 4 - 4 * Math.pow(x, 3) / 3 - 11 * Math.pow(x, 2) / 2 + 30 * x; }, 
				new Point(0, 0), 
				new Point(0, 0), 
				0, 0, 0, 
				"x <SUP> 3 </SUP> - 4x <SUP> 2 </SUP> - 11x + 30", 
				"x<SUP>4</SUP>/4 - 4x<SUP>3</SUP>/3 - 11x<SUP>2</SUP>/2 + 30x"));
			funcoes.push(new FunctionInfo(
				function(x:Number):Number { return Math.pow(x, 3) - Math.pow(x, 2) + 5; }, 
				function(x:Number):Number { return Math.pow(x, 4) / 4 - Math.pow(x, 3) / 3 + 5 * x; }, 
				new Point(0, 5), 
				new Point( -5, 5), 
				1, 4, 2, 
				"x<SUP>3</SUP> - x<SUP>2</SUP> + 5", 
				"x<SUP>4</SUP>/4 - x<SUP>3</SUP>/3 + 5x"));
			funcoes.push(new FunctionInfo(
				function(x:Number):Number { return Math.cos(x) + 2; }, 
				function(x:Number):Number { return Math.sin(x) + 2 * x; }, 
				new Point(0, 5), 
				new Point( -5, 5), 
				1, 4, 2, 
				"cos(x) + 2", 
				"sen(x)"));
			funcoes.push(new FunctionInfo(
				function(x:Number):Number { return Math.pow(x, 2) + 1; }, 
				function(x:Number):Number { return Math.pow(x, 3) / 3 + x; }, 
				new Point(0, 5), 
				new Point( -5, 5), 
				1, 4, 2, 
				"x<SUP>2</SUP> + 1", 
				"x<SUP>3</SUP>/3 + x"));
			funcoes.push(new FunctionInfo(
				function(x:Number):Number { return Math.sin(x) + 2; }, 
				function(x:Number):Number { return -Math.cos(x) + 2 * x; }, 
				new Point(0, 5), 
				new Point( -5, 5), 
				1, 4, 2, 
				"sen(x) + 2", 
				"-cos(x) + 2x"));
		}
		
		/**
		 * Configuração inicial dos pontos A e B e M.
		 */
		private function configPontos():void
		{
			pontoA = new PontoArraste();
			pontoA.nome.text = "a";
			pontoA.buttonMode = true;
			pontoB = new PontoArraste();
			pontoB.nome.text = "b";
			pontoB.buttonMode = true;
			pontoM = new PontoArraste();
			pontoM.nome.text = "m";
			pontoM.buttonMode = true;
			
			camadaPontos.addChild(pontoM);
			camadaPontos.addChild(pontoB);
			camadaPontos.addChild(pontoA);
			
			pontoA.addEventListener(MouseEvent.MOUSE_DOWN, initArrastePonto);
			pontoB.addEventListener(MouseEvent.MOUSE_DOWN, initArrastePonto);
			pontoM.addEventListener(MouseEvent.MOUSE_DOWN, initArrastePonto);
			
			pontoA.x = graph.x2pixel(0) + graph.x;
			pontoA.y = graph.y2pixel(0) + graph.y;
			
			pontoB.x = graph.x2pixel(0) + graph.x;
			pontoB.y = graph.y2pixel(0) + graph.y;
			
			pontoM.x = graph.x2pixel(0) + graph.x;
			pontoM.y = graph.y2pixel(0) + graph.y;
		}
		
		private function initArrastePonto(e:MouseEvent):void 
		{
			if (e.target is MovieClip)
			{
				stage.addEventListener(MouseEvent.MOUSE_UP, stopArrastePonto);
				stage.addEventListener(MouseEvent.MOUSE_MOVE, movingPonto);
				pontoArraste = e.target as MovieClip;
				camadaPontos.setChildIndex(pontoArraste, camadaPontos.numChildren - 1);
			}
		}
		
		private function movingPonto(e:MouseEvent):void 
		{
			var posXgraph:Number = graph.pixel2x(stage.mouseX - graph.x);
			
			if (pontoArraste == pontoA) var posCalc:Number = Math.min(Math.max(40, stage.mouseX), pontoB.x - 20);
			else if (pontoArraste == pontoB) posCalc = Math.max(Math.min(620, stage.mouseX), pontoA.x + 20);
			else posCalc = Math.min(Math.max(40, stage.mouseX), 620);
			
			var posSnap = graph.x2pixel(Math.round(graph.pixel2x(pontoArraste.x - graph.x) / 0.5) * 0.5) + graph.x;
			pontoArraste.x = Math.abs(posSnap - posCalc) < 5 ? posSnap: posCalc;
			
			if (pontoArraste == pontoM) {
				if (Math.abs(pontoArraste.x - pontoA.x) <= 5) pontoArraste.x = pontoA.x;
				else if (Math.abs(pontoArraste.x - pontoB.x) <= 5) pontoArraste.x = pontoB.x;
			}
			
			drawAreas();
		}
		
		private function stopArrastePonto(e:MouseEvent):void 
		{
			stage.removeEventListener(MouseEvent.MOUSE_UP, stopArrastePonto);
			stage.removeEventListener(MouseEvent.MOUSE_MOVE, movingPonto);
			pontoArraste = null;
		}
		
		private function drawAreas():void
		{
			//Desenho das áreas máximas, mínimas e paralelogramos.
			var comprimentoBarras:Number = (pontoB.x - pontoA.x) / areasMaximas.length;
			
			camadaParallelogramSum.graphics.clear();
			camadaParallelogramSum.graphics.lineStyle(1, 0xFF0080);
			camadaParallelogramSum.graphics.beginFill(0xFF80FF, 0.5);
			camadaParallelogramSum.graphics.moveTo(pontoA.x, pontoA.y);
			
			for (var i:int = 0; i < areasMaximas.length; i++) 
			{
				//Atribui a largura das barras
				areasMaximas[i].width = comprimentoBarras;
				areasMinimas[i].width = comprimentoBarras;
				
				//Atribui o posicionamento x e y das barras
				if (i == 0) {
					areasMaximas[i].x = graph.x2pixel(graph.pixel2x(pontoA.x - graph.x)) + graph.x;
					areasMaximas[i].y = graph.y2pixel(graph.pixel2y(pontoA.y - graph.y)) + graph.y;
					
				}else {
					areasMaximas[i].x = areasMaximas[i - 1].x + comprimentoBarras;
					areasMaximas[i].y = areasMaximas[i - 1].y;
				}
				
				areasMinimas[i].x = areasMaximas[i].x;
				areasMinimas[i].y = areasMaximas[i].y;
				
				//Atribui a altura das barras
				var valorYpontoA:Number = graph.y2pixel(FunctionInfo(funcoes[funcaoAtual]).funcao(graph.pixel2x(areasMaximas[i].x - graph.x))) + graph.y;
				var valorYpontoAdeltaX:Number = graph.y2pixel(FunctionInfo(funcoes[funcaoAtual]).funcao(graph.pixel2x(areasMaximas[i].x + comprimentoBarras - graph.x))) + graph.y;
				
				camadaParallelogramSum.graphics.lineTo(pontoA.x + (i * comprimentoBarras), valorYpontoA);
				camadaParallelogramSum.graphics.lineTo(pontoA.x + ((i + 1) * comprimentoBarras), valorYpontoAdeltaX);
				camadaParallelogramSum.graphics.lineTo(pontoA.x + ((i + 1) * comprimentoBarras), pontoA.y);
				camadaParallelogramSum.graphics.lineTo(pontoA.x + (i * comprimentoBarras), pontoA.y);
				
				camadaParallelogramSum.graphics.moveTo(pontoA.x + ((i + 1) * comprimentoBarras), pontoA.y);
				
				if (valorYpontoA < valorYpontoAdeltaX) {
					var alturaMinima:Number = pontoA.y - valorYpontoAdeltaX;
					var alturaMaxima:Number = pontoA.y - valorYpontoA;
				}else {
					alturaMinima = pontoA.y - valorYpontoA;
					alturaMaxima = pontoA.y - valorYpontoAdeltaX;
				}
				
				if (alturaMaxima < 0 || alturaMinima < 0) {
					areasMaximas[i].scaleY = 1;
					var alturaNormal:Number = areasMaximas[i].height;
					
					var scaleAplicadoMaximo:Number = alturaMaxima / alturaNormal;
					areasMaximas[i].scaleY = scaleAplicadoMaximo;
					
					var scaleAplicadoMinimo:Number = alturaMinima / alturaNormal;
					areasMinimas[i].scaleY = scaleAplicadoMinimo;
					
				}else{
					areasMaximas[i].height = alturaMaxima;
					areasMinimas[i].height = alturaMinima;
				}
			}
			//Fim do desenho das áreas máximas, mínimas e paralelogramos.
			
			//Desenha a área do gráfico definida por A e B e desenho da área do ponto médio.
			camadaArea.graphics.clear();
			camadaMean.graphics.clear();
			
			var desenhaMedio:Boolean;
			if (pontoM.x >= pontoA.x && pontoM.x <= pontoB.x) desenhaMedio = true;
			else desenhaMedio = false;
			var deltaX:Number = (xPontoB - xPontoA) / 20;
			
			camadaArea.graphics.lineStyle(1, 0xD88912, 1);
			camadaArea.graphics.beginFill(0xFFFF80, 0.5);
			camadaArea.graphics.moveTo(pontoB.x, pontoB.y);
			camadaArea.graphics.lineTo(pontoA.x, pontoA.y);
			
			if (desenhaMedio) {
				camadaMean.graphics.clear();
				camadaMean.graphics.lineStyle(1, 0x808040);
				camadaMean.graphics.beginFill(0x808000, 0.5);
				camadaMean.graphics.moveTo(pontoA.x, graph.y2pixel(FunctionInfo(funcoes[funcaoAtual]).funcao(xPontoM)) + graph.y);
				camadaMean.graphics.lineTo(pontoA.x, graph.y2pixel(FunctionInfo(funcoes[funcaoAtual]).funcao(xPontoA)) + graph.y);
			}
			
			var yMaxF:Number = graph.y2pixel(FunctionInfo(funcoes[funcaoAtual]).funcao(FunctionInfo(funcoes[funcaoAtual]).posA)) + graph.y;
			var yMinF:Number = yMaxF;
			
			for (i = 0; i <= 20; i++) 
			{
				var posY:Number = FunctionInfo(funcoes[funcaoAtual]).funcao(xPontoA + i * deltaX);
				var posYpalco:Number = graph.y2pixel(posY) + graph.y;
				camadaArea.graphics.lineTo(graph.x2pixel(xPontoA + (i * deltaX)) + graph.x, posYpalco);
				
				if (posYpalco > yMaxF) yMaxF = posYpalco;
				else if (posYpalco < yMinF) yMinF = posYpalco;
				
				if(desenhaMedio) camadaMean.graphics.lineTo(graph.x2pixel(xPontoA + (i * deltaX)) + graph.x, posYpalco);
			}
			
			camadaMonteCarlo.atualizaInfoGrafico(pontoA.x, pontoB.x, yMinF, Math.max(yMaxF, graph.y2pixel(0) + graph.y));
			
			camadaArea.graphics.lineTo(pontoB.x, pontoB.y);
			
			if (desenhaMedio) {
				camadaMean.graphics.lineTo(pontoB.x, graph.y2pixel(FunctionInfo(funcoes[funcaoAtual]).funcao(xPontoM)) + graph.y);
				camadaMean.graphics.lineTo(pontoA.x, graph.y2pixel(FunctionInfo(funcoes[funcaoAtual]).funcao(xPontoM)) + graph.y);
				camadaMean.graphics.endFill();
				
				camadaMean.graphics.lineStyle(5, 0x808080, 0.5);
				camadaMean.graphics.drawRect(pontoA.x, pontoA.y, pontoB.x - pontoA.x, graph.y2pixel(FunctionInfo(funcoes[funcaoAtual]).funcao(xPontoM)) + graph.y - pontoA.y);
				
				camadaMean.graphics.lineStyle(2, 0x000000);
				camadaMean.graphics.moveTo(pontoM.x, pontoM.y);
				
				if (graph.y2pixel(FunctionInfo(funcoes[funcaoAtual]).funcao(xPontoM)) + graph.y < pontoM.y){
					for (i = pontoM.y; i > graph.y2pixel(FunctionInfo(funcoes[funcaoAtual]).funcao(xPontoM)) + graph.y + 3; i-=10) 
					{
						camadaMean.graphics.lineTo(pontoM.x, i - 3);
						camadaMean.graphics.moveTo(pontoM.x, i - 10);
					}
				}else {
					for (i = pontoM.y; i < graph.y2pixel(FunctionInfo(funcoes[funcaoAtual]).funcao(xPontoM)) + graph.y - 3; i+=10) 
					{
						camadaMean.graphics.lineTo(pontoM.x, i + 3);
						camadaMean.graphics.moveTo(pontoM.x, i + 10);
					}
				}
				
				camadaMean.graphics.moveTo(graph.x2pixel(0) + graph.x, graph.y2pixel(FunctionInfo(funcoes[funcaoAtual]).funcao(xPontoM)) + graph.y);
				for (i = graph.x2pixel(0) + graph.x; i < graph.x2pixel(xPontoM) + graph.x - 3; i+=10) 
				//for (i = graph.x2pixel(0) + graph.x; i < graph.x2pixel(xPontoB) + graph.x; i+=10) 
				{
					camadaMean.graphics.lineTo(i + 3, graph.y2pixel(FunctionInfo(funcoes[funcaoAtual]).funcao(xPontoM)) + graph.y);
					camadaMean.graphics.moveTo(i + 10, graph.y2pixel(FunctionInfo(funcoes[funcaoAtual]).funcao(xPontoM)) + graph.y);
				}
				
			}
			//Fim do desenho da área e da área do ponto médio.
			
			atualizaAreas();
		}
		
		private function atualizaAreas():void
		{
			var base:Number = (xPontoB - xPontoA) / Number(getN());
			
			somaTotalMaxima = 0;
			somaTotalMinima = 0;
			somaTotalParalelogramo = 0;
			
			for (var i:int = 0; i < areasMaximas.length; i++) {
				var valorYi:Number = graph.y2pixel(FunctionInfo(funcoes[funcaoAtual]).funcao(graph.pixel2x(areasMaximas[i].x - graph.x))) + graph.y;
				var valorYii:Number = graph.y2pixel(FunctionInfo(funcoes[funcaoAtual]).funcao(graph.pixel2x(areasMaximas[i].x - graph.x) + base)) + graph.y;
				
				var fXi:Number = FunctionInfo(funcoes[funcaoAtual]).funcao(xPontoA + ((i) * base));
				var fXii:Number = FunctionInfo(funcoes[funcaoAtual]).funcao(xPontoA + ((i + 1) * base));
				
				if (valorYi > valorYii) {
					somaTotalMaxima += base * fXii;
					somaTotalMinima += base * fXi;
				}else {
					somaTotalMaxima += base * fXi;
					somaTotalMinima += base * fXii;
				}
				somaTotalParalelogramo += base * (fXi + fXii) / 2;
			}
			//trace("max: " + somaTotalMaxima);
			//trace("min: " + somaTotalMinima);
			//trace("par: " + somaTotalParalelogramo);
			
			areaTotal = FunctionInfo(funcoes[funcaoAtual]).primitiva(xPontoB) - FunctionInfo(funcoes[funcaoAtual]).primitiva(xPontoA);
			//trace("area: " + areaTotal);
			//trace("areaMC: " + Number(getMonteCarloInnerCount()) / camadaMonteCarlo.qtdePontos * Number(getMonteCarloControlArea()));
			//trace(getMonteCarloInnerCount() + "\t" + getMonteCarloOuterCount());
		}
		
		private function get xPontoA():Number
		{
			return graph.pixel2x(pontoA.x - graph.x);
		}
		
		private function get xPontoB():Number
		{
			return graph.pixel2x(pontoB.x - graph.x);
		}
		
		private function get xPontoM():Number
		{
			return graph.pixel2x(pontoM.x - graph.x);
		}
		
		//------------------------------------------------
		//Set e Get para a função, onde set configura uma nova função e get retorna o valor da função para um determinado parâmetro.
		private function setFunction(value:String):Boolean
		{
			funcaoAtual = dictionaryFunctions[value];
			
			graphFunction.f = FunctionInfo(funcoes[funcaoAtual]).funcao;
			graphFunction.xmin = FunctionInfo(funcoes[funcaoAtual]).xAxis.x;
			graphFunction.xmax = FunctionInfo(funcoes[funcaoAtual]).xAxis.y;
			graph.xmin = FunctionInfo(funcoes[funcaoAtual]).xAxis.x;
			graph.xmax = FunctionInfo(funcoes[funcaoAtual]).xAxis.y;
			graph.ymin = FunctionInfo(funcoes[funcaoAtual]).yAxis.x;
			graph.ymax = FunctionInfo(funcoes[funcaoAtual]).yAxis.y;
			
			graph.draw();
			
			pontoA.x = graph.x2pixel(FunctionInfo(funcoes[funcaoAtual]).posA) + graph.x;
			pontoA.y = graph.y2pixel(0) + graph.y;
			
			pontoB.x = graph.x2pixel(FunctionInfo(funcoes[funcaoAtual]).posB) + graph.x;
			pontoB.y = graph.y2pixel(0) + graph.y;
			
			pontoM.x = graph.x2pixel(FunctionInfo(funcoes[funcaoAtual]).posMean) + graph.x;
			pontoM.y = graph.y2pixel(0) + graph.y;
			
			drawAreas();
			
			return true;
		}
		
		private function getFunctionValue(value:String):String
		{
			return FunctionInfo(funcoes[funcaoAtual]).funcao(value);
		}
		
		private function getFunctionInverse(value:String):String 
		{
			var mean:Number = Number(getMeanValue());
			var xNumber:Number;
			var distance:Number = 999999;
			
			for (var i:Number = Number(getA()); i <= Number(getB()) ; i += 0.01) 
			{
				var fV:Number = Number(getFunctionValue(String(i)));
				if (Math.abs(fV - mean) < distance) {
					distance = Math.abs(fV - mean);
					xNumber = i;
				}
			}
			
			return xNumber.toFixed(2);
		}
		
		private function setRange(xmin, xmax, ymin, ymax):Boolean
		{
			var posA:Number = graph.pixel2x(pontoA.x - graph.x);
			var posB:Number = graph.pixel2x(pontoB.x - graph.x);
			var posM:Number = graph.pixel2x(pontoM.x - graph.x);
			
			graph.setRange(xmin, xmax, ymin, ymax);
			graph.draw();
			
			pontoA.x = graph.x2pixel(posA) + graph.x;
			pontoA.y = graph.y2pixel(0) + graph.y;
			
			pontoB.x = graph.x2pixel(posB) + graph.x;
			pontoB.y = graph.y2pixel(0) + graph.y;
			
			pontoM.x = graph.x2pixel(posM) + graph.x;
			pontoM.y = graph.y2pixel(0) + graph.y;
			
			drawAreas();
			
			return true;
		}
		
		//------------------------------------------------
		//Set e Get para a propriedade A (seta o valor de x e retorna o valor de x do ponto A).
		private function setA(value:String):Boolean
		{
			var newXpontoA:Number = Number(value);
			
			if (!isNaN(newXpontoA))
			{
				pontoA.x = graph.x2pixel(newXpontoA) + graph.x;
				drawAreas();
				
				return true;
			}else return false;
			
		}
		
		private function getA():String
		{
			return String(graph.pixel2x(pontoA.x - graph.x));
		}
		
		//------------------------------------------------
		//Set e Get para a propriedade B (seta o valor de x e retorna o valor de x do ponto B).
		private function setB(value:String):Boolean
		{
			var newXpontoB:Number = Number(value);
			
			if (!isNaN(newXpontoB))
			{
				pontoB.x = graph.x2pixel(newXpontoB) + graph.x;
				drawAreas();
				
				return true;
			}else return false;
		}
		
		private function lock(prop:String, value:Boolean):Boolean
		{
			var ret:Boolean = true;
			switch (prop.toUpperCase()) {
				case "A":
					pontoA.mouseEnabled = !value;
					break;
				case "B":
					pontoB.mouseEnabled = !value;
					break;
				case "N":
					pontoM.mouseEnabled = !value;
					break;
				default:
					ret = false;
					break;
			}
			
			return ret;
		}
		
		private function getB():String
		{
			return String(graph.pixel2x(pontoB.x - graph.x));
		}
		
		//------------------------------------------------
		//Set e Get para a propriedade B (seta o valor de x e retorna o valor de x do ponto B).
		private function setM(value:String):Boolean
		{
			var newXpontoM:Number = Number(value);
			
			if (!isNaN(newXpontoM))
			{
				pontoM.x = graph.x2pixel(newXpontoM) + graph.x;
				drawAreas();
				
				return true;
			}else return false;
		}
		
		private function getM():String
		{
			return String(graph.pixel2x(pontoM.x - graph.x));
		}
		
		//------------------------------------------------
		//Set e Get para a propriedade N (N é o número de retângulos).
		private function setN(value:String):Boolean
		{
			var nBlocos:Number = Number(value);
			
			if(!isNaN(nBlocos)){
				if (nBlocos > areasMaximas.length) {
					while (areasMaximas.length < nBlocos) {
						areasMaximas.push(new AreaMaxima());
						camadaUpperSum.addChild(areasMaximas[areasMaximas.length - 1]);
						
						areasMinimas.push(new AreaMinima());
						camadaLowerSum.addChild(areasMinimas[areasMinimas.length - 1]);
					}
				}else if (nBlocos < areasMaximas.length) {
					while (areasMaximas.length > nBlocos) {
						camadaUpperSum.removeChild(areasMaximas[areasMaximas.length - 1]);
						areasMaximas.splice(areasMaximas.length - 1, 1);
						
						camadaLowerSum.removeChild(areasMinimas[areasMinimas.length - 1]);
						areasMinimas.splice(areasMinimas.length - 1, 1);
					}
				}
				
				if (funcaoAtual != -1) drawAreas();
				
				return true;
			
			} else return false;
		}
		
		private function getN():String
		{
			return String(areasMaximas.length);
		}
		
		//------------------------------------------------
		//Set e Get para o número de pontos da resolução via Monte Carlo
		private function setMonteCarloCount(value:String):Boolean
		{
			var numParticulas:Number = Number(value);
			if (!isNaN(numParticulas)) {
				camadaMonteCarlo.qtdePontos = numParticulas;
				
				return true;
			} else return false;
		}
		
		private function getMonteCarloCount():String
		{
			return String(camadaMonteCarlo.qtdePontos);
		}
		
		//------------------------------------------------
		
		//------------------------------------------------
		//Sets para visível/invisível:
		
		//Set para tornar visivel/invisível as barras de soma superior
		private function setUpperSumVisible(value:Boolean):Boolean
		{
			camadaUpperSum.visible = value;
			return true;
		}
		
		//------------------------------------------------
		//Set para tornar visivel/invisível as barras de soma inferior
		private function setLowerSumVisible(value:Boolean):Boolean
		{
			camadaLowerSum.visible = value;
			return true;
		}
		
		//------------------------------------------------
		//Set para tornar visivel/invisível a área total
		private function setAreaVisible(value:Boolean):Boolean
		{
			camadaArea.visible = value;
			return true;
		}
		
		//------------------------------------------------
		//Set para tornar visivel/invisível as barras dos paralelogramos
		private function setParallelogramVisible(value:Boolean):Boolean
		{
			camadaParallelogramSum.visible = value;
			return true;
		}
		
		//------------------------------------------------
		//Set para tornar visivel/invisível o ponto médio
		private function setMeanVisible(value:Boolean):Boolean
		{
			camadaMean.visible = value;
			return true;
		}
		
		//------------------------------------------------
		//Set para tornar visivel/invisível o Monte Carlo.
		private function setMonteCarloVisible(value:Boolean):Boolean
		{
			camadaMonteCarlo.visible = value;
			return true;
		}
		
		//------------------------------------------------
		
		//------------------------------------------------
		//Funções get:
		private function getUpperSum():String
		{
			return String(somaTotalMaxima);
		}
		
		private function getLowerSum():String
		{
			return String(somaTotalMinima);
		}
		
		private function getParallelogramSum():String
		{
			return String(somaTotalParalelogramo);
		}
		
		private function getArea():String
		{
			return String(areaTotal);
		}
		
		private function getMeanValue():String
		{
			var meanValue:Number = Number(this.getArea()) / (xPontoB - xPontoA);
			return String(meanValue);
		}
		
		private function getMonteCarloInnerCount():String
		{
			var innerCount:int = 0;
			
			for (var i:int = 0; i < camadaMonteCarlo.dots.length; i++) 
			{
				var posXgrafico:Number = graph.pixel2x(camadaMonteCarlo.dots[i].x - graph.x);
				var posYgrafico:Number = graph.pixel2y(camadaMonteCarlo.dots[i].y - graph.y);
				var fXpto:Number = FunctionInfo(funcoes[funcaoAtual]).funcao(posXgrafico);
				//Verifica se a posicao x do ponto na posicao i esta entre os pontos A e B
				if (posXgrafico >= xPontoA && posXgrafico <= xPontoB) {
					//Verifica se a posicao y do ponto na posicao i esta dentro do gráfico.
					if (fXpto >= 0){
						if (posYgrafico <= fXpto && posYgrafico >= 0) innerCount++;
					}else {
						if (posYgrafico >= fXpto && posYgrafico <= 0) innerCount++;
					}
				}
			}
			return String(innerCount);
		}
		
		private function getMonteCarloOuterCount():String
		{
			var outerCount:int = 0;
			
			for (var i:int = 0; i < camadaMonteCarlo.dots.length; i++) 
			{
				var posXgrafico:Number = graph.pixel2x(camadaMonteCarlo.dots[i].x - graph.x);
				var posYgrafico:Number = graph.pixel2y(camadaMonteCarlo.dots[i].y - graph.y);
				var fXpto:Number = FunctionInfo(funcoes[funcaoAtual]).funcao(posXgrafico);
				//Verifica se a posicao x do ponto na posicao i esta entre os pontos A e B
				if (posXgrafico >= xPontoA && posXgrafico <= xPontoB) {
					//Verifica se a posicao y do ponto na posicao i esta dentro do gráfico.
					if (fXpto >= 0){
						if (posYgrafico > fXpto || posYgrafico < 0) outerCount++;
					}else {
						if (posYgrafico < fXpto || posYgrafico > 0) outerCount++;
					}
				}else outerCount++;
			}
			return String(outerCount);
		}
		
		private function getMonteCarloControlArea():String
		{
			var pxIni:Number = graph.pixel2x(camadaMonteCarlo.posicoes[2] - graph.x);
			var pxFim:Number = graph.pixel2x(camadaMonteCarlo.posicoes[1] - graph.x);
			var pyIni:Number = graph.pixel2y(camadaMonteCarlo.posicoes[0] - graph.y);
			var pyFim:Number = graph.pixel2y(camadaMonteCarlo.posicoes[3] - graph.y);
			
			trace(pxIni + "\t" + pxFim + "\t" + pyIni + "\t" + pyFim);
			
			var areaMonteCarlo:Number = Math.abs(pxFim - pxIni) * Math.abs(pyFim - pyIni);
			
			return String(areaMonteCarlo);
		}
		
		//------------------------------------------------
		
		/**
		 * 
		 * @param	property 	Propriedade que se quer modificar o valor.
		 * @param	value 		Valor para a propriedade.
		 * @return 				True caso o valor tenha sido modificado corretamente, false caso contrário.
		 * Altera o valor de uma propriedade da classe.
		 */
		private function seta(property:String, value:String):Boolean
		{
			if (dictionarySet[property] == null) return false;
			else return dictionarySet[property](value);
		}
		
		/**
		 * 
		 * @param	property 	Propriedade que se quer saber o valor.
		 * @param	value 		Valor para a propriedade caso seja necessário (caso de f(x))
		 * @return 				Retorna o valor da propriedade como uma string.
		 * Retorna o valor de uma propriedade da classe.
		 */
		private function gett(property:String, argument:String = null):String
		{
			if (dictionaryGet[property] == null) return "";
			else if (argument == null) return dictionaryGet[property]();
			else return dictionaryGet[property](argument);
		}
		
		/**
		 * 
		 * @param	layer Layer na qual se aplicará a propriedade .visible (= true ou false);
		 * @param	value true para visível e false para invisível.
		 * @return retorna true caso seja bem sucedido e false caso não.
		 * Altera a visibilidade de uma camada.
		 */
		private function setVisible(layer:String, value:Boolean):Boolean
		{
			if (dictionaryVisible[layer] == null) return false;
			else return dictionaryVisible[layer](value);
		}
		
		/**
		 * Configura o ExternalInterface, caso esteja disponível.
		 */
		private function configExternalInterface():void
		{
			if (ExternalInterface.available)
			{
                try
				{
                    ExternalInterface.addCallback("get", gett);
					ExternalInterface.addCallback("set", seta);
					ExternalInterface.addCallback("setVisible", setVisible);
					ExternalInterface.addCallback("setFunction", setFunction);
					ExternalInterface.addCallback("doNothing", doNothing);
					ExternalInterface.addCallback("lock", lock);
					ExternalInterface.addCallback("range", setRange);
					trace("External interface ok.");
                }
				catch (error:SecurityError)
				{
					trace("Ocorreu um erro de segurança: " + error.message);
                }
				catch (error:Error)
				{
					trace("Ocorreu um erro: " + error.message);
                }
            }
			else
			{
				trace("External interface is not available for this container.");
            }
		}
		
		public function doNothing():Boolean 
		{
			return true;
		}
		
	}

}