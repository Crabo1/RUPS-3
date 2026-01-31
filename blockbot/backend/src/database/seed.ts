import { getPool } from "./pool";
import { makeLogger } from "../logger";
import levelsData from "./levels/levels.json";

const logger = makeLogger();

export async function seedDatabase(databaseUrl: string): Promise<void> {
  const pool = getPool(databaseUrl);

  try {
    const { rows: existingLevels } = await pool.query(
      "SELECT level, name, description, pos, level_matrix, object_matrix, actions FROM level"
    );

    const existingLevelsMap = new Map(
      existingLevels.map((level) => [level.level, level])
    );

    logger.info(`Found ${existingLevels.length} existing levels in database.`);

    let inserted = 0;
    let updated = 0;
    let unchanged = 0;

    for (const level of levelsData) {
      const levelKey = `level_${level.index}`;
      const existingLevel = existingLevelsMap.get(levelKey);

      if (!existingLevel) {
        await pool.query(
          `INSERT INTO level (name, description, level, pos, level_matrix, object_matrix, actions)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            level.name,
            level.description,
            levelKey,
            level.index,
            level.levelMatrix,
            level.objectsMatrix,
            level.actions,
          ]
        );
        logger.info(`Inserted new level ${level.index}: ${level.name}`);
        inserted++;
      } else {
        const hasChanged =
          existingLevel.name !== level.name ||
          existingLevel.description !== level.description ||
          existingLevel.pos !== level.index ||
          JSON.stringify(existingLevel.level_matrix) !==
            JSON.stringify(level.levelMatrix) ||
          JSON.stringify(existingLevel.object_matrix) !==
            JSON.stringify(level.objectsMatrix) ||
          JSON.stringify(existingLevel.actions) !==
            JSON.stringify(level.actions);

        if (hasChanged) {
          await pool.query(
            `UPDATE level 
             SET name = $1, description = $2, pos = $3, level_matrix = $4, object_matrix = $5, actions = $6
             WHERE level = $7`,
            [
              level.name,
              level.description,
              level.index,
              level.levelMatrix,
              level.objectsMatrix,
              level.actions,
              levelKey,
            ]
          );
          logger.info(`Updated level ${level.index}: ${level.name}`);
          updated++;
        } else {
          unchanged++;
        }
      }
    }

    logger.info(
      `Database sync complete: ${inserted} inserted, ${updated} updated, ${unchanged} unchanged.`
    );
  } catch (error) {
    logger.error("Error seeding database:", error);
    throw error;
  }
}
