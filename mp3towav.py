#!/usr/bin/env python

def converter(filename):
	from pydub import AudioSegment

#sound = AudioSegment.from_mp3("input.mp3")
#sound.export("%s.wav"%a, format="wav")

	file_location = filename
        sound = AudioSegment.from_mp3(file_location)
        file_stripped_name=file_location[:-4]
        file_location = "%s.wav"%file_stripped_name
        sound.export(file_location, format="wav")
	#elif file_location.endswith('.wav'):
		#return 1

