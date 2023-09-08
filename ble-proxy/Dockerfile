FROM python:3.11

RUN apt-get update && apt-get upgrade -y && apt-get install -y dbus bluez systemctl python3-gi python3-docutils libdbus-1-dev libudev-dev libical-dev libreadline-dev libcairo2-dev libxt-dev libgirepository1.0-dev mosquitto mosquitto-clients
RUN pip3 install --upgrade setuptools
RUN pip3 install pycairo PyGObject dbus-python git+https://github.com/manylabs/yaglib.git paho-mqtt

COPY ./bluetooth.service /lib/systemd/system/bluetooth.service

# Copy app
WORKDIR /usr/src/app
COPY ./entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

ENTRYPOINT [ "/usr/src/app/entrypoint.sh" ]




# # Install OS packages
# RUN apt-get update && apt-get upgrade -y && apt-get install -y dbus python3-gi python3-docutils libdbus-1-dev libudev-dev libical-dev libreadline-dev libcairo2-dev libxt-dev libgirepository1.0-dev

# # Install Python packages
# RUN pip3 install pycairo PyGObject dbus-python git+https://github.com/manylabs/yaglib.git

# WORKDIR /usr/src
# # Download bluez
# RUN wget https://www.kernel.org/pub/linux/bluetooth/bluez-5.66.tar.xz
# RUN tar xf bluez-5.66.tar.xz
# RUN rm bluez-5.66.tar.xz

# # Install bluez
# WORKDIR /usr/src/bluez-5.66
# RUN ./configure --prefix=/usr --mandir=/usr/share/man --sysconfdir=/etc --localstatedir=/var --disable-systemd --with-udevdir=/lib/udev --enable-experimental --enable-maintainer-mode
# RUN make

# # Copy app
# WORKDIR /usr/src/app
# COPY ./entrypoint.sh ./entrypoint.sh
# RUN chmod +x ./entrypoint.sh

# ENTRYPOINT [ "entrypoint.sh" ]
