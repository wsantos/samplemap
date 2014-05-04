from django.conf.urls import patterns, url

from maps import views

urlpatterns = patterns('',
    url(r'^$', views.index, name='index'),
    url(r'^search/$', views.search, name='search'),
    url(r'^register/$', views.register, name='register'),

)
