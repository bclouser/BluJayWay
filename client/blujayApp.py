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
		return State.initDevices
	while(not gpsHandler.deviceReady()):
		time.sleep(waitSeconds)
		if(timeoutCnter*waitSeconds >= maxSecondsTillReady):
			return State.initDevices
		++timeoutCntr
		

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

# Verify connection
def waitForWifiState():
	while(not wifiHandler.networkReady()):
		time.sleep(waitSeconds)
		if(timeoutCnter*waitSeconds >= maxSecondsTillReady):
			return State.initDevices
		++timeoutCntr

# establish server connection
def waitForServerState():
	#create some kind of server client
	#CreatedroneClient()
	#else return State.waitForWifi

	return State.everyoneReady


currentState = initDevices

# Our main loop
while(True):
	if(currentState == initDevices):
		currentState = initDevicesState()

	elif(currentState == waitForLocation):
		currentState = waitForLocationState()

	elif(currentState == waitForWifi):
		currentState = waitForWifiState()

	elif(currentState == waitForServer):
		currentState = waitForServerState()

	# Publish coordinates loop
	while( currentState == everyoneReady ): 
		coords
		try:
			coords = gpsHandler.getCoords()
		except:
			currentState=waitForLocationState
		
		try:
			client.publishCoords(coords)
		except:
			currentState = waitForWifi

		time.sleep(gpsReportIntervalSeconds)


