import sys, os

def normalize_title(input):
    output = "".join([c.lower() if c.isalnum() else " " for c in input])
    output = ' '.join(output.split())
    return output

work_dir = sys.argv[1]
for file in next(os.walk(work_dir))[2]:
    os.rename(work_dir + '/' + file, work_dir + '/' + normalize_title(file))