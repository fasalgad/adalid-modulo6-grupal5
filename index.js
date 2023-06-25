import express from 'express';
import fetch from 'node-fetch';
import { create } from 'express-handlebars';
import * as helpers from "./lib/helpers.js";
import * as path from "path";
import { fileURLToPath } from 'url';

const app = express();
const port = 3001;

// Configurar Handlebars como motor de plantillas
const hbs = create({
  // Integración de helper.
  helpers,
  // Utilizar varios directorios o parciales.
  partialsDir: [
    "views/partials/"
  ]
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
// Creacion de variable de entorno
const __dirname = path.dirname(fileURLToPath(import.meta.url));




// Meedleware para acceso a publica y rutas 
app.use(express.json());
app.use(express.static('public'));
app.use('/img', express.static(__dirname + '/img'))
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/css'))
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'))
app.use('/bootstrapJs', express.static(__dirname + '/node_modules/bootstrap/dist/js'))
app.use('/axios', express.static(`${__dirname}/node_modules/axios/dist`));


// Definir una función asincrónica para obtener los datos de un Pokémon
async function getPokemonData(pokemonName) {
  return new Promise((resolve, reject) => {
    fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
      .then(response => response.json())
      .then(data => {
        let dataReturn = { img: data.sprites.front_default, nombre: data.name };
        resolve(dataReturn);
      })
      .catch(error => {
        reject(error);
      });
  });
}

// Definir una función asincrónica para obtener los datos de varios Pokémon
async function getAllPokemonData(pokemonNames) {
  const promises = pokemonNames.map(name => getPokemonData(name));
  const pokemonData = await Promise.all(promises);
  return pokemonData;
}

// Ruta para obtener los datos de un Pokémon de la siguiente ruta https://pokeapi.co/api/v2/pokemon?limit=20&offset=20
async function getLista(limit = 20, offset = 0) {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
  const data = await response.json();
  return data;
}


// Ruta para obtener los datos con los parámetros /?limit=20&offset=20
app.get('/', async (req, res) => {
  try {
    // se obtiene los datos por ?limit=20&offset=20
    let { limit, offset } = req.query;

    let lista = await getLista(limit, offset)//

    lista = lista.results.map(pokemon => pokemon.name);

    // Obtener los datos de varios Pokémon (por ejemplo, Pikachu, Charmander y Squirtle)
    const pokemonData = await getAllPokemonData(lista);

    // Renderizar la plantilla "index" con los datos de los Pokémon
    res.send(pokemonData);
  } catch (error) {
    console.error('Error al obtener los datos de los Pokémon:', error);
    res.render('error');
  }
});

app.get('/pokemones', async (req, res) => {
  try {
    let lista = await getLista(150)//
    lista = lista.results.map(pokemon => pokemon.name);

    // Obtener los datos de varios Pokémon (por ejemplo, Pikachu, Charmander y Squirtle)
    const pokemonData = await getAllPokemonData(lista);

    // Renderizar la plantilla "index" con los datos de los Pokémon
    res.render('index', { pokemon: pokemonData });
  } catch (error) {
    console.error('Error al obtener los datos de los Pokémon:', error);
    res.render('error');
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
});