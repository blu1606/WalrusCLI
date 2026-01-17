# Desktop UI Implementation Branch

**Branch:** `feature/desktop-ui`  
**Focus:** Tauri desktop application for domain management  
**Owner:** Developer 2

## Scope of Work

### Phase 1: Tauri Setup & Domain UI (Week 4-5)

**Files to work on:**
```
apps/desktop/
├── src/
│   ├── components/
│   │   ├── DomainSearch.tsx      # Search SuiNS domains
│   │   ├── DomainCard.tsx        # Display domain info
│   │   ├── LinkDialog.tsx        # Link domain to site
│   │   └── DomainList.tsx        # List owned domains
│   ├── pages/
│   │   └── DomainManager.tsx     # Main page
│   ├── lib/
│   │   ├── api.ts                # API client
│   │   └── types.ts              # TypeScript types
│   ├── App.tsx
│   └── main.tsx
├── src-tauri/
│   ├── src/
│   │   ├── commands/
│   │   │   ├── domain.rs         # Domain search/buy/link
│   │   │   └── wallet.rs         # Wallet operations
│   │   └── main.rs
│   ├── Cargo.toml
│   └── tauri.conf.json
├── package.json
└── tsconfig.json
```

### Tasks Breakdown

#### 1. Tauri Project Setup (Day 1-2)
- [ ] Initialize Tauri project structure
- [ ] Configure `tauri.conf.json`
- [ ] Setup React + TypeScript + Vite
- [ ] Install UI dependencies: `shadcn/ui`, `tailwindcss`
- [ ] Configure Rust backend

#### 2. Rust Backend Commands (Day 3-4)
**Rust Dependencies:**
- `tauri` - Desktop app framework
- `serde` - JSON serialization
- `reqwest` - HTTP client for Sui RPC
- `tokio` - Async runtime

**Commands to implement:**
```rust
// src-tauri/src/commands/domain.rs
#[tauri::command]
async fn search_domain(name: String) -> Result<Vec<Domain>, String>

#[tauri::command]
async fn buy_domain(domain: String, years: u8) -> Result<TxResult, String>

#[tauri::command]
async fn link_domain_to_site(domain: String, site_id: String) -> Result<TxResult, String>

#[tauri::command]
async fn list_owned_domains() -> Result<Vec<Domain>, String>
```

#### 3. React UI Components (Day 5-7)
**Components to build:**

**DomainSearch.tsx:**
- Search input with autocomplete
- Real-time availability check
- Display price and status
- Buy button with wallet integration

**DomainCard.tsx:**
- Domain name display
- Status badge (Available/Taken/Owned)
- Price display
- Action buttons (Buy/Link/Renew)

**LinkDialog.tsx:**
- Site selector
- Transaction preview
- Confirmation workflow
- Success/error feedback

**DomainList.tsx:**
- Table view of owned domains
- Expiry dates
- Linked sites
- Quick actions

#### 4. Wallet Integration (Day 8-9)
**Reference:** `ccs/src/auth/`
- [ ] Connect to CLI keystore at `~/.walrus/keystore.json`
- [ ] Decrypt wallet with password prompt
- [ ] Sign transactions via IPC
- [ ] Display wallet balance

#### 5. Styling & UX (Day 10)
**Design Reference:** `docs/wireframes/`
- [ ] Apply Tailwind CSS styling
- [ ] Implement shadcn/ui components
- [ ] Add loading states
- [ ] Add error handling UI
- [ ] Responsive layout

## Development Guidelines

### CCS Reference Files to Study
```
ccs/ui/src/                             # React component patterns
ccs/ui/src/components/                  # Reusable components
ccs/src/web-server/index.ts            # Server patterns (for IPC)
ccs/src/web-server/routes/              # API endpoint patterns
```

### Code Standards
- Follow `AGENTS.md` for React/TypeScript guidelines
- Use shadcn/ui components (consistent with CCS dashboard)
- Tailwind CSS for styling
- TypeScript strict mode
- Conventional commits: `feat(desktop):`, `fix(desktop):`

### UI/UX Principles
**From CCS Dashboard:**
- Clean, minimal interface
- Clear action buttons
- Loading states for async operations
- Error messages with recovery suggestions
- Responsive design

### Tech Stack
```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "@tauri-apps/api": "^2.x",
    "tailwindcss": "^3.x",
    "@tanstack/react-query": "^5.x",
    "zustand": "^4.x"
  }
}
```

### Tauri Configuration
```json
// src-tauri/tauri.conf.json
{
  "tauri": {
    "allowlist": {
      "all": false,
      "fs": {
        "readFile": true,
        "scope": ["$HOME/.walrus/*"]
      }
    },
    "windows": [
      {
        "title": "WalrusCLI - Domain Manager",
        "width": 800,
        "height": 600
      }
    ]
  }
}
```

## Integration Points with CLI

**Shared Resources:**
- Keystore: `~/.walrus/keystore.json` (read by Desktop)
- Config: `~/.walrus/config.json` (read by Desktop)
- Site list: `~/.walrus/sites.json` (populated by CLI)

**Data Flow:**
```
CLI creates/updates → ~/.walrus/* → Desktop reads/displays
Desktop manages domains → Updates config → CLI uses for deploy
```

**Shared Package:** `packages/core/`
- Import wallet encryption logic
- Import config types
- Import Sui client utilities

## Testing Strategy

### Manual Testing
```bash
# Development mode
cd apps/desktop
pnpm tauri dev

# Build and test
pnpm tauri build
```

### Test Cases
- [ ] Search available domain
- [ ] Display taken domain
- [ ] Buy domain flow (with test wallet)
- [ ] Link domain to existing site
- [ ] List owned domains
- [ ] Renew expiring domain
- [ ] Error handling (no wallet, insufficient funds)

## Branch Rules

1. **Only modify:**
   - `apps/desktop/**`
   - `docs/wireframes/` (if improving)
   - `packages/core/**` (coordinate with CLI team)

2. **DO NOT modify:**
   - `apps/cli/**` (CLI team's scope)
   - Root config files without coordination

3. **Commit format:**
   ```bash
   git commit -m "feat(desktop): add domain search component"
   git commit -m "feat(desktop): implement wallet signing via IPC"
   ```

4. **Before merging to main:**
   - Run `pnpm validate`
   - Test on Windows/macOS/Linux
   - Create PR for review

## Getting Started

```bash
# Checkout this branch
git checkout feature/desktop-ui

# Install dependencies
pnpm install

# Install Tauri CLI
cargo install tauri-cli

# Start development
cd apps/desktop
pnpm tauri dev
```

## Tauri Development

### Prerequisites
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install system dependencies (Ubuntu/Debian)
sudo apt install libwebkit2gtk-4.0-dev \
  build-essential \
  curl \
  wget \
  file \
  libssl-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

### Common Commands
```bash
# Dev mode with hot reload
pnpm tauri dev

# Build production binary
pnpm tauri build

# Check Rust code
cargo check

# Run Rust tests
cargo test
```

## Progress Tracking

Track your progress in: `plans/desktop-progress.md`

Update daily:
- Completed components
- UI screenshots
- Blockers
- Questions for team sync

## Design Reference

- **Wireframes:** `docs/wireframes/search.html`, `docs/wireframes/list.html`
- **CCS Dashboard:** `ccs/ui/src/` for component patterns
- **Design Guidelines:** `docs/design-guidelines.md`

## Questions?

- **Tauri docs:** https://tauri.app/v2/guide/
- **React patterns:** See `ccs/ui/src/`
- **Requirements:** See `docs/requirements/PRD.md` (Section 3.5)
- **Sync with CLI team:** Daily standup or async updates
