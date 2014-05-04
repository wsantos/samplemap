from django.conf.urls import patterns, include, url

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'mozio.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),
    url(r'^maps/', include('maps.urls')),
    url(r'^admin/', include(admin.site.urls)),
)
