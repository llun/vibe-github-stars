# Vibe GitHub Stars

A Node.js application that fetches starred repositories from a GitHub account and categorizes them into predefined categories.

## Categories

The application categorizes repositories into the following categories:

1. **AI**: Artificial Intelligence, Machine Learning, NLP, etc.
2. **Programming**: Programming languages, frameworks, libraries, etc.
3. **Design**: UI/UX, graphic design, CSS, etc.
4. **Game**: Game development, engines, gaming-related repositories
5. **Utility Tools**: CLI tools, automation, productivity tools, etc.
6. **Other**: Repositories that don't fit into any of the above categories

## Installation

```bash
# Clone the repository
git clone https://github.com/llun/vibe-github-stars.git
cd vibe-github-stars

# Install dependencies
npm install

# Build the application
npm run build
```

## Usage

```bash
# Basic usage
npm start -- --username <github-username>

# With GitHub token (recommended for accounts with many stars)
npm start -- --username <github-username> --token <github-token>

# Specify custom output file
npm start -- --username <github-username> --output ./my-stars.json
```

### Command-line Arguments

- `--username`: GitHub username (required)
- `--token`: GitHub personal access token (optional, helps with rate limits)
- `--output`: Output file path (default: ./output.json)

## Output Format

The application generates a JSON file with the following structure:

```json
{
  "AI": [
    {
      "id": 123456789,
      "name": "repo-name",
      "url": "https://github.com/username/repo-name",
      "description": "Repository description",
      "language": "Python",
      "topics": ["machine-learning", "ai"],
      "category": "AI",
      "stargazers_count": 1000
    }
  ],
  "Programming": [...],
  "Design": [...],
  "Game": [...],
  "Utility Tools": [...],
  "Other": [...]
}
```

## Development

```bash
# Run in development mode
npm run dev -- --username <github-username>
```

## License

MIT
