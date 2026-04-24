from django.contrib import admin
from .models import User, Field, FieldUpdate


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_active')
    search_fields = ('username', 'email', 'first_name', 'last_name')


@admin.register(Field)
class FieldAdmin(admin.ModelAdmin):
    list_display = ('name', 'crop_type', 'current_stage', 'status', 'assigned_agent', 'planting_date')
    list_filter = ('crop_type', 'current_stage', 'assigned_agent')
    search_fields = ('name',)
    readonly_fields = ('created_at', 'updated_at')


@admin.register(FieldUpdate)
class FieldUpdateAdmin(admin.ModelAdmin):
    list_display = ('field', 'agent', 'stage', 'created_at')
    list_filter = ('stage', 'agent', 'field')
    search_fields = ('field__name', 'agent__username', 'notes')
    readonly_fields = ('created_at',)
