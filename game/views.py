from django.shortcuts import render
from django.core.serializers import serialize
from django.db.models import Count
from .models import *


# Create your views here.

def index(request):
    hacking_map = 'Test'

    # load the gamestate into the context
    context = {
        'nodes' : HackingNode.objects.filter(map_in__short_name = hacking_map),
        'links' : HackingLink.objects.filter(node_from__map_in__short_name = hacking_map),
        'tools' : HackingTool.objects.annotate(is_pickup=Count('hackingtoolpickup')).filter(is_pickup = 0), # PLACEHOLDER FILTER FOR WHAT TOOLS ARE ON THE TOOL BELT

        # things mostly for JSON:
        'pickups' : HackingToolPickup.objects.filter(node__map_in__short_name = hacking_map), 
        'all_tools' : HackingTool.objects.all(),
    }

    # creates json representations for the game state
    json_context = { '{}_json'.format(k) : serialize('json', v) for k, v in context.items() }
    context.update(json_context)

    return render(request, 'game/index.html', context)