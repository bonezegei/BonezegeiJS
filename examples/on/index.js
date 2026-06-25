import Bonezegei from 'https://cdn.jsdelivr.net/npm/@bonezegei/bonezegeijs@1.0.2/src/Bonezegei.js';

const bz = new Bonezegei();

export function App() {
const render = bz.createRenderer();
//bz.setRenderFunction(render); // <-- Add this line!
  const state = bz.reactive(
    { count: 0,
      increment() { this.count++ }
    },
    () => render('#app', state)
  );
  
  render('#app', state);

}

