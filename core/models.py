from django.db import models

class songDB(models.Model):
    full_name = models.CharField(max_length = 500)
    name_of_song = models.CharField(max_length = 100)
    hash_code = models.CharField(max_length = 34)
    score = models.CharField(max_length=1000, default = ' ')
    email_id = models.EmailField()
    karaoke_created = models.IntegerField(default=0)
    email_sent = models.IntegerField(default=0)