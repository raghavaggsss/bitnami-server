import threading
import separateLeadStereoParam
class myThread(threading.Thread):
	def __init__(self, threadID, file_name,song_name,to_email_id):
        	threading.Thread.__init__(self)
        	self.threadID = threadID
                self.file_name = file_name
                self.song_name = song_name
                self.to_email_id = to_email_id

	def run(self):
                separateLeadStereoParam.main(self.file_name, self.song_name, self.to_email_id)

