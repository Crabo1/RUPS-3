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
    pgm.addColumns('level', {
        level_matrix: {
            type: 'text ARRAY',
            notNull: true,
            default: '{}'
        },
        object_matrix: {
            type: 'text ARRAY',
            notNull: true,
            default: '{}'
        }
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.dropColumn('level', 'level_matrix');
    pgm.dropColumn('level', 'object_matrix');
};
