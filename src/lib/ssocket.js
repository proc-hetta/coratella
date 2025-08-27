// @ts-nocheck
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

const server = createServer({});
const wss = new WebSocketServer({ server });

// TODO: Add pinger to check for broken connections
// https://www.npmjs.com/package/ws/v/7.4.3#how-to-detect-and-close-broken-connections
wss.on('connection', function connection(ws) {
  ws.isAlive = true;
  ws.onmessage = (message) => {
    let data = message.data.toString();
    updateClients(message.data);
  };
  ws.onclose = () => {
    console.warn('client disconnected');
    updateClients('EOL');
  };
  ws.on('pong', heartbeat);
});

wss.on('close', function close() {
  clearInterval(interval);
});

function noop() {}

function heartbeat() {
  this.isAlive = true;
}

const clientsCallback = (func) => {
  wss.clients.forEach((client) => {
    func(client);
  });
};

const interval = setInterval(function ping() {
  clientsCallback(function each(client) {
    if (client.isAlive === false) {
      return client.terminate();
    }
    client.isAlive = false;
    client.ping(noop);
  });
}, 3000);

export const updateClients = (message) => {
  clientsCallback(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

server.listen(5555);

// TODO: start this as a service in the docker-compose.yml
