import sys
import time
import schedule
import digitalio
import busio
import board
import threading
from adafruit_epd.epd import Adafruit_EPD
from adafruit_epd.ssd1680 import Adafruit_SSD1680
from PIL import Image, ImageDraw, ImageFont

import draw_utils
import api_utils

WHITE = (255, 255, 255)
BLACK = (0, 0, 0)

TOTAL = 4
LIBRARY_SIZE = 0
WISHLIST_SIZE = 1
FIGURE_SIZE = 2
UPC_WAITING = 3

screen = LIBRARY_SIZE

spi = busio.SPI(board.SCK, MOSI=board.MOSI, MISO=board.MISO)
ecs = digitalio.DigitalInOut(board.CE0)
dc = digitalio.DigitalInOut(board.D22)
rst = digitalio.DigitalInOut(board.D27)
busy = digitalio.DigitalInOut(board.D17)
switch1 = digitalio.DigitalInOut(board.D6)
switch2 = digitalio.DigitalInOut(board.D5)

display = Adafruit_SSD1680(122, 250, spi, cs_pin=ecs, dc_pin=dc, sramcs_pin=None, rst_pin=rst, busy_pin=busy, )

display.rotation = 1
display.fill(Adafruit_EPD.WHITE)
image = Image.new("RGB", (display.width, display.height), color=WHITE)
draw = ImageDraw.Draw(image)

def update():
    global draw, screen
    if abs(screen % TOTAL) == LIBRARY_SIZE:
        connected, count = api_utils.getLibraryCount()
        display.rotation = 1
        display.fill(Adafruit_EPD.WHITE)
        image = Image.new("RGB", (display.width, display.height), color=WHITE)
        draw = ImageDraw.Draw(image)
        if draw_utils.drawLibrarySize(draw, connected, count):
            image = image.convert("1").convert("L")
            display.image(image)
            display.display()
    if abs(screen % TOTAL) == WISHLIST_SIZE:
        connected, count = api_utils.getWishlistCount()
        display.rotation = 1
        display.fill(Adafruit_EPD.WHITE)
        image = Image.new("RGB", (display.width, display.height), color=WHITE)
        draw = ImageDraw.Draw(image)
        if draw_utils.drawWishlistSize(draw, connected, count):
           image = image.convert("1").convert("L")
           display.image(image)
           display.display()
    if abs(screen % TOTAL) == FIGURE_SIZE:
        connected, count = api_utils.getFigureCount()
        display.rotation = 1
        display.fill(Adafruit_EPD.WHITE)
        image = Image.new("RGB", (display.width, display.height), color=WHITE)
        draw = ImageDraw.Draw(image)
        if draw_utils.drawFigureSize(draw, connected, count):
            image = image.convert("1").convert("L")
            display.image(image)
            display.display()
    if abs(screen % TOTAL) == UPC_WAITING:
        display.rotation = 1
        display.fill(Adafruit_EPD.WHITE)
        image = Image.new("RGB", (display.width, display.height), color=WHITE)
        draw = ImageDraw.Draw(image)
        draw_utils.drawUPCWaiting(draw)
        image = image.convert("1").convert("L")
        display.image(image)
        display.display()
        print("Awaiting UPC input...")
        scanned_upc = input()

        scanned_edition = api_utils.getGameByUPC(scanned_upc)
        display.rotation = 1
        display.fill(Adafruit_EPD.WHITE)
        image = Image.new("RGB", (display.width, display.height), color=WHITE)
        draw = ImageDraw.Draw(image)
        draw_utils.drawEditionInfo(draw, scanned_edition)
        image = image.convert("1").convert("L")
        display.image(image)
        display.display()

update()

schedule.every(10).minutes.do(update)

while True:
    schedule.run_pending()
    if not switch1.value:
        print("Switch 1")
        screen += 1
        update()
        while not switch1.value: # Wait out extra inputs
            time.sleep(0.01)
    if not switch2.value:
        print("Switch 2")
        screen -= 1
        update()
        while not switch2.value: # Wait out extra inputs
            time.sleep(0.01)
    time.sleep(0.01)