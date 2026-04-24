from rest_framework import serializers
from .models import User, Field, FieldUpdate


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role']


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'role']

    def create(self, validated_data):
        password = validated_data.pop('password')
        role = validated_data.get('role', 'agent')
        extra_fields = {}
        if role == 'admin':
            extra_fields['is_staff'] = True
            extra_fields['is_superuser'] = True
        user = User.objects.create_user(password=password, **validated_data, **extra_fields)
        return user


class FieldSerializer(serializers.ModelSerializer):
    assigned_agent = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), required=False, allow_null=True
    )
    agent_name = serializers.SerializerMethodField()
    status = serializers.CharField(read_only=True)
    days_since_planting = serializers.IntegerField(read_only=True)

    class Meta:
        model = Field
        fields = [
            'id', 'name', 'crop_type', 'planting_date', 'current_stage',
            'status', 'assigned_agent', 'agent_name', 'days_since_planting',
            'environmental_conditions', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_agent_name(self, obj):
        if obj.assigned_agent:
            return f"{obj.assigned_agent.first_name} {obj.assigned_agent.last_name}".strip()
        return 'Unassigned'


class FieldUpdateSerializer(serializers.ModelSerializer):
    agent_name = serializers.CharField(source='agent.get_full_name', read_only=True)
    field_name = serializers.CharField(source='field.name', read_only=True)

    class Meta:
        model = FieldUpdate
        fields = ['id', 'field', 'agent', 'stage', 'notes', 'created_at', 'agent_name', 'field_name']
        read_only_fields = ['agent', 'created_at']

    def create(self, validated_data):
        validated_data['agent'] = self.context['request'].user
        return super().create(validated_data)


class DashboardStatsSerializer(serializers.Serializer):
    total_fields = serializers.IntegerField()
    by_stage = serializers.DictField(child=serializers.IntegerField())
    by_status = serializers.DictField(child=serializers.IntegerField())
    by_crop = serializers.DictField(child=serializers.IntegerField())
    recent_updates = FieldUpdateSerializer(many=True, read_only=True)
