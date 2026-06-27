from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User


class UserSerializer(serializers.ModelSerializer):
    avatarUrl = serializers.CharField(source="avatar_url", allow_blank=True)
    companyName = serializers.CharField(source="company_name", allow_blank=True)
    portfolioSlug = serializers.CharField(source="portfolio_slug", allow_null=True)
    brandPrimaryColor = serializers.CharField(source="brand_primary_color")
    brandSecondaryColor = serializers.CharField(source="brand_secondary_color")
    brandAccentColor = serializers.CharField(source="brand_accent_color")
    brandNeonColor = serializers.CharField(source="brand_neon_color")
    clientPortalHeading = serializers.CharField(source="client_portal_heading")
    emailNotifications = serializers.BooleanField(source="email_notifications")
    whatsappNotifications = serializers.BooleanField(source="whatsapp_notifications")
    autoNotifyOnAction = serializers.BooleanField(source="auto_notify_on_action")
    createdAt = serializers.DateTimeField(source="date_joined", read_only=True)

    class Meta:
        model = User
        fields = (
            "id", "email", "name", "phone", "avatarUrl", "role", "companyName",
            "portfolioSlug", "plan", "brandPrimaryColor", "brandSecondaryColor",
            "brandAccentColor", "brandNeonColor", "clientPortalHeading",
            "emailNotifications", "whatsappNotifications", "autoNotifyOnAction",
            "createdAt",
        )


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ("email", "password", "name", "phone", "company_name")

    def create(self, validated_data):
        return User.objects.create_user(
            **validated_data,
            role=User.Role.CONSULTANT,
        )
