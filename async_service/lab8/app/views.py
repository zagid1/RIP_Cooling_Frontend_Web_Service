from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import time
import requests
import json
from concurrent import futures

# Адрес твоего Go-сервиса
GO_SERVICE_URL = "http://localhost:8080/api/internal/cooling/updating"
AUTH_TOKEN = "secret12" 

# Пул потоков для асинхронного выполнения
executor = futures.ThreadPoolExecutor(max_workers=1)

def calculate_logic(data):
    """
    Асинхронный расчет мощности охлаждения по формуле: Q = P * 1.3 * (1 + 15/V)
    Принимает уже посчитанный total_tdp.
    """
    print(f"Start processing Order ID: {data.get('id')}")
    
    # Симуляция долгого вычисления
    time.sleep(9)

    try:
        # 1. Получаем параметры помещения
        room_area = float(data.get('room_area', 0))
        room_height = float(data.get('room_height', 0))
        
        # 2. Получаем СУММАРНЫЙ TDP (рассчитанный на Go)
        total_tdp = float(data.get('total_tdp', 0))

        # --- РАСЧЕТ ПО ФОРМУЛЕ ---

        # Шаг 1: P = TDP / 1000 [кВт]
        P = total_tdp / 1000.0 

        # Шаг 2: V = S × h [м³]
        V = room_area * room_height

        # Шаг 3: Q = P × 1.3 × (1 + 15/V) [кВт]
        if V > 0:
            Q = P * 1.3 * (1 + 15.0 / V)
        else:
            Q = P * 1.3

        # Округление до 2 знаков
        Q = round(Q, 2)

        print(f"Calculated: P={P}kW, V={V}m3 -> Q={Q}kW")

        # Формируем ответ
        result_payload = {
            "id": data.get('id'),
            "cooling_power": Q
        }
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": AUTH_TOKEN 
        }

        # Отправляем результат обратно на Go-сервер
        print(f"Sending result for Order ID: {data.get('id')} to {GO_SERVICE_URL}")
        resp = requests.put(GO_SERVICE_URL, json=result_payload, headers=headers, timeout=5)
        print(f"Go service response code: {resp.status_code}")

    except Exception as e:
        print(f"Error during calculation or callback: {e}")


@api_view(['POST'])
def perform_calculation(request):
    """
    Принимает запрос, запускает расчет в фоне и сразу отвечает 200 OK.
    """
    try:
        data = request.data
        if "id" not in data:
             return Response({"error": "No ID provided"}, status=status.HTTP_400_BAD_REQUEST)

        # Запускаем задачу в отдельном потоке (Fire-and-forget)
        executor.submit(calculate_logic, data)

        return Response({"message": "Calculation started"}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)