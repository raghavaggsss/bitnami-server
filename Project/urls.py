from django.conf.urls import url
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static

from core import views


urlpatterns = [
    url(r'^$', views.home, name='home'),
    url(r'^upload/$', views.simple_upload, name='simple_upload'),
    url(r'^record/$', views.record_play, name='record'),
    url(r'^karaoke/$' , views.karaoke_success ,name='karaoke'),
    url(r'^admin/', admin.site.urls),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

