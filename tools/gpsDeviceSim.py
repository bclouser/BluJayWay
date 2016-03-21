#!/usr/bin/env python

import socket
import time


TCP_IP = '192.168.33.10'
TCP_PORT = 5000
BUFFER_SIZE = 1024

lat = 38.920000;
lng = -77.346357;


while(True):
	MESSAGE = "{\"host\":\""+socket.gethostname()+"\", \"lat\":"+str(lat)+", \"lng\":"+str(lng)+", \"alt\":"+str(45)+"}"
	print MESSAGE;
	try:
		s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
		s.connect((TCP_IP, TCP_PORT))
		s.send(MESSAGE)
		data = s.recv(BUFFER_SIZE)
		s.close()
	except:
		print "something didn't go well with the socket connection"

	time.sleep(1);
	lat += 0.00005;
	if(lat >= 39.07000):
		lat = 38.920
