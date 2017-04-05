#!/usr/bin/env python

from aubio import source
from aubio import pitch as p
import sys
from scipy.interpolate import spline
import numpy as np
import os

def compare(song1,recording1):
	BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
	path_song = os.path.join(BASE_DIR, 'Project/media/songs/')
	song = path_song + song1
	path_recording = os.path.join(BASE_DIR , 'Project/media/recordings/')
	recording = path_recording + recording1
	downsample = 1
	samplerate = 44100 // downsample

	win_s = 4096 // downsample # fft size
	hop_s = 512*8  // downsample # hop size

	s1 = source(song, samplerate, hop_s)
	s2 = source(recording, samplerate, hop_s)

	samplerate1 = s1.samplerate
	samplerate2 = s2.samplerate

	tolerance = 0.8

	pitch_o1 = p("yin", win_s, hop_s, samplerate1)
	pitch_o2 = p("yin", win_s,hop_s,samplerate2)
	pitch_o1.set_unit("midi")
	pitch_o1.set_tolerance(tolerance)
	pitch_o2.set_unit("midi")
	pitch_o2.set_tolerance(tolerance)

	pitch2=[]
	pitch1 = []
	times=[]

	# total number of frames read
	total_frames = 0
	while True:
	    sample1, read1 = s1()
	    sample2, read2 = s2()
	    pitch_1 = pitch_o1(sample1)[0]
	    pitch_1 = int(round(pitch_1))
	    pitch_2 = pitch_o2(sample2)[0]
	    pitch_2 = int(round(pitch_2))
	    #if confidence < 0.8: pitch = 0.
	    time = total_frames / float(samplerate1)
	    #print("%f %f" % (time, pitch))
	    times +=[time]
	    pitch1 += [pitch_1]
	    pitch2 += [pitch_2]
	    total_frames += read1
	    if (read1 < hop_s or read2 < hop_s): break
        times_new = np.linspace(times[0],times[-1],100)
        pitch1_new = spline(times,pitch1,times_new)
	del pitch1
        pitch2_new = spline(times,pitch2,times_new)
	del pitch2
	del times
	return times_new, pitch1_new, pitch2_new

