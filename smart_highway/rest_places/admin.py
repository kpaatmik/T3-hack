from django.contrib import admin
from .models import RestPlace, Amenity, Booking

# Register your models here.

@admin.register(RestPlace)
class RestPlaceAdmin(admin.ModelAdmin):
    list_display = ('name', 'place_type', 'price_range', 'is_available', 'created_at')
    list_filter = ('place_type', 'is_available')
    search_fields = ('name', 'description', 'address')
    date_hierarchy = 'created_at'

@admin.register(Amenity)
class AmenityAdmin(admin.ModelAdmin):
    list_display = ('name', 'icon')
    search_fields = ('name',)

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('user', 'rest_place', 'check_in', 'check_out', 'status', 'total_price')
    list_filter = ('status', 'created_at')
    search_fields = ('user__username', 'rest_place__name')
    date_hierarchy = 'created_at'
