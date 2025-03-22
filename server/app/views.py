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
        if type == 'business_info':
            return self.businessInfo(request)
        elif type == 'sowt_analysis_report':
            return self.sowt_analysis_report(request)
        elif type == 'linkedin_analysis_report':
            return self.linkedin_analysis_report(request)
        else:
            return self.handle_error(request)
        
    def businessInfo(self, request):
        google_link = request.data.get('google_link')
        website = request.data.get('website', None)

        serializer = BusinessDetailsSerializer(data={"google_link": google_link, "website": website})
        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Posting wrong data to API",
                "error": serializer.errors,
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
        
            business_data = get_google_maps_details(google_link)

            if not business_data.get("success"):
                return Response({
                    "success": False,
                    "message": business_data.get("message", "Content could not be evaluated")
                }, status=status.HTTP_400_BAD_REQUEST)
        
            map_data = business_data["data"]
            result = {
                "url": map_data["URL"],
                "name": map_data["Name"],
                "address": map_data["Address"],
                "phone": map_data["Phone"],
                "rating": map_data["Rating"],
                "reviews": map_data["Reviews"],
                "plus_code": map_data["Plus Code"],
                "website": map_data["Website"],
                "latitude": map_data["Latitude"],
                "longitude": map_data["Longitude"]
            }

            return Response({
                "success": True,
                "message": "Business Info fetched successfully",
                "response": result
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "success": False,
                "message": f"Error fetching business info: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

    def sowt_analysis_report(self, request):
        email = request.data.get('email')
        occurrences = request.data.get('occurrences')
        name = request.data.get('name')
        address = request.data.get('address')
        url = request.data.get('url')
        phone = request.data.get('phone')
        rating = request.data.get('rating')
        reviews = request.data.get('reviews')
        plus_code = request.data.get('plus_code')
        website = request.data.get('website', None)
        latitude = request.data.get('latitude')
        longitude = request.data.get('longitude')

        occurrences = int(occurrences) if occurrences is not None else 0

        data = {
            "email": email,
            "occurrences": occurrences,
            "name": name,
            "address": address,
            "url": url,
            "phone": phone,
            "rating": rating,
            "reviews": reviews,
            "plus_code": plus_code,
            "website": website,
            "latitude": latitude,
            "longitude": longitude
        }

        print("✅ Data received:", data)

        serializer = AnalysisSerializer(data=data)
        if not serializer.is_valid():
            print("❌ Serializer Errors:", serializer.errors)
            return Response({
                "success": False,
                "message": "Posting wrong data to API",
                "error": serializer.errors,
            }, status=status.HTTP_400_BAD_REQUEST)

        # Check Experience Database Service Response
        experience_database_service_response = json.loads(experience_database_services(email, occurrences))
        print("🛑 Experience Database Response:", experience_database_service_response)

        if not experience_database_service_response.get("success"):
            return Response({
                "success": False,
                "message": experience_database_service_response.get("message", "Failed to save experience")
            }, status=status.HTTP_400_BAD_REQUEST)

        occurrences += 1

        try:
            swot_text = new_gemini(
                API_KEY,
                f"in depth SWOT analysis of {name} {address}"
            )
            
            print("🛑 SWOT Text Response:")
            
            if not swot_text:
                return Response({
                    "success": False,
                    "message": "Failed to retrieve SWOT analysis results"
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            def save_experienced_data():
                try:
                    save_experienced_product_data(
                        "DOWELL BUSINESS ANALYSIS",
                        email,
                        {
                            "email": email,
                            "name": name,
                            "address": address,
                            "url": url,
                            "phone": phone,
                            "rating": rating,
                            "reviews": reviews,
                            "plus_code": plus_code,
                            "website": website,
                            "latitude": latitude,
                            "longitude": longitude,
                            "swot_analysis": swot_text,
                            "timestamp": datetime.datetime.now().isoformat()
                        }
                    )
                    print("✅ Experienced data saved successfully")
                except Exception as e:
                    print("🛑 Error saving experienced data:", e)

            def reduce_experienced_counts():
                try:
                    a= update_user_usage(email, occurrences)
                    print("✅ Experience count updated successfully",a)
                except Exception as e:
                    print("🛑 Error updating experience count:", e)

            print("🚀 Starting background threads")

            experienced_date = Thread(target=save_experienced_data)
            experienced_date.daemon = True
            experienced_date.start()

            experienced_reduce = Thread(target=reduce_experienced_counts)
            experienced_reduce.daemon = True
            experienced_reduce.start()

            return Response({
                "success": True,
                "message": "Data retrieved successfully",
                "response": swot_text
            })
        except Exception as e:
            print("🛑 Exception Occurred:", e)
            return Response({
                "success": False,
                "message": "Failed to retrieve SWOT analysis results",
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    def linkedin_analysis_report(self, request):
        email = request.data.get('email')
        occurrences = request.data.get('occurrences')
        linkedin_link = request.data.get('linkedin_link')

        occurrences = int(occurrences) if occurrences is not None else 0

        data = {
            "email": email,
            "occurrences": occurrences,
            "linkedin_link":linkedin_link
        }

        print("✅ Data received:", data)

        serializer = LinkedinSerializer(data=data)
        if not serializer.is_valid():
            print("❌ Serializer Errors:", serializer.errors)
            return Response({
                "success": False,
                "message": "Posting wrong data to API",
                "error": serializer.errors,
            }, status=status.HTTP_400_BAD_REQUEST)

        # Check Experience Database Service Response
        experience_database_service_response = json.loads(experience_database_services_linkedin(email, occurrences))
        print("🛑 Experience Database Response:", experience_database_service_response)

        if not experience_database_service_response.get("success"):
            return Response({
                "success": False,
                "message": experience_database_service_response.get("message", "Failed to save experience")
            }, status=status.HTTP_400_BAD_REQUEST)

        occurrences += 1


        try:
            linkedin_text = new_gemini(
                API_KEY,
                f"detailed grading of my linkedin profile {linkedin_link}  for Completeness, Professionalism, Keyword Optimization, Impact and Quantifiable Results and Engagement and Networking"
            )
            
            print("🛑 linkedin Text Response:")
            
            if not linkedin_text:
                return Response({
                    "success": False,
                    "message": "Failed to retrieve linkedin analysis results"
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            def save_experienced_data():
                try:
                    save_experienced_product_data(
                        "DOWELL LINKEDIN ANALYSIS",
                        email,
                        {
                            "email": email,
                            "linkedin_analysis": linkedin_text,
                            "timestamp": datetime.datetime.now().isoformat()
                        }
                    )
                    print("✅ Experienced data saved successfully")
                except Exception as e:
                    print("🛑 Error saving experienced data:", e)

            def reduce_experienced_counts():
                try:
                    a= update_user_usage(email, occurrences)
                    print("✅ Experience count updated successfully",a)
                except Exception as e:
                    print("🛑 Error updating experience count:", e)

            print("🚀 Starting background threads")

            experienced_date = Thread(target=save_experienced_data)
            experienced_date.daemon = True
            experienced_date.start()

            experienced_reduce = Thread(target=reduce_experienced_counts)
            experienced_reduce.daemon = True
            experienced_reduce.start()

            return Response({
                "success": True,
                "message": "Data retrieved successfully",
                "response": linkedin_text
            })
        except Exception as e:
            print("🛑 Exception Occurred:", e)
            return Response({
                "success": False,
                "message": "Failed to retrieve SWOT analysis results",
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        
    def handle_error(self, request): 
        return Response({
            "success": False,
            "message": "Invalid request type"
        }, status=status.HTTP_400_BAD_REQUEST)