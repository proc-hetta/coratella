import * as dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import assert from 'assert';

dotenv.config({ path: './.env' });

assert(process.env.WS_PORT !== undefined && !isNaN(Number(process.env.WS_PORT)));
assert(process.env.PUBLIC_WS_PORT !== undefined && !isNaN(Number(process.env.PUBLIC_WS_PORT)));

const server = createServer({});
const wss = new WebSocketServer({ server });

class WebSSocket {
  constructor(ws: WebSocket) {
    this.ws = ws;
    this.isAlive = ws !== null && ws.readyState === WebSocket.OPEN;
  }
  heartbeat() {
    this.isAlive = true;
  }
  ws: WebSocket;
  isAlive: boolean;
  static as(ws: WebSocket | WebSSocket) {
    if (ws instanceof WebSSocket) return ws;
    return new WebSSocket(ws);
  }
}

// https://www.npmjs.com/package/ws/v/7.4.3#how-to-detect-and-close-broken-connections
wss.on('connection', function connection(client: WebSocket) {
  const sclient = WebSSocket.as(client);
  sclient.ws.onmessage = (message) => {
    let data = message.data.toString();
    updateClients(message.data);
  };
  sclient.ws.onclose = () => {
    console.warn('client disconnected');
    updateClients('EOL');
  };
  sclient.ws.on('pong', sclient.heartbeat);
});

wss.on('close', function close() {
  clearInterval(interval);
});

function noop() {}

const clientsCallback = (func: (arg0: WebSSocket) => void) => {
  wss.clients.forEach((client) => {
    const sclient = WebSSocket.as(client);
    func(sclient);
  });
};

const interval = setInterval(function ping() {
  clientsCallback(function each(client: WebSSocket) {
    if (client.isAlive === false) {
      return client.ws.terminate();
    }
    client.isAlive = false;
    client.ws.ping(noop);
  });
}, 3000);

export const updateClients = (message: WebSocket.Data) => {
  clientsCallback(function each(client) {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(message);
    }
  });
};

server.listen(process.env.PUBLIC_WS_PORT);

// TODO: start this as a service in the docker-compose.yml
