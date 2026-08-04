# ⚙️ Jobs View - Project Standards & Coding Guidelines

This document outlines the coding standards, naming conventions, directory structures, and Git workflows to be followed by all developers on the Jobs View codebase.

---

## 1. Coding Standards

### 1.1 TypeScript & React Standards
- **Strict Mode:** Always enabled (`"strict": true` in `tsconfig.json`).
- **Types vs. Interfaces:** Use `interface` for object shapes and component props (allows declaration merging) and `type` for unions or intersections.
- **No `any`:** Explicitly declare types; do not use `any`. Use `unknown` if the type is truly dynamic.
- **Component Pattern:** Use functional components with explicit return types:
  ```tsx
  interface ButtonProps {
    label: string;
  }
  
  export const PrimaryButton = ({ label }: ButtonProps): React.ReactElement => {
    return <button>{label}</button>;
  };
  ```

### 1.2 Go (Golang) Standards
- **Formatting:** Code must be formatted using `gofmt` and imports grouped using `goimports`.
- **Error Handling:** Errors must be handled explicitly. Never swallow errors.
  ```go
  user, err := repo.GetUserByID(id)
  if err != nil {
      return nil, fmt.Errorf("getting user by id %s: %w", id, err)
  }
  ```
- **Concurrency:** Goroutines must be managed carefully with `context.Context` for cancellation and timeouts.

---

## 2. Naming Conventions

- **React Components:** **PascalCase** (e.g., `JobCard.tsx`, `DashboardLayout.tsx`).
- **Variables & Functions:** **camelCase** (e.g., `isLoading`, `fetchJobs()`).
- **Folders & Route Directories:** **kebab-case** (e.g., `saved-jobs`, `company-profile`).
- **Constants & Env Variables:** **UPPER_SNAKE_CASE** (e.g., `MAX_RETRY_ATTEMPTS`, `DATABASE_URL`).
- **Go Packages:** **lowercase, single-word** (e.g., `server`, `handler`, `repository`).

---

## 3. Git Workflow & Conventional Commits

We follow a structured branching model to maintain main branch stability.

### 3.1 Branching Strategy
- `main`: Holds the production-ready code. Only merged from `release/*` or via hotfix branches.
- `develop`: The main integration branch. All feature branches are merged here.
- `feature/*`: For new features (e.g., `feature/resume-upload`). Branched from `develop`.
- `bugfix/*`: For fixing bugs in `develop` (e.g., `bugfix/login-error`).
- `hotfix/*`: For urgent production bug fixes. Branched from `main` and merged to both `main` and `develop`.

### 3.2 Commit Message Format
We use the **Conventional Commits** specification: `<type>(<scope>): <description>`

- **`feat`:** A new feature (e.g., `feat(auth): add google oauth login`).
- **`fix`:** A bug fix (e.g., `fix(ats): resolve drag-and-drop state lag`).
- **`docs`:** Documentation changes (e.g., `docs(seo): add sitemap specs`).
- **`style`:** Changes that do not affect the meaning of the code (formatting, missing semi-colons).
- **`refactor`:** Code changes that neither fix a bug nor add a feature.
- **`test`:** Adding missing tests or correcting existing tests.
- **`chore`:** Updating build tasks, package manager configs (e.g., `chore: bump lodash`).
