#!/usr/bin/env python

import socket
import time
import argparse
parser = argparse.ArgumentParser()
parser.add_argument("index")
args = parser.parse_args()

index = int(args.index)

hostName = "HAWK-%02d" % index
print hostName

TCP_IP = '192.168.33.10'
TCP_PORT = 5000
BUFFER_SIZE = 1024

lat = 38.920000;
lng = -77.346357 - (float(index)/100);


print "Longitude = " + str(lng)

currentSpeed = 11
currentAlt = 41

while(True):
	if currentSpeed % 5:
		currentSpeed += 1
	else:
		currentSpeed -= 4

	if currentAlt % 5:
		currentAlt += 1
	else:
		currentAlt -= 4


	MESSAGE = "{\"host\":\""+hostName+"\", \"lat\":"+str(lat)+", \"lng\":"+str(lng)+", \"alt\":"+str(currentAlt)+",\"speed\":"+str(currentSpeed)+"}"
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
