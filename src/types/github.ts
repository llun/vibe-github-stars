import { z } from "zod";

/**
 * GitHub repository schema for validation
 */
export const GithubRepoSchema = z.object({
  id: z.number(),
  name: z.string(),
  full_name: z.string(),
  html_url: z.string().url(),
  description: z.string().nullable(),
  language: z.string().nullable(),
  topics: z.array(z.string()).optional(),
  stargazers_count: z.number().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

/**
 * Type for GitHub repository
 */
export type GithubRepo = z.infer<typeof GithubRepoSchema>;

/**
 * Categories for repositories
 */
export const CATEGORIES = {
  AI: "AI",
  PROGRAMMING: "Programming",
  DESIGN: "Design",
  GAME: "Game",
  UTILITY: "Utility Tools",
  OTHER: "Other",
} as const;

export type Category = (typeof CATEGORIES)[keyof typeof CATEGORIES];

/**
 * Categorized repository schema
 */
export const CategorizedRepoSchema = z.object({
  id: z.number(),
  name: z.string(),
  url: z.string().url(),
  description: z.string().nullable(),
  language: z.string().nullable(),
  topics: z.array(z.string()).optional(),
  category: z.enum([
    CATEGORIES.AI,
    CATEGORIES.PROGRAMMING,
    CATEGORIES.DESIGN,
    CATEGORIES.GAME,
    CATEGORIES.UTILITY,
    CATEGORIES.OTHER,
  ]),
  stargazers_count: z.number().optional(),
});

/**
 * Type for categorized repository
 */
export type CategorizedRepo = z.infer<typeof CategorizedRepoSchema>;

/**
 * Output schema for the categorized repositories
 */
export const OutputSchema = z.object({
  [CATEGORIES.AI]: z.array(CategorizedRepoSchema),
  [CATEGORIES.PROGRAMMING]: z.array(CategorizedRepoSchema),
  [CATEGORIES.DESIGN]: z.array(CategorizedRepoSchema),
  [CATEGORIES.GAME]: z.array(CategorizedRepoSchema),
  [CATEGORIES.UTILITY]: z.array(CategorizedRepoSchema),
  [CATEGORIES.OTHER]: z.array(CategorizedRepoSchema),
});

/**
 * Type for the output
 */
export type Output = z.infer<typeof OutputSchema>;
