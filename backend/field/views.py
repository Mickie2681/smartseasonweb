from django.db.models import Count
from datetime import datetime, timedelta
from rest_framework import generics, permissions, status, viewsets
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied

from .models import User, Field, FieldUpdate
from .serializers import (
    UserSerializer, UserRegisterSerializer,
    FieldSerializer, FieldUpdateSerializer,
    DashboardStatsSerializer
)
from .permissions import IsAdmin, IsFieldAgent, IsAdminOrAssignedAgent


class CustomAuthToken(ObtainAuthToken):
    """Custom auth token endpoint that returns user info."""
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        })


class RegisterView(generics.CreateAPIView):
    """Register new users (admins only for assigning roles)."""
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        role = request.data.get('role', 'agent')
        if request.user.role != 'admin' and role == 'admin':
            return Response(
                {'error': 'Only admins can create admin users.'},
                status=status.HTTP_403_FORBIDDEN
            )
        response = super().create(request, *args, **kwargs)
        # Generate token for the new user
        user = User.objects.get(username=response.data['username'])
        token, created = Token.objects.get_or_create(user=user)
        response.data['token'] = token.key
        return response


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Get or update current user profile."""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class FieldViewSet(viewsets.ModelViewSet):
    """CRUD for Field model with role-based access."""
    serializer_class = FieldSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrAssignedAgent]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Field.objects.all().prefetch_related('assigned_agent')
        return Field.objects.filter(assigned_agent=user).prefetch_related('assigned_agent')


class FieldUpdateView(generics.CreateAPIView):
    """Field agents submit updates."""
    serializer_class = FieldUpdateSerializer
    permission_classes = [permissions.IsAuthenticated, IsFieldAgent]

    def perform_create(self, serializer):
        field = serializer.validated_data.get('field')
        if field.assigned_agent != self.request.user:
            raise PermissionDenied('You can only update fields assigned to you.')
        stage = serializer.validated_data.get('stage')
        update = serializer.save(agent=self.request.user)
        field.current_stage = stage
        field.save()


class FieldUpdateHistoryView(generics.ListAPIView):
    """View update history for a specific field."""
    serializer_class = FieldUpdateSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrAssignedAgent]

    def get_queryset(self):
        field_id = self.kwargs.get('field_id')
        user = self.request.user
        field = Field.objects.get(id=field_id)
        if user.role != 'admin' and field.assigned_agent != user:
            return FieldUpdate.objects.none()
        return FieldUpdate.objects.filter(field_id=field_id).select_related('agent')


class DashboardStatsView(generics.RetrieveAPIView):
    """Get dashboard statistics."""
    serializer_class = DashboardStatsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        user_role = user.role

        if user_role == 'admin':
            fields = Field.objects.all()
        else:
            fields = Field.objects.filter(assigned_agent=user)

        total_fields = fields.count()

        stage_counts = dict(
            fields.values('current_stage')
            .annotate(count=Count('id'))
            .values_list('current_stage', 'count')
        )

        status_counts = {'active': 0, 'at_risk': 0, 'completed': 0}
        for field in fields:
            status = field.status
            status_counts[status] = status_counts.get(status, 0) + 1

        crop_counts = dict(
            fields.values('crop_type')
            .annotate(count=Count('id'))
            .values_list('crop_type', 'count')
        )

        last_week = datetime.now() - timedelta(days=7)
        recent_updates = FieldUpdate.objects.filter(
            field__in=fields,
            created_at__gte=last_week
        ).select_related('agent', 'field')[:10]

        data = {
            'total_fields': total_fields,
            'by_stage': stage_counts,
            'by_status': status_counts,
            'by_crop': crop_counts,
            'recent_updates': FieldUpdateSerializer(recent_updates, many=True).data,
        }

        serializer = self.get_serializer(data)
        return Response(serializer.data)


class UserListView(generics.ListAPIView):
    """List all users (admin only)."""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
