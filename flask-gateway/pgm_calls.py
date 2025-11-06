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

fred_config = os.path.join(os.path.dirname(__file__), "config", "fred_config.yaml")
m_object = wi_functions.Webinterface(fred_config)
g_pgm_object = m_object.to_dict()
g_whitelist_object = wi_functions.get_whitelist_object(g_pgm_object)["whitelists"]


def getEmptyMask():
    full_mask = wi_functions.get_empty_wi_object(g_pgm_object, g_whitelist_object)
    return full_mask


def getFactors(organism_name):
    data = wi_functions.get_factors(g_pgm_object, organism_name, g_whitelist_object)
    return data


def getSingleWhitelist(search_object):
    data = wi_functions.get_single_whitelist(search_object, g_whitelist_object)
    return data


def searchElements(search_string, result_count, data):
    filterd_data = []
    for element in data:
        if len(filterd_data) >= result_count:
            break
        if search_string.lower() in element.lower():
            filterd_data.append(element)

    return filterd_data


def genConditions(data):
    new_data = wi_functions.get_conditions(
        g_pgm_object, data["factor_list"], data["organism_name"], g_whitelist_object
    )
    return new_data


# Add finish to pipe from angular
def validateMetadataObject(data, finish=False):
    print(data)
    if "finish" in data and data["finish"]:
        finish = True
    new_data = wi_functions.validate_object(
        g_pgm_object, data["object"], g_whitelist_object, finish
    )
    return new_data


def validateMetadataObjectWithSummary(data):
    new_data = wi_functions.get_summary(
        g_pgm_object, data["object"], g_whitelist_object
    )
    return new_data


def finishResult(data):
    filenames = []
    file_name_to_save = "anonymous" + "_" + datetime.now().strftime("%d_%m_%Y")
    save_path = "saved_metadata/"

    metadata_object = wi_functions.parse_object(
        g_pgm_object, data["object"], g_whitelist_object
    )
    filename_metadata, project_id = wi_functions.save_object(
        metadata_object, save_path, file_name_to_save, False
    )
    filenames.append(filename_metadata.split("/")[-1])

    # Check Wetlab Writer Funcs

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
    # move_process = threading.Thread(
    #     target=moveMetadata,
    #     args=(
    #         save_path,
    #         filenames,
    #     ),
    # )
    # move_process.start()
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


def getPlot(project_id):
    plot_result = wi_functions.get_plot(g_pgm_object, fred_config, "./", project_id)
    return plot_result


# def getMetadata(data):
#     result = wi_functions.get_meta_info(data["path"], data["id"])
#     return {"data": result}


# def getSearchMask():
#     result = metadata_organizer.get_search_mask()
#     return {"data": result}


# def find_metadata(data):
#     path = "bcu_repository/"
#     search_string = data["search_string"]
#     result = metadata_organizer.find_metadata(path, search_string)
#     return {"data": result}


def createFilelist(data):
    path = os.path.abspath(os.path.join(os.path.dirname(__file__), "tmp"))
    filename = wi_functions.save_filenames(data["file_string"], path)
    return {"filename": filename}


def getPgmObject(conifig_path):
    m_object = wi_functions.Webinterface(conifig_path)
    return m_object.to_dict()


def getWhitelistObject(pgm_object):
    return wi_functions.get_whitelist_object(pgm_object)
