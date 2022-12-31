import os
import re
with open("temp") as f:
    m = f.readline()[11:]
with open("main.js", "r", encoding = "iso8859-2") as f:
    file = f.read()
mac = re.search("(// @version +)[^\n]+\n", file)
# print(mac.span())
# print(m)
with open("CHANGELOG.md", "r") as f:
    with open("rel-CHANGELOG.md", "w") as g:
        g.write(re.search("(## {})([\s\S]*?)(?=(##|$))".format(m), f.read()).group(2))
if (mac != None):
    a, b = mac.span()
with open("main.js", "w", encoding = "iso8859-2") as f:
    f.write(file[:a] + mac.group(1) + m + file[b:])