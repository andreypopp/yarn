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

check-filterdiff:
	@which filterdiff > /dev/null \
		|| (echo "$(FILTERDIFF_MANUAL)" && exit 1)

check-version:
ifndef VERSION
	$(error VERSION is undefined. Usage: make beta-release VERSION=0.0.1)
endif

# Beta releases to Github
beta-release: check-version build
	@# Program "fails" if unstaged changes.
	@echo "Preparing beta release beta-$(VERSION)"
	@echo "--------------------------------------"
	@echo "- Will locally commit built version of esy itself."
	@echo "- Will tag that commit as beta-$(VERSION)."
	@echo "- To finalize, you must follow final instructions to push that commit and tag to upstream repo."
	@echo "--------------------------------------"
	@git diff --exit-code || (echo "You have unstaged changes. Please clean up first." && exit 1)
	@git diff --cached --exit-code || (echo "You have staged changes. Please reset them or commit them first." && exit 1)
	@git rm ./.gitmodules
	@git add -f lib/*
	@git add -f lib-legacy/*
	@git commit -m "Preparing beta release beta-v$(VERSION)"
	@# Return code is inverted to receive boolean return value
	@(git tag --delete beta-v$(VERSION) &> /dev/null)|| echo "Tag beta-v$(VERSION) doesn't yet exist, creating it now."
	@git tag -a beta-v$(VERSION) -m "beta-v$(VERSION)"
	@echo "----------------------------------------------------"
	@echo '!!!Almost Done. Complete the following two steps!!!'
	@echo "----------------------------------------------------"
	@echo '1. git show HEAD'
	@echo "  - Make sure you approve of what will be pushed to tag beta-v$(VERSION)"
	@echo "2. Push to a new branch (if you like):"
	@echo "     git push origin HEAD:branch-beta-v$(VERSION)"
	@echo "3. Push the individual tag (mandatory):"
	@echo "     git push origin beta-v$(VERSION)"
	@echo "4. Switch back to another branch (git checkout -b ANOTHERBRANCH origin/master)"
	@echo ""
	@echo "> Note: If you are pushing an update to an existing tag, you might need to add -f to the push command."
