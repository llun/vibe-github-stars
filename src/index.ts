import { createGithubService } from "./services/github-service.js";
import { categorizerService } from "./services/categorizer-service.js";
import { fileService } from "./services/file-service.js";
import { parseArgs } from "./utils/cli.js";

/**
 * Main function to run the application
 */
const main = async (): Promise<void> => {
  try {
    // Parse command-line arguments
    const args = parseArgs();
    const { username, token, output } = args;

    console.log(`Fetching starred repositories for user: ${username}`);

    // Create GitHub service
    const githubService = createGithubService(token);

    // Fetch starred repositories
    // If no token is provided, limit to 2 pages (200 repos) to avoid rate limits
    const maxPages = token ? Infinity : 2;
    if (!token) {
      console.warn(
        "No GitHub token provided. Limiting to 2 pages (200 repositories) to avoid rate limits."
      );
      console.warn(
        "For better results, please use a GitHub token with the --token parameter."
      );
    }

    const repos = await githubService.getStarredRepos(username, maxPages);
    console.log(`Found ${repos.length} starred repositories`);

    // Categorize repositories
    console.log("Categorizing repositories...");
    const categorizedRepos = repos.map(categorizerService.toCategorizedRepo);

    // Write output to file
    console.log(`Writing output to ${output}...`);
    await fileService.writeOutput(categorizedRepos, output);

    console.log("Done!");
  } catch (error) {
    console.error(
      "Error:",
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
};

// Run the application
main();
