import Bonezegei from '../../src/Bonezegei.js';

const bz = new Bonezegei();
const render = bz.createRenderer();

// render( param1, param2 )
// param1 = ID name of the HTML element [ String ]
// param2 = Context [ Object ]
render(
    '#app',                        // ID of the element 
    {                              // 
        variable: "Hello World",   // Set the variable name "variable"
    }
);

