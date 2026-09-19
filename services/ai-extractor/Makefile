build-ExtractorFunction:
	python3 -m pip install --platform manylinux2014_aarch64 --implementation cp --python-version 3.12 --only-binary=:all: -r requirements.txt -t "$(ARTIFACTS_DIR)"
	cp extractor.py "$(ARTIFACTS_DIR)/"
