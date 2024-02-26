PACKAGES = packages

.PHONY: install
install: #installs dependencies
	yarn

.PHONY: lint
lint: #lints the package for common code smells
	yarn run lint

##########################################################################
################################ CLEAN ###################################
##########################################################################
.PHONY: clean_all
clean_all:
	git clean -fxd --exclude scripts

.PHONY: test_unit
test_unit:
	NODE_ENV=test yarn run jest --detectOpenHandles --no-cache

# server starts the service in development mode
.PHONY: server
server:
	yarn start

# test_unit_codecov runs unit tests with code coverage turned on and
# submits the coverage to codecov.io
.PHONY: test_unit_codecov
test_unit_codecov:
	NODE_ENV=test yarn run jest --coverage --detectOpenHandles --no-cache

.PHONY: generate_ssl
generate_ssl:
	./scripts/generate_ssl.sh

PLACEHOLDER_NPM := \"version\": \"0.0.0-develop\"

.PHONY: update_npmversion
update_npmversion:
	grep "$(PLACEHOLDER_NPM)" "website/console/package.json"
	sed -i "s/$(PLACEHOLDER_NPM)/\"version\":	\"${VERSION}\"/g" "website/console/package.json"
