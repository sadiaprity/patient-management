from django.contrib.auth.base_user import BaseUserManager


class UserManager(BaseUserManager):
    def create_user(self, mobile, password=None, **extra_fields):
        """Create a user identified by mobile with a securely stored password."""
        if not mobile:
            raise ValueError("A mobile number is required.")

        user = self.model(mobile=mobile, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, mobile, password=None, **extra_fields):
        """Create a user with the staff and superuser privileges enabled."""
        if not password:
            raise ValueError("Superuser must have a password")
    
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("A superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("A superuser must have is_superuser=True.")

        return self.create_user(mobile, password, **extra_fields)