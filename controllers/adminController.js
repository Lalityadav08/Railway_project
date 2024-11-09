const adminModel = require('../models/adminModel');


exports.fetchUser = (req, res) => {
    adminModel.fetchUser()
        .then(data => {
            res.render('adminUserUpdate', { data, req });
        })
        .catch(error => {
            console.error('Error fetching Station Names:', error);
            res.status(500).json({ error: 'An error occurred while fetching Station Names.' });
        });
};

exports.updateUser = (req, res) => {
    const { ID, username, email, password, preferences } = req.body;
    console.log(ID);

    adminModel.updateUser(ID, username, email, password, preferences)
        .then(updatedData => {

            res.json({ success: true, data: updatedData });
        })
        .catch(error => {
            console.error('Error updating user data:', error);
            res.status(500).json({ error: 'An error occurred while updating user data.' });
        });
};

exports.deleteUser = (req, res) => {
    const { ID } = req.body;
    adminModel.deleteUser(ID)
        .then((updatedData) => {
            res.json({ success: true, message: 'User deleted successfully.', data: updatedData });
        })
        .catch(error => {
            console.error('Error deleting data:', error);
            res.status(500).json({ error: 'An error occurred while deleting data.' });
        });
};

exports.dataUpdate = (req, res) => {
    adminModel.fetchData()
        .then(data => {
            res.render('adminDataUpdate', { data, req });
        })
        .catch(error => {
            console.error('Error fetching Station Names:', error);
            res.status(500).json({ error: 'An error occurred while fetching Station Names.' });
        });
};

exports.priorityUpdate = (req, res) => {
    adminModel.priorityUpdate()
        .then(data => {
            res.render('adminPriorityPointUpdate', { data, req });
        })
        .catch(error => {
            console.error('Error fetching Station Names:', error);
            res.status(500).json({ error: 'An error occurred while fetching Station Names.' });
        });
};

exports.trackUpdate = (req, res) => {
    adminModel.trackUpdate()
        .then(data => {
            res.render('adminPriorityTrackUpdate', { data, req });
        })
        .catch(error => {
            console.error('Error fetching Station Names:', error);
            res.status(500).json({ error: 'An error occurred while fetching Station Names.' });
        });
};


exports.updateDeficiency = (req, res) => {
    const { newValue, serialNo } = req.body;
    adminModel.updateDeficiency(newValue, serialNo)
        .then(updatedData => {
            res.json({ success: true, data: updatedData });
        })
        .catch(error => {
            console.error('Error updating data:', error);
            res.status(500).json({ error: 'An error occurred while updating data.' });
        });
};

exports.updatePointPriorityDeficiencies = (req, res) => {
    const { id, priority } = req.body;
    adminModel.updatePointPriorityDeficiencies(id,priority )
        .then(updatedData => {
            res.json({ success: true, data: updatedData });
        })
        .catch(error => {
            console.error('Error updating data:', error);
            res.status(500).json({ error: 'An error occurred while updating data.' });
        });
};

exports.updateTrackPriorityDeficiencies = (req, res) => {
    const { id, priority } = req.body;
    adminModel.updateTrackPriorityDeficiencies(id,priority )
        .then(updatedData => {
            res.json({ success: true, data: updatedData });
        })
        .catch(error => {
            console.error('Error updating data:', error);
            res.status(500).json({ error: 'An error occurred while updating data.' });
        });
};

exports.addNewPriorityPointDeficiency = (req, res) => {
    const { deficiency, serialNo } = req.body;
    adminModel.addNewPriorityPointDeficiency(deficiency, serialNo)
        .then(updatedData => {
            res.json({ success: true, data: updatedData });
        })
        .catch(error => {
            console.error('Error updating data:', error);
            res.status(500).json({ error: 'An error occurred while updating data.' });
        });
};



exports.deficiencyTrack = (req, res) => {
    adminModel.deficiencyTrack()
        .then(data => {
            res.render('adminDeficiencyTrackUpdate', { data, req });
        })
        .catch(error => {
            console.error('Error fetching Station Names:', error);
            res.status(500).json({ error: 'An error occurred while fetching Station Names.' });
        });
};

exports.updateDeficiencyTrack = (req, res) => {
    const { newValue, serialNo } = req.body;
    adminModel.updateDeficiencyTrack(newValue, serialNo)
        .then(updatedData => {
            res.json({ success: true, data: updatedData });
        })
        .catch(error => {
            console.error('Error updating data:', error);
            res.status(500).json({ error: 'An error occurred while updating data.' });
        });
};

exports.addNewPriorityTrackDeficiency = (req, res) => {
    const { deficiency, serialNo } = req.body;
    adminModel.addNewPriorityTrackDeficiency(deficiency, serialNo)
        .then(updatedData => {
            res.json({ success: true, data: updatedData });
        })
        .catch(error => {
            console.error('Error updating data:', error);
            res.status(500).json({ error: 'An error occurred while updating data.' });
        });
};

exports.deleteDeficiency = (req, res) => {
    const { serialNo } = req.body;
    adminModel.deleteDeficiency(serialNo)
        .then((updatedData) => {
            res.json({ success: true, message: 'Deficiency deleted successfully.', data: updatedData });
        })
        .catch(error => {
            console.error('Error deleting data:', error);
            res.status(500).json({ error: 'An error occurred while deleting data.' });
        });
};

exports.deleteDeficiencyTrack = (req, res) => {
    const { serialNo } = req.body;
    adminModel.deleteDeficiencyTrack(serialNo)
        .then((updatedData) => {
            res.json({ success: true, message: 'Deficiency deleted successfully.', data: updatedData });
        })
        .catch(error => {
            console.error('Error deleting data:', error);
            res.status(500).json({ error: 'An error occurred while deleting data.' });
        });
};

exports.fetchZone = (req, res) => {
    adminModel.fetchZone()
        .then(data => {
            res.render('adminZoneUpdate', { data, req });
        })
        .catch(error => {
            console.error('Error fetching Station Names:', error);
            res.status(500).json({ error: 'An error occurred while fetching Station Names.' });
        });
};

exports.updateZone = (req, res) => {
    const { newValue, serialNo, operationType } = req.body;
    adminModel.updateZone(newValue, serialNo, operationType)
        .then(updatedData => {
            res.json({ success: true, data: updatedData });
        })
        .catch(error => {
            console.error('Error updating data:', error);
            res.status(500).json({ error: 'An error occurred while updating data.' });
        });
};

exports.deleteZone = (req, res) => {
    const { serialNo } = req.body;
    adminModel.deleteZone(serialNo)
        .then((updatedData) => {
            res.json({ success: true, message: 'Zone deleted successfully.', data: updatedData });
        })
        .catch(error => {
            console.error('Error deleting data:', error);
            res.status(500).json({ error: 'An error occurred while deleting data.' });
        });
};

exports.fetchGearType = (req, res) => {
    adminModel.fetchGearType()
        .then(data => {
            res.render('adminGearTypeUpdate', { data, req });
        })
        .catch(error => {
            console.error('Error fetching Station Names:', error);
            res.status(500).json({ error: 'An error occurred while fetching Station Names.' });
        });
};

exports.updateGearType = (req, res) => {
    const { newValue, serialNo } = req.body;
    adminModel.updateGearType(newValue, serialNo)
        .then(updatedData => {
            res.json({ success: true, data: updatedData });
        })
        .catch(error => {
            console.error('Error updating data:', error);
            res.status(500).json({ error: 'An error occurred while updating data.' });
        });
};

exports.deleteGearType = (req, res) => {
    const { serialNo } = req.body;
    adminModel.deleteGearType(serialNo)
        .then((updatedData) => {
            res.json({ success: true, message: 'GearType deleted successfully.', data: updatedData });
        })
        .catch(error => {
            console.error('Error deleting data:', error);
            res.status(500).json({ error: 'An error occurred while deleting data.' });
        });
};

exports.fetchGearTypePoint = (req, res) => {
    adminModel.fetchGearTypePoint()
        .then(data => {
            res.render('adminGearTypePointUpdate', { data, req });
        })
        .catch(error => {
            console.error('Error fetching Station Names:', error);
            res.status(500).json({ error: 'An error occurred while fetching Station Names.' });
        });
};

exports.updateGearTypePoint = (req, res) => {
    const { newValue, serialNo } = req.body;
    adminModel.updateGearTypePoint(newValue, serialNo)
        .then(updatedData => {
            res.json({ success: true, data: updatedData });
        })
        .catch(error => {
            console.error('Error updating data:', error);
            res.status(500).json({ error: 'An error occurred while updating data.' });
        });
};

exports.deleteGearTypePoint = (req, res) => {
    const { serialNo } = req.body;
    adminModel.deleteGearTypePoint(serialNo)
        .then((updatedData) => {
            res.json({ success: true, message: 'Point deleted successfully.', data: updatedData });
        })
        .catch(error => {
            console.error('Error deleting data:', error);
            res.status(500).json({ error: 'An error occurred while deleting data.' });
        });
};


exports.fetchGearTypeTrackCircuit = (req, res) => {
    adminModel.fetchGearTypeTrackCircuit()
        .then(data => {
            res.render('adminGearTypeTrackCircuitUpdate', { data, req });
        })
        .catch(error => {
            console.error('Error fetching Station Names:', error);
            res.status(500).json({ error: 'An error occurred while fetching Station Names.' });
        });
};

exports.updateGearTypeTrackCircuit = (req, res) => {
    const { newValue, serialNo } = req.body;
    adminModel.updateGearTypeTrackCircuit(newValue, serialNo)
        .then(updatedData => {
            res.json({ success: true, data: updatedData });
        })
        .catch(error => {
            console.error('Error updating data:', error);
            res.status(500).json({ error: 'An error occurred while updating data.' });
        });
};

exports.deleteGearTypeTrackCircuit = (req, res) => {
    const { serialNo } = req.body;
    adminModel.deleteGearTypeTrackCircuit(serialNo)
        .then((updatedData) => {
            res.json({ success: true, message: 'Point deleted successfully.', data: updatedData });
        })
        .catch(error => {
            console.error('Error deleting data:', error);
            res.status(500).json({ error: 'An error occurred while deleting data.' });
        });
};

exports.getStationDetails = (req, res) => {
    const { stnCode } = req.body; 
    adminModel.fetchStationDetailsByCode(stnCode)
        .then(data => {
            res.json(data);
        })
        .catch(error => {
            console.error('Error fetching station details:', error);
            res.status(500).json({ error: 'An error occurred while fetching station details.' });
        });
};

exports.updateStation = (req, res) => {
    const updateData = req.body; // Extract all form data from the request body

    adminModel.updateStationDetails(updateData)
        .then(() => {
            res.json({ message: 'Station details updated successfully!' });
        })
        .catch(error => {
            console.error('Error updating station details:', error);
            res.status(500).json({ error: 'An error occurred while updating station details.' });
        });
};



exports.fetchGear = (req, res) => {
    adminModel.fetchGear()
        .then(data => {
            res.render('adminGearUpdate', { data, req });
        })
        .catch(error => {
            console.error('Error fetching Station Names:', error);
            res.status(500).json({ error: 'An error occurred while fetching Station Names.' });
        });
};

exports.updateGear = (req, res) => {
    const { newStnCode, newGearType, newGearID, newZone, newType, newLine, serialNo } = req.body;
    adminModel.updateGear(newStnCode, newGearType, newGearID, newZone, newType, newLine, serialNo)
        .then(updatedData => {
            res.json({ success: true, data: updatedData });
        })
        .catch(error => {
            console.error('Error updating data:', error);
            res.status(500).json({ error: 'An error occurred while updating data.' });
        });
};


exports.deleteGear = (req, res) => {
    const { serialNo } = req.body;
    adminModel.deleteGear(serialNo)
        .then((updatedData) => {
            res.json({ success: true, message: 'Gear deleted successfully.', data: updatedData });
        })
        .catch(error => {
            console.error('Error deleting data:', error);
            res.status(500).json({ error: 'An error occurred while deleting data.' });
        });
};



