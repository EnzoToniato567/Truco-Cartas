const playerHandArea = document.getElementById("player-hand-area");
const botCardsContainer = document.getElementById("bot-cards");
const gameplayArea = document.querySelector(".gameplay");

const testSlot = document.querySelector(".test");
const test1Slot = document.querySelector(".test1");
const resultText = document.querySelector(".result");
const fimContainer = document.querySelector(".fim");

const globalScoreText = document.getElementById("global-score");
const gameStatusText = document.getElementById("game-status");
const roundScoreText = document.getElementById("round-score-text");
const botChipsStatus = document.getElementById("bot-status-chips");

const CARD_DOMS = {
    'papel': document.querySelector(".container-papel"),
    'tesoura': document.querySelector(".container-tesoura"),
    'pedra': document.querySelector(".container-pedra"),
    'spock': document.querySelector(".container-spock"),
    'lagarto': document.querySelector(".container-lagarto")
};

const emojisPadrao = { pedra: "✊", papel: "✋", tesoura: "✌️", spock: "🖖", lagarto: "🦎" };
const nomesPadrao = { pedra: "Pedra", papel: "Papel", tesoura: "Tesoura", spock: "Spock", lagarto: "Lagarto" };

let gameState = {
    globalPlayerPoints: 0, 
    globalBotPoints: 0,
    roundPlayerPoints: 0,  
    roundBotPoints: 0,
    playerHand: [],        
    botHand: [],           
    playerSelected: null,
    botSelected: null,
    lockActions: true 
};

const winMap = {
    pedra: ["tesoura", "lagarto"],
    papel: ["pedra", "spock"],
    tesoura: ["papel", "lagarto"],
    lagarto: ["papel", "spock"],
    spock: ["tesoura", "pedra"]
};

document.addEventListener("DOMContentLoaded", () => {
    resetJogoGeral();
});

function resetJogoGeral() {
    gameState.globalPlayerPoints = 0;
    gameState.globalBotPoints = 0;
    atualizarPlacarGeralDOM();
    iniciarNovaRodada();
}

function iniciarNovaRodada() {
    gameState.roundPlayerPoints = 0;
    gameState.roundBotPoints = 0;
    gameState.playerSelected = null;
    gameState.botSelected = null;
    gameState.lockActions = true; 

    gameState.playerHand = ['pedra', 'papel', 'tesoura', 'lagarto', 'spock'];
    gameState.botHand = ['pedra', 'papel', 'tesoura', 'lagarto', 'spock'];

    atualizarPlacarRodadaDOM();
    gameStatusText.innerText = "Dealer distribuindo as cartas...";
    
    fimContainer.style.display = "none";
    gameplayArea.style.display = "none";

    animarEntregaDeCartas();
}

function animarEntregaDeCartas() {
    playerHandArea.style.display = "flex";
    botCardsContainer.innerHTML = "";
    
    Object.keys(CARD_DOMS).forEach(tipo => {
        CARD_DOMS[tipo].style.display = "none";
    });

    let delayAcumulado = 100;

    // Cartas voam do centro para a sua mão embaixo
    Object.keys(CARD_DOMS).forEach((tipo) => {
        setTimeout(() => {
            const domContainer = CARD_DOMS[tipo];
            domContainer.style.display = "block";
            domContainer.classList.add("animar-para-player");
            
            const btn = domContainer.querySelector(".opcao");
            btn.innerHTML = `
                <div class="card-label label-topo">${nomesPadrao[tipo]}</div>
                <span class="emoji-central">${emojisPadrao[tipo]}</span>
                <div class="card-label label-fundo">${nomesPadrao[tipo]}</div>
            `;

            setTimeout(() => domContainer.classList.remove("animar-para-player"), 500);
        }, delayAcumulado);
        
        delayAcumulado += 150; 
    });

    // Cartas fechadas voam do centro para o canto da CPU (Direita)
    gameState.botHand.forEach((_, index) => {
        setTimeout(() => {
            const cardBack = document.createElement("div");
            cardBack.className = "bot-card-back animar-para-bot";
            botCardsContainer.appendChild(cardBack);
            botChipsStatus.innerText = `Cartas: ${index + 1}`;

            setTimeout(() => cardBack.classList.remove("animar-para-bot"), 500);
        }, delayAcumulado - 400); 
    });

    setTimeout(() => {
        gameState.lockActions = false;
        gameStatusText.innerText = "Sua vez! Escolha uma carta da sua mão...";
    }, delayAcumulado + 200);
}

function jogar(cardName) {
    if (gameState.lockActions) return;

    gameState.lockActions = true;
    gameState.playerSelected = cardName;

    gameState.playerHand = gameState.playerHand.filter(c => c !== cardName);

    const randomIndex = Math.floor(Math.random() * gameState.botHand.length);
    const botChoice = gameState.botHand[randomIndex];
    gameState.botHand = gameState.botHand.filter(c => c !== botChoice);
    gameState.botSelected = botChoice;

    playerHandArea.style.display = "none";
    gameplayArea.style.display = "flex";

    testSlot.innerHTML = `
        <div class="opcao" style="cursor:default;">
            <div class="card-label label-topo">${nomesPadrao[cardName]}</div>
            <span class="emoji-central">${emojisPadrao[cardName]}</span>
            <div class="card-label label-fundo">${nomesPadrao[cardName]}</div>
        </div>
    `;

    test1Slot.innerHTML = `
        <div class="opcao" style="cursor:default;">
            <div class="card-label label-topo">${nomesPadrao[botChoice]}</div>
            <span class="emoji-central">${emojisPadrao[botChoice]}</span>
            <div class="card-label label-fundo">${nomesPadrao[botChoice]}</div>
        </div>
    `;

    botChipsStatus.innerText = `Cartas: ${gameState.botHand.length}`;
    avaliarConfrontoTurno();
}

function avaliarConfrontoTurno() {
    const p = gameState.playerSelected;
    const b = gameState.botSelected;

    const playerBox = testSlot.querySelector(".opcao");
    const botBox = test1Slot.querySelector(".opcao");

    if (p === b) {
        gameStatusText.innerText = "Turno Empatado!";
        resultText.innerHTML = `Ambos jogaram ${nomesPadrao[p]}!<br>Ninguém pontua.`;
    } else if (winMap[p].includes(b)) {
        gameState.roundPlayerPoints += 1;
        gameStatusText.innerText = "Você venceu o turno!";
        resultText.innerHTML = `${nomesPadrao[p]} ganha de ${nomesPadrao[b]}!<br>Você somou +1 ponto.`;
        if (playerBox) playerBox.classList.add("vencedor-anim");
    } else {
        gameState.roundBotPoints += 1;
        gameStatusText.innerText = "A CPU venceu o turno!";
        resultText.innerHTML = `${nomesPadrao[b]} ganha de ${nomesPadrao[p]}!<br>CPU somou +1 ponto.`;
        if (botBox) botBox.classList.add("vencedor-anim");
    }

    atualizarPlacarRodadaDOM();
    fimContainer.style.display = "flex";
}

function proximoTurno() {
    if (gameState.playerHand.length > 0) {
        gameState.playerSelected = null;
        gameState.botSelected = null;
        gameState.lockActions = false;

        gameStatusText.innerText = "Sua vez! Escolha uma carta da sua mão...";
        resultText.innerHTML = "";
        fimContainer.style.display = "none";
        gameplayArea.style.display = "none";

        Object.keys(CARD_DOMS).forEach(tipo => {
            CARD_DOMS[tipo].style.display = gameState.playerHand.includes(tipo) ? "block" : "none";
        });
        
        botCardsContainer.innerHTML = "";
        gameState.botHand.forEach(() => {
            const cardBack = document.createElement("div");
            cardBack.className = "bot-card-back";
            botCardsContainer.appendChild(cardBack);
        });
        
        playerHandArea.style.display = "flex";
    } else {
        avaliarFimDaRodadaCompleta();
    }
}

function avaliarFimDaRodadaCompleta() {
    const pPoints = gameState.roundPlayerPoints;
    const bPoints = gameState.roundBotPoints;

    if (pPoints > bPoints) {
        gameState.globalPlayerPoints += 1;
        alert(`Fim da Rodada!\nSomatória Final -> Você: ${pPoints} | CPU: ${bPoints}\n\nVocê ganhou esta rodada e computou 1 ponto geral! 🏆`);
    } else if (bPoints > pPoints) {
        gameState.globalBotPoints += 1;
        alert(`Fim da Rodada!\nSomatória Final -> Você: ${pPoints} | CPU: ${bPoints}\n\nA CPU ganhou esta rodada e computou 1 ponto geral!`);
    } else {
        alert(`Fim da Rodada!\nSomatória Final -> Você: ${pPoints} | CPU: ${bPoints}\n\nEmpate na somatória das cartas! Ninguém pontua.`);
    }

    atualizarPlacarGeralDOM();

    if (gameState.globalPlayerPoints >= 3 || gameState.globalBotPoints >= 3) {
        alert(gameState.globalPlayerPoints >= 3 ? "Você limpou a mesa do Cassino! 🥇" : "A CPU levou seu dinheiro virtual.");
        resetJogoGeral();
    } else {
        iniciarNovaRodada();
    }
}

function atualizarPlacarRodadaDOM() {
    roundScoreText.innerText = `Você: ${gameState.roundPlayerPoints}  |  Bot: ${gameState.roundBotPoints}`;
}

function atualizarPlacarGeralDOM() {
    globalScoreText.innerText = `Nós ${gameState.globalPlayerPoints} x ${gameState.globalBotPoints} Eles`;
}