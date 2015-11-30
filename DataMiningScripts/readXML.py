import os
import sys
import xml.etree.ElementTree as etree
import json
from json import JSONEncoder
import codecs
import collections
import unicodedata
from collections import Counter

class Paper(JSONEncoder):
    def __init__(self):
        self.id = 0
        self.title = ""
        self.authors = []
        self.year = 0
        self.references = []
        self.cited_by = []
        self.keywords = []

class PaperAbstract(JSONEncoder):
    def __init__(self):
        self.id = 0
        self.title = ""
        self.abstract = ""

all_papers = {}
all_papers_abstract = {}
keyword_occurences = collections.defaultdict(int)

# remove all non-alphanumeric characters in the title, and turn all characters into lowercase
def normalize_title(input):
    output = "".join([c.lower() if c.isalnum() else " " for c in input])
    output = ' '.join(output.split())
    return output

# read the xml files and store a dictionary of papers in memory
work_dir = sys.argv[1]
paper_id = 0
print ('Reading XML files')
for dir in next(os.walk(work_dir))[1]:
    print ('------------' + dir + ' -----------')
    for file in next(os.walk(work_dir + '/' + dir))[2]:
        try:
            if file[-4:] == '.xml':
                tree = etree.parse(work_dir + '/' + dir + '/' + file)
                root = tree.getroot()
                article = root[0]
                paper = Paper()
                paper.id = paper_id
                paper_id += 1
                paper.title = article.find('title').text
                paper.authors = [x.text for x in article.findall('author')]
                paper.year = article.find('year').text
                paper.link = article.find('ee').text
                all_papers[normalize_title(paper.title)] = paper
                # deal with the abstract
                paper_abs = PaperAbstract()
                paper_abs.id = paper.id
                paper_abs.title = paper.title
                all_papers_abstract[normalize_title(paper.title)] = paper_abs
        except Exception as e:
            print ('Exception in file ' + file)
            print (e)

paper_in_siggraph = {}

# we need to replace all the weird characters by space ' ', then trim the spaces, then make every
# character lowercase
print ('Reading TXT files')
for dir in next(os.walk(work_dir))[1]:
    print ('------------' + dir + ' -----------')
    for file in next(os.walk(work_dir + '/' + dir))[2]:
        if file[-10:] == 'header.txt':
            found_paper = None
            with open(work_dir + '/' + dir + '/' + file, 'r') as f:
                try:
                    tree = etree.parse(work_dir + '/' + dir + '/' + file)
                    root = tree.getroot()
                    title = root[0][0].find('title')
                    if title is None:
                        print ('File ' + file + ' has no title')
                        continue
                    found_paper = all_papers.get(normalize_title(title.text))
                    if found_paper is None:
                        print(file)
                        print('Cannot find ' + title.text.encode('utf-8') + ' in the database')
                        continue
                    else:
                        paper_in_siggraph[normalize_title(title.text)] = 1
                    # deal with the paper abstract
                    abstract = ""
                    begin_abstract = False
                    for line in open(work_dir + '/' + dir + '/' + file[:-14] + 'pdf.txt', 'r'):
                        line = line.rstrip('\n')
                        stop = ['CR Categories', 'CR CATEGORIES', 'Categories', 'CATEGORIES', 'Keywords', 'KEYWORDS', '1 Introduction', '1 INTRODUCTION', '1. Introduction', '1. INTRODUCTION']
                        if not begin_abstract and (line.startswith('Abstract') or line.startswith('ABSTRACT')):
                            begin_abstract = True
                        else:
                            should_stop = False
                            for s in stop:
                                if line.startswith(s):
                                    should_stop = True
                                    break
                            if should_stop:
                                break
                        if begin_abstract:
                            abstract += line + ' '
                    if len(abstract) < 20: # if cannot find the abstract from the paper, try the header
                        abstract_node = root[0][0].find('abstract')
                        if abstract_node is not None:
                            abstract = abstract_node.text.encode('iso-8859-1', 'ignore')
                    stop = ['CR Categories', 'CR CATEGORIES', 'Categories', 'CATEGORIES', 'Keywords', 'KEYWORDS', '1 Introduction', '1 INTRODUCTION', '1. Introduction', '1. INTRODUCTION']
                    for x in stop:
                        find = abstract.find(x)
                        if find != -1:
                            abstract = abstract[:find]
                    if abstract.startswith('Abstract') or abstract.startswith('ABSTRACT'):
                        abstract = abstract[9:]
                    all_papers_abstract[normalize_title(title.text)].abstract = abstract.decode("utf8", "ignore")
                except Exception as e:
                    print ('Exception in file ' + file)
                    print (e)
                    continue

            with open(work_dir + '/' + dir + '/' + file[:-10] + 'references.txt', 'r') as f:
                contents = f.readlines()
                # find the current paper in the dictionary
                for i in range(0, len(contents), 2):
                    ref_title = contents[i]
                    ref_year = contents[i + 1]
                    found_ref = all_papers.get(normalize_title(ref_title))
                    if found_ref is not None:
                        found_paper.references += [found_ref.id]
                        found_ref.cited_by += [found_paper.id]

            keywords_array = []
            try:
                # get the keywords from the keyword files
                keyword_file = work_dir + '/' + dir + '/' + file[:-14] + 'pdf-keywords.txt'
                with open(keyword_file, 'r') as f:
                    content = f.read()
                    parsed_keyword_file = json.loads(content)
                keywords_array = parsed_keyword_file['keywords']
            except Exception as e:
                print('Error in ' + keyword_file)
                print e

            # get the keywords from the paper itself
            keywords_from_paper = []
            for line in open(work_dir + '/' + dir + '/' + file[:-14] + 'pdf.txt', 'r'):
                line = line.rstrip('\n')
                if line.startswith('Keywords:') or line.startswith('KEYWORDS:'):
                    keywords_from_paper = line[9:].split(',')
                    break

            keywords_from_paper = "".join([c.lower() if c.isalnum() else " " for c in keywords_from_paper])
            keywords_from_paper = keywords_from_paper.split()

            # normalize the keywords
            keywords_set = set()
            for kw in keywords_array:
                if float(kw['relevance']) >= 0.7: # skip keywords whose relevance is low
                    temp = "".join([c.lower() if c.isalnum() else " " for c in kw['text']])
                    temp = temp.split()
                    for k in temp:
                        keywords_set.add(k)
                for k in keywords_from_paper:
                    keywords_set.add(k)
            for k in keywords_set:
                found_paper.keywords.append(k)
                keyword_occurences[k] += 1

#print(keyword_occurences)
#print(keyword_occurences_non_unique)

class PaperDictionary(dict):
    def __init__(self,*arg,**kw):
        super(PaperDictionary, self).__init__(*arg, **kw)

    def to_JSON(self):
        return json.dumps(self, default=lambda o: o.__dict__, sort_keys=True, indent=4)

# read the banned keywords file
banned_keywords = set()
with open(work_dir + '/' + 'banned_keywords.txt') as f:
    for word in f.read().split():
        banned_keywords.add(word)

import operator
sorted_keywords = sorted(keyword_occurences.items(), key=operator.itemgetter(1))
with codecs.open(work_dir + '/keywords.txt', 'w', 'utf-8-sig') as f:
    for t in sorted_keywords:
        if t[0] not in banned_keywords and t[1] > 4:
                f.write('' + t[0] + ' ' + str(t[1]) + '\n')

keyword_map = collections.defaultdict(list) # map from a keyword to a list of related-keywords
keyword_paper_map = collections.defaultdict(list)

# remove all papers that are not in siggraph
all_papers_in_siggraph = PaperDictionary()
all_papers_in_siggraph_abstract = []
for k, p in all_papers.iteritems():
    in_siggraph = paper_in_siggraph.get(normalize_title(p.title))
    paper_abs = all_papers_abstract[normalize_title(p.title)]
    if in_siggraph is not None:
        if p.title.endswith('.'): # remove the dot (.) at the end of paper's title
            p.title = p.title[:-1]
        all_papers_in_siggraph.setdefault(p.year, []).append(p)
        # filter all keywords that does not appear at least twice
        p.keywords = filter(lambda x: keyword_occurences[x] > 4 and x not in banned_keywords, p.keywords)
        # populate keyword-keyword map and keyword-paper map
        for k1 in p.keywords:
            for k2 in p.keywords:
                if k2 != k1:
                    keyword_map[k1].append(k2)
            keyword_paper_map[k1].append(p.id)
    else:
        paper_abs.abstract=""
    all_papers_in_siggraph_abstract.append(paper_abs)
all_papers_in_siggraph_abstract.sort(key=lambda x: x.id)

keyword_occurences = filter(lambda x: keyword_occurences[x] > 4 and x not in banned_keywords, keyword_occurences)
keyword_id = {} # map a keyword to its id
kid = 0
for k in keyword_occurences:
    keyword_id[k] = kid
    kid += 1

# a Vertex is a keyword
class Vertex:
    def __init__(self):
        self.id = 0
        self.text = ""
        self.papers = []

# an Edge connects two keywords
class Neighbors:
    def __init__(self):
        self.neighbors = [] # each keyword stores a list of neighbors

# keyword graph
class Graph(JSONEncoder):
    def __init__(self):
        self.vertices = []
        self.edges = []

# build the keyword graph
keyword_graph = Graph()
for k, i in keyword_id.iteritems():
    v = Vertex()
    v.id = i
    v.text = k
    v.papers = keyword_paper_map[k]
    keyword_graph.vertices.append(v)

for (k, l) in keyword_map.iteritems():
    e = Neighbors()
    c = Counter(l)
    for (x, n) in c.iteritems():
        if n > 1:
            e.neighbors.append(keyword_id[x])
    keyword_graph.edges.append(e)

keyword_graph.vertices.sort(key=lambda x: x.text)

with open(work_dir + '/' + 'keyword_graph.json', 'w') as f:
    json.dump(keyword_graph, f, default=lambda o: o.__dict__, sort_keys=True, indent=4)

with open(work_dir + '/' + 'all_papers.json', 'w') as f:
    f.write(all_papers_in_siggraph.to_JSON())

with codecs.open(work_dir + '/' + 'all_papers_abs.json', 'w', 'utf-8-sig') as f:
    json.dump(all_papers_in_siggraph_abstract, f, default=lambda o: o.__dict__, indent=4)

# write a text file containing all the papers' titles
with codecs.open(work_dir + '/' + 'paper_titles.txt', 'w', 'utf-8-sig') as f:
    for k, l in all_papers_in_siggraph.iteritems():
        for p in l:
            f.write(p.title + '\n')

