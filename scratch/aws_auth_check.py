import boto3

try:
    sts = boto3.client('sts')
    identity = sts.get_caller_identity()
    print("AWS Auth successful:")
    print(identity)
except Exception as e:
    print("AWS Auth failed:")
    print(e)
