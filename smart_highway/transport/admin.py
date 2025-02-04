from django.contrib import admin
from .models import TransportProvider, Route, Schedule, TransportBooking

# Register your models here.

@admin.register(TransportProvider)
class TransportProviderAdmin(admin.ModelAdmin):
    list_display = ('name', 'provider_type', 'contact_number')
    list_filter = ('provider_type',)
    search_fields = ('name', 'description')

@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display = ('name', 'provider', 'source', 'destination', 'fare', 'is_active')
    list_filter = ('provider', 'is_active')
    search_fields = ('name', 'source', 'destination')

@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ('route', 'departure_time', 'arrival_time', 'days_of_week', 'is_active')
    list_filter = ('route', 'is_active')
    search_fields = ('route__name',)

@admin.register(TransportBooking)
class TransportBookingAdmin(admin.ModelAdmin):
    list_display = ('user', 'schedule', 'booking_date', 'status', 'total_fare')
    list_filter = ('status',)
    search_fields = ('user__username', 'schedule__route__name')
