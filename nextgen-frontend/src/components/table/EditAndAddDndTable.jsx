import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { RiDeleteBin6Line } from "react-icons/ri";
import SearchBar from "../common/SearchBar";
import HoverBorderButton from "../buttons/HoverBorderButton";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../common/Loader";
import { FaPlusCircle } from "react-icons/fa";
const LONG_PRESS_DELAY = 300;

const DraggableRow = ({
  item,
  isTemplate,
  onDelete,
  onLongPressDragStart,
  extraHeaders,
  onQuantityChange,
  addItemToTemplate,
  isEmptyUomQty = [],
  toggleSelection,
  isChecked,
}) => {
  const [timeoutId, setTimeoutId] = useState(null);

  const handleMouseDown = () => {
    const menuID = setTimeout(
      () => onLongPressDragStart(item.menuID),
      LONG_PRESS_DELAY
    );
    setTimeoutId(menuID);
  };

  const handleMouseUp = () => clearTimeout(timeoutId);

  useEffect(() => () => clearTimeout(timeoutId), [timeoutId]);

  return (
    <>
      {!isTemplate && (
        <td className="lg:px-4 px-2 lg:py-[2px] w-[20%] lg:text-[16px] text-[12px]">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={() => toggleSelection(item.menuID)}
          />
        </td>
      )}
      <td className="lg:px-4 px-2 lg:py-[2px] w-[20%] lg:text-[16px] text-[12px]">
        {item.menuID}
      </td>
      <td className="lg:px-4 px-2 py-[2px] w-[50%] lg:text-[16px] text-[12px]">
        {item?.description ? item?.description : item.inventoryOrMenuItemName}
      </td>
      {!isTemplate && (
        <td className="text-center lg:px-4 px-2 py-[2px] w-[50%] lg:text-[16px] text-[12px] flex justify-center items-center lg:hidden">
          <span
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              addItemToTemplate(item);
            }}
            className="text-[12px] ml-[20px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer lg:hidden inline-block"
          >
            <FaPlusCircle />
          </span>
        </td>
      )}
      {isTemplate && (
        <>
          <td className="lg:px-4 px-0 py-[2px] lg:w-[20%] w-full">
            <input
              className={`border rounded-full pr-[18px] lg:pl-[10px] pl-[5px] outline-none lg:w-[60%] sm:w-[50%] w-full ${
                isEmptyUomQty.length &&
                isEmptyUomQty.find((prod) => prod.uniqueKey === item.uniqueKey)
                  ? "border-red-500"
                  : ""
              }`}
              value={item.cookItemQuantity || ""}
              onChange={(e) => onQuantityChange(item.uniqueKey, e.target.value)}
              type="text"
            />
          </td>
          <td className="lg:px-4 px-1 py-[2px] w-[10%]">
            <button
              className="text-red-500 hover:text-red-700 !py-[5px]"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.uniqueKey, item.menuID);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              style={{ pointerEvents: "auto" }}
            >
              <RiDeleteBin6Line />
            </button>
          </td>
        </>
      )}
    </>
  );
};

const EditAndAddDndTable = ({
  tableOneName,
  tableTwoName,
  tableOneHeaders,
  tableTwoHeaders,
  initialTableOneData,
  initialTemplateItems,
  droppableIdOne,
  droppableIdTwo,
  onSave,
  onCancel,
  isSaveDisable = false,
  initDataLoading = false,
  initialTemplateLoade = false,
  isPaginationEnabled, // New prop to control pagination
}) => {
  const [items, setItems] = useState([]);
  const [templateItems, setTemplateItems] = useState(
    initialTemplateItems || []
  );
  const [draggingId, setDraggingId] = useState(null);
  const [uniqueIdCounter, setUniqueIdCounter] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [isEmptyUomQty, setIsEmptyUomQty] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
    setItems(initialTableOneData);
    setFilteredItems(initialTableOneData); // Initialize filteredItems
  }, [initialTableOneData]);

  useEffect(() => {
    handleSearch(searchTerm); // Apply search when `searchTerm` or `items` change
  }, [searchTerm, items]);

  useEffect(() => {
    if (initialTemplateItems && initialTemplateItems.length > 0) {
      const initializedTemplateItems = initialTemplateItems.map(
        (item, index) => ({
          ...item,
          uniqueKey: index + 1,
          draggableId: `${item.menuID}-${index + 1}`,
        })
      );
      setTemplateItems(initializedTemplateItems);
      setUniqueIdCounter(initialTemplateItems.length + 1);
    }
  }, [initialTemplateItems]);

  const handleLongPressDragStart = (menuID) => {
    setDraggingId(menuID);
  };

  const handleDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) return;

    if (
      source.droppableId === droppableIdOne &&
      destination.droppableId === droppableIdTwo
    ) {
      const itemsToAdd = selectedRows.length
        ? items.filter((item) => selectedRows.includes(item.menuID))
        : [items[source.index]];

      const alreadyAdded = itemsToAdd.filter((item) =>
        templateItems.some((tItem) => tItem.menuID === item.menuID)
      );

      if (alreadyAdded.length > 0) {
        toast.error(
          `The Item ${alreadyAdded[0].description} has already been added.`,
          {
            autoClose: 1500,
          }
        );
        return;
      }

      setTemplateItems((prev) => [
        ...prev,
        ...itemsToAdd.map((item) => ({
          ...item,
          uniqueKey: Date.now() + Math.random(),
        })),
      ]);

      setSelectedRows([]);
    }
  };
  const addItemToTemplate = (item) => {
    if (
      templateItems.some((existingItem) => existingItem.menuID === item.menuID)
    ) {
      // Trigger the error toast if item already exists
      toast.error(`The Item ${item.description} has already been added.`, {
        autoClose: 1500,
      });
      return;
    }

    setTemplateItems((prev) => [
      ...prev,
      {
        ...item,
        uniqueKey: uniqueIdCounter,
        draggableId: `${item.menuID}-${uniqueIdCounter}`,
      },
    ]);
    setUniqueIdCounter((prev) => prev + 1);
  };

  const handleDelete = (uniqueKey, id) => {
    if (uniqueKey) {
      setTemplateItems((prev) =>
        prev.filter((item) => item.uniqueKey !== uniqueKey)
      );
    } else {
      setTemplateItems((prev) => prev.filter((item) => item.menuID !== id));
    }
  };

  const handleQuantityChange = (uniqueKey, newQuantity) => {
    setTemplateItems((prev) =>
      prev.map((item) =>
        item.uniqueKey === uniqueKey
          ? { ...item, cookItemQuantity: newQuantity }
          : item
      )
    );
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    const filtered = items.filter(
      (item) =>
        item.description.toLowerCase().includes(term.toLowerCase()) ||
        item.menuID.toString().toLowerCase().includes(term.toLowerCase())
    );
    setFilteredItems(filtered);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems =
    isPaginationEnabled && filteredItems.length >= 100
      ? filteredItems.slice(
          (currentPage - 1) * itemsPerPage,
          currentPage * itemsPerPage
        )
      : filteredItems;

  const handleChangeItemsPerPage = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleSave = () => {
    toast.info("Saving data...", { autoClose: 1000 });
    if (onSave) {
      let isCookItemQuantityValid = templateItems.filter(
        (item) => item?.cookItemQuantity === undefined
      );
      if (isCookItemQuantityValid && isCookItemQuantityValid.length > 0) {
        setIsEmptyUomQty(isCookItemQuantityValid);
        toast.error("Unit Of Measure must have a value", { autoClose: 1500 });
      } else {
        onSave(templateItems);
      }
    }
  };

  const toggleSelection = (menuID) => {
    setSelectedRows((prevSelected) => {
      if (prevSelected.includes(menuID)) {
        return prevSelected.filter((id) => id !== menuID);
      } else {
        return [...prevSelected, menuID];
      }
    });
  };

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const goToPrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex w-full gap-4 justify-between flex-col lg:flex-row">
        <Droppable droppableId={droppableIdOne}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="lg:w-[40%] w-full pr-[15px] pb-[15px] lg:max-h-[580px] max-h-full"
            >
              <div className="flex items-center space-x-2 lg:mb-4 mb-2 justify-between">
                <h2 className="lg:text-2xl text-[14px] font-bold mb-4">
                  {tableOneName}
                </h2>
                <div className="lg:w-[200px] w-[100px]">
                  <SearchBar onSearch={handleSearch} extraClass="w-full" />
                </div>
              </div>
              <div className="rounded-2xl shadow-[0_0px_35px_-10px_rgba(0,0,0,0.3)] px-[5px] lg:px-[15px] tableHOC pr-1 lg:max-h-full max-h-[320px] overflow-auto">
                <table className="min-w-full  lg:max-h-[433px] max-h-[300px] ">
                  <thead className="sticky top-0 bg-white">
                    <tr className="shadow-[0_-1px_0_var(--tw-primary)_inset]">
                      <th className="px-4 py-2 text-left lg:text-[16px] text-[12px] text-nowrap">
                        Select
                      </th>
                      {tableOneHeaders.map((header, index) => (
                        <th
                          key={index}
                          className="px-4 py-2 text-left lg:text-[16px] text-[12px] text-nowrap"
                        >
                          {header}
                        </th>
                      ))}
                      <th className="px-4 py-2 text-left lg:text-[16px] text-[12px] text-nowrap block lg:hidden">
                        Add to {tableTwoName}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {initDataLoading ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="h-[482px]  max-w-full  relative"
                        >
                          {" "}
                          <Loader loading={true} />
                        </td>
                      </tr>
                    ) : (
                      <>
                        {paginatedItems.map((item, index) => (
                          <Draggable
                            key={item.menuID}
                            draggableId={item.menuID}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <tr
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onMouseDown={() =>
                                  handleLongPressDragStart(item.menuID)
                                }
                                className={
                                  "shadow-[0_-1px_0_rgba(0,0,0,0.2)_inset]"
                                }
                              >
                                <DraggableRow
                                  addItemToTemplate={(item) => {
                                    addItemToTemplate(item);
                                  }}
                                  item={item}
                                  isTemplate={false}
                                  toggleSelection={toggleSelection}
                                  isChecked={selectedRows.includes(item.menuID)}
                                />
                              </tr>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </>
                    )}
                  </tbody>
                </table>
                {isPaginationEnabled && filteredItems.length >= 100 && (
                  <div className="flex items-center justify-between sticky bottom-0 bg-white py-2 shadow-[0px_1px_0px_var(--tw-primary)_inset] ">
                    <div className="flex lg:gap-2 gap-[2px] px-0 ">
                      <button
                        onClick={goToFirstPage}
                        className="py-0 lg:px-3 px-1 rounded-none lg:text-[16px] text-[12px]"
                        disabled={currentPage === 1}
                      >
                        First
                      </button>
                      <button
                        onClick={goToPrevPage}
                        className="py-0 lg:px-3 px-1 rounded-none lg:text-[16px] text-[12px]"
                        disabled={currentPage === 1}
                      >
                        Prev
                      </button>
                      <span className="mt-0 lg:text-[16px] text-[12px]">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        className="py-0 lg:px-3 px-1 rounded-none lg:text-[16px] text-[12px]"
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </button>
                      <button
                        className="py-0 lg:px-3 px-1 rounded-none lg:text-[16px] text-[12px]"
                        onClick={goToLastPage}
                        disabled={currentPage === totalPages}
                      >
                        Last
                      </button>
                    </div>
                    <select
                      value={itemsPerPage}
                      onChange={handleChangeItemsPerPage}
                      className="border rounded mx-4 lg:text-[16px] text-[12px]"
                    >
                      <option value={20}>20 per page</option>
                      <option value={30}>30 per page</option>
                      <option value={50}>50 per page</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}
        </Droppable>
        <Droppable droppableId={droppableIdTwo}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="lg:w-[55%] w-full rounded-2xl shadow-[0_0px_35px_-10px_rgba(0,0,0,0.3)] px-[15px] tableHOC overflow-auto pr-1 lg:h-[626px] h-[320px] max-w-[799px]"
            >
              <table className="min-w-full table-auto ">
                <thead className=" sticky top-0 bg-white z-10">
                  <th
                    colSpan={tableTwoHeaders.length + 2}
                    className="lg:text-2xl text-[14px] font-bold text-left lg:px-4 px-2 py-2 pt-4 "
                  >
                    {tableTwoName}
                  </th>
                  <tr className="shadow-[0_-1px_0_var(--tw-primary)_inset] ">
                    {tableTwoHeaders.map((header, index) => (
                      <th
                        key={index}
                        className={`lg:px-4 px-2 py-2 lg:text-[16px] text-[12px] text-left text-nowrap ${
                          index == 0 ? "w-[20%]" : "w-[50%]"
                        }`}
                      >
                        {header}
                      </th>
                    ))}
                    <th className="lg:px-4 px-2 py-2 text-left w-[20%] lg:text-[16px] text-[12px] text-nowrap">
                      Qty of UOM
                    </th>
                    <th className="lg:px-4 px-2 py-2 text-left w-[10%] lg:text-[16px] text-[12px] text-nowrap">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {initialTemplateLoade ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="h-[482px]  max-w-full  relative"
                      >
                        {" "}
                        <Loader loading={true} />
                      </td>
                    </tr>
                  ) : (
                    <>
                      {templateItems.length === 0 && (
                        <tr>
                          <td
                            colSpan={tableTwoHeaders.length + 2}
                            className="text-center py-4"
                          >
                            This is where you should drop an item to create a
                            template
                          </td>
                        </tr>
                      )}
                      {templateItems.map((item, index) => (
                        <Draggable
                          key={item.draggableId}
                          draggableId={item.draggableId}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <tr
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`shadow-[0_-1px_0_rgba(0,0,0,0.2)_inset] ${
                                snapshot.isDragging ? "dragging-row" : ""
                              } h-[28px]`}
                            >
                              <DraggableRow
                                item={item}
                                isTemplate={true}
                                onDelete={handleDelete}
                                extraHeaders={tableTwoHeaders}
                                onQuantityChange={handleQuantityChange}
                                isEmptyUomQty={isEmptyUomQty}
                              />
                            </tr>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Droppable>
      </div>
      <div className="flex  w-full justify-end">
        <HoverBorderButton
          isDisable={isSaveDisable}
          extraClass={"my-[0px]"}
          onClick={handleSave}
        >
          Save
        </HoverBorderButton>
        <HoverBorderButton extraClass={"my-[0px]"} onClick={onCancel}>
          Cancel
        </HoverBorderButton>
      </div>
    </DragDropContext>
  );
};

import PropTypes from "prop-types";

// DraggableRow PropTypes
DraggableRow.propTypes = {
  item: PropTypes.shape({
    menuID: PropTypes.string.isRequired,
    description: PropTypes.string,
    inventoryOrMenuItemName: PropTypes.string,
    cookItemQuantity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    uniqueKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  isTemplate: PropTypes.bool,
  onDelete: PropTypes.func,
  onLongPressDragStart: PropTypes.func,
  extraHeaders: PropTypes.arrayOf(PropTypes.string),
  onQuantityChange: PropTypes.func,
  addItemToTemplate: PropTypes.func,
  isEmptyUomQty: PropTypes.arrayOf(
    PropTypes.shape({
      uniqueKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })
  ),
  toggleSelection: PropTypes.func,
  isChecked: PropTypes.bool,
};

// EditAndAddDndTable PropTypes
EditAndAddDndTable.propTypes = {
  tableOneName: PropTypes.string.isRequired,
  tableTwoName: PropTypes.string.isRequired,
  tableOneHeaders: PropTypes.arrayOf(PropTypes.string).isRequired,
  tableTwoHeaders: PropTypes.arrayOf(PropTypes.string).isRequired,
  initialTableOneData: PropTypes.arrayOf(
    PropTypes.shape({
      menuID: PropTypes.string.isRequired,
      description: PropTypes.string,
      inventoryOrMenuItemName: PropTypes.string,
    })
  ).isRequired,
  initialTemplateItems: PropTypes.arrayOf(
    PropTypes.shape({
      menuID: PropTypes.string.isRequired,
      description: PropTypes.string,
      inventoryOrMenuItemName: PropTypes.string,
      uniqueKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      draggableId: PropTypes.string,
      cookItemQuantity: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]),
    })
  ),
  droppableIdOne: PropTypes.string.isRequired,
  droppableIdTwo: PropTypes.string.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isSaveDisable: PropTypes.bool,
  initDataLoading: PropTypes.bool,
  initialTemplateLoade: PropTypes.bool,
  isPaginationEnabled: PropTypes.bool,
};

export default EditAndAddDndTable;
