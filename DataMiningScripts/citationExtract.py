#!/usr/bin/python
from subprocess import call
import sys

def isNum(c):
    if c >= '0' and c <= '9':
        return True
    else:
        return False

title = sys.argv[1]

import os
f = os.popen('./scholar.py -A "' + title + '"')
now = f.read()

text_file = open("output.txt", "w")
text_file.write(now)
text_file.close()

#output = call(["./scholar.py", "-A", title])

with open('output.txt') as f:
    citation = "";
    found = False;
    for line in f:

        if ('Citations' in line) and (not 'list' in line):
            found = True;
            i = 0;
            while i < len(line):
                if isNum(line[i]):
                    citation += line[i];
                i = i+1

        if (found): break;

print citation;



           