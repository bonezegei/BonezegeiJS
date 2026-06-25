import Bonezegei from 'https://cdn.jsdelivr.net/npm/@bonezegei/bonezegeijs@1.0.2/src/Bonezegei.js';

const bz = new Bonezegei();

export function App() {

  const render = bz.createRenderer();
  const state = bz.reactive(
    { username: '' },
    () => render('#app', state)
  );
  render('#app', state);
  
}