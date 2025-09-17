const WebSocket = require('ws');
const http = require('http');

// Define a porta. Usa a porta do ambiente (fornecida pelo Render) ou 8080 como padrão local.
const PORT = process.env.PORT || 8080;

// Cria um servidor HTTP. Ele pode ser usado para health checks do Render.
const server = http.createServer((req, res) => {
    // Responde a health checks com um status 200 OK.
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Servidor de chat está no ar.');
});

// Anexa o servidor WebSocket ao servidor HTTP.
const wss = new WebSocket.Server({ server });

// Contador para IDs de usuário únicos
let userCounter = 0;

/**
 * Transmite uma mensagem para todos os clientes conectados.
 * @param {object} data O objeto de dados a ser transmitido.
 */
function broadcast(data) {
    const message = JSON.stringify(data);
    console.log("Transmitindo mensagem:", message);
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

wss.on('connection', ws => {
    userCounter++;
    ws.userId = `Usuário-${userCounter}`;
    console.log(`Novo cliente conectado: ${ws.userId}`);

    // Notifica a todos sobre o novo usuário
    broadcast({
        type: 'notification',
        text: `${ws.userId} entrou no chat.`
    });

    ws.on('message', message => {
        const messageString = message.toString();
        console.log(`Mensagem recebida de ${ws.userId}: ${messageString}`);
        // Transmite a mensagem com informações do remetente
        broadcast({
            type: 'message',
            sender: ws.userId,
            text: messageString
        });
    });

    ws.on('close', () => {
        console.log(`Cliente desconectado: ${ws.userId}`);
        // Notifica a todos que o usuário saiu
        broadcast({
            type: 'notification',
            text: `${ws.userId} saiu do chat.`
        });
    });
});

// Inicia o servidor HTTP para escutar na porta definida.
server.listen(PORT, () => {
    console.log(`Servidor de chat WebSocket rodando na porta ${PORT}...`);
});