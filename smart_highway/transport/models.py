from django.db import models
from django.conf import settings

# Create your models here.

class TransportProvider(models.Model):
    PROVIDER_TYPES = (
        ('bus', 'Bus'),
        ('metro', 'Metro'),
        ('train', 'Train'),
    )

    name = models.CharField(max_length=255)
    provider_type = models.CharField(max_length=20, choices=PROVIDER_TYPES)
    description = models.TextField()
    contact_number = models.CharField(max_length=15)
    website = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.get_provider_type_display()})"

class Route(models.Model):
    provider = models.ForeignKey(TransportProvider, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    source = models.CharField(max_length=255)
    destination = models.CharField(max_length=255)
    distance = models.DecimalField(max_digits=10, decimal_places=2)  # in kilometers
    duration = models.DurationField()  # expected journey time
    fare = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name}: {self.source} to {self.destination}"

class Schedule(models.Model):
    route = models.ForeignKey(Route, on_delete=models.CASCADE)
    departure_time = models.TimeField()
    arrival_time = models.TimeField()
    days_of_week = models.CharField(max_length=100)  # e.g., "1,2,3,4,5" for weekdays
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.route.name} - {self.departure_time}"

class TransportBooking(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    schedule = models.ForeignKey(Schedule, on_delete=models.CASCADE)
    booking_date = models.DateField()
    num_passengers = models.PositiveIntegerField(default=1)
    total_fare = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    credits_used = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.schedule.route.name} ({self.status})"
