import { createServer } from 'http';
import { WebSocketServer } from 'ws';

const server = createServer({});
const wss = new WebSocketServer({ server });

// TODO: Add pinger to check for broken connections
// https://www.npmjs.com/package/ws/v/7.4.3#how-to-detect-and-close-broken-connections
wss.on('connection', function connection(ws) {
  ws.onmessage = (message) => {
    console.log(wss.clients.size);
    updateClients(message.data);
  };
  ws.onclose = () => {
    console.warn('client disconnected');
    updateClients('EOL');
  };
});

export const updateClients = (/** @type any */ message) => {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

server.listen(5555);

// TODO: start this as a service in the docker-compose.yml
