from django.contrib import admin
from .models import *

# Register your models here.
admin.site.register(HackingMap)
admin.site.register(HackingNode)
admin.site.register(HackingLink)
admin.site.register(HackingTool)