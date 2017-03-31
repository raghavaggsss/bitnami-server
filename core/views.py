from django.shortcuts import render, redirect
from django.conf import settings
from django.core.files.storage import FileSystemStorage
from django.core.mail import send_mail, BadHeaderError
from core.models import songDB
import os
from compare import compare
from karaokeThreading import myThread
from django.core.urlresolvers import reverse

def home(request):
    return render(request, 'core/home.html')
    
def simple_upload(request):
    if request.method == 'POST' and request.FILES and request.POST.get('to_email', ''):
        BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
	myfile = request.FILES['myfile']
        fs = FileSystemStorage(location=os.path.join(BASE_DIR,'media/songs' ))
        song_name = fs.save(myfile.name, myfile)
	to_email_id = request.POST.get('to_email', '')
        file_name = to_email_id + song_name
	uploaded_file_url = fs.url(song_name)
	song_location = os.path.join(BASE_DIR , 'media/songs/' + song_name)
	file_location = os.path.join(BASE_DIR , 'media/songs/' + file_name)
	os.rename(song_location, file_location)	
	import hashlib
        BLOCKSIZE = 65536
        hasher = hashlib.md5()
        with open(file_location, 'rb') as afile:
            buf = afile.read(BLOCKSIZE)
            while len(buf) > 0:
                hasher.update(buf)
                buf = afile.read(BLOCKSIZE)
        #store email+song,email,song,hashcode,score,karaoke True/False
        songDB.objects.create(full_name=file_name,name_of_song=song_name,hash_code = hasher.hexdigest(), score = 100,email_id = to_email_id)
        import threading
        separate_thread=myThread(1,file_name,song_name,to_email_id)
        separate_thread.start()
        #freq_karaoke, time = freq_array(filename)
        return render(request, 'core/simple_upload.html', {
             'uploaded_file_url': uploaded_file_url, 'filename': song_name,
             'to_email_id': to_email_id})
    return render(request, 'core/simple_upload.html')
email_check=''
song_name_check=''

def karaoke_success(request):
    if request.method == 'POST' and request.POST.get('email_check', '') and request.POST.get('song_name_check', ''):
        global email_check
	global sound_name_check
	email_check = request.POST.get('email_check', '')
        song_name_check = request.POST.get('song_name_check', '')
        try: 
            songDB.objects.get(full_name__iexact = email_check + song_name_check)
            try:
                #songDB.objects.get(karaoke_created = True)
		karaoke_url = 'media/karaoke/' + email_check + song_name_check
                return render(request, 'core/karaoke_success.html', {'song_processed': True})
            except songDB.DoesNotExist:
                return render(request, 'core/karaoke_success.html', {'song_not_processed': True})
                #your song being processed. pl come back when u receive the email
                #return render(request, 'core/record.html')
        except songDB.DoesNotExist:     
            return render(request, 'core/karaoke_success.html', {'invalid_user': True}) #sorry no such song exists. pl check    
            
    return render(request, 'core/karaoke_success.html') #pl enter email and song    

def record_play(request):
   if request.method == 'POST' and request.FILES:
	BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
	global email_check
        global song_name_check
        myfile1 = request.FILES['myfile1']
        fs = FileSystemStorage(os.path.join(BASE_DIR,'media/recordings'))
        recording_name = fs.save(myfile1.name, myfile1)
        uploaded_file1_url = fs.url(recording_name)		
        image_url = 'media/png/' + email_check+song_name_check +'.png'
	from compare.py import compare
	time , pitch_song , pitch_recording = compare(song_name_check,recording_name)
	from
        from score import calculate_score
        score =int( calculate_score(freq_karaoke,freq_recording1,time,length))
        #TODO : now delete song and karaoke stored locally.
        return render(request, 'core/final.html',{'image_url':image_url, 'score':score})
   karaoke_url ='media/karaoke/' + name_of_song
   return render(request, 'core/evaluate.html', {'karaoke_url': karaoke_url})
