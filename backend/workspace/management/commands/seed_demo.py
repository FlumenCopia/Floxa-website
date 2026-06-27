from django.core.management.base import BaseCommand
from accounts.models import User


class Command(BaseCommand):
    help = "Create the FLOXA demo consultant account."

    def handle(self, *args, **options):
        user, created = User.objects.get_or_create(
            email="consultant@flumenx.com",
            defaults={
                "name": "FlumenX Consultant",
                "company_name": "FlumenX",
                "role": User.Role.CONSULTANT,
                "portfolio_slug": "flumenx",
            },
        )
        user.set_password("floxa2026")
        user.save()
        self.stdout.write(
            self.style.SUCCESS(
                f"{'Created' if created else 'Updated'} consultant@flumenx.com"
            )
        )
