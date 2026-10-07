import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

workspace = r"c:\Users\dc941\Documents\LLLife"

def count_dir(d):
    total_files = 0
    total_size = 0
    for root, dirs, files in os.walk(d):
        for f in files:
            fp = os.path.join(root, f)
            total_files += 1
            total_size += os.path.getsize(fp)
    return total_files, total_size

for folder in ["site", "assets", "api_data", "extracted_data", "analysis"]:
    p = os.path.join(workspace, folder)
    if os.path.exists(p):
        cnt, sz = count_dir(p)
        print(f"{folder:15}: {cnt:4} files, {sz / (1024*1024):.2f} MB")
    else:
        print(f"{folder:15}: DOES NOT EXIST")
