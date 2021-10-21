from django.http import Http404
from django.shortcuts import render
from django.core.serializers import serialize
from django.db.models import Count
from .models import *
from .utils import eval_restriction


def home(request):
    '''
    A list of all tasks the play can go do.
    '''
    return dialog(request, DialogNode.objects.get(short_name = 'Home'))


def dialog(request, node):
    '''
    Renders some in-game dialog
    '''

	# Handle auto-nodes
    if DialogAutoNode.objects.filter(pk = node.pk).exists():
        for options in (node.options.all(), node.hack_options.all()):
            for option in options:
                return game(request, option.pk)
			# TODO: Handle hack nodes

    context = {
        'node' : node
    }
    return render(request, 'game/dialog.html', context)


def hacking(request, option):
    '''
    Renders the provided hacking encounter
    Errors if the page does not exist
    '''

    node = option.node_to
    hacking_map = node.map_in.short_name
    
    nodes = HackingNode.objects.filter(map_in__short_name = hacking_map)
    if nodes.count == 0:
        raise Http404("Hacking map does not exist")

    # load the gamestate into the context
    context = {
        'nodes' : nodes,
        'links' : HackingLink.objects.filter(node_from__map_in__short_name = hacking_map),
        'tools' : HackingTool.objects.annotate(is_pickup=Count('hackingtoolpickup'), is_special=Count('speciality_of')).filter(is_pickup = 0, is_special=0), # PLACEHOLDER FILTER FOR WHAT TOOLS ARE ON THE TOOL BELT

        # things mostly for JSON:
        'pickups' : HackingToolPickup.objects.filter(node__map_in__short_name = hacking_map), 
        'specialities' : HackingToolSpeciality.objects.filter(node__map_in__short_name = hacking_map),
        'all_tools' : HackingTool.objects.all(),
    }

    # creates json representations for the game state
    json_context = { '{}_json'.format(k) : serialize('json', v) for k, v in context.items() }
    context.update(json_context)

    # data to avoid jsoning
    context['starting_node'] = node.pk
    context['option'] = option.pk

    # clean up
    return render(request, 'game/hacking.html', context)


def hack_exit(request, hack_option):
	hack_option = DialogHackOption.objects.get(pk = hack_option)
	for exit_option in hack_option.exit_options.all():
		if eval_restriction(exit_option, request.GET):
			return dialog(request, exit_option.node_to)
	
	# TODO: have a better default case?
	return hacking(hack_option)


def game(request, option):
    '''
    Progresses the player's game in response to the given option
    '''

    # DIALOG
    try:
        option = DialogOption.objects.get(pk = option)
        return dialog(request, option.node_to)


    # HACKING
    except DialogOption.DoesNotExist as e:
        option = DialogHackOption.objects.get(pk = option)
        return hacking(request, option)
    