import math
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from pylab import savefig
import os
#red is c should be recording
#blue is b should be orignal	

def frequency_plot(a,b,c,filename):
	#plt.style.use('dark_background')
	new_name = str(filename) +str('.png')
	plt.figure()
	plt.plot(a,b,'b',label = 'original')
	plt.legend()
	plt.plot(a,c,'r',label = 'recording')
	plt.legend()

	plt.xlabel('Time(sec)',fontsize=15)			# you can change units
	plt.ylabel('Frequency(Hz)',fontsize=15)		# you can change units
	plt.title('SOUND ANALYSIS',fontsize=20)
	BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        path_png = os.path.join(BASE_DIR, 'Project/media/png/')
	os.chdir(path_png)
	savefig(new_name, bbox_inches='tight')
	# plt.show()
	plt.close('all')

