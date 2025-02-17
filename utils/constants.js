const roles = {
    ADMIN: 'admin',
    INVENTORY_STAFF: 'inventory_staff',
    CUSTOMER: 'customer',
    LOGISTICS_MANAGER: 'logistics_manager'
};

const itemStatus = {
    INVENTORY: 'inventory',
    DEMO: 'demo',
    DELIVERY: 'delivery',
    MAINTENANCE: 'maintenance'
};

const maintenanceTypes = {
    PREVENTIVE: 'preventive',
    CORRECTIVE: 'corrective',
    CALIBRATION: 'calibration'
};

module.exports = {
    roles,
    itemStatus,
    maintenanceTypes
};
