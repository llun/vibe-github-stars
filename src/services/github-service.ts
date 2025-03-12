import axios from "axios";
import { z } from "zod";
import { GithubRepo, GithubRepoSchema } from "../types/github.js";

/**
 * Sleep for a specified number of milliseconds
 * @param ms - Milliseconds to sleep
 */
const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Service for interacting with the GitHub API
 */
export const createGithubService = (token?: string) => {
  // Create axios instance with GitHub API base URL
  const api = axios.create({
    baseURL: "https://api.github.com",
    headers: {
      Accept: "application/vnd.github.v3+json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  /**
   * Fetches all starred repositories for a given username
   * @param username - GitHub username
   * @param maxPages - Maximum number of pages to fetch (default: Infinity)
   * @returns Array of GitHub repositories
   */
  const getStarredRepos = async (
    username: string,
    maxPages: number = Infinity
  ): Promise<GithubRepo[]> => {
    const allRepos: GithubRepo[] = [];
    let page = 1;
    let hasMorePages = true;
    let retryCount = 0;
    const MAX_RETRIES = 3;

    while (hasMorePages && page <= maxPages) {
      try {
        console.log(`Fetching page ${page} of starred repositories...`);

        // Add a small delay between requests to avoid hitting rate limits too quickly
        if (page > 1) {
          await sleep(1000);
        }

        const response = await api.get(`/users/${username}/starred`, {
          params: {
            per_page: 100, // Maximum allowed by GitHub API
            page,
          },
        });

        // Check rate limit information
        const rateLimit = {
          limit: Number(response.headers["x-ratelimit-limit"] || 0),
          remaining: Number(response.headers["x-ratelimit-remaining"] || 0),
          reset: Number(response.headers["x-ratelimit-reset"] || 0),
        };

        // If we're getting close to the rate limit, slow down
        if (rateLimit.remaining <= 10 && rateLimit.remaining > 0) {
          const resetDate = new Date(rateLimit.reset * 1000);
          console.warn(
            `Warning: Rate limit almost reached (${rateLimit.remaining}/${
              rateLimit.limit
            } remaining). Resets at ${resetDate.toLocaleString()}`
          );

          // Add a longer delay as we get closer to the limit
          const delayMs = Math.min(5000, (10 - rateLimit.remaining) * 1000);
          console.log(
            `Slowing down requests. Waiting ${delayMs}ms before next request...`
          );
          await sleep(delayMs);
        }

        // Validate response data
        const repos = z.array(GithubRepoSchema).parse(response.data);

        if (repos.length === 0) {
          hasMorePages = false;
          console.log("No more repositories found.");
        } else {
          allRepos.push(...repos);
          console.log(
            `Fetched page ${page} with ${repos.length} repositories. Total: ${allRepos.length}`
          );
          page++;
          retryCount = 0; // Reset retry count on success
        }

        // If we've reached the maximum number of pages, stop
        if (page > maxPages) {
          console.log(
            `Reached maximum number of pages (${maxPages}). Stopping.`
          );
          hasMorePages = false;
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 404) {
            throw new Error(`User ${username} not found`);
          } else if (error.response?.status === 403) {
            const resetTime = error.response.headers["x-ratelimit-reset"];
            const resetDate = resetTime
              ? new Date(Number(resetTime) * 1000).toLocaleString()
              : "unknown time";

            if (!token) {
              console.warn(
                `Rate limit exceeded. Limit will reset at ${resetDate}.`
              );
              console.warn(
                "Without a token, we can only fetch a limited number of repositories."
              );
              console.warn(
                "For better results, please use a GitHub token with the --token parameter."
              );

              // Return what we have so far
              hasMorePages = false;
            } else {
              // With a token, we can wait and retry
              const resetTimeMs = resetTime
                ? Number(resetTime) * 1000
                : Date.now() + 3600000;
              const waitTime = Math.max(0, resetTimeMs - Date.now());

              if (waitTime > 0 && waitTime < 3600000) {
                // Don't wait more than an hour
                console.warn(
                  `Rate limit exceeded. Waiting ${Math.ceil(
                    waitTime / 1000
                  )} seconds until reset...`
                );
                await sleep(waitTime + 1000); // Add a small buffer
                retryCount++;

                if (retryCount > MAX_RETRIES) {
                  console.error("Maximum retry count exceeded. Stopping.");
                  hasMorePages = false;
                }
              } else {
                throw new Error(
                  `Rate limit exceeded. Limit will reset at ${resetDate}.`
                );
              }
            }
          } else {
            console.error(
              `GitHub API error: ${error.message} (Status: ${
                error.response?.status || "unknown"
              })`
            );

            // Retry a few times for server errors
            if (error.response?.status && error.response.status >= 500) {
              retryCount++;
              if (retryCount <= MAX_RETRIES) {
                const delayMs = retryCount * 2000;
                console.log(
                  `Retrying in ${
                    delayMs / 1000
                  } seconds... (Attempt ${retryCount} of ${MAX_RETRIES})`
                );
                await sleep(delayMs);
              } else {
                console.error("Maximum retry count exceeded. Stopping.");
                hasMorePages = false;
              }
            } else {
              throw error;
            }
          }
        } else if (error instanceof z.ZodError) {
          throw new Error(`Data validation error: ${error.message}`);
        } else {
          throw new Error(`Unexpected error: ${String(error)}`);
        }
      }
    }

    return allRepos;
  };

  return {
    getStarredRepos,
  };
};
