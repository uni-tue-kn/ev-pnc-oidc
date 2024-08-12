FROM python:3.12-bookworm

# Update and install packages
RUN apt-get update
RUN apt-get upgrade -y
RUN apt-get install -y bluez

WORKDIR /app

# Copy source files
COPY ./gatt_server.py /app/gatt_server.py
COPY ./entrypoint.sh /app/entrypoint.sh

# Install dependencies
RUN pip install bless requests

# Set environment variables
ENV DEVICE_NAME=MyEV

# Start the server
ENTRYPOINT [ "/app/entrypoint.sh" ]
