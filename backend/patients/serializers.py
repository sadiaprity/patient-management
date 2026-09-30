from rest_framework import serializers

from .models import Patient, PatientVisit


class PatientSerializer(serializers.ModelSerializer):
    """Serialize patient records, including password handling and validation."""

    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Patient
        fields = (
            "id",
            "first_name",
            "last_name",
            "mobile",
            "age",
            "gender",
            "address",
            "blood_group",
            "total_visits",
            "last_visit_date",
            "password",
        )
        read_only_fields = ("total_visits", "last_visit_date")

    def validate_age(self, value):
        """Reject invalid ages, since a patient must be a positive age."""
        if value <= 0:
            raise serializers.ValidationError("Age must be greater than 0.")
        return value

    def create(self, validated_data):
        """Create a patient and hash the password before saving."""
        password = validated_data.pop("password", None)
        user = Patient(**validated_data)

        if password:
            user.set_password(password)

        user.save()
        return user

    def update(self, instance, validated_data):
        """Update a patient while only rehashing the password when one is supplied."""
        password = validated_data.pop("password", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()
        return instance


class VisitSerializer(serializers.ModelSerializer):
    """Serialize patient visit records."""

    class Meta:
        model = PatientVisit
        fields = ("id", "patient", "doctor_name", "visit_date", "clinical_note", "diagnosis")
