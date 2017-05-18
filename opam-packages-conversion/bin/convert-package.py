import sys
import json
import lib

name, version, path = sys.argv[1:]
pkg = lib.generate_package_json(name, version, path)
print json.dumps(pkg)
