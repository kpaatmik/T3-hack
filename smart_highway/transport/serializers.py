from rest_framework import serializers
from .models import TransportProvider, Route, Schedule, TransportBooking

class TransportProviderSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransportProvider
        fields = '__all__'

class RouteSerializer(serializers.ModelSerializer):
    provider_name = serializers.CharField(source='provider.name', read_only=True)

    class Meta:
        model = Route
        fields = '__all__'

class ScheduleSerializer(serializers.ModelSerializer):
    route_details = RouteSerializer(source='route', read_only=True)

    class Meta:
        model = Schedule
        fields = '__all__'

class TransportBookingSerializer(serializers.ModelSerializer):
    schedule_details = ScheduleSerializer(source='schedule', read_only=True)
    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = TransportBooking
        fields = '__all__'
        read_only_fields = ('user', 'status', 'credits_used', 'created_at', 'updated_at')
