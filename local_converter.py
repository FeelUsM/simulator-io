import sys
import re
if len(sys.argv)!=2:
	print('usage: python local_converter.py input_file')
	exit(1)
input_file = sys.argv[1]
#print(input_file)

result_str = "global_"+''.join(map(lambda x:x if 'a'<x<'z' or 'A'<x<'Z' or '0'<x<'9' else '_',input_file))+" = '"
with open(input_file, 'r') as F:
	while line := F.readline():
		result_str += re.sub(r"(\'|\\)",r"\\\1",line.rstrip())
result_str+="'"
#print(repr(result_str))

newname = re.sub(r'\.[^\.]+$',r'',input_file)+'.js'
#print(newname)
with open(newname, 'w') as F:
	F.write(result_str)
