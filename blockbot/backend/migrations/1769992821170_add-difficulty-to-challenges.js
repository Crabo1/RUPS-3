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
     pgm.addColumn('challenges', {
        difficulty: {
            type: 'varchar(10)',
            default: 'medium',
            notNull: true,
        },
    });

    pgm.addConstraint('challenges', 'challenges_difficulty_check', {
        check: "difficulty IN ('easy', 'medium', 'hard')",
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.dropConstraint('challenges', 'challenges_difficulty_check');
    pgm.dropColumn('challenges', 'difficulty');
};
