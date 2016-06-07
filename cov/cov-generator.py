import math
import random
import json

def write_json(data, filename):
    with open(filename,'w') as f:
        f.write(json.dumps(data))

def generate_1d_data(n):
    # filename = "1d.csv"


    # // f2 = open("histogram.csv", "w")
    # f.write("y,x\n")
    points = []
    histogram = {}
    min_bucket = 99999
    max_bucket = -99999
    # f1.write("y,x\n")

    map_1d_to_histogram = []
    data_1d = []
    for i in range(0,n):

        x=random.gauss(0,1)
        data_1d.append({"id": str(i), "x": x, "y": 0})
        #
        #
        #
        # f1.write("0,"+str(x)+"\n")
        points.append(x)
        bucket = math.floor(x*10)/10
        if not bucket in histogram:
            histogram[bucket] = 0
        histogram[bucket] += 1
        if min_bucket>bucket: min_bucket=bucket
        if max_bucket<bucket: max_bucket=bucket
        map_1d_to_histogram.append({"from":str(i),"to":str(bucket)})

    data_histogram = []
    # f2.write("x,y\n")
    for bucket in histogram.keys():
        data_histogram.append({"id": str(bucket), "bucket": bucket, "height":histogram[bucket]})
        # f2.write(str(bucket)+","+str(histogram[bucket])+"\n")
    print json.dumps(data_1d,sort_keys=True,indent=4,separators=(',', ': '))
    print json.dumps(data_histogram,sort_keys=True,indent=4,separators=(',', ': '))
    print json.dumps(map_1d_to_histogram,sort_keys=True,indent=4,separators=(',', ': '))

    write_json(data_1d, 'data/data_1d.json')
    write_json(data_histogram, 'data/data_histogram.json')
    write_json(map_1d_to_histogram, 'data/map_1d_histogram.json')

# f1.close()
    # f2.close()
    # print histogram
    max_point = math.ceil(max(points))
    min_point = math.floor(min(points))
    # print max_point,math.ceil(max_point)
    # print min_point,math.floor(min_point)
    # for bucket in range(min_point,max_point):
    #     histogram[bucket] +=




generate_1d_data(300)