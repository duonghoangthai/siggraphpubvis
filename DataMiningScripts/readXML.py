import os
import sys
import xml.etree.ElementTree as etree
import json
from json import JSONEncoder
import codecs

class Paper(JSONEncoder):
    def __init__(self):
        self.id = 0
        self.title = ""
        self.authors = []
        self.year = 0
        self.references = []
        self.cited_by = []
        self.keywords = []

all_papers = {}
all_keywords = {}

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
        except Exception as e:
            print ('Exception in file ' + file)
            print (e)

paper_in_siggraph = {}
all_keywords_non_unique = 0

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
            keywords_dict = {}
            for kw in keywords_array:
                if float(kw['relevance']) >= 0.7: # skip keywords whose relevance is low
                    temp = "".join([c.lower() if c.isalnum() else " " for c in kw['text']])
                    temp = temp.split()
                    for k in temp:
                        keywords_dict[k] = True
                for k in keywords_from_paper:
                    keywords_dict[k] = True
            for k, _ in keywords_dict.iteritems():
                found_paper.keywords += [k]
                if k not in all_keywords:
                    all_keywords[k] = 1
                else:
                    all_keywords[k] += 1
            all_keywords_non_unique += len(found_paper.keywords)

#print(all_keywords)
#print(all_keywords_non_unique)
import operator
sorted_keywords = sorted(all_keywords.items(), key=operator.itemgetter(1))
with codecs.open(work_dir + '/keywords.txt', 'w', 'utf-8-sig') as f:
    for t in sorted_keywords:
        if (t[1] > 1):
            f.write('' + t[0] + ' ' + str(t[1]) + '\n')

class PaperDictionary(dict):
    def __init__(self,*arg,**kw):
        super(PaperDictionary, self).__init__(*arg, **kw)

    def to_JSON(self):
        return json.dumps(self, default=lambda o: o.__dict__, sort_keys=True, indent=4)

# remove all papers that are not in siggraph
all_papers_in_siggraph = PaperDictionary()
for k, p in all_papers.iteritems():
    in_siggraph = paper_in_siggraph.get(normalize_title(p.title))
    if in_siggraph is not None:
        if p.title.endswith('.'):
            p.title = p.title[:-1]
        try:
            all_papers_in_siggraph[p.year] += [p]
        except:
            all_papers_in_siggraph[p.year] = [p]
        # filter all keywords that does not appear at least twice
        p.keywords = filter(lambda x: all_keywords[x] > 1, p.keywords)

with open(work_dir + '/' + 'all_papers.json', 'w') as f:
    f.write(all_papers_in_siggraph.to_JSON())

# write a text file containing all the papers' titles
with codecs.open(work_dir + '/' + 'paper_titles.txt', 'w', 'utf-8-sig') as f:
    for k, l in all_papers_in_siggraph.iteritems():
        for p in l:
            f.write(p.title + '\n')

