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
    pgm.addColumns('levels_users',{
            blocks_used: {
                type: 'text',
                notNull: true,
                default: '0'
            },
            stars: {
                type: 'integer',
                notNull: true,
                default: 0
            }
        }
    );
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.dropColumn('levels_users', 'blocks_used');
    pgm.dropColumn('levels_users', 'stars');
};
