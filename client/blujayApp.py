#!/usr/bin/env python

import os
import time
import gpsHandler
import wifiHandler

waitSeconds = 2
maxSecondsTillReady = 60
gpsReportIntervalSeconds = 5

class State:
	initDevices = 1
	waitForLocation = 2
	waitForWifi = 3
	waitForServer = 4
	everyoneReady = 5


# Init State, wait for devices to become ready
def initDevicesState():
	timeoutCntr = 0
	try:
		gpsHandler.init()
	except:
		print "Oh snap, caught exception while Initializing gps handler"
		return State.initDevices
	while(not gpsHandler.deviceReady()):
		print "Waiting for gps device to be ready"
		time.sleep(waitSeconds)
		if(timeoutCnter*waitSeconds >= maxSecondsTillReady):
			return State.initDevices
		++timeoutCntr
	print "Leaving initDevicesState"
	return State.waitForLocation
		

	#wifiHandler.init()
	#while(not wifiHandler.linkReady()):
	#	time.sleep(waitSeconds)

# Wait for Gps location fix
def waitForLocationState():
	timeoutCntr = 0
	try:
		gpsHandler.getFix()
	except:
		return State.initDevices

	while(not gpsHandler.hasLocationFix()):
		time.sleep(waitSeconds)
		if(timeoutCnter*waitSeconds >= maxSecondsTillReady):
			return State.initDevices
		++timeoutCntr
	return State.waitForWifi


# Verify connection
def waitForWifiState():
	while(not wifiHandler.networkReady()):
		time.sleep(waitSeconds)
		if(timeoutCnter*waitSeconds >= maxSecondsTillReady):
			return State.initDevices
		++timeoutCntr
	return State.waitForServer

# establish server connection
def waitForServerState():
	#create some kind of server client
	#CreatedroneClient()
	#else return State.waitForWifi

	return State.everyoneReady

class Client:
	def publishCoords(self, coords):
		lat,lon = coords
		print "publishing coordinates"
		print "lat = " + str(lat)
		print "lon = " + str(lon)


client = Client()

currentState = State.initDevices

# Our main loop
while(True):
	if(currentState == State.initDevices):
		print "Initializing devices"
		currentState = initDevicesState()

	elif(currentState == State.waitForLocation):
		print "waiting for location"
		currentState = waitForLocationState()

	elif(currentState == State.waitForWifi):
		print "waiting for wifi"
		currentState = waitForWifiState()

	elif(currentState == State.waitForServer):
		print "waiting for server"
		currentState = waitForServerState()

	# Publish coordinates loop
	while( currentState == State.everyoneReady ): 
		try:
			print "Getting gps coords"
			coords = gpsHandler.getCoords()
			print coords
		except:
			print "Getting coords failed"
			currentState=State.waitForLocation
		
		#try:
		print "Publishing coordinates"
		client.publishCoords( coords )
		# except Exception,e:
		# 	print "Publishing coords failed"
		# 	print str(e)
		# 	currentState = State.waitForWifi

		time.sleep(gpsReportIntervalSeconds)
