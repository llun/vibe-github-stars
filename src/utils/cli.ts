import { z } from "zod";

/**
 * Schema for command-line arguments
 */
const ArgsSchema = z.object({
  username: z.string({
    required_error: "GitHub username is required",
    invalid_type_error: "GitHub username must be a string",
  }),
  token: z.string().optional(),
  output: z.string().default("./output.json"),
});

export type Args = z.infer<typeof ArgsSchema>;

/**
 * Parses command-line arguments
 * @returns Parsed arguments
 */
export const parseArgs = (): Args => {
  const args: Record<string, string> = {};

  // Process command-line arguments
  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];

    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const value = process.argv[i + 1];

      if (value && !value.startsWith("--")) {
        args[key] = value;
        i++; // Skip the value in the next iteration
      } else {
        args[key] = "true"; // Flag without value
      }
    }
  }

  try {
    return ArgsSchema.parse(args);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Invalid arguments:");
      error.errors.forEach((err) => {
        console.error(`- ${err.path.join(".")}: ${err.message}`);
      });

      console.error("\nUsage:");
      console.error(
        "  node dist/index.js --username <github-username> [--token <github-token>] [--output <output-path>]"
      );
      console.error("\nOptions:");
      console.error("  --username  GitHub username (required)");
      console.error(
        "  --token     GitHub personal access token (optional, helps with rate limits)"
      );
      console.error("  --output    Output file path (default: ./output.json)");

      process.exit(1);
    }

    throw error;
  }
};
