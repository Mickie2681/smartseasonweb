from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models import JSONField


class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('agent', 'Field Agent'),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='agent')

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"


class Field(models.Model):
    CROP_CHOICES = [
        ('corn', 'Corn'),
        ('wheat', 'Wheat'),
        ('soybeans', 'Soybeans'),
        ('rice', 'Rice'),
        ('cotton', 'Cotton'),
        ('barley', 'Barley'),
        ('oats', 'Oats'),
        ('potatoes', 'Potatoes'),
        ('tomatoes', 'Tomatoes'),
        ('other', 'Other'),
    ]

    name = models.CharField(max_length=200)
    crop_type = models.CharField(max_length=50, choices=CROP_CHOICES)
    planting_date = models.DateField()
    current_stage = models.CharField(
        max_length=20,
        choices=[
            ('planted', 'Planted'),
            ('growing', 'Growing'),
            ('ready', 'Ready'),
            ('harvested', 'Harvested'),
        ],
        default='planted'
    )
    assigned_agent = models.ForeignKey(
        'User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_fields'
    )
    environmental_conditions = JSONField(
        default=list,
        blank=True,
        help_text="List of environmental conditions: stress, drought, pest, disease, damage, wilting, none"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.get_crop_type_display()}"

    @property
    def status(self):
        """Compute field status based on stage and updates."""
        latest_update = self.updates.order_by('-created_at').first()

        if self.current_stage == 'harvested':
            return 'completed'

        # Check environmental conditions - if any condition other than 'none' is selected, mark as at_risk
        if self.environmental_conditions and isinstance(self.environmental_conditions, list):
            risk_conditions = [c for c in self.environmental_conditions if c and c.lower() != 'none']
            if risk_conditions:
                return 'at_risk'

        if latest_update and latest_update.notes:
            notes_lower = latest_update.notes.lower()
            if any(keyword in notes_lower for keyword in ['stress', 'drought', 'pest', 'disease', 'damage', 'wilting']):
                return 'at_risk'

        if self.current_stage == 'planted' and self.days_since_planting > 30:
            return 'at_risk'

        return 'active'

    @property
    def days_since_planting(self):
        from datetime import date
        return (date.today() - self.planting_date).days


class FieldUpdate(models.Model):
    field = models.ForeignKey(Field, on_delete=models.CASCADE, related_name='updates')
    agent = models.ForeignKey('User', on_delete=models.CASCADE)
    stage = models.CharField(
        max_length=20,
        choices=[
            ('planted', 'Planted'),
            ('growing', 'Growing'),
            ('ready', 'Ready'),
            ('harvested', 'Harvested'),
        ]
    )
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Update for {self.field.name} by {self.agent.username} - {self.stage}"
