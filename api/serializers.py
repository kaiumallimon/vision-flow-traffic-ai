from rest_framework import serializers


class UserRegisterSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class SocialAuthSerializer(serializers.Serializer):
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    google_id = serializers.CharField()


class DetectionSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    objectName = serializers.CharField()
    advice = serializers.CharField()
    imagePath = serializers.CharField()
    heatmapPath = serializers.CharField()
    createdAt = serializers.DateTimeField(read_only=True)


class UserProfileSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    firstName = serializers.CharField()
    lastName = serializers.CharField()
    email = serializers.EmailField()
    createdAt = serializers.DateTimeField(read_only=True)
    totalDetections = serializers.IntegerField(read_only=True)


class UpdateProfileSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=100, required=False)
    last_name = serializers.CharField(max_length=100, required=False)
    password = serializers.CharField(write_only=True, required=False)
