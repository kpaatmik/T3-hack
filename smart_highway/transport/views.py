from django.shortcuts import render
from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import TransportProvider, Route, Schedule, TransportBooking
from .serializers import (
    TransportProviderSerializer, RouteSerializer,
    ScheduleSerializer, TransportBookingSerializer
)

# Create your views here.

class TransportProviderViewSet(viewsets.ModelViewSet):
    queryset = TransportProvider.objects.all()
    serializer_class = TransportProviderSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']

class RouteViewSet(viewsets.ModelViewSet):
    queryset = Route.objects.filter(is_active=True)
    serializer_class = RouteSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['provider', 'source', 'destination']
    search_fields = ['name', 'source', 'destination']

class ScheduleViewSet(viewsets.ModelViewSet):
    queryset = Schedule.objects.filter(is_active=True)
    serializer_class = ScheduleSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['route', 'days_of_week']

class TransportBookingViewSet(viewsets.ModelViewSet):
    serializer_class = TransportBookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return TransportBooking.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        schedule = serializer.validated_data['schedule']
        num_passengers = serializer.validated_data.get('num_passengers', 1)
        total_fare = schedule.route.fare * num_passengers
        
        # Check if user wants to use credits
        credits_to_use = min(
            self.request.user.credits,
            total_fare * 0.2  # Max 20% discount using credits
        )
        
        # Save booking with calculated values
        serializer.save(
            user=self.request.user,
            total_fare=total_fare,
            credits_used=credits_to_use
        )
        
        # Update user's credits
        if credits_to_use > 0:
            self.request.user.credits -= credits_to_use
            self.request.user.save()

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        booking = self.get_object()
        if booking.status != 'pending' and booking.status != 'confirmed':
            return Response(
                {'error': 'Cannot cancel this booking'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Refund credits if they were used
        if booking.credits_used > 0:
            request.user.credits += booking.credits_used
            request.user.save()
        
        booking.status = 'cancelled'
        booking.save()
        return Response({'status': 'Booking cancelled'})
