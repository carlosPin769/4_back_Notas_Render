require('dotenv').config()
const express = require('express')
const app = express()
const Note = require('./models/note')



app.use(express.json())


app.use(express.static('dist'))

const cors = require('cors')
app.use(cors())
let notes = []

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  next(error)
}

app.use(requestLogger)



app.get('/', (request, response) => {
  response.send('<h1>Adios Que te vas!</h1>')
})

app.get('/api/notes', (request, response) => {
  Note.find({}).then(notes => {
	  response.json(notes)
  })
})

app.get('/api/notes/info',(request, response) => {
	
	Note.find({}).then(notes => {
		const notesLen = notes.length
		const fecha = new Date().toString()
		const html = `<p>Agenda de Notas tiene informacion de: ${notesLen} Notas</p><p>  ${fecha} </p>`;
    response.send(html)
  })
})

app.get('/api/notes/:id', (request, response, next) => {
  Note.findById(request.params.id)
  .then((note) => {
	  if (note) {
        response.json(note)
      } else {
        response.status(404).end()
      }
  })
  .catch(error => next(error))
})

app.delete('/api/notes/:id', (request, response, next) => {
  Note.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
	 .catch(error => next(error))
})

const generateId = () => {
  const maxId = notes.length > 0
    ? Math.max(...notes.map(n => n.id))
    : 0
  return maxId + 1
}

app.post('/api/notes', (request, response) => {
  const body = request.body

  if (body.content === undefined) {
    return response.status(400).json({ error: 'content missing' })
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
  })

  note.save().then(savedNote => {
    response.json(savedNote)
  })
})


app.put('/api/notes/:id', (request, response, next) => {
  const body = request.body

  const note = {
    content: body.content,
    important: body.important,
  }

  Note.findByIdAndUpdate(request.params.id, note, { new: true })
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)
app.use(errorHandler)


app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

const PORT = process.env.PORT || 3002
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
