from django.shortcuts import render
from .models import *

# Create your views here.

def index(request):
    hacking_map = 'Test'
    context = {
        'nodes' : HackingNode.objects.filter(map_in__short_name = hacking_map),
        'links' : HackingLink.objects.filter(node_from__map_in__short_name = hacking_map),
        'tools' : HackingTool.objects.all(),
    }
    return render(request, 'game/index.html', context)