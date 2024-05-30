class UnitItem {
    constructor(data) {
        this.areas = data.areas.map(area => ({
            areaID: area.areaID,
            areaName: area.areaName,
            unitList: (area.unitList || []).map(unit => ({
                unitID: unit.unitID,
                unitName: unit.unitName
            }))
        }));

        this.units = data.units.map(unit => ({
            unitID: unit.unitID,
            unitName: unit.unitName
        }));
    }
}

export default UnitItem;
