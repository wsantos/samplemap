from django.shortcuts import render
from django.http import HttpResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from maps.models import ShapeModel
from django.contrib.gis.geos import Polygon, MultiPolygon
import json

@ensure_csrf_cookie
def index(request):
    context = {}
    return render(request, 'maps/index.html', context)

@ensure_csrf_cookie
def search(request):
    context = {}

    if request.method == 'POST':

        point = [float(pos) for pos in request.POST.getlist("point[]")]

        # Used "str(tuple(point))" just to simplificate the creation of
        # point(xx.xxx, xx.xxx) for the raw where query
        # -
        # Used raw where becouse geoquerysets still using MBRContains, but
        # mysql 5.6+ have new geo functions to handle this.
        polygons = ShapeModel.objects.filter().extra(
            where=["st_contains(mpoly, point%s)" % str(tuple(point))]
        )

        json_data = {
            "count" : polygons.count()
        }

        return HttpResponse(json.dumps(json_data),
                            content_type="application/json")

    elif request.method == 'GET':
        return render(request, 'maps/search.html', context)


@ensure_csrf_cookie
def register(request):


    if request.method == 'POST':

        mp = []
        for post_poly in request.POST.getlist("mpoly[]"):

            # Convert numbers from string to float
            post_poly = [float(pos) for pos in post_poly.split(",")]

            # Zip and iter for group in groups of 2
            poly = zip(*(iter(post_poly),) * 2)

            # Polygon must be closed so connect last point to first
            poly = Polygon(poly + [poly[0]])

            mp.append(poly)

        sm = ShapeModel()
        sm.mpoly = MultiPolygon(mp)
        sm.save()

        return HttpResponse("{}")

    elif request.method == 'GET':

        return HttpResponse("")

