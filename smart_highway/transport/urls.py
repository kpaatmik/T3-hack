from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'providers', views.TransportProviderViewSet)
router.register(r'routes', views.RouteViewSet)
router.register(r'schedules', views.ScheduleViewSet)
router.register(r'bookings', views.TransportBookingViewSet, basename='transport-booking')

urlpatterns = [
    path('', include(router.urls)),
]
