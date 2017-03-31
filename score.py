def calculate_score(fk,fr,time,length_time):
	
	u = max(max(fk,fr))
	l = min(min(fk,fr))

	err = 0

	i=0

	dt = time[50]-time[49]

	while 1:
	    if (fk[i]/2 < fr[i] and fr[i] < 3*fk[i]/2):
	    	err += 2 * abs((fr[i] - fk[i])) / (fk[i]) * dt

	    else:
	    	err += 1 * dt

	    if (i == (length_time-2)):
	        break
	    
	    i+=1

	score = 100 - err/time[i]*100

	return score
