/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
    pgm.createTable('user', {
        id: 'id',
        username: {
            type: 'text',
            notNull: true
        },
        email: {
            type: 'text',
            notNull: true,
            unique: true
        },
        password: {
            type: 'text',
            notNull: true
        },
        createdAt: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        } 
    });

    pgm.createTable('level', {
        id: 'id',
        name: {
            type: 'text',
            notNull: true
        },
        description: {
            type: 'text',
            notNull: true
        },
        level: {
            type: 'text',
            notNull: true
        },
        pos: {
            type: 'integer'
        },
        createdAt: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        }
    });

    pgm.createTable('leaderboard', {
        id: 'id',
        name: {
            type: 'text',
            notNull: true
        },
        creator: {
            type: 'bigint',
            notNull: true,
            references: '"user"',
            onDelete: 'CASCADE',
            unique: true
        },
        createdAt: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        }
    });

    pgm.createTable('levels_users', {
        id: 'id',
        user: {
            type: 'bigint',
            notNull: true,
            references: '"user"',
            onDelete: 'CASCADE',
        },
        level: {
            type: 'bigint',
            notNull: true,
            references: '"level"',
            onDelete: 'CASCADE',
        }
    });

    pgm.createTable('users_leaderboard', {
        id: 'id',
        user: {
            type: 'bigint',
            notNull: true,
            references: '"user"',
            onDelete: 'CASCADE',
            unique: true
        },
        leaderboard: {
            type: 'bigint',
            notNull: true,
            references: '"leaderboard"',
            onDelete: 'CASCADE'
        }
    });
    
//     pgm.createTable('challenges', {
//         id: 'id',
//         challenger_id: {   
//             type: 'bigint',
//             notNull: true,
//             references: '"user"',
//             onDelete: 'CASCADE',
//         },
//         challengee_id: {    
//             type: 'bigint',
//             notNull: true,
//             references: '"user"',   
//             onDelete: 'CASCADE',
//         }
// })
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.dropTable('users_leaderboard');
    pgm.dropTable('levels_users');
    pgm.dropTable('leaderboard');
    pgm.dropTable('level');
    pgm.dropTable('user');
    pgm.dropTable('challenges');
};
