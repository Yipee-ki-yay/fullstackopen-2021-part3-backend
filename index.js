const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

morgan.token(
  'data', 
  function (req, res) { 
    return JSON.stringify(
      {"name": req.body.name, "number": req.body.number }
    )
  }
)

app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms - :data'))
app.use(cors())

let persons = [
  {
    "name": "Arto Hellas",
    "number": "040-123456",
    "id": 1
  },
  {
    "name": "Ada Lovelace",
    "number": "39-44-5323523",
    "id": 2
  },
  {
    "name": "Dan Abramov",
    "number": "12-43-234345",
    "id": 3
  },
  {
    "name": "Mary Poppendieck",
    "number": "39-23-6423122",
    "id": 4
  }
]

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/info', (request, response) => {
  const date = new Date();
  response.send(`
    <div>Phonebook has info for ${persons.length} people</div>
    <div>${date}</div>
  `)
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(p => p.id === id)
  
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(p => p.id !== id)

  response.status(204).end()
})

app.post('/api/persons', (request, response) => {
  const body = request.body
  const isDataMissing = !body.name || !body.number
  const isNameUnique = persons.find(p => p.name === body.name)

  console.log('isNameUnique', isNameUnique);

  if (isDataMissing) {
    return response.status(400).json({
      error: 'The name or number is missing'
    })
  }

  if (isNameUnique) {
    return response.status(400).json({
      error: 'The name must be unique'
    })
  }

  const newPerson = {
    name: body.name,
    number: body.number,
    id: Math.floor(Math.random() * 1000000),
  }

  persons = persons.concat(newPerson)

  response.json(newPerson)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})