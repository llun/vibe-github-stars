import fs from "fs/promises";
import path from "path";
import {
  CATEGORIES,
  CategorizedRepo,
  Output,
  OutputSchema,
} from "../types/github.js";

/**
 * Service for file operations
 */
export const fileService = {
  /**
   * Writes categorized repositories to a JSON file
   * @param repos - Array of categorized repositories
   * @param outputPath - Path to write the output file
   */
  writeOutput: async (
    repos: CategorizedRepo[],
    outputPath: string
  ): Promise<void> => {
    try {
      // Group repositories by category
      const output: Output = {
        [CATEGORIES.AI]: [],
        [CATEGORIES.PROGRAMMING]: [],
        [CATEGORIES.DESIGN]: [],
        [CATEGORIES.GAME]: [],
        [CATEGORIES.UTILITY]: [],
        [CATEGORIES.OTHER]: [],
      };

      // Add repositories to their respective categories
      for (const repo of repos) {
        output[repo.category].push(repo);
      }

      // Validate output
      OutputSchema.parse(output);

      // Ensure directory exists
      const dir = path.dirname(outputPath);
      await fs.mkdir(dir, { recursive: true });

      // Write to file
      await fs.writeFile(outputPath, JSON.stringify(output, null, 2), "utf-8");

      console.log(`Output written to ${outputPath}`);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to write output: ${error.message}`);
      } else {
        throw new Error(`Failed to write output: ${String(error)}`);
      }
    }
  },
};
