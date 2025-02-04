from django.db import models
from django.conf import settings
from django.db.models import F, ExpressionWrapper, FloatField
from math import cos, radians

# Create your models here.

class RestPlace(models.Model):
    PLACE_TYPES = (
        ('hotel', 'Hotel'),
        ('motel', 'Motel'),
        ('rest_stop', 'Rest Stop'),
    )

    name = models.CharField(max_length=255)
    place_type = models.CharField(max_length=20, choices=PLACE_TYPES)
    description = models.TextField()
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    address = models.TextField()
    city = models.CharField(max_length=100, default='Bangalore')
    state = models.CharField(max_length=100, default='Karnataka')
    country = models.CharField(max_length=100, default='India')
    price_range = models.CharField(max_length=50)  # e.g., "$", "$$", "$$$"
    contact_number = models.CharField(max_length=15)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.get_place_type_display()})"

    @staticmethod
    def get_nearby_places(latitude, longitude, radius_km=10):
        """
        Find places within a given radius (in kilometers) of a point.
        Uses a rough approximation for performance, suitable for small distances.
        """
        # Convert radius from kilometers to degrees (rough approximation)
        lat_radius = radius_km / 111.0  # 1 degree latitude = ~111 km
        # Adjust longitude radius based on latitude (circumference varies with latitude)
        lon_radius = radius_km / (111.0 * cos(radians(float(latitude))))

        nearby_places = RestPlace.objects.filter(
            latitude__range=(float(latitude) - lat_radius, float(latitude) + lat_radius),
            longitude__range=(float(longitude) - lon_radius, float(longitude) + lon_radius),
        ).annotate(
            distance=ExpressionWrapper(
                (F('latitude') - float(latitude)) * (F('latitude') - float(latitude)) +
                (F('longitude') - float(longitude)) * (F('longitude') - float(longitude)),
                output_field=FloatField()
            )
        ).order_by('distance')

        return nearby_places

class Amenity(models.Model):
    name = models.CharField(max_length=100)
    icon = models.CharField(max_length=50)  # FontAwesome icon name
    rest_places = models.ManyToManyField(RestPlace, related_name='amenities')

    def __str__(self):
        return self.name

class Booking(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    rest_place = models.ForeignKey(RestPlace, on_delete=models.CASCADE)
    check_in = models.DateTimeField()
    check_out = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.rest_place.name} ({self.status})"
