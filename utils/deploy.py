# http://me.yonatan.graphtelling.demo.s3-website-us-east-1.amazonaws.com
import os
from types import NoneType
from datetime import datetime
from datetime import tzinfo
import boto3
import subprocess

bucket = "me.yonatan.graphtelling.demo"
root_dir = '/Users/yonatan/Git/Private/GraphTelling/web'
blacklist = []
cachelist = set(['common/d3.min.js', 'common/jquery-3.0.0.js', 'common/require.js'])

session = boto3.Session(profile_name='personal_graphtelling')
s3 = session.resource('s3')


def get_full_path(subdir, file_name):
    return os.path.join(subdir, file_name)


def get_relative_path(subdir, file_name):
    full_path = get_full_path(subdir, file_name)
    path = full_path[len(root_dir):]

    if path.startswith('/'):
        path = path[1:]
    return path


def is_blacklisted(relative_path):
    for item in blacklist:
        if relative_path.startswith(item):
            return True
    return False

now_str = datetime.utcnow().isoformat('-') + 'Z'
for subdir, dirs, files in os.walk(root_dir):
    for file_name in files:
        relative_path = get_relative_path(subdir, file_name)
        if is_blacklisted(relative_path):
            continue

        full_path = get_full_path(subdir, file_name)
        print "Uploading " + full_path

        data = open(full_path, "rb")

        acl = 'public-read'
        cache_control = "no-cache, no-store, must-revalidate"
        if file_name.endswith(".json"):
            contentType = 'application/json'
        elif file_name.endswith(".js"):
            contentType = 'application/javascript'
        elif file_name.endswith(".html"):
            contentType = 'text/html'
        else:
            contentType = 'application/binary'
            acl = 'private'

        if relative_path in cachelist:
            cache_control = 'max-age=3600'

        if relative_path == 'index.html':
            data = data.read().replace('\n', '')
            data = data.replace('@DATE@', now_str)
            git_commit = subprocess.check_output(["git", "describe", '--always'])
            data = data.replace('@COMMIT_ID@', git_commit)

        s3.Bucket(bucket).put_object(Key=relative_path, Body=data, ACL=acl,
                                     CacheControl=cache_control,
                                     ContentType=contentType)
