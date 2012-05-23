package  
{
	import flash.geom.Point;
	/**
	 * ...
	 * @author Alexandre
	 */
	public class FunctionInfo
	{
		private var _funcao:Function;
		private var _xAxis:Point;
		private var _yAxis:Point;
		private var _posA:Number;
		private var _posB:Number;
		private var _posMean:Number;
		private var _stringFunction:String;
		private var _primitiva:Function;
		private var _stringPrimitiva:String;
		
		public function FunctionInfo(funcao:Function, primitiva:Function, xAxis:Point, yAxis:Point, posA:Number, posB:Number, posMean:Number, stringFunction:String, stringPrimitiva:String) 
		{
			this.funcao = funcao;
			this.primitiva = primitiva;
			this.xAxis = xAxis;
			this.yAxis = yAxis;
			this.posA = posA;
			this.posB = posB;
			this.posMean = posMean;
			this.stringFunction = stringFunction;
			this.stringPrimitiva = stringFunction;
		}
		
		public function get funcao():Function { return _funcao; }
		
		public function set funcao(value:Function):void 
		{
			_funcao = value;
		}
		
		public function get xAxis():Point { return _xAxis; }
		
		public function set xAxis(value:Point):void 
		{
			//if (_xAxis == null) _xAxis = new Point();
			//_xAxis.x = value.x;
			//_xAxis.y = value.y;
			
			_xAxis = value;
		}
		
		public function get yAxis():Point { return _yAxis; }
		
		public function set yAxis(value:Point):void 
		{
			_yAxis = value;
		}
		
		public function get posA():Number { return _posA; }
		
		public function set posA(value:Number):void 
		{
			_posA = value;
		}
		
		public function get posB():Number { return _posB; }
		
		public function set posB(value:Number):void 
		{
			_posB = value;
		}
		
		public function get posMean():Number { return _posMean; }
		
		public function set posMean(value:Number):void 
		{
			_posMean = value;
		}
		
		public function get stringFunction():String { return _stringFunction; }
		
		public function set stringFunction(value:String):void 
		{
			_stringFunction = value;
		}
		
		public function get primitiva():Function { return _primitiva; }
		
		public function set primitiva(value:Function):void 
		{
			_primitiva = value;
		}
		
		public function get stringPrimitiva():String { return _stringPrimitiva; }
		
		public function set stringPrimitiva(value:String):void 
		{
			_stringPrimitiva = value;
		}
		
	}

}