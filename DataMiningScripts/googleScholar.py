from urllib import FancyURLopener
import sys
import time
import os

# read from a file containing the papers' titles, each on one line
input_file = sys.argv[1]
papers = ""
with open(input_file, 'r') as f:
    papers = f.readlines()

class MyOpener(FancyURLopener):
    version = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.152 Safari/537.36'

openurl = MyOpener().open
if not os.path.isdir('./output'):
    os.mkdir('./output')

for paper in papers:
    query = '+'.join(paper.split())
    if paper.endswith('\n'):
        paper = paper[:-1]
    response = openurl('http://scholar.google.com/scholar?hl=en&q='+query).read()
    with open('./output/' + paper + '.html', 'w') as f:
        f.write(response)
    time.sleep(120)
