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

//$(document).ready(initAI); // Inicia a AI. 
//$(window).unload(uninitAI); // Encerra a AI.

// Inicia a AI.
$(document).ready(function(){ 

//Deixa a aba "Orientações" ativa no carregamento da atividade
$('#exercicios').tabs({ selected: 0 });

/*
 * Configurações iniciais da Atividade Interativa (AI)
 */ 
function initAI () {
  // Carrega o SWF
  //swfobject.embedSWF("AI-0083.swf", "ai-container", flashvars.width, flashvars.height, "10.0.0", "expressInstall.swf", flashvars, params, attributes);
  //$('#ai-container').flash('AI-0083.swf');
	flashMovie = $('#ai');

	flashMovie.flash(
		{
			swf: 'AI-0107.swf',
			width: 640,
			height: 480,
			play: false,
			id: "atividade",
		}
	);
	
	ai = document.getElementById("atividade");
	
	//INICIALIZA A ATIVIDADE
	applyAndSortFunctions();
	
  
  // Ao pressionar numa aba (exercício), define aquele como exercício da tela.

  $('#exercicios').tabs({
      select: function(event, ui) {

        screenExercise = ui.index;
		configExercise(screenExercise);
      }
  });
  
  // Configurações dos botões em geral
  $('.check-button').button().click(evaluateExercise);
  $('.next-button').button().click(habilitaVisual);
  
  //Configuração do botão inverter do primeiro e segundo exercício
  $('.invert-button').button().click(function(){
	var value01 = $("input[type=text][id=U-ex1]").val();
	var value02 = $("input[type=text][id=K-ex1]").val();
	$("input[type=text][id=U-ex1]").val(value02);
	$("input[type=text][id=K-ex1]").val(value01);




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

  
  //initSCORM();
  
  // (Re)abilita os exercícios já feitos e desabilita aqueles ainda por fazer.
  if (completed) $('#exercicios').tabs("option", "disabled", []);
  else {
    for (i = 0; i <= N_EXERCISES; i++) {
      if (i <= scormExercise) $('#exercicios').tabs("enable", i);
      else $('#exercicios').tabs("disable", i);
    }
  }









  
  // Posiciona o aluno no exercício da vez
  screenExercise = scormExercise;
  $('#exercicios').tabs("select", scormExercise - 1);
  configExercise(scormExercise - 1);








}

/*
 * Encerra a Atividade Interativa (AI)
 */ 

function uninitAI () {
  if (!completed) {
    save2LMS();
    scorm.quit();
  }
}


/*
 * Inicia a conexão SCORM.

 */ 
function initSCORM () {

 
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
    
    pingLMS();





    






  }
  // A tentativa de conexão com o LMS falhou.
  else {
    completed = false;
    learnername = "";
    scormExercise = 1;
    score = 0;

  }
















}

/*
 * Salva cmi.score.raw, cmi.location e cmi.completion_status no LMS
 */ 
function save2LMS () {
 /* if (scorm.connection.isActive) {
  
    // Salva no LMS a nota do aluno.
    var success = scorm.set("cmi.score.raw", Math.round(score));
  
    // Notifica o LMS que esta atividade foi concluída.
    success = scorm.set("cmi.completion_status", (completed ? "completed" : "incomplete"));
    
    // Salva no LMS o exercício que deve ser exibido quando a AI for acessada novamente.
    success = scorm.set("cmi.location", scormExercise);
    
    if (!success) 
  }
  else {
    
  }*/


}

/*
 * Mantém a conexão com LMS ativa, atualizando a variável cmi.session_time
 */
function pingLMS () {

	scorm.get("cmi.completion_status");
	var timer = setTimeout("pingLMS()", PING_INTERVAL);
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
			$("#frame02").removeClass().addClass("active visible");
			$("#frame01").removeClass().addClass("desactive visible");
			$(".invert-button").removeClass("invisible").addClass("visible");
			$(".check-button").removeClass("invisible").addClass("visible");
			$(".next-button").removeClass("visible").addClass("invisible");
			ai.setVisible("LOWER_SUM",false);
			ai.setVisible("UPPER_SUM",true);
			ai.setVisible("AREA",false);
			ai.setVisible("PARALLELOGRAM_SUM",false);
			ai.setVisible("MEAN_VALUE",false);
			ai.setVisible("MONTE_CARLO",false);
			$('input[name="choice"]')[1].checked = true;//altera posição do radio button
			break;
			
		case 3:
			$(".frame02").removeClass().addClass("active visible");
			$(".frame01").removeClass().addClass("desactive visible");
			$(".check-button").removeClass("invisible").addClass("visible");
			$(".next-button").removeClass("visible").addClass("invisible");
			break;
			
		case 4:
			alert("TODO: Resto da questão 4.LINE:231");
			
			break;
	}
}

/*
 * Configuração inicial do exercício
 */
function configExercise(value){
	switch (value) {
		
		// Caso seja o ex1
		case 1:
			ai.set("N", 4);
			ai.setVisible("LOWER_SUM", true);
			ai.setVisible("UPPER_SUM",false);
			ai.setVisible("AREA",false);
			ai.setVisible("PARALLELOGRAM_SUM",false);
			ai.setVisible("MEAN_VALUE",false);
			ai.setVisible("MONTE_CARLO",false);
			$('input[name="choice"]')[0].checked = true;//altera posição do radio button
			break;
		// Caso seja o ex2
		case 2:
			ai.set("N", 6);
			ai.setVisible("LOWER_SUM", true);
			ai.setVisible("UPPER_SUM",false);
			ai.setVisible("AREA",false);
			ai.setVisible("PARALLELOGRAM_SUM",false);
			ai.setVisible("MEAN_VALUE",false);
			ai.setVisible("MONTE_CARLO",false);
			$('input[name="choice"]')[0].checked = true;//altera posição do radio button
			break;
	}
}
/*
 * Avalia a resposta do aluno ao exercício atual. Esta função é executada sempre que ele pressiona "terminei".

 */ 
function evaluateExercise (event) {


  var currentScore = 0;
  
  /* INICIO TEMPORÁRIO ************************************************************/
								$(this).hide();
								nextExercise();
  /* FIM TEMPORÁRIO ***************************************************************/
  
  switch (screenExercise) {
	  // Avalia a nota do ex1
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
		
	  // Avalia a nota do ex1
	  case 2:
	  
		break;
		
	  // Avalia a nota do ex1
	  case 3:
	  
		break;
		
	  // Avalia a nota do ex1
	  case 4:
	  
		break;
		
	  // Avalia a nota do ex1
	  case 5:
	  
		break;
		
	  // Avalia a nota do ex1
	  case 6:
	  
		break;
		
	// Avalia a nota do ex1
	  case 7:
	  
		break;
  }
  /*switch (screenExercise) {



  
    // Avalia a nota do exercício 1
    // ----------------------------
    case 1:
    default: 
      var user_answer = ai.getTeta();
      var right_answer_1 = 10;
      var succeeds_1 = Math.abs(user_answer - right_answer_1) < 0.1 * right_answer_1;
    
      currentScore += (succeeds_1 ? SCORE_UNIT : 0);




    
      user_answer = parseFloat($("#periodo-medido-angulos-pequenos").val().replace(",","."));
      var right_answer_2 = ai.getPeriodo();
      var succeeds_2 = !isNaN(user_answer) && (Math.abs(user_answer - right_answer_2) < 0.1 * right_answer_2);
      
      currentScore += (succeeds_2 ? SCORE_UNIT : 0);
      
      var feedback = "";
      if (!succeeds_1) {
        feedback += "<p>A amplitude deveria ser de 10º (já foi corrigida).</p>";
        
        ai.setTeta(10);
        ai.playAnimation();
      }
      
      if (!succeeds_2) {
        feedback += "<p>O período correto é " + right_answer_2.toFixed(1).replace(".",",") + " s.</p>";
      }
      
      if (succeeds_1 && succeeds_2) {
        $("#feedback-ex1").html('Correto!');
        $("#feedback-ex1").removeClass().addClass("right-answer");
      }


      else {
        $("#feedback-ex1").html(feedback);
        $("#feedback-ex1").removeClass().addClass("wrong-answer");

      }
      
      break;
      
    // Avalia a nota do exercício 2
    // ----------------------------
    case 2:
      var user_answer = parseFloat($("#periodo-calculado").val().replace(",","."));
      var right_answer = 2 * Math.PI * Math.sqrt(ai.getComprimento() / ai.getGravidade());
      var succeeds = !isNaN(user_answer) && (Math.abs(user_answer - right_answer) < 0.1 * right_answer);
      
      if (succeeds) {
        currentScore = SCORE_UNIT;
        
        $("#feedback-ex2").html('Correto!');
        $("#feedback-ex2").removeClass().addClass("right-answer");
      } 
      else {
        currentScore = 0;
        
        $("#feedback-ex2").html("<p>O período correto é " + right_answer.toFixed(1).replace(".",",") + " s.</p>");
        $("#feedback-ex2").removeClass().addClass("wrong-answer");
      }
      
      break;
      
    // Avalia a nota do exercício 3
    // ----------------------------
    case 3:
      var small_angle = 10 * Math.PI / 180
      var user_answer = parseFloat($("#erro-maximo-angulos-pequenos").val().replace(",","."));
      var right_answer = Math.abs(Math.sin(small_angle) - small_angle);
      var succeeds = !isNaN(user_answer) && (Math.abs(Math.abs(user_answer) - right_answer) < 0.1 * right_answer);
      
      if (succeeds) {
        currentScore = SCORE_UNIT;
        
        $("#feedback-ex3").html('Correto!');
        $("#feedback-ex3").removeClass().addClass("right-answer");
      } 
      else {
        currentScore = 0;
        
        $("#feedback-ex3").html('<p>O erro máximo é ' + right_answer.toFixed(4).replace(".",",") + " rad.</p>");
        $("#feedback-ex3").removeClass().addClass("wrong-answer");
      }
      
      break;
      
    // Avalia a nota do exercício 4
    // ----------------------------
    case 4:
      var user_answer = parseFloat($("#A-angulos-pequenos").val().replace(",","."));
      var right_answer_1 = Math.abs(ai.getTeta() * Math.PI / 180);
      var succeeds_1 = !isNaN(user_answer) && (Math.abs(Math.abs(user_answer) - right_answer_1) < 0.1 * right_answer_1);
      
      currentScore += (succeeds_1 ? SCORE_UNIT : 0);
      
      user_answer = parseFloat($("#omega-angulos-pequenos").val().replace(",","."));
      var right_answer_2 = Math.sqrt(ai.getGravidade() / ai.getComprimento());
      var succeeds_2 = !isNaN(user_answer) && (Math.abs(user_answer - right_answer_2) < 0.1 * right_answer_2);
      
      currentScore += (succeeds_2 ? SCORE_UNIT : 0);
      
      user_answer = parseFloat($("#fase-angulos-pequenos").val().replace(",","."));
      var right_answer_3 = 0;
      var succeeds_3 = !isNaN(user_answer) && (Math.abs(user_answer - right_answer_3) < 0.1);
      
      currentScore += (succeeds_3 ? SCORE_UNIT : 0);
      
      var feedback = "";
      if (!succeeds_1) {
        feedback += "<p>A amplitude (A) correta é " + right_answer_1.toFixed(2).replace(".",",") + " rad.</p>";        
      }
      
      if (!succeeds_2) {
        feedback += "<p>O ω correto é " + right_answer_2.toFixed(2).replace(".",",") + " rad/s.</p>";
      }
      
      if (!succeeds_3) {
        feedback += "<p>A fase (&phi;) correta é " + right_answer_3.toFixed(0).replace(".",",") + " rad.</p>";
      }
      
      if (succeeds_1 && succeeds_2 && succeeds_3) {
        $("#feedback-ex4").html('Correto!');
        $("#feedback-ex4").removeClass().addClass("right-answer");
      }
      else {
        $("#feedback-ex4").html(feedback);
        $("#feedback-ex4").removeClass().addClass("wrong-answer");
      }
      
      break;
      
    // Avalia a nota do exercício 5
    // ----------------------------
    case 5:
      var user_answer = parseFloat($("#dot-theta").val().replace(",","."));
      var right_answer_1 = Math.sqrt(ai.getGravidade() / ai.getComprimento()) * (ai.getTeta() * Math.PI / 180);
      var succeeds_1 = !isNaN(user_answer) && (Math.abs(user_answer - right_answer_1) < 0.1 * right_answer_1);
      
      currentScore += (succeeds_1 ? SCORE_UNIT : 0);
      
      user_answer = parseFloat($("#velocidade-linear").val().replace(",","."));
      var right_answer_2 = right_answer_1 * ai.getComprimento();
      var succeeds_2 = !isNaN(user_answer) && (Math.abs(user_answer - right_answer_2) < 0.1 * right_answer_2);
      
      currentScore += (succeeds_2 ? SCORE_UNIT : 0);
      
      var feedback = "";
      if (!succeeds_1) {
        feedback += "<p>A velocidade angular correta é " + right_answer_1.toFixed(2).replace(".",",") + " rad/s.</p>";        
      }
      
      if (!succeeds_2) {
        feedback += "<p>A velocidade linear correta é " + right_answer_2.toFixed(2).replace(".",",") + " m/s.</p>";
      }
      
      if (succeeds_1 && succeeds_2) {
        $("#feedback-ex5").html('Correto!');
        $("#feedback-ex5").removeClass().addClass("right-answer");
      }
      else {
        $("#feedback-ex5").html(feedback);
        $("#feedback-ex5").removeClass().addClass("wrong-answer");
      }
      
      break;
      
    // Avalia a nota do exercício 6
    // ----------------------------
    case 6:
      var user_answer = parseFloat($("#max-theta").val().replace(",","."));
      var right_answer_1 = Math.abs(ai.getTeta()) * Math.PI / 180;
      var succeeds_1 = !isNaN(user_answer) && (Math.abs(user_answer - right_answer_1) < 0.1 * right_answer_1);
      
      currentScore += (succeeds_1 ? SCORE_UNIT : 0);
      
      var user_answer = parseFloat($("#max-vel-angular").val().replace(",","."));
      var right_answer_2 = ai.getVelocidade();
      var succeeds_2 = !isNaN(user_answer) && (Math.abs(user_answer - right_answer_2) < 0.1 * right_answer_2);
      
      currentScore += (succeeds_2 ? SCORE_UNIT : 0);
      
      var feedback = "";
      if (!succeeds_1) {
        feedback += "<p>O ângulo correto é " + right_answer_1.toFixed(2).replace(".",",") + " rad.</p>";        
      }
      
      if (!succeeds_2) {
        feedback += "<p>A velocidade angular correta é " + right_answer_2.toFixed(2).replace(".",",") + " rad/s.</p>";
      }
      
      if (succeeds_1 && succeeds_2) {
        $("#feedback-ex6").html('Correto!');
        $("#feedback-ex6").removeClass().addClass("right-answer");
      }
      else {
        $("#feedback-ex6").html(feedback);
        $("#feedback-ex6").removeClass().addClass("wrong-answer");
      }
      
      break;
      
    // Avalia a nota do exercício 7
    // ----------------------------
    case 7:
    */
      /* theta(t) = A cos(omega t + phi) */
     // var right_answer_2 = Math.sqrt(ai.getGravidade() / ai.getComprimento()); /* omega */
     // var right_answer_3 = Math.atan(-3 / (5 * right_answer_2)); /* phi */
     // var right_answer_1 = (5 * Math.PI / 180) / Math.cos(right_answer_3) /* A */
    
     /* var user_answer = parseFloat($("#A-angulos-pequenos-2").val().replace(",","."));
      var succeeds_1 = !isNaN(user_answer) && (Math.abs(Math.abs(user_answer) - right_answer_1) < 0.1 * right_answer_1);
      
      currentScore += (succeeds_1 ? SCORE_UNIT : 0);
      
      user_answer = parseFloat($("#omega-angulos-pequenos-2").val().replace(",","."));
      var succeeds_2 = !isNaN(user_answer) && (Math.abs(user_answer - right_answer_2) < 0.1 * right_answer_2);
      
      currentScore += (succeeds_2 ? SCORE_UNIT : 0);
      
      user_answer = parseFloat($("#fase-angulos-pequenos-2").val().replace(",","."));
      var succeeds_3 = !isNaN(user_answer) && (Math.abs(user_answer - right_answer_3) < 0.1 * Math.abs(right_answer_3));
      
      currentScore += (succeeds_3 ? SCORE_UNIT : 0);
      
      var feedback = "";
      if (!succeeds_1) {
        feedback += "<p>A amplitude correta é " + right_answer_1.toFixed(2).replace(".",",") + " rad.</p>";        
      }
      
      if (!succeeds_2) {
        feedback += "<p>A velocidade angular correta é " + right_answer_2.toFixed(2).replace(".",",") + " rad/s.</p>";
      }
      
      if (!succeeds_3) {
        feedback += "<p>A fase correta é " + right_answer_3.toFixed(2).replace(".",",") + " rad.</p>";
      }
      
      if (succeeds_1 && succeeds_2 && succeeds_3) {
        $("#feedback-ex7").html('Correto!');
        $("#feedback-ex7").removeClass().addClass("right-answer");
      }
      else {
        $("#feedback-ex7").html(feedback);
        $("#feedback-ex7").removeClass().addClass("wrong-answer");
      }
      
      break;
      
    // Avalia a nota do exercício 8
    // ----------------------------
    case 8:
      var user_answer = ai.getTeta();
      var right_answer_1 = 90;
      var succeeds_1 = Math.abs(user_answer - right_answer_1) < 0.1 * right_answer_1;
    
      currentScore += (succeeds_1 ? SCORE_UNIT : 0);
    
      user_answer = parseFloat($("#periodo-medido-angulos-grandes").val().replace(",","."));
      var right_answer_2 = ai.getPeriodo();
      var succeeds_2 = !isNaN(user_answer) && (Math.abs(user_answer - right_answer_2) < 0.1 * right_answer_2);
      
      currentScore += (succeeds_2 ? SCORE_UNIT : 0);
      
      var feedback = "";
      if (!succeeds_1) {
        feedback += "<p>A amplitude deveria ser de 90º (já foi corrigida).</p>";
        
        ai.setTeta(90);
        ai.playAnimation();
      }
      
      if (!succeeds_2) {
        feedback += "<p>O período correto é " + right_answer_2.toFixed(1).replace(".",",") + " s.</p>";
      }


      
      if (succeeds_1 && succeeds_2) {
        $("#feedback-ex8").html('Correto!');
        $("#feedback-ex8").removeClass().addClass("right-answer");
      }


      else {
        $("#feedback-ex8").html(feedback);
        $("#feedback-ex8").removeClass().addClass("wrong-answer");

      }    
    
      break;
      
    // Avalia a nota do exercício 9
    // ----------------------------
    case 9:
      var big_angle = 90 * Math.PI / 180
      var small_angle = 10 * Math.PI / 180;
      var user_answer = parseFloat($("#erro-maximo-angulos-grandes").val().replace(",","."));
      var right_answer = Math.abs(Math.sin(big_angle) - big_angle) / Math.abs(Math.sin(small_angle) - small_angle);
      var succeeds = !isNaN(user_answer) && (Math.abs(Math.abs(user_answer) - right_answer) < 0.1 * right_answer);
      
      if (succeeds) {
        currentScore = SCORE_UNIT;
        
        $("#feedback-ex9").html('Correto!');
















        $("#feedback-ex9").removeClass().addClass("right-answer");
      } 
      else {
        currentScore = 0;
        
        $("#feedback-ex9").html('O erro para a oscilação de 90º é ' + Math.round(right_answer) + " vezes maior que para a oscilação de 10º.");
        $("#feedback-ex9").removeClass().addClass("wrong-answer");
      }
      
      break;
      
    // Avalia a nota do exercício 10
    // -----------------------------
    case 10:
      var user_answer = $("#planeta").val();
      var right_answer = "Júpiter";
      var succeeds = levenshteinDistance(user_answer.toLowerCase(), right_answer.toLowerCase()) < 2;
      
      if (succeeds) {
        currentScore = SCORE_UNIT;
        
        $("#feedback-ex10").html('Correto!');
        $("#feedback-ex10").removeClass().addClass("right-answer");
      } 
      else {
        currentScore = 0;
        
        $("#feedback-ex10").html('O planeta correto é ' + right_answer + ".");
        $("#feedback-ex10").removeClass().addClass("wrong-answer");
      }
    









      break;
  }
  
  // Atualiza a nota do LMS (apenas se a questão respondida é aquela esperada pelo LMS)
  if (!completed && screenExercise == scormExercise) {
    score = Math.max(0, Math.min(Math.round(score + currentScore), 100));
    
    if (scormExercise < N_EXERCISES) {
      nextExercise();
    }
    else {
      completed = true;
      scormExercise = 1;
      save2LMS();
      scorm.quit();
    }
  }*/
  
}

function applyAndSortFunctions(){
	sorteado = rand(0,funcao.length-1);
	ai.setFunction(funcao[sorteado].f_display);










}

function rand(l,u) // lower bound and upper bound
{
	return Math.floor((Math.random() * (u-l+1))+l);







}

