import subprocess
import time
import gps

lat = 0
lon = 0
# Declaring some globals... i really should make this a legit python module
gpsdConnection = None
hasFix = False

def init():
	print "Initializing gps"

	try:
		# Kill it before starting it again
		result = subprocess.call(['sudo killall gpsd'], shell=True, stderr=subprocess.STDOUT)
		#killall returns a zero return code if at least one process has been killed returns non-zero otherwise.
		if(result != 0):
			print "Couldn't kill gpsd... likely it isn't running"
		else:
			print "There was an existing instance of gpsd so I killed it"

		# Give it a second
		time.sleep(1)
		result = subprocess.check_output(['sudo gpsd /dev/ttyAMA0 -F /var/run/gpsd.sock'], shell=True, stderr=subprocess.STDOUT)
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
	global lat
	global lon
	global gpsdConnection
	global hasFix
	try:
		# This locks up if we don't get a fix after 3 tries
		report = gpsdConnection.next()
		print "report:"
		print str(report)+"\n"

		# Check that our response has gps coords and a valid fix
		if report['lat'] and report['lon']:
			lat = report['lat']
			lon = report['lon']
			hasFix = True
			return True

		return False

	except StopIteration:
		gpsdConnection = None
		print "GPSD has terminated"
		return False

	except KeyError:
		pass

	except Exception, e:
		print str(e)
		print "LEaving deviceReady()"
		return False

def hasLocationFix():
	global hasFix
	return hasFix

def getCoords():
	global lat
	global lon
	global gpsdConnection

	try:
		# This locks up if we don't get a fix after 3 tries
		# pretty sure the process is blocking on the socket waiting for new data.
		# I should make that baby poll.

		lat = gpsdConnection.fix.latitude
		lon = gpsdConnection.fix.longitude
		hasFix = True
		return (lat, lon)

		return False

	except StopIteration:
		gpsdConnection = None
		print "GPSD has terminated"
		return False

	except KeyError:
		pass

	except Exception, e:
		print str(e)
		print "LEaving deviceReady()"
		return False
