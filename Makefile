define FILTERDIFF_MANUAL
You do not have 'filterdiff' installed:\\n\
- macOS: brew install patchutils\\n\
- Linux: apt-get install patchutils
endef

bootstrap:
	@echo '*** Initializing submodules'
	@git submodule init
	@git submodule update
	@echo '*** Bootstrapping esy-install'
	@yarn
	@echo '*** Bootstrapping esy-core'
	@(cd esy && yarn)

build:
	@echo '*** Building esy-install'
	@npm run build
	@echo '*** Building esy-core'
	@(cd esy && $(MAKE) build)

clean:
	@rm -rf package esy-*.tgz
	@rm -rf opam-packages/ lib/ lib-legacy/
	@$(MAKE) -C esy clean

convert-opam-packages: check-filterdiff
	@$(MAKE) -C opam-packages-conversion/ convert || true # some conversions fail now
	@rm -rf opam-packages/
	@mv opam-packages-conversion/output opam-packages

check-filterdiff:
	@which filterdiff > /dev/null \
		|| (echo "$(FILTERDIFF_MANUAL)" && exit 1)

check-version:
ifndef VERSION
	$(error VERSION is undefined. Usage: make beta-release VERSION=0.0.1)
endif

check-origin:
ifndef ORIGIN
	$(error ORIGIN is undefined.)
endif

check-no-changes:
	@#git diff --exit-code || (echo "You have unstaged changes. Please clean up first." && exit 1)
	@#git diff --cached --exit-code || (echo "You have staged changes. Please reset them or commit them first." && exit 1)

# Beta releases to Github
beta-release: check-no-changes check-version convert-opam-packages build
	@# Program "fails" if unstaged changes.
	@echo "--------------------------------------------"
	@echo "-- Preparing beta release beta-$(VERSION) --"
	@echo "--------------------------------------------"
	@echo "1. Convert opam package meta-data to package.json"
	@echo "2. Build code"
	@echo "3. Run 'npm pack' to produce a release package"
	@echo "4. Create a new release branch & tag with commited built version"
	@echo "5. To finalize, you must follow final instructions to push that commit and tag to upstream repo."
	@echo "--------------------------------------------"
	@FILE=`npm pack` && tar xzf $$FILE
	@(cd package && $(MAKE) ORIGIN=`git remote get-url origin` __beta-release-continue)

__beta-release-continue: check-version check-origin
	@# We initialize a new repo pointing to the same origin
	@git init
	@git checkout -b branch-beta-v$(VERSION)
	@git add .
	@git remote add origin $(ORIGIN)
	@git fetch --tags --depth=1
	@git commit -m "Preparing beta release beta-v$(VERSION)"
	@# Return code is inverted to receive boolean return value
	@(git tag --delete beta-v$(VERSION) &> /dev/null) || echo "Tag beta-v$(VERSION) doesn't yet exist, creating it now."
	@git tag -a beta-v$(VERSION) -m "beta-v$(VERSION)"
	@echo "----------------------------------------------------"
	@echo "-- Almost Done. Complete the following two steps ---"
	@echo "----------------------------------------------------"
	@echo ""
	@echo "Directory package/ contains a git repository ready"
	@echo "to be pushed under a tag to remote."
	@echo ""
	@echo "1. [REQUIRED] cd package"
	@echo ""
	@echo "2. git show HEAD"
	@echo "   Make sure you approve of what will be pushed to tag beta-v$(VERSION)"
	@echo ""
	@echo "3. git push origin HEAD:branch-beta-v$(VERSION)"
	@echo "   Push a release branch if needed."
	@echo ""
	@echo "4. [REQUIRED] git push origin beta-v$(VERSION)"
	@echo "   Push a release tag."
	@echo ""
	@echo "You can test install the release by running:"
	@echo ""
	@echo "    npm install '$(ORIGIN)#beta-v$(VERSION)'"
	@echo ""
	@echo "> Note: If you are pushing an update to an existing tag, you might need to add -f to the push command."
