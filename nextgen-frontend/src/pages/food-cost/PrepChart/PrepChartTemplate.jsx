import React, { useState, useEffect, useRef } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getCall, postCall } from "../../../apis/network";
import { FaInfoCircle } from "react-icons/fa";
import { tooltip } from "../../../assets/toolTips/prepChartTemplateToolTips.js";
import { toast } from "react-toastify";
import introSteps from "../../../assets/introJSSteps/prepChartTemplate.js";
import IntroJS from "../../../components/common/IntroJS.jsx";
import {
  UnitModal,
  SearchBar,
  ExportOptions,
  UnitSelector,
  MinimizableContainer,
  Tooltip,
} from "../../../components/index.js";

export default function PrepChartTemplate() {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [filteredInventoryItems, setFilteredInventoryItems] = useState([]);
  const [prepChartTemplate, setPrepChartTemplate] = useState({
		prepChartTemplate: [
			{
				prepGroupKey: 'Loading...',
				inventoryItemList: [],
			},
		],
	});
  const [unitsAndAreasList, setUnitsAndAreasList] = useState(
    JSON.parse(localStorage.getItem("unitsAndAreas"))
  );
  const [selectedUnit, setSelectedUnit] = useState(
    localStorage.getItem("defaultUnitId")
  );
  const [selectedUnitName, setSelectedUnitName] = useState(
    localStorage.getItem("defaultUnitName")
  );
  const [showModal, setShowModal] = useState(false);
  const [isSave, setIsSave] = useState(false);
  const [errors, setErrors] = useState({
		inventory: "",
		prepChart: "",
	});
  const [isInventoryLoading, setIsInventoryLoading] = useState(false);
	const [isPrepChartLoading, setIsPrepChartLoading] = useState(false);
  const [companyID, setCompanyId] = useState(localStorage.getItem("companyId"));
  const [alignmentID, setAlignmentId] = useState(
    localStorage.getItem("alignmentId")
  );
	const [introJS, setIntroJS] = useState({
		steps: introSteps(),
		initialStep: 0,
		stepsEnabled: false,
	});
	const toastId = useRef(null);

  useEffect(() => {
    fetchInventoryList(companyID, selectedUnit);
		fetchPrepChartTemplate(companyID, selectedUnit);
  }, []);

  useEffect(() => {
    setFilteredInventoryItems(inventoryItems);
  }, [inventoryItems]);

	const fetchInventoryList = async (companyID, unitID) => {
		setIsInventoryLoading(true);
		try {
			const getData = {
				url: 'getPrepChartTemplateInventoryList',
				urlParams: {
					companyID: companyID,
					unitID: unitID,
				},
			};

			const result = await getCall(getData);

			if (result.data) {
				setInventoryItems(
					result.data.map((item) => {
						return {
							...item,
							uniqueID: `inventoryItems-${item.inventoryItemID}`,
						};
					})
				);
				setErrors({ ...errors, inventory: '' });
			}
		} catch (error) {
			console.error('Error fetching inventory list: ', error);
			setErrors(prevState => ({ ...prevState, inventory: 'There was an issue loading your inventory list, please try again later.' }));
		}
		setIsInventoryLoading(false);
	};

	const fetchPrepChartTemplate = async (companyID, unitID) => {
		setIsPrepChartLoading(true);
		try {
			const getData = {
				url: 'getPrepChartTemplate',
				urlParams: {
					companyID: companyID,
					unitID: unitID,
					templatetypeID: 0, //Todo: this will change when we add support for template types.
				},
			};

			const result = await getCall(getData);

			if (!result.data.prepChartTemplate.find((group) => group.prepGroupKey === 'Today')) {
				result.data.prepChartTemplate.unshift({
					prepGroupKey: 'Today',
					inventoryItemList: [],
				});
			} else if (!result.data.prepChartTemplate.find((group) => group.prepGroupKey === 'Tomorrow')) {
				result.data.prepChartTemplate.push({
					prepGroupKey: 'Tomorrow',
					inventoryItemList: [],
				});
			} else if (!result.data.prepChartTemplate.find((group) => group.prepGroupKey === 'Next Day')) {
				result.data.prepChartTemplate.push({
					prepGroupKey: 'Next Day',
					inventoryItemList: [],
				});
			}

			result.data.prepChartTemplate.forEach((group) => {
				group.inventoryItemList = group.inventoryItemList.map((item) => {
					return {
						...item,
						uniqueID: `${group.prepGroupKey}-${item.inventoryItemID}`,
					};
				}
				);
				group.uniqueID = group.prepGroupKey;
			});

			setPrepChartTemplate(result.data);
			setErrors({ ...errors, prepChart: '' });
		} catch (error) {
			console.error('Error fetching prep chart template: ', error);
			setErrors(prevState => ({ ...prevState, prepChart: 'There was an issue loading your prep chart template, please try again later.' }));
		}
		setIsPrepChartLoading(false);
	};

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const move = (source, destination, droppableSource, droppableDestination) => {
    const sourceClone = Array.from(source);
    const destClone = Array.from(destination);
    const itemBeingMoved = sourceClone[droppableSource.index];
		console.log(droppableDestination);

    const itemExistsInDestination = destClone.some(
      (item) => item.inventoryItemID === itemBeingMoved.inventoryItemID
    );

    if (itemExistsInDestination) {
      console.log(
        `Item with ID ${itemBeingMoved.inventoryItemID} already exists in the destination.`
      );
			toast.error(`${itemBeingMoved.description} already exists in the destination.`);
      return {
        sourceList: sourceClone,
        destinationList: destClone,
      };
    }

    const copiedItem = {
      ...itemBeingMoved,
      uniqueID: `${Date.now()}-${Math.random()}`,
    };

    destClone.splice(droppableDestination.index, 0, copiedItem);

    return {
      sourceList: sourceClone,
      destinationList: destClone,
    };
  };

  const onDragEnd = (result) => {
    if (
      !result.destination ||
      result.destination.droppableId == "inventoryItems"
    )
      return;

    const sourceId = result.source.droppableId;
    const destinationId = result.destination.droppableId;

    const sourceIsInventory = sourceId === "inventoryItems";
    const sourceList = sourceIsInventory
      ? inventoryItems
      : prepChartTemplate.prepChartTemplate.find(
          (item) => item.uniqueID === sourceId
        ).inventoryItemList;
    const destinationList = prepChartTemplate.prepChartTemplate.find(
      (item) => item.uniqueID === destinationId
    ).inventoryItemList;

    if (sourceList === destinationList) {
      const items = reorder(
        sourceList,
        result.source.index,
        result.destination.index
      );

      const newPrepChartTemplate = { ...prepChartTemplate };
      const updatedGroup = newPrepChartTemplate.prepChartTemplate.find(
        (item) => item.uniqueID === sourceId
      );
      updatedGroup.inventoryItemList = items;
      setPrepChartTemplate(newPrepChartTemplate);
    } else {
      const moveResult = move(
        sourceList,
        destinationList,
        result.source,
        result.destination
      );

      const newPrepChartTemplate = { ...prepChartTemplate };
      const destinationGroup = newPrepChartTemplate.prepChartTemplate.find(
        (item) => item.uniqueID === destinationId
      );
      destinationGroup.inventoryItemList = moveResult.destinationList;
      setPrepChartTemplate(newPrepChartTemplate);
    }
  };

  const handleUnitSelection = (unitName, unitID) => {
    setSelectedUnitName(unitName);
    setSelectedUnit(unitID);
    fetchPrepChartTemplate(companyID, unitID);
    setShowModal(false); // Close the date modal after selection
  };

  const handleOkButtonClick = (unitID) => {
    //setSaveUnitId(unitID);
  };

  const handleSave = () => {
    setShowModal(true);
    setIsSave(true);
  };
  const handleUnitSaveSelection = (units) => {
    toastId.current = toast.info('Saving data...', { autoClose: false });
    submitPrepChartTemplate(units);
  };

	const submitPrepChartTemplate = async (units) => {
		const templateToSubmit = prepChartTemplate.prepChartTemplate.map((group) => {
			return {
				prepGroupKey: group.prepGroupKey,
				inventoryItemList: group.inventoryItemList.map((item) => {
					return {
						inventoryItemID: item.inventoryItemID,
						description: item.description,
					};
				}),
			};
		});

		const json = {
			CompanyID: companyID,
			UnitIDList: units.map((unit) => unit.id),
			PrepChartTemplateID: prepChartTemplate.prepChartTemplateID,
			templatetypeID: 0, //Todo: this will change when we add support for template types.
			PrepChartTemplate: templateToSubmit,
		};

		try {
			const postData = {
				url: 'savePrepChartTemplate',
				urlParams: {
					companyID: companyID,
				},
				bodyData: json,
			};

			await postCall(postData);
			toast.success('Template Saved Successfully');
			toast.update(toastId.current, { autoClose: 500 });
		} catch (error) {
			toast.error('Failed to save template');
			toast.update(toastId.current, { autoClose: 500 });
		}
	};

  const handleUnitSelectorClick = () => {
    setShowModal(true);
    setIsSave(false);
  };

  const SearchItem = (keyword) => {
    const filtered = inventoryItems.filter(
      (item) =>
        (item.description &&
          item.description.toLowerCase().includes(keyword.toLowerCase())) ||
        (item.inventoryItemID &&
          item.inventoryItemID
            .toString()
            .toLowerCase()
            .includes(keyword.toLowerCase()))
    );
    setFilteredInventoryItems(filtered);
  };

  return (
    <div className=" pageContainer w-10/12 mx-auto">
			<IntroJS
				introJS={introJS}
				setIntroJS={setIntroJS}
			/>
      <div className=" pageTitle text-2xl leading-tight my-4 text-left">
        Prep Chart Template
      </div>
      <div className=" optionsBar flex justify-between mb-10 rounded-2xl p-4 shadow-[0px_3px_20px_-10px_rgba(0,_0,_0,_0.5)]">
        <ToastContainer />
        <div className="flex mx-auto">
          <UnitSelector
            onClick={handleUnitSelectorClick}
            companyID={companyID}
            alignmentID={alignmentID}
            memberName={selectedUnitName}
            setMemberName={setSelectedUnitName}
            memberID={selectedUnit}
          />
          <UnitModal
            unitData={unitsAndAreasList}
            memberID={selectedUnit}
            memberName={selectedUnitName}
            show={showModal}
            handleClose={() => setShowModal(false)}
            handleUnitSelection={handleUnitSelection}
            handleSaveButtonClick={!isSave ? handleOkButtonClick : () => {}}
            handleUnitSaveSelection={handleUnitSaveSelection}
            isSaveUnit={isSave}
            isMultiUnit={isSave}
            includeAreas={isSave}
          />
        </div>
        <div className="flex justify-end mx-auto w-full">
          <ExportOptions
            includeSave={true}
            handleSaveClick={handleSave}
            includeHelp={true}
						handleHelpClick={() => {setIntroJS({ ...introJS, stepsEnabled: true })}}
            className="export-options"
          />
        </div>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className=" reportContainer w-full flex gap-10">
          <div className=" inventoryItemsSection w-7/12 sticky top-0 h-[90vh]">
            <div className="flex justify-between items-center">
              <div className=" text-2xl my-6">Inventory Items</div>
              <SearchBar
                list={inventoryItems.rows}
                onSearch={(keyword) => SearchItem(keyword)}
              />
            </div>
            <div className=" inventoryItemsTable rounded-2xl px-4 pb-4 shadow-[0px_3px_20px_-10px_rgba(0,_0,_0,_0.5)] max-h-[90vh] overflow-auto relative">
              <div className="grid grid-cols-4 border-b-2 border-primary p-1 pt-4 font-semibold sticky top-0 bg-white">
                <div className=" col-span-1 ">Inventory ID</div>
                <div className=" col-span-3 ">Description</div>
              </div>
							{isInventoryLoading ? (
								<div className="w-full h-96 flex justify-center items-center">
									Loading...
								</div>
							) : (
								filteredInventoryItems && filteredInventoryItems.length > 0 && errors.inventory == '' ? (
									<Droppable droppableId="inventoryItems">
										{(provided) => (
											<div {...provided.droppableProps} ref={provided.innerRef}>
												{filteredInventoryItems.map((item, index) => (
													<Draggable
														key={item.uniqueID}
														draggableId={item.uniqueID}
														index={index}
													>
														{(provided, snapshot) => (
															<div
																{...provided.draggableProps}
																{...provided.dragHandleProps}
																ref={provided.innerRef}
																className={`grid grid-cols-4 p-1 border-b border-x-slate-100 ${
																	snapshot.isDragging ? "opacity-50" : ""
																}`}
															>
																<div className=" col-span-1 ">
																	{item.inventoryItemID}
																</div>
																<div className=" col-span-3 ">
																	{item.description}
																</div>
															</div>
														)}
													</Draggable>
												))}
												{provided.placeholder}
											</div>
										)}
									</Droppable>
								) : (
									<div className="w-full h-96 flex justify-center items-center">
										{errors.inventory}
									</div>
								)
							)}
            </div>
          </div>
          <div className=" prepChartSection w-5/12">
            {prepChartTemplate.prepChartTemplate &&
              prepChartTemplate.prepChartTemplate.map((prepGroup) => (
                <div key={prepGroup.uniqueID}>
                  <MinimizableContainer
                    title={() => {
                      return (
                        <div className={`${prepGroup.prepGroupKey} align-middle`}>
                          <Tooltip content={tooltip.today} direction="top">
                            <FaInfoCircle className="text-secondary m-auto" />{" "}
                            {prepGroup.prepGroupKey}
                          </Tooltip>
                        </div>
                      );
                    }}
                  >
                    <div className=" prepChartTemplateTable mb-10 rounded-2xl p-4 shadow-[0px_3px_20px_-10px_rgba(0,_0,_0,_0.5)]">
                      <div className=" grid grid-cols-4 border-b-2 border-primary p-1 font-semibold">
                        <div className=" col-span-1 ">Inventory ID</div>
                        <div className=" col-span-3">Description</div>
                      </div>
											{isPrepChartLoading ? (
													<div className="w-full h-96 flex justify-center items-center">
														Loading...
													</div>
												) : (
													<Droppable
														key={prepGroup.uniqueID}
														droppableId={prepGroup.uniqueID}
														className="overflow-hidden"
													>
														{(provided, snapshot) => (
															<div
																{...provided.droppableProps}
																ref={provided.innerRef}
																className={`box-border w-full max-w-full overflow-hidden ${
																	snapshot.isDraggingOver ? "" : ""
																}`}
															>
																{prepGroup.inventoryItemList.map((item, index) => (
																	<Draggable
																		key={item.uniqueID}
																		draggableId={item.uniqueID}
																		index={index}
																	>
																		{(provided) => (
																			<div
																				{...provided.draggableProps}
																				{...provided.dragHandleProps}
																				ref={provided.innerRef}
																				className=" grid grid-cols-4 p-1 border-b border-x-slate-100"
																			>
																				<div className=" col-span-1 ">
																					{item.inventoryItemID}
																				</div>
																				<div className=" col-span-3 ">
																					{item.description}
																				</div>
																			</div>
																		)}
																	</Draggable>
																))}
																{provided.placeholder && (
																	<div className="w-full h-6 p-1 transition-all">
																		{!snapshot.isDraggingOver && "Drop here"}
																	</div>
																)}
															</div>
														)}
													</Droppable>
												)}
                    </div>
                  </MinimizableContainer>
                </div>
              ))}
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}
