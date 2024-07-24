const {
  addNoteHandler,
  getAllNotesHandler,
  getNoteByIdHandler,
  editNoteByIdHandler,
  deleteNoteByIdHandler,
  addItemsNote,
  editItemsNote,
  deleteItemsNote,
} = require('./handler');

const routes = [
  {
    method: 'POST',
    path: '/notes',
    handler: addNoteHandler,
  },

  {
    method: 'GET',
    path: '/notes',
    handler: getAllNotesHandler,
  },

  {
    method: 'GET',
    path: '/notes/{id}',
    handler: getNoteByIdHandler,
  },

  {
    method: 'PUT',
    path: '/notes/{id}',
    handler: editNoteByIdHandler,
  },

  {
    method: 'DELETE',
    path: '/notes/{id}',
    handler: deleteNoteByIdHandler,
  },
  {
    method: 'POST',
    path: '/item-notes',
    handler: addItemsNote,
  },

  {
    method: 'PUT',
    path: '/item-notes/{id}',
    handler: editItemsNote,
  },

  {
    method: 'DELETE',
    path: '/item-notes/{id}',
    handler: deleteItemsNote,
  },
];

module.exports = routes;
