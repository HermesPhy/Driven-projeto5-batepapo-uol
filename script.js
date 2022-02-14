let nome = null
let contatoSelecionado = 'Todos'
let visibilidadeSelecionada = 'Público'
let tipoMsg = 'message'
let nomeParticipantes = ['Todos']
let nomeDeUsuario = null
let participantes = null
let jaVerificado = false
let participanteEscolhido = document.querySelector('.hidden')

const classParticipantes = document.querySelector('.users')
const classVisibilidade = document.querySelector('.visibilityMenu')
let iconeVisibilidade = classVisibilidade.querySelector('.selected')
const main = document.querySelector('main')
const entrada = document.querySelector('.inputWindow')
const input = document.querySelector('footer input')
const mainMenu = document.querySelector('.mainMenu')
const fundoEscuro = document.querySelector('.shadowMenu')
const enviandoReservardo = document.querySelector('footer span')
const newUsers = document.querySelector('.newUsers')


function enterTheRoom() {
    nome = document.querySelector('.inputWindow input').value
    if (nome === 'Todos') {
        alert('Nome de usuário já existente, escolha outro nome.')
    } else if (nome !== '') {
        carregando()
        verificarNome()
    }
}

function carregando() {
    let inputNome = entrada.querySelector('input')
    let botaoEntrar = entrada.querySelector('button')
    let imgLoading = entrada.querySelector('.loading')
    let entrando = entrada.querySelector('span')

    inputNome.classList.toggle('hidden')
    botaoEntrar.classList.toggle('hidden')
    imgLoading.classList.toggle('hidden')
    entrando.classList.toggle('hidden')
}

function verificarNome() {
    nomeDeUsuario = {
        name: nome
    }
    let promise = axios.post('https://mock-api.driven.com.br/api/v4/uol/participants', nomeDeUsuario)
    promise.then(processSuccess)
    promise.catch(processFailed)

}

function processSuccess(response) {
    entrarMensagensApi()
    searchParticipants()
    carregando()
    entrada.classList.add('hidden')
    jaVerificado = true
    setInterval(entrarMensagensApi, 3000)
    setInterval(manterConexao, 5000)
    setInterval(searchParticipants, 10000)
}

function processFailed(erro) {
    carregando()
    alert('Nome de usuário já existente, escolha outro nome.')
}


function entrarMensagensApi() {
    let promise = axios.get('https://mock-api.driven.com.br/api/v4/uol/messages')
    promise.then(processResponse)
}

function processResponse(response) {
    main.innerHTML = ''
    let info = response.data

    for (let i = 0; i < info.length; i++) {
        let mensagem = info[i]
        if (mensagem.type === 'status') {
            main.innerHTML += `
        <div class="messageChat enterExit">
            <span><small>${mensagem.time}</small> <strong>${mensagem.from}</strong> ${mensagem.text}</span>
        </div>`
        } else if (mensagem.type === 'message') {
            main.innerHTML += `
        <div class="messageChat" data-identifier="message">
            <span><small>${mensagem.time}</small> <strong>${mensagem.from}</strong> para <strong>${mensagem.to}</strong>: ${mensagem.text}</span>
        </div>`
        } else if (mensagem.type === 'private_message') {
            if (mensagem.to === nome || mensagem.from === nome) {
                main.innerHTML += `
            <div class="messageChat private">
                <span><small>${mensagem.time}</small> <strong>${mensagem.from}</strong> reservadamente para <strong>${mensagem.to}</strong>: ${mensagem.text}</span>
            </div>`
            }
        }
    }
    scroll()
}

function scroll() {
    let showElement = document.querySelector('.message:last-child');
    showElement.scrollIntoView();
}

function searchParticipants() {
    let promise = axios.get('https://mock-api.driven.com.br/api/v4/uol/participants')
    promise.then(processParticipants)
}

function processParticipants(response) {
    participantes = response.data
    nomeParticipantes = ['Todos']
    for (let i = 0; i < participantes.length; i++) {
        nomeParticipantes.push(participantes[i].name)
    }

    addMainMenu()
}

function addMainMenu() {
    newUsers.innerHTML = ''
    for (let i = 1; i < participantes.length; i++) {
        newUsers.innerHTML += `
        <div class="choose user" onclick="select(this,'users')" data-identifier="participant">
            <div class="iconeMenu">
                <ion-icon name="person-circle"></ion-icon>
            </div>
            <p>${nomeParticipantes[i]}</p>
            <ion-icon name="checkmark-sharp" class="check nome${[i]}"></ion-icon>
        </div>
        `
        if (nomeParticipantes[i] === contatoSelecionado) {
            let icone = newUsers.querySelector(`.nome${[i]}`)
            icone.classList.add('selected')
        }
    }
}

function manterConexao() {
    let promise = axios.post('https://mock-api.driven.com.br/api/v4/uol/status', nomeDeUsuario)
    promise.then(conexaoSuccess)
}

function conexaoSuccess(response) {
    //console.log(response.data)
}

function sendMessage() {
    const mensagem = document.querySelector('footer input').value
    let indiceSelecionado = nomeParticipantes.indexOf(contatoSelecionado)
    let usuario = {
        from: nome,
        to: nomeParticipantes[indiceSelecionado],
        text: mensagem,
        type: tipoMsg
    }
    let promise = axios.post('https://mock-api.driven.com.br/api/v4/uol/messages', usuario)

    promise.then(msgSuccess)
    promise.catch(msgFailed)
}

function msgSuccess(response) {
    input.value = ''
}

function msgFailed(erro) {
    alert('Usuário saiu da sala')
    window.location.reload()
}

function openMenu() {
    mainMenu.classList.remove('hidden')
    fundoEscuro.classList.remove('hidden')
}

function closerMenu() {
    mainMenu.classList.add('hidden')
    fundoEscuro.classList.add('hidden')
}

function select(selecionado, classe) {
    const check = selecionado.querySelector('.check')
    const classeSelecionado = document.querySelector(`.${classe}`)
    const jaSelecionado = classeSelecionado.querySelector('.selected')
        //if (jaSelecionado !== null) {
    jaSelecionado.classList.remove('selected')
        //}
    check.classList.add('selected')

    if (classe === 'users') {
        participanteEscolhido = classParticipantes.querySelector('.selected')
        let contato = participanteEscolhido.parentNode.querySelector('p')
        contatoSelecionado = contato.innerHTML

        enviandoReservardo.innerHTML = `Enviando para ${contatoSelecionado} (reservadamente)`
    } else if (classe === 'visibilityMenu') {
        iconeVisibilidade = classVisibilidade.querySelector('.selected')
        let seguranca = iconeVisibilidade.parentNode.querySelector('p')
        visibilidadeSelecionada = seguranca.innerHTML
        if (visibilidadeSelecionada === 'Público') {
            tipoMsg = 'message'
            removerReservado()
        } else if (visibilidadeSelecionada === 'Reservadamente') {
            tipoMsg = 'private_message'
            inputReservado()
        }
    }
}

function inputReservado() {
    enviandoReservardo.classList.remove('hidden')
    input.classList.add('marginBottom')
    enviandoReservardo.innerHTML = `Enviando para ${contatoSelecionado} (reservadamente)`
}

function removerReservado() {
    enviandoReservardo.classList.add('hidden')
    input.classList.remove('marginBottom')
}

document.addEventListener("keypress", function(e) {
    if (e.key === "Enter" && jaVerificado === true) {
        const enviar = document.querySelector('footer ion-icon')
        enviar.click()
    }
})