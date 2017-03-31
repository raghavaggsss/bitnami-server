import math
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from pylab import savefig
#red is c should be recording
#blue is b should be orignal	

def frequency_plot(a,b,c,filename):
	#plt.style.use('dark_background')
	new_name = str(filename) +str('.png')
	plt.plot(a,b,'b',label = 'original')
	plt.legend()
	plt.plot(a,c,'r',label = 'recording')
	plt.legend()

	plt.xlabel('Time(sec)',fontsize=15)			# you can change units
	plt.ylabel('Frequency(Hz)',fontsize=15)		# you can change units
	plt.title('SOUND ANALYSIS',fontsize=20)

	savefig(new_name, bbox_inches='tight')
	# plt.show()

