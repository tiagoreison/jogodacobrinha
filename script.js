const canvas = document.getElementById('canvasJogo');
const contexto = canvas.getContext('2d');

const elementoPontuacao = document.getElementById('pontuacao');
const elementoMelhorPontuacao = document.getElementById('melhorPontuacao');
const elementoPontuacaoFinal = document.getElementById('pontuacaoFinal');

const telaInicial = document.getElementById('telaInicial');
const telaGameOver = document.getElementById('telaGameOver');

const btnIniciar = document.getElementById('btnIniciar');
const btnReiniciar = document.getElementById('btnReiniciar');

const btnCima = document.getElementById('btnCima');
const btnBaixo = document.getElementById('btnBaixo');
const btnEsquerda = document.getElementById('btnEsquerda');
const btnDireita = document.getElementById('btnDireita');

const TAMANHO_CELULA = 20; 
const QUANTIDADE_CELULAS = canvas.width / TAMANHO_CELULA; 
const VELOCIDADE_INICIAL = 130; 

let cobra = [];
let direcao = { x: 0, y: 0 };
let proximaDirecao = { x: 0, y: 0 };
let comida = { x: 0, y: 0 };
let pontuacao = 0;
let melhorPontuacao = 0;
let jogoAtivo = false;
let intervaloJogo = null;

function iniciarJogo() {
    cobra = [
        { x: 8, y: 10 },
        { x: 7, y: 10 },
        { x: 6, y: 10 }
    ];

    direcao = { x: 1, y: 0 };
    proximaDirecao = { x: 1, y: 0 };
    pontuacao = 0;
    jogoAtivo = true;

    atualizarPontuacao();
    criarComida();

    telaInicial.classList.add('escondido');
    telaGameOver.classList.add('escondido');

    if (intervaloJogo) clearInterval(intervaloJogo);
    intervaloJogo = setInterval(loopDoJogo, VELOCIDADE_INICIAL);
}

function reiniciarJogo() {
    iniciarJogo();
}
function loopDoJogo() {
    moverCobra();

    if (verificarColisao()) {
        finalizarJogo();
        return;
    }

    desenharJogo();
}

function moverCobra() {
    direcao = proximaDirecao;

    const cabecaAtual = cobra[0];
    const novaCabeca = {
        x: cabecaAtual.x + direcao.x,
        y: cabecaAtual.y + direcao.y
    };

    cobra.unshift(novaCabeca);

    const comeuComida = novaCabeca.x === comida.x && novaCabeca.y === comida.y;

    if (comeuComida) {
        pontuacao += 10;
        atualizarPontuacao();
        criarComida();
    } else {
        cobra.pop();
    }
}

function criarComida() {
    let novaPosicao;
    let posicaoValida = false;

    while (!posicaoValida) {
        novaPosicao = {
            x: Math.floor(Math.random() * QUANTIDADE_CELULAS),
            y: Math.floor(Math.random() * QUANTIDADE_CELULAS)
        };

        posicaoValida = !cobra.some(
            segmento => segmento.x === novaPosicao.x && segmento.y === novaPosicao.y
        );
    }

    comida = novaPosicao;
}

function verificarColisao() {
    const cabeca = cobra[0];
    
    const bateuNaParede =
        cabeca.x < 0 ||
        cabeca.y < 0 ||
        cabeca.x >= QUANTIDADE_CELULAS ||
        cabeca.y >= QUANTIDADE_CELULAS;

    if (bateuNaParede) return true;

    for (let i = 1; i < cobra.length; i++) {
        if (cobra[i].x === cabeca.x && cobra[i].y === cabeca.y) {
            return true;
        }
    }

    return false;
}

function desenharJogo() {
    contexto.fillStyle = '#10101c';
    contexto.fillRect(0, 0, canvas.width, canvas.height);

    contexto.fillStyle = '#22d3ee';
    desenharCelula(comida.x, comida.y);

    cobra.forEach((segmento, indice) => {
        contexto.fillStyle = indice === 0 ? '#4ade80' : '#34a866';
        desenharCelula(segmento.x, segmento.y);
    });
}

function desenharCelula(x, y) {
    const margem = 1; /
    contexto.fillRect(
        x * TAMANHO_CELULA + margem,
        y * TAMANHO_CELULA + margem,
        TAMANHO_CELULA - margem * 2,
        TAMANHO_CELULA - margem * 2
    );
}

function atualizarPontuacao() {
    elementoPontuacao.textContent = pontuacao;

    const melhorSalva = Number(localStorage.getItem('snake_melhor_pontuacao')) || 0;
    melhorPontuacao = Math.max(melhorSalva, pontuacao);

    if (pontuacao > melhorSalva) {
        localStorage.setItem('snake_melhor_pontuacao', String(pontuacao));
    }

    elementoMelhorPontuacao.textContent = melhorPontuacao;
}

function finalizarJogo() {
    jogoAtivo = false;
    clearInterval(intervaloJogo);

    elementoPontuacaoFinal.textContent = pontuacao;
    telaGameOver.classList.remove('escondido');
}

function controlarTeclado(evento) {
    if (!jogoAtivo) return;

    const tecla = evento.key.toLowerCase();

    const indoParaDireita = direcao.x === 1;
    const indoParaEsquerda = direcao.x === -1;
    const indoParaCima = direcao.y === -1;
    const indoParaBaixo = direcao.y === 1;

    if ((tecla === 'arrowup' || tecla === 'w') && !indoParaBaixo) {
        proximaDirecao = { x: 0, y: -1 };
    } else if ((tecla === 'arrowdown' || tecla === 's') && !indoParaCima) {
        proximaDirecao = { x: 0, y: 1 };
    } else if ((tecla === 'arrowleft' || tecla === 'a') && !indoParaDireita) {
        proximaDirecao = { x: -1, y: 0 };
    } else if ((tecla === 'arrowright' || tecla === 'd') && !indoParaEsquerda) {
        proximaDirecao = { x: 1, y: 0 };
    }
}

function controlarBotoesMobile() {
    btnCima.addEventListener('click', () => {
        if (jogoAtivo && direcao.y !== 1) proximaDirecao = { x: 0, y: -1 };
    });

    btnBaixo.addEventListener('click', () => {
        if (jogoAtivo && direcao.y !== -1) proximaDirecao = { x: 0, y: 1 };
    });

    btnEsquerda.addEventListener('click', () => {
        if (jogoAtivo && direcao.x !== 1) proximaDirecao = { x: -1, y: 0 };
    });

    btnDireita.addEventListener('click', () => {
        if (jogoAtivo && direcao.x !== -1) proximaDirecao = { x: 1, y: 0 };
    });
}

btnIniciar.addEventListener('click', iniciarJogo);
btnReiniciar.addEventListener('click', reiniciarJogo);
document.addEventListener('keydown', controlarTeclado);
controlarBotoesMobile();

elementoMelhorPontuacao.textContent = Number(localStorage.getItem('snake_melhor_pontuacao')) || 0;
