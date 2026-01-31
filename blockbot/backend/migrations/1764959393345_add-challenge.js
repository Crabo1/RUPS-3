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
        pgm.createTable('challenges', {
        id: 'id',
        challenger_id: {   
            type: 'bigint',
            notNull: true,
            references: '"user"',
            onDelete: 'CASCADE',
        },
        challengee_id: {    
            type: 'bigint',
            notNull: true,
            references: '"user"',   
            onDelete: 'CASCADE',
        }
});
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {};
