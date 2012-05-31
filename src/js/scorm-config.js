var learnername = ""; // Nome do aluno
var completed = false; // Status da AI: completada ou não
var score = 0; // Nota do aluno (de 0 a 100)
var scormExercise = 1; // Exercício corrente relevante ao SCORM
var screenExercise = 1; // Exercício atualmente visto pelo aluno (não tem relação com scormExercise)
var N_EXERCISES = 6; // Quantidade de exercícios desta AI
var scorm = pipwerks.SCORM; // Seção SCORM
scorm.version = "2004"; // Versão da API SCORM
var PING_INTERVAL = 5 * 60 * 1000; // milissegundos
var pingCount = 0; // Conta a quantidade de pings enviados para o LMS
var ai; // Referência para a AI (Flash)
var MAX_INIT_TRIES = 60;
var init_tries = 0;
var debug = true;
var SCORE_UNIT = 100/6;
var sorteado;//valor do indice da função
var currentScore = 0;
var exOk;

var funcao = [
  {
    f_display: "e <SUP> x </SUP>",
    if_display: "∫ f(x) dx = e <SUP> x </SUP>",
  },
  {
    f_display: "1/x",
    if_display: "∫ f(x) dx = ln |x|",
  },
  {
    f_display: "x <SUP> 3 </SUP> - 4x <SUP> 2 </SUP> - 11x + 30",
    if_display: "∫ f(x) dx = x<SUP>4</SUP>/4 - 4x<SUP>3</SUP>/3 - 11x<SUP>2</SUP>/2 + 30x",
  },
  /*{
    f_display: "x<SUP>3</SUP> - x<SUP>2</SUP> + 5",
    if_display: "∫ f(x) dx = x<SUP>4</SUP>/4 - x<SUP>3</SUP>/3 + 5x",
  },*/
  /*{
    f_display: "-ln|x|",
    if_display: "∫ f(x) dx = -ln|x|",
  },*/
  {
    f_display: "cos(x) + 2",
    if_display: "∫ f(x) dx = cos(x) + 2",     
  },
  {
    f_display: "x <SUP>2</SUP> + 1", //x<SUP>2</SUP> + 1
    if_display: "∫ f(x) dx = x <SUP>2</SUP> + 1",
  },
   {
    f_display: "sen(x) + 2",
    if_display: "∫ f(x) dx = sen(x) + 2",
  }
];

$(document).ready(init); // Inicia a AI.
$(window).unload(uninit); // Encerra a AI.

/*
 * Inicia a Atividade Interativa (AI)
 */
function init () {
  configAi();
  checkCallbacks();
}

/*
 * Encerra a Atividade Interativa (AI)
 */ 
function uninit () {
  if (!completed) {
    save2LMS();
    scorm.quit();
  }
}

function configAi () {
	
	var flashvars = {};
	flashvars.ai = "swf/AI-0107.swf";
	flashvars.width = "700";
	flashvars.height = "500";
	
	var params = {};
	params.menu = "false";
	params.scale = "noscale";

	var attributes = {};
	attributes.id = "ai";
	attributes.align = "middle";

	swfobject.embedSWF("swf/AI-0107.swf", "ai-container", flashvars.width, flashvars.height, "10.0.0", "expressInstall.swf", flashvars, params, attributes);
	
  //Deixa a aba "Orientações" ativa no carregamento da atividade
  $('#exercicios').tabs({ selected: 0 });

  // Configurações dos botões em geral
  $('.check-button').button().click(evaluateExercise);
  $('.check-button2').button().click(evaluateExercise);
  $('.check-button3').button().click(evaluateExercise);
  $('.check-button4').button().click(evaluateExercise);
  $('.check-button5').button().click(evaluateExercise);
  $('.check-button6').button().click(evaluateExercise);
  $('.next-button').button().click(habilitaVisual);
  $('.next-button3').button().click(habilitaVisual);
  $('.next-button4').button().click(habilitaVisual);
  
  //Começa com botão Próximo/Terminar desabilitado.
  $( ".check-button" ).button({ disabled: true });
  $( ".check-button2" ).button({ disabled: true });
  $( ".check-button3" ).button({ disabled: true });
  $( ".check-button5" ).button({ disabled: true })
  $( ".check-button6" ).button({ disabled: true });
  $( ".next-button" ).button({ disabled: true });
  $('.next-button3').button({ disabled: true });
  $( ".next-button5-a" ).button({ disabled: true });
  $( ".next-button5-b" ).button({ disabled: true });
  $( ".next-button5-c" ).button({ disabled: true });
}


//sorteia N.
//n entre 15 e 20
var n = Math.round(15 + 5 * Math.random());

function selectExercise (exercise) {
	switch(exercise) {
		case 1:
			console.log("Configurando o exercício 1");
			
			ai.setVisible("M",false);
			ai.setVisible("LOWER_SUM",true);
			ai.setVisible("UPPER_SUM",false);
			ai.setVisible("AREA",false);
			ai.setVisible("PARALLELOGRAM_SUM",false);
			ai.setVisible("MEAN_VALUE",false);
			ai.setVisible("MONTE_CARLO",false);
			ai.set("N",5);
			
		//MODO DE DEBUG
		//var right_answer = ai.get("LOWER_SUM");
		//var right_answer2 = ai.get("UPPER_SUM");
		//console.log('resposta correta:' + right_answer);
		//console.log('resposta2 correta:' + right_answer2);
			break;
			
		case 2:
			console.log("Configurando o exercício 2");
			
			//Bloquear os pontos A e B
			ai.lock("A", true);
			ai.lock("B", true);
			//console.log(n);
			ai.set("N", n);
			ai.setVisible("LOWER_SUM",true);
			ai.setVisible("UPPER_SUM",false);
			ai.setVisible("AREA",false);
			ai.setVisible("PARALLELOGRAM_SUM",false);
			ai.setVisible("MEAN_VALUE",false);
			ai.setVisible("MONTE_CARLO",false);	
			
		//MODO DE DEBUG
		//var right_answer_1 = ai.get("N");
		//var right_answer_2 = ai.get("LOWER_SUM");
		//var right_answer_3 = ai.get("UPPER_SUM");
		//console.log('resposta 1 correta:' + right_answer_1);
		//console.log('resposta 2 correta:' + right_answer_2);
		//console.log('resposta 3 correta:' + right_answer_3);
		
			break;
			
		case 3:
			console.log("Configurando o exercício 3");
			
			//Bloquear os pontos A e B
			ai.lock("A", true);
			ai.lock("B", true);
			
			ai.setVisible("LOWER_SUM",true);
			ai.setVisible("UPPER_SUM",false);
			ai.setVisible("AREA",false);
			ai.setVisible("PARALLELOGRAM_SUM",false);
			ai.setVisible("MEAN_VALUE",false);
			ai.setVisible("MONTE_CARLO",false);
            ai.set("N", 1000);
			var s_inf = Number(ai.get("LOWER_SUM"));
			var s_sup = Number(ai.get("UPPER_SUM"));
			var n_casas = -Math.floor(Math.log(s_sup - s_inf)/Math.log(10));
			ai.set("N",5);
			
			$('#s_inf').html(s_inf.toFixed(n_casas).replace(".", ","));
			$('#s_sup').html(s_sup.toFixed(n_casas).replace(".", ","));
			
			//Mostra função sorteada no corpo do exercício 3.
			$('#ex3_funcao').html(funcao[sorteado].f_display);
			
		//MODO DE DEBUG
		//var right_answer_1 = ai.get("AREA");
		//console.log('resposta 1 correta:' + right_answer_1);
	
			break;
			
		case 4:
			console.log("Configurando o exercício 4");
			
			//Bloquear os pontos A e B
			ai.lock("A", true);
			ai.lock("B", true);

			ai.setVisible("LOWER_SUM",false);
			ai.setVisible("UPPER_SUM",false);
			ai.setVisible("AREA",true);
			ai.setVisible("PARALLELOGRAM_SUM",false);
			ai.setVisible("MEAN_VALUE",true);
			ai.setVisible("MONTE_CARLO",false);
			ai.setVisible("M", true);
			
		//MODO DE DEBUG
		//var right_answer_1 = ai.get("MEAN_VALUE");
		//console.log('resposta 1 correta:' + right_answer_1);
		
			break;
			
		case 5:
			console.log("Configurando o exercício 5");
			
			//Bloquear os pontos A e B
			ai.lock("A", true);
			ai.lock("B", true);
			
			ai.setVisible("LOWER_SUM",false);
			ai.setVisible("UPPER_SUM",false);
			ai.setVisible("AREA",true);
			ai.setVisible("PARALLELOGRAM_SUM",false);
			ai.setVisible("MEAN_VALUE",true);
			ai.setVisible("MONTE_CARLO",false);
			ai.setVisible("M", true);
			
		//MODO DE DEBUG
		//console.log('resposta correta em ordem: \na)MAIOR \nb)MENOR \nc)MAIOR \nd)MAIOR');
		
			break;
		
		case 6:
			console.log("Configurando o exercício 6");
			
			//Bloquear os pontos A e B
			ai.lock("A", true);
			ai.lock("B", true);
			
			ai.setVisible("LOWER_SUM",false);
			ai.setVisible("UPPER_SUM",false);
			ai.setVisible("AREA",false);
			ai.setVisible("PARALLELOGRAM_SUM",true);
			ai.setVisible("MEAN_VALUE",false);
			ai.setVisible("MONTE_CARLO",false);
			ai.setVisible("A", false);
			ai.setVisible("B", false);
			ai.setVisible("M", false);
			
		//MODO DE DEBUG
		//var right_answer_1 = ai.get("PARALLELOGRAM_SUM");
		//console.log('resposta 1 correta:' + right_answer_1);
		
			break;
			
		default:
			console.log("Ops! Isto não devia tera acontecido!");
			break;
	}
}

function checkCallbacks () {
	var swfOK = false;
	var t2 = new Date().getTime();
	ai = document.getElementById("ai");
	try {
		ai.doNothing();
		message("swf ok!");
		swfOK = true;
	}
	catch(error) {
		++init_tries;
		
		if (init_tries > MAX_INIT_TRIES) {
			alert("Carregamento falhou.");
		}
		else {
			message("falhou");
			setTimeout("checkCallbacks()", 1000);
		}
	}
	
	if(swfOK) iniciaAtividade();
}

function getAi(){
	ai = document.getElementById("ai");
	iniciaAtividade();
}

// Inicia a AI.
function iniciaAtividade(){       
  
  //INICIALIZA A ATIVIDADE 
  applyAndSortFunctions();  
  
  //Configura exibição do gráfico
  ai.setVisible("MEAN_VALUE",false);
  
  // Habilita/desabilita a visualização da mediatriz
  $('#exercicios').tabs({
    select: function(event, ui) {
    
      screenExercise = ui.index;  
	  selectExercise(screenExercise);
	  
    }
  });

  //Configuração do botão inverter do primeiro e segundo exercício
  /*$('.invert-button').button().click(function(){
	var value01 = $("input[type=text][id=U-ex1]").val();
	var value02 = $("input[type=text][id=K-ex1]").val();
	$("input[type=text][id=U-ex1]").val(value02);
	$("input[type=text][id=K-ex1]").val(value01);
  });
    $('.invert-button2').button().click(function(){
	var value01 = $("input[type=text][id=lower-sum-ex2]").val();
	var value02 = $("input[type=text][id=upper-sum-ex2]").val();
	$("input[type=text][id=lower-sum-ex2]").val(value02);
	$("input[type=text][id=upper-sum-ex2]").val(value01);
  });*/
 
  //Configuração do radio button do primeiro exercicio
  $("input[name='choice']").change(function(){
	if ($("input[name='choice']:checked").val() == 'inf'){
		ai.setVisible("LOWER_SUM",true);
		ai.setVisible("UPPER_SUM",false);
		ai.setVisible("AREA",false);
		ai.setVisible("PARALLELOGRAM_SUM",false);
		ai.setVisible("MEAN_VALUE",false);
		ai.setVisible("MONTE_CARLO",false);
	}
	else if ($("input[name='choice']:checked").val() == 'sup'){
		ai.setVisible("LOWER_SUM",false);
		ai.setVisible("UPPER_SUM",true);
		ai.setVisible("AREA",false);
		ai.setVisible("PARALLELOGRAM_SUM",false);
		ai.setVisible("MEAN_VALUE",false);
		ai.setVisible("MONTE_CARLO",false);
	}
	});
	
  //Configuração do radio button do segundo exercicio
  $("input[name='choice2']").change(function(){
	if ($("input[name='choice2']:checked").val() == 'inf'){
		ai.setVisible("LOWER_SUM",true);
		ai.setVisible("UPPER_SUM",false);
		ai.setVisible("AREA",false);
		ai.setVisible("PARALLELOGRAM_SUM",false);
		ai.setVisible("MEAN_VALUE",false);
		ai.setVisible("MONTE_CARLO",false);
	}
	else if ($("input[name='choice2']:checked").val() == 'sup'){
		ai.setVisible("LOWER_SUM",false);
		ai.setVisible("UPPER_SUM",true);
		ai.setVisible("AREA",false);
		ai.setVisible("PARALLELOGRAM_SUM",false);
		ai.setVisible("MEAN_VALUE",false);
		ai.setVisible("MONTE_CARLO",false);
	}
	});	

  //$('#reiniciar').button().click(reloadPage);
  $('#next-button4-2').button().click(MostraTexto);
  $('#next-button4-3').button().click(MostraTexto2);
  $('#next-button5-a').button().click(MostraTexto3);
  $('#next-button5-b').button().click(MostraTexto4);
  $('#next-button5-c').button().click(MostraTexto5);
    
  //Textfields aceitam apenas número, ponto e vírgula.
  $('input').keypress(function(e) {
	var a = [];
    var k = e.which;
    
    for (i = 44; i < 58; i++)
		if (i != 47) a.push(i)
    
        if (!($.inArray(k,a)>=0))
            e.preventDefault();
  });
  
  $('input').keyup(function(e) {
		
	var value01 = $("input[type=text][id=U-ex1]").val();
	var value02 = $("input[type=text][id=K-ex1]").val();
	var value03 = $("input[type=text][id=U-ex3]").val();
	var value04 = $("input[type=text][id=N-ex2]").val();
	var value05 = $("input[type=text][id=lower-sum-ex2]").val();
	var value06 = $("input[type=text][id=upper-sum-ex2]").val();
	var value07 = $("input[type=text][id=X-ex6]").val();
  
	//Habilitar Próximo
	if(screenExercise == 1){
		if(value01 != '' || value02 != '' ) {
			//Habilita botão de próximo no exercicio 1.
			if(!bt1ProxEnabled){
				$( ".next-button" ).button({ disabled: false });
				bt1ProxEnabled = true;
			}
		}
		if(value01 != '' && value02 != '' ) {
			//Habilita botão Terminar no exercicio 1.
				$( ".check-button" ).button({ disabled: false });
			
		}
	}
	if(screenExercise == 2) {
		if(value04 != '' && value05 != '' && value06 != '') {
		    //Habilita botão Terminei no exercicio 2.
			$( ".check-button2" ).button({ disabled: false });
	    }
	}
	if(screenExercise == 3) {
		if(value03 != '') {
			//Habilita botão de próximo no exercicio 3.
			if(!bt2ProxEnabled){
				$( ".check-button3" ).button({ disabled: false });
				bt2ProxEnabled = true;
			}
	    }
	}
	if(screenExercise == 6) {
		if(value07 != '') {
			//Habilita botão Terminei no exercicio 6.
			$( ".check-button6" ).button({ disabled: false });
	    }
	}
	
	
	
  });
  

  
  initAI();
  
}

var bt1ProxEnabled = false;
var bt2ProxEnabled = false;

//função para testar input nos boxes - apenas números, pontos e vírgulas.
/*function checkNum(x)
{  
  if (!(/^\d+(\.\d+)?(\,\d+)?$/.test(x)))
  {
	//alert("Verificar preenchimento dos campos! \nLetras não são permitidas.");
	//x.focus();
	return false;
  }
  return true;
  
}*/

//Refresh da Página.
/*function reloadPage()
{
	document.getElementById("limpa").reset();
	
	//reabilita caixas de seleção.
	document.selects.ex5_select_01.disabled = false;
	document.selects.ex5_select_02.disabled = false;
	document.selects.ex5_select_03.disabled = false;
	document.selects.ex5_select_04.disabled = false;
    
	//seta todos os options na primeira posição.
	document.selects.ex5_select_01[0].selected = true;
	document.selects.ex5_select_02[0].selected = true;
	document.selects.ex5_select_03[0].selected = true;
	document.selects.ex5_select_04[0].selected = true;

	window.location.reload() 
}*/

//Verificar selects do Exercício 5 e ativa/desativa botão Próximo.
function verificaSelect() {

   	var valor1 = document.selects.ex5_select_01.value; 
	var valor2 = document.selects.ex5_select_02.value;
	var valor3 = document.selects.ex5_select_03.value;
	var valor4 = document.selects.ex5_select_04.value;
	if (valor1 != '') { 
		$( ".next-button5-a" ).button({ disabled: false });
		document.selects.ex5_select_01.disabled = true;
	}
	if (valor2 != ''){ 
		$( ".next-button5-a" ).button({ disabled: true });
		$( ".next-button5-b" ).button({ disabled: false });	
		document.selects.ex5_select_02.disabled = true;
	}
	if (valor3 != '') { 
	    $( ".next-button5-a" ).button({ disabled: true });
	    $( ".next-button5-b" ).button({ disabled: true });
		$( ".next-button5-c" ).button({ disabled: false });
		document.selects.ex5_select_03.disabled = true;
	}	
	if (valor4 != '') { 
	    $( ".next-button5-a" ).button({ disabled: true });
	    $( ".next-button5-b" ).button({ disabled: true });
	    $( ".next-button5-c" ).button({ disabled: true });
		$( ".check-button5" ).button({ disabled: false });
		document.selects.ex5_select_04.disabled = true;
	}	
} 

//Mostra bloco do Exercício 4:Frame4-3
function MostraTexto()
{
  document.getElementById('frame04-3').style.display="block";
  $( ".next-button4-2" ).button({ disabled: true });
}

//Mostra bloco do Exercício 4:Frame4-4
function MostraTexto2()
{
  document.getElementById('frame04-4').style.display="block";
  $( ".next-button4-3" ).button({ disabled: true });
}

function MostraTexto3()
{
  document.getElementById('ex5b').style.display="block";
  $( ".next-button5-a" ).button({ disabled: true });
}

function MostraTexto4()
{
  document.getElementById('ex5c').style.display="block";
  $( ".next-button5-b" ).button({ disabled: true });
}

function MostraTexto5()
{
  document.getElementById('ex5d').style.display="block";
  $( ".next-button5-c" ).button({ disabled: true });
} 
 
 
/*
 * Inicia a AI.
 */ 
function initAI () {
 
  // Conecta-se ao LMS
  var connected = scorm.init();
  
  // A tentativa de conexão com o LMS foi bem sucedida.
  if (connected) {
	
	if(scorm.get("cmi.mode") != "normal") return;
	
	scorm.set("cmi.exit","suspend");
    // Verifica se a AI já foi concluída.
    var completionstatus = scorm.get("cmi.completion_status");
    
    // A AI já foi concluída.
    switch (completionstatus) {
    
      // Primeiro acesso à AI
      case "not attempted":
      case "unknown":
      default:
        completed = false;
        learnername = scorm.get("cmi.learner_name");
        scormExercise = 1;
        score = 0;
        
        $("#completion-message").removeClass().addClass("completion-message-off");     
        break;
        
      // Continuando a AI...
      case "incomplete":
        completed = false;
        learnername = scorm.get("cmi.learner_name");
        scormExercise = parseInt(scorm.get("cmi.location"));
        score = parseInt(scorm.get("cmi.score.raw"));
        
        $("#completion-message").removeClass().addClass("completion-message-off");
        break;
        
      // A AI já foi completada.
      case "completed":
        completed = true;
        learnername = scorm.get("cmi.learner_name");
        scormExercise = parseInt(scorm.get("cmi.location"));
        score = parseInt(scorm.get("cmi.score.raw"));
        
        $("#completion-message").removeClass().addClass("completion-message-on");
        break;
    }
    
    if (isNaN(scormExercise)) scormExercise = 1;
    if (isNaN(score)) score = 0;
    
    // Posiciona o aluno no exercício da vez
    screenExercise = scormExercise;
    $('#exercicios').tabs("select", scormExercise - 1);  
	       
    pingLMS(); 
  }
  // A tentativa de conexão com o LMS falhou.
  else {
    completed = false;
    learnername = "";
    scormExercise = 1;
    score = 0;
    log.error("A conexão com o Moodle falhou.");
  }
  
  // (Re)abilita os exercícios já feitos e desabilita aqueles ainda por fazer.
	if (completed) $('#exercicios').tabs("option", "disabled", []);
	else {
		$('#exercicios').tabs((scormExercise >= 1 ? "enable": "disable"), 1);
		$('#exercicios').tabs((scormExercise >= 2 ? "enable": "disable"), 2);
		$('#exercicios').tabs((scormExercise >= 3 ? "enable": "disable"), 3);
		$('#exercicios').tabs((scormExercise >= 4 ? "enable": "disable"), 4);
		$('#exercicios').tabs((scormExercise >= 5 ? "enable": "disable"), 5);
		$('#exercicios').tabs((scormExercise >= 6 ? "enable": "disable"), 6);
		
	}
}

/*
 * Salva cmi.score.raw, cmi.location e cmi.completion_status no LMS
 */ 
function save2LMS () {
  if (scorm.connection.isActive) {
  
	if(scorm.get("cmi.mode") != "normal") return;
  
    // Salva no LMS a nota do aluno.
    var success = scorm.set("cmi.score.raw", score);
  
    // Notifica o LMS que esta atividade foi concluída.
    success = scorm.set("cmi.completion_status", (completed ? "completed" : "incomplete"));
	
    success = scorm.set("cmi.success_status", (completed ? "passed" : "failed"));
    
    // Salva no LMS o exercício que deve ser exibido quando a AI for acessada novamente.
    success = scorm.set("cmi.location", scormExercise);
    
    if (!success) log.error("Falha ao enviar dados para o LMS.");
  }
  else {
    log.trace("A conexão com o LMS não está ativa.");
  }
}

/*
 * Mantém a conexão com LMS ativa, atualizando a variável cmi.session_time
 */
function pingLMS () {

	scorm.get("cmi.completion_status");
	var timer = setTimeout("pingLMS()", PING_INTERVAL);
}

/*
 * Avalia a resposta do aluno ao exercício atual. Esta função é executada sempre que ele pressiona "terminei".
 */ 
function evaluateExercise (event) {
  
  // Avalia a nota
  var currentScore = getScore(screenExercise);
  score += currentScore / N_EXERCISES;
  
  if(exOk == false) return;
  console.log(screenExercise + "\t" + currentScore);
  // Mostra a mensagem de erro/acerto
  feedback(screenExercise, currentScore);
 
  // Atualiza a nota do LMS (apenas se a questão respondida é aquela esperada pelo LMS)
  if (!completed && screenExercise == scormExercise) {
    score = Math.max(0, Math.min(score + currentScore, 100));
    
    if (scormExercise < N_EXERCISES) {
      nextExercise();
    }
    else {
      completed = true;
      scormExercise = 1;
      save2LMS();
      scorm.quit();
    }
  }
}


/*
 * Prepara o próximo exercício.
 */ 
function nextExercise () {
  if (scormExercise < N_EXERCISES) ++scormExercise;
  
  $('#exercicios').tabs("enable", scormExercise);
}


/*
 * Habilita a visualização de outros "frames"
 */

 function habilitaVisual (event) {
	switch (screenExercise) {
		
		// Caso seja o ex1
		case 1:
			document.getElementById('frame02').style.display="block";
			$( ".next-button" ).button({ disabled: true });
			ai.setVisible("LOWER_SUM",false);
			ai.setVisible("UPPER_SUM",true);
			ai.setVisible("AREA",false);
			ai.setVisible("PARALLELOGRAM_SUM",false);
			ai.setVisible("MEAN_VALUE",false);
			ai.setVisible("MONTE_CARLO",false);
			$('input[name="choice"]')[1].checked = true;//altera posição do radio button
			
			break;
			
		// Caso seja o ex3	 
		case 3:
						
			//document.getElementById('frame03').style.display="block";
			//$( ".next-button3" ).button({ disabled: true });
			
			
			break;
			
		// Caso seja o ex4	
		case 4:
			document.getElementById('frame04-2').style.display="block";
			$(".next-button4").button({ disabled: true });		
			break;
			
	}
}

var TOLERANCE = 0.01;

function evaluate (user_answer, right_answer, tolerance) {
	return Math.abs(user_answer - right_answer) <= tolerance * Math.abs(right_answer);
}

/*
 * Avalia a nota do aluno num dado exercício.
 */ 
function getScore (exercise) {

  ans = 0;
  exOk = true;
  switch (exercise) {
  
    // Avalia a nota do exercício 1
    case 1:
		var n = ai.get("N");
		var value01 = $("input[type=text][id=U-ex1]").val();
		var value02 = $("input[type=text][id=K-ex1]").val();
		if (value01 == '' || value02 == '' ){ 
			alert('Preencher todos os campos!');
			exOk = false;
			return;
		}
  
		var field = $("#U-ex1");
		var field2 = $("#K-ex1");
		var user_answer = parseFloat(field.val().replace(",", "."));
		var user_answer2 = parseFloat(field2.val().replace(",", "."));
		
		//desabilitar caixas de texto, botão Inverter e Terminei.
		$( ".invert-button" ).button({ disabled: true });
		$( "#U-ex1" ).attr("disabled",true);
        $( "#K-ex1" ).attr("disabled",true);
		$( "#radio1" ).attr("disabled",true);
		$( "#radio2" ).attr("disabled",true);
		$( ".check-button" ).button({ disabled: true });
		
		var right_answer = ai.get("LOWER_SUM");
		var right_answer2 = ai.get("UPPER_SUM");
		//console.log('resposta do usuário:' + user_answer);
		//console.log('resposta correta:' + right_answer);
		//console.log('resposta 2 do usuário:' + user_answer2);
		//console.log('resposta correta:' + right_answer2);
		//console.log(evaluate(user_answer, right_answer, TOLERANCE));
		//console.log(evaluate(user_answer2, right_answer2, TOLERANCE));
				
		if (evaluate(user_answer, right_answer, TOLERANCE)) {
			ans += 50;
			field.css("background-color", "#66CC33");
		}
		else {
			field.css("background-color", "#FA5858");
		}

		if (evaluate(user_answer2, right_answer2, TOLERANCE)) {
			ans += 50;
			field2.css("background-color", "#66CC33");
		}
		else {
			field2.css("background-color", "#FA5858");
		}
		
		break;
		
		
		
	  // Avalia a nota do ex2
	  case 2:
	    
		//Verifica se existe algum campo vazio.
		var value03 = $("input[type=text][id=N-ex2]").val();
		var value04 = $("input[type=text][id=lower-sum-ex2]").val();
		var value05 = $("input[type=text][id=upper-sum-ex2]").val();
 
		if(value03 == '' || value04 == '' || value05 == '') {
			alert ('Preencher todos os campos!');
			exOk = false;
			return;
		}/*else if (!checkNum(value03) || !checkNum(value04) || !checkNum(value05)){
			alert('Não é permitido letras!');
			exOk = false;
			return;
		}*/
	  
  		//desabilitar caixas de texto, botão Inverter e Terminei.
		$( ".invert-button2" ).button({ disabled: true });
		$( "#N-ex2" ).attr("disabled",true);
		$( "#upper-sum-ex2" ).attr("disabled",true);
        $( "#lower-sum-ex2" ).attr("disabled",true);
		$( "#radio2-1" ).attr("disabled",true);
		$( "#radio2-2" ).attr("disabled",true);
		$( ".check-button2" ).button({ disabled: true });
		
		var user_answer_1 = parseFloat($("#N-ex2").val().replace(",","."));
		var user_answer_2 = parseFloat($("#lower-sum-ex2").val().replace(",","."));
		var user_answer_3 = parseFloat($("#upper-sum-ex2").val().replace(",","."));
	
		var right_answer_1 = ai.get("N");
		var right_answer_2 = ai.get("LOWER_SUM");
		var right_answer_3 = ai.get("UPPER_SUM");
		
		if (evaluate(user_answer_1, right_answer_1, TOLERANCE)) {
			ans += 100 / 3;
			$("#N-ex2").css("background-color", "#66CC33");
		}
		else {
			$("#N-ex2").css("background-color", "#FA5858");
		}
		
		if (evaluate(user_answer_2, right_answer_2, TOLERANCE)) {
			ans += 100 / 3;
			$("#lower-sum-ex2").css("background-color", "#66CC33");
		}
		else {
			$("#lower-sum-ex2").css("background-color", "#FA5858");		
		}
		
		if (evaluate(user_answer_3, right_answer_3, TOLERANCE)) {
			ans += 100 / 3;
			$("#upper-sum-ex2").css("background-color", "#66CC33");
		}
		else {
			$("#upper-sum-ex2").css("background-color", "#FA5858");
		}
		
		ans = Math.round(ans);
		
	  
		break;
		
	  // Avalia a nota do ex3
	  case 3:
	    
	  var user_answer_1 = parseFloat($("#U-ex3").val().replace(",","."));			
	  var right_answer_1 = ai.get("AREA");
		
		//Desabilita botão Terminei.
		$( ".check-button3" ).button({ disabled: true });
		
		if (evaluate(user_answer_1, right_answer_1, TOLERANCE)) {
			ans += 100;
			$("#U-ex3").css("background-color", "#66CC33");
		}
		else {
			$("#U-ex3").css("background-color", "#FA5858");
		}
		
		ans = Math.round(ans);
	  
		break;
		
	  // Avalia a nota do ex4
	  case 4:

		var user_answer = ai.get("FUNCTION_VALUE", ai.get("M"));
	    var right_answer_1 = ai.get("MEAN_VALUE");
		
		//Desabilita botão Terminei.
		$( ".check-button4" ).button({ disabled: true });
		
		if (evaluate(user_answer, right_answer_1, 0.1)) {
			ans += 100;
			
		}
	    
		ans = Math.round(ans);
		
		break;
		
	  // Avalia a nota do ex5
	  case 5:
	  
	  //Desabilita botão Terminei.
	  $( ".check-button5" ).button({ disabled: true });
	  
	  var valor1 = document.selects.ex5_select_01.value;
	  var valor2 = document.selects.ex5_select_02.value;
	  var valor3 = document.selects.ex5_select_03.value;
	  var valor4 = document.selects.ex5_select_04.value;
	  //verifica se tem algum select não selecionado. 
	  //if (valor1 != '' && valor2 != '' && valor3 != '' && valor4 != '' ) {
	  //desabilita os selects após clique no botão 'terminei'
	  /*document.selects.ex5_select_01.disabled = true;
		document.selects.ex5_select_02.disabled = true;
		document.selects.ex5_select_03.disabled = true;
		document.selects.ex5_select_04.disabled = true; 
	  }
	  else { 
		alert ("Preencha todos os itens!") 
	  }*/
				
	  if (valor1 == 'menor') {
          $('#message5a').html('O correto seria: >').removeClass().addClass("wrong-answer");
      } else {      
	      $('#message5a').html('Resposta correta!').removeClass().addClass("right-answer");
		  ans += 100 / 4;
      }
	  if (valor2 == 'maior') {
          $('#message5b').html('O correto seria: <').removeClass().addClass("wrong-answer");
      } else {      
		  ans += 100 / 4;
	      $('#message5b').html('Resposta correta!').removeClass().addClass("right-answer");
      }
	  if (valor3 == 'menor') {
          $('#message5c').html('O correto seria: >').removeClass().addClass("wrong-answer");
      } else {      
		  ans += 100 / 4;
	      $('#message5c').html('Resposta correta!').removeClass().addClass("right-answer");
      }
	  if (valor4 == 'menor') {
          $('#message5d').html('O correto seria: >').removeClass().addClass("wrong-answer");
      } else {      
		  ans += 100 / 4;
	      $('#message5d').html('Resposta correta!').removeClass().addClass("right-answer");
      }
	  
	  ans = Math.round(ans);
	   	  	  	    
		break;
		
	  // Avalia a nota do ex6
	  case 6:
	  
		//Verifica se existe algum campo vazio.
		var value01 = $("input[type=text][id=X-ex6]").val();
 
		if(value01 == '') {
			alert ('Preencher todos os campos!');
			exOk = false;
			return;
		}
	  
	  //Desabilita botão Terminei.
	  $( ".check-button6" ).button({ disabled: true });
	  
	  //Desabilita textfield.
	  $( "#X-ex6" ).attr("disabled",true);
		
	  var user_answer_1 = parseFloat($("#X-ex6").val().replace(",","."));				
	  var right_answer_1 = ai.get("PARALLELOGRAM_SUM");
				
	  if (evaluate(user_answer_1, right_answer_1, TOLERANCE)) {
		ans += 100;
		$("#X-ex6").css("background-color", "#008800");
	  }
	  else {
		$("#X-ex6").css("background-color", "#FA5858");
	  }
		
	  ans = Math.round(ans);
	  
	  break;

    }
  return ans;
}

/*
 * Exibe a mensagem de erro/acerto (feedback) do aluno para um dado exercício e nota (naquele exercício).
 */ 
function feedback (exercise, score) {
                       
  switch (exercise) {

    // Feedback da resposta ao exercício 1
    case 1:	
      if (score == 100) {
          $('#message1').html('Resposta correta!').removeClass().addClass("right-answer");
      } else {
			var lower_sum = Number(ai.get("LOWER_SUM")).toFixed(2).replace(".", ",");	
			var upper_sum = Number(ai.get("UPPER_SUM")).toFixed(2).replace(".", ",");  
			
			
			var src = "img/int_ex1_red.gif";
                       
						
            $('#message1').html('O correto seria: ' + lower_sum + '  <img style="vertical-align:middle;" src=' + src + '></img>  ' + upper_sum +'.').removeClass().addClass("wrong-answer");
        }
      
      break;
    
    // Feedback da resposta ao exercício 2
    case 2:
      if (score == 100) {
          $('#message2').html('Resposta correta!').removeClass().addClass("right-answer");
      } else {
			var N_number = Number(ai.get("N")).toFixed(0).replace(".", ",");			
			var lower_sum = Number(ai.get("LOWER_SUM")).toFixed(2).replace(".", ",");	
			var upper_sum = Number(ai.get("UPPER_SUM")).toFixed(2).replace(".", ",");
					      
          $('#message2').html('O correto seria: para N = ' + N_number + ', a soma inferior é igual a ' + lower_sum + ' e a soma superior é ' + upper_sum +'.').removeClass().addClass("wrong-answer");
      }
      break;
	  
    // Feedback da resposta ao exercício 3
    case 3:
      if (score == 100) {
          $('#message3').html('Resposta correta!').removeClass().addClass("right-answer");
		  document.getElementById('frame03').style.display="block";
      } else {
		  var resposta = Number(ai.get("AREA")).toFixed(2).replace(".", ",");	
			      
          $('#message3').html('O correto seria ' + resposta +'.').removeClass().addClass("wrong-answer");
		  document.getElementById('frame03').style.display="block";
      }
      
      break;	  

    // Feedback da resposta ao exercício 4
    case 4:
	  if (score == 100) {
          $('#message4').html('Resposta correta!').removeClass().addClass("right-answer");
      } else {
		  var resposta = Number(ai.get("FUNCTION_VALUE", ai.get("M"))).toFixed(2).replace(".", ",");
          var correto = Number(ai.get("MEAN_VALUE")).toFixed(2).replace(".", ",");
		  
		  ai.set("M",ai.get("FUNCTION_INVERSE", correto));
			      
          $('#message4').html('Sua resposta foi M = ' + resposta + ', mas o correto seria ' + correto + ' (veja na figura acima: eu reposicionei M no local correto).').removeClass().addClass("wrong-answer");
      }
	
      break;
	  
    // Feedback da resposta ao exercício 5
    case 5:   	
	var valor1 = document.selects.ex5_select_01.value; 
	var valor2 = document.selects.ex5_select_02.value;
	var valor3 = document.selects.ex5_select_03.value;
	var valor4 = document.selects.ex5_select_04.value;
	if (valor1 == 'menor') {document.getElementById('feedback5-a').style.display="block";}
	if (valor2 == 'maior') {document.getElementById('feedback5-b').style.display="block";}
	if (valor3 == 'menor') {document.getElementById('feedback5-c').style.display="block";}	
	if (valor4 == 'menor') {document.getElementById('feedback5-d').style.display="block";}
      if (valor1 == 'menor') {
		  document.getElementById('feedback5-a').style.display="block";
          $('#message5a').html('O correto seria: >').removeClass().addClass("wrong-answer");
      } else {      
	      $('#message5a').html('Resposta correta!').removeClass().addClass("right-answer");
      }
	  if (valor2 == 'maior') {
	      document.getElementById('feedback5-b').style.display="block"; 
          $('#message5b').html('O correto seria: <').removeClass().addClass("wrong-answer");
      } else {      
	      $('#message5b').html('Resposta correta!').removeClass().addClass("right-answer");
      }
	  if (valor3 == 'menor') {
	      document.getElementById('feedback5-c').style.display="block";
          $('#message5c').html('O correto seria: >').removeClass().addClass("wrong-answer");
      } else {      
	      $('#message5c').html('Resposta correta!').removeClass().addClass("right-answer");
      }
	  if (valor4 == 'menor') {
	      document.getElementById('feedback5-d').style.display="block";
          $('#message5d').html('O correto seria: >').removeClass().addClass("wrong-answer");
      } else {      
	      $('#message5d').html('Resposta correta!').removeClass().addClass("right-answer");
      }
	   
      break;
	  
    // Feedback da resposta ao exercício 6
    case 6:
      if (score == 100) {
          $('#message6').html('Resposta correta!').removeClass().addClass("right-answer");
      } else {
		  var resposta = Number(ai.get("PARALLELOGRAM_SUM")).toFixed(2).replace(".", ",");	
			      
          $('#message6').html('O correto seria ' + resposta +'.').removeClass().addClass("wrong-answer");
      }
      
      break;
  }
}


var log = {};

log.trace = function (message) {
  if(window.console && window.console.firebug){
    console.log(message);
  }
  else {
    alert(message);
  }  
}

log.error = function (message) {
  if( (window.console && window.console.firebug) || console){
    console.error(message);
  }
  else {
    alert(message);
  }
}

function applyAndSortFunctions(){
	sorteado = rand(0,funcao.length-1);
	ai.setFunction(funcao[sorteado].f_display);
	alert(sorteado);
}

function rand(l,u) // lower bound and upper bound
{
	return Math.floor((Math.random() * (u-l+1))+l);
}

// Mensagens de log
function message (m) {
	try {
		if (debug) console.log(m);
	}
	catch (error) {
		// Nada.
	}
}

