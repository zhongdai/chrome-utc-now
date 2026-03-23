# Chrome UTC/Unix Clock - Development Commands

# Run all tests
test:
    npx jest --verbose

# Run a single test file (e.g., just test-file src/time.test.ts)
test-file file:
    npx jest {{file}} --verbose

# Run tests in watch mode
test-watch:
    npx jest --watch

# Lint
lint:
    npx eslint 'src/**/*.ts'

# Format
format:
    npx prettier --write 'src/**/*.ts'

# Build extension to dist/
build:
    npx webpack

# Build and package as zip
package: build
    #!/usr/bin/env bash
    set -euo pipefail
    name=$(node -p "require('./package.json').name")
    version=$(node -p "require('./package.json').version")
    cd dist && zip -r "../${name}-${version}.zip" .

# Lint + test + build (full CI check)
check: lint test build

# Open Chrome with extension loaded from dist/
install: build
    open -a "Google Chrome" "chrome://extensions"
    @echo ""
    @echo "==> Extension built to dist/"
    @echo "==> In Chrome: enable Developer Mode, click 'Load unpacked', select:"
    @echo "    $(pwd)/dist"
    @echo ""

# Bump minor version (e.g., 1.1.0 → 1.2.0)
minor:
    #!/usr/bin/env bash
    set -euo pipefail
    current=$(node -p "require('./package.json').version")
    IFS='.' read -r major minor patch <<< "$current"
    new="${major}.$((minor + 1)).0"
    npm version "$new" --no-git-tag-version
    sed -i '' "s/\"version\": \"$current\"/\"version\": \"$new\"/" src/manifest.json
    echo "Bumped version: $current → $new"

# Bump patch version (e.g., 1.1.0 → 1.1.1)
patch:
    #!/usr/bin/env bash
    set -euo pipefail
    current=$(node -p "require('./package.json').version")
    IFS='.' read -r major minor patch <<< "$current"
    new="${major}.${minor}.$((patch + 1))"
    npm version "$new" --no-git-tag-version
    sed -i '' "s/\"version\": \"$current\"/\"version\": \"$new\"/" src/manifest.json
    echo "Bumped version: $current → $new"

# Clean build artifacts
clean:
    rm -rf dist *.zip
