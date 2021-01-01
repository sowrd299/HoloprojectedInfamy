from django.contrib import admin
from .models import *

# Register your models here.
admin.site.register(HackingMap)
admin.site.register(HackingNode)
admin.site.register(HackingLink)
admin.site.register(HackingTool)
admin.site.register(HackingToolPickup)
admin.site.register(HackingToolSpeciality)

admin.site.register(DialogNode)
admin.site.register(DialogOption)
admin.site.register(DialogHackOption)