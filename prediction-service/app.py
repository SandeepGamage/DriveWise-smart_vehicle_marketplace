import os
import json
import joblib
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app) 


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'src', 'models', 'car_price_pipeline.pkl')
MAP_PATH = os.path.join(BASE_DIR, 'src', 'models', 'brand_model_map.json')

# Load the trained ML pipeline weights
pipeline = joblib.load(MODEL_PATH)


brand_model_map = {}
if os.path.exists(MAP_PATH):
    try:
        with open(MAP_PATH, 'r', encoding='utf-8') as f:
            brand_model_map = json.load(f)
    except Exception as e:
        print(f"Error loading brand_model_map.json: {e}")

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        
        make_input = data.get('make')
        model_input = data.get('model')
        
   
        matched_make = 'Volkswagen'
        matched_model = 'Golf'
        
        if make_input:
            make_lower = str(make_input).strip().lower()
            for known_make in brand_model_map.keys():
                if known_make.lower() == make_lower:
                    matched_make = known_make
                    if model_input:
                        model_lower = str(model_input).strip().lower()
                        known_models = brand_model_map[known_make]
                        for known_model in known_models:
                            if known_model.lower() == model_lower:
                                matched_model = known_model
                                break
                        else:
                            matched_model = known_models[0] if known_models else 'Golf'
                    else:
                        known_models = brand_model_map[known_make]
                        matched_model = known_models[0] if known_models else 'Golf'
                    break

        try:
            mileage = int(float(data.get('mileage_km', 0) or 0))
        except (ValueError, TypeError):
            mileage = 0

        try:
            prod_year = int(float(data.get('production_year', 0) or 0))
            if prod_year <= 0:
                prod_year = 2018
        except (ValueError, TypeError):
            prod_year = 2018

        try:
            power = int(float(data.get('power_hp', 0) or 0))
            if power <= 0:
                power = 150
        except (ValueError, TypeError):
            power = 150
      
        input_data = pd.DataFrame([{
            'make': matched_make,
            'model': matched_model,
            'mileage_km': mileage,
            'production_year': prod_year,
            'power_hp': power,
            'transmission': data.get('transmission') or 'Manual'
        }])
        
        # Execute the pipeline calculation array
        prediction = pipeline.predict(input_data)[0]
        
        # Return valuation response back across the bridge
        return jsonify({
            'success': True,
            'predicted_price(euro)': round(float(prediction), 2)
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/', methods=['GET'])
def index():
    return jsonify({
        'status': 'healthy',
        'service': 'DriveWise Price Prediction Service',
        'endpoints': {
            'predict': '/api/predict (POST)'
        }
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
