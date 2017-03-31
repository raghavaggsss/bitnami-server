Our webapp:https://songtrain-3-suryabulusu.c9users.io/

INTRODUCTION:
SongTrain is a web application that is an online karaoke and a frequency analyser.


HOW TO USE:
1) Open c9.io and create an account.

2) Create a new workspace. Give it any title and description. Select 'django' template and create workspace.

3) In the terminal, type 

	git clone https://github.com/raghavaggsss/SongTrain.git
	cd SongTrain

4) Click on Run Project button on the top center of the page

5) In the Django-Running terminal, there is an option to change working directory (CWD). Click on CWD and select SongTrain

6) now sudo pip install all required stuff

7) Run project again

😎 Open the given link

9) take a look at app

 _________OR__________
 
 You can do the above steps on a Linux system as described in the video
 
The app returns the karaoke version of the input file.
Plug in your headphones and sing to the music. The app records your vocals, and returns a frequency vs time graph comparing your singing to the original. The graph reveals where you need to increase or decrease your pitch to hit those high or low notes. Practice, and end up mastering the notes! Compete with your friends to get the closest-to-original graph.


FOR DEVELOPERS:

This is an open-source project-
Github link: https://github.com/raghavaggsss/SongTrain

This web app has been designed using django 1.10 and python 2.7.12

The code may require to install the following python libraries:-
aubio
matplotlib
numpy 1.11.0(newer versions won't work)
pygame
pygraphics
pytz
scikits
scipy
wave

Delete all the .wav files that are generated in the media folder on running of code. (We wanted to add the files to database but we didn't have the time.)

BRIEFLY UNDERSTANDING THE ALGORITHMS:

separateLeadStereoParam.py:
This file is our karaoke generator. It accepts a .wav file as input. SIMM.py is used in this code.

sound_record.py
Currently our app requires user to input recording file. We were planning to use this code to do the same on the app itself, but due to some isses and shortage of time we weren't able to include this code.

compare.py
returns 3 arrays:

1. Frequency of recording (say f1)
2. Frequency of kareoke file (say f2)
3. Corresponding time values (say t)
 
freq_plot
This file receives the 3 arrays.
Here we use matplotlib library to generate f1 and f2 vs t graphs.



The quality of the karaoke primarily depends on the number of iterations parameter set in the /separateLeadStereoParam.py file. the 'number of iterations' parameter is set to 15 by default but you can easily change it to anything by changing the default value of this parameter in this file.You can search for 'number of iterations' in the code and set the default to something else.Something like 500-1000 iterations give you perfect clear karaoke

