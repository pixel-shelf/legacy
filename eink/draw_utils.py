from adafruit_epd.epd import Adafruit_EPD
from adafruit_epd.ssd1680 import Adafruit_SSD1680
import textwrap
from PIL import Image, ImageDraw, ImageFont

WHITE = (255, 255, 255)
BLACK = (0, 0, 0)

small_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 12)
medium_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 20)
title_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 30)
large_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 36)

last_drawn = (-1, None, False) # (screen, data, connected)
LIBRARY_SIZE = 0
WISHLIST_SIZE = 1
UPC_WAITING = 2
FIGURE_SIZE = 3

def drawPixel(draw, x, y):
    draw.rectangle((x, y, x, y), fill=(0, 0, 0))

def drawAlien(draw, x, y):
    drawPixel(draw, 3 + x, 0 + y)
    drawPixel(draw, 8 + x, 0 + y)
    drawPixel(draw, 4 + x, 1 + y)
    drawPixel(draw, 7 + x, 1 + y)
    drawPixel(draw, 3 + x, 2 + y)
    drawPixel(draw, 4 + x, 2 + y)
    drawPixel(draw, 5 + x, 2 + y)
    drawPixel(draw, 6 + x, 2 + y)
    drawPixel(draw, 7 + x, 2 + y)
    drawPixel(draw, 8 + x, 2 + y)
    drawPixel(draw, 2 + x, 3 + y)
    drawPixel(draw, 3 + x, 3 + y)
    drawPixel(draw, 4 + x, 3 + y)
    drawPixel(draw, 5 + x, 3 + y)
    drawPixel(draw, 6 + x, 3 + y)
    drawPixel(draw, 7 + x, 3 + y)
    drawPixel(draw, 8 + x, 3 + y)
    drawPixel(draw, 9 + x, 3 + y)
    drawPixel(draw, 0 + x, 4 + y)
    drawPixel(draw, 2 + x, 4 + y)
    drawPixel(draw, 3 + x, 4 + y)
    drawPixel(draw, 5 + x, 4 + y)
    drawPixel(draw, 6 + x, 4 + y)
    drawPixel(draw, 8 + x, 4 + y)
    drawPixel(draw, 9 + x, 4 + y)
    drawPixel(draw, 11 + x, 4 + y)
    drawPixel(draw, 0 + x, 5 + y)
    drawPixel(draw, 2 + x, 5 + y)
    drawPixel(draw, 3 + x, 5 + y)
    drawPixel(draw, 5 + x, 5 + y)
    drawPixel(draw, 6 + x, 5 + y)
    drawPixel(draw, 8 + x, 5 + y)
    drawPixel(draw, 9 + x, 5 + y)
    drawPixel(draw, 11 + x, 5 + y)
    drawPixel(draw, 0 + x, 6 + y)
    drawPixel(draw, 1 + x, 6 + y)
    drawPixel(draw, 2 + x, 6 + y)
    drawPixel(draw, 3 + x, 6 + y)
    drawPixel(draw, 4 + x, 6 + y)
    drawPixel(draw, 5 + x, 6 + y)
    drawPixel(draw, 6 + x, 6 + y)
    drawPixel(draw, 7 + x, 6 + y)
    drawPixel(draw, 8 + x, 6 + y)
    drawPixel(draw, 9 + x, 6 + y)
    drawPixel(draw, 10 + x, 6 + y)
    drawPixel(draw, 11 + x, 6 + y)
    drawPixel(draw, 2 + x, 7 + y)
    drawPixel(draw, 3 + x, 7 + y)
    drawPixel(draw, 4 + x, 7 + y)
    drawPixel(draw, 5 + x, 7 + y)
    drawPixel(draw, 6 + x, 7 + y)
    drawPixel(draw, 7 + x, 7 + y)
    drawPixel(draw, 8 + x, 7 + y)
    drawPixel(draw, 9 + x, 7 + y)
    drawPixel(draw, 2 + x, 8 + y)
    drawPixel(draw, 3 + x, 8 + y)
    drawPixel(draw, 4 + x, 8 + y)
    drawPixel(draw, 5 + x, 8 + y)
    drawPixel(draw, 6 + x, 8 + y)
    drawPixel(draw, 7 + x, 8 + y)
    drawPixel(draw, 8 + x, 8 + y)
    drawPixel(draw, 9 + x, 8 + y)
    drawPixel(draw, 4 + x, 9 + y)
    drawPixel(draw, 7 + x, 9 + y)
    drawPixel(draw, 2 + x, 10 + y)
    drawPixel(draw, 3 + x, 10 + y)
    drawPixel(draw, 8 + x, 10 + y)
    drawPixel(draw, 9 + x, 10 + y)

def drawWatermark(draw, x, y):
    drawAlien(draw, x, y)
    draw.text((x + 15, y - 2), 'Powered by Pixel Shelf', font=small_font, fill=BLACK,)

def drawConnectionError(draw, x, y):
    draw.text((x, y), 'Could not connect to server!', font=small_font, fill=BLACK,)

def drawLibrarySize(draw, connected, count):
    global last_drawn
    if last_drawn[0] == LIBRARY_SIZE and last_drawn[1] == count and last_drawn[2] == connected:
        print('No updates to screen needed')
        return False

    print('Rendering library size screen...')
    draw.text((5, 5), 'My Game Collection', font=medium_font, fill=BLACK,)
    draw.text((5, 25), str(count) + ' Games',font=large_font,fill=BLACK,)
    if not connected:
        drawConnectionError(draw, 5, 110)
    else:
        drawWatermark(draw, 5, 110)

    last_drawn = (LIBRARY_SIZE, count, connected)
    return True

def drawFigureSize(draw, connected, count):
    global last_drawn
    if last_drawn[0] == FIGURE_SIZE and last_drawn[1] == count and last_drawn[2] == connected:
        print('No updates to screen needed')
        return False

    print('Rendering library size screen...')
    draw.text((5, 5), 'My amiibo Collection', font=medium_font, fill=BLACK,)
    draw.text((5, 25), str(count) + ' amiibo',font=large_font,fill=BLACK,)
    if not connected:
        drawConnectionError(draw, 5, 110)
    else:
        drawWatermark(draw, 5, 110)

    last_drawn = (FIGURE_SIZE, count, connected)
    return True

def drawWishlistSize(draw, connected, count):
    global last_drawn
    if last_drawn[0] == WISHLIST_SIZE and last_drawn[1] == count and last_drawn[2] == connected:
        print('No updates to screen needed')
        return False

    print('Rendering wishlist size screen...')
    draw.text((5, 5), 'My Wishlist', font=medium_font, fill=BLACK,)
    draw.text((5, 25), str(count) + ' Games',font=large_font,fill=BLACK,)
    if not connected:
        drawConnectionError(draw, 5, 110)
    else:
        drawWatermark(draw, 5, 110)

    last_drawn = (WISHLIST_SIZE, count, connected)
    return True

def drawUPCWaiting(draw):
    global last_drawn

    print('Rendering awaiting UPC screen...')
    draw.text((5, 5), 'UPC Lookup', font=medium_font, fill=BLACK,)
    draw.text((5, 25), 'Scan a UPC',font=large_font,fill=BLACK,)
    drawWatermark(draw, 5, 110)

    last_drawn = (UPC_WAITING, None, False)
    return True

def drawEditionInfo(draw, edition):
    global last_drawn

    print('Rendering edition info screen...')

    if edition: # Placeholder; will change
        draw.text((5, 5), edition['edition'], font=medium_font, fill=BLACK,)
        draw.text((5, 25), edition['title'], font=title_font,fill=BLACK,)
        drawWatermark(draw, 5, 110)
    else:
        draw.text((5, 5), '? Edition', font=medium_font, fill=BLACK,)
        draw.text((5, 25), 'Unknown Game',font=title_font,fill=BLACK,)
        drawWatermark(draw, 5, 110)

    last_drawn = (UPC_WAITING, None, False)
    return True