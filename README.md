# BonezegeiJS

BonezegeiJS is a lightweight JavaScript DOM framework designed to demonstrate reactive rendering and declarative UI composition in a browser-native environment.

It is intended for developers who want a compact, easy-to-understand runtime for managing state, DOM updates, and template-driven behavior without a large dependency footprint.

It provides:

- fine-grained reactive state through `Bonezegei.reactive()`
- declarative template interpolation and directive processing
- element directives such as `b-for`, `b-if`, `b-model`, `b-on`, `b-show`, `b-class`, and `b-style`
- automated DOM updates when the underlying state changes
- a small client-side routing utility via `createRouter()`

## Usage

```html
<!DOCTYPE html>
<html>
    <head>
        <meta charset='utf-8'>
        <meta http-equiv='X-UA-Compatible' content='IE=edge'>
        <title>Bonezegei Variable Example </title>
    </head>

    <body>
        <!-- Set ID of the Element -->  
        <div id="app">
        <!-- declare variable {{ variable_name }}-->    
            <h1>{{ variable }} </h1>
        </div>
    </body>
  
    <script type="module">
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
    </script>
</html>
```

## API

- `Bonezegei.createApp(options)` - initialize the app with `el`, `data`, and `methods`.
- `Bonezegei.reactive(obj, onChange)` - create a reactive proxy object.
- `Bonezegei.createRouter(routes, outletSelector)` - create a basic client-side router.

BonezegeiJS is ideal for small projects or learning how a DOM-driven reactive library works.
