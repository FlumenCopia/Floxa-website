import uuid
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    use_in_migrations = True

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, username=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", User.Role.CONSULTANT)
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    class Role(models.TextChoices):
        CONSULTANT = "CONSULTANT", "Consultant"
        CLIENT = "CLIENT", "Client"
        TEAM_MEMBER = "TEAM_MEMBER", "Team member"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=50, blank=True)
    avatar_url = models.URLField(blank=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CLIENT)
    company_name = models.CharField(max_length=255, blank=True)
    portfolio_slug = models.SlugField(max_length=255, unique=True, null=True, blank=True)
    plan = models.CharField(max_length=50, default="free")
    plan_expires_at = models.DateTimeField(null=True, blank=True)
    brand_primary_color = models.CharField(max_length=20, default="#0A1912")
    brand_secondary_color = models.CharField(max_length=20, default="#1C342E")
    brand_accent_color = models.CharField(max_length=20, default="#89ACA0")
    brand_neon_color = models.CharField(max_length=20, default="#4DFFA0")
    client_portal_heading = models.CharField(
        max_length=255, default="Discover Your Brand Clarity."
    )
    email_notifications = models.BooleanField(default=True)
    whatsapp_notifications = models.BooleanField(default=False)
    auto_notify_on_action = models.BooleanField(default=True)
    last_active_at = models.DateTimeField(null=True, blank=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []
    objects = UserManager()

    def save(self, *args, **kwargs):
        self.username = self.email
        if not self.name:
            self.name = self.email.split("@")[0]
        super().save(*args, **kwargs)
