from django.shortcuts import render
from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import rest_framework as django_filters
from .models import RestPlace, Amenity, Booking
from .serializers import RestPlaceSerializer, AmenitySerializer, BookingSerializer
from django.db.models import Q

class RestPlaceFilter(django_filters.FilterSet):
    min_price = django_filters.CharFilter(method='filter_min_price')
    max_price = django_filters.CharFilter(method='filter_max_price')
    city = django_filters.CharFilter(lookup_expr='icontains')
    state = django_filters.CharFilter(lookup_expr='icontains')
    search = django_filters.CharFilter(method='filter_search')
    amenities = django_filters.ModelMultipleChoiceFilter(
        field_name='amenities__id',
        to_field_name='id',
        queryset=Amenity.objects.all(),
        conjoined=True  # All specified amenities must be present
    )

    def filter_min_price(self, queryset, name, value):
        price_map = {'$': 1, '$$': 2, '$$$': 3}
        if value in price_map:
            return queryset.filter(price_range__regex=f'\\${{{price_map[value],}}}')
        return queryset

    def filter_max_price(self, queryset, name, value):
        price_map = {'$': 1, '$$': 2, '$$$': 3}
        if value in price_map:
            return queryset.filter(price_range__regex=f'\\${{{1,price_map[value]}}}')
        return queryset

    def filter_search(self, queryset, name, value):
        if not value:
            return queryset
        
        # Split search terms and create Q objects for each term
        terms = value.split()
        query = Q()
        for term in terms:
            query |= (
                Q(name__icontains=term) |
                Q(description__icontains=term) |
                Q(address__icontains=term) |
                Q(city__icontains=term) |
                Q(state__icontains=term) |
                Q(amenities__name__icontains=term)
            )
        return queryset.filter(query).distinct()

    class Meta:
        model = RestPlace
        fields = {
            'place_type': ['exact'],
            'is_available': ['exact'],
            'city': ['icontains'],
            'state': ['icontains'],
            'price_range': ['exact'],
        }

class RestPlaceViewSet(viewsets.ModelViewSet):
    queryset = RestPlace.objects.all().prefetch_related('amenities')
    serializer_class = RestPlaceSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = RestPlaceFilter
    search_fields = ['name', 'description', 'address', 'city', 'state', 'amenities__name']
    ordering_fields = ['created_at', 'price_range']

    def get_queryset(self):
        """
        Optionally restricts the returned rest places by filtering against
        query parameters in the URL.
        """
        queryset = super().get_queryset()
        
        # Get query parameters
        search = self.request.query_params.get('search', None)
        city = self.request.query_params.get('city', None)
        state = self.request.query_params.get('state', None)
        place_type = self.request.query_params.get('place_type', None)
        price_range = self.request.query_params.get('price_range', None)

        # Apply filters
        if search:
            terms = search.split()
            query = Q()
            for term in terms:
                query |= (
                    Q(name__icontains=term) |
                    Q(description__icontains=term) |
                    Q(address__icontains=term) |
                    Q(city__icontains=term) |
                    Q(state__icontains=term) |
                    Q(amenities__name__icontains=term)
                )
            queryset = queryset.filter(query).distinct()

        if city:
            queryset = queryset.filter(city__icontains=city)
        if state:
            queryset = queryset.filter(state__icontains=state)
        if place_type:
            queryset = queryset.filter(place_type=place_type)
        if price_range:
            queryset = queryset.filter(price_range=price_range)

        return queryset

    @action(detail=True, methods=['post'])
    def book(self, request, pk=None):
        rest_place = self.get_object()
        if not rest_place.is_available:
            return Response({'error': 'This place is not available'}, status=400)
        
        serializer = BookingSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user, rest_place=rest_place)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    @action(detail=False, methods=['get'])
    def types(self, request):
        return Response(dict(RestPlace.PLACE_TYPES))

    @action(detail=False, methods=['get'])
    def nearby(self, request):
        """Get nearby rest places based on latitude and longitude."""
        try:
            latitude = float(request.query_params.get('latitude', 0))
            longitude = float(request.query_params.get('longitude', 0))
            radius = float(request.query_params.get('radius', 10))  # Default 10km radius
        except (TypeError, ValueError):
            return Response(
                {'error': 'Invalid coordinates or radius provided'},
                status=400
            )

        nearby_places = RestPlace.get_nearby_places(latitude, longitude, radius)
        serializer = self.get_serializer(nearby_places, many=True)
        return Response(serializer.data)

class AmenityViewSet(viewsets.ModelViewSet):
    queryset = Amenity.objects.all()
    serializer_class = AmenitySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status']
    ordering_fields = ['created_at', 'check_in', 'check_out']

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        booking = self.get_object()
        if booking.status != 'pending' and booking.status != 'confirmed':
            return Response({'error': 'Cannot cancel this booking'}, status=400)
        
        booking.status = 'cancelled'
        booking.save()
        return Response({'status': 'Booking cancelled'})
