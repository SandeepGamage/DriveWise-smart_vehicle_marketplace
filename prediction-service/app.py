import os
import joblib
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app) # Allows your Express/React architecture to communicate securely

# Dynamically resolve file pathways
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'src', 'models', 'car_price_pipeline.pkl')

# Load the trained ML pipeline weights
pipeline = joblib.load(MODEL_PATH)

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        
        data = request.get_json()
      
        input_data = pd.DataFrame([{
            'make': data.get('make'),
            'model': data.get('model'),
            'mileage_km': int(data.get('mileage_km')),
            'production_year': int(data.get('production_year')),
            'power_hp': int(data.get('power_hp')),
            'transmission': data.get('transmission')
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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
