#!/bin/bash

DIR=`dirname $0`

export LD_LIBRARY_PATH=/usr/local/lib64:/usr/local/lib:/usr/lib64:/usr/lib

DEBUG=tileserv:* $DIR/www

