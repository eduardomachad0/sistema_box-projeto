import { Database } from "bun:sqlite"

const db = new Database("database.sqlite")

db.run(`
  CREATE TABLE IF NOT EXISTS box (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    numero  INTEGER NOT NULL UNIQUE
  );
`);

db.run(`
  CREATE TABLE IF NOT EXISTS sessao (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    box_id  INTEGER NOT NULL,
    placa   TEXT NOT NULL,
    status  TEXT NOT NULL,
    inicio  TEXT DEFAULT (datetime('now', 'localtime')),
    fim     TEXT
  );
`);

db.run(`
  CREATE TABLE IF NOT EXISTS pausa (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    sessao_id  INTEGER NOT NULL,
    motivo     TEXT NOT NULL,
    inicio     TEXT DEFAULT (datetime('now', 'localtime')),
    fim        TEXT
  );
`);

db.run(`INSERT OR IGNORE INTO box (numero) VALUES (1), (2), (3), (4)`);

export { db }
