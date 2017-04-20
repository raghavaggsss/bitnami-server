from separateLeadStereoParam import main as separate
from sendEmail import send_email

#while(1):
#	for i in range(0,numberofrows):
#		if (karaoke_created is 0 )
#			separate
#			a = list of similar hashes & email_sent is 0
#			for hashes in similiar hashes:
#				if(file_name != new_name):
#					copy file
#				send email

import sqlite3
conn = sqlite3.connect('db.sqlite3')
c = conn.cursor()
c.execute('PRAGMA journal_mode= WAL')
d = conn.cursor()
d.execute('PRAGMA journal_mode= WAL')
for row in c.execute('SELECT * FROM core_songDB'):
	if row[6] == 0:
		t = (row[1],)
		d.execute('UPDATE core_songDB SET karaoke_created=1 WHERE full_name=?',t)
		conn.commit()
		separate(row[1],row[2],row[5])
		u = (row[3],)
		e = conn.cursor()
		e.execute('PRAGMA journal_mode= WAL')
		f = conn.cursor()
		f.execute('PRAGMA journal_mode= WAL')
		for row1 in e.execute('SELECT * FROM core_songDB WHERE hash_code=? AND email_sent = 0', u):
			send_email(row1[5], row1[2])
			v = (row1[1],)
			f.execute('UPDATE core_songDB SET email_sent=1 WHERE full_name=? AND email_sent=0', v)
			conn.commit()
		e.close()
		f.close()
c.close()
d.close()
conn.close()


