from rest_framework import serializers
from .models import RestPlace, Amenity, Booking

class AmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Amenity
        fields = '__all__'

class RestPlaceSerializer(serializers.ModelSerializer):
    amenities = AmenitySerializer(many=True, read_only=True)

    class Meta:
        model = RestPlace
        fields = '__all__'

class BookingSerializer(serializers.ModelSerializer):
    rest_place_name = serializers.CharField(source='rest_place.name', read_only=True)
    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ('user', 'status', 'created_at', 'updated_at')
