#!/bin/bash

DIR=`dirname $0`

export LD_LIBRARY_PATH="/usr/local/lib64:/usr/local/lib:/usr/lib:/lib64:/lib:/lib/x86_64-linux-gnu:/usr/lib/x86_64-linux-gnu"

DEBUG=tileserv:* $DIR/www

