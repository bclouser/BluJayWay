#!/usr/bin/env python 

import socket 
import sys

host = '' 
port = 5011
backlog = 5 
size = 1024 
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM) 
s.bind((host,port)) 
s.listen(backlog) 
while True: 
    client, address = s.accept()
    data = client.recv(size) 
    if data: 
    	print str(data)
    	sys.stdout.flush()
    client.close()