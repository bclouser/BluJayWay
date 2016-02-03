import subprocess
import gps

# Declaring some globals... i really should make this a legit python module
gpsdConnection = None
hasFix = False

def init():
	print "Initializing gps"

	try:
		result = subprocess.check_output(['sudo gpsd /dev/ttyUSB0 -F /var/run/gpsd.sock'], shell=True, stderr=subprocess.STDOUT)
	except Exception, e:
		print "Caught error in gpsHandler init():"
		print str(e)
		print result
		return

	# Listen on port 2947 (gpsd) of localhost
	try:
		global gpsdConnection
		gpsdConnection = gps.gps("localhost", "2947")
		gpsdConnection.stream(gps.WATCH_ENABLE | gps.WATCH_NEWSTYLE)

	except StopIteration:
		gpsdConnection = None
		print "GPSD has terminated"


def deviceReady():
	print "entering deviceReady()"
	global gpsdConnection;
	try:
		report = gpsdConnection.next()
		print "report:"
		print report
		# Just check that we are getting a response from our gpsd connection
		if report['class'] == 'VERSION':
			return True

		# I don't know what this is
		elif report['class'] == 'DEVICE':
			# Clean up our current connection.
			gpsdConnection.close()
			# Tell gpsd we're ready to receive messages.
			gpsdConnection = gps.gps(mode=WATCH_ENABLE)

		else:
			print "LEaving deviceReady()"
			return False

	except StopIteration:
		gpsdConnection = None
		print "GPSD has terminated"
		return False

	except Exception, e:
		print str(e)
		print "LEaving deviceReady()"
		return False


def getFix():
	print "Gettin my fix! -gps device"
	global gpsdConnection
	global hasFix
	try:
		# This locks up if we don't get a fix after 3 tries
		report = gpsdConnection.next()
		print "report:"
		print report

		# Check that our response has gps coords and a valid fix
		#if report['class'] == 'VERSION':
		#	hasFix = True
		#	return True

		return False

	except StopIteration:
		gpsdConnection = None
		print "GPSD has terminated"
		return False

	except Exception, e:
		print str(e)
		print "LEaving deviceReady()"
		return False

def hasLocationFix():
	global hasFix
	return hasFix

def getCoords():
	return (0.0, 0.0)