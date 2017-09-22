var knexConfig  = process.env.KNEX_CONFIG || 'development';
var knexFile    = require('./knexfile.js');
var knex        = require('knex')(knexFile[knexConfig]);

// migrate our database only if not in production environment
if (knexConfig != 'production') {
  knex.migrate.latest([knexFile]);
}

module.exports = knex;
