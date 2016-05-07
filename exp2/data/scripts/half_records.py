import csv

i=0
migrated = []
with open("../norm/migr_asydcfsta2.tsv") as tsv:
    for line in csv.reader(tsv, dialect="excel-tab"):
        if i % 5 == 0:
            migrated.append(line)
            # print line
        i = i + 1

with open('../norm/migr_asydcfsta2-small.tsv','w') as tsv:
    writer=csv.writer(tsv, dialect='excel-tab')
    writer.writerows(migrated)

