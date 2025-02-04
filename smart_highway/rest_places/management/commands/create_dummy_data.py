from django.core.management.base import BaseCommand
from rest_places.models import RestPlace, Amenity
from decimal import Decimal

class Command(BaseCommand):
    help = 'Creates dummy data for rest places and amenities'

    def handle(self, *args, **kwargs):
        # Create amenities
        amenities_data = [
            {'name': 'WiFi', 'icon': 'wifi'},
            {'name': 'Parking', 'icon': 'parking'},
            {'name': 'Restaurant', 'icon': 'utensils'},
            {'name': 'AC', 'icon': 'snowflake'},
            {'name': '24/7 Service', 'icon': 'clock'},
            {'name': 'Security', 'icon': 'shield-alt'},
            {'name': 'Swimming Pool', 'icon': 'swimming-pool'},
            {'name': 'Gym', 'icon': 'dumbbell'},
            {'name': 'Spa', 'icon': 'spa'},
        ]

        amenities = []
        for amenity_data in amenities_data:
            amenity, created = Amenity.objects.get_or_create(
                name=amenity_data['name'],
                defaults={'icon': amenity_data['icon']}
            )
            amenities.append(amenity)
            if created:
                self.stdout.write(f'Created amenity: {amenity.name}')

        # Create rest places
        rest_places_data = [
            {
                'name': 'Highway Haven Hotel',
                'place_type': 'hotel',
                'description': 'Luxurious hotel with modern amenities and excellent service.',
                'latitude': Decimal('12.971598'),
                'longitude': Decimal('77.594562'),
                'address': '123 Highway Road, Koramangala',
                'city': 'Bangalore',
                'state': 'Karnataka',
                'price_range': '$$$',
                'contact_number': '+91-9876543210',
                'amenities': ['WiFi', 'Parking', 'Restaurant', 'AC', 'Swimming Pool', 'Gym'],
            },
            {
                'name': 'Roadside Rest Stop',
                'place_type': 'rest_stop',
                'description': 'Convenient rest stop with basic facilities.',
                'latitude': Decimal('12.982345'),
                'longitude': Decimal('77.603421'),
                'address': '456 Highway Junction, Indiranagar',
                'city': 'Bangalore',
                'state': 'Karnataka',
                'price_range': '$',
                'contact_number': '+91-9876543211',
                'amenities': ['Parking', 'Restaurant', '24/7 Service'],
            },
            {
                'name': 'Highway Comfort Inn',
                'place_type': 'motel',
                'description': 'Comfortable motel perfect for short stays.',
                'latitude': Decimal('13.025678'),
                'longitude': Decimal('77.612345'),
                'address': '789 Highway Bypass, Whitefield',
                'city': 'Bangalore',
                'state': 'Karnataka',
                'price_range': '$$',
                'contact_number': '+91-9876543212',
                'amenities': ['WiFi', 'Parking', 'AC', '24/7 Service'],
            },
            {
                'name': 'Royal Highway Resort',
                'place_type': 'hotel',
                'description': 'Premium resort with extensive facilities.',
                'latitude': Decimal('13.001234'),
                'longitude': Decimal('77.623456'),
                'address': '321 Highway Circle, Electronic City',
                'city': 'Bangalore',
                'state': 'Karnataka',
                'price_range': '$$$',
                'contact_number': '+91-9876543213',
                'amenities': ['WiFi', 'Parking', 'Restaurant', 'AC', '24/7 Service', 'Security', 'Swimming Pool', 'Spa'],
            },
            {
                'name': 'Highway Quick Stop',
                'place_type': 'rest_stop',
                'description': 'Quick and convenient rest area.',
                'latitude': Decimal('12.912345'),
                'longitude': Decimal('77.634567'),
                'address': '654 Highway Link, HSR Layout',
                'city': 'Bangalore',
                'state': 'Karnataka',
                'price_range': '$',
                'contact_number': '+91-9876543214',
                'amenities': ['Parking', 'Restaurant', '24/7 Service'],
            },
            {
                'name': 'Mysore Grand Hotel',
                'place_type': 'hotel',
                'description': 'Luxury hotel in the heart of Mysore.',
                'latitude': Decimal('12.295810'),
                'longitude': Decimal('76.639381'),
                'address': '123 Palace Road',
                'city': 'Mysore',
                'state': 'Karnataka',
                'price_range': '$$$',
                'contact_number': '+91-9876543215',
                'amenities': ['WiFi', 'Parking', 'Restaurant', 'AC', 'Swimming Pool', 'Spa'],
            },
            {
                'name': 'Mangalore Beach Resort',
                'place_type': 'hotel',
                'description': 'Beautiful beachside resort with ocean views.',
                'latitude': Decimal('12.874847'),
                'longitude': Decimal('74.842432'),
                'address': '789 Beach Road',
                'city': 'Mangalore',
                'state': 'Karnataka',
                'price_range': '$$$',
                'contact_number': '+91-9876543216',
                'amenities': ['WiFi', 'Parking', 'Restaurant', 'AC', 'Swimming Pool', 'Spa', 'Security'],
            },
        ]

        for place_data in rest_places_data:
            amenity_names = place_data.pop('amenities')
            place, created = RestPlace.objects.get_or_create(
                name=place_data['name'],
                defaults=place_data
            )
            
            if created:
                place_amenities = Amenity.objects.filter(name__in=amenity_names)
                place.amenities.set(place_amenities)
                self.stdout.write(f'Created rest place: {place.name}')
            else:
                self.stdout.write(f'Rest place already exists: {place.name}')
