import subprocess, sys, os, shutil

work_dir = sys.argv[1]
parscit_dir = 'D:/Projects/ParsCit/bin'
parscit = 'citeExtract.pl'
os.chdir(parscit_dir)
for file in next(os.walk(work_dir))[2]:
    if file[-4:] == '.txt' and file[-10:] != 'header.txt' and file[-14:] != 'references.txt':
        print (file)
        file_full = work_dir + '/' + file
        shutil.copyfile(file_full, parscit_dir + '/' + file)
        out_file = file[:-4] + '-header.txt'
        subprocess.call(['perl', parscit, '-m', 'extract_header', file, out_file])
        os.remove(file)
        shutil.move(out_file, work_dir + '/' + out_file)
