from rest_framework import serializers

class BusinessDetailsSerializer(serializers.Serializer):
    google_link = serializers.URLField(allow_null=False, allow_blank=False)
    website = serializers.URLField(allow_null=True, allow_blank=True)

class AnalysisSerializer(serializers.Serializer):
    email = serializers.EmailField(allow_null=False, allow_blank=False)
    occurrences = serializers.IntegerField(allow_null=False)
    name = serializers.CharField(max_length=200, allow_null=False, allow_blank=False)
    address = serializers.CharField( allow_null=False, allow_blank=False)
    url = serializers.URLField(allow_null=True, allow_blank=True, required=False)
    phone = serializers.CharField(max_length=20, allow_null=True, allow_blank=True, required=False)
    rating = serializers.FloatField(allow_null=True, required=False)
    reviews = serializers.IntegerField(allow_null=True, required=False)
    plus_code = serializers.CharField(max_length=50, allow_null=True, allow_blank=True, required=False)
    website = serializers.URLField(allow_null=True, allow_blank=True, required=False)
    latitude = serializers.FloatField(allow_null=True, required=False)
    longitude = serializers.FloatField(allow_null=True, required=False)

class LinkedinSerializer(serializers.Serializer):
    email = serializers.EmailField(allow_null=False, allow_blank=False)
    occurrences = serializers.IntegerField(allow_null=False)
    linkedin_link = website = serializers.URLField(allow_null=False, allow_blank=False, required=True)
