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

fred_config_path = os.path.join(os.path.dirname(__file__), "config", "fred_config.yaml")
m_object = wi_functions.Webinterface(fred_config_path)
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
    timestamp_folder = datetime.now().strftime("%H_%M_%S-%d_%m_%Y")
    timestamp_to_save = datetime.now().strftime("%d_%m_%Y")

    project_id, metadata_object = wi_functions.parse_object(
        g_pgm_object, data["object"], g_whitelist_object, return_id=True
    )
    print("Metadata Object:", metadata_object)
    save_path = "saved_metadata/" + project_id + "_" + timestamp_folder + "/"
    os.makedirs(save_path, exist_ok=True)
    filename_metadata, project_id = wi_functions.save_object(
        metadata_object, save_path, timestamp_to_save, False
    )
    print("Saved metadata file:", filename_metadata)
    filenames.append(save_path + filename_metadata.split("/")[-1])

    # Check Wetlab Writer Funcs

    all_exp_settings = sum(
        list(wetlab_writer.find_keys(metadata_object, "experimental_setting")), []
    )
    exp_setting_list = wetlab_writer.format_exp_settings(all_exp_settings)
    exp_setting_list_new = wetlab_writer.rename_exp_list(exp_setting_list)
    file_name_to_save_wetlab = project_id + "_" + timestamp_to_save
    filename_wetlab = wetlab_writer.write_wetlab(
        exp_setting_list_new, save_path, file_name_to_save_wetlab
    )
    filenames.append(save_path + filename_wetlab.split("/")[-1])
    # move_process = threading.Thread(
    #     target=moveMetadata,
    #     args=(
    #         save_path,
    #         filenames,
    #     ),
    # )
    # move_process.start()

    plot_img_ls = wi_functions.download_plot(g_pgm_object, metadata_object, save_path)
    print("plot image return", plot_img_ls)
    for plot_img in plot_img_ls:
        filenames.append(save_path + plot_img)
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
    plot_result = wi_functions.get_plot(
        g_pgm_object, fred_config_path, "./", project_id
    )
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


def loadFredConfig():
    with open(fred_config_path, "r") as file:
        config_data = yaml.safe_load(file)
    return config_data


def updateFredConfig(data):
    print(data)
    fred_config = data["config"]
    restore = data.get("restore", False)
    if restore:
        fred_default_config_path = os.path.join(
            os.path.dirname(__file__), "config", "default_config.yaml"
        )
        with open(fred_default_config_path, "r") as file:
            fred_config = yaml.safe_load(file)
    print(fred_config)
    with open(fred_config_path, "w") as file:
        yaml.dump(fred_config, file, sort_keys=False)
    global g_pgm_object, g_whitelist_object
    g_pgm_object = getPgmObject(fred_config_path)
    g_whitelist_object = getWhitelistObject(g_pgm_object)
    return
