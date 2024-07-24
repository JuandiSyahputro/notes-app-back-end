const { nanoid } = require('nanoid');
// const notes = require('./notes');
const connection = require('./connection');

const addNoteHandler = async (request, h) => {
  const { title, date_note } = request.payload;
  const id = nanoid(16);

  const sql = `INSERT INTO notes (id, title, date_note) VALUES ('${id}', '${title}', '${date_note}')`;

  try {
    const results = await connection.query(sql);

    if (results.affectedRows > 0) {
      const response = h.response({
        status: 'success',
        message: 'Catatan berhasil ditambahkan',
        data: {
          note_id: id,
        },
        status_code: 201,
      });
      response.code(201);
      return response;
    } else {
      const response = h.response({
        status: 'fail',
        message: 'Catatan gagal ditambahkan',
        status_code: 400,
      });
      response.code(400);
      return response;
    }
  } catch (error) {
    console.log(error);
    const response = h.response({
      status: 'fail',
      message: 'Failed to add note',
      status_code: 500,
    });
    response.code(500);
    return response;
  }
};

const getAllNotesHandler = async (request, h) => {
  const filterDate = request.query['filter-date'];

  let sql = `
    SELECT 
      notes.id AS note_id, 
      notes.title AS note_title, 
      notes.created_at AS note_created_at, 
      notes.date_note AS note_date_note,
      note_items.id AS item_id, 
      note_items.title AS item_title, 
      note_items.is_completed AS item_is_completed
    FROM 
      notes
    LEFT JOIN 
      note_items ON notes.id = note_items.id_notes
    WHERE 
      1=1
  `;

  if (filterDate) {
    sql += ` AND DATE(notes.date_note) = ?`;
  } else {
    sql += ` AND DATE(notes.created_at) = CURDATE()`;
  }

  sql += ` ORDER BY notes.created_at DESC;`;

  try {
    const results = await connection.query(sql, [filterDate]);

    const notesMap = {};
    results.forEach((row) => {
      const {
        note_id,
        note_title,
        note_created_at,
        note_date_note,
        item_id,
        item_title,
        item_is_completed,
      } = row;

      if (!notesMap[note_id]) {
        notesMap[note_id] = {
          id: note_id,
          title: note_title,
          created_at: note_created_at,
          date_note: note_date_note,
          notes_item: [],
        };
      }

      if (item_id) {
        notesMap[note_id].notes_item.push({
          id: item_id,
          title: item_title,
          is_completed: item_is_completed,
        });
      }
    });

    const notes = Object.values(notesMap);

    return h
      .response({
        status: 'success',
        status_code: 200,
        data: {
          data: notes,
        },
      })
      .code(200);
  } catch (err) {
    console.log(err);
    return h
      .response({
        status: 'fail',
        status_code: 500,
        message: 'Failed to get notes',
      })
      .code(500);
  }
};

const getNoteByIdHandler = async (request, h) => {
  const { id } = request.params;
  const sql = `SELECT * FROM notes WHERE id = '${id}';`;
  try {
    const results = await connection.query(sql);

    if (results.length > 0) {
      return h
        .response({
          status: 'success',
          status_code: 200,
          data: {
            note: results[0],
          },
        })
        .code(200);
    } else {
      return h
        .response({
          status: 'fail',
          status_code: 404,
          message: 'Undefined to get note',
        })
        .code(404);
    }
  } catch (error) {
    console.log(error);
    return h
      .response({
        status: 'fail',
        status_code: 500,
        message: 'Failed to get note',
      })
      .code(500);
  }
};

const editNoteByIdHandler = async (request, h) => {
  const { id } = request.params;
  const { title, date_note, content } = request.payload;

  try {
    let sql;
    let params;
    let results;

    if (Array.isArray(content)) {
      for (const item of content) {
        sql = 'UPDATE note_items SET title = ? WHERE id = ?;';
        params = [item.title, item.id];
        results = await connection.query(sql, params);

        if (results.affectedRows === 0) {
          return h
            .response({
              status: 'fail',
              status_code: 404,
              message: 'Catatan items gagal diperbarui. Id tidak ditemukan',
            })
            .code(404);
        }
      }
      return h
        .response({
          status: 'success',
          status_code: 200,
          message: 'Catatan items berhasil diperbarui',
        })
        .code(200);
    } else {
      sql = 'UPDATE notes SET title = ?, date_note = ? WHERE id = ?;';
      params = [title, date_note, id];
      results = await connection.query(sql, params);

      if (results.affectedRows > 0) {
        return h
          .response({
            status: 'success',
            message: 'Catatan berhasil diperbarui',
            status_code: 200,
            data: {
              note_id: id,
            },
          })
          .code(200);
      } else {
        return h
          .response({
            status: 'fail',
            message: 'Gagal memperbarui catatan. Id tidak ditemukan',
            status_code: 404,
          })
          .code(404);
      }
    }
  } catch (error) {
    console.log(error);
    return h
      .response({
        status: 'fail',
        message: 'Failed to update TodoList',
        status_code: 500,
      })
      .code(500);
  }
};

const deleteNoteByIdHandler = async (request, h) => {
  const { id } = request.params;

  const sql = `DELETE FROM notes WHERE id = '${id}';`;

  try {
    const results = await connection.query(sql);
    if (results.affectedRows > 0) {
      const response = h.response({
        status: 'success',
        status_code: 200,
        message: 'Catatan berhasil dihapus',
      });
      response.code(200);
      return response;
    } else {
      const response = h.response({
        status: 'fail',
        status_code: 404,
        message: 'Catatan gagal dihapus. Id tidak ditemukan',
      });
      response.code(404);
      return response;
    }
  } catch (error) {
    console.log(error);
    const response = h.response({
      status: 'fail',
      status_code: 500,
      message: 'Failed to delete TodoList',
    });
    response.code(500);
    return response;
  }
};

const addItemsNote = async (request, h) => {
  const { content, id_notes } = request.payload;
  if (!Array.isArray(content)) {
    const response = h.response({
      status: 'fail',
      message: 'Catatan items harus berupa array',
      status_code: 400,
    });
    response.code(400);
    return response;
  }

  try {
    for (const item of content) {
      const { title, is_completed } = item;
      const id = nanoid(16);

      const sql = `INSERT INTO note_items (id, title, id_notes, is_completed) VALUES ('${id}', '${title}', '${id_notes}', '${is_completed}')`;

      const results = await connection.query(sql);

      if (results.affectedRows === 0) {
        throw new Error('Failed to insert note item');
      }
    }

    const response = h.response({
      status: 'success',
      status_code: 201,
      message: 'Catatan items berhasil ditambahkan',
    });
    response.code(201);

    return response;
  } catch (error) {
    console.log(error);
    const response = h.response({
      status: 'fail',
      status_code: 500,
      message: 'Failed to add note item',
    });
    response.code(500);

    return response;
  }
};

const editItemsNote = async (request, h) => {
  const { id } = request.params;
  const { title, id_notes, is_completed, content } = request.payload;

  try {
    let sql;
    let params;

    sql = 'UPDATE note_items SET title = ?, is_completed = ? WHERE id = ?;';
    params = [title, is_completed, id];

    const results = await connection.query(sql, params);
    if (results.affectedRows === 0) {
      return h
        .response({
          status: 'fail',
          status_code: 404,
          message: 'Catatan items gagal diperbarui. Id tidak ditemukan',
        })
        .code(404);
    }

    return h
      .response({
        status: 'success',
        status_code: 200,
        message: 'Catatan items berhasil diperbarui',
      })
      .code(200);
  } catch (error) {
    console.error(error);
    return h
      .response({
        status: 'fail',
        status_code: 500,
        message: 'Failed to update note item',
      })
      .code(500);
  }
};

const deleteItemsNote = async (request, h) => {
  const { id } = request.params;
  const sql = `DELETE FROM note_items WHERE id = '${id}';`;
  try {
    const results = await connection.query(sql);
    if (results.affectedRows > 0) {
      const response = h.response({
        status: 'success',
        status_code: 200,
        message: 'Catatan items berhasil dihapus',
      });
      response.code(200);
      return response;
    } else {
      const response = h.response({
        status: 'fail',
        status_code: 404,
        message: 'Catatan items gagal dihapus. Id tidak ditemukan',
      });
      response.code(404);
      return response;
    }
  } catch (error) {
    console.log(error);
    const response = h.response({
      status: 'fail',
      status_code: 500,
      message: 'Failed to delete note item',
    });
    response.code(500);
    return response;
  }
};

module.exports = {
  addNoteHandler,
  getAllNotesHandler,
  getNoteByIdHandler,
  editNoteByIdHandler,
  deleteNoteByIdHandler,
  addItemsNote,
  editItemsNote,
  deleteItemsNote,
};
