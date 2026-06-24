import Bonezegei from './../../src/Bonezegei.js';

const bz = new Bonezegei();

export function App() {

  const render = bz.createRenderer();
  const state = bz.reactive(
    { username: '' },
    () => render('#app', state)
  );
  render('#app', state);
  
}