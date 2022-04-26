const fs = require('fs');
const path = require('path');


const express = require('express');
// for ABOVE  need to tell pc to use express
const { animals } = require('./data/animals.json');
//front end wants 'animals' , this tells it where its at and where to get it 


// Need to add in order to use Heroku
const PORT = process.env.PORT || 3001;

// instantiate server 
const app = express();


//ALLOWS FOR INCOMING DATA

// disect incoming string or array data
app.use(express.urlencoded({ extended: true }));
// disect incoming JSON data
app.use(express.json());



// goes through animal data in order to return requested info 
function filterByQuery(query, animalsArray) {
  let personalityTraitsArray = [];
  // Note that we save the animalsArray as filteredResults here:
  let filteredResults = animalsArray;
  if (query.personalityTraits) {
    // Save personalityTraits as a dedicated array.
    // If personalityTraits is a string, place it into a new array and save.
    if (typeof query.personalityTraits === 'string') {
      personalityTraitsArray = [query.personalityTraits];
    } else {
      personalityTraitsArray = query.personalityTraits;
    }
    // Loop through each trait in the personalityTraits array:
    personalityTraitsArray.forEach(trait => {
     
      filteredResults = filteredResults.filter(
        animal => animal.personalityTraits.indexOf(trait) !== -1
      );
    });
  }
  if (query.diet) {
    filteredResults = filteredResults.filter(animal => animal.diet === query.diet);
  }
  if (query.species) {
    filteredResults = filteredResults.filter(animal => animal.species === query.species);
  }
  if (query.name) {
    filteredResults = filteredResults.filter(animal => animal.name === query.name);
  }
  // return the filtered results:
  return filteredResults;
}

// takes in animal info array and only returns one that matches ID
function findById(id, animalsArray) {
  const result = animalsArray.filter(animal => animal.id === id)[0];
  return result;
}


// When zoo employee adds a new animal , the animal info will then be saved to the animals.json file !

function createNewAnimal(body, animalsArray) {
  const animal = body;
  animalsArray.push(animal);

  fs.writeFileSync(
    path.join(__dirname, './data/animals.json'),
    JSON.stringify({animals: animalsArray}, null, 2)
  );
  
  return animal;
}


function validateAnimal(animal) {
  if (!animal.name || typeof animal.name !== 'string') {
    return false;
  }
  if (!animal.species || typeof animal.species !== 'string') {
    return false;
  }
  if (!animal.diet || typeof animal.diet !== 'string') {
    return false;
  }
  if (!animal.personalityTraits || !Array.isArray(animal.personalityTraits)) {
    return false;
  }
  return true;
}







// GET ROUTES !


// this is the route on HOW to get to the data we want 
app.get('/api/animals', (req, res) => {
  let results = animals;
  if (req.query) {
    results = filterByQuery(req.query, results);
  }
  res.json(results);
});

app.get('/api/animals/:id', (req, res) => {
  const result = findById(req.params.id, animals);
  if (result) {
    res.json(result);
  } else {
    res.send(404);
  }
});

// POST ROUTE

app.post('/api/animals', (req, res) => {
  // set id based on what the next index of the array will be
  req.body.id = animals.length.toString();

   // if any data in req.body is incorrect, send 400 error back
   if (!validateAnimal(req.body)) {
    res.status(400).send('The animal is not properly formatted.');
  } else {
    const animal = createNewAnimal(req.body, animals);
    res.json(animal);
  }
});



// MUST change from local host '3001' to PORT in order for Heroku to work 
app.listen(PORT, () => {
  console.log(`API server now on port ${PORT}!`);
});