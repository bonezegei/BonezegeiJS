class BonezegeiConnect {

  constructor(options) {
    this.options = options;
  }

 createHttpService(baseUrl) {

    async function request(endpoint, options = {}) {
      const res = await fetch(`${baseUrl}${endpoint}`, {
        headers: { 'Content-Type': 'application/json', ...(options.headers||{}) },
        ...options
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message||`HTTP ${res.status}`);
      }
      //return res;
      return res.json();
    }

    return {
      get:    (url, h)   => request(url,     { method:'GET',    headers:h }),
      post:   (url, d,h) => request(url,     { method:'POST',   body:JSON.stringify(d), headers:h }),
      put:    (url, d,h) => request(url,     { method:'PUT',    body:JSON.stringify(d), headers:h }),
      patch:  (url, d,h) => request(url,     { method:'PATCH',  body:JSON.stringify(d), headers:h }),
      del:    (url,   h) => request(url,     { method:'DELETE', headers:h })
    };
  }

  // Long Polling
async longPoll(url, onData, onError, timeout = 10000) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    onData(data);
    // Wait for the specified timeout before next poll
    setTimeout(() => {
      this.longPoll(url, onData, onError, timeout);
    }, timeout);
  } catch (err) {
    onError(err);
    // Optionally retry after error, also with timeout
    setTimeout(() => {
      this.longPoll(url, onData, onError, timeout);
    }, timeout);
  }
}

// WebSocket
//=====================================================================================================================================================
createWebSocket(url, protocols) {
  let ws;
  let listeners = {}; 

  function connect() {
    ws = new WebSocket(url, protocols);

    ws.onopen = (event) => {
      if (listeners['open']) {
        listeners['open'].forEach(cb => cb(event));
      }
    };

    ws.onmessage = (event) => {
      if (listeners['message']) {
        listeners['message'].forEach(cb => cb(event.data));
      }
    };

    ws.onclose = (event) => {
      if (listeners['close']) {
        listeners['close'].forEach(cb => cb(event));
      }
    };

    ws.onerror = (event) => {
      if (listeners['error']) {
        listeners['error'].forEach(cb => cb(event));
      }
    };
  }

  function send(message) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    } else {
      console.warn('WebSocket is not open. Ready state:', ws ? ws.readyState : 'N/A');
    }
  }

  function addEventListener(eventType, callback) {
    if (!listeners[eventType]) {
      listeners[eventType] = [];
    }
    listeners[eventType].push(callback);
  }

  connect();

  return {
    send,
    addEventListener,
    reconnect: connect
  };
}



}

export { BonezegeiConnect };