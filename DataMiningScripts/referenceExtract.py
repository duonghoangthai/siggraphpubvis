# Extract the title and references of papers stored in .txt format
#
# How to use
# Argument: a directory containing the paper's text files

import errno
import os
import sys

def referenceParse( line ):
    year = ""
    title = ""
    valid = False
    i = 0
    while i < len(line) - 4:
        if line[i:i+4].isdigit():
            year = line[i:i+4]
            i = i + 6
            valid = True
            break
        else:
            i = i + 1

    if valid:
        dot = line[i:].find('.')
        if dot != -1:
            title = line[i : i + dot]
        if year and title:
            return title + '\n' + year
        else:
            return ""
    return ""

def extractReferences(filename):
    try:
        with open(filename, 'r') as f:
            my_title = f.readline()
            begin_references = False
            references = ""
            for line in f:
                if len(line)>10:
                    if begin_references:
                        title_year = referenceParse(line)
                        if title_year != "":
                            references += title_year + '\n'
                if line.startswith('References') or line.startswith('REFERENCES') or line.startswith('BIBLIOGRAPHY'):
                    begin_references = True
            with open(filename[:-4] + '-references.txt', 'w') as out:
                out.write(references)
    except Exception as e:
        print ('Error in file ' + filename)
        print (e)

work_dir = sys.argv[1]
for file in next(os.walk(work_dir))[2]:
    if file[-4:] == '.txt' and file[-10:] != 'header.txt' and file[-14:] != 'references.txt':
        print(file)
        extractReferences(work_dir + '/' + file)
