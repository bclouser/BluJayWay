import socket


class Client:
	def __init__(self, ipAddr, tcpPort=5000):
		self.ipAddr = ipAddr
		self.tcpPort = tcpPort

	def publishCoords(self, coords):
		if not coords:
			print "publishCoords was sent null coords... We don't have valid coords yet"
			return False

		lat,lon,time,altitude,speed = coords
		bufSize = 1024

		message = "{\"host\":\""+socket.gethostname()+"\",\"lat\":"+str(lat)+", \"lng\":"+str(lon)+", \"time\":\""+str(time)+"\", \"alt\":"+str(altitude)+",\"speed\":"+str(speed)+"}"
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