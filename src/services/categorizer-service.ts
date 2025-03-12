import {
  CATEGORIES,
  CategorizedRepo,
  Category,
  GithubRepo,
} from "../types/github.js";

// Keywords for categorization
const CATEGORY_KEYWORDS = {
  [CATEGORIES.AI]: [
    "ai",
    "artificial-intelligence",
    "machine-learning",
    "ml",
    "deep-learning",
    "neural-network",
    "nlp",
    "natural-language-processing",
    "gpt",
    "llm",
    "large-language-model",
    "openai",
    "tensorflow",
    "pytorch",
    "huggingface",
    "transformers",
    "bert",
    "chatbot",
    "computer-vision",
    "cv",
  ],
  [CATEGORIES.PROGRAMMING]: [
    "programming",
    "language",
    "compiler",
    "interpreter",
    "framework",
    "library",
    "sdk",
    "api",
    "backend",
    "frontend",
    "fullstack",
    "web-development",
    "mobile-development",
    "development",
    "coding",
    "algorithm",
    "data-structure",
    "database",
    "sql",
    "nosql",
    "javascript",
    "typescript",
    "python",
    "java",
    "rust",
    "go",
    "c++",
    "c#",
    "php",
    "ruby",
  ],
  [CATEGORIES.DESIGN]: [
    "design",
    "ui",
    "ux",
    "user-interface",
    "user-experience",
    "graphic",
    "css",
    "animation",
    "illustration",
    "figma",
    "sketch",
    "adobe",
    "photoshop",
    "illustrator",
    "typography",
    "color",
    "layout",
    "responsive",
    "web-design",
    "mobile-design",
  ],
  [CATEGORIES.GAME]: [
    "game",
    "gaming",
    "gamedev",
    "game-development",
    "unity",
    "unreal",
    "godot",
    "engine",
    "game-engine",
    "3d",
    "2d",
    "arcade",
    "rpg",
    "fps",
    "mmorpg",
    "puzzle",
    "strategy",
    "simulation",
    "vr",
    "ar",
    "virtual-reality",
    "augmented-reality",
  ],
  [CATEGORIES.UTILITY]: [
    "utility",
    "tool",
    "cli",
    "command-line",
    "automation",
    "productivity",
    "workflow",
    "devops",
    "ci-cd",
    "continuous-integration",
    "deployment",
    "monitoring",
    "logging",
    "testing",
    "security",
    "backup",
    "converter",
    "formatter",
    "linter",
    "analyzer",
  ],
};

/**
 * Categorizes a GitHub repository based on its properties
 * @param repo - GitHub repository
 * @returns Category for the repository
 */
const categorizeRepo = (repo: GithubRepo): Category => {
  const description = repo.description?.toLowerCase() || "";
  const language = repo.language?.toLowerCase() || "";
  const name = repo.name.toLowerCase();
  const topics = repo.topics?.map((topic) => topic.toLowerCase()) || [];

  // Combine all text fields for keyword matching
  const allText = `${description} ${language} ${name} ${topics.join(" ")}`;

  // Check each category's keywords
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (
        allText.includes(keyword) ||
        topics.includes(keyword) ||
        (keyword.includes("-") &&
          topics.some((t) => t === keyword.replace(/-/g, "")))
      ) {
        return category as Category;
      }
    }
  }

  // Default to OTHER if no match found
  return CATEGORIES.OTHER;
};

/**
 * Converts a GitHub repository to a categorized repository
 * @param repo - GitHub repository
 * @returns Categorized repository
 */
const toCategorizedRepo = (repo: GithubRepo): CategorizedRepo => {
  const category = categorizeRepo(repo);

  return {
    id: repo.id,
    name: repo.name,
    url: repo.html_url,
    description: repo.description,
    language: repo.language,
    topics: repo.topics || [],
    category,
    stargazers_count: repo.stargazers_count,
  };
};

export const categorizerService = {
  categorizeRepo,
  toCategorizedRepo,
};
