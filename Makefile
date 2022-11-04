export REPOSITORY=flyteconsole
include boilerplate/flyte/docker_build/Makefile

.PHONY: update_boilerplate
update_boilerplate:
	@curl https://raw.githubusercontent.com/flyteorg/boilerplate/master/boilerplate/update.sh -o boilerplate/update.sh
	@boilerplate/update.sh

.PHONY: install
install: #installs dependencies
	yarn

.PHONY: lint
lint: #lints the package for common code smells
	yarn run lint

.PHONY: build_prod
build_prod:
	make clean
	yarn workspace @flyteconsole/locale install
	yarn workspace @flyteconsole/locale build
	yarn workspace @flyteconsole/ui-atoms install
	yarn workspace @flyteconsole/ui-atoms build
	yarn workspace @flyteconsole/flyte-api install
	yarn workspace @flyteconsole/flyte-api build
	yarn workspace @flyteconsole/components install
	yarn workspace @flyteconsole/components build
	yarn workspace @flyteconsole/console build
	BASE_URL=/console yarn run build:prod

.PHONY: clean
clean:
	yarn workspace @flyteconsole/locale clean
	yarn workspace @flyteconsole/ui-atoms clean
	yarn workspace @flyteconsole/components clean
	yarn workspace @flyteconsole/flyte-api clean
	yarn workspace @flyteconsole/console clean
	yarn workspace @flyteconsole/client-app clean

.PHONY: clean_all
clean_all:
	yarn workspace @flyteconsole/locale clean:all
	yarn workspace @flyteconsole/ui-atoms clean:all
	yarn workspace @flyteconsole/components clean:all
	yarn workspace @flyteconsole/flyte-api clean:all
	yarn workspace @flyteconsole/console clean:all
	yarn workspace @flyteconsole/client-app clean:all
	rm -rf node_modules

# test_unit runs all unit tests
.PHONY: test_unit
test_unit:
	yarn test

# server starts the service in development mode
.PHONY: server
server:
	yarn start

# test_unit_codecov runs unit tests with code coverage turned on and
# submits the coverage to codecov.io
.PHONY: test_unit_codecov
test_unit_codecov:
	yarn run test-coverage

.PHONY: generate_ssl
generate_ssl:
	./script/generate_ssl.sh

PLACEHOLDER_NPM := \"version\": \"0.0.0-develop\"

.PHONY: update_npmversion
update_npmversion:
	grep "$(PLACEHOLDER_NPM)" "packages/zapp/console/package.json"
	sed -i "s/$(PLACEHOLDER_NPM)/\"version\":  \"${VERSION}\"/g" "packages/zapp/console/package.json"