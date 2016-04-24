import subprocess
import time
import gps
import threading

lat = 0
lon = 0
# Declaring some globals... i really should make this a legit python module
gpsdThread = None
hasFix = False


# We need to run a thread to get around the blocking call
class GpsPoller(threading.Thread):
	def __init__(self):
		threading.Thread.__init__(self)
		self.session = gps.gps("localhost", "2947")
		self.session.stream(gps.WATCH_ENABLE)
		self.latestReport = None
		self.gpsdReady = False

	def getLatestReport(self):
		return self.latestReport

	def run(self):
		global hasFix
		counter = 0
		try:
			while True:
				# if not hasFix:
				# 	if counter == 0:
				# 		print "|"
				# 	elif counter == 1:
				# 		print "/"
				# 	elif counter == 2:
				# 		print "-"
				# 	elif counter == 3:
				# 		print "\\"
				# 	elif counter == 4:
				# 		print "|"
				# 	elif counter == 5:
				# 		print "/"
				# 	elif counter == 6:
				# 		print "-"
				# 	elif counter == 7:
				# 		print "\\"
				# 		counter = 0
				# 	else:
				# 		counter = 0
				# 	counter += 1

				report = self.session.next()
				#print report

				if report["class"]:
					self.gpsdReady = True

				# TPV has the goods!
				# http://www.catb.org/gpsd/client-howto.html#_interfacing_from_the_client_side
				if report['class'] == "TPV" :
					# mode = 1: we havn't yet gotten a lock from the satellites
					# mode = 2: we have a 2d lock from satellites
					# mode = 3: we have a 3d lock from satellites
					if report['mode'] > 1:
						hasFix = True

				self.latestReport = report

				

				time.sleep(0.2)
				# CURSOR_UP_ONE = '\x1b[1A'
				# ERASE_LINE = '\x1b[2K'
				# print(CURSOR_UP_ONE + ERASE_LINE + CURSOR_UP_ONE)

		except KeyError:
			pass
		except StopIteration:
			pass
		except Exception, e:
			print "Caught exception within thread"
			print str(e)

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
		return False

	# Kick off thread to Listen on port 2947 (gpsd) of localhost
	global gpsdThread
	try:
		gpsdThread = GpsPoller()
		gpsdThread.daemon = True
		gpsdThread.start()
	except Exception, e:
		print "Caught exception while launching gps thread"
		print str(e)


def deviceReady():
	print "entering deviceReady()"
	global gpsdThread;

	print "leaving device Ready " + str(gpsdThread. gpsdReady)
	return gpsdThread.gpsdReady


def hasLocationFix():
	global hasFix
	return hasFix

def getCoords():
	global hasFix
	global lat
	global lon
	global gpsdThread

	try:
		report = gpsdThread.getLatestReport()


		print report

		lat = report['lat']
		lon = report['lon']
		time = "" #str(gpsdConnection.utc) + " " + str(gpsdConnection.fix.time)
		altitude = report['alt']
		speed = report['speed']
		hasFix = True
		return (lat, lon, time, altitude, speed)

		return False

	except KeyError:
		pass

	except Exception, e:
		print str(e)
		print "LEaving deviceReady()"
		return False
