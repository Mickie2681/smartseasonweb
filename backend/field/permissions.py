from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """Allows access only to admin users."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


class IsFieldAgent(permissions.BasePermission):
    """Allows access only to field agent users."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'agent'


class IsAdminOrReadOnly(permissions.BasePermission):
    """Allows full access to admins, read-only to others."""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        return request.user.is_authenticated and request.user.role == 'admin'


class IsAdminOrAssignedAgent(permissions.BasePermission):
    """Allows access to admin or the agent assigned to the field."""

    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True
        if hasattr(obj, 'assigned_agent'):
            return obj.assigned_agent == request.user
        if hasattr(obj, 'field'):
            return obj.field.assigned_agent == request.user
        return False
