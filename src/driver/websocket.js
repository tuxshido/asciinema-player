import buffer from '../buffer';

function websocket({ url, bufferTime = 0 }, { feed }) {
  const buf = buffer(feed, bufferTime);
  let socket;
  let reconnectDelay = 250;

  function connect() {
    socket = new WebSocket(url);
    socket.binaryType = 'arraybuffer';

    socket.onopen = () => {
      console.debug(`websocket: connected`);
      reconnectDelay = 250;
    }

    socket.onmessage = event => {
      if (typeof event.data === 'string') {
        buf.pushEvent(JSON.parse(event.data));
      } else {
        buf.pushText(String.fromCharCode.apply(null, new Uint8Array(event.data)));
      }
    }

    socket.onclose = event => {
      if (!event.wasClean) {
        console.debug(`websocket: unclean close, reconnecting in ${reconnectDelay}...`);
        setTimeout(connect, reconnectDelay);
        reconnectDelay = Math.min(reconnectDelay * 2, 5000);
      }
    }
  }

  return {
    start: () => {
      connect();
    },

    stop: () => {
      if (socket !== undefined) {
        socket.close();
      }
    }
  }
}

export { websocket };
