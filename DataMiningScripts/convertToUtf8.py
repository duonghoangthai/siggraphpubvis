import subprocess, sys, os

work_dir = sys.argv[1]
if not os.path.exists(work_dir + '/' + 'utf8'):
    os.mkdir(work_dir + '/' + 'utf8')
for file in next(os.walk(work_dir))[2]:
    if file[-4:] == '.txt':
        print (file)
        stdout_output = open(work_dir + '/' + 'utf8/' + file, 'w')
        subprocess.call(['iconv', '-f', 'UNICODELITTLE', '-t', 'UTF-8', work_dir + '/' + file], stdout=stdout_output, stderr=subprocess.PIPE, universal_newlines=True)
        stdout_output.close()