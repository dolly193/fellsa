// Conecta ao servidor WebSocket.
// Quando seu site está hospedado em um repositório (como GitHub Pages),
// você precisa usar o endereço público do seu servidor backend e o protocolo seguro 'wss://'.
// Exemplo para um servidor no Render: 'wss://meu-chat-app.onrender.com'
// A URL ABAIXO ESTÁ INCORRETA. Você deve usar a URL do seu SERVIDOR BACKEND (que você está configurando agora),
// e não a URL do seu site no GitHub Pages.
// Substitua 'SEU-SERVIDOR-BACKEND-PUBLICO-AQUI' pela URL fornecida pelo seu serviço de hospedagem.
const ws = new WebSocket('wss://fellas-1.onrender.com');

const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');

/**
 * Adiciona uma mensagem à lista na tela.
 * @param {object} data O objeto da mensagem recebida.
 * @param {string} data.type O tipo de mensagem ('message' ou 'notification').
 * @param {string} [data.sender] O remetente da mensagem.
 * @param {string} data.text O conteúdo da mensagem.
 */
function addMessage(data) {
    const item = document.createElement('li');

    if (data.type === 'notification') {
        item.textContent = data.text;
        Object.assign(item.style, { fontStyle: 'italic', color: '#666' });
    } else if (data.type === 'message') {
        item.textContent = `${data.sender}: ${data.text}`;
    } else {
        // Fallback para tipos de mensagem desconhecidos
        item.textContent = data.text || JSON.stringify(data);
    }

    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
}

// Evento: Conexão aberta com o servidor
ws.onopen = () => {
    console.log('Conectado ao servidor de chat!');
    addMessage({ type: 'notification', text: 'Conectado ao servidor!' });
};

// Evento: Mensagem recebida do servidor
ws.onmessage = (event) => {
    try {
        const data = JSON.parse(event.data);
        addMessage(data);
    } catch (e) {
        console.error('Erro ao processar a mensagem:', e);
        // Adiciona a mensagem bruta em caso de erro de parse
        addMessage({ type: 'notification', text: event.data });
    }
};

// Evento: Conexão fechada
ws.onclose = () => {
    console.log('Desconectado do servidor de chat.');
    addMessage({ type: 'notification', text: 'Você foi desconectado. Tente recarregar a página.' });
};

// Evento: Erro na conexão
ws.onerror = (error) => {
    console.error('Erro no WebSocket:', error);
    addMessage({ type: 'notification', text: 'Erro na conexão com o servidor.' });
};

// Ação: Enviar mensagem ao pressionar o formulário
form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value.trim()) {
        ws.send(input.value);
        input.value = '';
    }
});