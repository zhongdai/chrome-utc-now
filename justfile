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
    cd dist && zip -r ../extension.zip .

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

# Clean build artifacts
clean:
    rm -rf dist extension.zip
