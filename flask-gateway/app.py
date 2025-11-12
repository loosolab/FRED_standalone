from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import pgm_calls
import os

UPLOAD_DIRECTORY = os.path.abspath(os.path.join(os.path.dirname(__file__)))
# Create a Flask application
app = Flask(__name__)
cors = CORS(app)


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
    searched_data = pgm_calls.searchElements(
        request_data["search_string"], 25, whitelist_data
    )
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
    return pgm_calls.finishResult(request_data)


@app.route("/getPgmFiles", methods=["GET"])
def getPgmFiles():
    filename = request.args.get("filename")
    file_type = request.args.get("file_type")
    if file_type == "file_list":
        private_directory = os.path.join(UPLOAD_DIRECTORY, "tmp")
    else:
        private_directory = os.path.join(UPLOAD_DIRECTORY)

    print("Requested file:", filename)
    print("Private directory:", private_directory)
    path_to_file = os.path.join(private_directory, filename)
    try:
        return send_file(path_to_file, as_attachment=True)
    except:
        return "File not Found", 404


@app.route("/loadFredConfig", methods=["GET"])
def loadFredConfig():
    config_data = pgm_calls.loadFredConfig()
    return jsonify(config_data)


@app.route("/updateFredConfig", methods=["POST"])
def updateFredConfig():
    request_data = request.get_json()
    try:
        pgm_calls.updateFredConfig(request_data)
        return {"status": "success"}
    except Exception as e:
        return {"status": "error", "message": str(e)}, 500


if __name__ == "__main__":
    # Run the Flask application on port 5000 (default)
    app.run(host="0.0.0.0", port=5000, debug=True)
