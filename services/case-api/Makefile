build-CaseApiFunction:
	python3 -m pip install --platform manylinux2014_aarch64 --implementation cp --python-version 3.12 --only-binary=:all: -r requirements.txt -t "$(ARTIFACTS_DIR)"
	cp app.py "$(ARTIFACTS_DIR)/"
	cp -R "$(dir $(abspath $(lastword $(MAKEFILE_LIST))))../risk-engine/risk_engine" "$(ARTIFACTS_DIR)/risk_engine"
	cp "$(dir $(abspath $(lastword $(MAKEFILE_LIST))))../browser-investigator/app/url_safety.py" "$(ARTIFACTS_DIR)/url_safety.py"

build-AnalysisWorkerFunction: build-CaseApiFunction
