/*----------------------Bucle de juego ----------------*/
var time = new Date(); //Obtiene el tiempo actual
var deltaTime = 0; //Diferencia de tiempo entre frames para calcular animaciones


if (document.readyState === "complete" || document.readyState === "interactive"){
    setTimeout(Init, 1); //Inicia el juego si el documento ya está cargado
}else{
    document.addEventListener("DOMContentLoaded", Init); 
}

function Init(){
    time = new Date(); //Actualiza el tiempo de referencia al iniciar
    Start(); 
    Loop(); 
}

function Loop(){ 
    deltaTime = (new Date() - time) / 1000; 
    time = new Date(); 
    Update(); 
    requestAnimationFrame(Loop); 
}

/*---------------------Variables----------------------*/

var sueloY = 20; //Altura del suelo en el eje Y
var velY = 0; // Velocidad vertical del dinosaurio
var impulso = 900; //Fuerza de impulso al saltar
var gravedad = 2900; //Fuerza de la gravedad para el dinosaurio

var dinoPosX = 42; //Posición horizontal del dinosaurio
var dinoPosY = sueloY; //Posición vertical del dinosurio (inicial en el suelo)

var sueloX = 0; //Posición horizontal del suelo
var velEscenario = 1280 / 3; //Velocidad a la que se mueve el escenario
var gameVel = 1.2; //Velocidad inicial del juego
var score = 0; //Puntuación inicial

var parado = false; //Estado del juego (si está en pausa o no)
var saltando = false; //Indica si el dinosaurio está saltando

var tiempoHastaObstaculo = 3; //Tiempo restante para crear un nuevo obstáculo
var tiempoObstaculoMin = 0.7; //Tiempo mínimo entre obstáculos
var tiempoObstaculoMax = 1.8; //Tiempo máximo entre obstáculos
var obstaculoPosY = 16; //Posición vertical de los obstáculos
 var obstaculos = []; //Array que almacenará los obstáculos

var tiempoHastaNube = 0.5; //Tiempo restante para crear una nueva nube
var tiempoNubeMin = 0.7; //Tiempo mínimo entre nubes
var tiempoNubeMax = 2.7; //Tiempo máximo entre nubes
var maxNubeY = 250; //Altura máxima de las nubes
var minNubeY = 100; //Altura mínima de las nubes
var nubes = []; //Array que almacenará las nubes
var velNube = 0.5; //Velocidad de las nubes

var contenedor, dino, textoScore, suelo, gameOver;

//Inicializa los elementos del juego
function Start(){
    gameOver = document.querySelector(".game-over"); 
    suelo = document.querySelector(".floor"); 
    contenedor = document.querySelector(".container"); 
    textoScore = document.querySelector(".score"); 
    dino = document.querySelector(".character"); 
    document.addEventListener("keydown", HandleKeyDown); 
}

//Detecta la tecla de los saltos
function HandleKeyDown(ev){
    if (ev.keyCode == 32){ 
        Saltar(); 
    }
}

//Hace que el dinosaurio salte
function Saltar(){ 
    if (dinoPosY === sueloY){ 
        saltando = true; 
        velY = impulso; 
        dino.classList.remove("dino-corriendo"); 
    }
}

//Actualiza el estado del juego en cada frame
function Update(){
    if(parado) return; 

    MoverSuelo(); 
    MoverDinosaurio(); 
    DecidirCrearObstaculos(); 
    MoverObstaculos(); 
    DetectarColision(); 
    DecidirCrearNubes();
    MoverNubes(); 
    velY -= gravedad * deltaTime; 
}

//Mueve el suelo en cada frame
function MoverSuelo(){
    sueloX += CalcularDesplazamiento(); 
    suelo.style.left = -(sueloX % contenedor.clientWidth) + "px"; 
}

// Calcula el desplazamiento del escenario según el deltaTime
function CalcularDesplazamiento(){
    return velEscenario * deltaTime * gameVel; 
}

//Mueve el dinosaurio en cada frame
function MoverDinosaurio(){
    dinoPosY += velY * deltaTime; 
    if (dinoPosY < sueloY){ 
        TocarSuelo(); 
    }
    dino.style.bottom = dinoPosY + "px"; 
}

//Restablece el estado cuando el dinosaurio toca el suelo
function TocarSuelo(){
    dinoPosY = sueloY; 
    velY = 0; 
    if (saltando){ 
        dino.classList.add("character-running"); 
    }
    saltando = false; 
}

//Verifica si es necesario crear un obstáculo nuevo
function DecidirCrearObstaculos(){
    tiempoHastaObstaculo -= deltaTime; 
    if (tiempoHastaObstaculo <= 0){ 
        CrearObstaculo(); 
    }
}

//Crea un nuevo obstáculo
function CrearObstaculo(){
    var obstaculo = document.createElement("div"); 
    contenedor.appendChild(obstaculo); 
    obstaculo.classList.add("cactus"); 
    if (Math.random() > 0.5) obstaculo.classList.add("cactus2"); 
    obstaculo.posX = contenedor.clientWidth; 
    obstaculo.style.left = contenedor.clientWidth + "px";

    obstaculos.push(obstaculo); 
    tiempoHastaObstaculo = tiempoObstaculoMin + Math.random() * (tiempoObstaculoMax - tiempoObstaculoMin) / gameVel; //Calcula el tiempo para el próximo obstáculo
}

//Mueve los obstáculos en cada frame
function MoverObstaculos(){
    for (var i = obstaculos.length - 1; i >= 0; i--){ 
        if (obstaculos[i].posX < -obstaculos[i].clientWidth){ 
            obstaculos[i].parentNode.removeChild(obstaculos[i]); 
            obstaculos.splice(i, 1); 
            GanarPuntos(); 
        }else{
            obstaculos[i].posX -= CalcularDesplazamiento(); 
            obstaculos[i].style.left = obstaculos[i].posX + "px"; 
        }
    }
}

//Incremento de la puntuación y cambios de velocidad y color de fondo
function GanarPuntos(){
    score++; 
    textoScore.innerText = score; 
    if (score == 10){ 
        gameVel = 1.8;
        contenedor.classList.add("mediodia");
    } else if (score == 15){ 
        gameVel = 2;
        contenedor.classList.add("tarde");
    } else if (score == 20){ 
        gameVel = 3;
        contenedor.classList.add("noche");
    }
    suelo.style.animationDuration = (3 / gameVel) + "s"; 
}

//Verifica si el dinosaurio choca con un obstáculo
function DetectarColision(){
    for (var i = 0; i < obstaculos.length; i++){
        if (obstaculos[i].posX > dinoPosX + dino.clientWidth){ 
            break; 
        }else{
            
            if (IsCollision(dino, obstaculos[i], 10, 30, 15, 20)){
                GameOver(); 
            }
        }
    }
}

//Detecta si los elementos HTML chocan usando sus cajas delimitadoras
function IsCollision(a, b, paddingTop, paddingRight, paddingBottom, paddingLeft){
    var aRect = a.getBoundingClientRect(); 
    var bRect = b.getBoundingClientRect(); 

    return!( 
        ((aRect.top + aRect.height - paddingBottom) < (bRect.top)) || 
        (aRect.top + paddingTop > (bRect.top + bRect.height)) || 
        ((aRect.left + aRect.width - paddingRight) < bRect.left) || 
        (aRect.left + paddingLeft > (bRect.left + bRect.width)) 
    );
}

//Verifica si es necesario crear una nube nueva
function DecidirCrearNubes(){
    tiempoHastaNube -= deltaTime; 
    if (tiempoHastaNube <= 0){ 
        CrearNube(); 
    }
}

//Crea una nueva nube
function CrearNube(){
    var nube = document.createElement("div"); 
    contenedor.appendChild(nube); 
    nube.classList.add("nube"); 
    nube.posX = contenedor.clientWidth; 
    nube.style.left = contenedor.clientWidth + "px"; 
    nube.style.bottom = minNubeY + Math.random() * (maxNubeY - minNubeY) + "px"; 
    
    nubes.push(nube); 
    tiempoHastaNube = tiempoNubeMin + Math.random() * (tiempoNubeMax - tiempoNubeMin) / gameVel; 
}

//Mueve las nubes en cada frame
function MoverNubes(){
    for (var i = nubes.length - 1; i >= 0; i--){
        if (nubes[i].posX < -nubes[i].clientWidth){ 
            nubes[i].parentNode.removeChild(nubes[i]); 
            nubes.splice(i, 1); 
        }else{
            
            nubes[i].posX -= CalcularDesplazamiento() * velNube;
            nubes[i].style.left = nubes[i].posX + "px"; 
        }
    }
}

//Maneja los choques del dinosaurio 
function Estrellarse(){
    dino.classList.remove("character-running"); 
    dino.classList.add("character-crash"); 
    parado = true; 
}

//Finaliza el juego mostrando el mensaje de "game over"
function GameOver(){
    Estrellarse(); 
    gameOver.style.display = "block"; 
    document.addEventListener("keydown", ReiniciarJuego);
}

//Reinicia el juego
function ReiniciarJuego(){
    location.reload();
}

