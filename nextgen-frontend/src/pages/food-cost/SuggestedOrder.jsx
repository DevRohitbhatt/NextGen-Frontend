import { useEffect,useState } from "react";
import * as Styled from "./styles/PrepChartStyles.jsx";
import "../../components/UnitSelector.jsx";
import UnitSelector from "../../components/UnitSelector.jsx";
import ExportOptions from "../../components/ExportOptions.jsx";
import UnitModal from "../../components/UnitModal.jsx";
import { UnitsAndAreasAPI } from "../../apis/UnitsAndAreasAPI.jsx";

export default function SuggestedOrder() {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    "There was an error trying to load the Suggested Order, please try again later."
  );

  const [unitsList, setUnitsList] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState();
  const [selectedUnitName, setselectedUnitName] = useState("No Unit Selected");
  const [showModal, setShowModal] = useState(false);
  const [companyID, setCompanyID] = useState();
  const [alignmentID, setAlignmentID] = useState();
  const [IsActive, setIsActive] = useState([]);

  useEffect(() => {
    if (!selectedUnit) {
      let parameters = decodeURIComponent(window.location.search.replace("?data=", ""));
      if (parameters)
        parameters = JSON.parse(parameters);
      parameters ? setCompanyID(parameters.CompanyID) : setCompanyID();
      parameters ? setAlignmentID(parameters.AlignmentId) : setAlignmentID();
      parameters ? setSelectedUnit(parameters.User_DefaultUnitID) : setSelectedUnit();
      parameters ? setIsActive(parameters.UnitID) : setIsActive();
      if (parameters.User_DefaultUnitID) {
        getUnits(parameters.CompanyID, parameters.AlignmentId, parameters.User_GroupOrUnitAccess);
      } else {
        setErrorMessage("No Unit Selected, Please select a unit.");
        setIsError(true);
        setIsLoading(false);
      }
    }
  }, []);

  const getUnits = (companyId, alignmentId, userId) => {
    UnitsAndAreasAPI.getbyid(companyId, alignmentId, userId)
      .then((data) => {
        setUnitsList(data);
      }).catch((error) => {
        console.error("Error getting units: ", error);
      });
  };
      
  const handleUnitSelectorClick = () => {
    setShowModal(true);
  };

  const handleUnitSelection = (unitName, unitID) => {
    setselectedUnitName(unitName);
    setSelectedUnit(unitID);
    setShowModal(false);
  };
  
  return (
    <Styled.PageContainer>
      <Styled.PageTitle>Suggested Order</Styled.PageTitle>
      <Styled.OptionsRow>
        <Styled.DateAndUnitContainer>
          <UnitSelector
            onClick={handleUnitSelectorClick}
            unitName={selectedUnitName}
            setUnitName={setselectedUnitName}
            unitID={selectedUnit}
          />
          <UnitModal
            unitData={unitsList}
            unitID={selectedUnit}
            unitName={selectedUnitName}
            show={showModal}
            handleClose={() => {
              setShowModal(false);
            }}
            handleUnitSelection={handleUnitSelection}
          />
        </Styled.DateAndUnitContainer>

        <ExportOptions includeSave={false} />
      </Styled.OptionsRow>
      {isLoading ? (
        <>
          <Styled.UnloadedMessage>Loading...</Styled.UnloadedMessage>
        </>
      ) : isError ? (
        <Styled.UnloadedMessage>{errorMessage}</Styled.UnloadedMessage>
      ) : (
        null
      )}
    </Styled.PageContainer>
  );
}
