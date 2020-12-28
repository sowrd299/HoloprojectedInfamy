from django.db import models


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
        return self.name

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
