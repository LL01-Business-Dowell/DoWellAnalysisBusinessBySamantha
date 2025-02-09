import os
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
import json
from .helper import *
from dotenv import load_dotenv
from .serializers import *
import datetime
from threading import Thread
load_dotenv()

API_KEY = str(os.getenv("API_KEY"))


@method_decorator(csrf_exempt, name='dispatch')
class serviceInfo(APIView):
    def get(self, request):
        return Response({
            "success": True,
            "message": "API Server Running..."
        }, status=status.HTTP_200_OK)
    
@method_decorator(csrf_exempt, name='dispatch')
class businessAnalysisBySamanta(APIView):
    def post(self, request):
        type = request.GET.get('type')
        if type == 'analysis':
            return self.analysis(request)
        else:
            return self.handle_error(request)
        
    def analysis(self, request):
        email = request.data.get('email')
        occurrences = request.data.get('occurrences')
        google_link = request.data.get('google_link')
        website = request.data.get('website', None)

        occurrences = int(occurrences)

        serializer = AnalysisSerializer(data={"email": email, "occurrences": occurrences, "google_link": google_link, "website": website})
        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Posting wrong data to API",
                "error": serializer.errors,
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # experience_database_service_response = json.loads(experience_database_services(email, occurrences))
        # if not experience_database_service_response.get("success"):
        #     return Response({
        #         "success": False,
        #         "message": experience_database_service_response.get("message", "Content could not be evaluated")
        #     }, status=status.HTTP_400_BAD_REQUEST)
        
        occurrences += 1
        map_data = get_google_maps_details(google_link)

        if not map_data.get("success"):
            return Response({
                "success": False,
                "message": map_data.get("message", "Content could not be evaluated")
            }, status=status.HTTP_400_BAD_REQUEST)
        
        business_data = map_data["data"]

        try:
            swot_text = new_gemini(
                API_KEY,
                f"in depth SWOT analysis of {business_data['Name']} {business_data['Address']}"
            )
            
            if not swot_text:
                return Response({
                    "success": False,
                    "message": "Failed to retrieve SWOT analysis results"
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Parse and format the text
            # formatted_response = format_swot_response(swot_text)

            return Response({
                "success": True,
                "message": "Data retrieved successfully",
                "response": {
                    "business_data":business_data,
                    "swot_analysis": swot_text
                }
            })
        except Exception as e:
            return Response({
                "success": False,
                "message": "Failed to retrieve SWOT analysis results",
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # result = {
        #     "url": map_data["URL"],
        #     "name": map_data["Name"],
        #     "address": map_data["Address"],
        #     "phone": map_data["Phone"],
        #     "rating": map_data["Rating"],
        #     "reviews": map_data["Reviews"],
        #     "plus_code": map_data["Plus Code"],
        #     "website": map_data["Website"],
        #     "latitude": map_data["Latitude"],
        #     "longitude": map_data["Longitude"]
        # }

        
        
    def handle_error(self, request): 
        return Response({
            "success": False,
            "message": "Invalid request type"
        }, status=status.HTTP_400_BAD_REQUEST)