from flask import Flask, jsonify

# Create a Flask application
app = Flask(__name__)

# Define a test endpoint
@app.route('/test', methods=['GET'])
def test_endpoint():
    # Dummy data
    data = {'message': 'This is a test endpoint', 'status': 'success'}
    return jsonify(data)

if __name__ == '__main__':
    # Run the Flask application on port 5000 (default)
    app.run(debug=True)
