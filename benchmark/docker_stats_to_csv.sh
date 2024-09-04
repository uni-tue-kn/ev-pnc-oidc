#!/bin/bash

OUT_FILE=$1
if [ -z "${OUT_FILE}" ]
then
  OUT_FILE="stats.csv"
fi

while true
do
  docker stats --no-stream --format "table $(date +%s%N),{{.Container}},{{.Name}},{{.ID}},{{.CPUPerc}},{{.MemUsage}},{{.NetIO}},{{.BlockIO}}" >> $OUT_FILE
  sleep 1
done
