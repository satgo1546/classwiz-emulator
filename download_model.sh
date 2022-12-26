set -e
cd data
mkdir $1
cd $1
curl -LO --fail "https://classpad.net/classpad/files/classwiz/$1/keylog.json"
curl -LO --fail "https://classpad.net/classpad/files/classwiz/$1/face.svg"
curl -LO --fail "https://classpad.net/classpad/files/classwiz/$1/core.dat"
curl -LO --fail "https://classpad.net/classpad/files/classwiz/$1/face.html"
curl -LO --fail "https://classpad.net/classpad/files/classwiz/$1/log.keys" || rm log.keys
