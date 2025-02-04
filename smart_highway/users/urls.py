from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('credits/', views.UserCreditsView.as_view(), name='credits'),
]
