#!/usr/bin/env python

import os
import sys
import time
import socket
import subprocess

import gpsHandler
import wifiHandler
import gpsClient

waitSeconds = 2
maxSecondsTillReady = 60
gpsReportIntervalSeconds = 5
serverName = "testpit.benclouser.com"

# This is a flippin enum!
class State:
	initDevices = 1
	waitForLocation = 2
	waitForWifi = 3
	waitForServer = 4
	everyoneReady = 5
	# flag 
	serverConnection = False


# Init State, wait for devices to become ready
def initDevicesState():
	timeoutCntr = 0
	try:
		gpsHandler.init()

	except Exception, e:
		time.sleep(waitSeconds)
		print "Oh snap, caught exception while Initializing gps handler"
		print str(e)
		return State.initDevices

	while(not gpsHandler.deviceReady()):
		print "Waiting "+str(waitSeconds)+ " seconds for gps device to be ready"
		time.sleep(waitSeconds)
		if(timeoutCntr*waitSeconds >= maxSecondsTillReady):
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
	while(not gpsHandler.hasLocationFix()):
		time.sleep(waitSeconds)
		if(timeoutCntr*waitSeconds >= maxSecondsTillReady):
			return State.initDevices
		++timeoutCntr
	return State.waitForWifi


# Verify connection
def waitForWifiState():
	while(not wifiHandler.networkReady()):
		time.sleep(waitSeconds)
		if(timeoutCntr*waitSeconds >= maxSecondsTillReady):
			return State.initDevices
		++timeoutCntr
	return State.waitForServer

# establish server connection
def waitForServerState():
	# For now I am just gunna see if I can ping the server
	result = subprocess.call(['sudo ping -c 1 -q ' + serverName], shell=True, stderr=subprocess.STDOUT)
	if(result != 0):
		print "The server at " + serverName + " is not responding to ping requests."
		print "Assuming that the server is down"

		# Set flag so we know not to try and publish coordinates
		# We will need to periodically try tp ping and restore connectivity
		State.serverConnection = False
		return State.everyoneReady

	State.serverConnection = True
	return State.everyoneReady



client = gpsClient.Client(socket.gethostbyname(serverName), 5000)

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

	# Main loop
	while( currentState == State.everyoneReady ): 
		try:
			print "Getting gps coords"
			coords = gpsHandler.getCoords()
			print coords
		except:
			print "Getting coords failed"
			currentState=State.waitForLocation
		
		#try:
		if( State.serverConnection ):
			print "Publishing coordinates"
			if client.publishCoords( coords ):
				print "success!"
		else:
			print "Running in server less mode. Not publishing coords"
		# except Exception,e:
		# 	print "Publishing coords failed"
		# 	print str(e)
		# 	currentState = State.waitForWifi

		time.sleep(gpsReportIntervalSeconds)
		print "" # Aesthetics are everything
