from urllib import FancyURLopener
import sys
import time
import os

def normalize_title(input):
    output = "".join([c if c.isalnum() else " " for c in input])
    output = ' '.join(output.split())
    return output

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
    if (not os.path.exists('./output/' + paper + '.html')) and (not os.path.exists('./output/' + normalize_title(paper) + '.html')):
        response = openurl('http://scholar.google.com/scholar?hl=en&q='+query).read()
        file_name = normalize_title(paper) + '.html'
        print (file_name)
        with open('./output/' + file_name, 'w') as f:
            f.write(response)
        time.sleep(120)
    else:
        print ('./output/' + paper + '.html already exists. Skipping...')
