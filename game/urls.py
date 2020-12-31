from django.urls import path

from . import views

app_name = "game"

urlpatterns = [
    path('', views.home, name='index'),
    path('home', views.home, name='home'),
    path('option/<str:option>', views.game, name='option'), # a manual way of submitting options, mostly for testing
]