from flask import Flask, jsonify
from flask_cors import CORS
import pgm_calls

# Create a Flask application
app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
app.config["CORS_METHODS"] = ["GET", "POST"]
app.config["CORS_ORIGINS"] = app.config["CORS_CROSS_ORIGINS"]

# Define a test endpoint
@app.route('/test', methods=['GET'])
def test_endpoint():
    # Dummy data
    data = {'message': 'This is a test endpoint', 'status': 'success'}
    return jsonify(data)

@app.route("/getPgmMask")
def getPgmMask():
    return pgm_calls.getEmptyMask()

if __name__ == '__main__':
    # Run the Flask application on port 5000 (default)
    app.run(debug=True)
