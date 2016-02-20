import socket


class Client:
	def __init__(self, ipAddr, tcpPort=5000):
		self.ipAddr = ipAddr
		self.tcpPort = tcpPort

	def publishCoords(self, coords):
		lat,lon = coords
		print "lat = " + str(lat)
		print "lon = " + str(lon)
		bufSize = 1024

		message = "{\"coords\":{\"lat\":"+str(lat)+", \"lng\":"+str(lon)+"}}"
		print message;
		try:
			sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
			sock.connect((self.ipAddr, self.tcpPort))
			sock.send(message)
			data = sock.recv(bufSize)
			sock.close()

		except Exception,e:
			print "something didn't go well with the socket connection"
			print str(e)
			return False

		return True