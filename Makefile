CHROME := "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
PACKED_EXTENSION := beaver-browser.crx
SOURCE = $(wildcard src/*.js) $(wildcard src/*.html) $(wildcard static/*)
DIST = dist/app.bundle.js dist/inject.bundle.js dist/index.html dist/manifest.json

.PHONY: all
all: $(PACKED_EXTENSION)

.PHONY: yarn
yarn: yarn.lock

$(PACKED_EXTENSION): $(DIST)
	@echo "===== Building Chrome extension"
	@$(CHROME) --pack-extension=./dist --pack-extension-key=./chrome-beaver.pem
	@mv dist.crx beaver-browser.crx

dist/app.bundle.js: yarn.lock $(SOURCE)
	@echo "===== Running webpack"
	@node_modules/.bin/webpack

yarn.lock: package.json
	@echo "===== Running YARN"
	@yarn && touch yarn.lock
