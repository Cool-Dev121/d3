LOCALE ?= en_US

all: \
	d3.js \
	d3.min.js \
	component.json \
	package.json

test: all
	@node_modules/.bin/vows

benchmark: all
	@node test/geo/benchmark.js

.INTERMEDIATE: \
	src/core/format-localized.js \
	src/time/format-localized.js

src/core/format-localized.js: src/locale.js src/core/format-locale.js
	LC_NUMERIC=$(LOCALE) locale -ck LC_NUMERIC | node src/locale.js src/core/format-locale.js > $@

src/time/format-localized.js: src/locale.js src/time/format-locale.js
	LC_TIME=$(LOCALE) locale -ck LC_TIME | node src/locale.js src/time/format-locale.js > $@

d3%js: src/d3%js src/core/format-localized.js src/time/format-localized.js
	@rm -f $@
	node_modules/.bin/smash $< > $@.tmp
	node_modules/.bin/uglifyjs $@.tmp -b indent-level=2 -o $@
	@rm $@.tmp
	@chmod a-w $@

%.min.js: %.js
	@rm -f $@
	node_modules/.bin/uglifyjs $< -c -m -o $@

component.json: src/component.js d3.js
	@rm -f $@
	node src/component.js > $@
	@chmod a-w $@

package.json: src/package.js d3.js
	@rm -f $@
	node src/package.js > $@
	@chmod a-w $@

clean:
	rm -f d3*.js package.json component.json
