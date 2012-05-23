package  
{
	import flash.display.MovieClip;
	import flash.display.Sprite;
	import flash.events.Event;
	import flash.events.MouseEvent;
	import flash.geom.Point;
	import flash.geom.Rectangle;
	import flash.sampler.NewObjectSample;
	
	/**
	 * ...
	 * @author Arthur Tofani
	 */
	public class MonteCarlo extends Sprite
	{
		public const CIMA:int = 0;
		public const DIR:int = 1;
		public const ESQ:int = 2;
		public const BAIXO:int = 3;


		public const maxY:int = 480;
		public const maxX:int = 640;
		
		public var mouseOffAxis:Point = new Point(0,0)
		
		
		private var blocks:Vector.<Sprite> = new Vector.<Sprite>();
		private var ptos:Vector.<PontoArraste> = new Vector.<PontoArraste>(4);
		private var _dots:Vector.<Dot> = new Vector.<Dot>();
		
		private var _posicoes:Array = [60, 580, 60, 420]
		private var pto:PontoArraste;
		private var ptoidx:int = -1
		
		private var _qtdePontos:int = 1000;
		
		private var pontoA:int = 200
		private var pontoB:int = 300
		private var valorMaxFuncao:int = 300
		private var valorMinFuncao:int = 400
		
		private function devolvePosicaoAdequada(vlr:int, posMin:int, posMax:int):int {
			var tol:int = 3;
			if (vlr < posMin) return posMin + tol;
			if (vlr > posMax) return posMax + tol;
			return vlr;
		}
		
		public function atualizaInfoGrafico(_pontoA:Number, _pontoB:Number, _valorMaxFuncao:Number, _valorMinFuncao:Number):void {
			pontoA = _pontoA;
			pontoB = _pontoB;
			valorMaxFuncao = _valorMaxFuncao;
			valorMinFuncao = _valorMinFuncao;
			
			//if (pontoA < posicoes[ESQ]) posicoes[ESQ] = pontoA;
			//if (pontoB > posicoes[DIR]) posicoes[DIR] = pontoB;
			//if (valorMaxFuncao < posicoes[CIMA]) posicoes[CIMA] = _valorMaxFuncao
			//if (valorMinFuncao < posicoes[BAIXO]) posicoes[BAIXO] = _valorMinFuncao
			
			redraw();
		}
		
		
		public function MonteCarlo():void
		{
			initdraw();
		}
		
		
		
		private function redraw() {
			blocks[CIMA].x = posicoes[ESQ];
			blocks[CIMA].width = posicoes[DIR] - posicoes[ESQ];
			blocks[CIMA].y = 0;
			blocks[CIMA].height = posicoes[CIMA];
			
			blocks[BAIXO].x = posicoes[ESQ];
			blocks[BAIXO].width = posicoes[DIR] - posicoes[ESQ];
			blocks[BAIXO].y = posicoes[BAIXO];
			blocks[BAIXO].height = maxY - posicoes[BAIXO];
//
			blocks[ESQ].x = 0;
			blocks[ESQ].width = posicoes[ESQ];
			blocks[ESQ].y = 0;
			blocks[ESQ].height = maxY;

			blocks[DIR].x = posicoes[DIR];
			blocks[DIR].width = maxX - posicoes[DIR];
			blocks[DIR].y = 0;
			blocks[DIR].height = maxX;
			
			ptos[CIMA].x = posicoes[ESQ] + ((posicoes[DIR] - posicoes[ESQ]) / 2)
			ptos[BAIXO].x = posicoes[ESQ] + ((posicoes[DIR] - posicoes[ESQ]) / 2)
			ptos[ESQ].y = posicoes[CIMA]  + ((posicoes[BAIXO] - posicoes[CIMA]) / 2)
			ptos[DIR].y = posicoes[CIMA]  + ((posicoes[BAIXO] - posicoes[CIMA]) / 2)
			
			ptos[CIMA].y = posicoes[CIMA]
			ptos[BAIXO].y = posicoes[BAIXO]
			ptos[ESQ].x = posicoes[ESQ]
			ptos[DIR].x = posicoes[DIR]
			
		}
		
		
		public function clearPoints() {
			var i:int 
			if (dots.length > 0) {
				for (i = 0; i < dots.length; i++) {
					this.removeChild(dots[i])
				}
			}
			dots = new Vector.<Dot>();
		}
		
		public function drawPoints() {
			clearPoints();
			var i:int
			for (i = 0; i < qtdePontos; i++) {				
				var dot:Dot = new Dot();
				dot.x = (Math.random() * (posicoes[DIR] - posicoes[ESQ] - 4)) + posicoes[ESQ] + 2
				dot.y = (Math.random() * (posicoes[BAIXO] - posicoes[CIMA] - 4)) + posicoes[CIMA] + 2
				dots.push(dot)
				this.addChild(dot)				
			}
			
		}
		
		private function initdraw():void
		{
			for (var i:int = 0; i < 5; i++) {
				var mv:Sprite = new Sprite();
				mv.graphics.beginFill(0x000000, 0.5)
				mv.graphics.drawRect(0, 0, 10, 10)
				mv.graphics.endFill();
				blocks.push(mv)
				addChild(mv)				
			}
			criarPontosArraste()
			redraw();
		}
		private function criarPontosArraste():void {
			ptos = new Vector.<PontoArraste>(4);
						
			ptos[CIMA] = new PontoArraste()
			this.addChild(ptos[CIMA])
			ptos[CIMA].x = maxX / 2
			ptos[CIMA].y = posicoes[CIMA]
			
			
			ptos[BAIXO] = new PontoArraste()
			this.addChild(ptos[BAIXO])
			ptos[BAIXO].x = maxX / 2
			ptos[BAIXO].y = posicoes[BAIXO]
						
			ptos[ESQ] = new PontoArraste()
			this.addChild(ptos[ESQ])
			ptos[ESQ].x = posicoes[ESQ]
			ptos[ESQ].y = maxY / 2
			
			ptos[DIR] = new PontoArraste()
			this.addChild(ptos[DIR])
			ptos[DIR].y = maxY / 2
			ptos[DIR].x = posicoes[DIR]	
			
			ptos[CIMA].addEventListener(MouseEvent.MOUSE_DOWN, pto_MouseDownVertical)
			ptos[BAIXO].addEventListener(MouseEvent.MOUSE_DOWN, pto_MouseDownVertical)
			ptos[ESQ].addEventListener(MouseEvent.MOUSE_DOWN, pto_MouseDownHorizontal)
			ptos[DIR].addEventListener(MouseEvent.MOUSE_DOWN, pto_MouseDownHorizontal)			
		}
		
		private function pto_MouseDownHorizontal(evt:MouseEvent) {
			pto = PontoArraste(evt.target)
			mouseOffAxis = new Point(mouseX-pto.x, mouseY-pto.y)
			stage.addEventListener(Event.ENTER_FRAME, pto_MouseMoveHorizontal)
			stage.addEventListener(MouseEvent.MOUSE_UP, pto_MouseUpHorizontal)
			
			for (var i:int = 0; i < 4; i++) {
				if (ptos[i] == pto) {
					ptoidx = i;
					break;
				}
			}
			clearPoints();
			
			
		}
		private function pto_MouseDownVertical(evt:MouseEvent) {
			pto = PontoArraste(evt.target)
			mouseOffAxis = new Point(mouseX-pto.x, mouseY-pto.y)
			stage.addEventListener(Event.ENTER_FRAME, pto_MouseMoveVertical)
			stage.addEventListener(MouseEvent.MOUSE_UP, pto_MouseUpVertical)
			
			for (var i:int = 0; i < 4; i++) {
				if (ptos[i] == pto) {
					ptoidx = i;
					break;
				}
			}
			clearPoints();
			
		}

		private function pto_MouseUpHorizontal(evt:MouseEvent) {
			stage.removeEventListener(Event.ENTER_FRAME, pto_MouseMoveHorizontal)
			stage.removeEventListener(MouseEvent.MOUSE_UP, pto_MouseUpHorizontal)
			drawPoints()
		}
		
		private function pto_MouseUpVertical(evt:MouseEvent) {
			stage.removeEventListener(Event.ENTER_FRAME, pto_MouseMoveVertical)
			stage.removeEventListener(MouseEvent.MOUSE_UP, pto_MouseUpVertical)
			drawPoints()
		}		

		private function pto_MouseMoveHorizontal(evt:Event) {
			var vantes:int = posicoes[ptoidx]
			var vatual:int = mouseX  - mouseOffAxis.x			
			vatual = devolvePosicaoAdequada(vatual, 20, maxX-20)
			
			//if(ptoidx  == ESQ){
//				vatual = devolvePosicaoAdequada(vatual, 0, pontoA)
//			} else {
//				vatual = devolvePosicaoAdequada(vatual, pontoB, maxX)
//			}
			pto.x = vatual;
			
			
			posicoes[ptoidx] = pto.x
			if (posicoes[DIR] < posicoes[ESQ]) {
				posicoes[ptoidx] = vantes
				pto.x = vantes				
			}
			
			redraw();
			
		}
		
		private function pto_MouseMoveVertical(evt:Event) {
			var vantes:int = posicoes[ptoidx]
			var vatual:int = mouseY - mouseOffAxis.y
			//trace(vatual, devolvePosicaoAdequada(vatual, valorMinFuncao, valorMaxFuncao), valorMinFuncao, valorMaxFuncao)
			//vatual = devolvePosicaoAdequada(vatual, 0, valorMaxFuncao)
			
			vatual = devolvePosicaoAdequada(vatual, 20, maxY - 50)
			//if(ptoidx  == CIMA){
//				vatual = devolvePosicaoAdequada(vatual, 0, valorMaxFuncao)
//			} else {
//				vatual = devolvePosicaoAdequada(vatual, valorMinFuncao, maxY)
//			}
			pto.y = vatual;			
			posicoes[ptoidx] = pto.y
			if (posicoes[BAIXO] < posicoes[CIMA]) {
				posicoes[ptoidx] = vantes
				pto.y = vantes				
			}
			
			redraw();
		}				
		
		public function get qtdePontos():int 
		{
			return _qtdePontos;
		}
		
		public function set qtdePontos(value:int):void 
		{
			_qtdePontos = value;
			redraw();
		}
		
		public function get dots():Vector.<Dot> 	{	return _dots;	}
		
		public function set dots(value:Vector.<Dot>):void 
		{
			_dots = value;
		}
		
		public function get posicoes():Array 	{	return _posicoes;	}
		
		public function set posicoes(value:Array):void 
		{
			_posicoes = value;
		}
		
	}
	
}