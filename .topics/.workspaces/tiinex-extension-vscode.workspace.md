# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.workspace.v1](https://github.com/Tiinex/docs/blob/a83baecea45c5863254397b9d84c6004b58d07ee/.topics/.schemas/tiinex.workspace.v1.schema.md)
  - Created At: 2026-09-06 11:18:00
  - Trace: [tiinex-vscode.workspace.md](tiinex-vscode.workspace.md)
  - Origin:
    - [relative](tiinex-vscode.workspace.md)
- Current
  - Current Schema: tiinex.workspace.v1
  - Created At: 2026-09-09 16:48:16
  - Authors: Anchor; Sigma
  - Why: Preserve repository-rename continuity without rewriting the predecessor VS Code Workspace provenance.
  - Summary: Current Workspace entrypoint for the renamed Tiinex/extension-vscode repository.
  - Status: ready/local

---

# Tiinex Extension VS Code

## Schema Origins

- Tiinex Docs canonical schemas
  - Kind: github-tree
  - Repository: Tiinex/docs
  - Ref: master
  - Root Path: .topics/.schemas
  - Trust Role: canonical-core

## Workspace Entrypoints

### Extension VS Code source

- Source Kind: local-directory
- Repository: Tiinex/extension-vscode
- Root Path: .
- Repo Files Discovery: on

## Workspace Boundary

- First-party VS Code extension host over public Tiinex Core/App/Interop/Runtime surfaces.
- The predecessor `Tiinex/vscode` Workspace remains historical recovery context and does not override this renamed repository identity.
- VS Code product/VSIX identity remains independent of repository naming.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [tiinex-vscode.workspace.md](tiinex-vscode.workspace.md)
  - Value: HYwp28a5V7uvtABXVdzX-sMg9EJEwBmJ21OPi2xyc3s

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: N1WNwVYjOAACH3cSihaKZpsQfXdGd5aUMTmyOiwQFVw