const mongoose = require('mongoose')
const isPrintPhonebook = process.argv.length <= 3 
const isSavePerson = process.argv.length >= 5 

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url =
  `mongodb+srv://mopoz:${password}@cluster0.gdeza.mongodb.net/phonebook-app?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })

const personSchema = new mongoose.Schema({
  name: String,
  number: String || Number,
})

const Person = mongoose.model('Person', personSchema)

if (isPrintPhonebook) {
  Person.find({}).then(result => {
    console.log('phonebook:');
    result.forEach(({name, number}) => {
      console.log(`${name} ${number}`)
    })
    mongoose.connection.close()
  })
}

if (isSavePerson) {
  const person = new Person({
    name,
    number,
  })

  person.save().then(result => {
    console.log('person saved!', result)
    mongoose.connection.close()
  })
}