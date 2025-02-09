from rest_framework import serializers

class AnalysisSerializer(serializers.Serializer):
    email = serializers.EmailField(allow_null=False, allow_blank=False)
    occurrences = serializers.IntegerField(min_value=1, max_value=1000)
    google_link = serializers.URLField(allow_null=False, allow_blank=False)
    website = serializers.URLField(allow_null=True, allow_blank=True)
    