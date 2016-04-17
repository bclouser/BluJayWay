#!/usr/bin/env bash

if [ $# -eq 0 ];then
	echo "Number of instances required"
	exit -1
fi


for i in `seq 1 ${1}`; do
	echo "Creating ${i}"
	./gpsDeviceSim.py $i &> /dev/null & disown || {
		echo "Failed to launch at index: $i"
	}
	echo "Running PID: $i"
done

