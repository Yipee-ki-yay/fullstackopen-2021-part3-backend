require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person')

morgan.token(
  'data', 
  function (req, res) { 
    return JSON.stringify(
      {"name": req.body.name, "number": req.body.number }
    )
  }
)

app.use(express.static('build'))
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms - :data'))
app.use(cors())

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/info', (request, response) => {
  Person.count({}, function( err, count){
    const date = new Date();
    response.send(
      `<div>
        <div>Phonebook has info for ${count} people</div>
        <div>${date}</div>
      </div>`
    )
  })
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(result => {
    console.log('phonebook:');
    result.forEach(({name, number}) => {
      console.log(`${name} ${number}`)
    })
    response.json(result)
  })
  .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(person => {
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  })
  .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id).then(result => {
    response.status(204).end()
  })
  .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body
  const isDataMissing = !body.name || !body.number
  // const isNameUnique = persons.find(p => p.name === body.name)

  if (isDataMissing) {
    return response.status(400).json({
      error: 'The name or number is missing'
    })
  }

  // if (isNameUnique) {
  //   return response.status(400).json({
  //     error: 'The name must be unique'
  //   })
  // }

  const newPerson = new Person({
    name: body.name,
    number: body.number,
    date: new Date(),
  })

  newPerson.save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(request.params.id, person, {new: true, runValidators: true, context: 'query'})
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})