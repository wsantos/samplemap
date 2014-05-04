from django.contrib.gis.db import models
# Create your models here.


class ShapeModel(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    mpoly = models.MultiPolygonField()


    objects = models.GeoManager()
