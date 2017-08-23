CHROME := "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
PACKED_EXTENSION := beaver-browser.crx
SOURCE = $(wildcard src/*.js) $(wildcard src/*.html) $(wildcard static/*)
DIST = dist/app.bundle.js dist/inject.bundle.js dist/index.html dist/host.json dist/manifest.json dist/package.json

.PHONY: all
all: $(PACKED_EXTENSION)

$(PACKED_EXTENSION): $(DIST)
	$(CHROME) --pack-extension=./dist --pack-extension-key=./chrome-beaver.pem
	mv dist.crx beaver-browser.crx

dist/app.bundle.js: yarn.lock $(SOURCE)
	@echo "Running webpack"
	@node_modules/.bin/webpack

yarn.lock: package.json
	@echo "Running YARN"
	@yarn
