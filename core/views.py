from django.shortcuts import render
from django.core.files.storage import FileSystemStorage
from core.models import songDB
from mp3towav import converter
import re
import os
import hashlib
from sendEmail import send_email
from shutil import copyfile
from django.http import HttpResponse


def home(request):
    return render(request, 'core/home.html')


def simple_upload(request):
    if request.method == 'POST' and request.FILES and request.POST.get('to_email', ''):
        BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        myfile = request.FILES['myfile']
        fs = FileSystemStorage(location=os.path.join(BASE_DIR, 'media/songs'))
        song_name = fs.save(myfile.name, myfile)
        to_email_id = request.POST.get('to_email', '')
        file_name = to_email_id + song_name
        uploaded_file_url = fs.url(song_name)
        song_location = os.path.join(BASE_DIR, 'media/songs/' + song_name)
        file_location = os.path.join(BASE_DIR, 'media/songs/' + file_name)
        os.rename(song_location, file_location)

        if re.search(".mp3", file_location):
            converter(file_location)
            os.remove(file_location)
            rev_location = file_location[::-1]
            rev_location = re.sub("3pm.", "vaw.", rev_location)
            file_location = rev_location[::-1]

            rev_name = file_name[::-1]
            rev_name = re.sub("3pm.", "vaw.", rev_name)
            file_name = rev_name[::-1]

        BLOCKSIZE = 65536
        hasher = hashlib.md5()
        with open(file_location, 'rb') as afile:
            buf = afile.read(BLOCKSIZE)
            while len(buf) > 0:
                hasher.update(buf)
                buf = afile.read(BLOCKSIZE)
                # store email+song,email,song,hashcode,score,karaoke True/False
                # songDB.objects.create(full_name=file_name,name_of_song=song_name,hash_code = hasher.hexdigest(), score = 100,email_id = to_email_id)
        hash_exists = songDB.objects.filter(hash_code=hasher.hexdigest())
        if hash_exists:

            if hash_exists[0].karaoke_created == 1 and hash_exists[0].email_sent == 1:
                songDB.objects.create(full_name=file_name, name_of_song=song_name, hash_code=hasher.hexdigest(),
                                      score=0, email_id=to_email_id, karaoke_created=1, email_sent=1)

                if (os.path.join(BASE_DIR, 'media/karaoke/' + hash_exists[0].full_name)) != (
                        os.path.join(BASE_DIR, 'media/karaoke/' + file_name)):
                    copyfile(os.path.join(BASE_DIR, 'media/karaoke/' + hash_exists[0].full_name),
                             os.path.join(BASE_DIR, 'media/karaoke/' + file_name))
                    copyfile(os.path.join(BASE_DIR, 'media/vocals/' + hash_exists[0].full_name),
                             os.path.join(BASE_DIR, 'media/vocals/' + file_name))

                send_email(to_email_id, song_name)
            else:
                songDB.objects.create(full_name=file_name, name_of_song=song_name, hash_code=hasher.hexdigest(),
                                      score=0, email_id=to_email_id, karaoke_created=1)

        else:
            songDB.objects.create(full_name=file_name, name_of_song=song_name, hash_code=hasher.hexdigest(), score=0,
                                  email_id=to_email_id)
        # import threading
        # separate_thread=myThread(1,file_name,song_name,to_email_id)
        # separate_thread.start()
        # freq_karaoke, time = freq_array(filename)
        return render(request, 'core/simple_upload.html', {
            'uploaded_file_url': uploaded_file_url, 'filename': song_name,
            'to_email_id': to_email_id})
    return render(request, 'core/simple_upload.html')


def karaoke_success(request):
    if request.method == 'POST' and request.POST.get('email_check', '') and request.POST.get('song_name_check', ''):
        email_check = request.POST.get('email_check', '')
        song_name_check = request.POST.get('song_name_check', '')
        # try:
        #    songDB.objects.get(full_name__iexact = email_check + song_name_check)
        #    try:
        # songDB.objects.get(karaoke_created = 1)
        #	request.session['email'] = email_check
        #	request.session['song'] = song_name_check
        #	karaoke_url = 'media/karaoke/' + email_check + song_name_check
        #       return render(request, 'core/karaoke_success.html', {'song_processed': True})
        #    except songDB.DoesNotExist:
        #       return render(request, 'core/karaoke_success.html', {'song_not_processed': True})
        # your song being processed. pl come back when u receive the email
        # return render(request, 'core/record.html')
        # except songDB.DoesNotExist:
        #    return render(request, 'core/karaoke_success.html', {'invalid_user': True}) #sorry no such song exists. pl check    


        song_and_email_exist = songDB.objects.filter(full_name=email_check + song_name_check)
        if song_and_email_exist:
            if song_and_email_exist[0].karaoke_created == 1 and song_and_email_exist[0].email_sent == 1:
                request.session['email'] = email_check
                request.session['song'] = song_name_check
                karaoke_url = 'media/karaoke/' + email_check + song_name_check
                return render(request, 'core/karaoke_success.html', {'song_processed': True})
            elif song_and_email_exist[0].email_sent == 0:
                return render(request, 'core/karaoke_success.html', {'song_not_processed': True})
                # your song being processed. pl come back when u receive the email
                return render(request, 'core/record.html')
        else:
            return render(request, 'core/karaoke_success.html',
                          {'invalid_user': True})  # sorry no such song exists. pl check

    return render(request, 'core/karaoke_success.html')  # pl enter email and song


# def record_play(request):
#     song_name = request.session['song']
#     to_email_id = request.session['email']
#     BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
#     if request.method == 'POST' and request.FILES:
#         BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
#         myfile1 = request.FILES['myfile1']
#         fs = FileSystemStorage(os.path.join(BASE_DIR, 'media/recordings'))
#         recording_name = fs.save(myfile1.name, myfile1)
#         uploaded_file1_url = fs.url(recording_name)
#         # image_url = 'media/png/' + email_check+song_name_check +'.png'
#         from compare import compare
#         time, pitch_song, pitch_recording = compare(to_email_id + song_name, recording_name)
#         os.remove(os.path.join(BASE_DIR, 'media/recordings/' + recording_name))
#         from score import calculate_score
#         score = int(calculate_score(pitch_song, pitch_recording, time))
#         from freq_plot import frequency_plot
#         frequency_plot(time, pitch_song, pitch_recording, to_email_id + song_name)
#         # TODO : now delete song and karaoke stored locally.
#
#         return render(request, 'core/final.html',
#                       {'image_url': 'media/png/' + to_email_id + song_name + '.png', 'score': score})
#     karaoke_url = 'media/karaoke/' + to_email_id + song_name
#     return render(request, 'core/record.html', {'karaoke_url': karaoke_url, 'recording_name': to_email_id + song_name})


def record(request):
    song_name = request.session['song']
    to_email_id = request.session['email']
    vocals_url = to_email_id + song_name
    if request.method == 'POST':
        if request.POST.get('rmsValue',''):
            rmsValue = request.POST.get('rmsValue','')
            return render(request, 'core/pitch.html', {'rmsValue': rmsValue, 'vocals_url': vocals_url})
        if 'score' in request.POST:
            score1 = request.POST['score']
            song_and_email_exist = songDB.objects.filter(full_name=to_email_id + song_name)
            prev = song_and_email_exist[0].score
            song_and_email_exist.update(score=prev + ' ' + score1)
            score_array = (prev + ' ' + score1).split()
            print score_array

            return HttpResponse('success')
        return HttpResponse('fail')

    return render(request, 'core/pitch.html', {'vocals_url': vocals_url})


def leaderboard(request):
    if (request.session):
        song_name = request.session['song']
        to_email_id = request.session['email']
        hash_filter = songDB.objects.filter(full_name=to_email_id + song_name)
        song_filter = songDB.objects.filter(hash_code=hash_filter[0].hash_code)
        email_score = {}
        for items in song_filter:
            email_score[items.email_id] = max([float(i) for i in items.score.split()])
        # count_array  = [ i for i in range(1,len(email_score)+1)]

        return render(request, 'core/leaderboard.html',
                      {'email_score': email_score.iteritems(), 'song_name': song_name})
