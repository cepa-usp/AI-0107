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
var SCORE_UNIT = 100/6;
var sorteado;//valor do indice da função
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
  {
    f_display: "x<SUP>3</SUP> - x<SUP>2</SUP> + 5",
    if_display: "∫ f(x) dx = x<SUP>4</SUP>/4 - x<SUP>3</SUP>/3 + 5x",
  },
  ];

// Inicia a AI.
$(document).ready(function(){       
	
  //Deixa a aba "Orientações" ativa no carregamento da atividade
  $('#exercicios').tabs({ selected: 0 });
  
  //Carrega SWF
  	var flashvars = {};
	flashvars.ai = "swf/AI-0107.swf";
	flashvars.width = "640";
	flashvars.height = "480";
	
	var params = {};
	params.menu = "false";
	params.scale = "noscale";

	var attributes = {};
	attributes.id = "ai";
	attributes.align = "middle";

	swfobject.embedSWF("swf/AI-0107.swf", "ai-container", flashvars.width, flashvars.height, "10.0.0", "expressInstall.swf", flashvars, params, attributes);
	ai = $(".ai")[0];
	//alert(ai)
	
	
	
	
  //INICIALIZA A ATIVIDADE 
  //applyAndSortFunctions();  

  // Habilita/desabilita a visualização da mediatriz
  $('#exercicios').tabs({
    select: function(event, ui) {
    
      screenExercise = ui.index;
    
      //if (screenExercise == 2) document.ggbApplet.setVisible('e', true);
      //else document.ggbApplet.setVisible('e', false);
    }
  });

  // Configurações dos botões em geral
  $('.check-button').button().click(evaluateExercise);
  $('.next-button').button().click(habilitaVisual);
  $('.next-button3').button().click(habilitaVisual);
  $('.next-button4').button().click(habilitaVisual);
   
  //Configuração do botão inverter do primeiro e segundo exercício
  $('.invert-button').button().click(function(){
	var value01 = $("input[type=text][id=U-ex1]").val();
	var value02 = $("input[type=text][id=K-ex1]").val();
	$("input[type=text][id=U-ex1]").val(value02);
	$("input[type=text][id=K-ex1]").val(value01);
  });
    $('.invert-button').button().click(function(){
	var value01 = $("input[type=text][id=U-ex2]").val();
	var value02 = $("input[type=text][id=K-ex2]").val();
	$("input[type=text][id=U-ex2]").val(value02);
	$("input[type=text][id=K-ex2]").val(value01);
  });
 
  //Configuração do radio button do primeiro e segundo exercicio
  $("input[name='choice']").change(function(){
	if ($("input[name='choice']:checked").val() == 'inf'){
		ai.setVisible("LOWER_SUM",true);
		ai.setVisible("UPPER_SUM",false);
		ai.setVisible("AREA",false);
		ai.setVisible("PARALLELOGRAM_SUM",false);
		ai.setVisible("MEAN_VALUE",false);
		ai.setVisible("MONTE_CARLO",false);
		alert("TODO: configuração do swf para soma inferior. LINE 52");
	}
	else if ($("input[name='choice']:checked").val() == 'sup'){
		// TODO: configuração do swf para soma superior
		ai.setVisible("LOWER_SUM",false);
		ai.setVisible("UPPER_SUM",true);
		ai.setVisible("AREA",false);
		ai.setVisible("PARALLELOGRAM_SUM",false);
		ai.setVisible("MEAN_VALUE",false);
		ai.setVisible("MONTE_CARLO",false);
		alert("TODO: configuração do swf para soma superior. LINE 57");
	}
	});

  $('#reiniciar').button().click(reloadPage);
  $('#next-button4-2').button().click(MostraTexto);
  $('#next-button4-3').button().click(MostraTexto2);
  
  
  initAI();
});

//Refresh da Página.
function reloadPage()
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
}

//Verificar selects do Exercício 5 e mostra texto.
function verificaSelect() {
   	var valor1 = document.selects.ex5_select_01.value; 
	var valor2 = document.selects.ex5_select_02.value;
	var valor3 = document.selects.ex5_select_03.value;
	var valor4 = document.selects.ex5_select_04.value;
	if (valor1 == 'menor') {document.getElementById('feedback5-a').style.display="block";}
	if (valor2 == 'maior') {document.getElementById('feedback5-b').style.display="block";}
	if (valor3 == 'menor') {document.getElementById('feedback5-c').style.display="block";}	
	if (valor4 == 'menor') {document.getElementById('feedback5-d').style.display="block";}
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

// Encerra a AI.
$(window).unload(function (){
  if (!completed) {
    save2LMS();  
    scorm.quit();
  }
});

/*
 * Inicia a AI.
 */ 
function initAI () {
 
  // Conecta-se ao LMS
  var connected = scorm.init();
  
  // A tentativa de conexão com o LMS foi bem sucedida.
  if (connected) {
  
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
	    
    //---------------- Particular da AI -------------------------
    
    // Habilita/desabilita a visualização da mediatriz
    //if (scormExercise == 2) document.ggbApplet.setVisible('e', true);
   // else document.ggbApplet.setVisible('e', false);
    //-----------------------------------------------------------
   
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
	/*if (completed) $('#exercicios').tabs("option", "disabled", []);
	else {
		$('#exercicios').tabs((scormExercise >= 1 ? "enable": "disable"), 1);
		$('#exercicios').tabs((scormExercise >= 2 ? "enable": "disable"), 2);
	}*/
  
  // (Re)abilita os exercícios já feitos e desabilita aqueles ainda por fazer.
  //if (completed) $('#exercicios').tabs("option", "disabled", []);
  //else {
    //for (i = 0; i <= N_EXERCISES; i++) {
      //if (i <= scormExercise) $('#exercicios').tabs("enable", i);
      //else $('#exercicios').tabs("disable", i);
    //}
  //}
}

/*
 * Salva cmi.score.raw, cmi.location e cmi.completion_status no LMS
 */ 
function save2LMS () {
  if (scorm.connection.isActive) {
  
    // Salva no LMS a nota do aluno.
    var success = scorm.set("cmi.score.raw", score);
  
    // Notifica o LMS que esta atividade foi concluída.
    success = scorm.set("cmi.completion_status", (completed ? "completed" : "incomplete"));
    
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

  //var currentScore = 0;
  
  /* INICIO TEMPORÁRIO ************************************************************/
								//$(this).hide();
								//nextExercise();
  /* FIM TEMPORÁRIO ***************************************************************/
  

  // Avalia a nota
  var currentScore = getScore(screenExercise);
  
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
			document.getElementById('frame03').style.display="block";
			$( ".next-button3" ).button({ disabled: true });
			break;
			
		// Caso seja o ex4	
		case 4:
			document.getElementById('frame04-2').style.display="block";
			$(".next-button4").button({ disabled: true });		
			break;
			
	}
}

/*
 * Avalia a nota do aluno num dado exercício.
 */ 
function getScore (exercise) {

  ans = 0;
      
  switch (exercise) {
  
    // Avalia a nota do exercício 1
    case 1:
 
		var success = true;
		
		var field = $("#U-ex1");
		var field2 = $("#K-ex1")
		
		var user_answer = parseFloat(field.val().replace(",", "."));
		var user_answer2 = parseFloat(field2.val().replace(",", "."));
		
		var right_answer = ai.get("LOWER_SUM");
		var right_answer2 = ai.get("UPPER_SUM");
				
		if (Math.abs(user_answer - right_answer) <= 0.01 * Math.abs(right_answer) && Math.abs(user_answer2 - right_answer2) <= 0.01 * Math.abs(right_answer2)) {
			currentScore += SCORE_UNIT;
		}
		else {
			success = false;
			field.css("background-color", "#CC3333");
		}
		break;
		
	  // Avalia a nota do ex2
	  case 2:
	  alert("Escrever código para avaliar exercício 2!")
	  
		break;
		
	  // Avalia a nota do ex3
	  case 3:
	  alert("Escrever código para avaliar exercício 3!")	  
	  
		break;
		
	  // Avalia a nota do ex4
	  case 4:
	  alert("Escrever código para avaliar exercício 4!")
	  
		break;
		
	  // Avalia a nota do ex5
	  case 5:
	  //verifica se tem algum select não selecionado. 
	  var valor1 = document.selects.ex5_select_01.value;
	  var valor2 = document.selects.ex5_select_02.value;
	  var valor3 = document.selects.ex5_select_03.value;
	  var valor4 = document.selects.ex5_select_04.value;
	  if (valor1 != '' && valor2 != '' && valor3 != '' && valor4 != '' ) {
	    //desabilita os selects após clique no botão 'terminei'
		document.selects.ex5_select_01.disabled = true;
		document.selects.ex5_select_02.disabled = true;
		document.selects.ex5_select_03.disabled = true;
		document.selects.ex5_select_04.disabled = true; 
	  }else { alert ("Preencha todos os itens!") }
	   	  	  	    
		break;
		
	  // Avalia a nota do ex6
	  case 6:
	  alert("Escrever código para avaliar exercício 6!")
	  
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
    default:
      if (score == 50) {
          $('#message1').html('<p/>Resposta correta!').removeClass().addClass("right-answer");
      } else {
          $('#message1').html('<p/>Resposta incorreta.').removeClass().addClass("wrong-answer");
      }
      
      break;
    
    // Feedback da resposta ao exercício 2
    case 2:
      if (score == 50) {
          $('#message2').html('<p/>Resposta correta!').removeClass().addClass("right-answer");
      } else {
          $('#message2').html('<p/>Resposta incorreta. O correto seria ????').removeClass().addClass("wrong-answer");
           
      }
      
      break;
	  
    // Feedback da resposta ao exercício 3
    case 3:
      //não tem feedback!
      
      break;	  

    // Feedback da resposta ao exercício 4
    case 4:
	  //não tem feedback!
	
      break;
	  
    // Feedback da resposta ao exercício 5
    case 5:
	  //não tem feedback!
	      
      break;
	  
    // Feedback da resposta ao exercício 6
    case 6:
      if (score == 50) {
          $('#message6').html('<p/>Resposta correta!').removeClass().addClass("right-answer");
      } else {
          $('#message6').html('<p/>Resposta incorreta. O correto seria [ESCREVER]').removeClass().addClass("wrong-answer");
           
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

