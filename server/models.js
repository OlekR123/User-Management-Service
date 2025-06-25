const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const db = new sqlite3.Database(process.env.DATABASE_URL || './database.sqlite');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      passwordHash TEXT NOT NULL,
      role TEXT NOT NULL
    )
  `);
});

const createUser = async ({ name, email, password, role }) => {
  const passwordHash = await bcrypt.hash(password, 10);
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO users (name, email, passwordHash, role) VALUES (?, ?, ?, ?)',
      [name, email, passwordHash, role],
      function (err) {
        if (err) return reject(err);
        resolve({ id: this.lastID, name, email, role });
      }
    );
  });
};

const findUserById = (id) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT id, name, email, role FROM users WHERE id = ?', [id], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
};

const findUserByEmail = (email) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
};

const listUsers = ({ filter = {}, limit = 10, offset = 0 }) => {
  let query = 'SELECT id, name, email, role FROM users';
  const params = [];
  if (filter.role || filter.email) {
    query += ' WHERE';
    if (filter.role) {
      query += ' role = ?';
      params.push(filter.role);
    }
    if (filter.email) {
      query += filter.role ? ' AND email = ?' : ' email = ?';
      params.push(filter.email);
    }
  }
  query += ' LIMIT ? OFFSET ?';
  params.push(limit, offset);

  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

const updateUser = async (id, { name, email, password, role }) => {
  const updates = {};
  if (name) updates.name = name;
  if (email) updates.email = email;
  if (password) updates.passwordHash = await bcrypt.hash(password, 10);
  if (role) updates.role = role;

  const keys = Object.keys(updates);
  if (keys.length === 0) return Promise.resolve(null);

  const setClause = keys.map((key) => `${key} = ?`).join(', ');
  const values = [...Object.values(updates), id];

  return new Promise((resolve, reject) => {
    db.run(`UPDATE users SET ${setClause} WHERE id = ?`, values, function (err) {
      if (err) return reject(err);
      resolve(findUserById(id));
    });
  });
};

const deleteUser = (id) => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM users WHERE id = ?', [id], function (err) {
      if (err) return reject(err);
      resolve(this.changes > 0);
    });
  });
};

module.exports = { createUser, findUserById, findUserByEmail, listUsers, updateUser, deleteUser };