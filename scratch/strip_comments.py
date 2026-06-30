import os
import re

def strip_comments(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    result = []
    i = 0
    n = len(content)
    in_string = None  # '"', "'", or '`'
    escaped = False

    while i < n:
        char = content[i]

        if in_string:
            result.append(char)
            if escaped:
                escaped = False
            elif char == '\\':
                escaped = True
            elif char == in_string:
                in_string = None
            i += 1
            continue

        # Check for string start
        if char in ('"', "'", '`'):
            in_string = char
            result.append(char)
            i += 1
            continue

        # Check for single-line comment
        if i + 1 < n and content[i:i+2] == '//':
            # Skip until newline
            i += 2
            while i < n and content[i] != '\n':
                i += 1
            continue

        # Check for multi-line comment
        if i + 1 < n and content[i:i+2] == '/*':
            i += 2
            while i + 1 < n and content[i:i+2] != '*/':
                i += 1
            i += 2  # skip '*/'
            continue

        result.append(char)
        i += 1

    cleaned = "".join(result)
    
    # Optional cleanup: remove multiple empty lines left behind by comments
    cleaned = re.sub(r'\n\s*\n\s*\n', '\n\n', cleaned)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(cleaned)

files_to_clean = []
src_dir = r"d:\kollab\src"
for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith(('.ts', '.tsx', '.js', '.jsx')):
            files_to_clean.append(os.path.join(root, file))

for fp in files_to_clean:
    print(f"Cleaning comments from {fp}")
    strip_comments(fp)

print("Comment stripping completed!")
