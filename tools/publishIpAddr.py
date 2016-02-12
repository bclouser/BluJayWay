#!/usr/bin/env python

import socket
import time

#TCP_IP = socket.gethostbyname('localhost')
TCP_IP=""
TCP_PORT = 5011
BUFFER_SIZE = 1024
SLEEP_TIME = 60 # seconds

currentIpAddr = ""


while(True):
	
	try:
		TCP_IP = socket.gethostbyname('www.benclouser.com')


		# First get our ip address
		s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
		s.connect(("gmail.com",80))
		currentIpAddr = s.getsockname()[0]
		s.close()

		MESSAGE = str(socket.gethostname()) + "\'s ip addr is: " + str(currentIpAddr) + " @ " + time.strftime("%H:%M") + " " + time.strftime("%m/%d/%Y")
		print MESSAGE;

		s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
		s.connect((TCP_IP, TCP_PORT))
		s.send(MESSAGE)
		data = s.recv(BUFFER_SIZE)
		s.close()

	except Exception, e:
		print "sending message to " + str(TCP_IP) + ":" + str(TCP_PORT)
		print str(e)

	time.sleep(SLEEP_TIME);