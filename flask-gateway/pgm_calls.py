from hashlib import new
from operator import ne
import os
import yaml
import json
import sys
from datetime import datetime
import time
import threading

# sys.path.append("metadata-organizer/src")
import importlib.util as ilu
import wetlab_writer
import fred
import fred.src.wi_functions as wi_functions

# import wi_functions
# spec = ilu.spec_from_file_location(
#     "wi_functions",
#     os.path.join(
#         os.path.dirname(__file__), "metadata-organizer", "src", "wi_functions.py"
#     ),
# )
# metadata_organizer = ilu.module_from_spec(spec)
# spec.loader.exec_module(metadata_organizer)

fred_config = os.path.join(os.path.dirname(__file__), "config", "fred_config.yaml")


def getEmptyMask():
    full_mask = metadata_organizer.get_empty_wi_object()
    return full_mask


def getEditMask(data):
    metadata_mask = metadata_organizer.edit_wi_object(data["path"], data["id"])
    return metadata_mask


def getFactors(organism_name):
    data = metadata_organizer.get_factors(organism_name)
    return data


def getSingleWhitelist(search_object):
    start_time = time.time()
    data = metadata_organizer.get_single_whitelist(search_object)
    end_time = time.time()
    execution_time = end_time - start_time
    execution_time_str = "Execution time: {:.2f} seconds".format(execution_time)
    with open("getWhitelists.txt", "w") as f:
        f.write(execution_time_str)
    return data


def searchElements(search_string, result_count, data):
    start_time = time.time()
    filterd_data = []
    for element in data:
        if len(filterd_data) >= result_count:
            break
        if search_string.lower() in element.lower():
            filterd_data.append(element)
    end_time = time.time()
    execution_time = end_time - start_time
    execution_time_str = "Execution time: {:.2f} seconds".format(execution_time)
    with open("search.txt", "w") as f:
        f.write(execution_time_str)

    return filterd_data


def genConditions(data):
    new_data = metadata_organizer.get_conditions(
        data["factor_list"], data["organism_name"]
    )
    return new_data


def validateMetadataObject(data):
    print(data)
    new_data = metadata_organizer.validate_object(data["object"])
    return new_data


def validateMetadataObjectWithSummary(data):
    new_data = metadata_organizer.get_summary(data["object"])
    return new_data


def finishResult(path, data):
    filenames = []
    file_name_to_save = "anonymous" + "_" + datetime.now().strftime("%d_%m_%Y")
    save_path = path + "/tmp/"

    metadata_object = metadata_organizer.parse_object(data["object"])
    filename_metadata, project_id = metadata_organizer.save_object(
        metadata_object, save_path, file_name_to_save
    )
    filenames.append(filename_metadata.split("/")[-1])
    # save wetlab.xlsx

    all_exp_settings = sum(
        list(wetlab_writer.find_keys(metadata_object, "experimental_setting")), []
    )
    exp_setting_list = wetlab_writer.format_exp_settings(all_exp_settings)
    exp_setting_list_new = wetlab_writer.rename_exp_list(exp_setting_list)
    file_name_to_save_wetlab = project_id + "_" + file_name_to_save
    filename_wetlab = wetlab_writer.write_wetlab(
        exp_setting_list_new, save_path, file_name_to_save_wetlab
    )
    filenames.append(filename_wetlab.split("/")[-1])
    move_process = threading.Thread(
        target=moveMetadata,
        args=(
            save_path,
            filenames,
        ),
    )
    move_process.start()
    return {"filenames": filenames}


def moveMetadata(save_path, filenames):
    # Wait for 120 seconds before executing
    time.sleep(120)

    # Construct the destination directory
    dest_dir = os.path.join(os.path.dirname(__file__), "saved_metadata")

    # Create the destination directory if it doesn't exist
    os.makedirs(dest_dir, exist_ok=True)

    # Get the current timestamp
    timestamp = time.strftime("%H_%M_%S")

    # Move and rename each file
    for filename in filenames:
        try:
            source_path = os.path.join(save_path, filename)
            dest_path = os.path.join(dest_dir, f"{timestamp}_{filename}")
            os.rename(source_path, dest_path)
        except:
            return
    return


def getMetadata(data):
    result = metadata_organizer.get_meta_info(data["path"], data["id"])
    return {"data": result}


def getSearchMask():
    result = metadata_organizer.get_search_mask()
    return {"data": result}


def find_metadata(data):
    path = "bcu_repository/"
    search_string = data["search_string"]
    result = metadata_organizer.find_metadata(path, search_string)
    return {"data": result}


def createFilelist(data):
    path = os.path.abspath(os.path.join(os.path.dirname(__file__), "tmp"))
    filename = metadata_organizer.save_filenames(data["file_string"], path)
    return {"filename": filename}


def getPgmObject(conifig_path):
    m_object = wi_functions.Webinterface(conifig_path)
    return m_object.to_dict()


print(getPgmObject(fred_config))
