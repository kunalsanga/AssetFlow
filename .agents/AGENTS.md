# AssetFlow Team Git Workflow Rules

Always follow this strict Git workflow to avoid deployment and integration issues:

1. **Never code directly on `main`**: Always create a separate feature branch (`git checkout -b feature/name`).
2. **Always pull latest `main` before opening a PR**:
   - `git checkout main`
   - `git pull origin main`
   - `git checkout <your-branch>`
   - `git merge main` (or `git rebase main`)
3. **Run local verification before pushing**:
   - **Frontend**: Run `npm run build` to ensure the TypeScript compiler (`tsc`) catches all missing imports or type errors. Do not just rely on `npm run dev`.
   - **Backend**: Run `python -m pytest` or ensure `uvicorn app.main:app` starts completely error-free.
4. **Push and PR**: If everything works locally, `git push`, then open a Pull Request.
5. **Wait for CI**: Only merge the PR after GitHub Actions CI checks are completely green. If CI fails, fix it before merging.
