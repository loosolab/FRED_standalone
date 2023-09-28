from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import pgm_calls
import os

UPLOAD_DIRECTORY = os.path.abspath(os.path.join(os.path.dirname(__file__)))
# Create a Flask application
app = Flask(__name__)
cors = CORS(app)

# Define a test endpoint
@app.route('/test', methods=['GET'])
def test_endpoint():
    # Dummy data
    data = {'message': 'This is a test endpoint', 'status': 'success'}
    return jsonify(data)

@app.route("/getPgmMask")
def getPgmMask():
    return pgm_calls.getEmptyMask()

@app.route("/validatePgm", methods=["POST"])
def validatePgm():
    request_data = request.get_json()
    return pgm_calls.validateMetadataObject(request_data)

@app.route("/getFactors", methods=["POST"])
def getFactors():
    request_data = request.get_json()
    return pgm_calls.getFactors(request_data["organism_name"])

@app.route("/searchWhitelist", methods=["POST"])
def searchWhitelist():
    request_data = request.get_json()
    whitelist_data = pgm_calls.getSingleWhitelist(request_data["search_object"])
    searched_data = pgm_calls.searchElements(request_data["search_string"],25, whitelist_data)
    return {"search_results": searched_data}

@app.route("/genConditions", methods=["POST"])
def genConditions():
    request_data = request.get_json()
    return pgm_calls.genConditions(request_data)

@app.route("/validatePgmWithSummary", methods=["POST"])
def validatePgmWithSummary():
    request_data = request.get_json()
    return pgm_calls.validateMetadataObjectWithSummary(request_data)

@app.route("/createFilelist", methods=["POST"])
def createFilelist():
    request_data = request.get_json()
    return pgm_calls.createFilelist(request_data)

@app.route("/finishPgm", methods=["POST"])
def finishPgm():
    request_data = request.get_json()
    return pgm_calls.finishResult(UPLOAD_DIRECTORY, request_data)

@app.route("/getPgmFiles", methods=["GET"])
def getPgmFiles():
    filename = request.args.get("filename")
    private_directory = os.path.join(UPLOAD_DIRECTORY)
    path_to_file =  os.path.join(private_directory,"tmp", filename)
    try:
        return send_file(path_to_file, as_attachment=True)
    except:
        return "File not Found", 404

if __name__ == '__main__':
    # Run the Flask application on port 5000 (default)
    app.run(debug=True)
