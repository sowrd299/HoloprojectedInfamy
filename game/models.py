from django.db import models


# HACKING

class HackingMap(models.Model):
    '''
    An entire hacking encounter
    '''

    short_name = models.SlugField(primary_key=True)
    name = models.CharField(max_length = 64)

    def __str__(self):
        return self.name


class HackingNode(models.Model):
    '''
    A single node on a hacking map
    '''

    short_name = models.SlugField(primary_key=True)
    name = models.CharField(max_length = 64)

    map_in = models.ForeignKey(HackingMap, on_delete=models.CASCADE)
    x_pos = models.IntegerField()
    y_pos = models.IntegerField()

    text = models.TextField(blank = True)
    flavor_text = models.TextField(blank = True)

    is_secret = models.BooleanField(default=False)
    is_player_start = models.BooleanField(default=False)
    is_enemy_start = models.BooleanField(default=True)

    protection_level = models.IntegerField()    
    alert_level = models.IntegerField()

    def __str__(self):
        return "{} ({})".format(self.name, self.map_in)

    def hackinglinkset(self):
        return self.linksfromset.union(self.linkstoset)


class HackingLink(models.Model):
    '''
    A link between two hacking nodes that a player
    or phantom can travel along
    '''
    node_from = models.ForeignKey(HackingNode, related_name = "linksfromset", on_delete=models.CASCADE)
    node_to = models.ForeignKey(HackingNode, related_name = "linkstoset", on_delete=models.CASCADE)

    def __str__(self):
        return "{} to {}".format(self.node_from.name, self.node_to.name)


class HackingTool(models.Model):
    '''
    A tool the player can have and use for hacking
    '''

    short_name = models.SlugField(primary_key=True)
    name = models.CharField(max_length = 64)

    text = models.TextField(blank = True)
    flavor_text = models.TextField(blank = True)

    cost = models.IntegerField()
    attack_level = models.IntegerField()
    alert_level = models.IntegerField()

    def __str__(self):
        return self.name


class HackingToolPickup(models.Model):
    '''
    Represents an opportunity to pick up a tool at a hacking node
    '''

    node = models.ForeignKey(HackingNode, on_delete=models.CASCADE)
    tool = models.ForeignKey(HackingTool, on_delete=models.CASCADE)

    # for future use maybe:
    requirement = models.IntegerField(default=0)

    def __str__(self):
        return "{} at {}".format(self.tool, self.node)


class HackingToolSpeciality(models.Model):
    '''
    Represents a tool that is very good at breaking a specific node
    '''

    node = models.ForeignKey(HackingNode, on_delete=models.CASCADE)
    tool = models.ForeignKey(HackingTool, on_delete=models.CASCADE)

    # the specialized powered-up version of the tool
    tool_becomes = models.ForeignKey(HackingTool, related_name="speciality_of", on_delete=models.CASCADE)

    def __str__(self):
        return "{} vs. {}".format(self.tool, self.node)


# DIALOG


class DialogNode(models.Model):
    '''
    A class for something said to the player in a dialog tree
    '''
    short_name = models.CharField(max_length = 64, primary_key = True)
    title = models.CharField(max_length = 128, blank = True)
    speaker = models.CharField(max_length = 128, blank = True)
    text = models.TextField(blank = True)

    def __str__(self):
        return self.short_name


class DialogAutoNode(DialogNode):
	'''
	A class of Dialog Node that automatically advances without showing anything
	'''
	def __str__(self):
		return DialogNode.__str__(self) + " (Auto)"


class DialogOption(models.Model):
    '''
    A class for something the player says or does in a dialog tree
    '''
    short_name = models.CharField(max_length = 64, primary_key = True)

    node_from = models.ForeignKey(DialogNode, related_name="options", on_delete = models.CASCADE)
    node_to = models.ForeignKey(DialogNode, on_delete = models.CASCADE)

    text = models.TextField(blank = True)
    restriction = models.TextField(blank = True)

    def __str__(self):
        return "{} ({})".format(self.short_name, self.node_from)


class DialogHackOption(models.Model):
    '''
    A class to represent a node at which one enters a hack
    '''
    short_name = models.CharField(max_length = 64, primary_key = True)

    node_from = models.ForeignKey(DialogNode, related_name="hack_options", on_delete = models.CASCADE)
    node_to = models.ForeignKey(HackingNode, on_delete = models.CASCADE)

    text = models.TextField(blank = True)
    restriction = models.TextField(blank = True)

    def __str__(self):
        return "{} (Hacking)".format(self.node_to)


class DialogHackExitOption(models.Model):
	'''
	A class to represent the dialog node at which one exits a hack
	'''

	option_from = models.ForeignKey(DialogHackOption, related_name="exit_options", on_delete = models.CASCADE)
	node_to = models.ForeignKey(DialogNode, on_delete = models.CASCADE)

	caught = models.BooleanField() # TODO: Not in use
	restriction = models.TextField(blank = True)

	def __str__(self):
		return "{} to {}".format(self.option_from, self.node_to)