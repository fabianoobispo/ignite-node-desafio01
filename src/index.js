const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.query;

  const user = users.find((users) => users.username === username);

  if(!user) {
    return response.status(400).json({error: "Usuario nao encontrado"})
  }

  request.user = user;
 return next();
}

app.post('/users', (request, response) => {
  const {name, username } = request.body;
  const id = uuidv4();

  const usernameexists = users.find((users) => users.username === username);
  if(usernameexists) {
    return response.status(400).json({error: "Usuario existente"})
  }

  users.push({
    id,
    name,
    username,
    todos: []
  });

  return response.status(201).json({
    id,
    name,
    username,
    todos: []
  });
});

app.get('/todos',checksExistsUserAccount, (request, response) => {
  const {user} = request;
  return response.status(201).json({todos : user.todos});  
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = {
    id: uuidv4(),
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  };

  user.todos.push(todo);

  return response.status(201).json(todo);


});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo nao existe!" });
  }

  todo.title = title;
  todo.deadline = deadline;

  return response.status(200).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo nao existe!" });
  }

  todo.done = true;

  return response.status(200).json(todo);

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;
  
  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo not found!" });
  }

  user.todos.splice(todo, 1);

  return response.status(204).send();
  
});

module.exports = app;