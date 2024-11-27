import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { RiDeleteBin6Line } from "react-icons/ri";
import SearchBar from "../common/SearchBar";
import HoverBorderButton from "../buttons/HoverBorderButton";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../common/Loader";
const LONG_PRESS_DELAY = 300;

const DraggableRow = ({
  item,
  isTemplate,
  onDelete,
  onLongPressDragStart,
  extraHeaders,
  onQuantityChange,
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
      <td className="px-4 py-[2px] w-[20%]">{item.menuID}</td>
      <td className="px-4 py-[2px] w-[50%]">
        {item?.description ? item?.description : item.inventoryOrMenuItemName}
      </td>
      {isTemplate && (
        <>
          <td className="px-4 py-[2px] w-[20%]">
            <input
              className="  border rounded-full pr-[18px] pl-[10px] outline-none w-[60%]"
              value={item.cookItemQuantity || ""}
              onChange={(e) => onQuantityChange(item.uniqueKey, e.target.value)}
              type="text"
            />
          </td>
          <td className="px-4 py-[2px] w-[10%]">
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
  dorpabaleidOne,
  dorpabaleidTwo,
  onSave,
  onCancel,
  isSaveDisable = false,
  initDataLoading = false,
  initialTemplateLoade = false,
  isPaginationEnabled, // New prop to control pagination
}) => {
  const [items, setItems] = useState([]);
  const [templateItems, setTemplateItems] = useState(
    initialTemplateItems && initialTemplateItems.length > 0
      ? initialTemplateItems
      : []
  );
  const [draggingId, setDraggingId] = useState(null);
  const [uniqueIdCounter, setUniqueIdCounter] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

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
    setDraggingId(null);
    const { source, destination } = result;
    if (!destination) return;
    if (
      source.droppableId === dorpabaleidTwo &&
      destination.droppableId === dorpabaleidTwo
    ) {
      const updatedTemplateItems = Array.from(templateItems);
      const [movedItem] = updatedTemplateItems.splice(source.index, 1);
      updatedTemplateItems.splice(destination.index, 0, movedItem);
      setTemplateItems(updatedTemplateItems);
      return;
    }

    if (
      source.droppableId === dorpabaleidOne &&
      destination.droppableId === dorpabaleidTwo
    ) {
      const itemToAdd = items.find((item) => item.menuID === draggingId);

      if (
        itemToAdd &&
        templateItems.some((item) => item.menuID === itemToAdd.menuID)
      ) {
        // Trigger the error toast if item already exists

        toast.error("Item already exists in the right table", {
          autoClose: 1500,
        });
        return;
      }

      if (
        itemToAdd &&
        !templateItems.some((item) => item.menuID === itemToAdd.menuID)
      ) {
        setTemplateItems((prev) => [
          ...prev,
          {
            ...itemToAdd,
            uniqueKey: uniqueIdCounter,
            draggableId: `${itemToAdd.menuID}-${uniqueIdCounter}`,
          },
        ]);
        setUniqueIdCounter((prev) => prev + 1);
      }
    }
  };

  const handleDelete = (uniqueKey, id) => {
    console.log(uniqueKey, "uniqueKey");
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
    const filtered = items.filter((item) =>
      item.description.toLowerCase().includes(term.toLowerCase())
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
      let isvulnerab = templateItems.find(
        (item) => item?.cookItemQuantity === undefined
      );
      if (isvulnerab) {
        toast.error("Qty of UOM is Empty", { autoClose: 1500 });
      } else {
        onSave(templateItems);
      }
    }
  };

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const goToPrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex w-full gap-4 justify-between">
        <Droppable droppableId={dorpabaleidOne}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="w-[40%] pr-[15px] pb-[15px] max-h-[580px]"
            >
              <div className="flex items-center space-x-2 mb-4 justify-between">
                <h2 className="text-2xl font-bold mb-4">{tableOneName}</h2>
                <div className="w-[200px]">
                  <SearchBar onSearch={handleSearch} extraClass="w-full" />
                </div>
              </div>
              <div className="rounded-2xl shadow-[0_0px_35px_-10px_rgba(0,0,0,0.3)] px-[15px] tableHOC pr-1 max-h-full overflow-auto">
                <table className="min-w-full  max-h-[433px] ">
                  <thead className="sticky top-0 bg-white">
                    <tr className="shadow-[0_-1px_0_var(--tw-primary)_inset]">
                      {tableOneHeaders.map((header, index) => (
                        <th key={index} className="px-4 py-2 text-left">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {initDataLoading ? (
                      <tr>
                        <td
                          colSpan={2}
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
                                <DraggableRow item={item} isTemplate={false} />
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
                    <div className="flex gap-2 px-0 ">
                      <button
                        onClick={goToFirstPage}
                        className="py-0 px-3 rounded-none"
                        disabled={currentPage === 1}
                      >
                        First
                      </button>
                      <button
                        onClick={goToPrevPage}
                        className="py-0 px-3 rounded-none"
                        disabled={currentPage === 1}
                      >
                        Prev
                      </button>
                      <span className="mt-0">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        className="py-0 px-3 rounded-none"
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </button>
                      <button
                        className="py-0 px-3 rounded-none"
                        onClick={goToLastPage}
                        disabled={currentPage === totalPages}
                      >
                        Last
                      </button>
                    </div>
                    <select
                      value={itemsPerPage}
                      onChange={handleChangeItemsPerPage}
                      className="border rounded mx-4"
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
        <Droppable droppableId={dorpabaleidTwo}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="w-[55%] rounded-2xl shadow-[0_0px_35px_-10px_rgba(0,0,0,0.3)] px-[15px] tableHOC overflow-auto pr-1 h-[626px] max-w-[799px]"
            >
              <table className="min-w-full table-auto ">
                <thead className=" sticky top-0 bg-white z-10">
                  <th
                    colSpan={tableTwoHeaders.length + 2}
                    className="text-2xl font-bold text-left px-4 py-2 pt-4 "
                  >
                    {tableTwoName}
                  </th>
                  <tr className="shadow-[0_-1px_0_var(--tw-primary)_inset] ">
                    {tableTwoHeaders.map((header, index) => (
                      <th
                        key={index}
                        className={`px-4 py-2 text-left ${
                          index == 0 ? "w-[20%]" : "w-[50%]"
                        }`}
                      >
                        {header}
                      </th>
                    ))}
                    <th className="px-4 py-2 text-left w-[20%]">Qty of UOM</th>
                    <th className="px-4 py-2 text-left w-[10%]">Action</th>
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
          isSaveDisable={isSaveDisable}
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

export default EditAndAddDndTable;
