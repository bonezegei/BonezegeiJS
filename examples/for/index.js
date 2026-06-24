import { Bonezegei } from '../../src/Bonezegei.js';

const bz = new Bonezegei();
const render = bz.createRenderer();

bz.setRenderFunction(render); 

const state = bz.reactive({
  items: ['Milk', 'Bread', 'Eggs'],
  newItem: '',

  add() {
    if (this.newItem.trim()) {
      this.items.push(this.newItem.trim());
      this.newItem = '';
    }
  }
}, () => render('#app', state));

// Initial paint
render('#app', state);