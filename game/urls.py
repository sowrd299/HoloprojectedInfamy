from django.urls import path

from . import views

app_name = "game"

urlpatterns = [
    path('', views.home, name='index'),
    path('home', views.home, name='home'), # home will start the game anew
	path('hack_exit/<str:hack_option>', views.hack_exit, name='hack_exit'), # for when a hack is done
    path('option/<str:option>', views.game, name='option'), # how options are submitted
]